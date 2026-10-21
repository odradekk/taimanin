import { AnimatePresence, motion } from "motion/react";
import { Fragment, type ReactNode } from "react";
import { CHAR_ORDER } from "../game/data/characters";
import { academyRank, bondLevel, MAX_AP, recruitBlocker, rosterIds } from "../game/rules";
import type { GameState } from "../game/types";
import { bondScenesOf } from "../story/scenes";
import type { BgId } from "../story/script";
import { useStore, type Tab } from "../store";
import { bgUrl, dateOf, fmt } from "./assets";
import { DayReportModal } from "./DayReport";
import { Facilities } from "./tabs/Facilities";
import { Home } from "./tabs/Home";
import { Memories } from "./tabs/Memories";
import { Missions } from "./tabs/Missions";
import { Recruit } from "./tabs/Recruit";
import { Roster } from "./tabs/Roster";
import { Shop } from "./tabs/Shop";
import { System } from "./tabs/System";

const TABS: { id: Tab; k: string; label: string; bg: BgId; view: () => ReactNode }[] = [
  { id: "home", k: "园", label: "学园", bg: "academy", view: Home },
  { id: "facilities", k: "筑", label: "设施", bg: "academy_dusk", view: Facilities },
  { id: "roster", k: "忍", label: "成员", bg: "dojo", view: Roster },
  { id: "recruit", k: "募", label: "招募", bg: "classroom", view: Recruit },
  { id: "missions", k: "任", label: "任务", bg: "city_night", view: Missions },
  { id: "shop", k: "商", label: "商店", bg: "classroom", view: Shop },
  { id: "memories", k: "忆", label: "回想", bg: "office", view: Memories },
  { id: "system", k: "系", label: "系统", bg: "office", view: System },
];

/** 有尚未观看的已解锁羁绊剧情。 */
export function hasNewBondScene(g: GameState): boolean {
  return rosterIds(g).some((id) =>
    bondScenesOf(id).some((s) => bondLevel(g.roster[id]!.bond) >= s.bondLevel! && !g.seenScenes.includes(s.id)));
}

export function canRecruitSomeone(g: GameState): boolean {
  return CHAR_ORDER.some((id) => recruitBlocker(g, id) === null);
}

function TopBar({ g }: { g: GameState }) {
  const { md, weekday } = dateOf(g.day);
  return (
    <div className="topbar">
      <div className="emblem">
        <div className="emblem-mark"><span>五</span></div>
        <div className="emblem-name">五车学园</div>
        <div className="rank-badge">评级 <b>{academyRank(g.resources.reputation)}</b></div>
      </div>
      <div className="datebox">
        <span className="d">{md}</span>
        <span className="w">{weekday}</span>
        <span className="n">第 {g.day} 天</span>
      </div>
      <div className="ap">
        行动力
        <span className="pips">{Array.from({ length: MAX_AP }, (_, i) => <i key={i} className={i < g.ap ? "on" : ""} />)}</span>
      </div>
      <div className="resources">
        <div className="res"><span className="kanji-badge">金</span><b className={`num ${g.resources.funds < 0 ? "bad" : ""}`}>{fmt(g.resources.funds)}</b><small>资金</small></div>
        <div className="res"><span className="kanji-badge">物</span><b className="num">{fmt(g.resources.supplies)}</b><small>物资</small></div>
        <div className="res"><span className="kanji-badge">望</span><b className="num">{fmt(g.resources.reputation)}</b><small>声望</small></div>
      </div>
    </div>
  );
}

export function Shell() {
  const g = useStore((s) => s.game)!;
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const endDay = useStore((s) => s.endDay);
  const report = useStore((s) => s.report);
  const current = TABS.find((t) => t.id === tab)!;
  const View = current.view;
  const dots: Partial<Record<Tab, boolean>> = { roster: hasNewBondScene(g), recruit: canRecruitSomeone(g) };

  return (
    <>
      <AnimatePresence>
        <motion.div key={current.bg} className={`shell-bg ${tab === "home" ? "" : "dim"}`} style={{ backgroundImage: `url(${bgUrl(current.bg)})` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
      </AnimatePresence>
      <div className="shell-bg-shade" />

      <TopBar g={g} />

      <nav className="nav">
        {TABS.map((t, i) => (
          <Fragment key={t.id}>
            {i === TABS.length - 2 && <div className="nav-spacer" />}
            <button className={`nav-item ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              <span className="k">{t.k}</span>
              <span className="l">{t.label}</span>
              {dots[t.id] && <span className="dot" />}
            </button>
          </Fragment>
        ))}
      </nav>

      <div className="content">
        <AnimatePresence mode="wait">
          <motion.div key={tab} className="tab" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
            <View />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={tab === "home" ? "endday" : "endday compact"}>
        <button className={`btn ${g.ap === 0 ? "gold" : "primary"}`} onClick={endDay}>
          <span className="moon" />结束今日
        </button>
      </div>

      <AnimatePresence>{report && <DayReportModal report={report} />}</AnimatePresence>
    </>
  );
}

export function TabHead({ title, sub, wm }: { title: string; sub: string; wm: string }) {
  return (
    <div className="tab-head">
      <h2>{title}</h2>
      <p>{sub}</p>
      <span className="wm">{wm}</span>
    </div>
  );
}
