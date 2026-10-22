import type { DailyEvent } from "../game/defs";

/** 每天结束时有一定概率随机发生其中一件。 */
export const DAILY_EVENTS: DailyEvent[] = [
  { text: "学生们自发组织了校园清扫，五车町的居民交口称赞。", delta: { reputation: 8 } },
  { text: "后勤部门在仓库角落找到一批还能用的训练物资。", delta: { supplies: 30 } },
  { text: "一位匿名支持者向学园捐了一笔钱。", delta: { funds: 500 } },
  { text: "暴雨让训练场漏了水，维修花了一笔钱。", delta: { funds: -300 } },
  { text: "附近出现了骚扰居民的低级魔族，巡逻的学生顺手解决了。", delta: { reputation: 5 } },
  { text: "食堂推出了新菜单，大家的心情都不错。", fatigue: -10 },
  { text: "内务省的监察员来访，对学园的运营表示满意。", delta: { reputation: 12 }, minDay: 10 },
  { text: "合作的铁匠铺送来一批新打的苦无。", delta: { supplies: 50 }, minDay: 5 },
];
