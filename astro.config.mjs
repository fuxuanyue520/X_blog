import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import icon from "astro-icon";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

// Custom Remark plugin to transform ::note[...] into admonitions
function remarkAdmonitions() {
	return (tree) => {
		visit(tree, (node) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				if (
					["note", "tip", "important", "warning", "caution"].includes(node.name)
				) {
					const data = node.data || (node.data = {});
					const tagName = node.type === "textDirective" ? "span" : "div";

					data.hName = tagName;
					data.hProperties = {
						class: `admonition admonition-${node.name}`,
					};

					// Add icon/title manually if needed, or rely on CSS
					const titleNode = {
						type: "paragraph",
						data: {
							hName: "div",
							hProperties: { class: "admonition-title" },
						},
						children: [{ type: "text", value: node.name }],
					};

					node.children.unshift(titleNode);
				}

				if (node.name === "github") {
					const repo = node.attributes.repo;
					const data = node.data || (node.data = {});
					data.hName = "div";
					data.hProperties = {
						class: "github-card-placeholder",
						"data-repo": repo,
					};
					// We'll replace this with a real component or client-side script
				}
			}
		});
	};
}

// https://astro.build/config
export default defineConfig({
	integrations: [
		react(),
		tailwind(),
		mdx(),
		icon({
			include: {
				ri: ["*"], // Remix Icons
				ph: ["*"], // Phosphor Icons
			},
		}),
	],
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	markdown: {
		remarkPlugins: [remarkDirective, remarkAdmonitions],
	},
	compressHTML: true,
	build: {
		inlineStylesheets: "auto",
	},
	vite: {
		server: {
			watch: {
				// Node 24 + Windows occasionally throws EBADF with fs.watch.
				// Polling avoids relying on native watcher handles.
				usePolling: true,
				interval: 300,
			},
		},
		build: {
			cssCodeSplit: true,
		},
	},
});
