import { Buffer } from 'node:buffer';
import { g as getDb } from './db_CBeWrKyF.mjs';

const AWARD_LEVELS = ["校级", "市级", "省级", "国家级"];
function toNumber(value) {
  return Number(value);
}
function normalizeAwardRow(row) {
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
    imageUrl: `/api/awards/${id}`
  };
}
function normalizeAwardImageRow(row) {
  return {
    id: toNumber(row.id),
    title: String(row.title ?? ""),
    imageMimeType: String(row.image_mime_type ?? ""),
    imageBase64: String(row.image_base64 ?? "")
  };
}
async function listAwards(filters = {}) {
  const db = await getDb();
  const conditions = [];
  const args = [];
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
    args
  });
  return result.rows.map((row) => normalizeAwardRow(row));
}
async function listAwardFilterOptions() {
  const db = await getDb();
  const [schoolResult, yearResult, levelResult] = await Promise.all([
    db.execute({
      sql: "SELECT DISTINCT school FROM award_certificates WHERE school <> '' ORDER BY school ASC"
    }),
    db.execute({
      sql: "SELECT DISTINCT award_year FROM award_certificates ORDER BY award_year DESC"
    }),
    db.execute({
      sql: "SELECT DISTINCT award_level FROM award_certificates WHERE award_level <> '' ORDER BY award_level ASC"
    })
  ]);
  return {
    schools: schoolResult.rows.map((row) => String(row.school ?? "")),
    years: yearResult.rows.map((row) => toNumber(row.award_year)).filter((year) => Number.isFinite(year)),
    levels: levelResult.rows.map((row) => String(row.award_level ?? ""))
  };
}
async function getAwardById(id) {
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
    args: [id]
  });
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return {
    ...normalizeAwardRow(row),
    imageBase64: String(row.image_base64 ?? "")
  };
}
async function getAwardImageById(id) {
  const db = await getDb();
  const result = await db.execute({
    sql: `
			SELECT id, title, image_mime_type, image_base64
			FROM award_certificates
			WHERE id = ?
			LIMIT 1
		`,
    args: [id]
  });
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  return normalizeAwardImageRow(row);
}
async function saveAward(input) {
  const db = await getDb();
  const now = (/* @__PURE__ */ new Date()).toISOString();
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
        input.id
      ]
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
      now
    ]
  });
  return toNumber(result.lastInsertRowid);
}
async function deleteAwardById(id) {
  const db = await getDb();
  await db.execute({
    sql: "DELETE FROM award_certificates WHERE id = ?",
    args: [id]
  });
}
async function countAwards() {
  const db = await getDb();
  const result = await db.execute("SELECT COUNT(*) AS total FROM award_certificates");
  return toNumber(result.rows[0]?.total ?? 0);
}
async function fileToBase64(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}
function base64ToBuffer(value) {
  return Buffer.from(value, "base64");
}

export { AWARD_LEVELS as A, listAwardFilterOptions as a, getAwardImageById as b, countAwards as c, deleteAwardById as d, base64ToBuffer as e, fileToBase64 as f, getAwardById as g, listAwards as l, saveAward as s };
