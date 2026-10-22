// 学园日常：新游戏、训练、交谈、赠礼、招募、设施、秘书和剧情效果。

import type { CharId, FacilityId, ItemId, Rng, SceneEffect, TrainingId } from "./defs";
import {
  BOND_GAIN, CHARACTERS, dojoMultiplier, dormCapacity, FACILITIES, ITEM_BY_ID, labMultiplier, MAX_AP,
  MAX_FACILITY_LEVEL, RECOVERY, TRAININGS,
} from "./registry";
import { refillBoard } from "./missions";
import { addBond, addExp } from "./progression";
import {
  clamp, GameError, member, newMember, pick, rosterIds, SAVE_VERSION, spendAp, type GameState,
} from "./state";
import { expToNext, isAvailable, trainingCap } from "./stats";

export function newGame(playerName: string, rng: Rng): GameState {
  const s: GameState = {
    version: SAVE_VERSION,
    playerName,
    day: 1,
    ap: MAX_AP,
    resources: { funds: 3000, supplies: 120, reputation: 0 },
    facilities: {
      hall: { level: 1, buildDaysLeft: 0 }, dojo: { level: 1, buildDaysLeft: 0 },
      lab: { level: 0, buildDaysLeft: 0 }, infirmary: { level: 1, buildDaysLeft: 0 },
      dorm: { level: 1, buildDaysLeft: 0 }, intel: { level: 0, buildDaysLeft: 0 },
    },
    roster: { yukikaze: newMember("yukikaze", 1), rinko: newMember("rinko", 1) },
    inventory: { yokan: 1 },
    board: [],
    active: [],
    nextUid: 1,
    seenScenes: [],
    secretary: "yukikaze",
    pendingScenes: ["prologue"],
    fallen: [],
    stats: { missionsDone: 0, missionsWon: 0, trainings: 0 },
  };
  refillBoard(s, rng);
  return s;
}

// ---------- 成员互动 ----------

export interface TrainResult {
  gains: Partial<Record<string, number>>;
  great: boolean;
  injured: boolean;
  levelUps: number;
}

export function train(s: GameState, id: CharId, trainingId: TrainingId, rng: Rng): TrainResult {
  const t = member(s, id);
  const def = TRAININGS[trainingId];
  if (!isAvailable(t)) throw new GameError(`${CHARACTERS[id].name}现在无法训练`);
  if (trainingId === "ninjutsu" && s.facilities.lab.level === 0) throw new GameError("需要先建成忍术研究所");
  if (s.resources.supplies < def.supplies) throw new GameError("物资不足");
  spendAp(s);
  s.resources.supplies -= def.supplies;

  const great = def.fatigue > 0 && rng() < 0.1;
  const facility = trainingId === "ninjutsu" ? labMultiplier(s.facilities.lab.level) : dojoMultiplier(s.facilities.dojo.level);
  const tired = t.fatigue >= 60 ? 0.5 : 1;
  const gains: Partial<Record<string, number>> = {};
  for (const [k, base] of Object.entries(def.gains) as [keyof typeof t.trained, number][]) {
    const roll = Math.max(1, Math.round(base * facility * tired * (0.8 + 0.4 * rng()) * (great ? 2 : 1)));
    const gain = Math.min(roll, trainingCap(t, k) - t.trained[k]);
    t.trained[k] += gain;
    gains[k] = gain;
  }
  t.fatigue = clamp(t.fatigue + def.fatigue, 0, 100);
  const injured = def.fatigue > 0 && t.fatigue >= 90 && rng() < 0.35;
  if (injured) t.injuredDays = 2;
  addBond(t, BOND_GAIN.training);
  s.stats.trainings++;
  return { gains, great, injured, levelUps: addExp(t, def.expRatio * expToNext(t.level) * (great ? 1.5 : 1)) };
}

/** 交谈。恢复期的成员和教官交谈，额外降低堕落值。 */
export function talk(s: GameState, id: CharId, rng: Rng): { line: string; bond: number; cleansed: number } {
  const t = member(s, id);
  if (t.missionUid !== null) throw new GameError(`${CHARACTERS[id].name}正在执行任务`);
  if (t.captive) throw new GameError(`${CHARACTERS[id].name}被俘了`);
  if (t.lastTalkDay === s.day) throw new GameError("今天已经和她聊过了");
  spendAp(s);
  t.lastTalkDay = s.day;
  const bond = BOND_GAIN.talk + Math.floor(rng() * BOND_GAIN.talkRandom);
  addBond(t, bond);
  const cleansed = Math.min(t.corruption, RECOVERY.talk);
  t.corruption -= cleansed;
  return { line: pick(CHARACTERS[id].talks, rng), bond, cleansed };
}

export function buyGift(s: GameState, itemId: ItemId) {
  const price = ITEM_BY_ID[itemId].price;
  if (price === undefined) throw new GameError("这件物品不出售");
  if (s.resources.funds < price) throw new GameError("资金不足");
  s.resources.funds -= price;
  s.inventory[itemId] = (s.inventory[itemId] ?? 0) + 1;
}

export function giveGift(s: GameState, id: CharId, itemId: ItemId): { bond: number; liked: boolean } {
  const t = member(s, id);
  if (t.missionUid !== null) throw new GameError(`${CHARACTERS[id].name}正在执行任务`);
  if (t.captive) throw new GameError(`${CHARACTERS[id].name}被俘了`);
  if (t.lastGiftDay === s.day) throw new GameError("今天已经送过礼物了");
  if (ITEM_BY_ID[itemId]?.kind !== "gift" || !s.inventory[itemId]) throw new GameError("没有这件礼物");
  s.inventory[itemId]--;
  t.lastGiftDay = s.day;
  const liked = CHARACTERS[id].likes.includes(itemId);
  const bond = liked ? BOND_GAIN.giftLiked : BOND_GAIN.gift;
  addBond(t, bond);
  return { bond, liked };
}

export function setSecretary(s: GameState, id: CharId) {
  if (member(s, id).captive) throw new GameError(`${CHARACTERS[id].name}被俘了`);
  s.secretary = id;
}

// ---------- 招募与设施 ----------

/** 返回不能招募的原因，可以招募时返回 null。 */
export function recruitBlocker(s: GameState, id: CharId): string | null {
  const req = CHARACTERS[id].recruit;
  if (s.roster[id]) return "已在队伍中";
  if (s.fallen.some((f) => f.id === id)) return "已经堕落，无法招募";
  if (!req) return "无法招募";
  if (s.resources.reputation < req.reputation) return `需要声望 ${req.reputation}`;
  if (req.facility && s.facilities[req.facility[0]].level < req.facility[1]) {
    return `需要${FACILITIES[req.facility[0]].name} ${req.facility[1]} 级`;
  }
  if (rosterIds(s).length >= dormCapacity(s.facilities.dorm.level)) return "宿舍已满";
  if (s.resources.funds < req.funds) return "资金不足";
  return null;
}

export function recruit(s: GameState, id: CharId) {
  const blocker = recruitBlocker(s, id);
  if (blocker) throw new GameError(blocker);
  s.resources.funds -= CHARACTERS[id].recruit!.funds;
  s.roster[id] = newMember(id, s.day);
}

export function upgradeBlocker(s: GameState, fid: FacilityId): string | null {
  const f = s.facilities[fid];
  if (f.level >= MAX_FACILITY_LEVEL) return "已达到最高等级";
  if (f.buildDaysLeft > 0) return "正在施工";
  if (Object.values(s.facilities).some((x) => x.buildDaysLeft > 0)) return "施工队正在其他设施施工";
  const cost = FACILITIES[fid].upgrades[f.level];
  if (s.resources.funds < cost.funds) return "资金不足";
  if (s.resources.supplies < cost.supplies) return "物资不足";
  return null;
}

export function upgrade(s: GameState, fid: FacilityId) {
  const blocker = upgradeBlocker(s, fid);
  if (blocker) throw new GameError(blocker);
  const cost = FACILITIES[fid].upgrades[s.facilities[fid].level];
  s.resources.funds -= cost.funds;
  s.resources.supplies -= cost.supplies;
  s.facilities[fid].buildDaysLeft = cost.days;
}

// ---------- 剧情 ----------

/** 应用剧情里的 @effect 和选项效果。bond 加给剧情所属角色（如果已入队）。 */
export function applyEffect(s: GameState, effect: SceneEffect, char?: CharId) {
  s.resources.funds += effect.funds ?? 0;
  s.resources.supplies += effect.supplies ?? 0;
  s.resources.reputation += effect.reputation ?? 0;
  const t = char && s.roster[char];
  if (effect.bond && t) addBond(t, effect.bond);
}

export function markSeen(s: GameState, sceneId: string) {
  if (!s.seenScenes.includes(sceneId)) s.seenScenes.push(sceneId);
  s.pendingScenes = s.pendingScenes.filter((id) => id !== sceneId);
}
