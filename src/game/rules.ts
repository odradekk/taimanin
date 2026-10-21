// 游戏规则。所有操作都直接修改传入的 GameState，由 store 用 immer 包装成不可变更新。
// 随机数通过参数传入，测试时可以固定。

import type { Effect } from "../story/script";
import { CHARACTERS } from "./data/characters";
import { DAILY_EVENTS } from "./data/events";
import {
  dormCapacity, FACILITIES, hallIncome, hallReputation, infirmaryRecovery, intelBoardSize,
  intelMaxRank, labMultiplier, dojoMultiplier, MAX_FACILITY_LEVEL,
} from "./data/facilities";
import { MISSION_BY_ID, MISSIONS, type MissionTemplate } from "./data/missions";
import { MAIN_TRIGGERS } from "./data/story";
import { GIFTS, STAT_ORDER, TRAININGS } from "./data/training";
import type {
  CharId, DayReport, FacilityId, GameState, GiftId, MissionOutcome, Resources, Rng, Stats,
  Taimanin, TrainingId,
} from "./types";

export const SAVE_VERSION = 1;
export const MAX_AP = 4;
export const UPKEEP_PER_MEMBER = 40;
export const MAX_LEVEL = 40;
/** 羁绊等级 1..5 所需的累计羁绊值。 */
export const BOND_THRESHOLDS = [0, 60, 160, 320, 550];
const OFFER_LIFETIME = 3;
const DAILY_EVENT_CHANCE = 0.35;

export class GameError extends Error {}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const pick = <T>(list: T[], rng: Rng) => list[Math.floor(rng() * list.length)];

// ---------- 查询 ----------

export function bondLevel(bond: number): number {
  return BOND_THRESHOLDS.filter((t) => bond >= t).length;
}

export function expToNext(level: number): number {
  return 100 + (level - 1) * 40;
}

export function effectiveStats(t: Taimanin): Stats {
  const def = CHARACTERS[t.id];
  const bondBonus = 1 + 0.03 * (bondLevel(t.bond) - 1);
  const out = {} as Stats;
  for (const k of STAT_ORDER) {
    out[k] = Math.round((def.base[k] + def.growth[k] * (t.level - 1) + t.trained[k]) * bondBonus);
  }
  return out;
}

export function power(t: Taimanin): number {
  const s = effectiveStats(t);
  return Math.round(s.hp * 0.25 + s.atk * 1.2 + s.def + s.spd + s.nin * 1.2);
}

export function rosterIds(s: GameState): CharId[] {
  return Object.keys(s.roster) as CharId[];
}

export function member(s: GameState, id: CharId): Taimanin {
  const t = s.roster[id];
  if (!t) throw new GameError(`${CHARACTERS[id].name}还不是学园的成员`);
  return t;
}

export function isAvailable(t: Taimanin): boolean {
  return t.missionUid === null && t.injuredDays === 0;
}

export function academyRank(reputation: number): string {
  const steps: [number, string][] = [[1000, "S"], [600, "A"], [300, "B"], [150, "C"], [50, "D"]];
  return steps.find(([min]) => reputation >= min)?.[1] ?? "E";
}

export function teamPower(s: GameState, members: CharId[]): number {
  return members.reduce((sum, id) => sum + power(member(s, id)), 0);
}

export function successChance(team: number, m: MissionTemplate): number {
  return clamp((team / m.power - 0.4) * 1.25, 0.03, 0.97);
}

// ---------- 新游戏 ----------

function newMember(id: CharId, day: number): Taimanin {
  return {
    id, level: 1, exp: 0, trained: { hp: 0, atk: 0, def: 0, spd: 0, nin: 0 },
    fatigue: 0, bond: 0, injuredDays: 0, missionUid: null, lastTalkDay: day - 1, lastGiftDay: day - 1,
  };
}

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
    stats: { missionsDone: 0, missionsWon: 0, trainings: 0 },
  };
  refillBoard(s, rng);
  return s;
}

// ---------- 成长 ----------

function spendAp(s: GameState) {
  if (s.ap <= 0) throw new GameError("今天的行动力已经用完了");
  s.ap--;
}

function addBond(t: Taimanin, amount: number) {
  t.bond = Math.max(0, t.bond + amount);
}

/** 增加经验并处理升级，返回升了几级。 */
function addExp(t: Taimanin, amount: number): number {
  let ups = 0;
  t.exp += Math.round(amount);
  while (t.level < MAX_LEVEL && t.exp >= expToNext(t.level)) {
    t.exp -= expToNext(t.level);
    t.level++;
    ups++;
  }
  if (t.level === MAX_LEVEL) t.exp = 0;
  return ups;
}

export interface TrainResult {
  gains: Partial<Stats>;
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
  const gains: Partial<Stats> = {};
  for (const [k, base] of Object.entries(def.gains) as [keyof Stats, number][]) {
    const gain = Math.max(1, Math.round(base * facility * tired * (0.8 + 0.4 * rng()) * (great ? 2 : 1)));
    t.trained[k] += gain;
    gains[k] = gain;
  }
  t.fatigue = clamp(t.fatigue + def.fatigue, 0, 100);
  const injured = def.fatigue > 0 && t.fatigue >= 90 && rng() < 0.35;
  if (injured) t.injuredDays = 2;
  addBond(t, 3);
  s.stats.trainings++;
  return { gains, great, injured, levelUps: addExp(t, def.exp * (great ? 1.5 : 1)) };
}

export function talk(s: GameState, id: CharId, rng: Rng): { line: string; bond: number } {
  const t = member(s, id);
  if (t.missionUid !== null) throw new GameError(`${CHARACTERS[id].name}正在执行任务`);
  if (t.lastTalkDay === s.day) throw new GameError("今天已经和她聊过了");
  spendAp(s);
  t.lastTalkDay = s.day;
  const bond = 10 + Math.floor(rng() * 5);
  addBond(t, bond);
  return { line: pick(CHARACTERS[id].talks, rng), bond };
}

export function buyGift(s: GameState, giftId: GiftId) {
  const price = GIFTS[giftId].price;
  if (s.resources.funds < price) throw new GameError("资金不足");
  s.resources.funds -= price;
  s.inventory[giftId] = (s.inventory[giftId] ?? 0) + 1;
}

export function giveGift(s: GameState, id: CharId, giftId: GiftId): { bond: number; liked: boolean } {
  const t = member(s, id);
  if (t.missionUid !== null) throw new GameError(`${CHARACTERS[id].name}正在执行任务`);
  if (t.lastGiftDay === s.day) throw new GameError("今天已经送过礼物了");
  if (!s.inventory[giftId]) throw new GameError("没有这件礼物");
  s.inventory[giftId]!--;
  t.lastGiftDay = s.day;
  const liked = CHARACTERS[id].likes.includes(giftId);
  const bond = liked ? 30 : 12;
  addBond(t, bond);
  return { bond, liked };
}

// ---------- 经营 ----------

/** 返回不能招募的原因，可以招募时返回 null。 */
export function recruitBlocker(s: GameState, id: CharId): string | null {
  const req = CHARACTERS[id].recruit;
  if (s.roster[id]) return "已在队伍中";
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

export function dispatch(s: GameState, uid: number, members: CharId[]) {
  const offer = s.board.find((o) => o.uid === uid);
  if (!offer) throw new GameError("任务已失效");
  const m = MISSION_BY_ID[offer.templateId];
  if (members.length === 0 || members.length > m.slots) throw new GameError(`需要 1～${m.slots} 名成员`);
  for (const id of members) if (!isAvailable(member(s, id))) throw new GameError(`${CHARACTERS[id].name}无法出击`);
  s.board = s.board.filter((o) => o.uid !== uid);
  s.active.push({ uid, templateId: m.id, members, daysLeft: m.days });
  for (const id of members) member(s, id).missionUid = uid;
}

export function setSecretary(s: GameState, id: CharId) {
  member(s, id);
  s.secretary = id;
}

/** 应用剧情里的 @effect 和选项效果。bond 加给剧情所属角色（如果已入队）。 */
export function applyEffect(s: GameState, effect: Effect, char?: CharId) {
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

// ---------- 结束一天 ----------

function refillBoard(s: GameState, rng: Rng) {
  const intel = s.facilities.intel.level;
  const pool = MISSIONS.filter((m) => m.rank <= intelMaxRank(intel));
  while (s.board.length < intelBoardSize(intel)) {
    const fresh = pool.filter((m) => !s.board.some((o) => o.templateId === m.id));
    if (fresh.length === 0) break;
    s.board.push({ uid: s.nextUid++, templateId: pick(fresh, rng).id, expiresDay: s.day + OFFER_LIFETIME });
  }
}

function resolveMission(s: GameState, members: CharId[], m: MissionTemplate, rng: Rng): MissionOutcome {
  const team = teamPower(s, members);
  const ratio = team / m.power;
  const success = rng() < successChance(team, m);
  const great = success && rng() < clamp((ratio - 1) * 1.5, 0, 0.6);
  const result = great ? "great" : success ? "success" : "fail";
  const mult = (great ? 1.5 : 1) * (1 + 0.05 * s.facilities.intel.level);
  const rewards: Resources = success
    ? { funds: Math.round(m.funds * mult), supplies: Math.round(m.supplies * mult), reputation: Math.round(m.reputation * mult) }
    : { funds: Math.round(m.funds * 0.2), supplies: 0, reputation: -3 * m.rank };
  s.resources.funds += rewards.funds;
  s.resources.supplies += rewards.supplies;
  s.resources.reputation = Math.max(0, s.resources.reputation + rewards.reputation);

  const injured: CharId[] = [];
  const injuryChance = !success ? 0.4 : ratio < 1 ? 0.1 : 0;
  for (const id of members) {
    const t = member(s, id);
    t.missionUid = null;
    t.fatigue = clamp(t.fatigue + 12 * m.days, 0, 100);
    addBond(t, 5);
    addExp(t, m.exp * (great ? 1.5 : success ? 1 : 0.5));
    if (rng() < injuryChance) {
      t.injuredDays = 2 + Math.floor(rng() * 3);
      injured.push(id);
    }
  }
  s.stats.missionsDone++;
  if (success) s.stats.missionsWon++;

  const names = members.map((id) => CHARACTERS[id].name).join("、");
  const lead = CHARACTERS[pick(members, rng)];
  const log = [
    `${names}出发执行「${m.name}」。`,
    `途中遭遇${pick(m.enemies, rng)}，${lead.name}以${lead.ninjutsu}抢占先机。`,
    great ? "行动堪称完美，敌人被一网打尽。"
      : success ? "经过一番苦战，任务顺利完成。"
      : "敌人的实力远超情报，队伍被迫撤退。",
  ];
  if (injured.length) log.push(`${injured.map((id) => CHARACTERS[id].name).join("、")}在战斗中负伤。`);
  return { templateId: m.id, members, result, rewards, injured, log };
}

export function endDay(s: GameState, rng: Rng): DayReport {
  const report: DayReport = {
    day: s.day, income: { funds: 0, supplies: 0, reputation: 0 }, upkeep: 0,
    missions: [], built: [], recovered: [], events: [], levelUps: [],
  };
  const levels = Object.fromEntries(rosterIds(s).map((id) => [id, member(s, id).level]));

  for (const a of s.active) a.daysLeft--;
  for (const a of s.active.filter((x) => x.daysLeft <= 0)) {
    report.missions.push(resolveMission(s, a.members, MISSION_BY_ID[a.templateId], rng));
  }
  s.active = s.active.filter((a) => a.daysLeft > 0);

  for (const [fid, f] of Object.entries(s.facilities) as [FacilityId, GameState["facilities"][FacilityId]][]) {
    if (f.buildDaysLeft > 0 && --f.buildDaysLeft === 0) {
      f.level++;
      report.built.push(fid);
    }
  }

  const hall = s.facilities.hall.level;
  report.income = { funds: hallIncome(hall), supplies: 10, reputation: hallReputation(hall) };
  report.upkeep = UPKEEP_PER_MEMBER * rosterIds(s).length;
  s.resources.funds += report.income.funds - report.upkeep;
  s.resources.supplies += report.income.supplies;
  s.resources.reputation += report.income.reputation;

  const recovery = infirmaryRecovery(s.facilities.infirmary.level);
  for (const id of rosterIds(s)) {
    const t = member(s, id);
    if (t.missionUid !== null) continue;
    t.fatigue = clamp(t.fatigue - recovery, 0, 100);
    if (t.injuredDays > 0) {
      t.injuredDays = Math.max(0, t.injuredDays - (s.facilities.infirmary.level >= 3 ? 2 : 1));
      if (t.injuredDays === 0) report.recovered.push(id);
    }
  }

  if (rng() < DAILY_EVENT_CHANCE) {
    const ev = pick(DAILY_EVENTS.filter((e) => s.day >= (e.minDay ?? 0)), rng);
    s.resources.funds += ev.delta?.funds ?? 0;
    s.resources.supplies += ev.delta?.supplies ?? 0;
    s.resources.reputation += ev.delta?.reputation ?? 0;
    if (ev.fatigue) {
      for (const id of rosterIds(s)) {
        const t = member(s, id);
        if (t.missionUid === null) t.fatigue = clamp(t.fatigue + ev.fatigue, 0, 100);
      }
    }
    report.events.push(ev.text);
  }
  if (s.resources.funds < 0) {
    s.resources.reputation = Math.max(0, s.resources.reputation - 5);
    report.events.push("学园资金出现赤字，外界开始质疑学园的运营能力。声望 -5");
  }

  report.levelUps = rosterIds(s).filter((id) => member(s, id).level > levels[id]);

  s.day++;
  s.ap = MAX_AP;
  s.board = s.board.filter((o) => o.expiresDay >= s.day);
  refillBoard(s, rng);

  for (const t of MAIN_TRIGGERS) {
    const due = (t.day === undefined || report.day >= t.day) && (t.reputation === undefined || s.resources.reputation >= t.reputation);
    if (due && !s.seenScenes.includes(t.scene) && !s.pendingScenes.includes(t.scene)) s.pendingScenes.push(t.scene);
  }
  return report;
}

/** 校验并读取存档数据。以后改动 GameState 结构时，在这里按 version 迁移旧存档。 */
export function loadState(raw: unknown): GameState {
  const s = raw as GameState;
  if (typeof s !== "object" || s === null || typeof s.version !== "number" || !s.roster) {
    throw new GameError("不是有效的存档文件");
  }
  if (s.version > SAVE_VERSION) throw new GameError("存档来自更新版本的游戏");
  return s;
}
