import { Buffer } from "node:buffer";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp from "sharp";
import { getDb } from "@/lib/db";

export const AWARD_LEVELS = ["省级", "国家级", "世界级"] as const;
export const HONOR_TYPES = ["奖项", "软著", "专利", "证书", "其他"] as const;
const TARGET_IMAGE_SIZE_BYTES = 7 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2400;
const MIN_IMAGE_DIMENSION = 1200;
const JPEG_QUALITY_STEPS = [82, 74, 66, 58, 50, 42];
const PDF_MIME_TYPE = "application/pdf";
const PDF_FILE_PATTERN = /\.pdf$/i;
const PDF_RENDER_SCALE = 2;
const require = createRequire(import.meta.url);
const pdfjsBasePath = path.dirname(require.resolve("pdfjs-dist/package.json"));

GlobalWorkerOptions.workerSrc = pathToFileURL(
	path.join(pdfjsBasePath, "legacy", "build", "pdf.worker.mjs"),
).href;

export type AwardLevel = (typeof AWARD_LEVELS)[number];
export type HonorType = (typeof HONOR_TYPES)[number];

export interface AwardCertificate {
	id: number;
	title: string;
	honorType: string;
	competitionName: string;
	awardName: string;
	awardYear: number;
	awardLevel: string;
	description: string;
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
	keyword?: string;
	honorType?: string;
	awardYear?: number;
	awardLevel?: string;
}

export interface AwardListOptions {
	limit?: number;
	offset?: number;
}

export interface SaveAwardInput {
	id?: number;
	honorType: string;
	competitionName: string;
	awardName: string;
	awardYear: number;
	awardLevel?: string;
	description?: string;
	imageName: string;
	imageMimeType: string;
	imageBase64: string;
}

export interface PreparedAwardImage {
	imageName: string;
	imageMimeType: string;
	imageBase64: string;
	originalSize: number;
	storedSize: number;
}

export interface PreparedImageBuffer {
	buffer: Buffer;
	mimeType: string;
	originalSize: number;
	storedSize: number;
}

const HONOR_TYPE_ORDER = new Map(HONOR_TYPES.map((type, index) => [type, index]));
const AWARD_LEVEL_ORDER = new Map([
	["世界级", 0],
	["国际级", 0],
	["国家级", 1],
	["省级", 2],
	["市级", 3],
	["校级", 4],
]);

function toNumber(value: unknown) {
	return Number(value);
}

function getHonorTypeSortValue(type: string) {
	return HONOR_TYPE_ORDER.get(type as HonorType) ?? HONOR_TYPES.length + 1;
}

function getAwardLevelSortValue(level: string) {
	if (!level) {
		return 99;
	}

	for (const [key, value] of AWARD_LEVEL_ORDER.entries()) {
		if (level.includes(key)) {
			return value;
		}
	}

	return 50;
}

function getAwardNameSortValue(awardName: string) {
	const value = awardName.trim();

	if (!value) {
		return [99, 999, ""];
	}

	const rankedPatterns: Array<[RegExp, number, number]> = [
		[/(特等奖学金|国家奖学金|特等奖|冠军|金奖)/u, 0, 0],
		[/(一等奖学金|一等奖候选|一等奖|亚军|银奖)/u, 1, 1],
		[/(二等奖学金|二等奖候选|二等奖|季军|铜奖)/u, 1, 2],
		[/(三等奖学金|三等奖候选|三等奖)/u, 1, 3],
		[/(优秀奖|优胜奖|最佳组织奖|优秀组织奖|最佳人气奖|最佳创意奖|最佳表现奖|道德风尚奖)/u, 2, 0],
		[/(入围奖|成功参赛奖|纪念奖)/u, 3, 0],
	];

	for (const [pattern, bucket, rank] of rankedPatterns) {
		if (pattern.test(value)) {
			return [bucket, rank, value] as const;
		}
	}

	const chineseNumberMap: Record<string, number> = {
		零: 0,
		一: 1,
		二: 2,
		三: 3,
		四: 4,
		五: 5,
		六: 6,
		七: 7,
		八: 8,
		九: 9,
		十: 10,
	};
	const rankingMatch = value.match(/^第(\d+)名$/u) ?? value.match(/^第([一二三四五六七八九十零]+)名$/u);
	if (rankingMatch?.[1]) {
		const ranking =
			Number(rankingMatch[1]) ||
			rankingMatch[1]
				.split("")
				.reduce((total, char) => total * 10 + (chineseNumberMap[char] ?? 0), 0);
		return [1, ranking || 999, value] as const;
	}

	return [10, 999, value] as const;
}

export function compareAwards(left: AwardCertificate, right: AwardCertificate) {
	const honorTypeDiff = getHonorTypeSortValue(left.honorType) - getHonorTypeSortValue(right.honorType);
	if (honorTypeDiff !== 0) {
		return honorTypeDiff;
	}

	const yearDiff = right.awardYear - left.awardYear;
	if (yearDiff !== 0) {
		return yearDiff;
	}

	const levelDiff = getAwardLevelSortValue(left.awardLevel) - getAwardLevelSortValue(right.awardLevel);
	if (levelDiff !== 0) {
		return levelDiff;
	}

	const [leftBucket, leftRank, leftLabel] = getAwardNameSortValue(left.awardName);
	const [rightBucket, rightRank, rightLabel] = getAwardNameSortValue(right.awardName);
	if (leftBucket !== rightBucket) {
		return leftBucket - rightBucket;
	}
	if (leftRank !== rightRank) {
		return leftRank - rightRank;
	}

	const awardNameDiff = leftLabel.localeCompare(rightLabel, "zh-CN");
	if (awardNameDiff !== 0) {
		return awardNameDiff;
	}

	const titleDiff = left.title.localeCompare(right.title, "zh-CN");
	if (titleDiff !== 0) {
		return titleDiff;
	}

	return right.id - left.id;
}

export function groupAwardsByType(awards: AwardCertificate[]) {
	const groups = new Map<string, AwardCertificate[]>();

	for (const award of awards) {
		const bucket = groups.get(award.honorType) ?? [];
		bucket.push(award);
		groups.set(award.honorType, bucket);
	}

	return Array.from(groups.entries()).map(([honorType, items]) => ({
		honorType,
		items,
	}));
}

export function buildAwardTitle(competitionName: string, awardName: string) {
	return `${competitionName.trim()}${awardName.trim()}`.trim() || "未命名荣誉";
}

export function splitAwardTitle(title: string) {
	const normalizedTitle = title.trim().replace(/\s+/g, " ");

	if (!normalizedTitle) {
		return {
			competitionName: "",
			awardName: "",
		};
	}

	const awardPatterns = [
		/(特等奖学金|一等奖学金|二等奖学金|三等奖学金|优秀毕业生)$/u,
		/(特等奖|一等奖|二等奖|三等奖|金奖|银奖|铜奖|优秀奖|优胜奖|入围奖)$/u,
		/(冠军|亚军|季军)$/u,
		/(第[一二三四五六七八九十百零]+名|第\d+名)$/u,
		/(团体特等奖|团体一等奖|团体二等奖|团体三等奖)$/u,
		/(一等奖候选|二等奖候选|三等奖候选)$/u,
	];

	for (const pattern of awardPatterns) {
		const match = normalizedTitle.match(pattern);
		if (!match || typeof match.index !== "number" || match.index <= 0) {
			continue;
		}

		const awardName = match[0].trim();
		const competitionName = normalizedTitle.slice(0, match.index).trim();
		if (competitionName) {
			return {
				competitionName,
				awardName,
			};
		}
	}

	return {
		competitionName: normalizedTitle,
		awardName: "",
	};
}

function normalizeAwardRow(row: Record<string, unknown>): AwardCertificate {
	const id = toNumber(row.id);
	const fallback = splitAwardTitle(String(row.title ?? ""));
	const competitionName = String(row.competition_name ?? "").trim() || fallback.competitionName;
	const awardName = String(row.award_name ?? "").trim() || fallback.awardName;

	return {
		id,
		title: String(row.title ?? ""),
		honorType: String(row.honor_type ?? "奖项"),
		competitionName,
		awardName,
		awardYear: toNumber(row.award_year),
		awardLevel: String(row.award_level ?? ""),
		description: String(row.description ?? ""),
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

function buildAwardFilterQuery(filters: AwardFilters = {}) {
	const conditions: string[] = [];
	const args: Array<string | number> = [];

	if (filters.keyword) {
		const keyword = `%${filters.keyword}%`;
		conditions.push(
			"(title LIKE ? OR honor_type LIKE ? OR competition_name LIKE ? OR award_name LIKE ? OR award_level LIKE ? OR CAST(award_year AS TEXT) LIKE ?)",
		);
		args.push(keyword, keyword, keyword, keyword, keyword, keyword);
	}

	if (filters.honorType) {
		conditions.push("honor_type = ?");
		args.push(filters.honorType);
	}

	if (typeof filters.awardYear === "number" && Number.isFinite(filters.awardYear)) {
		conditions.push("award_year = ?");
		args.push(filters.awardYear);
	}

	if (filters.awardLevel) {
		conditions.push("award_level = ?");
		args.push(filters.awardLevel);
	}

	return {
		whereClause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
		args,
	};
}

export async function listAwards(filters: AwardFilters = {}, options: AwardListOptions = {}) {
	const db = await getDb();
	const { whereClause, args } = buildAwardFilterQuery(filters);
	const result = await db.execute({
		sql: `
			SELECT
				id,
				title,
				honor_type,
				competition_name,
				award_name,
				award_year,
				award_level,
				description,
				image_name,
				image_mime_type,
				created_at,
				updated_at
			FROM award_certificates
			${whereClause}
		`,
		args,
	});

	const normalizedRows = result.rows
		.map((row) => normalizeAwardRow(row as Record<string, unknown>))
		.sort(compareAwards);
	const start =
		typeof options.offset === "number" && Number.isFinite(options.offset) && options.offset > 0
			? Math.floor(options.offset)
			: 0;
	const end =
		typeof options.limit === "number" && Number.isFinite(options.limit) && options.limit > 0
			? start + Math.floor(options.limit)
			: undefined;

	return normalizedRows.slice(start, end);
}

export async function listAwardFilterOptions() {
	const db = await getDb();
	const [typeResult, yearResult, levelResult] = await Promise.all([
		db.execute({
			sql: "SELECT DISTINCT honor_type FROM award_certificates WHERE honor_type <> ''",
		}),
		db.execute({
			sql: "SELECT DISTINCT award_year FROM award_certificates ORDER BY award_year DESC",
		}),
		db.execute({
			sql: "SELECT DISTINCT award_level FROM award_certificates WHERE award_level <> '' ORDER BY award_level ASC",
		}),
	]);

	return {
		types: typeResult.rows
			.map((row) => String(row.honor_type ?? ""))
			.sort((left, right) => {
				const leftIndex = getHonorTypeSortValue(left);
				const rightIndex = getHonorTypeSortValue(right);
				if (leftIndex >= 0 && rightIndex >= 0) {
					return leftIndex - rightIndex;
				}
				if (leftIndex >= 0) {
					return -1;
				}
				if (rightIndex >= 0) {
					return 1;
				}
				return left.localeCompare(right, "zh-CN");
			}),
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
				honor_type,
				competition_name,
				award_name,
				award_year,
				award_level,
				description,
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
	const title = buildAwardTitle(input.competitionName, input.awardName);

	if (input.id) {
		await db.execute({
			sql: `
				UPDATE award_certificates
				SET
					title = ?,
					honor_type = ?,
					competition_name = ?,
					award_name = ?,
					award_year = ?,
					award_level = ?,
					description = ?,
					image_name = ?,
					image_mime_type = ?,
					image_base64 = ?,
					updated_at = ?
				WHERE id = ?
			`,
			args: [
				title,
				input.honorType,
				input.competitionName,
				input.awardName,
				input.awardYear,
				input.awardLevel ?? "",
				input.description ?? "",
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
				honor_type,
				competition_name,
				award_name,
				award_year,
				award_level,
				description,
				image_name,
				image_mime_type,
				image_base64,
				created_at,
				updated_at
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
		args: [
			title,
			input.honorType,
			input.competitionName,
			input.awardName,
			input.awardYear,
			input.awardLevel ?? "",
			input.description ?? "",
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

export async function countAwards(filters: AwardFilters = {}) {
	const db = await getDb();
	const { whereClause, args } = buildAwardFilterQuery(filters);
	const result = await db.execute({
		sql: `SELECT COUNT(*) AS total FROM award_certificates ${whereClause}`,
		args,
	});
	return toNumber(result.rows[0]?.total ?? 0);
}

function buildStoredImageName(originalName: string, fallbackTitle: string) {
	const rawName = (originalName || fallbackTitle || "award-image").trim();
	const normalizedName = rawName.replace(/\.[^.]+$/, "").trim() || "award-image";
	return `${normalizedName}.jpg`;
}

function isPdfFile(file: Pick<File, "name" | "type">) {
	return file.type === PDF_MIME_TYPE || PDF_FILE_PATTERN.test(file.name);
}

export function isSupportedAwardUploadFile(file: Pick<File, "name" | "type">) {
	return file.type.startsWith("image/") || isPdfFile(file);
}

async function renderPdfFirstPage(fileBuffer: Buffer) {
	const loadingTask = getDocument({
		data: new Uint8Array(fileBuffer),
		cMapUrl: pathToFileURL(path.join(pdfjsBasePath, "cmaps") + path.sep).href,
		cMapPacked: true,
		standardFontDataUrl: pathToFileURL(
			path.join(pdfjsBasePath, "standard_fonts") + path.sep,
		).href,
		wasmUrl: pathToFileURL(path.join(pdfjsBasePath, "wasm") + path.sep).href,
		isImageDecoderSupported: false,
		useSystemFonts: true,
	});

	try {
		const pdfDocument = await loadingTask.promise;

		try {
			const page = await pdfDocument.getPage(1);
			const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
			const canvas = createCanvas(
				Math.max(1, Math.ceil(viewport.width)),
				Math.max(1, Math.ceil(viewport.height)),
			);
			const context = canvas.getContext("2d");

			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, canvas.width, canvas.height);

			await page.render({
				canvasContext: context as never,
				viewport,
			}).promise;

			page.cleanup();
			const renderedBuffer = canvas.toBuffer("image/png");
			canvas.width = 0;
			canvas.height = 0;
			return renderedBuffer;
		} finally {
			await pdfDocument.cleanup();
			await pdfDocument.destroy();
		}
	} catch (error) {
		await loadingTask.destroy();
		const message =
			error instanceof Error && error.message
				? error.message
				: "未知错误";
		throw new Error(`PDF 转图片失败：${message}`);
	}
}

async function compressImageBuffer(inputBuffer: Buffer) {
	const metadata = await sharp(inputBuffer, { limitInputPixels: false }).metadata();
	const maxSide = Math.max(metadata.width ?? 0, metadata.height ?? 0, MAX_IMAGE_DIMENSION);
	let currentDimension = Math.min(maxSide, MAX_IMAGE_DIMENSION);
	let smallestBuffer: Buffer | undefined;

	while (currentDimension >= MIN_IMAGE_DIMENSION) {
		for (const quality of JPEG_QUALITY_STEPS) {
			const candidateBuffer = await sharp(inputBuffer, { limitInputPixels: false })
				.rotate()
				.flatten({ background: "#ffffff" })
				.resize({
					width: currentDimension,
					height: currentDimension,
					fit: "inside",
					withoutEnlargement: true,
				})
				.jpeg({
					quality,
					mozjpeg: true,
					progressive: true,
				})
				.toBuffer();

			if (!smallestBuffer || candidateBuffer.length < smallestBuffer.length) {
				smallestBuffer = candidateBuffer;
			}

			if (candidateBuffer.length <= TARGET_IMAGE_SIZE_BYTES) {
				return candidateBuffer;
			}
		}

		currentDimension = Math.floor(currentDimension * 0.8);
	}

	return smallestBuffer ?? inputBuffer;
}

export async function prepareImageBuffer(file: File): Promise<PreparedImageBuffer> {
	const inputBuffer = Buffer.from(await file.arrayBuffer());
	const normalizedInputBuffer = isPdfFile(file)
		? await renderPdfFirstPage(inputBuffer)
		: inputBuffer;
	const compressedBuffer = await compressImageBuffer(normalizedInputBuffer);

	return {
		buffer: compressedBuffer,
		mimeType: "image/jpeg",
		originalSize: inputBuffer.length,
		storedSize: compressedBuffer.length,
	};
}

export async function prepareAwardImageForStorage(file: File, fallbackTitle: string): Promise<PreparedAwardImage> {
	const preparedImage = await prepareImageBuffer(file);

	return {
		imageName: buildStoredImageName(file.name, fallbackTitle),
		imageMimeType: preparedImage.mimeType,
		imageBase64: preparedImage.buffer.toString("base64"),
		originalSize: preparedImage.originalSize,
		storedSize: preparedImage.storedSize,
	};
}

export function base64ToBuffer(value: string) {
	return Buffer.from(value, "base64");
}
