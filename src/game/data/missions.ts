import type { BgId } from "../../story/script";

export interface MissionTemplate {
  id: string;
  name: string;
  desc: string;
  /** 1..5 对应 D、C、B、A、S。 */
  rank: number;
  /** 推荐的队伍总战力。 */
  power: number;
  days: number;
  slots: number;
  funds: number;
  supplies: number;
  reputation: number;
  exp: number;
  enemies: string[];
  bg: BgId;
}

export const RANK_NAMES = ["D", "C", "B", "A", "S"];

export const MISSIONS: MissionTemplate[] = [
  { id: "patrol", name: "巡逻五车町", desc: "最近町里出现了可疑人物，加强夜间巡逻。", rank: 1, power: 140, days: 1, slots: 2, funds: 300, supplies: 20, reputation: 6, exp: 40, enemies: ["可疑的混混", "低级魔族"], bg: "academy_dusk" },
  { id: "escort", name: "护送物资车队", desc: "护送一批医疗物资穿过山道。", rank: 1, power: 180, days: 1, slots: 2, funds: 350, supplies: 45, reputation: 6, exp: 45, enemies: ["山贼", "魔兽"], bg: "academy" },
  { id: "purge", name: "清剿下级魔族", desc: "废弃工厂里聚集了一批下级魔族。", rank: 1, power: 220, days: 2, slots: 2, funds: 450, supplies: 25, reputation: 10, exp: 60, enemies: ["下级魔族", "食尸鬼"], bg: "city_night" },
  { id: "lab", name: "调查废弃研究所", desc: "据说有人在那里进行非法的魔族实验。", rank: 2, power: 320, days: 2, slots: 2, funds: 700, supplies: 50, reputation: 15, exp: 80, enemies: ["实验体", "警备机器人"], bg: "city_night" },
  { id: "club", name: "夜店潜入搜查", desc: "潜入一家与魔族交易的会员制夜店，取得交易账本。", rank: 2, power: 360, days: 2, slots: 2, funds: 800, supplies: 40, reputation: 18, exp: 85, enemies: ["保镖", "魔族打手"], bg: "city_night" },
  { id: "deserter", name: "追捕叛逃忍者", desc: "一名携带机密叛逃的忍者正在逃往港口。", rank: 2, power: 400, days: 2, slots: 2, funds: 900, supplies: 40, reputation: 20, exp: 90, enemies: ["叛逃忍者", "雇佣兵"], bg: "city_night" },
  { id: "convoy", name: "截击武器运输队", desc: "NOMAD 正在向东京运送一批魔导武器。", rank: 3, power: 600, days: 3, slots: 3, funds: 1500, supplies: 90, reputation: 30, exp: 130, enemies: ["NOMAD 士兵", "魔导装甲"], bg: "city_night" },
  { id: "rescue", name: "解救被困平民", desc: "一群平民被困在魔族占据的地下街。", rank: 3, power: 640, days: 2, slots: 3, funds: 1100, supplies: 60, reputation: 45, exp: 120, enemies: ["中级魔族", "魔虫群"], bg: "city_night" },
  { id: "rift", name: "封印魔界裂隙", desc: "郊外出现了通往魔界的裂隙，必须在扩大前封印。", rank: 3, power: 720, days: 3, slots: 3, funds: 1700, supplies: 100, reputation: 40, exp: 140, enemies: ["裂隙守卫", "魔界生物"], bg: "academy_dusk" },
  { id: "nomad", name: "突袭 NOMAD 据点", desc: "摧毁 NOMAD 在湾区的一处秘密据点。", rank: 4, power: 1000, days: 3, slots: 3, funds: 2600, supplies: 150, reputation: 70, exp: 200, enemies: ["NOMAD 精锐", "改造人"], bg: "city_night" },
  { id: "undercity", name: "地下都市侦察", desc: "深入魔族聚居的地下都市，摸清势力分布。", rank: 4, power: 1100, days: 4, slots: 3, funds: 3000, supplies: 160, reputation: 80, exp: 220, enemies: ["上级魔族", "魔族佣兵"], bg: "city_night" },
  { id: "noble", name: "迎击魔族贵族", desc: "一名魔族贵族带着部下越过了边界。", rank: 5, power: 1550, days: 4, slots: 3, funds: 5000, supplies: 250, reputation: 150, exp: 320, enemies: ["魔族贵族", "近卫骑士"], bg: "city_night" },
  { id: "oboro", name: "追查朧的阴谋", desc: "叛变的前对魔忍朧似乎在策划什么。", rank: 5, power: 1750, days: 5, slots: 3, funds: 6000, supplies: 300, reputation: 180, exp: 360, enemies: ["朧的部下", "傀儡忍者"], bg: "city_night" },
];

export const MISSION_BY_ID: Record<string, MissionTemplate> = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));
