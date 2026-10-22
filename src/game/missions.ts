// 任务栏、派遣和任务结算。战斗系统实现前，任务按队伍战力自动结算。

import type { CharId, ItemId, MissionTemplate, Resources, Rng } from "./defs";
import {
  BOND_GAIN, CHARACTERS, intelBoardSize, intelMaxRank, MATERIAL_DROPS, MISSION_BY_ID, MISSION_EXP,
  FAIL_INJURY_DAYS, MISSION_FATIGUE_PER_DAY, MISSIONS, OFFER_LIFETIME,
} from "./registry";
import { capture, rescue } from "./captivity";
import { addBond, addExp, missionExp } from "./progression";
import { clamp, GameError, member, pick, type GameState, type MissionOutcome } from "./state";
import { isAvailable, successChance, teamPower } from "./stats";


export function refillBoard(s: GameState, rng: Rng) {
  const intel = s.facilities.intel.level;
  const pool = MISSIONS.filter((m) => m.rank <= intelMaxRank(intel));
  const regular = () => s.board.filter((o) => !o.target).length;
  while (regular() < intelBoardSize(intel)) {
    const fresh = pool.filter((m) => !s.board.some((o) => o.templateId === m.id));
    if (fresh.length === 0) break;
    s.board.push({ uid: s.nextUid++, templateId: pick(fresh, rng).id, expiresDay: s.day + OFFER_LIFETIME });
  }
}

export function dispatch(s: GameState, uid: number, members: CharId[]) {
  const offer = s.board.find((o) => o.uid === uid);
  if (!offer) throw new GameError("任务已失效");
  const m = MISSION_BY_ID[offer.templateId];
  if (members.length === 0 || members.length > m.slots) throw new GameError(`需要 1～${m.slots} 名成员`);
  for (const id of members) if (!isAvailable(member(s, id))) throw new GameError(`${CHARACTERS[id].name}无法出击`);
  s.board = s.board.filter((o) => o.uid !== uid);
  s.active.push({ uid, templateId: m.id, members, daysLeft: m.days, target: offer.target });
  for (const id of members) member(s, id).missionUid = uid;
}

function drops(m: MissionTemplate, mult: number): Record<ItemId, number> {
  return Object.fromEntries(Object.entries(MATERIAL_DROPS[m.rank - 1]).map(([id, n]) => [id, Math.round(n * mult)]));
}

export function resolveMission(
  s: GameState, members: CharId[], m: MissionTemplate, rng: Rng, target?: CharId,
): MissionOutcome {
  const team = teamPower(s, members);
  const ratio = team / m.power;
  const success = rng() < successChance(team, m.power);
  const great = success && rng() < clamp((ratio - 1) * 1.5, 0, 0.6);
  const result = great ? "great" : success ? "success" : "fail";
  const mult = (great ? 1.5 : 1) * (1 + 0.05 * s.facilities.intel.level);
  const rewards: Resources = success
    ? { funds: Math.round(m.funds * mult), supplies: Math.round(m.supplies * mult), reputation: Math.round(m.reputation * mult) }
    : { funds: Math.round(m.funds * 0.2), supplies: 0, reputation: -3 * m.rank };
  s.resources.funds += rewards.funds;
  s.resources.supplies += rewards.supplies;
  s.resources.reputation = Math.max(0, s.resources.reputation + rewards.reputation);
  const materials = success ? drops(m, great ? 1.5 : 1) : {};
  for (const [id, n] of Object.entries(materials)) s.inventory[id] = (s.inventory[id] ?? 0) + n;

  const injured: CharId[] = [];
  const captured: CharId[] = [];
  for (const id of members) {
    const t = member(s, id);
    t.missionUid = null;
    t.fatigue = clamp(t.fatigue + MISSION_FATIGUE_PER_DAY * m.days, 0, 100);
    addBond(t, BOND_GAIN.mission);
    addExp(t, missionExp(t, m.rank, MISSION_EXP[result]));
    if (success) {
      if (ratio < 1 && rng() < 0.1) {
        t.injuredDays = 2 + Math.floor(rng() * 3);
        injured.push(id);
      }
    } else if (capture(s, id, m, rng)) {
      captured.push(id);
    } else {
      t.injuredDays = FAIL_INJURY_DAYS + m.rank;
      injured.push(id);
    }
  }
  if (success && target && s.roster[target]?.captive) rescue(s, target);
  s.stats.missionsDone++;
  if (success) s.stats.missionsWon++;

  const names = members.map((id) => CHARACTERS[id].name).join("、");
  const lead = CHARACTERS[pick(members, rng)];
  const log = [
    `${names}出发执行「${m.name}」。`,
    `途中遭遇${pick(m.enemies, rng)}，${lead.name}以${lead.ninjutsu}抢占先机。`,
    great ? "行动堪称完美，敌人被一网打尽。"
      : success ? "经过一番苦战，任务顺利完成。"
      : "敌人的实力远超情报，队伍被迫撤退。",
  ];
  if (success && target) log.push(`${CHARACTERS[target].name}被救了出来。`);
  if (injured.length) log.push(`${injured.map((id) => CHARACTERS[id].name).join("、")}负了重伤。`);
  if (captured.length) log.push(`${captured.map((id) => CHARACTERS[id].name).join("、")}没能撤出来，被敌人俘获了。`);
  return { templateId: m.id, members, target, result, rewards, materials, injured, captured, log };
}
