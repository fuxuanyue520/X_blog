import type { APIContext } from "astro";
import { getDb } from "@/lib/db";
import {
	createSessionToken,
	hashSessionToken,
	normalizeStoredCredential,
	verifyPassword,
} from "@/lib/security";

export const ADMIN_SESSION_COOKIE_NAME = "x-blog-admin-session";

// 会话时长：7 天
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
// 空闲超时：30 分钟无操作自动退出
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

type CookieStore = APIContext["cookies"];

export interface AuthenticatedAdmin {
	id: number;
	username: string;
}

function normalizeId(value: unknown) {
	return Number(value);
}

export async function authenticateAdmin(username: string, password: string) {
	const db = await getDb();
	const result = await db.execute({
		sql: `
			SELECT id, username, password_hash, password_salt
			FROM admin_users
			WHERE username = ?
			LIMIT 1
		`,
		args: [username],
	});

	const row = result.rows[0];

	if (!row) {
		return null;
	}

	const passwordHash = normalizeStoredCredential(row.password_hash);
	const passwordSalt = normalizeStoredCredential(row.password_salt);
	const isValid = verifyPassword(password, passwordHash, passwordSalt);

	if (!isValid) {
		return null;
	}

	return {
		id: normalizeId(row.id),
		username: String(row.username),
	} satisfies AuthenticatedAdmin;
}

export async function createAdminSession(userId: number) {
	const db = await getDb();
	const token = createSessionToken();
	const tokenHash = hashSessionToken(token);
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
		.toISOString()
		.replace("T", " ")
		.substring(0, 19);
	const createdAt = new Date().toISOString().replace("T", " ").substring(0, 19);
	const lastActivityAt = new Date()
		.toISOString()
		.replace("T", " ")
		.substring(0, 19);

	await db.execute({
		sql: `
			INSERT INTO admin_sessions (user_id, token_hash, expires_at, created_at, last_activity_at)
			VALUES (?, ?, ?, ?, ?)
		`,
		args: [userId, tokenHash, expiresAt, createdAt, lastActivityAt],
	});

	return { token, expiresAt };
}

export async function getAuthenticatedAdmin(
	context: Pick<APIContext, "cookies">,
) {
	const token = context.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

	if (!token) {
		return null;
	}

	const db = await getDb();
	const tokenHash = hashSessionToken(token);
	const result = await db.execute({
		sql: `
			SELECT u.id, u.username, s.expires_at, s.last_activity_at
			FROM admin_sessions s
			INNER JOIN admin_users u ON u.id = s.user_id
			WHERE s.token_hash = ?
			LIMIT 1
		`,
		args: [tokenHash],
	});

	const row = result.rows[0];

	if (!row) {
		context.cookies.delete(ADMIN_SESSION_COOKIE_NAME, { path: "/" });
		return null;
	}

	const expiresAt = String(row.expires_at);
	const lastActivityAt = String(row.last_activity_at);

	// 检查会话是否过期
	if (new Date(expiresAt).getTime() <= Date.now()) {
		await db.execute({
			sql: "DELETE FROM admin_sessions WHERE token_hash = ?",
			args: [tokenHash],
		});
		context.cookies.delete(ADMIN_SESSION_COOKIE_NAME, { path: "/" });
		return null;
	}

	// 检查是否空闲超时（30 分钟无操作）
	if (new Date(lastActivityAt).getTime() + IDLE_TIMEOUT_MS <= Date.now()) {
		await db.execute({
			sql: "DELETE FROM admin_sessions WHERE token_hash = ?",
			args: [tokenHash],
		});
		context.cookies.delete(ADMIN_SESSION_COOKIE_NAME, { path: "/" });
		return null;
	}

	// 更新最后活动时间
	const newLastActivity = new Date()
		.toISOString()
		.replace("T", " ")
		.substring(0, 19);
	await db.execute({
		sql: "UPDATE admin_sessions SET last_activity_at = ? WHERE token_hash = ?",
		args: [newLastActivity, tokenHash],
	});

	return {
		id: normalizeId(row.id),
		username: String(row.username),
	} satisfies AuthenticatedAdmin;
}

export function setAdminSessionCookie(
	cookies: CookieStore,
	token: string,
	expiresAt: string,
) {
	cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: import.meta.env.PROD,
		path: "/",
		expires: new Date(expiresAt),
	});
}

export function clearAdminSessionCookie(cookies: CookieStore) {
	cookies.delete(ADMIN_SESSION_COOKIE_NAME, { path: "/" });
}

export async function destroyAdminSession(token?: string) {
	if (!token) {
		return;
	}

	const db = await getDb();

	await db.execute({
		sql: "DELETE FROM admin_sessions WHERE token_hash = ?",
		args: [hashSessionToken(token)],
	});
}
