import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import { getDb } from "@/lib/db";
import type { Article, ArticleCategory, ArticleHeading } from "@/types/article";

export const ARTICLE_CATEGORIES = ["tech", "essay", "project", "other"] as const;

export interface ArticleAdminEntry {
	id: string;
	slug: string;
	title: string;
	description: string;
	category: ArticleCategory;
	tags: string[];
	publishedAt: string;
	updatedAt?: string;
	coverImage?: string;
	isPinned: boolean;
	draft: boolean;
	body: string;
	excerpt: string;
}

export interface ArticleListFilters {
	keyword?: string;
	category?: string;
	status?: string;
}

export interface SaveArticleInput {
	currentSlug?: string;
	slug?: string;
	title: string;
	description: string;
	category: string;
	tags?: string[];
	publishedAt: string;
	updatedAt?: string;
	coverImage?: string;
	isPinned?: boolean;
	draft?: boolean;
	body: string;
}

export interface ParsedMarkdownImport {
	slug: string;
	title: string;
	description: string;
	category: ArticleCategory;
	tags: string[];
	publishedAt: string;
	updatedAt?: string;
	coverImage?: string;
	isPinned: boolean;
	draft: boolean;
	body: string;
}

export interface PaginatedArticles {
	items: Article[];
	total: number;
	currentPage: number;
	lastPage: number;
}

interface ArticleRow {
	id: unknown;
	slug: unknown;
	title: unknown;
	description: unknown;
	category: unknown;
	tags: unknown;
	published_at: unknown;
	article_updated_at: unknown;
	cover_image: unknown;
	is_pinned: unknown;
	draft: unknown;
	body: unknown;
}

function padDatePart(value: number) {
	return String(value).padStart(2, "0");
}

function toLocalDateTimeString(date: Date) {
	return [
		date.getFullYear(),
		padDatePart(date.getMonth() + 1),
		padDatePart(date.getDate()),
	].join("-") +
		`T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
}

function parseDateTimeValue(value: string) {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const normalized = trimmed.replace(/\.\d{1,3}Z?$/, "").replace(" ", "T");
	const candidates = new Set<string>();

	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
		candidates.add(`${normalized}:00`);
	} else if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
		candidates.add(`${normalized}T00:00:00`);
	} else {
		candidates.add(normalized);
	}

	// Some legacy records include a localized timezone label in parentheses.
	candidates.add(trimmed.replace(/\s*\([^)]*\)\s*$/, ""));

	for (const candidate of candidates) {
		const parsed = new Date(candidate);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}

	return null;
}

function isValidCategory(value: string): value is ArticleCategory {
	return ARTICLE_CATEGORIES.includes(value as ArticleCategory);
}

function normalizeDateTimeValue(value: unknown) {
	const raw = String(value ?? "").trim();
	if (!raw) {
		return "";
	}

	const parsed = parseDateTimeValue(raw);
	return parsed ? toLocalDateTimeString(parsed) : "";
}

function toBoolean(value: unknown) {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "number") {
		return value === 1;
	}

	return String(value ?? "").trim().toLowerCase() === "true";
}

function normalizeTags(value: unknown) {
	if (Array.isArray(value)) {
		return value
			.map((item) => String(item ?? "").trim())
			.filter(Boolean);
	}

	return String(value ?? "")
		.split(/[,，\n]/)
		.map((item) => item.trim())
		.filter(Boolean);
}

function parseStoredTags(value: unknown) {
	const raw = String(value ?? "").trim();
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);
		return normalizeTags(parsed);
	} catch {
		return normalizeTags(raw);
	}
}

function normalizeSlugCandidate(value: string) {
	return value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function buildFallbackSlug() {
	return `post-${Date.now()}`;
}

export function normalizeArticleSlug(value: string, fallbackSource = "") {
	const normalized = normalizeSlugCandidate(value) || normalizeSlugCandidate(fallbackSource);
	return normalized || buildFallbackSlug();
}

function buildExcerpt(body: string) {
	const compact = body
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[`>*_-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	if (!compact) {
		return "暂无正文内容";
	}

	return compact.length > 120 ? `${compact.slice(0, 120)}...` : compact;
}

function assertValidCategory(value: string): asserts value is ArticleCategory {
	if (!isValidCategory(value)) {
		throw new Error("invalid_category");
	}
}

function assertValidPublishedAt(value: string) {
	if (!normalizeDateTimeValue(value)) {
		throw new Error("invalid_published_at");
	}
}

function mapArticleRow(row: ArticleRow): ArticleAdminEntry {
	const body = String(row.body ?? "").replace(/^\uFEFF/, "").trim();
	const publishedAt =
		normalizeDateTimeValue(row.published_at) || new Date().toISOString().slice(0, 19);
	const updatedAt = normalizeDateTimeValue(row.article_updated_at) || undefined;
	const category = isValidCategory(String(row.category ?? "other"))
		? (String(row.category) as ArticleCategory)
		: "other";

	return {
		id: String(row.id ?? ""),
		slug: String(row.slug ?? "").trim(),
		title: String(row.title ?? "").trim(),
		description: String(row.description ?? "").trim(),
		category,
		tags: parseStoredTags(row.tags),
		publishedAt,
		updatedAt,
		coverImage: String(row.cover_image ?? "").trim() || undefined,
		isPinned: toBoolean(row.is_pinned),
		draft: toBoolean(row.draft),
		body,
		excerpt: buildExcerpt(body),
	};
}

function toPublicArticle(entry: ArticleAdminEntry): Article {
	return {
		id: entry.id,
		slug: entry.slug,
		body: entry.body,
		excerpt: entry.excerpt,
		data: {
			title: entry.title,
			description: entry.description,
			publishedAt: new Date(entry.publishedAt),
			updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : undefined,
			tags: entry.tags,
			category: entry.category,
			coverImage: entry.coverImage,
			isPinned: entry.isPinned,
			draft: entry.draft,
		},
	};
}

function compareArticles(left: ArticleAdminEntry, right: ArticleAdminEntry) {
	if (left.isPinned !== right.isPinned) {
		return left.isPinned ? -1 : 1;
	}

	return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
}

async function fetchAllAdminArticles() {
	const db = await getDb();
	const result = await db.execute(`
		SELECT
			id,
			slug,
			title,
			description,
			category,
			tags,
			published_at,
			article_updated_at,
			cover_image,
			is_pinned,
			draft,
			body
		FROM blog_articles
	`);

	return result.rows.map((row) => mapArticleRow(row as ArticleRow));
}

export async function listAdminArticles(filters: ArticleListFilters = {}) {
	const articles = await fetchAllAdminArticles();

	return articles
		.filter((article) => {
			if (filters.category && article.category !== filters.category) {
				return false;
			}

			if (filters.status === "published" && article.draft) {
				return false;
			}
			if (filters.status === "draft" && !article.draft) {
				return false;
			}

			if (filters.keyword) {
				const keyword = filters.keyword.toLowerCase();
				const haystack = [
					article.slug,
					article.title,
					article.description,
					article.category,
					article.tags.join(" "),
					article.body,
				]
					.join(" ")
					.toLowerCase();

				return haystack.includes(keyword);
			}

			return true;
		})
		.sort(compareArticles);
}

export async function getAdminArticleBySlug(slug: string) {
	const normalizedSlug = normalizeArticleSlug(slug);
	const db = await getDb();
	const result = await db.execute({
		sql: `
			SELECT
				id,
				slug,
				title,
				description,
				category,
				tags,
				published_at,
				article_updated_at,
				cover_image,
				is_pinned,
				draft,
				body
			FROM blog_articles
			WHERE slug = ?
			LIMIT 1
		`,
		args: [normalizedSlug],
	});

	const row = result.rows[0];
	return row ? mapArticleRow(row as ArticleRow) : null;
}

export async function listPublishedArticles() {
	const articles = await listAdminArticles({ status: "published" });
	return articles.map(toPublicArticle);
}

export async function getPublishedArticleBySlug(slug: string) {
	const article = await getAdminArticleBySlug(slug);

	if (!article || article.draft) {
		return null;
	}

	return toPublicArticle(article);
}

export async function paginatePublishedArticles(page: number, pageSize: number) {
	const articles = await listPublishedArticles();
	const total = articles.length;
	const lastPage = Math.max(1, Math.ceil(total / pageSize));
	const currentPage = Number.isFinite(page) && page > 0 ? Math.min(page, lastPage) : 1;
	const start = (currentPage - 1) * pageSize;

	return {
		items: articles.slice(start, start + pageSize),
		total,
		currentPage,
		lastPage,
	} satisfies PaginatedArticles;
}

export async function saveArticle(input: SaveArticleInput) {
	const db = await getDb();
	const currentSlug = input.currentSlug ? normalizeArticleSlug(input.currentSlug) : undefined;
	const nextSlug = normalizeArticleSlug(input.slug ?? "", input.title);
	const title = input.title.trim();
	const description = input.description.trim();
	const category = String(input.category ?? "").trim();
	const publishedAt = normalizeDateTimeValue(input.publishedAt);
	const coverImage = String(input.coverImage ?? "").trim();
	const body = input.body.replace(/\r\n/g, "\n").trim();
	const tags = (input.tags ?? []).map((tag) => tag.trim()).filter(Boolean);

	if (!title) {
		throw new Error("invalid_title");
	}

	if (!nextSlug) {
		throw new Error("invalid_slug");
	}

	assertValidCategory(category);
	assertValidPublishedAt(publishedAt);

	if (currentSlug) {
		const existing = await getAdminArticleBySlug(currentSlug);
		if (!existing) {
			throw new Error("invalid_document");
		}
	}

	if (currentSlug !== nextSlug) {
		const duplicate = await getAdminArticleBySlug(nextSlug);
		if (duplicate) {
			throw new Error("duplicate_slug");
		}
	}

	const now = new Date().toISOString();
	const articleUpdatedAt =
		normalizeDateTimeValue(input.updatedAt) ||
		(currentSlug ? new Date().toISOString().slice(0, 19) : "");
	const storedTags = JSON.stringify(tags);

	if (currentSlug) {
		await db.execute({
			sql: `
				UPDATE blog_articles
				SET
					slug = ?,
					title = ?,
					description = ?,
					category = ?,
					tags = ?,
					published_at = ?,
					article_updated_at = ?,
					cover_image = ?,
					is_pinned = ?,
					draft = ?,
					body = ?,
					updated_at = ?
				WHERE slug = ?
			`,
			args: [
				nextSlug,
				title,
				description,
				category,
				storedTags,
				publishedAt,
				articleUpdatedAt || null,
				coverImage || null,
				Boolean(input.isPinned) ? 1 : 0,
				Boolean(input.draft) ? 1 : 0,
				body,
				now,
				currentSlug,
			],
		});
	} else {
		await db.execute({
			sql: `
				INSERT INTO blog_articles (
					slug,
					title,
					description,
					category,
					tags,
					published_at,
					article_updated_at,
					cover_image,
					is_pinned,
					draft,
					body,
					created_at,
					updated_at
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
			args: [
				nextSlug,
				title,
				description,
				category,
				storedTags,
				publishedAt,
				articleUpdatedAt || null,
				coverImage || null,
				Boolean(input.isPinned) ? 1 : 0,
				Boolean(input.draft) ? 1 : 0,
				body,
				now,
				now,
			],
		});
	}

	return nextSlug;
}

export async function deleteArticleBySlug(slug: string) {
	const normalizedSlug = normalizeArticleSlug(slug);
	const existing = await getAdminArticleBySlug(normalizedSlug);

	if (!existing) {
		return false;
	}

	const db = await getDb();
	await db.execute({
		sql: "DELETE FROM blog_articles WHERE slug = ?",
		args: [normalizedSlug],
	});
	return true;
}

export async function parseMarkdownImport(text: string, fileName = "post.md"): Promise<ParsedMarkdownImport> {
	const parsed = matter(text);
	const data = parsed.data as Record<string, unknown>;
	const fallbackSlug = fileName.replace(/\.(md|markdown)$/i, "");
	const title = String(data.title ?? "").trim() || fallbackSlug || "未命名文章";
	const description =
		String(data.description ?? "").trim() || buildExcerpt(parsed.content).replace(/\.\.\.$/, "");
	const categoryCandidate = String(data.category ?? "other").trim();
	const category = isValidCategory(categoryCandidate)
		? categoryCandidate
		: "other";
	const publishedAt =
		normalizeDateTimeValue(data.publishedAt) || new Date().toISOString().slice(0, 19);
	const updatedAt = normalizeDateTimeValue(data.updatedAt) || undefined;

	return {
		slug: normalizeArticleSlug(String(data.slug ?? fallbackSlug), title),
		title,
		description,
		category,
		tags: normalizeTags(data.tags),
		publishedAt,
		updatedAt,
		coverImage: String(data.coverImage ?? "").trim() || undefined,
		isPinned: toBoolean(data.isPinned),
		draft: toBoolean(data.draft),
		body: parsed.content.replace(/^\uFEFF/, "").trim(),
	};
}

export async function parseMarkdownImportFile(file: File) {
	const fileName = file.name || "post.md";
	const text = await file.text();
	return parseMarkdownImport(text, fileName);
}

function createHeadingSlugger() {
	const counts = new Map<string, number>();

	return (text: string) => {
		const base = text
			.toLowerCase()
			.normalize("NFKD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
			.trim()
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "") || "section";
		const current = counts.get(base) ?? 0;
		counts.set(base, current + 1);
		return current === 0 ? base : `${base}-${current}`;
	};
}

export function renderArticleMarkdown(body: string) {
	const headings: ArticleHeading[] = [];
	const slugify = createHeadingSlugger();
	const marked = new Marked({ gfm: true, async: false });

	marked.use({
		walkTokens(token) {
			if (token.type !== "heading") {
				return;
			}

			const slug = slugify(token.text);
			(token as Tokens.Heading & { slug?: string }).slug = slug;
			headings.push({
				depth: token.depth,
				slug,
				text: token.text,
			});
		},
		renderer: {
			heading(token) {
				const heading = token as Tokens.Heading & { slug?: string };
				const slug = heading.slug ?? slugify(heading.text);
				const text = this.parser.parseInline(heading.tokens);
				return `<h${heading.depth} id="${slug}">${text}</h${heading.depth}>`;
			},
		},
	});

	const html = marked.parse(body) as string;
	return { html, headings };
}
