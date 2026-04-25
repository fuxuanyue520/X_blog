import type { APIRoute } from "astro";
import {
	authenticateAdmin,
	createAdminSession,
	setAdminSessionCookie,
} from "@/lib/auth";

function normalizeRedirectTarget(value: FormDataEntryValue | null) {
	const target = String(value ?? "").trim();

	if (!target.startsWith("/") || target.startsWith("//")) {
		return "/";
	}

	return target;
}

function withLoginError(target: string, error: string) {
	const url = new URL(target, "http://localhost");
	url.searchParams.set("login", "1");
	url.searchParams.set("error", error);

	return `${url.pathname}${url.search}`;
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	const formData = await request.formData();
	const username = String(formData.get("username") ?? "").trim();
	const password = String(formData.get("password") ?? "");
	const redirectTo = normalizeRedirectTarget(formData.get("redirectTo"));

	if (!username || !password) {
		return redirect(withLoginError(redirectTo, "missing_fields"));
	}

	const admin = await authenticateAdmin(username, password);

	if (!admin) {
		return redirect(withLoginError(redirectTo, "invalid_credentials"));
	}

	const session = await createAdminSession(admin.id);
	setAdminSessionCookie(cookies, session.token, session.expiresAt);

	return redirect(redirectTo === "/admin/login" ? "/admin" : redirectTo);
};

export const GET: APIRoute = async ({ redirect }) => {
	return redirect("/?login=1");
};
