import type { CharacterDef } from "../../game/defs";

export default {
  id: "shiranui", name: "水城不知火", title: "幻影的对魔忍", aptitude: "SR",
  ninjutsu: "水遁之术与幻影之术", role: "资深 · 支援",
  profile: "雪风的母亲，调查第三部的资深特级对魔忍，也是学园的高级参谋。以水遁之术和幻影之术扰乱敌阵，手持对魔薙刀作战。温柔沉稳，被年轻的对魔忍们视为精神支柱。",
  color: "#46c9c0",
  base: { hp: 170, atk: 30, def: 32, spd: 34, nin: 44 },
  growth: { hp: 10, atk: 2.0, def: 2.4, spd: 2.2, nin: 3.0 },
  likes: ["matcha", "novel"],
  recruit: { reputation: 120, funds: 1500, facility: ["infirmary", 2] },
  homeLines: [
    "辛苦了。要不要喝杯茶，稍微休息一下？",
    "雪风有没有给你添麻烦？那孩子嘴硬心软呢。",
    "幻影的诀窍，是先骗过自己。",
    "学园能这样热闹，真好啊。",
  ],
  talks: [
    "我年轻的时候也像雪风一样，总想着要证明自己。现在回头看，真是可爱呢。",
    "战场上最重要的不是赢，而是活着回来。请你一定记住。",
    "水是最柔软的东西，也是最强大的东西。人也是一样的。",
    "下次来我家吃饭吧？雪风一定会假装不高兴，然后偷偷多盛一碗给你。",
  ],
} satisfies CharacterDef;
