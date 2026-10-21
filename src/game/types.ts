export type CharId =
  | "asagi" | "sakura" | "murasaki" | "shiranui"
  | "yukikaze" | "rinko" | "asuka" | "kurenai";

export type StatKey = "hp" | "atk" | "def" | "spd" | "nin";
export type Stats = Record<StatKey, number>;

export type Rarity = "R" | "SR" | "SSR";

export type FacilityId = "hall" | "dojo" | "lab" | "infirmary" | "dorm" | "intel";

export type TrainingId = "physical" | "combat" | "ninjutsu" | "meditation";

export type GiftId = "yokan" | "matcha" | "sake" | "gunkit" | "whetstone" | "parts" | "tomato" | "novel";

export interface Resources {
  funds: number;
  supplies: number;
  reputation: number;
}

export interface Taimanin {
  id: CharId;
  level: number;
  exp: number;
  /** 训练累计获得的属性，和等级成长分开记录，便于界面展示。 */
  trained: Stats;
  /** 0..100，越高训练效果越差，超过阈值有受伤风险。 */
  fatigue: number;
  bond: number;
  /** 受伤剩余天数，0 表示健康。 */
  injuredDays: number;
  missionUid: number | null;
  /** 最近一次交谈和赠礼的日期，同一天各只能进行一次。 */
  lastTalkDay: number;
  lastGiftDay: number;
}

export interface FacilityState {
  level: number;
  /** 正在升级时剩余的天数。 */
  buildDaysLeft: number;
}

export interface MissionOffer {
  uid: number;
  templateId: string;
  expiresDay: number;
}

export interface ActiveMission {
  uid: number;
  templateId: string;
  members: CharId[];
  daysLeft: number;
}

export interface GameState {
  version: number;
  playerName: string;
  day: number;
  ap: number;
  resources: Resources;
  facilities: Record<FacilityId, FacilityState>;
  roster: Partial<Record<CharId, Taimanin>>;
  inventory: Partial<Record<GiftId, number>>;
  board: MissionOffer[];
  active: ActiveMission[];
  nextUid: number;
  /** 已看过的剧情 ID，回想模式和一次性剧情的触发都依赖它。 */
  seenScenes: string[];
  secretary: CharId | null;
  /** 当天结束时要依次播放的剧情。 */
  pendingScenes: string[];
  stats: { missionsDone: number; missionsWon: number; trainings: number };
}

export interface MissionOutcome {
  templateId: string;
  members: CharId[];
  result: "great" | "success" | "fail";
  rewards: Resources;
  injured: CharId[];
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
}

export type Rng = () => number;
