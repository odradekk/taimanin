import type { FacilityId } from "../types";

export interface FacilityDef {
  id: FacilityId;
  name: string;
  desc: string;
  /** upgrades[n] 是从 n 级升到 n+1 级的花费和工期。 */
  upgrades: { funds: number; supplies: number; days: number }[];
  /** 某个等级下的效果说明。 */
  effect: (level: number) => string;
}

export const MAX_FACILITY_LEVEL = 5;

const costs = (rows: [number, number, number][]) =>
  rows.map(([funds, supplies, days]) => ({ funds, supplies, days }));

// 各设施在各等级的数值效果，规则和界面共用。
export const hallIncome = (lv: number) => 200 + 150 * lv;
export const hallReputation = (lv: number) => lv;
export const dojoMultiplier = (lv: number) => 1 + 0.15 * (lv - 1);
export const labMultiplier = (lv: number) => 1 + 0.15 * lv;
export const infirmaryRecovery = (lv: number) => 15 + 5 * lv;
export const dormCapacity = (lv: number) => lv + 3;
export const intelBoardSize = (lv: number) => 2 + lv;
export const intelMaxRank = (lv: number) => Math.min(5, 1 + lv);

export const FACILITIES: Record<FacilityId, FacilityDef> = {
  hall: {
    id: "hall", name: "教学楼", desc: "学园的门面。学生越多，学费和政府拨款越多。",
    upgrades: costs([[0, 0, 0], [1500, 40, 2], [3500, 80, 3], [7000, 150, 4], [12000, 250, 5]]),
    effect: (lv) => `每日资金 +${hallIncome(lv)}，声望 +${hallReputation(lv)}`,
  },
  dojo: {
    id: "dojo", name: "训练场", desc: "体能训练和实战对练的场地。器材越好，训练效果越好。",
    upgrades: costs([[0, 0, 0], [1200, 50, 2], [3000, 100, 3], [6000, 180, 4], [10000, 300, 5]]),
    effect: (lv) => `训练效果 ×${dojoMultiplier(lv).toFixed(2)}`,
  },
  lab: {
    id: "lab", name: "忍术研究所", desc: "研究忍法原理的设施。建成后可进行忍术修行。",
    upgrades: costs([[1000, 40, 2], [2500, 90, 3], [5000, 160, 3], [9000, 240, 4], [14000, 320, 5]]),
    effect: (lv) => (lv === 0 ? "未建成，无法进行忍术修行" : `解锁忍术修行，忍术成长 ×${labMultiplier(lv).toFixed(2)}`),
  },
  infirmary: {
    id: "infirmary", name: "医务室", desc: "负责伤员治疗和日常调理。",
    upgrades: costs([[0, 0, 0], [1000, 40, 2], [2500, 80, 3], [5000, 150, 3], [8000, 220, 4]]),
    effect: (lv) => `待命成员每日疲劳 -${infirmaryRecovery(lv)}${lv >= 3 ? "，伤势恢复加快" : ""}`,
  },
  dorm: {
    id: "dorm", name: "宿舍", desc: "对魔忍们的住处。房间越多，能招募的人越多。",
    upgrades: costs([[0, 0, 0], [800, 30, 1], [2000, 60, 2], [4500, 120, 3], [8000, 200, 4]]),
    effect: (lv) => `队伍上限 ${dormCapacity(lv)} 人`,
  },
  intel: {
    id: "intel", name: "情报室", desc: "收集各地魔族和犯罪组织的情报，提供任务委托。",
    upgrades: costs([[1200, 30, 2], [2800, 70, 3], [5500, 140, 3], [9000, 220, 4], [14000, 300, 5]]),
    effect: (lv) => `任务栏 ${intelBoardSize(lv)} 个，最高难度 ${"DCBAS"[intelMaxRank(lv) - 1]}，任务奖励 +${lv * 5}%`,
  },
};

export const FACILITY_ORDER: FacilityId[] = ["hall", "dojo", "lab", "infirmary", "dorm", "intel"];
