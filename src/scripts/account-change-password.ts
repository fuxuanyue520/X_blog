import { showAdminToast } from "@/scripts/admin-toast";
import { homeUrlWithAdminLoginPrompt } from "@/lib/admin-login-redirect";

const OK_REDIRECT = "/admin/account?auth=password_ok";
const TOAST_ERR_MS = 4000;

declare global {
	interface Window {
		__xBlogAccountPasswordSubmitBound?: boolean;
	}
}

async function handleSubmit(form: HTMLFormElement) {
	const submitBtn = form.querySelector('button[type="submit"]');
	const currentEl = form.elements.namedItem("currentPassword");
	const nextEl = form.elements.namedItem("newPassword");
	const confirmEl = form.elements.namedItem("confirmPassword");
	const current =
		currentEl instanceof HTMLInputElement ? currentEl.value.trim() : "";
	const next = nextEl instanceof HTMLInputElement ? nextEl.value : "";
	const confirm =
		confirmEl instanceof HTMLInputElement ? confirmEl.value : "";

	const toastErr = (title: string, message: string) => {
		showAdminToast({
			variant: "error",
			title,
			message,
			duration: TOAST_ERR_MS,
		});
	};

	if (!current) {
		toastErr("校验失败", "请填写当前密码。");
		return;
	}
	if (!next || !confirm) {
		toastErr("校验失败", "请填写新密码与确认密码。");
		return;
	}
	if (next.length < 8) {
		toastErr("校验失败", "新密码至少需要 8 位字符。");
		return;
	}
	if (next.length > 128) {
		toastErr("校验失败", "新密码过长，请缩短后再试。");
		return;
	}
	if (next !== confirm) {
		toastErr("校验失败", "两次输入的新密码不一致。");
		return;
	}
	if (next === current) {
		toastErr("校验失败", "新密码不能与当前密码相同。");
		return;
	}

	if (submitBtn instanceof HTMLButtonElement) {
		submitBtn.disabled = true;
	}

	try {
		const response = await fetch("/api/admin/account/change-password", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				currentPassword: current,
				newPassword: next,
				confirmPassword: confirm,
			}),
		});

		if (response.status === 401) {
			window.location.assign(
				homeUrlWithAdminLoginPrompt(
					`${window.location.pathname}${window.location.search}${window.location.hash}`,
				),
			);
			return;
		}

		let data: { ok?: boolean; error?: string } = {};
		try {
			data = (await response.json()) as typeof data;
		} catch {
			toastErr("修改失败", "服务器响应异常，请稍后重试。");
			return;
		}

		const serverErr = typeof data.error === "string" ? data.error.trim() : "";
		if (!response.ok || serverErr || data.ok !== true) {
			const msg =
				serverErr ||
				(response.ok ? "服务器未确认修改结果。" : "修改失败，请稍后重试。");
			const wrongCurrent =
				msg.includes("当前密码") || msg.includes("不正确");
			toastErr(wrongCurrent ? "密码错误" : "修改失败", msg);
			return;
		}

		window.location.assign(OK_REDIRECT);
	} catch {
		toastErr("修改失败", "网络异常，请稍后重试。");
	} finally {
		if (submitBtn instanceof HTMLButtonElement) {
			submitBtn.disabled = false;
		}
	}
}

function bindDelegation(): void {
	if (typeof document === "undefined") return;
	if (window.__xBlogAccountPasswordSubmitBound) {
		return;
	}
	window.__xBlogAccountPasswordSubmitBound = true;

	document.addEventListener(
		"submit",
		(event) => {
			const target = event.target;
			if (!(target instanceof HTMLFormElement)) return;
			if (!target.hasAttribute("data-account-password-form")) return;
			event.preventDefault();
			void handleSubmit(target);
		},
		true,
	);
}

export function mountAccountChangePasswordForm(): void {
	bindDelegation();
}
