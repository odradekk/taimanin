import type { CharacterDef } from "../../game/defs";

export default {
  id: "asuka", name: "甲河明日香", title: "钢铁的对魔忍", aptitude: "R",
  ninjutsu: "风神之术", role: "学生 · 重装",
  profile: "五车学园高年级学生，甲河世家的年轻当主，也是家族灭门惨案中唯一的幸存者。重伤后四肢都换上了机械义肢，并把义肢兵装和忍术融为一体。性格开朗直率，热衷于改造和调校装备。",
  color: "#ffb03a",
  base: { hp: 175, atk: 40, def: 34, spd: 26, nin: 26 },
  growth: { hp: 11, atk: 2.8, def: 2.6, spd: 1.6, nin: 1.8 },
  likes: ["parts", "yokan"],
  recruit: { reputation: 180, funds: 1800, facility: ["lab", 1] },
  homeLines: [
    "教官！研究所的车床能借我用一下吗？就一下下！",
    "义肢的输出又提升了百分之三，嘿嘿。",
    "别担心，这只手比原来的还好用。",
    "今天想打一场痛快的！",
  ],
  talks: [
    "刚装上义肢的时候，我连杯子都握不住。现在我能单手举起一辆摩托哦。",
    "甲河家和井河家以前有很多过节。不过那都是上一辈的事啦。",
    "被雨淋到的时候关节会有点响……啊，不是生锈！是正常现象！",
    "你说我变强了？嘿嘿，那当然，我可是每天都在升级的！",
  ],
} satisfies CharacterDef;
