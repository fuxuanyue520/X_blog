import { a as authenticateAdmin, c as createAdminSession, s as setAdminSessionCookie } from '../../../chunks/auth_B0WoEm69.mjs';
export { renderers } from '../../../renderers.mjs';

function normalizeRedirectTarget(value) {
  const target = String(value ?? "").trim();
  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/";
  }
  return target;
}
function withLoginError(target, error) {
  const url = new URL(target, "http://localhost");
  url.searchParams.set("login", "1");
  url.searchParams.set("error", error);
  return `${url.pathname}${url.search}`;
}
const POST = async ({ request, cookies, redirect }) => {
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
const GET = async ({ redirect }) => {
  return redirect("/?login=1");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
