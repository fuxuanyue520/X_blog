import mysql, {
	type Pool,
	type ResultSetHeader,
	type RowDataPacket,
} from "mysql2/promise";
import { hashPassword } from "@/lib/security";

type DbExecuteInput = string | { sql: string; args?: unknown[] };

export interface DbExecuteResult {
	rows: Array<Record<string, unknown>>;
	lastInsertRowid?: number;
}

export interface AppDbClient {
	execute(input: DbExecuteInput): Promise<DbExecuteResult>;
}

class MysqlDbClient implements AppDbClient {
	constructor(private readonly pool: Pool) {}

	async execute(input: DbExecuteInput): Promise<DbExecuteResult> {
		const { sql, args } =
			typeof input === "string" ? { sql: input, args: [] } : input;
		const [result] = await this.pool.execute(sql, args ?? []);

		if (Array.isArray(result)) {
			return {
				rows: (result as RowDataPacket[]).map((row) => ({ ...row })),
			};
		}

		const insertResult = result as ResultSetHeader;
		return {
			rows: [],
			lastInsertRowid:
				typeof insertResult.insertId === "number"
					? insertResult.insertId
					: undefined,
		};
	}
}

let dbClient: AppDbClient | undefined;
let dbPromise: Promise<AppDbClient> | undefined;
let poolClient: Pool | undefined;

function getMysqlConfig() {
	const host =
		process.env.MYSQL_HOST || import.meta.env.MYSQL_HOST || "127.0.0.1";
	const port = Number(
		process.env.MYSQL_PORT || import.meta.env.MYSQL_PORT || "3306",
	);
	const user = process.env.MYSQL_USER || import.meta.env.MYSQL_USER || "root";
	const password =
		process.env.MYSQL_PASSWORD || import.meta.env.MYSQL_PASSWORD || "123456";
	const database =
		process.env.MYSQL_DATABASE || import.meta.env.MYSQL_DATABASE || "blog";

	return {
		host,
		port: Number.isFinite(port) ? port : 3306,
		user,
		password,
		database,
	};
}

async function createDatabaseClient() {
	if (!dbClient) {
		const config = getMysqlConfig();
		poolClient = mysql.createPool({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password,
			database: config.database,
			waitForConnections: true,
			connectionLimit: 2,
			queueLimit: 2,
			charset: "utf8mb4",
			dateStrings: true,
			connectTimeout: 5000,
		});
		
		try {
			await poolClient.getConnection();
			dbClient = new MysqlDbClient(poolClient);
		} catch (error) {
			console.error("数据库连接失败:", error);
			await poolClient.end();
			throw new Error("无法连接到数据库，请检查配置是否正确");
		}
	}

	return dbClient;
}

const TABLE_SCHEMAS: Record<string, string> = {
	admin_users: `
		CREATE TABLE IF NOT EXISTS admin_users (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			username VARCHAR(128) NOT NULL UNIQUE,
			password_hash VARCHAR(512) NOT NULL,
			password_salt VARCHAR(512) NOT NULL,
			created_at VARCHAR(40) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
			updated_at VARCHAR(40) NOT NULL DEFAULT (CURRENT_TIMESTAMP)
		)
	`,
	admin_sessions: `
		CREATE TABLE IF NOT EXISTS admin_sessions (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			user_id BIGINT NOT NULL,
			token_hash VARCHAR(256) NOT NULL UNIQUE,
			expires_at VARCHAR(40) NOT NULL,
			created_at VARCHAR(40) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
			FOREIGN KEY(user_id) REFERENCES admin_users(id) ON DELETE CASCADE
		)
	`,
	award_certificates: `
		CREATE TABLE IF NOT EXISTS award_certificates (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			title VARCHAR(255) NOT NULL,
			honor_type VARCHAR(32) NOT NULL DEFAULT '奖项',
			competition_name VARCHAR(255) NOT NULL DEFAULT '',
			award_name VARCHAR(255) NOT NULL DEFAULT '',
			award_year INT NOT NULL,
			award_level VARCHAR(64) NOT NULL,
			description TEXT,
			image_name VARCHAR(255) NOT NULL,
			image_mime_type VARCHAR(128) NOT NULL,
			image_base64 LONGTEXT NOT NULL,
			created_at VARCHAR(40) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
			updated_at VARCHAR(40) NOT NULL DEFAULT (CURRENT_TIMESTAMP)
		)
	`,
	blog_articles: `
		CREATE TABLE IF NOT EXISTS blog_articles (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			slug VARCHAR(255) NOT NULL UNIQUE,
			title VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			category VARCHAR(32) NOT NULL,
			tags TEXT NOT NULL,
			published_at VARCHAR(40) NOT NULL,
			article_updated_at VARCHAR(40),
			cover_image VARCHAR(512),
			is_pinned TINYINT(1) NOT NULL DEFAULT 0,
			draft TINYINT(1) NOT NULL DEFAULT 0,
			body LONGTEXT NOT NULL,
			created_at VARCHAR(40) NOT NULL DEFAULT (CURRENT_TIMESTAMP),
			updated_at VARCHAR(40) NOT NULL DEFAULT (CURRENT_TIMESTAMP)
		)
	`,
};

async function ensureMissingTables(db: AppDbClient) {
	const existingTablesResult = await db.execute({
		sql: `
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = DATABASE()
		`,
	});
	const existingTables = new Set(
		existingTablesResult.rows.map((row) =>
			String(row.table_name ?? row.TABLE_NAME ?? "").toLowerCase(),
		),
	);

	for (const [tableName, createSql] of Object.entries(TABLE_SCHEMAS)) {
		if (!existingTables.has(tableName.toLowerCase())) {
			await db.execute(createSql);
		}
	}
}

async function initializeDatabase() {
	const db = await createDatabaseClient();
	return db;
}

export async function getDb() {
	if (!dbPromise) {
		dbPromise = initializeDatabase().catch((error) => {
			console.error("数据库初始化失败:", error);
			dbPromise = undefined;
			throw error;
		});
	}

	return dbPromise;
}
