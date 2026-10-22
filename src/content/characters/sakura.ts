import type { CharacterDef } from "../../game/defs";

export default {
  id: "sakura", name: "井河樱", title: "影之对魔忍", aptitude: "SR",
  ninjutsu: "影遁之术", role: "教师 · 奇袭",
  profile: "井河阿莎姬的妹妹，五车学园的教师，也是调查第三部的现役奇袭队员。能以影遁之术潜入影子中移动和突袭。性格开朗随性，是学生们最亲近的「樱老师」。",
  color: "#ff7aa8",
  base: { hp: 160, atk: 36, def: 24, spd: 40, nin: 36 },
  growth: { hp: 9, atk: 2.4, def: 1.8, spd: 2.8, nin: 2.6 },
  likes: ["yokan", "novel"],
  recruit: { reputation: 30, funds: 800 },
  homeLines: [
    "嗨嗨～教官，今天也要元气满满哦！",
    "姐姐又在办公室加班了，真是的，都不知道休息。",
    "偷偷告诉你，食堂今天的甜点是限定款！",
    "有影子的地方，就是我的地盘～",
  ],
  talks: [
    "被人叫「阿莎姬的妹妹」的时候，我其实有一点点不服气啦。我就是我嘛。",
    "当老师比我想象的还要开心！虽然批改作业很要命……",
    "影遁的时候世界会变得好安静。有时候我会躲在里面偷懒……嘘。",
    "教官来了之后，学园变得热闹多了呢。谢谢你哦。",
  ],
} satisfies CharacterDef;
