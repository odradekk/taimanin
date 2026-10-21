import { describe, expect, it } from "vitest";
import { FACILITIES, intelBoardSize } from "./data/facilities";
import { MISSION_BY_ID } from "./data/missions";
import {
  bondLevel, dispatch, endDay, GameError, loadState, MAX_AP, newGame, recruit, recruitBlocker,
  SAVE_VERSION, talk, train, upgrade,
} from "./rules";

const always = (v: number) => () => v;

describe("新游戏", () => {
  it("开局有两名成员、满行动力、待播放序章和填满的任务栏", () => {
    const s = newGame("测试", always(0.5));
    expect(Object.keys(s.roster).sort()).toEqual(["rinko", "yukikaze"]);
    expect(s.ap).toBe(MAX_AP);
    expect(s.pendingScenes).toEqual(["prologue"]);
    expect(s.board).toHaveLength(intelBoardSize(0));
  });
});

describe("训练和互动", () => {
  it("训练消耗行动力和物资并提升属性，行动力用完后拒绝", () => {
    const s = newGame("测试", always(0.5));
    const supplies = s.resources.supplies;
    const r = train(s, "rinko", "physical", always(0.5));
    expect(s.ap).toBe(MAX_AP - 1);
    expect(s.resources.supplies).toBeLessThan(supplies);
    expect(s.roster.rinko!.trained.hp).toBe(r.gains.hp);
    expect(r.gains.hp).toBeGreaterThan(0);
    s.ap = 0;
    expect(() => train(s, "rinko", "physical", always(0.5))).toThrow(GameError);
  });

  it("没有忍术研究所时不能忍术修行", () => {
    const s = newGame("测试", always(0.5));
    expect(() => train(s, "rinko", "ninjutsu", always(0.5))).toThrow(GameError);
  });

  it("同一天只能交谈一次，第二天恢复", () => {
    const s = newGame("测试", always(0.5));
    talk(s, "yukikaze", always(0.5));
    expect(() => talk(s, "yukikaze", always(0.5))).toThrow(GameError);
    endDay(s, always(0.99));
    expect(() => talk(s, "yukikaze", always(0.5))).not.toThrow();
  });

  it("羁绊等级随羁绊值提升", () => {
    expect(bondLevel(0)).toBe(1);
    expect(bondLevel(60)).toBe(2);
    expect(bondLevel(10_000)).toBe(5);
  });
});

describe("经营", () => {
  it("招募条件依次检查声望和宿舍容量", () => {
    const s = newGame("测试", always(0.5));
    expect(recruitBlocker(s, "sakura")).toMatch(/声望/);
    s.resources.reputation = 1000;
    recruit(s, "sakura");
    expect(s.roster.sakura).toBeDefined();
    s.roster.shiranui = { ...s.roster.sakura!, id: "shiranui" };
    s.facilities.lab.level = 1;
    expect(recruitBlocker(s, "asuka")).toBe("宿舍已满");
  });

  it("设施在工期结束后升级", () => {
    const s = newGame("测试", always(0.99));
    upgrade(s, "dorm");
    const days = FACILITIES.dorm.upgrades[1].days;
    for (let i = 0; i < days - 1; i++) endDay(s, always(0.99));
    expect(s.facilities.dorm.level).toBe(1);
    const report = endDay(s, always(0.99));
    expect(report.built).toEqual(["dorm"]);
    expect(s.facilities.dorm.level).toBe(2);
  });

  it("派遣的成员在任务期间不可用，结束后带回奖励", () => {
    const s = newGame("测试", always(0.5));
    const offer = s.board[0];
    const m = MISSION_BY_ID[offer.templateId];
    dispatch(s, offer.uid, ["rinko"]);
    expect(() => train(s, "rinko", "physical", always(0.5))).toThrow(GameError);
    let report = endDay(s, always(0));
    for (let i = 1; i < m.days; i++) report = endDay(s, always(0));
    expect(report.missions).toHaveLength(1);
    expect(report.missions[0].result).not.toBe("fail");
    expect(s.roster.rinko!.missionUid).toBeNull();
    expect(s.stats.missionsWon).toBe(1);
  });

  it("第 7 天结束时触发第一周剧情", () => {
    const s = newGame("测试", always(0.99));
    for (let i = 0; i < 6; i++) endDay(s, always(0.99));
    expect(s.pendingScenes).not.toContain("main_week1");
    endDay(s, always(0.99));
    expect(s.pendingScenes).toContain("main_week1");
  });
});

describe("存档", () => {
  it("拒绝无效数据和来自更新版本的存档", () => {
    expect(() => loadState({})).toThrow(GameError);
    const s = newGame("测试", always(0.5));
    expect(loadState(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(() => loadState({ ...s, version: SAVE_VERSION + 1 })).toThrow(GameError);
  });
});
