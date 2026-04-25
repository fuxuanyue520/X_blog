import type { APIRoute } from "astro";
import { base64ToBuffer, getAwardImageById } from "@/lib/awards";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const id = Number(params.id);

	if (!Number.isInteger(id) || id <= 0) {
		return new Response("Invalid award id", { status: 400 });
	}

	const award = await getAwardImageById(id);

	if (!award) {
		return new Response("Award image not found", { status: 404 });
	}

	return new Response(base64ToBuffer(award.imageBase64), {
		headers: {
			"content-type": award.imageMimeType,
			"cache-control": "public, max-age=3600",
		},
	});
};
