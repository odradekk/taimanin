import type { MissionTemplate } from "../game/defs";


export const RANK_NAMES = ["D", "C", "B", "A", "S"];

export const MISSIONS: MissionTemplate[] = [
  { id: "patrol", name: "巡逻五车町", desc: "最近町里出现了可疑人物，加强夜间巡逻。", rank: 1, power: 140, days: 1, slots: 2, funds: 300, supplies: 20, reputation: 6, enemies: ["可疑的混混", "低级魔族"], bg: "academy_dusk" },
  { id: "escort", name: "护送物资车队", desc: "护送一批医疗物资穿过山道。", rank: 1, power: 180, days: 1, slots: 2, funds: 350, supplies: 45, reputation: 6, enemies: ["山贼", "魔兽"], bg: "academy" },
  { id: "purge", name: "清剿下级魔族", desc: "废弃工厂里聚集了一批下级魔族。", rank: 1, power: 220, days: 2, slots: 2, funds: 450, supplies: 25, reputation: 10, enemies: ["下级魔族", "食人鬼"], bg: "city_night" },
  { id: "lab", name: "调查废弃研究所", desc: "据说有人在那里进行非法的魔族实验。", rank: 2, power: 320, days: 2, slots: 2, funds: 700, supplies: 50, reputation: 15, enemies: ["实验体", "警备机器人"], bg: "city_night" },
  { id: "club", name: "夜店潜入搜查", desc: "潜入千崎一家与魔族交易的会员制夜店，取得交易账本。", rank: 2, power: 360, days: 2, slots: 2, funds: 800, supplies: 40, reputation: 18, enemies: ["保镖", "魔族打手"], bg: "city_night" },
  { id: "deserter", name: "追捕脱队者", desc: "一名携带机密的脱队者正在逃往千崎港口。", rank: 2, power: 400, days: 2, slots: 2, funds: 900, supplies: 40, reputation: 20, enemies: ["脱队者", "雇佣兵"], bg: "city_night" },
  { id: "convoy", name: "截击魔导武器走私", desc: "一批魔导武器正运往东京王国，货主是诺玛德旗下的一家空壳公司。", rank: 3, power: 600, days: 3, slots: 3, funds: 1500, supplies: 90, reputation: 30, enemies: ["武装走私犯", "魔导装甲"], bg: "city_night" },
  { id: "rescue", name: "解救被困平民", desc: "一群平民被困在东京王国一条被魔族占据的地下街。", rank: 3, power: 640, days: 2, slots: 3, funds: 1100, supplies: 60, reputation: 45, enemies: ["中级魔族", "魔虫群"], bg: "city_night" },
  { id: "rift", name: "镇守小型魔界之门", desc: "郊外开启了一处能量微弱的小型魔界之门。在阴阳师完成封印之前，挡住从门里出来的魔物。", rank: 3, power: 720, days: 3, slots: 3, funds: 1700, supplies: 100, reputation: 40, enemies: ["越境魔族", "魔界生物"], bg: "academy_dusk" },
  { id: "nomad", name: "清剿东京王国走私据点", desc: "东京王国一处魔药与人口买卖的中转仓库，背后有诺玛德的资金。只能以清剿犯罪集团的名义行动。", rank: 4, power: 1000, days: 3, slots: 3, funds: 2600, supplies: 150, reputation: 70, enemies: ["武装佣兵", "肉体改造的打手"], bg: "city_night" },
  { id: "undercity", name: "黄泉原外围侦察", desc: "潜入黄泉原外围，摸清诺玛德在地下都市的势力分布。", rank: 4, power: 1100, days: 4, slots: 3, funds: 3000, supplies: 160, reputation: 80, enemies: ["上级魔族", "魔族佣兵"], bg: "city_night" },
  { id: "noble", name: "迎击魔族贵族", desc: "一名魔族贵族带着部下穿过魔界之门，进入了人界。", rank: 5, power: 1550, days: 4, slots: 3, funds: 5000, supplies: 250, reputation: 150, enemies: ["魔族贵族", "近卫骑士"], bg: "city_night" },
  { id: "oboro", name: "追查胧的踪迹", desc: "诺玛德麾下的敌对忍者部队又有动作，头目胧的踪迹出现在东京王国。", rank: 5, power: 1750, days: 5, slots: 3, funds: 6000, supplies: 300, reputation: 180, enemies: ["敌对忍者", "胧的傀儡"], bg: "city_night" },
];

/** 营救任务：成员被俘后由情报室定位生成，比被俘时的任务高一级，不会过期。 */
export const RESCUE_MISSIONS: MissionTemplate[] = [
  { id: "rescue_2", rescue: true, name: "营救被俘的同伴", desc: "情报室查到了被俘成员的关押地点。必须在她被彻底侵蚀之前把人救回来。", rank: 2, power: 400, days: 2, slots: 3, funds: 0, supplies: 0, reputation: 20, enemies: ["看守", "雇佣兵"], bg: "city_night" },
  { id: "rescue_3", rescue: true, name: "营救被俘的同伴", desc: "情报室查到了被俘成员的关押地点。必须在她被彻底侵蚀之前把人救回来。", rank: 3, power: 720, days: 2, slots: 3, funds: 0, supplies: 0, reputation: 30, enemies: ["中级魔族", "武装走私犯"], bg: "city_night" },
  { id: "rescue_4", rescue: true, name: "营救被俘的同伴", desc: "情报室查到了被俘成员的关押地点。必须在她被彻底侵蚀之前把人救回来。", rank: 4, power: 1100, days: 3, slots: 3, funds: 0, supplies: 0, reputation: 40, enemies: ["肉体改造的打手", "魔族佣兵"], bg: "city_night" },
  { id: "rescue_5", rescue: true, name: "营救被俘的同伴", desc: "情报室查到了被俘成员的关押地点。必须在她被彻底侵蚀之前把人救回来。", rank: 5, power: 1750, days: 3, slots: 3, funds: 0, supplies: 0, reputation: 50, enemies: ["上级魔族", "敌对忍者"], bg: "city_night" },
];

export const MISSION_BY_ID: Record<string, MissionTemplate> = Object.fromEntries([...MISSIONS, ...RESCUE_MISSIONS].map((m) => [m.id, m]));
