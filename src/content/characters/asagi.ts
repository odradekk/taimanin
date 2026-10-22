import type { CharacterDef } from "../../game/defs";

export default {
  id: "asagi", name: "井河阿莎姬", title: "最强的对魔忍", aptitude: "SSR",
  ninjutsu: "隼之术", role: "校长 · 全能",
  profile: "五车学园校长兼调查第三部总队长，被誉为「最强的对魔忍」。以隼之术的超绝神速和名刀「二荒」作战。肩负着所有对魔忍的命运，却很少让人看到她的疲惫。",
  color: "#8f6bff",
  base: { hp: 230, atk: 58, def: 42, spd: 60, nin: 52 },
  growth: { hp: 13, atk: 3.6, def: 2.6, spd: 3.6, nin: 3.2 },
  likes: ["matcha", "sake"],
  recruit: { reputation: 800, funds: 6000, facility: ["hall", 4] },
  homeLines: [
    "学园的运营交给你，我很放心。",
    "偶尔也该休息一下。这是校长命令。",
    "最强？那只是别人给的名字而已。",
    "孩子们成长得很快。这都是你的功劳。",
  ],
  talks: [
    "我一直在想，等到不需要对魔忍的那一天，这些孩子们会过上什么样的生活。",
    "樱又偷懒了吧？……算了，那孩子心里有数。",
    "隼之术很快，但再快也有赶不上的东西。所以我需要同伴。",
    "陪我喝一杯吗？就一杯。今天是个好日子。",
  ],
  // 数值为 R 资质下的每级效果，实际数值乘以资质的天赋系数。没有 mods 的效果属于战斗，等战斗系统实现后生效。
  talents: [
    {
      id: "hayabusa", name: "隼之术", focus: "速度、连续行动",
      nodes: [
        { id: "asagi_hayabusa_1", layer: 1, kind: "stat", name: "疾风", desc: "速度 +1.5%", maxRank: 5, cost: 1, mods: [{ stat: "spd", pct: 1.5 }] },
        { id: "asagi_hayabusa_2", layer: 1, kind: "stat", name: "瞬步", desc: "开场行动提前 +4%", maxRank: 5, cost: 1 },
        { id: "asagi_hayabusa_3", layer: 1, kind: "stat", name: "身法", desc: "防御 +2%", maxRank: 5, cost: 1, mods: [{ stat: "def", pct: 2 }] },
        { id: "asagi_hayabusa_4", layer: 2, kind: "stat", name: "神速", desc: "速度 +1.5%", maxRank: 5, cost: 1, mods: [{ stat: "spd", pct: 1.5 }] },
        { id: "asagi_hayabusa_5", layer: 2, kind: "stat", name: "残像", desc: "受到的伤害 −2%", maxRank: 5, cost: 1 },
        { id: "asagi_hayabusa_6", layer: 2, kind: "skill", name: "连闪", desc: "隼之术击败敌人后的行动提前从 20% 提高到 40%", maxRank: 1, cost: 5 },
        { id: "asagi_hayabusa_7", layer: 3, kind: "stat", name: "超越", desc: "速度 +1.5%", maxRank: 5, cost: 1, mods: [{ stat: "spd", pct: 1.5 }] },
        { id: "asagi_hayabusa_8", layer: 3, kind: "stat", name: "余势", desc: "攻击 +2%", maxRank: 5, cost: 1, mods: [{ stat: "atk", pct: 2 }] },
        { id: "asagi_hayabusa_9", layer: 3, kind: "skill", name: "隼返", desc: "每场战斗第一次受到单体攻击时，立即以 100% 攻击反击一次", maxRank: 1, cost: 5 },
        { id: "asagi_hayabusa_10", layer: 4, kind: "stat", name: "极速", desc: "速度 +2%", maxRank: 5, cost: 1, mods: [{ stat: "spd", pct: 2 }] },
        { id: "asagi_hayabusa_core", layer: 4, kind: "core", name: "隼", desc: "每次行动后，如果速度高于全部敌人，行动提前 25%", maxRank: 1, cost: 10 },
      ],
    },
    {
      id: "futara", name: "二荒居合", focus: "斩击、暴击、削减架势",
      nodes: [
        { id: "asagi_futara_1", layer: 1, kind: "stat", name: "刃筋", desc: "攻击 +2%", maxRank: 5, cost: 1, mods: [{ stat: "atk", pct: 2 }] },
        { id: "asagi_futara_2", layer: 1, kind: "stat", name: "见切", desc: "暴击率 +1%", maxRank: 5, cost: 1 },
        { id: "asagi_futara_3", layer: 1, kind: "stat", name: "锋芒", desc: "暴击伤害 +3%", maxRank: 5, cost: 1 },
        { id: "asagi_futara_4", layer: 2, kind: "stat", name: "居合", desc: "攻击 +2%", maxRank: 5, cost: 1, mods: [{ stat: "atk", pct: 2 }] },
        { id: "asagi_futara_5", layer: 2, kind: "stat", name: "断甲", desc: "斩击对装甲的倍率 +0.05", maxRank: 5, cost: 1 },
        { id: "asagi_futara_6", layer: 2, kind: "skill", name: "杀阵华 · 改", desc: "杀阵华的段数从 5 段增加到 7 段", maxRank: 1, cost: 5 },
        { id: "asagi_futara_7", layer: 3, kind: "stat", name: "一闪", desc: "暴击率 +1%", maxRank: 5, cost: 1 },
        { id: "asagi_futara_8", layer: 3, kind: "stat", name: "斩铁", desc: "架势削减 +6%", maxRank: 5, cost: 1 },
        { id: "asagi_futara_9", layer: 3, kind: "skill", name: "残光", desc: "光斩华命中后，目标 2 回合内受到的斩击伤害 +20%", maxRank: 1, cost: 5 },
        { id: "asagi_futara_10", layer: 4, kind: "stat", name: "刀意", desc: "攻击 +3%", maxRank: 5, cost: 1, mods: [{ stat: "atk", pct: 3 }] },
        { id: "asagi_futara_core", layer: 4, kind: "core", name: "二荒", desc: "斩击暴击时额外削减 15 点架势；对失衡目标的暴击伤害 +30%", maxRank: 1, cost: 10 },
      ],
    },
    {
      id: "commander", name: "总队长", focus: "全队增益、开场先手",
      nodes: [
        { id: "asagi_commander_1", layer: 1, kind: "stat", name: "统率", desc: "体力 +2%", maxRank: 5, cost: 1, mods: [{ stat: "hp", pct: 2 }] },
        { id: "asagi_commander_2", layer: 1, kind: "stat", name: "沉着", desc: "效果抵抗 +3%", maxRank: 5, cost: 1 },
        { id: "asagi_commander_3", layer: 1, kind: "stat", name: "威压", desc: "忍术 +2%", maxRank: 5, cost: 1, mods: [{ stat: "nin", pct: 2 }] },
        { id: "asagi_commander_4", layer: 2, kind: "stat", name: "号令", desc: "全队开场行动提前 +2%", maxRank: 5, cost: 1 },
        { id: "asagi_commander_5", layer: 2, kind: "stat", name: "坚守", desc: "防御 +2%", maxRank: 5, cost: 1, mods: [{ stat: "def", pct: 2 }] },
        { id: "asagi_commander_6", layer: 2, kind: "skill", name: "指挥", desc: "阿莎姬使用忍术后，下一名行动的队友行动提前 20%", maxRank: 1, cost: 5 },
        { id: "asagi_commander_7", layer: 3, kind: "stat", name: "鼓舞", desc: "全队攻击 +1%", maxRank: 5, cost: 1 },
        { id: "asagi_commander_8", layer: 3, kind: "stat", name: "护卫", desc: "体力 +2%", maxRank: 5, cost: 1, mods: [{ stat: "hp", pct: 2 }] },
        { id: "asagi_commander_9", layer: 3, kind: "skill", name: "殿后", desc: "阿莎姬殿后时，不再增加俘获概率", maxRank: 1, cost: 5 },
        { id: "asagi_commander_10", layer: 4, kind: "stat", name: "信赖", desc: "忍术 +3%", maxRank: 5, cost: 1, mods: [{ stat: "nin", pct: 3 }] },
        { id: "asagi_commander_core", layer: 4, kind: "core", name: "最强的对魔忍", desc: "阿莎姬在队时全队受到的伤害 −10%；每场战斗一次，队友体力低于 30% 时行动提前 30%", maxRank: 1, cost: 10 },
      ],
    },
  ],
  bond: {
    passive: { name: "总队长的指挥", desc: "阿莎姬在队时，全队开场行动提前 15%" },
    active: { name: "隼", desc: "对全体敌人造成 300% 攻击的斩击伤害，然后全队行动提前 30%" },
  },
  secret: {
    skill: { name: "光斩华", desc: "可以攻击后排的斩击剑气，对单体造成极高伤害，架势直接清空" },
    trialPower: 2000,
  },
} satisfies CharacterDef;
