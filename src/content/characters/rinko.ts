import type { CharacterDef } from "../../game/defs";

export default {
  id: "rinko", name: "秋山凛子", title: "斩空的剑士", aptitude: "R",
  ninjutsu: "空遁之术", role: "学生 · 剑士",
  profile: "五车学园高年级学生，雪风的前辈。秋山家是剑术世家而非对魔血族，她凭剑道修行后天觉醒了空遁之术。继承逸刀流，佩秋山家的名刀「石切兼光」。为人正直严谨，是同学们信赖的榜样。",
  color: "#9b7bff",
  base: { hp: 150, atk: 38, def: 26, spd: 30, nin: 28 },
  growth: { hp: 9, atk: 2.8, def: 2.0, spd: 2.0, nin: 2.0 },
  likes: ["whetstone", "matcha"],
  recruit: null,
  homeLines: [
    "教官，早上好。今天也请多指教。",
    "剑要每天挥，才不会生疏。",
    "雪风又跑去哪里了……真拿她没办法。",
    "学园的事务就拜托你了。战斗方面，请交给我们。",
  ],
  talks: [
    "逸刀流讲究「一刀入魂」。每一次挥剑，都要当作最后一次。",
    "我从小就很怕打雷……这件事，请务必对雪风保密。",
    "空遁之术的诀窍在于确信。只要相信自己已经站在那里，身体就会跟上。",
    "你泡的茶……还不错。下次我来教你正式的点茶吧。",
  ],
} satisfies CharacterDef;
