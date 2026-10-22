import { useState } from "react";
import {
  CAPTURE_CHANCE, CHARACTERS, type CharId, dispatch, isAvailable, isRecovering, ITEM_BY_ID, MATERIAL_DROPS, MISSION_BY_ID,
  type MissionOffer, power, RANK_NAMES, rosterIds, successChance, teamPower,
} from "../../game";
import { useStore } from "../../store";
import { fmt, portraitUrl } from "../assets";
import { TabHead } from "../Shell";
import { Face } from "./Home";

const RANK_COLORS = ["#9aa3b5", "#4fd1a5", "#5ab4ff", "#b38cff", "#f4c46a"];

/** 营救任务显示被俘成员的名字。 */
export const missionName = (o: { templateId: string; target?: CharId }) =>
  o.target ? `营救${CHARACTERS[o.target].name}` : MISSION_BY_ID[o.templateId].name;

const drops = (rank: number) =>
  Object.entries(MATERIAL_DROPS[rank - 1]).map(([id, n]) => `${ITEM_BY_ID[id].name} ×${n}`).join("　");

const remaining = (o: MissionOffer, day: number) => (o.expiresDay === null ? "不会过期" : `剩余 ${o.expiresDay - day + 1} 天`);

export function Missions() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const toast = useStore((s) => s.toast);
  const [sel, setSel] = useState<number | null>(g.board[0]?.uid ?? null);
  const [team, setTeam] = useState<CharId[]>([]);
  const offer = g.board.find((o) => o.uid === sel);
  const m = offer && MISSION_BY_ID[offer.templateId];
  const tp = m ? teamPower(g, team) : 0;
  const chance = m && team.length ? successChance(tp, m.power) : 0;

  const toggle = (id: CharId) => {
    if (!m) return;
    if (team.includes(id)) setTeam(team.filter((x) => x !== id));
    else if (team.length < m.slots) setTeam([...team, id]);
    else toast(`这个任务最多派遣 ${m.slots} 人`, "bad");
  };
  const go = () => {
    if (!offer || !m) return;
    if (act((s) => { dispatch(s, offer.uid, team); return true; })) {
      toast(`已派遣至「${missionName(offer)}」，${m.days} 天后返回`, "good");
      setTeam([]);
      setSel(g.board.find((o) => o.uid !== offer.uid)?.uid ?? null);
    }
  };

  return (
    <>
      <TabHead title="任务委托" sub="派遣不消耗行动力。成员在任务期间无法训练，结束一天时推进任务。任务失败时成员可能被俘获。" wm="任" />
      <div className="tab-body mis">
        <div className="mis-list scroll">
          {g.board.length === 0 && <div className="faint">暂时没有新的委托。升级情报室可以获得更多任务。</div>}
          {g.board.map((o) => {
            const t = MISSION_BY_ID[o.templateId];
            return (
              <button key={o.uid} className={`offer ${o.uid === sel ? "on" : ""} ${o.target ? "rescue" : ""}`} onClick={() => { setSel(o.uid); setTeam([]); }}>
                <span className="rank" style={{ ["--rc" as string]: RANK_COLORS[t.rank - 1] }}><span>{RANK_NAMES[t.rank - 1]}</span></span>
                <span>
                  <div className="nm">{missionName(o)}</div>
                  <div className="ds">{t.desc}</div>
                  <div className="tags">
                    <span className="chip">推荐战力 {t.power}</span>
                    <span className="chip">{t.days} 天</span>
                    <span className="chip">最多 {t.slots} 人</span>
                    <span className={`chip ${o.target ? "red" : "gold"}`}>{remaining(o, g.day)}</span>
                  </div>
                </span>
                <span className="rw num">
                  {t.funds > 0 && <>资金 +{fmt(t.funds)}<br /></>}{t.supplies > 0 && <>物资 +{t.supplies}<br /></>}声望 +{t.reputation}<br /><span className="faint">{drops(t.rank)}</span>
                </span>
              </button>
            );
          })}

          {g.active.length > 0 && <div className="section-title" style={{ marginTop: 14 }}>进行中</div>}
          {g.active.map((a) => (
            <div key={a.uid} className="active-row">
              <span className="faces">{a.members.map((id) => <Face key={id} id={id} />)}</span>
              <span className="grow">「{missionName(a)}」</span>
              <span className="good">还剩 {a.daysLeft} 天</span>
            </div>
          ))}
        </div>

        <div className="panel corners team">
          {!m ? <div className="faint">选择一个任务来编组队伍。</div> : (
            <>
              <div>
                <div className="faint" style={{ fontSize: 12, letterSpacing: "0.3em" }}>编组队伍</div>
                <h3>{missionName(offer)}</h3>
              </div>
              <div className="pick-grid">
                {rosterIds(g).map((id) => {
                  const t = g.roster[id]!;
                  const why = t.captive ? "被俘" : t.missionUid !== null ? "任务中" : t.injuredDays > 0 ? "负伤" : isRecovering(t) ? "恢复期" : null;
                  return (
                    <button key={id} className={`pick ${team.includes(id) ? "on" : ""}`} disabled={!isAvailable(t)} onClick={() => toggle(id)}>
                      <span className="pt" style={{ backgroundImage: `url(${portraitUrl(id)})` }} />
                      {why && <span className="why">{why}</span>}
                      <span className="lbl">{CHARACTERS[id].name}<br /><span className="faint">战力 {power(t)} · 疲劳 {t.fatigue}</span></span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span>队伍战力 <b className="num gold" style={{ fontSize: 22 }}>{tp}</b> <span className="faint">/ 推荐 {m.power}</span></span>
                <span className="faint">{team.length} / {m.slots} 人</span>
              </div>
              <div className="chance">
                <span className="faint" style={{ fontSize: 13 }}>成功率</span>
                <span className="bar"><i style={{ width: `${chance * 100}%`, background: chance >= 0.7 ? "var(--jade)" : chance >= 0.4 ? "var(--gold)" : "var(--crimson)" }} /></span>
                <b className="num">{Math.round(chance * 100)}%</b>
              </div>
              <div className="faint" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
                战力超过推荐值越多，越容易大成功（奖励和材料 ×1.5）。失败会损失声望，每名成员有 {Math.round(CAPTURE_CHANCE[m.rank - 1] * 100)}% 的概率被俘获，没被俘获的会负重伤。每天的任务疲劳 +12。
              </div>
              <button className="btn primary lg" disabled={team.length === 0} onClick={go}>派遣</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
