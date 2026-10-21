import type { CharId } from "../game/types";
import type { BgId, CgId } from "../story/script";

export const portraitUrl = (id: CharId) => `/assets/portraits/${id}.png`;
export const bgUrl = (id: BgId) => `/assets/bg/${id}.png`;
export const cgUrl = (id: CgId) => `/assets/cg/${id}.png`;

// 开局日是 2082 年 4 月 1 日（周三，见 docs/lorebook/world.md），据此把游戏天数换算成「4月1日 周三」这样的日期。
const START = Date.UTC(2082, 3, 1);
const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export function dateOf(day: number) {
  const d = new Date(START + (day - 1) * 86_400_000);
  return { md: `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`, weekday: WEEKDAYS[d.getUTCDay()] };
}

export const fmt = (n: number) => Math.round(n).toLocaleString("zh-CN");
export const signed = (n: number) => (n >= 0 ? `+${fmt(n)}` : fmt(n));
