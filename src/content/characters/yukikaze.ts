import type { CharacterDef } from "../../game/defs";

export default {
  id: "yukikaze", name: "水城雪风", title: "雷击的对魔忍", aptitude: "R",
  ninjutsu: "雷遁之术", role: "学生 · 突击",
  profile: "五车学园一年级学生，水城不知火的独生女。以雷遁之术配合特制双枪「音速射手」高速突击。好胜心强、嘴上从不服输，其实非常重视同伴。",
  color: "#5ab4ff",
  base: { hp: 140, atk: 34, def: 20, spd: 36, nin: 32 },
  growth: { hp: 8, atk: 2.6, def: 1.6, spd: 2.6, nin: 2.4 },
  likes: ["gunkit", "yokan"],
  recruit: null,
  homeLines: [
    "教官，今天的训练菜单是什么？别太轻松了，我可不想偷懒。",
    "凛子前辈又在练剑了，我才不会输给她。",
    "……干嘛一直盯着我看？有事就快说啦。",
    "任务交给我就对了，雷遁可是很快的。",
  ],
  talks: [
    "我妈妈以前也是这所学园的学生哦。总有一天，我要成为比她更厉害的对魔忍。",
    "枪的保养要每天做，不然关键时刻卡壳可就麻烦了。……你要看吗？",
    "凛子前辈太认真了，偶尔也该放松一下嘛。……这话可别告诉她是我说的。",
    "你这个教官，好像也没有我想象中那么不靠谱。嗯，只是一点点。",
  ],
} satisfies CharacterDef;
