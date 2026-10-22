import { motion } from "motion/react";
import { CHARACTERS, type DayReport, FACILITIES, ITEM_BY_ID } from "../game";
import { useStore } from "../store";
import { dateOf, fmt, signed } from "./assets";
import { missionName } from "./tabs/Missions";

const RESULT = { great: "大成功", success: "成功", fail: "失败" };

export function DayReportModal({ report }: { report: DayReport }) {
  const close = useStore((s) => s.closeReport);
  const names = (ids: string[]) => ids.map((id) => CHARACTERS[id].name).join("、");
  const net = report.income.funds - report.upkeep;

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="panel corners report" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="report-head">
          <h3>学园日报</h3>
          <span className="muted">{dateOf(report.day).md} · 第 {report.day} 天</span>
        </div>

        <div className="report-body">
          <div>
            <div className="section-title">收支</div>
            <div className="ledger">
              <div className="ln"><span className="muted">教学楼收入</span><span className="num good">+{fmt(report.income.funds)}</span></div>
              <div className="ln"><span className="muted">成员薪酬</span><span className="num bad">-{fmt(report.upkeep)}</span></div>
              <div className="ln"><span>资金合计</span><span className={`num ${net >= 0 ? "good" : "bad"}`}>{signed(net)}</span></div>
              <div className="ln"><span className="muted">物资补给</span><span className="num good">+{report.income.supplies}</span></div>
              <div className="ln"><span className="muted">声望</span><span className="num good">+{report.income.reputation}</span></div>
            </div>
          </div>

          <div>
            <div className="section-title">学园动态</div>
            <div className="ledger">
              {report.built.map((f) => <div key={f}>◆ {FACILITIES[f].name}升级完成</div>)}
              {report.recovered.length > 0 && <div>◆ {names(report.recovered)}伤愈归队</div>}
              {report.levelUps.length > 0 && <div className="gold">◆ {names(report.levelUps)}等级提升</div>}
              {report.located.length > 0 && <div className="bad">◆ 情报室查到了{names(report.located)}的下落，营救任务已出现在任务栏</div>}
              {report.corruption.filter((c) => c.level < 10).map((c) => (
                <div key={c.id} className="bad">◆ {CHARACTERS[c.id].name}受到的侵蚀加深了（堕落等级 {c.level}）</div>
              ))}
              {report.fallen.length > 0 && <div className="bad">◆ {names(report.fallen)}堕落了，从此离开了五车</div>}
              {report.cleansed.length > 0 && <div className="good">◆ {names(report.cleansed)}的侵蚀已经完全消除，可以重新出击</div>}
              {report.events.map((e, i) => <div key={i} className="muted">◇ {e}</div>)}
              {!report.built.length && !report.recovered.length && !report.levelUps.length && !report.events.length
                && !report.located.length && !report.corruption.length && !report.fallen.length && !report.cleansed.length && (
                <div className="faint">平静的一天。</div>
              )}
            </div>
          </div>

          {report.missions.length > 0 && (
            <div className="full">
              <div className="section-title">任务报告</div>
              {report.missions.map((m, i) => (
                <div key={i} className="mresult">
                  <div className="hd">
                    「{missionName(m)}」
                    <span className={`stamp ${m.result}`}>{RESULT[m.result]}</span>
                  </div>
                  <div className="log">{m.log.map((l, j) => <div key={j}>{l}</div>)}</div>
                  <div className="rw num" style={{ display: "flex", gap: 18 }}>
                    <span>资金 <span className={m.rewards.funds >= 0 ? "good" : "bad"}>{signed(m.rewards.funds)}</span></span>
                    <span>物资 <span className="good">{signed(m.rewards.supplies)}</span></span>
                    <span>声望 <span className={m.rewards.reputation >= 0 ? "good" : "bad"}>{signed(m.rewards.reputation)}</span></span>
                    {Object.entries(m.materials).map(([id, n]) => <span key={id}>{ITEM_BY_ID[id].name} <span className="good">+{n}</span></span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn primary lg" onClick={close}>迎接新的一天</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
