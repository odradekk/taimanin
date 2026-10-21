import type { CharId, FacilityId, GiftId, Rarity, Stats } from "../types";

export interface CharacterDef {
  id: CharId;
  name: string;
  /** 称号，显示在名字上方。 */
  title: string;
  rarity: Rarity;
  ninjutsu: string;
  role: string;
  profile: string;
  /** 角色主题色，用于卡片描边、名牌和属性条。 */
  color: string;
  base: Stats;
  growth: Stats;
  likes: GiftId[];
  /** null 表示开局即在队伍中。 */
  recruit: { reputation: number; funds: number; facility?: [FacilityId, number] } | null;
  /** 主界面担任秘书时随机说的话。 */
  homeLines: string[];
  /** 「交谈」时随机抽取的对话。 */
  talks: string[];
}

export const CHARACTERS: Record<CharId, CharacterDef> = {
  yukikaze: {
    id: "yukikaze", name: "水城雪风", title: "雷击的对魔忍", rarity: "SR",
    ninjutsu: "雷遁之术", role: "学生 · 突击",
    profile: "五车学园的学生，水城不知火的女儿。擅长以雷遁之术配合双枪作战。好胜心强、嘴上从不服输，其实非常重视同伴。",
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
  },
  rinko: {
    id: "rinko", name: "秋山凛子", title: "斩空的剑士", rarity: "SR",
    ninjutsu: "空遁之术", role: "学生 · 剑士",
    profile: "五车学园的学生，雪风的前辈。继承逸刀流剑术，能以空遁之术瞬间跨越距离斩击。为人正直严谨，是同学们信赖的榜样。",
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
      "我小时候其实很怕打雷……这件事，请对雪风保密。",
      "空遁之术的诀窍在于确信。只要相信自己已经站在那里，身体就会跟上。",
      "你泡的茶……还不错。下次我来教你正式的点茶吧。",
    ],
  },
  sakura: {
    id: "sakura", name: "井河樱", title: "影之对魔忍", rarity: "SR",
    ninjutsu: "影遁之术", role: "教师 · 奇袭",
    profile: "井河阿莎姬的妹妹，五车学园的教师。能潜入影子中移动和突袭。性格开朗随性，是学生们最亲近的老师。",
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
  },
  shiranui: {
    id: "shiranui", name: "水城不知火", title: "幻影的对魔忍", rarity: "SR",
    ninjutsu: "水遁 · 幻影之术", role: "资深 · 支援",
    profile: "雪风的母亲，经验丰富的资深对魔忍。以水遁制造幻影扰乱敌人。温柔沉稳，在后辈面前总是带着包容的微笑。",
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
  },
  asuka: {
    id: "asuka", name: "甲河明日香", title: "钢铁的对魔忍", rarity: "SR",
    ninjutsu: "甲河流 · 机甲忍术", role: "学生 · 重装",
    profile: "甲河流的继承者。在一次重伤后换上了机械义肢，反而把它变成了自己的武器。性格开朗直率，热衷于改造和调校装备。",
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
      "甲河流和井河流以前有很多过节。不过那都是上一辈的事啦。",
      "被雨淋到的时候关节会有点响……啊，不是生锈！是正常现象！",
      "你说我变强了？嘿嘿，那当然，我可是每天都在升级的！",
    ],
  },
  murasaki: {
    id: "murasaki", name: "八津紫", title: "不死的对魔忍", rarity: "SR",
    ninjutsu: "不死觉醒", role: "教师 · 守护",
    profile: "井河阿莎姬最忠实的部下，五车学园的教师。拥有能从重伤中迅速恢复的忍法。对阿莎姬以外的人态度冷淡，但对工作一丝不苟。",
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
      "我的忍法让我能承受常人无法承受的伤。所以站在最前面的，应该是我。",
      "我认同你，不代表我信任你。……不过，最近有一点点改观了。",
      "阿莎姬大人是我的恩人。为了她，我什么都愿意做。",
      "清酒？……哼，算你有眼光。",
    ],
  },
  kurenai: {
    id: "kurenai", name: "心愿寺红", title: "朱月的剑士", rarity: "SR",
    ninjutsu: "心愿寺流 · 血月剑", role: "剑士 · 夜战",
    profile: "心愿寺流的剑士，身上流着一半吸血鬼的血。夜晚时力量会大幅提升。沉默寡言，不擅长与人相处，但一旦认定的人就会全力守护。",
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
      "师父说，剑是用来守护的。我还在学习，要守护什么。",
      "以前我总是一个人。现在……好像不一样了。",
    ],
  },
  asagi: {
    id: "asagi", name: "井河阿莎姬", title: "最强的对魔忍", rarity: "SSR",
    ninjutsu: "隼之术", role: "校长 · 全能",
    profile: "五车学园的校长，被誉为「最强的对魔忍」。以超越常人认知的速度战斗。肩负着整个对魔忍组织的命运，却很少让人看到她的疲惫。",
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
  },
};

export const CHAR_ORDER: CharId[] = ["yukikaze", "rinko", "sakura", "shiranui", "asuka", "murasaki", "kurenai", "asagi"];
