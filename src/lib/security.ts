import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
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
