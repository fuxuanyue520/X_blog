/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly LIBSQL_URL?: string;
	readonly LIBSQL_AUTH_TOKEN?: string;
}

interface Window {
  _wallpaperListenerAttached?: boolean;
}
