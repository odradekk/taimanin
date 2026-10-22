// 人物养成：经验、羁绊、位阶、秘传、秘术回路、淬炼、天赋。
// 规则见 docs/design/character-progression.md。

import type { Aptitude, CharId, Cost, Rng } from "./defs";
import {
  APTITUDES, CHARACTERS, CIRCUIT_COST, ENEMY_LEVEL_BY_RANK, EXP_LEVEL_GAP, FACILITIES, ITEM_BY_ID, MAX_CIRCUITS,
  RANKS, SECRET_COST, SECRET_LAB, SECRET_TRIAL_INJURY_DAYS, TALENT_LAYER_UNLOCK, TEMPER_COST,
} from "./registry";
import { GameError, member, type GameState, type Taimanin } from "./state";
import { expToNext, isAvailable, levelCap, power, successChance, talentSpent } from "./stats";

// ---------- 经验与羁绊 ----------

/** 增加经验并处理升级，返回升了几级。到达当前上限后经验不再累积。 */
export function addExp(t: Taimanin, amount: number): number {
  const cap = levelCap(t);
  let ups = 0;
  t.exp += Math.round(amount);
  while (t.level < cap && t.exp >= expToNext(t.level)) {
    t.exp -= expToNext(t.level);
    t.level++;
    ups++;
  }
  if (t.level >= cap) t.exp = 0;
  return ups;
}

/** 按任务等级换算的经验：单位是敌人等级对应的升级所需经验，成员等级越高于敌人，经验越少。 */
export function missionExp(t: Taimanin, rank: number, units: number): number {
  const enemy = ENEMY_LEVEL_BY_RANK[rank - 1];
  const gap = Math.max(0, t.level - enemy);
  return units * expToNext(enemy) * Math.max(EXP_LEVEL_GAP.min, 1 - EXP_LEVEL_GAP.penalty * gap);
}

export function addBond(t: Taimanin, amount: number) {
  t.bond = Math.max(0, t.bond + amount);
}

// ---------- 消耗 ----------

/** 返回付不起的原因，付得起时返回 null。 */
export function costBlocker(s: GameState, cost: Cost): string | null {
  for (const [id, n] of Object.entries(cost.items ?? {})) {
    if ((s.inventory[id] ?? 0) < n) return `${ITEM_BY_ID[id].name}不足`;
  }
  if (s.resources.funds < (cost.funds ?? 0)) return "资金不足";
  if (s.resources.supplies < (cost.supplies ?? 0)) return "物资不足";
  return null;
}

function pay(s: GameState, cost: Cost) {
  for (const [id, n] of Object.entries(cost.items ?? {})) s.inventory[id] -= n;
  s.resources.funds -= cost.funds ?? 0;
  s.resources.supplies -= cost.supplies ?? 0;
}

// ---------- 位阶、秘传、秘术回路、淬炼 ----------

export type GrowthStep =
  | { kind: "rank"; to: number; cost: Cost; level: number; lab: number }
  | { kind: "secret"; cost: Cost; level: number; lab: number }
  | { kind: "circuit"; to: number; cost: Cost; level: number }
  | { kind: "temper"; to: Aptitude; cost: Cost; level: number };

/** 角色的下一个养成步骤，不考虑条件是否满足。已经全部完成时返回 null。 */
export function growthStep(t: Taimanin): GrowthStep | null {
  if (t.rank < RANKS.length - 1) {
    const next = RANKS[t.rank + 1];
    return { kind: "rank", to: t.rank + 1, cost: next.cost!, level: RANKS[t.rank].cap, lab: next.lab! };
  }
  if (!t.secret) return { kind: "secret", cost: SECRET_COST, level: 100, lab: SECRET_LAB };
  if (t.circuits < MAX_CIRCUITS) return { kind: "circuit", to: t.circuits + 1, cost: CIRCUIT_COST, level: 100 + t.circuits };
  const to = APTITUDES[APTITUDES.indexOf(t.aptitude) + 1];
  if (to) return { kind: "temper", to, cost: TEMPER_COST[to]!, level: 100 + MAX_CIRCUITS };
  return null;
}

/** 返回不能进行下一步的原因，可以进行时返回 null。 */
export function growthBlocker(s: GameState, id: CharId): string | null {
  const t = member(s, id);
  const step = growthStep(t);
  if (!step) return "已经完成全部养成";
  if (!isAvailable(t)) return "只有待命的成员可以进行养成";
  if (t.level < step.level) return `需要达到 ${step.level} 级`;
  if ("lab" in step && s.facilities.lab.level < step.lab) return `需要${FACILITIES.lab.name} ${step.lab} 级`;
  if (step.kind === "secret" && !CHARACTERS[id].secret) return "这名角色的秘传尚未开放";
  return costBlocker(s, step.cost);
}

/** 进行下一个养成步骤。秘传要经过试炼，走 secretTrial。 */
export function advance(s: GameState, id: CharId): GrowthStep {
  const blocker = growthBlocker(s, id);
  if (blocker) throw new GameError(blocker);
  const t = member(s, id);
  const step = growthStep(t)!;
  if (step.kind === "secret") throw new GameError("秘传需要通过秘传试炼");
  pay(s, step.cost);
  if (step.kind === "rank") t.rank = step.to;
  if (step.kind === "circuit") t.circuits = step.to;
  if (step.kind === "temper") t.aptitude = step.to;
  return step;
}

/**
 * 秘传试炼。战斗系统实现前按试炼推荐战力自动结算：
 * 胜利时扣除材料、完成秘传；失败不扣材料，角色受伤。
 */
export function secretTrial(s: GameState, id: CharId, rng: Rng): { success: boolean; chance: number } {
  const blocker = growthBlocker(s, id);
  if (blocker) throw new GameError(blocker);
  const t = member(s, id);
  if (growthStep(t)?.kind !== "secret") throw new GameError("现在不能进行秘传试炼");
  const chance = successChance(power(t), CHARACTERS[id].secret!.trialPower);
  const success = rng() < chance;
  if (success) {
    pay(s, SECRET_COST);
    t.secret = true;
  } else {
    t.injuredDays = SECRET_TRIAL_INJURY_DAYS;
  }
  return { success, chance };
}

// ---------- 天赋 ----------

export function talentPoints(t: Taimanin): number {
  return t.level - talentSpent(t);
}

function branchSpent(t: Taimanin, branchId: string): number {
  const branch = CHARACTERS[t.id].talents?.find((b) => b.id === branchId);
  return branch?.nodes.reduce((sum, n) => sum + (t.talents[n.id] ?? 0) * n.cost, 0) ?? 0;
}

/** 返回不能给这个节点加点的原因，可以加点时返回 null。 */
export function talentBlocker(s: GameState, id: CharId, nodeId: string): string | null {
  const t = member(s, id);
  if (t.missionUid !== null) return "出击中的成员不能调整天赋";
  if (t.captive) return "被俘的成员不能调整天赋";
  const branch = CHARACTERS[id].talents?.find((b) => b.nodes.some((n) => n.id === nodeId));
  const node = branch?.nodes.find((n) => n.id === nodeId);
  if (!branch || !node) return "没有这个天赋";
  if ((t.talents[nodeId] ?? 0) >= node.maxRank) return "已经点满";
  const need = TALENT_LAYER_UNLOCK[node.layer];
  if (branchSpent(t, branch.id) < need) return `需要在「${branch.name}」投入 ${need} 点`;
  if (talentPoints(t) < node.cost) return "天赋点不足";
  return null;
}

export function addTalent(s: GameState, id: CharId, nodeId: string) {
  const blocker = talentBlocker(s, id, nodeId);
  if (blocker) throw new GameError(blocker);
  const t = member(s, id);
  t.talents[nodeId] = (t.talents[nodeId] ?? 0) + 1;
}

/** 免费重置全部天赋。 */
export function resetTalents(s: GameState, id: CharId) {
  const t = member(s, id);
  if (t.missionUid !== null) throw new GameError("出击中的成员不能调整天赋");
  if (t.captive) throw new GameError("被俘的成员不能调整天赋");
  t.talents = {};
}
