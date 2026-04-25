/* empty css                                  */
import { f as createAstro, g as createComponent, j as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_mSrCIW4D.mjs';
import 'kleur/colors';
import { a as $$BaseLayout } from '../chunks/BaseLayout_Col_CNTh.mjs';
import { g as getAuthenticatedAdmin } from '../chunks/auth_B0WoEm69.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://xuanzai-blog.netlify.app");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const admin = await getAuthenticatedAdmin(Astro2);
  if (!admin) {
    return Astro2.redirect("/?login=1");
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u540E\u53F0\u7BA1\u7406", "description": "\u535A\u5BA2\u540E\u53F0\u7BA1\u7406\u9996\u9875" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="mx-auto max-w-5xl space-y-6"> <div class="rounded-3xl border border-white/10 bg-dark-800/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"> <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"> <div> <p class="text-sm uppercase tracking-[0.35em] text-primary-400">Dashboard</p> <h1 class="mt-3 text-3xl font-bold text-white">欢迎回来，${admin.username}</h1> <p class="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
当前后台鉴权已启用，登录状态由数据库会话表维护，密码以带盐哈希形式存储。
</p> </div> <form method="POST" action="/api/admin/logout"> <button type="submit" class="rounded-2xl border border-white/10 bg-dark-900/80 px-5 py-3 text-sm font-medium text-gray-100 transition hover:border-primary-400 hover:text-primary-300">
退出登录
</button> </form> </div> </div> <div class="grid gap-6 md:grid-cols-2"> <div class="rounded-3xl border border-white/10 bg-dark-800/70 p-6"> <h2 class="text-xl font-semibold text-white">已完成</h2> <ul class="mt-4 space-y-3 text-sm leading-7 text-gray-300"> <li>管理员账号自动初始化到数据库</li> <li>密码采用 \`scrypt\` 带盐哈希存储</li> <li>登录成功后写入 HttpOnly 会话 Cookie</li> <li>后台首页未登录时自动跳转登录页</li> <li>荣誉墙支持后台增删改查与前台分类筛选</li> </ul> </div> <div class="rounded-3xl border border-white/10 bg-dark-800/70 p-6"> <h2 class="text-xl font-semibold text-white">当前入口</h2> <div class="mt-4 space-y-3 text-sm leading-7 text-gray-300"> <p>登录页：\`/admin/login\`</p> <p>后台页：\`/admin\`</p> <p>荣誉墙管理：\`/admin/awards\`</p> <p>荣誉墙前台：\`/awards\`</p> <p>登录接口：\`/api/admin/login\`</p> <p>退出接口：\`/api/admin/logout\`</p> </div> </div> </div> <div class="rounded-3xl border border-white/10 bg-dark-800/70 p-6"> <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"> <div> <h2 class="text-xl font-semibold text-white">荣誉墙管理</h2> <p class="mt-2 text-sm leading-7 text-gray-300">
可以上传奖状图片，并按学校、年份、级别维护展示信息。
</p> </div> <div class="flex flex-wrap gap-3"> <a href="/admin/awards" class="rounded-2xl bg-primary-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-600">
进入管理
</a> <a href="/awards" target="_blank" class="rounded-2xl border border-white/10 bg-dark-900/80 px-5 py-3 text-sm font-medium text-gray-100 transition hover:border-primary-400 hover:text-primary-300">
查看前台
</a> </div> </div> </div> </section> ` })}`;
}, "C:/Code/X_blog/src/pages/admin/index.astro", void 0);

const $$file = "C:/Code/X_blog/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
