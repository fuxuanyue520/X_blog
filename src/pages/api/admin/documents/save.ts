import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { saveArticle } from "@/lib/articles";

export const prerender = false;

function redirect(location: string) {
	return new Response(null, {
		status: 302,
		headers: {
			Location: location,
		},
	});
}

function buildRedirect(params: Record<string, string | undefined>) {
	const search = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value) {
			search.set(key, value);
		}
	}

	return `/admin/documents${search.size > 0 ? `?${search.toString()}` : ""}`;
}

export const POST: APIRoute = async (context) => {
	const admin = await getAuthenticatedAdmin(context);

	if (!admin) {
		return redirect("/?login=1");
	}

	const formData = await context.request.formData();
	const currentSlug = String(formData.get("currentSlug") ?? "").trim();
	const slug = String(formData.get("slug") ?? "").trim();

	try {
		const savedSlug = await saveArticle({
			currentSlug: currentSlug || undefined,
			slug,
			title: String(formData.get("title") ?? "").trim(),
			description: String(formData.get("description") ?? "").trim(),
			category: String(formData.get("category") ?? "").trim(),
			tags: String(formData.get("tags") ?? "")
				.split(/[,，\n]/)
				.map((item) => item.trim())
				.filter(Boolean),
			publishedAt: String(formData.get("publishedAt") ?? "").trim(),
			updatedAt: String(formData.get("updatedAt") ?? "").trim() || undefined,
			coverImage: String(formData.get("coverImage") ?? "").trim() || undefined,
			isPinned: formData.get("isPinned") === "true",
			draft: formData.get("draft") === "true",
			body: String(formData.get("body") ?? ""),
		});

		return redirect(
			buildRedirect({
				status: currentSlug ? "updated" : "created",
				highlight: savedSlug,
			}),
		);
	} catch (error) {
		const code =
			error instanceof Error && error.message ? error.message : "save_failed";
		return redirect(
			buildRedirect({
				status: "error",
				code,
				edit: currentSlug || slug || undefined,
				create: currentSlug ? undefined : "1",
			}),
		);
	}
};
