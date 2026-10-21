import type { SceneDef } from "../scenes";

export const RECRUIT_SCENES: SceneDef[] = [
  {
    id: "recruit_sakura", title: "樱 · 从影子里来", kind: "recruit", char: "sakura",
    script: `
      @bg classroom
      放学后的教室。我在核对下周的训练表。
      桌子下面的影子，忽然鼓了起来。
      @show sakura center
      sakura: 当当～！吓到了吗？
      @choice
      > 早就猜到是你了 | bond=+3
        me: 学园里会从影子里冒出来的，只有樱老师吧。
        sakura: 欸——被看穿了。教官越来越不好玩了。
      > 吓了一大跳 | bond=+5
        me: ……心脏差点停了。
        sakura: 嘿嘿，大成功！这个反应我给满分～
      sakura: 好啦，说正事。教官，我想加入你的队伍。
      me: 樱老师要上前线？
      sakura: 我本来就是对魔忍嘛。只是这几年一直在教书。
      sakura: 最近学园的名声好起来了，委托也越来越多。
      sakura: 学生们一个个出去执行任务，我却只能在教室里等消息。
      sakura: 那种感觉……不太好受。
      sakura: 而且，有我跟着，孩子们出任务也能安心一点吧？
      me: 校长那边怎么说？
      sakura: 姐姐说：「去问教官。」
      sakura: 所以我就来问啦。教官，你愿意收下我吗？
      @choice
      > 欢迎加入 | bond=+5
        me: 当然。有樱老师在，大家都会更安心。
        sakura: 太好了！我会努力的，绝对不给你添麻烦！
      > 课程那边不要紧吗？ | bond=+2
        me: 欢迎。不过，你的课程不会耽误吗？
        sakura: 呜……放心啦，我会好好安排的。大概。
      sakura: 影遁之术最擅长潜入和奇袭。
      sakura: 侦察、偷袭、救人，交给我准没错。
      sakura: 啊，还有一件事。
      sakura: 在队伍里，别叫我「阿莎姬的妹妹」哦。
      sakura: 我就是我。井河樱，请多指教，教官！
      樱的影子轻轻晃了一下，好像也在打招呼。
      井河樱加入了队伍。
    `,
  },
  {
    id: "recruit_shiranui", title: "不知火 · 归来", kind: "recruit", char: "shiranui",
    script: `
      @bg infirmary
      翻新后的医务室，药柜里还飘着新木头的味道。
      一位陌生的女性正在整理药架。
      @show shiranui right
      shiranui: 啊，你就是{player}教官吧？初次见面。
      shiranui: 我是水城不知火。雪风平时承蒙你照顾了。
      me: 雪风的……母亲？
      shiranui: 是的。这些年我一直在外面执行任务，很少回学园。
      shiranui: 前阵子听说，五车学园来了一位很能干的教官。
      shiranui: 医务室也翻新了，所以我向阿莎姬申请，回来帮忙。
      shiranui: 照顾伤员，我还算有些经验。前线的任务也可以交给我。
      走廊里传来一阵急促的脚步声。
      @show yukikaze left
      yukikaze: 妈妈！？你怎么在这里！
      shiranui: 雪风。好久不见，你又长高了呢。
      yukikaze: 回、回来也不先说一声！我又不是在等你……
      shiranui: 嗯嗯，我知道。
      yukikaze: 教官！你早就知道了吧？
      @choice
      > 我也是刚刚才见到 | bond=+3
        me: 我也是刚刚才见到。真的。
        yukikaze: ……哼，那就算了。
        shiranui: 雪风，对教官要有礼貌哦。
      > 雪风看起来很高兴 | bond=+5
        me: 雪风，你看起来很高兴。
        yukikaze: 才、才没有！我只是跑得太急了！
        shiranui: 呵呵。这孩子，嘴硬心软呢。
      shiranui: 教官。这孩子有没有给你添麻烦？
      yukikaze: 我才没有添麻烦！
      me: 雪风是队里最拼命的人。我很依赖她。
      yukikaze: ……
      shiranui: 是吗。……谢谢你。
      shiranui: 我的水遁擅长制造幻影，扰乱敌人。
      shiranui: 年轻人在前面冲，我在后面帮忙看着就好。
      shiranui: 战场上最重要的不是赢，而是活着回来。
      shiranui: 这一点，我会和孩子们一起记住。
      shiranui: 今后请多指教，教官。
      yukikaze: ……欢迎回来，妈妈。
      水城不知火加入了队伍。
    `,
  },
  {
    id: "recruit_asuka", title: "明日香 · 甲河的来客", kind: "recruit", char: "asuka",
    script: `
      @bg academy
      [学生A] 教官！大门口有个人，说要见你！
      @show asuka center
      asuka: 你就是这里的教官？我是甲河明日香！
      asuka: 听说五车学园建了忍术研究所，是真的吗？
      me: 是真的。前不久刚完工。
      asuka: 太好了！我想加入你们，顺便借用研究所的设备！
      me: ……顺便？
      asuka: 啊，不对不对，加入才是主要的！设备是顺便……一半一半吧。
      asuka: 甲河流和井河流以前有很多过节，这我知道。
      asuka: 不过那都是上一辈的事啦。我想在这里变得更强。
      她握了握拳。金属关节发出轻微的声响，在阳光下闪着光。
      asuka: 这只手是义肢。以前受过一次重伤，就换上了它。
      asuka: 不过别担心，它比原来的还好用！
      @choice
      > 能让我看看它的性能吗 | bond=+5
        me: 能让我看看它的性能吗？
        asuka: 好啊！你看着——
        她单手抓住门边的石灯笼，轻轻松松地举了起来。
        asuka: 嘿嘿，怎么样？
        me: ……很厉害。请放回原处。
      > 受伤的时候，一定很辛苦吧 | bond=+3
        me: 受那么重的伤，一定很辛苦吧。
        asuka: ……嗯，是有一点。不过都过去啦！
        asuka: 现在的我，每天都在升级哦。
      asuka: 我的甲河流机甲忍术，最擅长正面硬碰硬。
      asuka: 重活、苦活、需要有人顶在前面的活，都交给我！
      asuka: 作为交换，研究所的车床……
      me: 训练结束以后，可以用。
      asuka: 成交！教官，以后请多指教！
      甲河明日香加入了队伍。
    `,
  },
  {
    id: "recruit_murasaki", title: "紫 · 阿莎姬大人的命令", kind: "recruit", char: "murasaki",
    script: `
      @bg dojo
      扩建后的训练场里，器材摆得整整齐齐。
      一位女性正在逐一检查器材，动作一丝不苟。
      @show murasaki right
      murasaki: ……你就是那个教官？
      me: 是的。请问你是？
      murasaki: 八津紫。五车学园的教师。
      murasaki: 阿莎姬大人命令我，加入你负责的队伍。
      murasaki: 所以我来了。仅此而已。
      me: ……看来不是自愿的。
      murasaki: 阿莎姬大人的命令，就是我的意愿。
      她拿起一根训练用的木棍，掂了掂分量。
      murasaki: 训练场的器材，比以前好多了。
      murasaki: 至少不会一碰就坏。这一点，我承认是你的功劳。
      @choice
      > 这里还能做得更好 | bond=+5
        me: 还不够。我想让这里成为学园最好的训练场。
        murasaki: ……哼。口气不小。那我就看着。
      > 多谢夸奖 | bond=+2
        me: 能得到八津老师的认可，我很荣幸。
        murasaki: 我没有夸你。只是陈述事实。
      murasaki: 先说清楚。我的忍法叫「不死觉醒」。
      murasaki: 再重的伤，我都能很快恢复。
      murasaki: 所以出任务的时候，让我站在最前面。
      murasaki: 别让那些学生替我挨刀。
      me: ……我记住了。
      @show asagi left
      asagi: 紫，又在吓唬人了？
      murasaki: 阿、阿莎姬大人！我没有……我只是在交代注意事项。
      asagi: 教官，紫的态度是冷了一点。但她比谁都可靠。
      asagi: 拜托你了。
      murasaki: ……既然阿莎姬大人这么说。
      murasaki: 我认同你的工作。但这不代表我信任你。
      murasaki: 想让我信任，就拿出结果来。
      八津紫加入了队伍。
    `,
  },
  {
    id: "recruit_kurenai", title: "红 · 雨夜的剑士", kind: "recruit", char: "kurenai",
    script: `
      @bg city_night
      雨刚停。旧城区的小巷里，霓虹灯一闪一闪。
      情报室的报告说，最近每到夜里，这一带都有魔族被人斩杀。
      动手的，似乎是一名很少来上课的五车学园学生。
      巷子深处，传来收刀入鞘的声音。
      @show kurenai center
      kurenai: ……谁。
      me: 五车学园的教官。我叫{player}。
      kurenai: 教官……来抓逃课的学生吗。
      me: 不是。我是来找你的。心愿寺红，对吧？
      霓虹灯下，她的眼睛泛着淡淡的红光。
      kurenai: 你知道我是什么人吗。
      kurenai: 我身上流着一半吸血鬼的血。
      kurenai: 学园里很多人怕我。所以我很少去。
      kurenai: 你不怕吗。
      @choice
      > 不怕 | bond=+5
        me: 不怕。你刚才斩的是魔族，不是人。
        kurenai: ……是吗。
      > 老实说，有一点 | bond=+3
        me: 老实说，有一点。但我更想多了解你。
        kurenai: ……奇怪的人。
      kurenai: 找我做什么。
      me: 我想请你加入我负责的队伍。
      me: 一个人在夜里战斗，太危险了。
      kurenai: 我一直都是一个人。没出过事。
      me: 那只是运气好。总有一天会出事的。
      kurenai: ……
      kurenai: 师父说过，剑是用来守护的。
      kurenai: 我还不知道，自己要守护什么。
      kurenai: 跟着你，能找到吗。
      me: 我不能保证。但我们可以一起找。
      kurenai: ……好。
      kurenai: 夜里的任务，交给我。夜越深，我越强。
      kurenai: 白天……可能会有点困。不是偷懒。
      me: 我会安排好的。
      kurenai: 心愿寺红。请多指教，教官。
      心愿寺红加入了队伍。
    `,
  },
  {
    id: "recruit_asagi", title: "阿莎姬 · 校长出阵", kind: "recruit", char: "asagi",
    script: `
      @bg office
      @show asagi center
      asagi: {player}教官，有件事想和你商量。
      asagi: 我想加入你的队伍，参加任务轮换。
      me: 校长亲自上前线？
      asagi: 我本来就是对魔忍。只是这些年被文件埋住了。
      asagi: 现在，学园的运营交给你，我很放心。
      asagi: 教学楼扩建好了，经费也稳定了。我终于能腾出手来。
      @hide
      @show asagi left
      @show sakura right
      sakura: 姐姐！我都听到了哦！要上前线的话，带上我！
      asagi: 樱。偷听也要挑时候。
      sakura: 我是正大光明地站在影子里听的！
      @choice
      > 欢迎加入，校长 | bond=+5
        me: 求之不得。欢迎加入，校长。
        asagi: 嗯。在队伍里，我就是你手下的一名对魔忍。
        asagi: 不用对我客气。该怎么派遣，就怎么派遣。
      > 组织的事务谁来处理？ | bond=+3
        me: 校长去了前线，组织的事务怎么办？
        asagi: 能交给别人的，我都交出去了。剩下的，回来再处理。
        sakura: 姐姐终于学会把工作分给别人了！
      asagi: 我的隼之术很快。大多数敌人，连我的影子都看不到。
      asagi: 但再快，也有赶不上的东西。
      asagi: 所以我需要同伴。需要你，还有大家。
      sakura: 说得真好听～其实是在办公室待腻了吧？
      asagi: ……樱。
      sakura: 嘿嘿，我错了～
      asagi: 从今天起，最强的对魔忍听你指挥。
      asagi: 尽管派我出去吧，教官。
      井河阿莎姬加入了队伍。
    `,
  },
];
