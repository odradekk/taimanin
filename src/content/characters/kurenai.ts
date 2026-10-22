import type { CharacterDef } from "../../game/defs";

export default {
  id: "kurenai", name: "心愿寺红", title: "朱月的剑士", aptitude: "SR",
  ninjutsu: "风遁之术", role: "剑士 · 夜战",
  profile: "心愿寺流小太刀剑术的传人，身上流着一半吸血鬼的血，夜晚时力量会大幅提升。原本是活跃在千崎港口暗街的自由对魔忍。沉默寡言，不擅长与人相处，但一旦认定的人就会全力守护。",
  color: "#e5484d",
  base: { hp: 160, atk: 46, def: 24, spd: 38, nin: 30 },
  growth: { hp: 9, atk: 3.2, def: 1.6, spd: 2.6, nin: 2.0 },
  likes: ["tomato", "whetstone"],
  recruit: { reputation: 350, funds: 3000, facility: ["intel", 2] },
  homeLines: [
    "……今天的月亮，很好看。",
    "白天有点困。不是偷懒。",
    "有什么需要斩的东西，叫我。",
    "……你身边很安静。不讨厌。",
  ],
  talks: [
    "我身上的血，让很多人害怕我。你不怕吗？……是吗。",
    "番茄汁……只是喜欢味道而已。不是因为别的。",
    "祖父说，剑是用来守护的。我还在学习，要守护什么。",
    "以前我总是一个人。现在……好像不一样了。",
  ],
} satisfies CharacterDef;
