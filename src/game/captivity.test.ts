import { describe, expect, it } from "vitest";
import {
  capture, captivityDay, CORRUPTION_PER_LEVEL, DAILY_CORRUPTION, dispatch, endDay, isAvailable, MISSION_BY_ID, newGame,
  talk, type DayReport, type GameState,
} from ".";

const always = (v: number) => () => v;
const emptyReport = (): DayReport => ({
  day: 1, income: { funds: 0, supplies: 0, reputation: 0 }, upkeep: 0, missions: [], built: [], recovered: [],
  events: [], levelUps: [], corruption: [], located: [], fallen: [], cleansed: [],
});

/** 雪风在 D 级任务「巡逻五车町」中被俘。 */
function captured(): GameState {
  const s = newGame("测试", always(0.5));
  expect(capture(s, "yukikaze", MISSION_BY_ID.patrol, always(0))).toBe(true);
  return s;
}

describe("俘获", () => {
  it("俘获判定按任务等级的概率", () => {
    const s = newGame("测试", always(0.5));
    expect(capture(s, "yukikaze", MISSION_BY_ID.patrol, always(0.5))).toBe(false);
    expect(capture(s, "yukikaze", MISSION_BY_ID.patrol, always(0.1))).toBe(true);
    expect(s.roster.yukikaze.captive).toMatchObject({ rank: 1, locateDaysLeft: 5, missionId: "patrol" });
    expect(s.secretary).toBe("rinko");
    expect(isAvailable(s.roster.yukikaze)).toBe(false);
  });

  it("任务失败时成员被俘或负重伤", () => {
    const s = newGame("测试", always(0.5));
    const offer = s.board[0];
    dispatch(s, offer.uid, ["rinko", "yukikaze"]);
    let report = endDay(s, always(0.99));
    for (let i = 1; i < MISSION_BY_ID[offer.templateId].days; i++) report = endDay(s, always(0.99));
    const outcome = report.missions[0];
    expect(outcome.result).toBe("fail");
    expect([...outcome.captured, ...outcome.injured].sort()).toEqual(["rinko", "yukikaze"]);
  });
});

describe("被俘期间", () => {
  it("情报室定位后出现不会过期的营救任务，比原任务高一级", () => {
    const s = captured();
    for (let i = 0; i < 4; i++) captivityDay(s, emptyReport());
    expect(s.board.some((o) => o.target)).toBe(false);
    const report = emptyReport();
    captivityDay(s, report);
    expect(report.located).toEqual(["yukikaze"]);
    expect(s.board.find((o) => o.target === "yukikaze")).toMatchObject({ templateId: "rescue_2", expiresDay: null });
  });

  it("每天累积堕落值，羁绊越高越慢；每升一级加入一段堕落剧情", () => {
    const s = captured();
    captivityDay(s, emptyReport());
    expect(s.roster.yukikaze.corruption).toBe(DAILY_CORRUPTION[0]);

    const bonded = captured();
    bonded.roster.yukikaze.bond = 3_200;
    captivityDay(bonded, emptyReport());
    expect(bonded.roster.yukikaze.corruption).toBe(Math.round(DAILY_CORRUPTION[0] * 0.64));

    s.roster.yukikaze.corruption = CORRUPTION_PER_LEVEL - 1;
    const report = emptyReport();
    captivityDay(s, report);
    expect(report.corruption).toEqual([{ id: "yukikaze", level: 1 }]);
    expect(s.pendingScenes).toContain("fall_yukikaze_1");
  });

  it("同一等级的堕落剧情只播放一次", () => {
    const s = captured();
    s.roster.yukikaze.fallSeen = 3;
    s.roster.yukikaze.corruption = 3 * CORRUPTION_PER_LEVEL - 1;
    captivityDay(s, emptyReport());
    expect(s.pendingScenes.some((id) => id.startsWith("fall_"))).toBe(false);
  });

  it("堕落等级到 10 级时永久离队，营救任务消失", () => {
    const s = captured();
    s.board.push({ uid: 99, templateId: "rescue_2", expiresDay: null, target: "yukikaze" });
    s.roster.yukikaze.corruption = 10 * CORRUPTION_PER_LEVEL - 1;
    const report = emptyReport();
    captivityDay(s, report);
    expect(report.fallen).toEqual(["yukikaze"]);
    expect(s.roster.yukikaze).toBeUndefined();
    expect(s.fallen).toMatchObject([{ id: "yukikaze", missionId: "patrol" }]);
    expect(s.board.some((o) => o.target === "yukikaze")).toBe(false);
    expect(s.pendingScenes).toContain("fall_yukikaze_10");
  });
});

describe("营救与恢复", () => {
  it("营救任务成功后成员归队进入恢复期，堕落值逐日降低，交谈额外降低", () => {
    const s = captured();
    s.roster.yukikaze.corruption = 250;
    s.board.push({ uid: 99, templateId: "rescue_2", expiresDay: null, target: "yukikaze" });
    s.resources.reputation = 1000;
    dispatch(s, 99, ["rinko"]);
    for (let i = 0; i < MISSION_BY_ID.rescue_2.days; i++) endDay(s, always(0));
    const t = s.roster.yukikaze;
    expect(t.captive).toBeNull();
    expect(s.pendingScenes).toContain("rescue_yukikaze");
    expect(t.corruption).toBeGreaterThan(0);
    expect(isAvailable(t)).toBe(false);

    // 医务室 1 级：每天降低 10 + 10 × 1。
    const rescued = t.corruption;
    endDay(s, always(0.99));
    expect(t.corruption).toBe(rescued - 20);
    talk(s, "yukikaze", always(0.5));
    expect(t.corruption).toBe(rescued - 40);
    for (let i = 0; i < 20 && t.corruption > 0; i++) endDay(s, always(0.99));
    expect(t.corruption).toBe(0);
  });
});
