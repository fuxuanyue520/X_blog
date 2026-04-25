import { g as createComponent, m as maybeRenderHead, u as unescapeHTML, r as renderTemplate } from './astro/server_mSrCIW4D.mjs';
import 'kleur/colors';
import 'clsx';

const html = "<video controls width=\"100%\" preload=\"metadata\" playsinline webkit-playsinline=\"\" x5-playsinline=\"\" x5-video-player-type=\"h5\" x5-video-player-fullscreen=\"true\" autoplay muted style=\"width: 100%; max-height: 80vh; object-fit: contain; background-color: #000; border-radius: 8px;\">\n  <source src=\"https://cloud.06dn.com/api/v3/share/preview/2JvvSX?path=null\" type=\"video/mp4\">\n  您的浏览器不支持视频标签。\n</video>\n<p><a href=\"https://cloud.06dn.com/s/2JvvSX/video?name=%E4%B8%80%E5%88%86%E9%92%9F%E5%88%86%E4%BA%AB%E4%BC%9A.mp4\">地址</a></p>";

				const frontmatter = {"title":"一分钟分享会（严冬已至，春有归期）","description":"一分钟分享会","publishedAt":"2025-12-21T23:00:00","category":"other","isPinned":true};
				const file = "C:/Code/X_blog/src/content/posts/share.md";
				const url = undefined;
				function rawContent() {
					return "\r\n<video controls width=\"100%\" preload=\"metadata\" playsinline webkit-playsinline x5-playsinline x5-video-player-type=\"h5\" x5-video-player-fullscreen=\"true\" autoplay muted style=\"width: 100%; max-height: 80vh; object-fit: contain; background-color: #000; border-radius: 8px;\">\r\n  <source src=\"https://cloud.06dn.com/api/v3/share/preview/2JvvSX?path=null\" type=\"video/mp4\">\r\n  您的浏览器不支持视频标签。\r\n</video>\r\n\r\n[地址](https://cloud.06dn.com/s/2JvvSX/video?name=%E4%B8%80%E5%88%86%E9%92%9F%E5%88%86%E4%BA%AB%E4%BC%9A.mp4)\r\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${maybeRenderHead()}${unescapeHTML(html)}`;
				});

export { Content, compiledContent, Content as default, file, frontmatter, getHeadings, rawContent, url };
