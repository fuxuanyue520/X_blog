import { g as createComponent, m as maybeRenderHead, u as unescapeHTML, r as renderTemplate } from './astro/server_mSrCIW4D.mjs';
import 'kleur/colors';
import 'clsx';

const html = "<p><a href=\"https://docs.qq.com/sheet/DU1ZpSXJEWmdxTnRw\">216 考勤</a></p>";

				const frontmatter = {"title":"216考勤","description":"216考勤在线文档","publishedAt":"2025-12-19T22:00:00","category":"other","isPinned":true};
				const file = "C:/Code/X_blog/src/content/posts/216_attendance.md";
				const url = undefined;
				function rawContent() {
					return "\n[216 考勤](https://docs.qq.com/sheet/DU1ZpSXJEWmdxTnRw)\n";
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
