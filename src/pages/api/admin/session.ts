import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
	const admin = await getAuthenticatedAdmin(context);

	return new Response(
		JSON.stringify({
			authenticated: Boolean(admin),
			username: admin?.username ?? null,
		}),
		{
			headers: {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store",
			},
		},
	);
};
