import type { APIRoute } from "astro";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { parseMarkdownImportFile } from "@/lib/articles";

export const prerender = false;

function json(body: Record<string, unknown>, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
		},
	});
}

export const POST: APIRoute = async (context) => {
	const admin = await getAuthenticatedAdmin(context);

	if (!admin) {
		return json({ message: "未登录" }, 401);
	}

	const formData = await context.request.formData();
	const file = formData.get("file");

	if (!(file instanceof File) || file.size <= 0) {
		return json({ message: "请选择 Markdown 文件" }, 400);
	}

	if (!/\.(md|markdown)$/i.test(file.name)) {
		return json({ message: "仅支持导入 .md 或 .markdown 文件" }, 400);
	}

	try {
		const parsed = await parseMarkdownImportFile(file);
		return json({ data: parsed });
	} catch (error) {
		const message =
			error instanceof Error && error.message
				? error.message
				: "Markdown 解析失败";
		return json({ message }, 400);
	}
};
