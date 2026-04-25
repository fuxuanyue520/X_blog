import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { deleteAwardById, getAwardById } from "@/lib/awards";

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
	const id = Number(String(formData.get("id") ?? "").trim());

	if (!Number.isInteger(id) || id <= 0) {
		return redirect("/admin/awards?status=error&code=invalid_award");
	}

	const award = await getAwardById(id);

	if (!award) {
		return redirect("/admin/awards?status=error&code=invalid_award");
	}

	await deleteAwardById(id);

	return redirect("/admin/awards?status=deleted");
};
