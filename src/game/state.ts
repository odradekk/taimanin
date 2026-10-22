// 游戏状态的类型、存档版本迁移和几个通用查询。
// 状态里只存 ID 和会变化的数字，定义一律从 registry 读取。

import type { Aptitude, CharId, FacilityId, ItemId, Resources, Rng, Stats } from "./defs";
import { CHARACTERS } from "./registry";

export const SAVE_VERSION = 2;

export class GameError extends Error {}

export interface Captive {
  /** 俘获时的任务等级 1..5，决定每日堕落值和营救任务的等级。 */
  rank: number;
  /** 情报室还需要几天才能定位，0 表示营救任务已经出现。 */
  locateDaysLeft: number;
  /** 被俘时所在任务，堕落后按它判断出现在哪些任务里。 */
  missionId: string;
}

export interface Taimanin {
  id: CharId;
  aptitude: Aptitude;
  level: number;
  exp: number;
  /** 位阶 0..4：入门、初传、中传、奥传、皆传。 */
  rank: number;
  secret: boolean;
  /** 已打通的秘术回路 0..10。 */
  circuits: number;
  /** 天赋节点 ID → 已投入的等级。 */
  talents: Record<string, number>;
  /** 训练累计获得的属性，和等级成长分开记录，便于界面展示。 */
  trained: Stats;
  /** 0..100，越高属性越低、训练效果越差，超过阈值有受伤风险。 */
  fatigue: number;
  bond: number;
  /** 受伤剩余天数，0 表示健康。 */
  injuredDays: number;
  missionUid: number | null;
  /** 最近一次交谈和赠礼的日期，同一天各只能进行一次。 */
  lastTalkDay: number;
  lastGiftDay: number;
  /** 堕落值。被俘期间增加，营救回来后在恢复期逐渐降低。 */
  corruption: number;
  /** 已播放过堕落剧情的最高堕落等级。 */
  fallSeen: number;
  captive: Captive | null;
}

export interface FacilityState {
  level: number;
  /** 正在升级时剩余的天数。 */
  buildDaysLeft: number;
}

export interface MissionOffer {
  uid: number;
  templateId: string;
  /** null 表示不会过期（营救任务）。 */
  expiresDay: number | null;
  /** 营救任务要救的成员。 */
  target?: CharId;
}

export interface ActiveMission {
  uid: number;
  templateId: string;
  members: CharId[];
  daysLeft: number;
  target?: CharId;
}

export interface GameState {
  version: number;
  playerName: string;
  day: number;
  ap: number;
  resources: Resources;
  facilities: Record<FacilityId, FacilityState>;
  roster: Record<CharId, Taimanin>;
  /** 礼物和养成材料的持有数量。 */
  inventory: Record<ItemId, number>;
  board: MissionOffer[];
  active: ActiveMission[];
  nextUid: number;
  /** 已看过的剧情 ID，回想模式和一次性剧情的触发都依赖它。 */
  seenScenes: string[];
  secretary: CharId | null;
  /** 当天结束时要依次播放的剧情。 */
  pendingScenes: string[];
  /** 堕落后离队的成员，之后会作为敌人出现。 */
  fallen: { id: CharId; missionId: string; day: number }[];
  stats: { missionsDone: number; missionsWon: number; trainings: number };
}

export interface MissionOutcome {
  templateId: string;
  members: CharId[];
  target?: CharId;
  result: "great" | "success" | "fail";
  rewards: Resources;
  materials: Record<ItemId, number>;
  injured: CharId[];
  captured: CharId[];
  log: string[];
}

export interface DayReport {
  day: number;
  income: Resources;
  upkeep: number;
  missions: MissionOutcome[];
  built: FacilityId[];
  recovered: CharId[];
  events: string[];
  levelUps: CharId[];
  /** 当天堕落等级上升的被俘成员。 */
  corruption: { id: CharId; level: number }[];
  /** 情报室定位成功、营救任务出现的成员。 */
  located: CharId[];
  /** 堕落后离队的成员。 */
  fallen: CharId[];
  /** 堕落值降到 0、结束恢复期的成员。 */
  cleansed: CharId[];
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const pick = <T>(list: T[], rng: Rng) => list[Math.floor(rng() * list.length)];

export function rosterIds(s: GameState): CharId[] {
  return Object.keys(s.roster);
}

export function member(s: GameState, id: CharId): Taimanin {
  const t = s.roster[id];
  if (!t) throw new GameError(`${CHARACTERS[id]?.name ?? id}还不在队伍中`);
  return t;
}

export function spendAp(s: GameState) {
  if (s.ap <= 0) throw new GameError("今天的行动力已经用完了");
  s.ap--;
}

export function newMember(id: CharId, day: number): Taimanin {
  return {
    id, aptitude: CHARACTERS[id].aptitude, level: 1, exp: 0, rank: 0, secret: false, circuits: 0, talents: {},
    trained: { hp: 0, atk: 0, def: 0, spd: 0, nin: 0 }, fatigue: 0, bond: 0, injuredDays: 0, missionUid: null,
    lastTalkDay: day - 1, lastGiftDay: day - 1, corruption: 0, fallSeen: 0, captive: null,
  };
}

/** 每个版本的迁移函数把上一版本的存档改成这一版本。 */
const MIGRATIONS: Record<number, (s: any) => void> = {
  // 版本 2：人物养成系统。旧存档最高 40 级，21 级以上免费补上初传。
  2: (s) => {
    for (const t of Object.values<any>(s.roster)) {
      Object.assign(t, {
        aptitude: CHARACTERS[t.id].aptitude, rank: t.level > 20 ? 1 : 0, secret: false, circuits: 0, talents: {},
        corruption: 0, fallSeen: 0, captive: null,
      });
    }
    s.fallen = [];
  },
};

/** 校验并读取存档数据，按版本依次迁移到当前版本。 */
export function loadState(raw: unknown): GameState {
  const s = raw as GameState;
  if (typeof s !== "object" || s === null || typeof s.version !== "number" || !s.roster) {
    throw new GameError("不是有效的存档文件");
  }
  if (s.version > SAVE_VERSION) throw new GameError("存档来自更新版本的游戏");
  for (let v = s.version + 1; v <= SAVE_VERSION; v++) MIGRATIONS[v](s);
  s.version = SAVE_VERSION;
  return s;
}
