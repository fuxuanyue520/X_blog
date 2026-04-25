/* empty css                                     */
import { f as createAstro, g as createComponent } from '../../chunks/astro/server_mSrCIW4D.mjs';
import 'kleur/colors';
import 'clsx';
import { g as getAuthenticatedAdmin } from '../../chunks/auth_B0WoEm69.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://xuanzai-blog.netlify.app");
const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const admin = await getAuthenticatedAdmin(Astro2);
  if (admin) {
    return Astro2.redirect("/admin");
  }
  return Astro2.redirect("/?login=1");
}, "C:/Code/X_blog/src/pages/admin/login.astro", void 0);

const $$file = "C:/Code/X_blog/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Login,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
