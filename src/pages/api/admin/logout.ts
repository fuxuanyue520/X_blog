import type { APIRoute } from "astro";
import {
	ADMIN_SESSION_COOKIE_NAME,
	clearAdminSessionCookie,
	destroyAdminSession,
} from "@/lib/auth";

function normalizeRedirectTarget(value: FormDataEntryValue | null) {
	const target = String(value ?? "").trim();

	if (!target.startsWith("/") || target.startsWith("//")) {
		return "/";
	}

	return target;
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	const token = cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
	const formData = await request.formData();
	const redirectTo = normalizeRedirectTarget(formData.get("redirectTo"));

	await destroyAdminSession(token);
	clearAdminSessionCookie(cookies);

	return redirect(redirectTo);
};

export const GET: APIRoute = async ({ redirect }) => {
	return redirect("/");
};
