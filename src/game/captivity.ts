// 俘获、堕落、营救和恢复。规则见 docs/design/character-progression.md 的「俘获与堕落等级」。

import type { CharId, MissionTemplate, Rng } from "./defs";
import {
  CAPTURE_CHANCE, CORRUPTION_BOND_RESIST, CORRUPTION_PER_LEVEL, DAILY_CORRUPTION, FALL_LEVEL, LOCATE_DAYS,
  RECOVERY, RESCUE_RANK_STEP,
} from "./registry";
import { member, rosterIds, type DayReport, type GameState } from "./state";
import { bondLevel, corruptionLevel } from "./stats";

/** 任务失败时的俘获判定，被俘获时返回 true。 */
export function capture(s: GameState, id: CharId, m: MissionTemplate, rng: Rng): boolean {
  if (rng() >= CAPTURE_CHANCE[m.rank - 1]) return false;
  member(s, id).captive = {
    rank: m.rank,
    locateDaysLeft: Math.max(1, LOCATE_DAYS - s.facilities.intel.level),
    missionId: m.id,
  };
  if (s.secretary === id) s.secretary = rosterIds(s).find((x) => !s.roster[x].captive) ?? null;
  return true;
}

export function rescue(s: GameState, id: CharId) {
  member(s, id).captive = null;
  s.board = s.board.filter((o) => o.target !== id);
  s.pendingScenes.push(`rescue_${id}`);
}

function fall(s: GameState, id: CharId, report: DayReport) {
  const t = member(s, id);
  s.fallen.push({ id, missionId: t.captive!.missionId, day: s.day });
  delete s.roster[id];
  s.board = s.board.filter((o) => o.target !== id);
  if (s.secretary === id) s.secretary = rosterIds(s).find((x) => !s.roster[x].captive) ?? null;
  report.fallen.push(id);
}

/** 每天结束时处理被俘成员：定位、累积堕落值、堕落。堕落剧情加入待播放列表。 */
export function captivityDay(s: GameState, report: DayReport) {
  for (const id of rosterIds(s)) {
    const t = s.roster[id];
    const c = t.captive;
    if (!c) continue;

    if (c.locateDaysLeft > 0 && --c.locateDaysLeft === 0) {
      const rank = Math.min(5, c.rank + RESCUE_RANK_STEP);
      s.board.push({ uid: s.nextUid++, templateId: `rescue_${rank}`, expiresDay: null, target: id });
      report.located.push(id);
    }

    const before = corruptionLevel(t);
    const daily = DAILY_CORRUPTION[c.rank - 1] * (1 - CORRUPTION_BOND_RESIST * (bondLevel(t.bond) - 1));
    t.corruption = Math.min(FALL_LEVEL * CORRUPTION_PER_LEVEL, t.corruption + Math.round(daily));
    const level = corruptionLevel(t);
    if (level > before) report.corruption.push({ id, level });
    // 同一等级的堕落剧情只完整播放一次，以后再次达到时只在日报里提示。
    if (level > t.fallSeen) {
      s.pendingScenes.push(`fall_${id}_${level}`);
      t.fallSeen = level;
    }
    if (level >= FALL_LEVEL) fall(s, id, report);
  }
}

/** 每天结束时降低恢复期成员的堕落值。 */
export function recoveryDay(s: GameState, report: DayReport) {
  for (const id of rosterIds(s)) {
    const t = s.roster[id];
    if (t.captive || t.corruption === 0) continue;
    t.corruption = Math.max(0, t.corruption - (RECOVERY.base + RECOVERY.perInfirmary * s.facilities.infirmary.level));
    if (t.corruption === 0) report.cleansed.push(id);
  }
}
