import { createClient, type Client } from "@libsql/client";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import { hashPassword } from "@/lib/security";

let dbClient: Client | undefined;
let dbPromise: Promise<Client> | undefined;

function getDatabaseUrl() {
	if (import.meta.env.LIBSQL_URL) {
		return import.meta.env.LIBSQL_URL;
	}

	const dataDir = path.join(process.cwd(), "data");
	mkdirSync(dataDir, { recursive: true });

	const legacyDatabasePath = path.join(dataDir, "admin.db");
	const databasePath = path.join(dataDir, "x_blog.db");

	if (!existsSync(databasePath) && existsSync(legacyDatabasePath)) {
		renameSync(legacyDatabasePath, databasePath);
	}

	return `file:${databasePath}`;
}

function createDatabaseClient() {
	if (!dbClient) {
		dbClient = createClient({
			url: getDatabaseUrl(),
			authToken: import.meta.env.LIBSQL_AUTH_TOKEN,
		});
	}

	return dbClient;
}

function splitLegacyAwardTitle(title: string) {
	const normalizedTitle = title.trim().replace(/\s+/g, " ");

	if (!normalizedTitle) {
		return {
			competitionName: "",
			awardName: "",
		};
	}

	const awardPatterns = [
		/(特等奖学金|一等奖学金|二等奖学金|三等奖学金|优秀毕业生)$/u,
		/(特等奖|一等奖|二等奖|三等奖|金奖|银奖|铜奖|优秀奖|优胜奖|入围奖)$/u,
		/(冠军|亚军|季军)$/u,
		/(第[一二三四五六七八九十百零]+名|第\d+名)$/u,
		/(团体特等奖|团体一等奖|团体二等奖|团体三等奖)$/u,
	];

	for (const pattern of awardPatterns) {
		const match = normalizedTitle.match(pattern);
		if (!match || typeof match.index !== "number" || match.index <= 0) {
			continue;
		}

		return {
			competitionName: normalizedTitle.slice(0, match.index).trim(),
			awardName: match[0].trim(),
		};
	}

	return {
		competitionName: normalizedTitle,
		awardName: "",
	};
}

async function migrateAwardCertificateSchema(db: Client) {
	const tableInfo = await db.execute("PRAGMA table_info('award_certificates')");
	const columns = new Set(tableInfo.rows.map((row) => String(row.name ?? "")));

	if (!columns.has("honor_type")) {
		await db.execute(
			"ALTER TABLE award_certificates ADD COLUMN honor_type TEXT NOT NULL DEFAULT '奖项'",
		);
	}

	if (!columns.has("competition_name")) {
		await db.execute(
			"ALTER TABLE award_certificates ADD COLUMN competition_name TEXT NOT NULL DEFAULT ''",
		);
	}

	if (!columns.has("award_name")) {
		await db.execute(
			"ALTER TABLE award_certificates ADD COLUMN award_name TEXT NOT NULL DEFAULT ''",
		);
	}

	const records = await db.execute(`
		SELECT id, title, honor_type, competition_name, award_name
		FROM award_certificates
		WHERE
			COALESCE(honor_type, '') = ''
			OR COALESCE(competition_name, '') = ''
			OR COALESCE(award_name, '') = ''
	`);

	for (const row of records.rows) {
		const title = String(row.title ?? "");
		const honorType = String(row.honor_type ?? "").trim() || "奖项";
		const fallback = splitLegacyAwardTitle(title);
		const competitionName = String(row.competition_name ?? "").trim() || fallback.competitionName;
		const awardName = String(row.award_name ?? "").trim() || fallback.awardName;

		await db.execute({
			sql: `
				UPDATE award_certificates
				SET honor_type = ?, competition_name = ?, award_name = ?
				WHERE id = ?
			`,
			args: [honorType, competitionName, awardName, Number(row.id)],
		});
	}

	if (columns.has("school")) {
		await db.execute("DROP TABLE IF EXISTS award_certificates__new");
		await db.execute(`
			CREATE TABLE award_certificates__new (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				honor_type TEXT NOT NULL DEFAULT '奖项',
				competition_name TEXT NOT NULL DEFAULT '',
				award_name TEXT NOT NULL DEFAULT '',
				award_year INTEGER NOT NULL,
				award_level TEXT NOT NULL,
				description TEXT,
				image_name TEXT NOT NULL,
				image_mime_type TEXT NOT NULL,
				image_base64 TEXT NOT NULL,
				created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
			)
		`);
		await db.execute(`
			INSERT INTO award_certificates__new (
				id,
				title,
				honor_type,
				competition_name,
				award_name,
				award_year,
				award_level,
				description,
				image_name,
				image_mime_type,
				image_base64,
				created_at,
				updated_at
			)
			SELECT
				id,
				title,
				honor_type,
				competition_name,
				award_name,
				award_year,
				award_level,
				description,
				image_name,
				image_mime_type,
				image_base64,
				created_at,
				updated_at
			FROM award_certificates
		`);
		await db.execute("DROP TABLE award_certificates");
		await db.execute("ALTER TABLE award_certificates__new RENAME TO award_certificates");
	}
}

async function initializeDatabase() {
	const db = createDatabaseClient();

	await db.execute("PRAGMA foreign_keys = ON");
	await db.execute(`
		CREATE TABLE IF NOT EXISTS admin_users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			password_salt TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	await db.execute(`
		CREATE TABLE IF NOT EXISTS admin_sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			token_hash TEXT NOT NULL UNIQUE,
			expires_at TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES admin_users(id) ON DELETE CASCADE
		)
	`);
	await db.execute(`
		CREATE TABLE IF NOT EXISTS award_certificates (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			honor_type TEXT NOT NULL DEFAULT '奖项',
			competition_name TEXT NOT NULL DEFAULT '',
			award_name TEXT NOT NULL DEFAULT '',
			award_year INTEGER NOT NULL,
			award_level TEXT NOT NULL,
			description TEXT,
			image_name TEXT NOT NULL,
			image_mime_type TEXT NOT NULL,
			image_base64 TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	await migrateAwardCertificateSchema(db);
	await db.execute({
		sql: "DELETE FROM admin_sessions WHERE expires_at <= ?",
		args: [new Date().toISOString()],
	});

	const adminUser = await db.execute({
		sql: "SELECT id FROM admin_users WHERE username = ? LIMIT 1",
		args: ["admin"],
	});

	if (adminUser.rows.length === 0) {
		const { hash, salt } = hashPassword("admin123");

		await db.execute({
			sql: `
				INSERT INTO admin_users (username, password_hash, password_salt)
				VALUES (?, ?, ?)
			`,
			args: ["admin", hash, salt],
		});
	}

	return db;
}

export async function getDb() {
	if (!dbPromise) {
		dbPromise = initializeDatabase();
	}

	return dbPromise;
}
