import type { GiftId, StatKey, TrainingId } from "../types";

export interface TrainingDef {
  id: TrainingId;
  name: string;
  desc: string;
  gains: Partial<Record<StatKey, number>>;
  /** 正数增加疲劳，负数表示恢复。 */
  fatigue: number;
  supplies: number;
  exp: number;
}

export const TRAININGS: Record<TrainingId, TrainingDef> = {
  physical: { id: "physical", name: "体能训练", desc: "负重、长跑和耐力训练。", gains: { hp: 12, def: 3 }, fatigue: 18, supplies: 10, exp: 30 },
  combat: { id: "combat", name: "实战对练", desc: "两人一组的实战对抗。", gains: { atk: 3, spd: 3 }, fatigue: 20, supplies: 12, exp: 35 },
  ninjutsu: { id: "ninjutsu", name: "忍术修行", desc: "在研究所的指导下打磨忍术。需要忍术研究所。", gains: { nin: 4 }, fatigue: 22, supplies: 15, exp: 40 },
  meditation: { id: "meditation", name: "静心冥想", desc: "调整呼吸，消除疲劳。", gains: {}, fatigue: -30, supplies: 0, exp: 15 },
};

export const TRAINING_ORDER: TrainingId[] = ["physical", "combat", "ninjutsu", "meditation"];

export const STAT_NAMES: Record<StatKey, string> = { hp: "体力", atk: "攻击", def: "防御", spd: "速度", nin: "忍术" };
export const STAT_ORDER: StatKey[] = ["hp", "atk", "def", "spd", "nin"];

export interface GiftDef {
  id: GiftId;
  name: string;
  desc: string;
  price: number;
}

export const GIFTS: Record<GiftId, GiftDef> = {
  yokan: { id: "yokan", name: "高级羊羹", desc: "老字号和果子店的招牌。", price: 150 },
  matcha: { id: "matcha", name: "抹茶礼盒", desc: "宇治产的上等抹茶。", price: 200 },
  sake: { id: "sake", name: "吟酿清酒", desc: "口感清冽的地酒。仅限成年人。", price: 300 },
  gunkit: { id: "gunkit", name: "枪械保养套件", desc: "专业级的清洁和润滑工具。", price: 260 },
  whetstone: { id: "whetstone", name: "天然磨刀石", desc: "京都产的天然砥石。", price: 240 },
  parts: { id: "parts", name: "精密伺服零件", desc: "军规级的机械零件。", price: 320 },
  tomato: { id: "tomato", name: "番茄汁礼盒", desc: "浓郁的无盐番茄汁。", price: 120 },
  novel: { id: "novel", name: "新刊小说", desc: "最近流行的长篇小说。", price: 100 },
};

export const GIFT_ORDER: GiftId[] = ["yokan", "matcha", "sake", "gunkit", "whetstone", "parts", "tomato", "novel"];
