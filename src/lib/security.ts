import {
	createHash,
	randomBytes,
	scryptSync,
	timingSafeEqual,
} from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

/** 与 mysql2 返回类型对齐：字符串或 Buffer 均需转为与入库一致的 hex 字符串 */
export function normalizeStoredCredential(value: unknown): string {
	if (value == null) {
		return "";
	}
	if (typeof value === "string") {
		return value;
	}
	if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
		return value.toString("utf8");
	}
	return String(value);
}

export function hashPassword(
	password: string,
	salt = randomBytes(16).toString("hex"),
) {
	const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH);

	return {
		salt,
		hash: derivedKey.toString("hex"),
	};
}

export function verifyPassword(password: string, hash: string, salt: string) {
	const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
	const expectedKey = Buffer.from(hash, "hex");

	if (derivedKey.length !== expectedKey.length) {
		return false;
	}

	return timingSafeEqual(derivedKey, expectedKey);
}

export function createSessionToken() {
	return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
	return createHash("sha256").update(token).digest("hex");
}
