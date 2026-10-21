import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CHARACTERS } from "../../game/data/characters";
import { FACILITIES } from "../../game/data/facilities";
import { MISSION_BY_ID } from "../../game/data/missions";
import { academyRank, isAvailable, rosterIds } from "../../game/rules";
import type { CharId, FacilityId } from "../../game/types";
import { useStore } from "../../store";
import { portraitUrl } from "../assets";
import { canRecruitSomeone, hasNewBondScene } from "../Shell";

const NEXT_RANK: [number, string][] = [[50, "D"], [150, "C"], [300, "B"], [600, "A"], [1000, "S"]];

export function Face({ id }: { id: CharId }) {
  return <span className="face" style={{ backgroundImage: `url(${portraitUrl(id)})` }} />;
}

function statusOf(g: NonNullable<ReturnType<typeof useStore.getState>["game"]>, id: CharId) {
  const t = g.roster[id]!;
  if (t.missionUid !== null) return <span className="chip violet">任务中</span>;
  if (t.injuredDays > 0) return <span className="chip red">负伤 {t.injuredDays} 天</span>;
  if (t.fatigue >= 60) return <span className="chip gold">疲劳</span>;
  return <span className="chip green">待命</span>;
}

export function Home() {
  const g = useStore((s) => s.game)!;
  const setTab = useStore((s) => s.setTab);
  const sec = g.secretary ?? rosterIds(g)[0];
  const lines = CHARACTERS[sec].homeLines;
  const [lineIdx, setLineIdx] = useState(() => Math.floor(Math.random() * lines.length));
  const next = NEXT_RANK.find(([min]) => g.resources.reputation < min);
  const building = (Object.entries(g.facilities) as [FacilityId, (typeof g.facilities)[FacilityId]][]).find(([, f]) => f.buildDaysLeft > 0);
  const idle = rosterIds(g).filter((id) => isAvailable(g.roster[id]!));

  return (
    <>
      <div className="home-glow" />
      <AnimatePresence mode="wait">
        <motion.img key={sec} className="home-portrait" src={portraitUrl(sec)} alt=""
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
          onClick={() => setLineIdx((i) => (i + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length)} />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div key={`${sec}-${lineIdx}`} className="panel bubble" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="who" style={{ color: CHARACTERS[sec].color }}>{CHARACTERS[sec].name}</div>
          {lines[lineIdx % lines.length]}
        </motion.div>
      </AnimatePresence>

      <div className="home-col">
        <div className="panel corners home-hello">
          <div className="big">欢迎回来，{g.playerName}教官</div>
          <div className="sub">
            学园评级 {academyRank(g.resources.reputation)}
            {next ? ` · 距离 ${next[1]} 级还需声望 ${next[0] - g.resources.reputation}` : " · 已达到最高评级"}
          </div>
        </div>

        <div className="panel home-card">
          <div className="section-title">成员动态</div>
          <div className="home-list">
            {rosterIds(g).map((id) => (
              <div className="home-row" key={id}>
                <Face id={id} />
                <span className="grow">{CHARACTERS[id].name} <span className="faint">Lv.{g.roster[id]!.level}</span></span>
                {statusOf(g, id)}
              </div>
            ))}
          </div>
        </div>

        <div className="panel home-card">
          <div className="section-title">今日事项</div>
          <div className="home-list">
            {g.active.map((a) => (
              <div className="home-row" key={a.uid}>
                <span className="grow">「{MISSION_BY_ID[a.templateId].name}」进行中</span>
                <span className="faint">还剩 {a.daysLeft} 天</span>
              </div>
            ))}
            {building && (
              <div className="home-row">
                <span className="grow">{FACILITIES[building[0]].name}升级施工中</span>
                <span className="faint">还剩 {building[1].buildDaysLeft} 天</span>
              </div>
            )}
            {hasNewBondScene(g) && <div className="hint" onClick={() => setTab("roster")}>◆ 有新的羁绊剧情可以观看</div>}
            {canRecruitSomeone(g) && <div className="hint" onClick={() => setTab("recruit")}>◆ 有对魔忍可以招募</div>}
            {idle.length > 0 && g.board.length > 0 && (
              <div className="hint" onClick={() => setTab("missions")}>◆ {idle.length} 名成员待命，任务栏有 {g.board.length} 个委托</div>
            )}
            {g.ap > 0 && <div className="hint" onClick={() => setTab("roster")}>◆ 还有 {g.ap} 点行动力，可以训练或交谈</div>}
          </div>
        </div>
      </div>
    </>
  );
}
