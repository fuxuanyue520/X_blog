import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
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

	const databasePath = path.join(dataDir, "admin.db").replace(/\\/g, "/");
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
			school TEXT NOT NULL,
			award_year INTEGER NOT NULL,
			award_level TEXT NOT NULL,
			description TEXT,
			sort_order INTEGER NOT NULL DEFAULT 0,
			image_name TEXT NOT NULL,
			image_mime_type TEXT NOT NULL,
			image_base64 TEXT NOT NULL,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`);
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
