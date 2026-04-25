import { g as getAuthenticatedAdmin } from '../../../chunks/auth_B0WoEm69.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async (context) => {
  const admin = await getAuthenticatedAdmin(context);
  return new Response(
    JSON.stringify({
      authenticated: Boolean(admin),
      username: admin?.username ?? null
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	GET,
	prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
