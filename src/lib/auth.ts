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
		return { error: "user_not_found" };
	}

	const passwordHash = normalizeStoredCredential(row.password_hash);
	const passwordSalt = normalizeStoredCredential(row.password_salt);
	
	if (!passwordHash || !passwordSalt) {
		return { error: "invalid_credentials" };
	}
	
	const isValid = verifyPassword(password, passwordHash, passwordSalt);

	if (!isValid) {
		return { error: "wrong_password" };
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
	const now = new Date();
	const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
	
	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	};

	const expiresAtStr = formatDate(expiresAt);
	const createdAtStr = formatDate(now);
	const lastActivityAtStr = formatDate(now);

	await db.execute({
		sql: `
			INSERT INTO admin_sessions (user_id, token_hash, expires_at, created_at, last_activity_at)
			VALUES (?, ?, ?, ?, ?)
		`,
		args: [userId, tokenHash, expiresAtStr, createdAtStr, lastActivityAtStr],
	});

	return { token, expiresAt: expiresAtStr };
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
	const expiresAtTime = new Date(expiresAt.replace(" ", "T")).getTime();
	if (expiresAtTime <= Date.now()) {
		await db.execute({
			sql: "DELETE FROM admin_sessions WHERE token_hash = ?",
			args: [tokenHash],
		});
		context.cookies.delete(ADMIN_SESSION_COOKIE_NAME, { path: "/" });
		return null;
	}

	// 检查是否空闲超时（30 分钟无操作）
	const lastActivityTime = new Date(lastActivityAt.replace(" ", "T")).getTime();
	if (lastActivityTime + IDLE_TIMEOUT_MS <= Date.now()) {
		await db.execute({
			sql: "DELETE FROM admin_sessions WHERE token_hash = ?",
			args: [tokenHash],
		});
		context.cookies.delete(ADMIN_SESSION_COOKIE_NAME, { path: "/" });
		return null;
	}

	// 更新最后活动时间
	const formatActivityDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const seconds = String(date.getSeconds()).padStart(2, "0");
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	};
	const newLastActivity = formatActivityDate(new Date());
	await db.execute({
		sql: "UPDATE admin_sessions SET last_activity_at = ? WHERE token_hash = ?",
		args: [newLastActivity, tokenHash],
	});

	return {
		id: normalizeId(row.id),
		username: String(row.username),
	} satisfies AuthenticatedAdmin;
}

function adminSessionCookieSecure(): boolean {
	const explicit = import.meta.env.PUBLIC_SESSION_COOKIE_SECURE;
	if (explicit === "false") return false;
	if (explicit === "true") return true;
	const site = import.meta.env.SITE;
	if (typeof site === "string" && site.startsWith("https://")) return true;
	// 未显式配置时：仅当 astro.config 中 site 为 https 时使用 Secure，避免纯 HTTP 生产环境丢弃会话 Cookie
	return false;
}

export function setAdminSessionCookie(
	cookies: CookieStore,
	token: string,
	expiresAt: string,
) {
	cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: adminSessionCookieSecure(),
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
