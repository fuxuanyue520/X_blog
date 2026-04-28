export type AdminToastVariant = "success" | "error";

export interface AdminToastOptions {
	message: string;
	variant?: AdminToastVariant;
	title?: string;
	duration?: number;
}

function ensureStack(): HTMLElement {
	const existing = document.getElementById("notification-stack");
	if (existing instanceof HTMLElement) {
		applyStackPlacement(existing);
		return existing;
	}

	const stack = document.createElement("div");
	stack.id = "notification-stack";
	stack.className = "notification-stack";
	stack.setAttribute("aria-live", "polite");
	stack.setAttribute("aria-atomic", "false");
	applyStackPlacement(stack);
	document.body.appendChild(stack);
	return stack;
}

function applyStackPlacement(stack: HTMLElement) {
	stack.style.setProperty("position", "fixed");
	stack.style.setProperty("top", "5.5rem");
	stack.style.setProperty("right", "1rem");
	stack.style.setProperty("z-index", "99999");
	stack.style.setProperty("pointer-events", "none");
	stack.style.setProperty("display", "flex");
	stack.style.setProperty("flex-direction", "column");
	stack.style.setProperty("gap", "0.85rem");
	stack.style.setProperty("width", "min(calc(100vw - 2rem), 24rem)");
}

function removeToast(toast: HTMLElement): void {
	if (!(toast instanceof HTMLElement) || toast.dataset.leaving === "true") {
		return;
	}

	toast.dataset.leaving = "true";
	toast.classList.remove("is-entering");
	toast.classList.add("is-leaving");
	window.setTimeout(() => {
		toast.remove();
	}, 300);
}

/** 与导航栏通知相同的 DOM/class，依赖 Navbar 全局 notification 样式 */
export function showAdminToast({
	message,
	variant = "success",
	title,
	duration = 3000,
}: AdminToastOptions): HTMLElement | undefined {
	if (!message) {
		return;
	}

	const stack = ensureStack();
	const toast = document.createElement("section");
	const resolvedTitle =
		title ?? (variant === "error" ? "操作失败" : "操作成功");
	const icon =
		variant === "error"
			? '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 8v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1" fill="currentColor"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
			: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 7L9 18l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

	toast.className = `notification notification--${variant} is-entering`;
	toast.setAttribute("role", "status");
	toast.style.setProperty("--toast-duration", `${duration}ms`);
	toast.innerHTML = `
				<div class="notification__glow" aria-hidden="true"></div>
				<div class="notification__row">
					<div class="notification__icon" aria-hidden="true">${icon}</div>
					<div class="notification__content">
						<div class="notification__title"></div>
						<div class="notification__message"></div>
					</div>
					<button type="button" class="notification__close" aria-label="关闭通知">×</button>
				</div>
				<div class="notification__progress" aria-hidden="true"></div>
			`;
	const titleNode = toast.querySelector(".notification__title");
	if (titleNode instanceof HTMLElement) {
		titleNode.textContent = resolvedTitle;
	}
	const messageNode = toast.querySelector(".notification__message");
	if (messageNode instanceof HTMLElement) {
		messageNode.textContent = message;
	}

	const closeButton = toast.querySelector(".notification__close");
	if (closeButton instanceof HTMLButtonElement) {
		closeButton.addEventListener("click", () => removeToast(toast));
	}

	stack.appendChild(toast);

	const progress = toast.querySelector(".notification__progress");
	if (progress instanceof HTMLElement) {
		progress.style.display = "none";
	}

	window.setTimeout(() => removeToast(toast), duration);
	return toast;
}
