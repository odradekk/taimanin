import type { CharacterDef } from "../../game/defs";

export default {
  id: "murasaki", name: "八津紫", title: "不死的对魔忍", aptitude: "SR",
  ninjutsu: "不死觉醒", role: "教师 · 守护",
  profile: "井河阿莎姬最忠实的部下，五车学园的教师。八津世家的忍术「不死觉醒」让她的肉体近乎不死，还拥有超常的怪力，挥舞重型战斧冲在最前面。对阿莎姬以外的人态度冷淡，但对工作一丝不苟。",
  color: "#b05cff",
  base: { hp: 220, atk: 42, def: 40, spd: 22, nin: 24 },
  growth: { hp: 13, atk: 2.8, def: 3.0, spd: 1.4, nin: 1.6 },
  likes: ["sake", "yokan"],
  recruit: { reputation: 250, funds: 2500, facility: ["dojo", 2] },
  homeLines: [
    "……有事吗？没事的话我要去巡视了。",
    "阿莎姬大人今天也很忙。别拿琐事去打扰她。",
    "训练场的器材又被学生弄坏了。真是不像话。",
    "你的工作，还算可以。",
  ],
  talks: [
    "不死觉醒让我能承受常人无法承受的伤。所以站在最前面的，应该是我。",
    "我认同你，不代表我信任你。……不过，最近有一点点改观了。",
    "阿莎姬大人是我的恩人。为了她，我什么都愿意做。",
    "清酒？……哼，算你有眼光。",
  ],
} satisfies CharacterDef;
