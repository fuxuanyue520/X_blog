import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { isSupportedAwardUploadFile, prepareImageBuffer } from "@/lib/awards";

export const prerender = false;

const execFileAsync = promisify(execFile);
const OCR_SCRIPT_PATH = path.resolve(
	process.cwd(),
	"scripts",
	"award_ocr.py",
);

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
		},
	});
}

function getPythonExecutable() {
	return process.env.PYTHON_PATH || "python";
}

export const POST: APIRoute = async (context) => {
	const admin = await getAuthenticatedAdmin(context);
	if (!admin) {
		return json({ error: "未登录或登录已失效" }, 401);
	}

	const formData = await context.request.formData();
	const imageField = formData.get("image");

	if (!(imageField instanceof File) || imageField.size <= 0) {
		return json({ error: "请先上传荣誉图片或 PDF" }, 400);
	}

	if (!isSupportedAwardUploadFile(imageField)) {
		return json({ error: "仅支持图片或 PDF 文件" }, 400);
	}

	try {
		await fs.access(OCR_SCRIPT_PATH);
	} catch {
		return json({ error: "OCR 脚本不存在" }, 500);
	}

	const extension = ".jpg";
	const tempFilePath = path.join(os.tmpdir(), `award-ocr-${randomUUID()}${extension}`);

	try {
		const preparedImage = await prepareImageBuffer(imageField);
		await fs.writeFile(tempFilePath, preparedImage.buffer);

		const { stdout, stderr } = await execFileAsync(
			getPythonExecutable(),
			[OCR_SCRIPT_PATH, tempFilePath],
			{
				cwd: process.cwd(),
				env: {
					...process.env,
					PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK: "True",
					PYTHONIOENCODING: "utf-8",
				},
				maxBuffer: 10 * 1024 * 1024,
				windowsHide: true,
			},
		);

		const output = `${stdout}`.trim();
		if (!output) {
			return json(
				{
					error: stderr?.trim() || "OCR 没有返回任何结果",
				},
				500,
			);
		}

		let payload: { candidates?: unknown; error?: string };
		try {
			payload = JSON.parse(output);
		} catch {
			return json(
				{
					error: stderr?.trim() || output || "OCR 结果解析失败",
				},
				500,
			);
		}

		if (payload.error) {
			return json({ error: payload.error }, 500);
		}

		return json({
			candidates: Array.isArray(payload.candidates) ? payload.candidates : [],
		});
	} catch (error) {
		const message =
			error instanceof Error && error.message
				? error.message
				: "服务端 OCR 执行失败";
		return json({ error: message }, 500);
	} finally {
		await fs.rm(tempFilePath, { force: true }).catch(() => undefined);
	}
};
