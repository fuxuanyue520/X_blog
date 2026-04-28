/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly MYSQL_HOST?: string;
	readonly MYSQL_PORT?: string;
	readonly MYSQL_USER?: string;
	readonly MYSQL_PASSWORD?: string;
	readonly MYSQL_DATABASE?: string;
}

interface Window {
	_wallpaperListenerAttached?: boolean;
}
