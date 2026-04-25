import { A as ADMIN_SESSION_COOKIE_NAME, d as destroyAdminSession, b as clearAdminSessionCookie } from '../../../chunks/auth_B0WoEm69.mjs';
export { renderers } from '../../../renderers.mjs';

function normalizeRedirectTarget(value) {
  const target = String(value ?? "").trim();
  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/";
  }
  return target;
}
const POST = async ({ request, cookies, redirect }) => {
  const token = cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const formData = await request.formData();
  const redirectTo = normalizeRedirectTarget(formData.get("redirectTo"));
  await destroyAdminSession(token);
  clearAdminSessionCookie(cookies);
  return redirect(redirectTo);
};
const GET = async ({ redirect }) => {
  return redirect("/");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
