import type { StatKey, TrainingDef, TrainingId } from "../game/defs";

export const TRAININGS: Record<TrainingId, TrainingDef> = {
  physical: { id: "physical", name: "体能训练", desc: "负重、长跑和耐力训练。", gains: { hp: 12, def: 3 }, fatigue: 18, supplies: 10, expRatio: 0.08 },
  combat: { id: "combat", name: "实战对练", desc: "两人一组的实战对抗。", gains: { atk: 3, spd: 3 }, fatigue: 20, supplies: 12, expRatio: 0.08 },
  ninjutsu: { id: "ninjutsu", name: "忍术修行", desc: "在研究所的指导下打磨忍术。需要忍术研究所。", gains: { nin: 4 }, fatigue: 22, supplies: 15, expRatio: 0.08 },
  meditation: { id: "meditation", name: "静心冥想", desc: "调整呼吸，消除疲劳。", gains: {}, fatigue: -30, supplies: 0, expRatio: 0.04 },
};

export const TRAINING_ORDER: TrainingId[] = ["physical", "combat", "ninjutsu", "meditation"];

export const STAT_NAMES: Record<StatKey, string> = { hp: "体力", atk: "攻击", def: "防御", spd: "速度", nin: "忍术" };
export const STAT_ORDER: StatKey[] = ["hp", "atk", "def", "spd", "nin"];
