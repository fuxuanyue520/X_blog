/**
 * 未登录时只在首页打开登录弹窗（/?login=1），不把浏览器留在 /admin 路由，
 * 否则服务端 require-auth 与 ?login=1 会无限 302。
 * @param returnPath 登录成功后要去的站内路径（含 query），须以 / 开头且非 //
 */
export function homeUrlWithAdminLoginPrompt(returnPath?: string): string {
	const params = new URLSearchParams();
	params.set("login", "1");
	if (returnPath) {
		const clean = returnPath.trim();
		if (clean.startsWith("/") && !clean.startsWith("//")) {
			params.set("redirectTo", clean);
		}
	}
	return `/?${params.toString()}`;
}

/** 用户尝试访问的后台 URL → 首页弹窗 + 登录成功后回到该地址。 */
export function homeUrlPromptLoginFromAdminAttempt(attemptUrl: URL): string {
	const u = new URL(attemptUrl.href);
	u.searchParams.delete("login");
	u.searchParams.delete("error");
	const returnPath = `${u.pathname}${u.search}${u.hash}`;
	return homeUrlWithAdminLoginPrompt(returnPath === "" ? "/" : returnPath);
}

/**
 * API 未授权：302 到首页登录；若有同源 Referer 为 /admin，则写入 redirectTo。
 */
export function loginRedirectForUnauthorizedApiRequest(
	request: Request,
	fallbackReturnPath: string,
): string {
	const stripLoginParams = (u: URL) => {
		const c = new URL(u.href);
		c.searchParams.delete("login");
		c.searchParams.delete("error");
		return `${c.pathname}${c.search}${c.hash}`;
	};

	const referer = request.headers.get("referer");
	if (referer) {
		try {
			const ref = new URL(referer);
			const self = new URL(request.url);
			if (
				ref.origin === self.origin &&
				ref.pathname.startsWith("/admin")
			) {
				return homeUrlWithAdminLoginPrompt(stripLoginParams(ref));
			}
		} catch {
			/* ignore invalid referer */
		}
	}
	const fb = new URL(fallbackReturnPath, "https://placeholder.local");
	return homeUrlWithAdminLoginPrompt(stripLoginParams(fb));
}
