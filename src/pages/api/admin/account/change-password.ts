import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
	hashPassword,
	normalizeStoredCredential,
	verifyPassword,
} from "@/lib/security";

export const prerender = false;

const MIN_LEN = 8;
const MAX_LEN = 128;

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
		},
	});
}

export const POST: APIRoute = async (context) => {
	const admin = await getAuthenticatedAdmin(context);
	if (!admin) {
		return json({ error: "未登录或登录已失效" }, 401);
	}

	let body: {
		currentPassword?: string;
		newPassword?: string;
		confirmPassword?: string;
	};
	try {
		body = await context.request.json();
	} catch {
		return json({ error: "请求体无效" }, 400);
	}

	const currentPassword = String(body.currentPassword ?? "").trim();
	const newPassword = String(body.newPassword ?? "");
	const confirmPassword = String(body.confirmPassword ?? "");

	if (!currentPassword || !newPassword || !confirmPassword) {
		return json({ error: "请填写当前密码、新密码与确认密码。" }, 400);
	}

	if (newPassword !== confirmPassword) {
		return json({ error: "两次输入的新密码不一致。" }, 400);
	}

	if (newPassword.length < MIN_LEN) {
		return json({ error: `新密码至少需要 ${MIN_LEN} 位字符。` }, 400);
	}

	if (newPassword.length > MAX_LEN) {
		return json({ error: `新密码不能超过 ${MAX_LEN} 位。` }, 400);
	}

	if (newPassword === currentPassword) {
		return json({ error: "新密码不能与当前密码相同。" }, 400);
	}

	const db = await getDb();
	const result = await db.execute({
		sql: `
			SELECT password_hash, password_salt
			FROM admin_users
			WHERE id = ?
			LIMIT 1
		`,
		args: [admin.id],
	});

	const row = result.rows[0];
	if (!row) {
		return json({ error: "账户不存在或无法保存。" }, 404);
	}

	const passwordHash = normalizeStoredCredential(row.password_hash);
	const passwordSalt = normalizeStoredCredential(row.password_salt);

	if (!passwordHash || !passwordSalt) {
		return json({ error: "账户凭据异常，无法校验当前密码。" }, 500);
	}

	let valid = false;
	try {
		valid = verifyPassword(currentPassword, passwordHash, passwordSalt);
	} catch {
		valid = false;
	}

	if (!valid) {
		return json({ error: "当前密码不正确。" }, 400);
	}

	const { hash, salt } = hashPassword(newPassword);
	const now = new Date().toISOString();

	await db.execute({
		sql: `
			UPDATE admin_users
			SET password_hash = ?, password_salt = ?, updated_at = ?
			WHERE id = ?
		`,
		args: [hash, salt, now, admin.id],
	});

	return json({ ok: true });
};
