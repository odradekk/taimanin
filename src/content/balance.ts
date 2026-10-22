// 全局数值。规则代码只引用这里的常数，调整难度时只改这个文件。
// 依据见 docs/design/character-progression.md。

import type { Aptitude, Cost, ItemId } from "../game/defs";

// ---------- 学园 ----------

export const MAX_AP = 4;
export const UPKEEP_PER_MEMBER = 40;
export const OFFER_LIFETIME = 3;
export const DAILY_EVENT_CHANCE = 0.35;

// ---------- 资质 ----------

export const APTITUDES: Aptitude[] = ["R", "SR", "SSR", "UR"];

export const APTITUDE_COEF: Record<Aptitude, { base: number; growth: number; talent: number; skill: number }> = {
  R: { base: 1, growth: 1, talent: 1, skill: 1 },
  SR: { base: 1.2, growth: 1.25, talent: 1.15, skill: 1.1 },
  SSR: { base: 1.45, growth: 1.55, talent: 1.3, skill: 1.2 },
  UR: { base: 1.75, growth: 1.9, talent: 1.5, skill: 1.35 },
};

/** 淬炼到某个资质的消耗，键是淬炼后的资质。 */
export const TEMPER_COST: Partial<Record<Aptitude, Cost>> = {
  SR: { items: { demon_crystal: 10 }, funds: 20_000, supplies: 300 },
  SSR: { items: { demon_crystal: 20 }, funds: 40_000, supplies: 500 },
  UR: { items: { demon_crystal: 30 }, funds: 80_000, supplies: 800 },
};

// ---------- 等级、位阶、秘传、秘术回路 ----------

/** 位阶 0..4。cost 和 lab 是从上一位阶晋升到这一位阶的条件。 */
export const RANKS: { name: string; cap: number; cost?: Cost; lab?: number }[] = [
  { name: "入门", cap: 20 },
  { name: "初传", cap: 40, cost: { items: { mana_shard: 10 }, funds: 1_000 }, lab: 1 },
  { name: "中传", cap: 60, cost: { items: { mana_crystal: 10, mana_shard: 20 }, funds: 3_000 }, lab: 2 },
  { name: "奥传", cap: 80, cost: { items: { mana_gem: 10, mana_crystal: 20 }, funds: 6_000 }, lab: 3 },
  { name: "皆传", cap: 100, cost: { items: { mana_treasure: 6, mana_gem: 20 }, funds: 12_000 }, lab: 4 },
];

export const SECRET_COST: Cost = { items: { demon_crystal: 5, mana_treasure: 10 }, funds: 30_000 };
export const SECRET_LAB = 5;
export const SECRET_TRIAL_INJURY_DAYS = 2;

export const CIRCUIT_COST: Cost = { items: { demon_crystal: 3 }, funds: 8_000 };
export const MAX_CIRCUITS = 10;

/** 成长倍数：每级成长值按多少倍计入属性。 */
export const GROWTH_UNITS = { level: 1, rank: 3, secret: 20, circuit: 5, levelAbove100: 3 };

/** 升到下一级所需经验 = base + step × (等级 − 1)，100 级以后乘以 above100。 */
export const EXP_CURVE = { base: 100, step: 40, above100: 2 };

// ---------- 经验来源 ----------

/** 自动结算的任务按结果发放经验，单位是「敌人等级对应的升级所需经验」。 */
export const MISSION_EXP = { great: 3, success: 2, fail: 1 };
/** 各任务等级（D..S）的敌人等级，取推荐等级范围的中段。 */
export const ENEMY_LEVEL_BY_RANK = [10, 30, 50, 72, 98];
/** 成员等级每高出敌人 1 级，经验减少的比例，以及最低保留的比例。 */
export const EXP_LEVEL_GAP = { penalty: 0.1, min: 0.1 };

// ---------- 训练 ----------

/** 训练值每项上限 = 角色基础值 × (base + perTier × 资质序号)。 */
export const TRAINING_CAP = { base: 0.5, perTier: 0.25 };

// ---------- 羁绊 ----------

/** 羁绊等级 1..10 所需的累计羁绊值。 */
export const BOND_THRESHOLDS = [0, 60, 160, 320, 550, 850, 1_250, 1_750, 2_400, 3_200];
export const BOND_STAT_BONUS = 0.04;
export const BOND_GAIN = { talk: 10, talkRandom: 5, giftLiked: 30, gift: 12, training: 3, mission: 5 };

// ---------- 天赋 ----------

/** 进入第 n 层需要在本分支投入的点数，下标为层数。 */
export const TALENT_LAYER_UNLOCK = [0, 0, 10, 25, 40];

// ---------- 疲劳 ----------

/** 实际属性 = 面板属性 × (1 − 疲劳 / divisor)，疲劳 100 时降低 50%。 */
export const FATIGUE_STAT_DIVISOR = 200;
export const MISSION_FATIGUE_PER_DAY = 12;

// ---------- 任务 ----------

/** 自动结算成功时掉落的材料（相当于一次精英战加一次首领战），大成功 ×1.5，失败没有。 */
export const MATERIAL_DROPS: Record<ItemId, number>[] = [
  { mana_shard: 6 },
  { mana_shard: 3, mana_crystal: 4 },
  { mana_crystal: 4, mana_gem: 2 },
  { mana_gem: 5, mana_treasure: 1 },
  { mana_treasure: 3, demon_crystal: 1 },
];

/** 营救任务比被俘时的任务高一级，最高 S 级。 */
export const RESCUE_RANK_STEP = 1;

// ---------- 俘获与堕落 ----------

/** 各任务等级（D..S）失败时每名成员被俘获的概率。 */
export const CAPTURE_CHANCE = [0.15, 0.25, 0.4, 0.55, 0.7];
/** 没有被俘获的成员受伤 base + 任务等级 天。 */
export const FAIL_INJURY_DAYS = 3;
/** 被俘期间每天累积的堕落值，按俘获时的任务等级。 */
export const DAILY_CORRUPTION = [20, 25, 35, 45, 60];
/** 每级羁绊减少的每日堕落值比例。 */
export const CORRUPTION_BOND_RESIST = 0.04;
export const CORRUPTION_PER_LEVEL = 100;
export const FALL_LEVEL = 10;
/** 定位被俘成员需要 max(1, base − 情报室等级) 天。 */
export const LOCATE_DAYS = 5;
/** 恢复期每天降低的堕落值 = base + perInfirmary × 医务室等级；交谈额外降低 talk。 */
export const RECOVERY = { base: 10, perInfirmary: 10, talk: 20 };
