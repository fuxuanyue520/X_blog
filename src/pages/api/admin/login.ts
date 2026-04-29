import type { APIRoute } from "astro";
import {
	authenticateAdmin,
	createAdminSession,
	setAdminSessionCookie,
} from "@/lib/auth";
import { homeUrlWithAdminLoginPrompt } from "@/lib/admin-login-redirect";

function normalizeRedirectTarget(value: FormDataEntryValue | null) {
	const target = String(value ?? "").trim();

	if (!target.startsWith("/") || target.startsWith("//")) {
		return "/";
	}

	return target;
}

/** 登录失败时也必须留在首页带弹窗，不能跳到 /admin?...（会再次触发未登录重定向）。 */
function withLoginError(redirectAfterLogin: string, error: string) {
	const safe = normalizeRedirectTarget(redirectAfterLogin as FormDataEntryValue);
	const u = new URL("/", "http://localhost");
	u.searchParams.set("login", "1");
	u.searchParams.set("error", error);
	if (safe !== "/") {
		u.searchParams.set("redirectTo", safe);
	}
	return `${u.pathname}${u.search}`;
}

function withLoginSuccess(target: string) {
	const url = new URL(target, "http://localhost");
	url.searchParams.set("auth", "login");
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

	const authResult = await authenticateAdmin(username, password);

	if ("error" in authResult) {
		return redirect(withLoginError(redirectTo, authResult.error));
	}

	const session = await createAdminSession(authResult.id);
	setAdminSessionCookie(cookies, session.token, session.expiresAt);

	const destination = redirectTo === "/admin/login" ? "/admin" : redirectTo;
	return redirect(withLoginSuccess(destination));
};

export const GET: APIRoute = async ({ redirect }) => {
	return redirect(homeUrlWithAdminLoginPrompt("/admin/documents"));
};
