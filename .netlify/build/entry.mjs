import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_DAq-1K0d.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin/awards.astro.mjs');
const _page3 = () => import('./pages/admin/login.astro.mjs');
const _page4 = () => import('./pages/admin.astro.mjs');
const _page5 = () => import('./pages/api/admin/awards/delete.astro.mjs');
const _page6 = () => import('./pages/api/admin/awards/save.astro.mjs');
const _page7 = () => import('./pages/api/admin/login.astro.mjs');
const _page8 = () => import('./pages/api/admin/logout.astro.mjs');
const _page9 = () => import('./pages/api/admin/session.astro.mjs');
const _page10 = () => import('./pages/api/awards/_id_.astro.mjs');
const _page11 = () => import('./pages/archive.astro.mjs');
const _page12 = () => import('./pages/awards.astro.mjs');
const _page13 = () => import('./pages/category/_category_.astro.mjs');
const _page14 = () => import('./pages/posts/_---slug_.astro.mjs');
const _page15 = () => import('./pages/tags/_tag_.astro.mjs');
const _page16 = () => import('./pages/_---page_.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/awards.astro", _page2],
    ["src/pages/admin/login.astro", _page3],
    ["src/pages/admin/index.astro", _page4],
    ["src/pages/api/admin/awards/delete.ts", _page5],
    ["src/pages/api/admin/awards/save.ts", _page6],
    ["src/pages/api/admin/login.ts", _page7],
    ["src/pages/api/admin/logout.ts", _page8],
    ["src/pages/api/admin/session.ts", _page9],
    ["src/pages/api/awards/[id].ts", _page10],
    ["src/pages/archive.astro", _page11],
    ["src/pages/awards.astro", _page12],
    ["src/pages/category/[category].astro", _page13],
    ["src/pages/posts/[...slug].astro", _page14],
    ["src/pages/tags/[tag].astro", _page15],
    ["src/pages/[...page].astro", _page16]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "9580b0fc-758a-4257-890c-d103a8950383"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
