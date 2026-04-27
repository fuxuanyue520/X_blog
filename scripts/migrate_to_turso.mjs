import { createClient } from "@libsql/client";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadDotEnv() {
	const envPath = path.join(process.cwd(), ".env");
	if (!existsSync(envPath)) {
		return;
	}

	const raw = readFileSync(envPath, "utf8");
	for (const line of raw.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}
		const index = trimmed.indexOf("=");
		if (index <= 0) {
			continue;
		}
		const key = trimmed.slice(0, index).trim();
		const value = trimmed.slice(index + 1).trim();
		if (!key || process.env[key]) {
			continue;
		}
		process.env[key] = value;
	}
}

function requireEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`缺少环境变量：${name}`);
	}
	return value;
}

function getLocalDatabaseFile() {
	return path.join(process.cwd(), "data", "x_blog.db");
}

function quoteIdentifier(value) {
	return `"${String(value).replaceAll('"', '""')}"`;
}

async function listTables(db) {
	const result = await db.execute(
		"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
	);
	return result.rows.map((row) => String(row.name));
}

async function listTableCreateSql(db) {
	const result = await db.execute(
		"SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL",
	);
	return result.rows.map((row) => ({
		name: String(row.name),
		sql: String(row.sql),
	}));
}

async function listIndexCreateSql(db) {
	const result = await db.execute(
		"SELECT name, sql FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL",
	);
	return result.rows.map((row) => String(row.sql));
}

async function readAllRows(db, tableName) {
	const result = await db.execute(
		`SELECT * FROM ${quoteIdentifier(tableName)}`,
	);
	return result.rows.map((row) => row);
}

function buildInsertStatement(tableName, row) {
	const columns = Object.keys(row);
	const placeholders = columns.map(() => "?").join(", ");
	const quotedColumns = columns.map(quoteIdentifier).join(", ");
	const sql = `INSERT OR REPLACE INTO ${quoteIdentifier(tableName)} (${quotedColumns}) VALUES (${placeholders})`;
	const args = columns.map((column) => row[column]);
	return { sql, args };
}

async function countRows(db, tableName) {
	const result = await db.execute(
		`SELECT COUNT(*) AS total FROM ${quoteIdentifier(tableName)}`,
	);
	return Number(result.rows[0]?.total ?? 0);
}

async function executeIgnoringAlreadyExists(db, sql) {
	try {
		await db.execute(sql);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (message.includes("already exists")) {
			return;
		}
		throw error;
	}
}

async function main() {
	loadDotEnv();
	const remoteUrl = requireEnv("LIBSQL_URL");
	const remoteToken = requireEnv("LIBSQL_AUTH_TOKEN");

	const localFile = getLocalDatabaseFile();
	if (!existsSync(localFile)) {
		throw new Error(`本地数据库文件不存在：${localFile}`);
	}

	const source = createClient({ url: `file:${localFile}` });
	const target = createClient({ url: remoteUrl, authToken: remoteToken });

	const createTables = await listTableCreateSql(source);
	const createIndexes = await listIndexCreateSql(source);

	for (const item of createTables) {
		await executeIgnoringAlreadyExists(target, item.sql);
	}
	for (const sql of createIndexes) {
		await executeIgnoringAlreadyExists(target, sql);
	}

	const tables = await listTables(source);
	const deleteOrder = [
		"admin_sessions",
		"admin_users",
		"blog_articles",
		"award_certificates",
	];
	const insertOrder = [
		"admin_users",
		"admin_sessions",
		"blog_articles",
		"award_certificates",
	];
	const selectedDeleteTables = deleteOrder.filter((name) =>
		tables.includes(name),
	);
	const selectedInsertTables = insertOrder.filter((name) =>
		tables.includes(name),
	);

	for (const tableName of selectedDeleteTables) {
		await target.execute(`DELETE FROM ${quoteIdentifier(tableName)}`);
	}

	for (const tableName of selectedInsertTables) {
		const rows = await readAllRows(source, tableName);
		for (const row of rows) {
			const stmt = buildInsertStatement(tableName, row);
			await target.execute(stmt);
		}
		const sourceCount = await countRows(source, tableName);
		const targetCount = await countRows(target, tableName);
		console.log(
			`[migrate] ${tableName}: local=${sourceCount}, turso=${targetCount}`,
		);
	}

	await source.close();
	await target.close();
	console.log("[migrate] done");
}

await main();
