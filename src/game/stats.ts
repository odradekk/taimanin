// 等级上限、经验曲线和属性计算。公式见 docs/design/character-progression.md 的「属性」一节。

import type { StatKey, Stats } from "./defs";
import {
  APTITUDE_COEF, APTITUDES, BOND_STAT_BONUS, BOND_THRESHOLDS, CHARACTERS, CORRUPTION_PER_LEVEL, EXP_CURVE, FATIGUE_STAT_DIVISOR,
  GROWTH_UNITS, RANKS, STAT_ORDER, TRAINING_CAP,
} from "./registry";
import type { GameState, Taimanin } from "./state";

export function bondLevel(bond: number): number {
  return BOND_THRESHOLDS.filter((t) => bond >= t).length;
}

export function expToNext(level: number): number {
  const need = EXP_CURVE.base + EXP_CURVE.step * (level - 1);
  return level >= 100 ? need * EXP_CURVE.above100 : need;
}

export function levelCap(t: Taimanin): number {
  if (t.rank < RANKS.length - 1) return RANKS[t.rank].cap;
  return t.secret ? 100 + t.circuits : 100;
}

/** 每级成长值计入属性的倍数：升级、晋升位阶、秘传、秘术回路各自贡献一部分。 */
export function growthUnits(t: Taimanin): number {
  return (Math.min(t.level, 100) - 1) * GROWTH_UNITS.level
    + t.rank * GROWTH_UNITS.rank
    + (t.secret ? GROWTH_UNITS.secret : 0)
    + t.circuits * GROWTH_UNITS.circuit
    + Math.max(0, t.level - 100) * GROWTH_UNITS.levelAbove100;
}

export function aptitudeTier(t: Taimanin): number {
  return APTITUDES.indexOf(t.aptitude);
}

/** 训练值每项的上限，随资质提高。 */
export function trainingCap(t: Taimanin, k: StatKey): number {
  return Math.round(CHARACTERS[t.id].base[k] * (TRAINING_CAP.base + TRAINING_CAP.perTier * aptitudeTier(t)));
}

export function talentSpent(t: Taimanin): number {
  const nodes = CHARACTERS[t.id].talents?.flatMap((b) => b.nodes) ?? [];
  return nodes.reduce((sum, n) => sum + (t.talents[n.id] ?? 0) * n.cost, 0);
}

/** 天赋对五项基础属性的百分比加成（0.1 表示 +10%），已乘以资质的天赋系数。 */
export function talentBonus(t: Taimanin): Stats {
  const out: Stats = { hp: 0, atk: 0, def: 0, spd: 0, nin: 0 };
  const coef = APTITUDE_COEF[t.aptitude].talent;
  for (const node of CHARACTERS[t.id].talents?.flatMap((b) => b.nodes) ?? []) {
    const rank = t.talents[node.id] ?? 0;
    for (const m of node.mods ?? []) out[m.stat] += (m.pct / 100) * rank * coef;
  }
  return out;
}

export function fatigueFactor(t: Taimanin): number {
  return 1 - t.fatigue / FATIGUE_STAT_DIVISOR;
}

/** 面板属性：不含疲劳的影响。 */
export function panelStats(t: Taimanin): Stats {
  const def = CHARACTERS[t.id];
  // 角色表里的数值是初始资质下的数值，换算到当前资质。
  const now = APTITUDE_COEF[t.aptitude];
  const initial = APTITUDE_COEF[def.aptitude];
  const units = growthUnits(t);
  const bond = BOND_STAT_BONUS * (bondLevel(t.bond) - 1);
  const talents = talentBonus(t);
  const out = {} as Stats;
  for (const k of STAT_ORDER) {
    const base = (def.base[k] / initial.base + t.trained[k]) * now.base;
    const growth = (def.growth[k] / initial.growth) * now.growth * units;
    out[k] = Math.round((base + growth) * (1 + bond + talents[k]));
  }
  return out;
}

/** 实际属性：面板属性按疲劳折算。 */
export function effectiveStats(t: Taimanin): Stats {
  const panel = panelStats(t);
  const f = fatigueFactor(t);
  const out = {} as Stats;
  for (const k of STAT_ORDER) out[k] = Math.round(panel[k] * f);
  return out;
}

export function power(t: Taimanin): number {
  const s = effectiveStats(t);
  return Math.round(s.hp * 0.25 + s.atk * 1.2 + s.def + s.spd + s.nin * 1.2);
}

export function teamPower(s: GameState, members: string[]): number {
  return members.reduce((sum, id) => sum + power(s.roster[id]), 0);
}

/** 恢复期：已被救回、堕落值还没降到 0。 */
export function isRecovering(t: Taimanin): boolean {
  return !t.captive && t.corruption > 0;
}

export function isAvailable(t: Taimanin): boolean {
  return t.missionUid === null && t.injuredDays === 0 && !t.captive && t.corruption === 0;
}

export function corruptionLevel(t: Taimanin): number {
  return Math.floor(t.corruption / CORRUPTION_PER_LEVEL);
}

export function academyRank(reputation: number): string {
  const steps: [number, string][] = [[1000, "S"], [600, "A"], [300, "B"], [150, "C"], [50, "D"]];
  return steps.find(([min]) => reputation >= min)?.[1] ?? "E";
}

/** 按战力自动结算的成功率，任务和秘传试炼共用。 */
export function successChance(team: number, required: number): number {
  return Math.min(0.97, Math.max(0.03, (team / required - 0.4) * 1.25));
}
