import { g as createComponent, m as maybeRenderHead, j as renderComponent, r as renderTemplate, A as AstroError, k as UnknownContentCollectionError, l as renderUniqueStylesheet, n as renderScriptElement, o as createHeadAndContent, u as unescapeHTML, i as addAttribute, f as createAstro, p as renderSlot, q as createTransitionScope, t as renderTransition } from './astro/server_mSrCIW4D.mjs';
import 'kleur/colors';
import { $ as $$Icon, a as $$BaseLayout } from './BaseLayout_Col_CNTh.mjs';
import { Traverse } from 'neotraverse/modern';
import pLimit from 'p-limit';
import { removeBase, prependForwardSlash } from '@astrojs/internal-helpers/path';
import { a as isCoreRemotePath, V as VALID_INPUT_FORMATS } from './astro/assets-service_BW1D5zC8.mjs';
import * as devalue from 'devalue';
/* empty css                          */

const $$ProfileCard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="bg-dark-800 rounded-xl p-4 lg:p-6 shadow-lg border border-white/5 flex flex-col items-center text-center group hover:border-primary-500/30 transition-colors"> <div class="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-dark-700 mb-3 lg:mb-4 shadow-xl group-hover:scale-105 transition-transform duration-300 relative animate-scale-in"> <div class="absolute inset-0 bg-black/10"></div> <img src="/avatar.jpg" alt="Profile" class="w-full h-full object-cover"> </div> <h2 class="text-xl lg:text-2xl font-serif font-bold text-white mb-2 lg:mb-3 animate-fade-in-up stagger-1">秋兰以为佩</h2> <div class="mb-3 lg:mb-4 w-full px-2 animate-fade-in-up stagger-2"> <div class="text-gray-300 text-sm lg:text-base leading-relaxed font-serif italic opacity-90 flex flex-col gap-1 max-w-[160px] lg:max-w-[200px] mx-auto"> <span class="self-start text-left">"扈江离与辟芷兮，</span> <span class="self-end text-right">纫秋兰以为佩。"</span> </div> </div> <div class="flex gap-2 lg:gap-3 mt-1 animate-fade-in-up stagger-3"> <a href="https://github.com/fuxuanyue520" class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all shadow-md group/icon hover-lift"> ${renderComponent($$result, "Icon", $$Icon, { "name": "ri:github-fill", "class": "text-xl lg:text-2xl group-hover/icon:scale-110 transition-transform" })} </a> <a href="mailto:2417275843@qq.com" class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all shadow-md group/icon hover-lift"> ${renderComponent($$result, "Icon", $$Icon, { "name": "ri:mail-send-fill", "class": "text-xl lg:text-2xl group-hover/icon:scale-110 transition-transform" })} </a> </div> </div>`;
}, "C:/Code/X_blog/src/components/widgets/ProfileCard.astro", void 0);

const CONTENT_IMAGE_FLAG = "astroContentImageFlag";
const IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";

function imageSrcToImportId(imageSrc, filePath) {
  imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);
  if (isCoreRemotePath(imageSrc)) {
    return;
  }
  const ext = imageSrc.split(".").at(-1);
  if (!ext || !VALID_INPUT_FORMATS.includes(ext)) {
    return;
  }
  const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
  if (filePath) {
    params.set("importer", filePath);
  }
  return `${imageSrc}?${params.toString()}`;
}

class DataStore {
  _collections = /* @__PURE__ */ new Map();
  constructor() {
    this._collections = /* @__PURE__ */ new Map();
  }
  get(collectionName, key) {
    return this._collections.get(collectionName)?.get(String(key));
  }
  entries(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.entries()];
  }
  values(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.values()];
  }
  keys(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.keys()];
  }
  has(collectionName, key) {
    const collection = this._collections.get(collectionName);
    if (collection) {
      return collection.has(String(key));
    }
    return false;
  }
  hasCollection(collectionName) {
    return this._collections.has(collectionName);
  }
  collections() {
    return this._collections;
  }
  /**
   * Attempts to load a DataStore from the virtual module.
   * This only works in Vite.
   */
  static async fromModule() {
    try {
      const data = await import('./_astro_data-layer-content_BcEe_9wP.mjs');
      if (data.default instanceof Map) {
        return DataStore.fromMap(data.default);
      }
      const map = devalue.unflatten(data.default);
      return DataStore.fromMap(map);
    } catch {
    }
    return new DataStore();
  }
  static async fromMap(data) {
    const store = new DataStore();
    store._collections = data;
    return store;
  }
}
function dataStoreSingleton() {
  let instance = void 0;
  return {
    get: async () => {
      if (!instance) {
        instance = DataStore.fromModule();
      }
      return instance;
    },
    set: (store) => {
      instance = store;
    }
  };
}
const globalDataStore = dataStoreSingleton();

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://xuanzai-blog.netlify.app", "SSR": true};
function createCollectionToGlobResultMap({
  globResult,
  contentDir
}) {
  const collectionToGlobResultMap = {};
  for (const key in globResult) {
    const keyRelativeToContentDir = key.replace(new RegExp(`^${contentDir}`), "");
    const segments = keyRelativeToContentDir.split("/");
    if (segments.length <= 1) continue;
    const collection = segments[0];
    collectionToGlobResultMap[collection] ??= {};
    collectionToGlobResultMap[collection][key] = globResult[key];
  }
  return collectionToGlobResultMap;
}
function createGetCollection({
  contentCollectionToEntryMap,
  dataCollectionToEntryMap,
  getRenderEntryImport,
  cacheEntriesByCollection
}) {
  return async function getCollection(collection, filter) {
    const hasFilter = typeof filter === "function";
    const store = await globalDataStore.get();
    let type;
    if (collection in contentCollectionToEntryMap) {
      type = "content";
    } else if (collection in dataCollectionToEntryMap) {
      type = "data";
    } else if (store.hasCollection(collection)) {
      const { default: imageAssetMap } = await import('./_astro_asset-imports_D9aVaOQr.mjs');
      const result = [];
      for (const rawEntry of store.values(collection)) {
        const data = updateImageReferencesInData(rawEntry.data, rawEntry.filePath, imageAssetMap);
        const entry = {
          ...rawEntry,
          data,
          collection
        };
        if (hasFilter && !filter(entry)) {
          continue;
        }
        result.push(entry);
      }
      return result;
    } else {
      console.warn(
        `The collection ${JSON.stringify(
          collection
        )} does not exist or is empty. Ensure a collection directory with this name exists.`
      );
      return [];
    }
    const lazyImports = Object.values(
      type === "content" ? contentCollectionToEntryMap[collection] : dataCollectionToEntryMap[collection]
    );
    let entries = [];
    if (!Object.assign(__vite_import_meta_env__, { Path: process.env.Path })?.DEV && cacheEntriesByCollection.has(collection)) {
      entries = cacheEntriesByCollection.get(collection);
    } else {
      const limit = pLimit(10);
      entries = await Promise.all(
        lazyImports.map(
          (lazyImport) => limit(async () => {
            const entry = await lazyImport();
            return type === "content" ? {
              id: entry.id,
              slug: entry.slug,
              body: entry.body,
              collection: entry.collection,
              data: entry.data,
              async render() {
                return render({
                  collection: entry.collection,
                  id: entry.id,
                  renderEntryImport: await getRenderEntryImport(collection, entry.slug)
                });
              }
            } : {
              id: entry.id,
              collection: entry.collection,
              data: entry.data
            };
          })
        )
      );
      cacheEntriesByCollection.set(collection, entries);
    }
    if (hasFilter) {
      return entries.filter(filter);
    } else {
      return entries.slice();
    }
  };
}
function updateImageReferencesInData(data, fileName, imageAssetMap) {
  return new Traverse(data).map(function(ctx, val) {
    if (typeof val === "string" && val.startsWith(IMAGE_IMPORT_PREFIX)) {
      const src = val.replace(IMAGE_IMPORT_PREFIX, "");
      const id = imageSrcToImportId(src, fileName);
      if (!id) {
        ctx.update(src);
        return;
      }
      const imported = imageAssetMap?.get(id);
      if (imported) {
        ctx.update(imported);
      } else {
        ctx.update(src);
      }
    }
  });
}
async function render({
  collection,
  id,
  renderEntryImport
}) {
  const UnexpectedRenderError = new AstroError({
    ...UnknownContentCollectionError,
    message: `Unexpected error while rendering ${String(collection)} → ${String(id)}.`
  });
  if (typeof renderEntryImport !== "function") throw UnexpectedRenderError;
  const baseMod = await renderEntryImport();
  if (baseMod == null || typeof baseMod !== "object") throw UnexpectedRenderError;
  const { default: defaultMod } = baseMod;
  if (isPropagatedAssetsModule(defaultMod)) {
    const { collectedStyles, collectedLinks, collectedScripts, getMod } = defaultMod;
    if (typeof getMod !== "function") throw UnexpectedRenderError;
    const propagationMod = await getMod();
    if (propagationMod == null || typeof propagationMod !== "object") throw UnexpectedRenderError;
    const Content = createComponent({
      factory(result, baseProps, slots) {
        let styles = "", links = "", scripts = "";
        if (Array.isArray(collectedStyles)) {
          styles = collectedStyles.map((style) => {
            return renderUniqueStylesheet(result, {
              type: "inline",
              content: style
            });
          }).join("");
        }
        if (Array.isArray(collectedLinks)) {
          links = collectedLinks.map((link) => {
            return renderUniqueStylesheet(result, {
              type: "external",
              src: prependForwardSlash(link)
            });
          }).join("");
        }
        if (Array.isArray(collectedScripts)) {
          scripts = collectedScripts.map((script) => renderScriptElement(script)).join("");
        }
        let props = baseProps;
        if (id.endsWith("mdx")) {
          props = {
            components: propagationMod.components ?? {},
            ...baseProps
          };
        }
        return createHeadAndContent(
          unescapeHTML(styles + links + scripts),
          renderTemplate`${renderComponent(
            result,
            "Content",
            propagationMod.Content,
            props,
            slots
          )}`
        );
      },
      propagation: "self"
    });
    return {
      Content,
      headings: propagationMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: propagationMod.frontmatter ?? {}
    };
  } else if (baseMod.Content && typeof baseMod.Content === "function") {
    return {
      Content: baseMod.Content,
      headings: baseMod.getHeadings?.() ?? [],
      remarkPluginFrontmatter: baseMod.frontmatter ?? {}
    };
  } else {
    throw UnexpectedRenderError;
  }
}
function isPropagatedAssetsModule(module) {
  return typeof module === "object" && module != null && "__astroPropagation" in module;
}

// astro-head-inject

const contentDir = '/src/content/';

const contentEntryGlob = /* #__PURE__ */ Object.assign({"/src/content/posts/216_attendance.md": () => import('./216_attendance_CtOl1_Xl.mjs'),"/src/content/posts/acm-graph-theory-mastery.md": () => import('./acm-graph-theory-mastery_CmTiFqDg.mjs'),"/src/content/posts/blog.md": () => import('./blog_CE3tBjMt.mjs'),"/src/content/posts/rainy-night-thoughts.md": () => import('./rainy-night-thoughts_Cl-M9I4Z.mjs'),"/src/content/posts/share.md": () => import('./share_ZQlpogft.mjs'),"/src/content/posts/travel-log-tibet.md": () => import('./travel-log-tibet_wV8VeWbs.mjs'),"/src/content/posts/why-i-built-this-blog.md": () => import('./why-i-built-this-blog_Cozc72gb.mjs')});
const contentCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: contentEntryGlob,
	contentDir,
});

const dataEntryGlob = /* #__PURE__ */ Object.assign({});
const dataCollectionToEntryMap = createCollectionToGlobResultMap({
	globResult: dataEntryGlob,
	contentDir,
});
createCollectionToGlobResultMap({
	globResult: { ...contentEntryGlob, ...dataEntryGlob },
	contentDir,
});

let lookupMap = {};
lookupMap = {"posts":{"type":"content","entries":{"blog":"/src/content/posts/blog.md","216_attendance":"/src/content/posts/216_attendance.md","rainy-night-thoughts":"/src/content/posts/rainy-night-thoughts.md","share":"/src/content/posts/share.md","acm-graph-theory-mastery":"/src/content/posts/acm-graph-theory-mastery.md","travel-log-tibet":"/src/content/posts/travel-log-tibet.md","why-i-built-this-blog":"/src/content/posts/why-i-built-this-blog.md"}}};

new Set(Object.keys(lookupMap));

function createGlobLookup(glob) {
	return async (collection, lookupId) => {
		const filePath = lookupMap[collection]?.entries[lookupId];

		if (!filePath) return undefined;
		return glob[collection][filePath];
	};
}

const renderEntryGlob = /* #__PURE__ */ Object.assign({"/src/content/posts/216_attendance.md": () => import('./216_attendance_DnpOY_0w.mjs'),"/src/content/posts/acm-graph-theory-mastery.md": () => import('./acm-graph-theory-mastery_MbeabEPl.mjs'),"/src/content/posts/blog.md": () => import('./blog_C-07EYfH.mjs'),"/src/content/posts/rainy-night-thoughts.md": () => import('./rainy-night-thoughts_Dhy4MwQa.mjs'),"/src/content/posts/share.md": () => import('./share_B5f0Q-Nq.mjs'),"/src/content/posts/travel-log-tibet.md": () => import('./travel-log-tibet_NL0YxiJK.mjs'),"/src/content/posts/why-i-built-this-blog.md": () => import('./why-i-built-this-blog_DhOJkn9s.mjs')});
const collectionToRenderEntryMap = createCollectionToGlobResultMap({
	globResult: renderEntryGlob,
	contentDir,
});

const cacheEntriesByCollection = new Map();
const getCollection = createGetCollection({
	contentCollectionToEntryMap,
	dataCollectionToEntryMap,
	getRenderEntryImport: createGlobLookup(collectionToRenderEntryMap),
	cacheEntriesByCollection,
});

const $$CategoryCard = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getCollection("posts");
  const categoryCount = allPosts.reduce((acc, post) => {
    const cat = post.data.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const categoryMap = {
    "tech": "\u6280\u672F",
    "essay": "\u968F\u7B14",
    "project": "\u9879\u76EE",
    "other": "\u5176\u4ED6"
  };
  const categoryIconMap = {
    "tech": "ri:code-box-line",
    "essay": "ri:quill-pen-line",
    "project": "ri:stack-line",
    "other": "ri:more-fill"
  };
  return renderTemplate`${maybeRenderHead()}<div class="bg-dark-800 rounded-xl p-3 lg:p-5 shadow-lg border border-white/5 group hover:border-primary-500/30 transition-colors"> <div class="flex items-center gap-1 mb-2 lg:mb-3 text-primary-400 font-bold border-l-4 border-primary-500 pl-2 text-lg lg:text-xl"> ${renderComponent($$result, "Icon", $$Icon, { "name": "ri:folder-2-line" })} <span>分类</span> </div> <div class="flex flex-col gap-1 lg:gap-2"> ${Object.entries(categoryCount).map(([slug, count], index) => renderTemplate`<a${addAttribute(`/category/${slug}`, "href")} class="flex items-center justify-between p-1.5 lg:p-2 rounded-lg hover:bg-dark-700 transition-colors group/item animate-slide-in-right"${addAttribute(`animation-delay: ${(index + 1) * 100}ms`, "style")}> <span class="text-gray-300 text-sm lg:text-base group-hover/item:text-primary-400 transition-colors flex items-center gap-2"> ${renderComponent($$result, "Icon", $$Icon, { "name": categoryIconMap[slug] || "ri:folder-line", "class": "text-primary-500" })} ${categoryMap[slug] || slug} </span> <span class="bg-dark-700 text-primary-400 text-xs lg:text-sm px-1.5 py-0.5 rounded-full group-hover/item:bg-primary-500 group-hover/item:text-white transition-colors"> ${count} </span> </a>`)} </div> </div>`;
}, "C:/Code/X_blog/src/components/widgets/CategoryCard.astro", void 0);

const $$StatsCard = createComponent(async ($$result, $$props, $$slots) => {
  const allPosts = await getCollection("posts");
  const postCount = allPosts.length;
  const categories = new Set(allPosts.map((p) => p.data.category));
  const categoryCount = categories.size;
  const wordCount = allPosts.reduce((acc, post) => acc + post.body.length, 0);
  const startDate = /* @__PURE__ */ new Date("2025-12-19");
  const today = /* @__PURE__ */ new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const runDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  return renderTemplate`${maybeRenderHead()}<div class="bg-dark-800 rounded-xl p-3 lg:p-5 shadow-lg border border-white/5 group hover:border-primary-500/30 transition-colors"> <div class="flex items-center gap-1 mb-2 lg:mb-3 text-primary-400 font-bold border-l-4 border-primary-500 pl-2 text-lg lg:text-xl"> ${renderComponent($$result, "Icon", $$Icon, { "name": "ri:bar-chart-box-line" })} <span>站点统计</span> </div> <div class="space-y-2 lg:space-y-3"> <div class="flex justify-between items-center text-sm lg:text-base animate-slide-in-left stagger-1"> <span class="text-gray-300 flex items-center gap-2">${renderComponent($$result, "Icon", $$Icon, { "name": "ri:article-line", "class": "text-primary-500" })} 文章</span> <span class="text-white font-mono">${postCount}</span> </div> <div class="flex justify-between items-center text-sm lg:text-base animate-slide-in-left stagger-2"> <span class="text-gray-300 flex items-center gap-2">${renderComponent($$result, "Icon", $$Icon, { "name": "ri:folder-line", "class": "text-primary-500" })} 分类</span> <span class="text-white font-mono">${categoryCount}</span> </div> <div class="flex justify-between items-center text-sm lg:text-base animate-slide-in-left stagger-3"> <span class="text-gray-300 flex items-center gap-2">${renderComponent($$result, "Icon", $$Icon, { "name": "ri:file-text-line", "class": "text-primary-500" })} 总字数</span> <span class="text-white font-mono">${Math.round(wordCount / 1e3)}k</span> </div> <div class="flex justify-between items-center text-sm lg:text-base animate-slide-in-left stagger-4"> <span class="text-gray-300 flex items-center gap-2">${renderComponent($$result, "Icon", $$Icon, { "name": "ri:time-line", "class": "text-primary-500" })} 运行天数</span> <span class="text-white font-mono">${runDays}</span> </div> </div> </div>`;
}, "C:/Code/X_blog/src/components/widgets/StatsCard.astro", void 0);

const $$Astro = createAstro("https://xuanzai-blog.netlify.app");
const $$PageLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageLayout;
  const { title, description, showBanner = true } = Astro2.props;
  const hasSidebarSlot = Astro2.slots.has("sidebar");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "description": description, "showBanner": showBanner }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="grid grid-cols-1 lg:grid-cols-12 gap-4 relative"> <!-- Left Sidebar (Desktop: Left, Mobile: Bottom) --> <!-- order-2 on mobile ensures it comes after content, lg:order-1 puts it back on left --> <div class="order-2 lg:order-1 lg:col-span-3 space-y-3 translate-y-4 animate-fade-in-up stagger-1"> <div class="lg:sticky lg:top-24"> ${hasSidebarSlot ? renderTemplate`${renderSlot($$result2, $$slots["sidebar"])}` : renderTemplate`<div class="space-y-3"${addAttribute(createTransitionScope($$result2, "4uvesxej"), "data-astro-transition-persist")}> ${renderComponent($$result2, "ProfileCard", $$ProfileCard, {})} ${renderComponent($$result2, "StatsCard", $$StatsCard, {})} ${renderComponent($$result2, "CategoryCard", $$CategoryCard, {})} </div>`} </div> </div> <!-- Main Content (Desktop: Right, Mobile: Top) --> <!-- order-1 on mobile ensures it comes first, lg:order-2 puts it on right --> <div class="order-1 lg:order-2 lg:col-span-9 translate-y-4 animate-fade-in-up stagger-2"${addAttribute(renderTransition($$result2, "fxjvrhaf"), "data-astro-transition-scope")}> ${renderSlot($$result2, $$slots["default"])} </div> </div> ` })}`;
}, "C:/Code/X_blog/src/layouts/PageLayout.astro", "self");

export { $$PageLayout as $, getCollection as g };
