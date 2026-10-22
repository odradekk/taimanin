import { FACILITIES, FACILITY_ORDER, MAX_FACILITY_LEVEL, upgrade, upgradeBlocker } from "../../game";
import { useStore } from "../../store";
import { fmt } from "../assets";
import { TabHead } from "../Shell";

const MARKS: Record<string, string> = { hall: "学", dojo: "武", lab: "術", infirmary: "医", dorm: "寮", intel: "報" };

export function Facilities() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const toast = useStore((s) => s.toast);

  return (
    <>
      <TabHead title="学园设施" sub="同一时间只能施工一项。施工在每天结束时推进。" wm="設施" />
      <div className="tab-body fac-grid">
        {FACILITY_ORDER.map((id) => {
          const def = FACILITIES[id];
          const f = g.facilities[id];
          const maxed = f.level >= MAX_FACILITY_LEVEL;
          const cost = maxed ? null : def.upgrades[f.level];
          const blocker = upgradeBlocker(g, id);
          return (
            <div key={id} className="panel corners fac">
              <span className="wm">{MARKS[id]}</span>
              <div className="fac-top">
                <span className="fac-name">{def.name}</span>
                <span className="pips">{Array.from({ length: MAX_FACILITY_LEVEL }, (_, i) => <i key={i} className={i < f.level ? "on" : ""} />)}</span>
              </div>
              <div className="fac-desc">{def.desc}</div>
              <div className="fac-eff">
                <div><span className="lbl">当前</span>{f.level === 0 ? "未建成" : def.effect(f.level)}</div>
                {!maxed && <div className="gold"><span className="lbl">下一级</span>{def.effect(f.level + 1)}</div>}
              </div>
              <div className="fac-foot">
                {f.buildDaysLeft > 0 ? (
                  <span className="building">施工中 · 还剩 {f.buildDaysLeft} 天</span>
                ) : cost ? (
                  <>
                    <span className="cost num">
                      <span className={g.resources.funds < cost.funds ? "lack" : ""}>资金 {fmt(cost.funds)}</span>
                      <span className={g.resources.supplies < cost.supplies ? "lack" : ""}>物资 {cost.supplies}</span>
                      <span>工期 {cost.days} 天</span>
                    </span>
                    <button className="btn primary sm" disabled={!!blocker} title={blocker ?? ""}
                      onClick={() => act((s) => { upgrade(s, id); return true; }) && toast(`${def.name}开始施工`, "good")}>
                      {f.level === 0 ? "建造" : "升级"}
                    </button>
                  </>
                ) : (
                  <span className="gold">已达到最高等级</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
