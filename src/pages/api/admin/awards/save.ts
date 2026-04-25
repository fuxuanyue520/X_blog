import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { AWARD_LEVELS, fileToBase64, getAwardById, saveAward } from "@/lib/awards";

export const prerender = false;

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function redirect(location: string) {
	return new Response(null, {
		status: 302,
		headers: {
			Location: location,
		},
	});
}

function buildRedirect(params: Record<string, string | number | undefined>) {
	const search = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== "") {
			search.set(key, String(value));
		}
	}

	return `/admin/awards${search.size > 0 ? `?${search.toString()}` : ""}`;
}

export const POST: APIRoute = async (context) => {
	const admin = await getAuthenticatedAdmin(context);

	if (!admin) {
		return redirect("/?login=1");
	}

	const formData = await context.request.formData();
	const idValue = String(formData.get("id") ?? "").trim();
	const id = idValue ? Number(idValue) : undefined;
	const title = String(formData.get("title") ?? "").trim();
	const school = String(formData.get("school") ?? "").trim();
	const awardYear = Number(String(formData.get("awardYear") ?? "").trim());
	const awardLevel = String(formData.get("awardLevel") ?? "").trim();
	const description = String(formData.get("description") ?? "").trim();
	const sortOrder = Number(String(formData.get("sortOrder") ?? "0").trim() || "0");
	const imageField = formData.get("image");

	const existingAward = id ? await getAwardById(id) : null;

	if (idValue && (!Number.isInteger(id) || (id ?? 0) <= 0 || !existingAward)) {
		return redirect(buildRedirect({ status: "error", code: "invalid_award" }));
	}

	if (!title || !school || !Number.isInteger(awardYear) || awardYear < 1900 || awardYear > 2100 || !awardLevel) {
		return redirect(buildRedirect({ status: "error", code: "invalid_fields", edit: id }));
	}

	if (!AWARD_LEVELS.includes(awardLevel as (typeof AWARD_LEVELS)[number])) {
		return redirect(buildRedirect({ status: "error", code: "invalid_level", edit: id }));
	}

	let imageName = existingAward?.imageName ?? "";
	let imageMimeType = existingAward?.imageMimeType ?? "";
	let imageBase64 = existingAward?.imageBase64 ?? "";

	if (imageField instanceof File && imageField.size > 0) {
		if (!imageField.type.startsWith("image/")) {
			return redirect(buildRedirect({ status: "error", code: "invalid_image_type", edit: id }));
		}

		if (imageField.size > MAX_IMAGE_SIZE_BYTES) {
			return redirect(buildRedirect({ status: "error", code: "image_too_large", edit: id }));
		}

		imageName = imageField.name || `${title}.jpg`;
		imageMimeType = imageField.type;
		imageBase64 = await fileToBase64(imageField);
	}

	if (!imageBase64 || !imageMimeType) {
		return redirect(buildRedirect({ status: "error", code: "missing_image", edit: id }));
	}

	const savedId = await saveAward({
		id,
		title,
		school,
		awardYear,
		awardLevel,
		description,
		sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
		imageName,
		imageMimeType,
		imageBase64,
	});

	return redirect(
		buildRedirect({
			status: id ? "updated" : "created",
			highlight: savedId,
		}),
	);
};
