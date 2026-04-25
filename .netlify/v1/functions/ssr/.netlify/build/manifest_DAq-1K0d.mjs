import '@astrojs/internal-helpers/path';
import 'cookie';
import 'kleur/colors';
import 'es-module-lexer';
import { x as NOOP_MIDDLEWARE_HEADER, y as decodeKey } from './chunks/astro/server_mSrCIW4D.mjs';
import 'clsx';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Code/X_blog/","adapterName":"@astrojs/netlify","routes":[{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"archive/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/archive","isIndex":false,"type":"page","pattern":"^\\/archive\\/?$","segments":[[{"content":"archive","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/archive.astro","pathname":"/archive","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B1Ukacwq.js"}],"styles":[{"type":"external","src":"/_astro/_page_.BNXM1brx.css"},{"type":"external","src":"/_astro/_page_.C0ONu7hG.css"}],"routeData":{"route":"/admin/awards","isIndex":false,"type":"page","pattern":"^\\/admin\\/awards\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"awards","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/awards.astro","pathname":"/admin/awards","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_page_.BNXM1brx.css"}],"routeData":{"route":"/admin/login","isIndex":false,"type":"page","pattern":"^\\/admin\\/login\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/login.astro","pathname":"/admin/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B1Ukacwq.js"}],"styles":[{"type":"external","src":"/_astro/_page_.BNXM1brx.css"},{"type":"external","src":"/_astro/_page_.C0ONu7hG.css"}],"routeData":{"route":"/admin","isIndex":true,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/index.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/awards/delete","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/awards\\/delete\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"awards","dynamic":false,"spread":false}],[{"content":"delete","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/awards/delete.ts","pathname":"/api/admin/awards/delete","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/awards/save","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/awards\\/save\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"awards","dynamic":false,"spread":false}],[{"content":"save","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/awards/save.ts","pathname":"/api/admin/awards/save","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/login.ts","pathname":"/api/admin/login","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/logout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/logout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"logout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/logout.ts","pathname":"/api/admin/logout","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/session","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/session\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"session","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/session.ts","pathname":"/api/admin/session","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/awards/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/awards\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"awards","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/awards/[id].ts","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.B1Ukacwq.js"}],"styles":[{"type":"external","src":"/_astro/_page_.BNXM1brx.css"},{"type":"external","src":"/_astro/awards.Duxddm0e.css"},{"type":"external","src":"/_astro/_page_.C0ONu7hG.css"}],"routeData":{"route":"/awards","isIndex":false,"type":"page","pattern":"^\\/awards\\/?$","segments":[[{"content":"awards","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/awards.astro","pathname":"/awards","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://xuanzai-blog.netlify.app","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/components/widgets/CategoryCard.astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/layouts/PageLayout.astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/[...page].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/about.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/about@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/archive.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/archive@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/awards.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/awards@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/category/[category].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/category/[category]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/posts/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/posts/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/tags/[tag].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/tags/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/components/widgets/StatsCard.astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/utils/markdown.ts",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/components/ArticleCard.astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/components/Navbar.astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/layouts/BaseLayout.astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/admin/awards.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/admin/awards@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/pages/admin/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/admin/index@_@astro",{"propagation":"in-tree","containsHead":false}],["C:/Code/X_blog/src/components/Banner.astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/admin/awards@_@astro":"pages/admin/awards.astro.mjs","\u0000@astro-page:src/pages/admin/login@_@astro":"pages/admin/login.astro.mjs","\u0000@astro-page:src/pages/admin/index@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/api/admin/awards/delete@_@ts":"pages/api/admin/awards/delete.astro.mjs","\u0000@astro-page:src/pages/api/admin/awards/save@_@ts":"pages/api/admin/awards/save.astro.mjs","\u0000@astro-page:src/pages/api/admin/login@_@ts":"pages/api/admin/login.astro.mjs","\u0000@astro-page:src/pages/api/admin/logout@_@ts":"pages/api/admin/logout.astro.mjs","\u0000@astro-page:src/pages/api/admin/session@_@ts":"pages/api/admin/session.astro.mjs","\u0000@astro-page:src/pages/api/awards/[id]@_@ts":"pages/api/awards/_id_.astro.mjs","\u0000@astro-page:src/pages/archive@_@astro":"pages/archive.astro.mjs","\u0000@astro-page:src/pages/awards@_@astro":"pages/awards.astro.mjs","\u0000@astro-page:src/pages/category/[category]@_@astro":"pages/category/_category_.astro.mjs","\u0000@astro-page:src/pages/posts/[...slug]@_@astro":"pages/posts/_---slug_.astro.mjs","\u0000@astro-page:src/pages/tags/[tag]@_@astro":"pages/tags/_tag_.astro.mjs","\u0000@astro-page:src/pages/[...page]@_@astro":"pages/_---page_.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DAq-1K0d.mjs","C:/Code/X_blog/src/content/posts/216_attendance.md?astroContentCollectionEntry=true":"chunks/216_attendance_CtOl1_Xl.mjs","C:/Code/X_blog/src/content/posts/acm-graph-theory-mastery.md?astroContentCollectionEntry=true":"chunks/acm-graph-theory-mastery_CmTiFqDg.mjs","C:/Code/X_blog/src/content/posts/blog.md?astroContentCollectionEntry=true":"chunks/blog_CE3tBjMt.mjs","C:/Code/X_blog/src/content/posts/rainy-night-thoughts.md?astroContentCollectionEntry=true":"chunks/rainy-night-thoughts_Cl-M9I4Z.mjs","C:/Code/X_blog/src/content/posts/share.md?astroContentCollectionEntry=true":"chunks/share_ZQlpogft.mjs","C:/Code/X_blog/src/content/posts/travel-log-tibet.md?astroContentCollectionEntry=true":"chunks/travel-log-tibet_wV8VeWbs.mjs","C:/Code/X_blog/src/content/posts/why-i-built-this-blog.md?astroContentCollectionEntry=true":"chunks/why-i-built-this-blog_Cozc72gb.mjs","C:/Code/X_blog/src/content/posts/216_attendance.md?astroPropagatedAssets":"chunks/216_attendance_DnpOY_0w.mjs","C:/Code/X_blog/src/content/posts/acm-graph-theory-mastery.md?astroPropagatedAssets":"chunks/acm-graph-theory-mastery_MbeabEPl.mjs","C:/Code/X_blog/src/content/posts/blog.md?astroPropagatedAssets":"chunks/blog_C-07EYfH.mjs","C:/Code/X_blog/src/content/posts/rainy-night-thoughts.md?astroPropagatedAssets":"chunks/rainy-night-thoughts_Dhy4MwQa.mjs","C:/Code/X_blog/src/content/posts/share.md?astroPropagatedAssets":"chunks/share_B5f0Q-Nq.mjs","C:/Code/X_blog/src/content/posts/travel-log-tibet.md?astroPropagatedAssets":"chunks/travel-log-tibet_NL0YxiJK.mjs","C:/Code/X_blog/src/content/posts/why-i-built-this-blog.md?astroPropagatedAssets":"chunks/why-i-built-this-blog_DhOJkn9s.mjs","\u0000astro:asset-imports":"chunks/_astro_asset-imports_D9aVaOQr.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BcEe_9wP.mjs","C:/Code/X_blog/src/content/posts/216_attendance.md":"chunks/216_attendance_DQ9DLGQ1.mjs","C:/Code/X_blog/src/content/posts/acm-graph-theory-mastery.md":"chunks/acm-graph-theory-mastery_BXlfODZc.mjs","C:/Code/X_blog/src/content/posts/blog.md":"chunks/blog_Ms828C95.mjs","C:/Code/X_blog/src/content/posts/rainy-night-thoughts.md":"chunks/rainy-night-thoughts_JKktabH4.mjs","C:/Code/X_blog/src/content/posts/share.md":"chunks/share_u7l0swwn.mjs","C:/Code/X_blog/src/content/posts/travel-log-tibet.md":"chunks/travel-log-tibet_BHWuLbjs.mjs","C:/Code/X_blog/src/content/posts/why-i-built-this-blog.md":"chunks/why-i-built-this-blog_tiIv3USZ.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.BsQwAK6J.js","@astrojs/react/client.js":"_astro/client.uNJO8lcC.js","/astro/hoisted.js?q=1":"_astro/hoisted.B1Ukacwq.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/_page_.BNXM1brx.css","/_astro/_page_.C0ONu7hG.css","/_astro/awards.Duxddm0e.css","/avatar.jpg","/favicon.svg","/videos/background.mp4","/images/image.png","/_astro/client.uNJO8lcC.js","/_astro/hoisted.B1Ukacwq.js","/_astro/hoisted.BsQwAK6J.js","/about/index.html","/archive/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"sgxFcIwapEw4bwwfLVizFrgy9vG4Zh078I29YU9pUtk=","experimentalEnvGetSecretEnabled":false});

export { manifest };
