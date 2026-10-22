// 结束一天：推进任务、施工、收支、恢复、俘获，刷新任务栏并检查主线剧情。

import type { FacilityId, Rng } from "./defs";
import {
  DAILY_EVENT_CHANCE, DAILY_EVENTS, hallIncome, hallReputation, infirmaryRecovery, MAIN_TRIGGERS, MAX_AP,
  MISSION_BY_ID, UPKEEP_PER_MEMBER,
} from "./registry";
import { captivityDay, recoveryDay } from "./captivity";
import { refillBoard, resolveMission } from "./missions";
import { clamp, pick, rosterIds, type DayReport, type GameState } from "./state";

export function endDay(s: GameState, rng: Rng): DayReport {
  const report: DayReport = {
    day: s.day, income: { funds: 0, supplies: 0, reputation: 0 }, upkeep: 0,
    missions: [], built: [], recovered: [], events: [], levelUps: [],
    corruption: [], located: [], fallen: [], cleansed: [],
  };
  const levels = Object.fromEntries(rosterIds(s).map((id) => [id, s.roster[id].level]));

  // 先处理已经被俘的成员，当天任务里新被俘的成员从第二天开始计算。
  captivityDay(s, report);

  for (const a of s.active) a.daysLeft--;
  for (const a of s.active.filter((x) => x.daysLeft <= 0)) {
    report.missions.push(resolveMission(s, a.members, MISSION_BY_ID[a.templateId], rng, a.target));
  }
  s.active = s.active.filter((a) => a.daysLeft > 0);

  for (const [fid, f] of Object.entries(s.facilities) as [FacilityId, GameState["facilities"][FacilityId]][]) {
    if (f.buildDaysLeft > 0 && --f.buildDaysLeft === 0) {
      f.level++;
      report.built.push(fid);
    }
  }

  const hall = s.facilities.hall.level;
  report.income = { funds: hallIncome(hall), supplies: 10, reputation: hallReputation(hall) };
  report.upkeep = UPKEEP_PER_MEMBER * rosterIds(s).length;
  s.resources.funds += report.income.funds - report.upkeep;
  s.resources.supplies += report.income.supplies;
  s.resources.reputation += report.income.reputation;

  const recovery = infirmaryRecovery(s.facilities.infirmary.level);
  for (const id of rosterIds(s)) {
    const t = s.roster[id];
    if (t.missionUid !== null || t.captive) continue;
    t.fatigue = clamp(t.fatigue - recovery, 0, 100);
    if (t.injuredDays > 0) {
      t.injuredDays = Math.max(0, t.injuredDays - (s.facilities.infirmary.level >= 3 ? 2 : 1));
      if (t.injuredDays === 0) report.recovered.push(id);
    }
  }
  recoveryDay(s, report);

  if (rng() < DAILY_EVENT_CHANCE) {
    const ev = pick(DAILY_EVENTS.filter((e) => s.day >= (e.minDay ?? 0)), rng);
    s.resources.funds += ev.delta?.funds ?? 0;
    s.resources.supplies += ev.delta?.supplies ?? 0;
    s.resources.reputation += ev.delta?.reputation ?? 0;
    if (ev.fatigue) {
      for (const id of rosterIds(s)) {
        const t = s.roster[id];
        if (t.missionUid === null && !t.captive) t.fatigue = clamp(t.fatigue + ev.fatigue, 0, 100);
      }
    }
    report.events.push(ev.text);
  }
  if (s.resources.funds < 0) {
    s.resources.reputation = Math.max(0, s.resources.reputation - 5);
    report.events.push("学园资金出现赤字，外界开始质疑学园的运营能力。声望 -5");
  }

  report.levelUps = rosterIds(s).filter((id) => s.roster[id].level > levels[id]);

  s.day++;
  s.ap = MAX_AP;
  s.board = s.board.filter((o) => o.expiresDay === null || o.expiresDay >= s.day);
  refillBoard(s, rng);

  for (const t of MAIN_TRIGGERS) {
    const due = (t.day === undefined || report.day >= t.day) && (t.reputation === undefined || s.resources.reputation >= t.reputation);
    if (due && !s.seenScenes.includes(t.scene) && !s.pendingScenes.includes(t.scene)) s.pendingScenes.push(t.scene);
  }
  return report;
}
