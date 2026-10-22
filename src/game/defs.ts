// 内容数据的类型定义。src/content/ 下的数据文件只引用这里的类型，不引用任何规则。

/** 角色、物品等可以随数据增加的内容一律用字符串 ID，拼写错误由内容校验测试发现。 */
export type CharId = string;
export type ItemId = string;

export type StatKey = "hp" | "atk" | "def" | "spd" | "nin";
export type Stats = Record<StatKey, number>;

export type Aptitude = "R" | "SR" | "SSR" | "UR";

/** 设施和训练各自对应专门的规则代码，所以保留固定的取值范围。 */
export type FacilityId = "hall" | "dojo" | "lab" | "infirmary" | "dorm" | "intel";
export type TrainingId = "physical" | "combat" | "ninjutsu" | "meditation";

export type Rng = () => number;

export interface Resources {
  funds: number;
  supplies: number;
  reputation: number;
}

/** 养成步骤的消耗。 */
export interface Cost {
  items?: Record<ItemId, number>;
  funds?: number;
  supplies?: number;
}

/** 只有名字和说明的技能，具体效果等战斗系统实现后再写成数据。 */
export interface SkillText {
  name: string;
  desc: string;
}

/** 天赋节点每级对五项基础属性的百分比加成。 */
export interface StatMod {
  stat: StatKey;
  pct: number;
}

export interface TalentNode {
  id: string;
  /** 1..4，进入每层需要在本分支投入的点数见 balance.ts。 */
  layer: number;
  kind: "stat" | "skill" | "core";
  name: string;
  /** 每级效果的说明。 */
  desc: string;
  maxRank: number;
  /** 每级消耗的天赋点。 */
  cost: number;
  /** 立即作用于基础属性的部分；其余效果属于战斗，等战斗系统实现后生效。 */
  mods?: StatMod[];
}

export interface TalentBranch {
  id: string;
  name: string;
  focus: string;
  nodes: TalentNode[];
}

export interface CharacterDef {
  id: CharId;
  name: string;
  /** 称号，显示在名字上方。 */
  title: string;
  /** 初始资质。base 和 growth 是这个资质下的数值。 */
  aptitude: Aptitude;
  ninjutsu: string;
  role: string;
  profile: string;
  /** 角色主题色，用于卡片描边、名牌和属性条。 */
  color: string;
  base: Stats;
  growth: Stats;
  likes: ItemId[];
  /** null 表示开局即在队伍中。 */
  recruit: { reputation: number; funds: number; facility?: [FacilityId, number] } | null;
  /** 主界面担任秘书时随机说的话。 */
  homeLines: string[];
  /** 「交谈」时随机抽取的对话。 */
  talks: string[];
  /** 以下内容按角色逐个补齐，缺少时界面显示「待补充」。 */
  talents?: TalentBranch[];
  bond?: { passive: SkillText; active: SkillText };
  secret?: {
    skill: SkillText;
    /** 秘传试炼的推荐战力。战斗系统实现前，试炼按这个数值自动结算。 */
    trialPower: number;
  };
}

export type ItemKind = "gift" | "material";

export interface ItemDef {
  id: ItemId;
  kind: ItemKind;
  name: string;
  desc: string;
  /** 物品图标上显示的字。 */
  icon: string;
  /** 商店售价，没有表示不出售。 */
  price?: number;
}

export interface TrainingDef {
  id: TrainingId;
  name: string;
  desc: string;
  gains: Partial<Stats>;
  /** 正数增加疲劳，负数表示恢复。 */
  fatigue: number;
  supplies: number;
  /** 获得的经验占当前等级升级所需经验的比例。 */
  expRatio: number;
}

export interface FacilityDef {
  id: FacilityId;
  name: string;
  desc: string;
  /** upgrades[n] 是从 n 级升到 n+1 级的花费和工期。 */
  upgrades: { funds: number; supplies: number; days: number }[];
  /** 某个等级下的效果说明。 */
  effect: (level: number) => string;
}

export interface MissionTemplate {
  id: string;
  /** 营救任务只由俘获生成，不进入普通任务栏。 */
  rescue?: boolean;
  name: string;
  desc: string;
  /** 1..5 对应 D、C、B、A、S。 */
  rank: number;
  /** 推荐的队伍总战力。 */
  power: number;
  days: number;
  slots: number;
  funds: number;
  supplies: number;
  reputation: number;
  enemies: string[];
  bg: string;
}

export interface DailyEvent {
  text: string;
  delta?: Partial<Resources>;
  /** 所有待命成员的疲劳变化。 */
  fatigue?: number;
  minDay?: number;
}

export interface MainTrigger {
  scene: string;
  day?: number;
  reputation?: number;
}

/** 剧情里 @effect 和选项附带的效果。bond 加给剧情所属的角色。 */
export interface SceneEffect {
  funds?: number;
  supplies?: number;
  reputation?: number;
  bond?: number;
}
