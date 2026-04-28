import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

export function formatDate(
	date: string | Date,
	formatStr: string = "yyyy年MM月dd日",
): string {
	const d =
		typeof date === "string"
			? (() => {
					const parsed = parseISO(date);
					return Number.isNaN(parsed.getTime())
						? new Date(date)
						: parsed;
				})()
			: date;
	if (Number.isNaN(d.getTime())) {
		return "日期待定";
	}
	return format(d, formatStr, { locale: zhCN });
}
