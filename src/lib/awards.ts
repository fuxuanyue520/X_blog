import { Buffer } from "node:buffer";
import { getDb } from "@/lib/db";

export const AWARD_LEVELS = ["校级", "市级", "省级", "国家级"] as const;

export type AwardLevel = (typeof AWARD_LEVELS)[number];

export interface AwardCertificate {
	id: number;
	title: string;
	school: string;
	awardYear: number;
	awardLevel: string;
	description: string;
	sortOrder: number;
	imageName: string;
	imageMimeType: string;
	createdAt: string;
	updatedAt: string;
	imageUrl: string;
}

export interface AwardImageRecord {
	id: number;
	title: string;
	imageMimeType: string;
	imageBase64: string;
}

export interface AwardFilters {
	school?: string;
	awardYear?: number;
	awardLevel?: string;
}

export interface SaveAwardInput {
	id?: number;
	title: string;
	school: string;
	awardYear: number;
	awardLevel: string;
	description?: string;
	sortOrder?: number;
	imageName: string;
	imageMimeType: string;
	imageBase64: string;
}

function toNumber(value: unknown) {
	return Number(value);
}

function normalizeAwardRow(row: Record<string, unknown>): AwardCertificate {
	const id = toNumber(row.id);

	return {
		id,
		title: String(row.title ?? ""),
		school: String(row.school ?? ""),
		awardYear: toNumber(row.award_year),
		awardLevel: String(row.award_level ?? ""),
		description: String(row.description ?? ""),
		sortOrder: toNumber(row.sort_order ?? 0),
		imageName: String(row.image_name ?? ""),
		imageMimeType: String(row.image_mime_type ?? ""),
		createdAt: String(row.created_at ?? ""),
		updatedAt: String(row.updated_at ?? ""),
		imageUrl: `/api/awards/${id}`,
	};
}

function normalizeAwardImageRow(row: Record<string, unknown>): AwardImageRecord {
	return {
		id: toNumber(row.id),
		title: String(row.title ?? ""),
		imageMimeType: String(row.image_mime_type ?? ""),
		imageBase64: String(row.image_base64 ?? ""),
	};
}

export async function listAwards(filters: AwardFilters = {}) {
	const db = await getDb();
	const conditions: string[] = [];
	const args: Array<string | number> = [];

	if (filters.school) {
		conditions.push("school = ?");
		args.push(filters.school);
	}

	if (typeof filters.awardYear === "number" && Number.isFinite(filters.awardYear)) {
		conditions.push("award_year = ?");
		args.push(filters.awardYear);
	}

	if (filters.awardLevel) {
		conditions.push("award_level = ?");
		args.push(filters.awardLevel);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const result = await db.execute({
		sql: `
			SELECT
				id,
				title,
				school,
				award_year,
				award_level,
				description,
				sort_order,
				image_name,
				image_mime_type,
				created_at,
				updated_at
			FROM award_certificates
			${whereClause}
			ORDER BY award_year DESC, sort_order ASC, id DESC
		`,
		args,
	});

	return result.rows.map((row) => normalizeAwardRow(row as Record<string, unknown>));
}

export async function listAwardFilterOptions() {
	const db = await getDb();
	const [schoolResult, yearResult, levelResult] = await Promise.all([
		db.execute({
			sql: "SELECT DISTINCT school FROM award_certificates WHERE school <> '' ORDER BY school ASC",
		}),
		db.execute({
			sql: "SELECT DISTINCT award_year FROM award_certificates ORDER BY award_year DESC",
		}),
		db.execute({
			sql: "SELECT DISTINCT award_level FROM award_certificates WHERE award_level <> '' ORDER BY award_level ASC",
		}),
	]);

	return {
		schools: schoolResult.rows.map((row) => String(row.school ?? "")),
		years: yearResult.rows.map((row) => toNumber(row.award_year)).filter((year) => Number.isFinite(year)),
		levels: levelResult.rows.map((row) => String(row.award_level ?? "")),
	};
}

export async function getAwardById(id: number) {
	const db = await getDb();
	const result = await db.execute({
		sql: `
			SELECT
				id,
				title,
				school,
				award_year,
				award_level,
				description,
				sort_order,
				image_name,
				image_mime_type,
				image_base64,
				created_at,
				updated_at
			FROM award_certificates
			WHERE id = ?
			LIMIT 1
		`,
		args: [id],
	});
	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return {
		...normalizeAwardRow(row as Record<string, unknown>),
		imageBase64: String(row.image_base64 ?? ""),
	};
}

export async function getAwardImageById(id: number) {
	const db = await getDb();
	const result = await db.execute({
		sql: `
			SELECT id, title, image_mime_type, image_base64
			FROM award_certificates
			WHERE id = ?
			LIMIT 1
		`,
		args: [id],
	});
	const row = result.rows[0];

	if (!row) {
		return null;
	}

	return normalizeAwardImageRow(row as Record<string, unknown>);
}

export async function saveAward(input: SaveAwardInput) {
	const db = await getDb();
	const now = new Date().toISOString();

	if (input.id) {
		await db.execute({
			sql: `
				UPDATE award_certificates
				SET
					title = ?,
					school = ?,
					award_year = ?,
					award_level = ?,
					description = ?,
					sort_order = ?,
					image_name = ?,
					image_mime_type = ?,
					image_base64 = ?,
					updated_at = ?
				WHERE id = ?
			`,
			args: [
				input.title,
				input.school,
				input.awardYear,
				input.awardLevel,
				input.description ?? "",
				input.sortOrder ?? 0,
				input.imageName,
				input.imageMimeType,
				input.imageBase64,
				now,
				input.id,
			],
		});

		return input.id;
	}

	const result = await db.execute({
		sql: `
			INSERT INTO award_certificates (
				title,
				school,
				award_year,
				award_level,
				description,
				sort_order,
				image_name,
				image_mime_type,
				image_base64,
				created_at,
				updated_at
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
		args: [
			input.title,
			input.school,
			input.awardYear,
			input.awardLevel,
			input.description ?? "",
			input.sortOrder ?? 0,
			input.imageName,
			input.imageMimeType,
			input.imageBase64,
			now,
			now,
		],
	});

	return toNumber(result.lastInsertRowid);
}

export async function deleteAwardById(id: number) {
	const db = await getDb();

	await db.execute({
		sql: "DELETE FROM award_certificates WHERE id = ?",
		args: [id],
	});
}

export async function countAwards() {
	const db = await getDb();
	const result = await db.execute("SELECT COUNT(*) AS total FROM award_certificates");
	return toNumber(result.rows[0]?.total ?? 0);
}

export async function fileToBase64(file: File) {
	const buffer = Buffer.from(await file.arrayBuffer());
	return buffer.toString("base64");
}

export function base64ToBuffer(value: string) {
	return Buffer.from(value, "base64");
}
