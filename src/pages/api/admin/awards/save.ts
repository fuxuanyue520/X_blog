import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { loginRedirectForUnauthorizedApiRequest } from "@/lib/admin-login-redirect";
import {
	AWARD_LEVELS,
	HONOR_TYPES,
	buildAwardTitle,
	getAwardById,
	isSupportedAwardUploadFile,
	prepareAwardImageForStorage,
	saveAward,
} from "@/lib/awards";

export const prerender = false;

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
		return redirect(
			loginRedirectForUnauthorizedApiRequest(context.request, "/admin/awards"),
		);
	}

	const formData = await context.request.formData();
	const idValue = String(formData.get("id") ?? "").trim();
	const id = idValue ? Number(idValue) : undefined;
	const honorType = String(formData.get("honorType") ?? "").trim();
	const competitionName = String(formData.get("competitionName") ?? "").trim();
	const awardName = String(formData.get("awardName") ?? "").trim();
	const awardYear = Number(String(formData.get("awardYear") ?? "").trim());
	const awardLevel = String(formData.get("awardLevel") ?? "").trim();
	const imageField = formData.get("image");

	const existingAward = id ? await getAwardById(id) : null;
	const description = String(
		formData.get("description") ?? existingAward?.description ?? "",
	).trim();
	const title = buildAwardTitle(competitionName, awardName);

	if (idValue && (!Number.isInteger(id) || (id ?? 0) <= 0 || !existingAward)) {
		return redirect(buildRedirect({ status: "error", code: "invalid_award" }));
	}

	if (
		!honorType ||
		!Number.isInteger(awardYear) ||
		awardYear < 1900 ||
		awardYear > 2100
	) {
		return redirect(buildRedirect({ status: "error", code: "invalid_fields", edit: id }));
	}

	if (!HONOR_TYPES.includes(honorType as (typeof HONOR_TYPES)[number])) {
		return redirect(buildRedirect({ status: "error", code: "invalid_type", edit: id }));
	}

	if (awardLevel && !AWARD_LEVELS.includes(awardLevel as (typeof AWARD_LEVELS)[number])) {
		return redirect(buildRedirect({ status: "error", code: "invalid_level", edit: id }));
	}

	let imageName = existingAward?.imageName ?? "";
	let imageMimeType = existingAward?.imageMimeType ?? "";
	let imageBase64 = existingAward?.imageBase64 ?? "";

	if (imageField instanceof File && imageField.size > 0) {
		if (!isSupportedAwardUploadFile(imageField)) {
			return redirect(buildRedirect({ status: "error", code: "invalid_image_type", edit: id }));
		}

		const preparedImage = await prepareAwardImageForStorage(imageField, title);
		imageName = preparedImage.imageName;
		imageMimeType = preparedImage.imageMimeType;
		imageBase64 = preparedImage.imageBase64;
	}

	if (!imageBase64 || !imageMimeType) {
		return redirect(buildRedirect({ status: "error", code: "missing_image", edit: id }));
	}

	const savedId = await saveAward({
		id,
		honorType,
		competitionName,
		awardName,
		awardYear,
		awardLevel,
		description,
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
