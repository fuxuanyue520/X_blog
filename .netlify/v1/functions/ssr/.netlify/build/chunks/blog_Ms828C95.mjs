import { g as createComponent, m as maybeRenderHead, u as unescapeHTML, r as renderTemplate } from './astro/server_mSrCIW4D.mjs';
import 'kleur/colors';
import 'clsx';

const html = "<p>这是我为自己打造的个人博客系统，也是你现在看到的这个网站。</p>\n<h2 id=\"技术栈\">技术栈</h2>\n<ul>\n<li><strong>框架</strong>: Astro (SSG)</li>\n<li><strong>样式</strong>: Tailwind CSS</li>\n<li><strong>语言</strong>: TypeScript</li>\n<li><strong>图标</strong>: Iconify (Remix Icon)</li>\n</ul>\n<h2 id=\"开源地址\">开源地址</h2>\n<p><a href=\"https://github.com/fuxuanyue520/Blog\">GitHub</a></p>";

				const frontmatter = {"title":"Qiulan-Blog：我的个人博客系统","description":"基于 Astro + Tailwind CSS + TypeScript 打造的高性能个人博客。支持深色模式、Markdown 扩展、SEO 优化。","publishedAt":"2025-12-19T18:00:00","category":"project"};
				const file = "C:/Code/X_blog/src/content/posts/blog.md";
				const url = undefined;
				function rawContent() {
					return "\n这是我为自己打造的个人博客系统，也是你现在看到的这个网站。\n\n## 技术栈\n\n- **框架**: Astro (SSG)\n- **样式**: Tailwind CSS\n- **语言**: TypeScript\n- **图标**: Iconify (Remix Icon)\n\n## 开源地址\n\n[GitHub](https://github.com/fuxuanyue520/Blog)\n";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":2,"slug":"技术栈","text":"技术栈"},{"depth":2,"slug":"开源地址","text":"开源地址"}];
				}

				const Content = createComponent((result, _props, slots) => {
					const { layout, ...content } = frontmatter;
					content.file = file;
					content.url = url;

					return renderTemplate`${maybeRenderHead()}${unescapeHTML(html)}`;
				});

export { Content, compiledContent, Content as default, file, frontmatter, getHeadings, rawContent, url };
