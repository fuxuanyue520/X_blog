import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { deleteArticleBySlug, getAdminArticleBySlug, normalizeArticleSlug } from "@/lib/articles";

export const prerender = false;

function redirect(location: string) {
	return new Response(null, {
		status: 302,
		headers: {
			Location: location,
		},
	});
}

export const POST: APIRoute = async (context) => {
	const admin = await getAuthenticatedAdmin(context);

	if (!admin) {
		return redirect("/?login=1");
	}

	const formData = await context.request.formData();
	const rawSlug = String(formData.get("slug") ?? "").trim();

	if (!rawSlug) {
		return redirect("/admin/documents?status=error&code=invalid_document");
	}

	const slug = normalizeArticleSlug(rawSlug);
	const document = await getAdminArticleBySlug(slug);

	if (!document) {
		return redirect("/admin/documents?status=error&code=invalid_document");
	}

	await deleteArticleBySlug(slug);

	return redirect("/admin/documents?status=deleted");
};
