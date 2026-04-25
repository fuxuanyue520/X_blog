/* empty css                                     */
import { f as createAstro, g as createComponent, j as renderComponent, r as renderTemplate, m as maybeRenderHead, i as addAttribute } from '../../chunks/astro/server_mSrCIW4D.mjs';
import 'kleur/colors';
import { a as $$BaseLayout, $ as $$Icon } from '../../chunks/BaseLayout_Col_CNTh.mjs';
import { g as getAuthenticatedAdmin } from '../../chunks/auth_B0WoEm69.mjs';
import { l as listAwards, g as getAwardById, c as countAwards, a as listAwardFilterOptions, A as AWARD_LEVELS } from '../../chunks/awards_9vu1RA00.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://xuanzai-blog.netlify.app");
const prerender = false;
const $$Awards = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Awards;
  const admin = await getAuthenticatedAdmin(Astro2);
  if (!admin) {
    return Astro2.redirect("/?login=1");
  }
  const status = Astro2.url.searchParams.get("status") ?? "";
  const code = Astro2.url.searchParams.get("code") ?? "";
  const highlightId = Number(Astro2.url.searchParams.get("highlight") ?? "");
  const editId = Number(Astro2.url.searchParams.get("edit") ?? "");
  const statusMessages = {
    created: "\u5956\u72B6\u5DF2\u6210\u529F\u6DFB\u52A0\u5230\u8363\u8A89\u5899\u3002",
    updated: "\u5956\u72B6\u4FE1\u606F\u5DF2\u66F4\u65B0\u3002",
    deleted: "\u5956\u72B6\u5DF2\u5220\u9664\u3002",
    invalid_award: "\u6CA1\u6709\u627E\u5230\u8981\u64CD\u4F5C\u7684\u5956\u72B6\u8BB0\u5F55\u3002",
    invalid_fields: "\u8BF7\u5B8C\u6574\u586B\u5199\u6807\u9898\u3001\u5B66\u6821\u3001\u5E74\u4EFD\u548C\u7EA7\u522B\u3002",
    invalid_level: "\u5956\u9879\u7EA7\u522B\u4E0D\u5728\u5141\u8BB8\u8303\u56F4\u5185\u3002",
    invalid_image_type: "\u4E0A\u4F20\u6587\u4EF6\u5FC5\u987B\u662F\u56FE\u7247\u683C\u5F0F\u3002",
    image_too_large: "\u56FE\u7247\u4F53\u79EF\u4E0D\u80FD\u8D85\u8FC7 8MB\u3002",
    missing_image: "\u65B0\u589E\u5956\u72B6\u65F6\u5FC5\u987B\u4E0A\u4F20\u56FE\u7247\u3002"
  };
  const feedbackMessage = status === "error" ? statusMessages[code] : statusMessages[status];
  const [awards, editingAward, totalAwards, filterOptions] = await Promise.all([
    listAwards(),
    Number.isInteger(editId) && editId > 0 ? getAwardById(editId) : Promise.resolve(null),
    countAwards(),
    listAwardFilterOptions()
  ]);
  const isEditing = Boolean(editingAward);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u8363\u8A89\u5899\u7BA1\u7406", "description": "\u540E\u53F0\u7BA1\u7406\u5956\u72B6\u8363\u8A89\u5899" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="mx-auto max-w-7xl space-y-6"> <div class="rounded-3xl border border-white/10 bg-dark-800/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"> <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"> <div> <p class="text-sm uppercase tracking-[0.35em] text-primary-400">Award Admin</p> <h1 class="mt-3 text-3xl font-bold text-white">荣誉墙管理</h1> <p class="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
在这里维护你的奖状荣誉墙内容。支持上传图片、设置学校、年份、级别，并在前台按条件筛选展示。
</p> </div> <div class="grid gap-3 sm:grid-cols-2"> <div class="rounded-2xl border border-white/10 bg-dark-900/70 px-5 py-4"> <p class="text-xs uppercase tracking-[0.25em] text-gray-500">Total Awards</p> <p class="mt-2 text-3xl font-bold text-white">${totalAwards}</p> </div> <div class="rounded-2xl border border-white/10 bg-dark-900/70 px-5 py-4"> <p class="text-xs uppercase tracking-[0.25em] text-gray-500">Schools</p> <p class="mt-2 text-3xl font-bold text-white">${filterOptions.schools.length}</p> </div> </div> </div> </div> ${feedbackMessage && renderTemplate`<div${addAttribute([
    "rounded-2xl border px-5 py-4 text-sm",
    status === "error" ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
  ], "class:list")}> ${feedbackMessage} </div>`} <div class="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]"> <div class="rounded-3xl border border-white/10 bg-dark-800/70 p-6"> <div class="mb-6 flex items-center justify-between gap-3"> <div> <h2 class="text-2xl font-semibold text-white">${isEditing ? "\u7F16\u8F91\u5956\u72B6" : "\u65B0\u589E\u5956\u72B6"}</h2> <p class="mt-2 text-sm text-gray-400"> ${isEditing ? "\u66F4\u65B0\u5F53\u524D\u5956\u72B6\u7684\u56FE\u7247\u548C\u5206\u7C7B\u4FE1\u606F\u3002" : "\u4E0A\u4F20\u5956\u72B6\u56FE\u7247\uFF0C\u5E76\u914D\u7F6E\u5C55\u793A\u4FE1\u606F\u3002"} </p> </div> ${isEditing && renderTemplate`<a href="/admin/awards" class="inline-flex items-center rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-primary-400 hover:text-primary-300">
取消编辑
</a>`} </div> <form method="POST" action="/api/admin/awards/save" enctype="multipart/form-data" class="space-y-5"> ${isEditing && renderTemplate`<input type="hidden" name="id"${addAttribute(editingAward?.id, "value")}>`} <div> <label for="award-title" class="mb-2 block text-sm font-medium text-gray-200">标题</label> <input id="award-title" name="title" type="text" required${addAttribute(editingAward?.title ?? "", "value")} class="w-full rounded-2xl border border-white/10 bg-dark-900/80 px-4 py-3 text-gray-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20" placeholder="例如：全国大学生数学建模竞赛一等奖"> </div> <div class="grid gap-4 sm:grid-cols-2"> <div> <label for="award-school" class="mb-2 block text-sm font-medium text-gray-200">学校</label> <input id="award-school" name="school" type="text" required list="award-schools"${addAttribute(editingAward?.school ?? "", "value")} class="w-full rounded-2xl border border-white/10 bg-dark-900/80 px-4 py-3 text-gray-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20" placeholder="例如：某某大学"> <datalist id="award-schools"> ${filterOptions.schools.map((school) => renderTemplate`<option${addAttribute(school, "value")}></option>`)} </datalist> </div> <div> <label for="award-year" class="mb-2 block text-sm font-medium text-gray-200">年份</label> <input id="award-year" name="awardYear" type="number" min="1900" max="2100" required${addAttribute(editingAward?.awardYear ?? (/* @__PURE__ */ new Date()).getFullYear(), "value")} class="w-full rounded-2xl border border-white/10 bg-dark-900/80 px-4 py-3 text-gray-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"> </div> </div> <div class="grid gap-4 sm:grid-cols-2"> <div> <label for="award-level" class="mb-2 block text-sm font-medium text-gray-200">级别</label> <select id="award-level" name="awardLevel" required class="w-full rounded-2xl border border-white/10 bg-dark-900/80 px-4 py-3 text-gray-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"> ${AWARD_LEVELS.map((level) => renderTemplate`<option${addAttribute(level, "value")}${addAttribute((editingAward?.awardLevel ?? "\u6821\u7EA7") === level, "selected")}>${level}</option>`)} </select> </div> <div> <label for="award-sort-order" class="mb-2 block text-sm font-medium text-gray-200">排序</label> <input id="award-sort-order" name="sortOrder" type="number"${addAttribute(editingAward?.sortOrder ?? 0, "value")} class="w-full rounded-2xl border border-white/10 bg-dark-900/80 px-4 py-3 text-gray-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20" placeholder="数字越小越靠前"> </div> </div> <div> <label for="award-description" class="mb-2 block text-sm font-medium text-gray-200">说明</label> <textarea id="award-description" name="description" rows="4" class="w-full rounded-2xl border border-white/10 bg-dark-900/80 px-4 py-3 text-gray-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20" placeholder="补充说明这张奖状的背景或含义">${editingAward?.description ?? ""}</textarea> </div> <div> <label for="award-image" class="mb-2 block text-sm font-medium text-gray-200">
图片 ${isEditing ? "\uFF08\u5982\u9700\u66F4\u6362\u518D\u4E0A\u4F20\uFF09" : ""} </label> <input id="award-image" name="image" type="file" accept="image/*"${addAttribute(!isEditing, "required")} class="block w-full rounded-2xl border border-dashed border-white/15 bg-dark-900/60 px-4 py-3 text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-primary-500/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-100"> ${isEditing && editingAward && renderTemplate`<p class="mt-3 text-sm text-gray-400">
当前图片：
<a${addAttribute(editingAward.imageUrl, "href")} target="_blank" class="text-primary-300 hover:text-primary-200"> ${editingAward.imageName} </a> </p>`} </div> <button type="submit" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"> ${renderComponent($$result2, "Icon", $$Icon, { "name": isEditing ? "ri:save-line" : "ri:add-circle-line", "class": "text-lg" })} ${isEditing ? "\u4FDD\u5B58\u4FEE\u6539" : "\u6DFB\u52A0\u5230\u8363\u8A89\u5899"} </button> </form> </div> <div class="rounded-3xl border border-white/10 bg-dark-800/70 p-6"> <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"> <div> <h2 class="text-2xl font-semibold text-white">已有奖状</h2> <p class="mt-2 text-sm text-gray-400">支持直接编辑分类信息，也可以删除不再展示的记录。</p> </div> <div class="flex gap-3"> <a href="/awards" target="_blank" class="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-primary-400 hover:text-primary-300"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "ri:gallery-line", "class": "text-lg" })}
查看前台
</a> </div> </div> ${awards.length > 0 ? renderTemplate`<div class="space-y-4"> ${awards.map((award) => renderTemplate`<article${addAttribute(highlightId === award.id ? `award-${award.id}` : void 0, "id")}${addAttribute([
    "grid gap-4 rounded-3xl border border-white/10 bg-dark-900/60 p-4 md:grid-cols-[180px_1fr]",
    highlightId === award.id ? "border-primary-400/50 shadow-[0_0_0_1px_rgba(34,211,238,0.3)]" : ""
  ], "class:list")}> <div class="overflow-hidden rounded-2xl bg-dark-950"> <img${addAttribute(award.imageUrl, "src")}${addAttribute(award.title, "alt")} class="aspect-[4/3] h-full w-full object-cover"> </div> <div class="flex flex-col justify-between gap-4"> <div> <div class="flex flex-wrap items-center gap-2"> <h3 class="text-xl font-semibold text-white">${award.title}</h3> <span class="rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs text-primary-200"> ${award.awardLevel} </span> </div> <p class="mt-3 text-sm leading-7 text-gray-300">${award.description || "\u6682\u65E0\u8865\u5145\u8BF4\u660E\u3002"}</p> </div> <div class="flex flex-wrap gap-2 text-sm"> <span class="rounded-full border border-white/10 bg-dark-800 px-3 py-1 text-gray-300">${award.school}</span> <span class="rounded-full border border-white/10 bg-dark-800 px-3 py-1 text-gray-300">${award.awardYear} 年</span> <span class="rounded-full border border-white/10 bg-dark-800 px-3 py-1 text-gray-300">排序 ${award.sortOrder}</span> </div> <div class="flex flex-wrap gap-3"> <a${addAttribute(`/admin/awards?edit=${award.id}`, "href")} class="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-primary-400 hover:text-primary-300"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "ri:edit-line", "class": "text-lg" })}
编辑
</a> <form method="POST" action="/api/admin/awards/delete" onsubmit="return confirm('确定删除这条奖状记录吗？');"> <input type="hidden" name="id"${addAttribute(award.id, "value")}> <button type="submit" class="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-500/40 hover:bg-red-500/15"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "ri:delete-bin-line", "class": "text-lg" })}
删除
</button> </form> </div> </div> </article>`)} </div>` : renderTemplate`<div class="rounded-3xl border border-dashed border-white/10 bg-dark-900/40 p-10 text-center"> <p class="text-lg font-medium text-white">还没有奖状记录</p> <p class="mt-3 text-sm text-gray-400">先在左侧表单上传第一张奖状，前台荣誉墙就会同步展示。</p> </div>`} </div> </div> </section> ` })}`;
}, "C:/Code/X_blog/src/pages/admin/awards.astro", void 0);

const $$file = "C:/Code/X_blog/src/pages/admin/awards.astro";
const $$url = "/admin/awards";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Awards,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
