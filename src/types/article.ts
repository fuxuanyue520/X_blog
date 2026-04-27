export type ArticleCategory = "tech" | "essay" | "project" | "other";

export interface ArticleFrontMatter {
	title: string;
	description: string;
	publishedAt: Date;
	updatedAt?: Date;
	tags: string[];
	category: ArticleCategory;
	coverImage?: string;
	readingTime?: number;
	isPinned?: boolean;
	draft?: boolean;
}

export interface Article {
	id: string;
	slug: string;
	body: string;
	excerpt: string;
	data: ArticleFrontMatter;
}

export interface ArticleHeading {
	depth: number;
	slug: string;
	text: string;
}
