import { g as getAuthenticatedAdmin } from '../../../../chunks/auth_B0WoEm69.mjs';
import { g as getAwardById, d as deleteAwardById } from '../../../../chunks/awards_9vu1RA00.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location
    }
  });
}
const POST = async (context) => {
  const admin = await getAuthenticatedAdmin(context);
  if (!admin) {
    return redirect("/?login=1");
  }
  const formData = await context.request.formData();
  const id = Number(String(formData.get("id") ?? "").trim());
  if (!Number.isInteger(id) || id <= 0) {
    return redirect("/admin/awards?status=error&code=invalid_award");
  }
  const award = await getAwardById(id);
  if (!award) {
    return redirect("/admin/awards?status=error&code=invalid_award");
  }
  await deleteAwardById(id);
  return redirect("/admin/awards?status=deleted");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	POST,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
