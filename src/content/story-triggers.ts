import type { MainTrigger } from "../game/defs";

/** 主线剧情的触发条件，在每天结束时检查，满足且未看过就加入待播放列表。 */
export const MAIN_TRIGGERS: MainTrigger[] = [
  { scene: "main_week1", day: 7 },
  { scene: "main_rep200", reputation: 200 },
  { scene: "main_rep500", reputation: 500 },
  { scene: "main_rep1000", reputation: 1000 },
];
