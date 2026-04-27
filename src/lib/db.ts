import { createClient, type Client } from "@libsql/client";
import matter from "gray-matter";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	renameSync,
} from "node:fs";
import path from "node:path";
import { hashPassword } from "@/lib/security";

let dbClient: Client | undefined;
let dbPromise: Promise<Client> | undefined;
const LEGACY_POSTS_DIRECTORY = path.join(
	process.cwd(),
	"src",
	"content",
	"posts",
);

function getLibsqlUrl() {
	return process.env.LIBSQL_URL || import.meta.env.LIBSQL_URL;
}

function getLibsqlAuthToken() {
	return process.env.LIBSQL_AUTH_TOKEN || import.meta.env.LIBSQL_AUTH_TOKEN;
}

function getDatabaseUrl() {
	const remoteUrl = getLibsqlUrl();
	if (remoteUrl) {
		return remoteUrl;
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
			authToken: getLibsqlAuthToken(),
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

function padDatePart(value: number) {
	return String(value).padStart(2, "0");
}

function toLocalDateTimeString(date: Date) {
	return (
		[
			date.getFullYear(),
			padDatePart(date.getMonth() + 1),
			padDatePart(date.getDate()),
		].join("-") +
		`T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`
	);
}

function parseDateTimeValue(value: string) {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const normalized = trimmed.replace(/\.\d{1,3}Z?$/, "").replace(" ", "T");
	const candidates = new Set<string>();

	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
		candidates.add(`${normalized}:00`);
	} else if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
		candidates.add(`${normalized}T00:00:00`);
	} else {
		candidates.add(normalized);
	}

	candidates.add(trimmed.replace(/\s*\([^)]*\)\s*$/, ""));

	for (const candidate of candidates) {
		const parsed = new Date(candidate);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}

	return null;
}

function normalizeLegacyDateTimeValue(value: unknown) {
	const raw = String(value ?? "").trim();
	if (!raw) {
		return "";
	}

	const parsed = parseDateTimeValue(raw);
	return parsed ? toLocalDateTimeString(parsed) : "";
}

function normalizeLegacyTags(value: unknown) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item ?? "").trim()).filter(Boolean);
	}

	return String(value ?? "")
		.split(/[,，\n]/)
		.map((item) => item.trim())
		.filter(Boolean);
}

function normalizeLegacySlugCandidate(value: string) {
	return value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function normalizeLegacyArticleSlug(value: string, fallbackSource = "") {
	const normalized =
		normalizeLegacySlugCandidate(value) ||
		normalizeLegacySlugCandidate(fallbackSource);
	return normalized || `post-${Date.now()}`;
}

function toLegacyBoolean(value: unknown) {
	if (typeof value === "boolean") {
		return value;
	}

	return (
		String(value ?? "")
			.trim()
			.toLowerCase() === "true"
	);
}

async function migrateLegacyMarkdownArticles(db: Client) {
	if (!existsSync(LEGACY_POSTS_DIRECTORY)) {
		return;
	}

	const entries = readdirSync(LEGACY_POSTS_DIRECTORY, { withFileTypes: true })
		.filter((entry) => entry.isFile() && /\.(md|markdown)$/i.test(entry.name))
		.sort((left, right) => left.name.localeCompare(right.name));

	for (const entry of entries) {
		const filePath = path.join(LEGACY_POSTS_DIRECTORY, entry.name);
		const raw = readFileSync(filePath, "utf8");
		const parsed = matter(raw);
		const data = parsed.data as Record<string, unknown>;
		const fallbackSlug = entry.name.replace(/\.(md|markdown)$/i, "");
		const title =
			String(data.title ?? "").trim() || fallbackSlug || "未命名文章";
		const slug = normalizeLegacyArticleSlug(
			String(data.slug ?? fallbackSlug),
			title,
		);
		const category = ["tech", "essay", "project", "other"].includes(
			String(data.category ?? "").trim(),
		)
			? String(data.category).trim()
			: "other";
		const publishedAt =
			normalizeLegacyDateTimeValue(data.publishedAt) ||
			new Date().toISOString().slice(0, 19);
		const articleUpdatedAt =
			normalizeLegacyDateTimeValue(data.updatedAt) || null;
		const tags = JSON.stringify(normalizeLegacyTags(data.tags));
		const coverImage = String(data.coverImage ?? "").trim() || null;
		const body = parsed.content.replace(/^\uFEFF/, "").trim();
		const now = new Date().toISOString();

		await db.execute({
			sql: `
				INSERT OR IGNORE INTO blog_articles (
					slug,
					title,
					description,
					category,
					tags,
					published_at,
					article_updated_at,
					cover_image,
					is_pinned,
					draft,
					body,
					created_at,
					updated_at
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
			args: [
				slug,
				title,
				String(data.description ?? "").trim(),
				category,
				tags,
				publishedAt,
				articleUpdatedAt,
				coverImage,
				toLegacyBoolean(data.isPinned) ? 1 : 0,
				toLegacyBoolean(data.draft) ? 1 : 0,
				body,
				now,
				now,
			],
		});
	}
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
		const competitionName =
			String(row.competition_name ?? "").trim() || fallback.competitionName;
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
		await db.execute(
			"ALTER TABLE award_certificates__new RENAME TO award_certificates",
		);
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
	await db.execute(`
		CREATE TABLE IF NOT EXISTS blog_articles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			slug TEXT NOT NULL UNIQUE,
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			category TEXT NOT NULL,
			tags TEXT NOT NULL DEFAULT '[]',
			published_at TEXT NOT NULL,
			article_updated_at TEXT,
			cover_image TEXT,
			is_pinned INTEGER NOT NULL DEFAULT 0,
			draft INTEGER NOT NULL DEFAULT 0,
			body TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
	await migrateAwardCertificateSchema(db);
	await migrateLegacyMarkdownArticles(db);
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
