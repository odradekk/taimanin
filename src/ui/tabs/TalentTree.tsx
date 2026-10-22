import { motion } from "motion/react";
import { createPortal } from "react-dom";
import {
  addTalent, APTITUDE_COEF, CHARACTERS, type CharId, resetTalents, STAT_NAMES, TALENT_LAYER_UNLOCK, talentBlocker,
  talentPoints, type TalentNode,
} from "../../game";
import { useStore } from "../../store";

const LAYERS = [1, 2, 3, 4];

export function TalentTree({ id, onClose }: { id: CharId; onClose: () => void }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const t = g.roster[id];
  const def = CHARACTERS[id];
  const coef = APTITUDE_COEF[t.aptitude].talent;
  const spent = (nodes: TalentNode[]) => nodes.reduce((sum, n) => sum + (t.talents[n.id] ?? 0) * n.cost, 0);

  /** 作用于基础属性的节点，显示乘以资质系数后的实际数值。 */
  const actual = (n: TalentNode) =>
    n.mods?.map((m) => `${STAT_NAMES[m.stat]} +${Math.round(m.pct * coef * 100) / 100}%`).join("、");

  // 角色详情面板是相对定位的，窗口要渲染到舞台上才能盖住整个画面。
  return createPortal(
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="panel corners talents" initial={{ y: 16 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="talents-head">
          <h3>{def.name} · 天赋树</h3>
          <span>剩余天赋点 <b className="gold num">{talentPoints(t)}</b> / {t.level}</span>
          <span className="faint">资质 {t.aptitude}：数值 ×{coef}。标有「战斗」的效果在战斗系统上线后生效。</span>
          <button className="btn sm ghost" onClick={() => act((s) => resetTalents(s, id))}>免费重置</button>
          <button className="btn sm" onClick={onClose}>关闭</button>
        </div>
        <div className="talents-body">
          {def.talents!.map((b) => (
            <div key={b.id} className="branch">
              <div className="branch-head"><b>{b.name}</b><span className="faint">{b.focus} · 已投入 {spent(b.nodes)} 点</span></div>
              {LAYERS.map((layer) => (
                <div key={layer} className="layer">
                  <div className="layer-tag faint">第 {layer} 层{TALENT_LAYER_UNLOCK[layer] ? ` · 本分支 ${TALENT_LAYER_UNLOCK[layer]} 点解锁` : ""}</div>
                  {b.nodes.filter((n) => n.layer === layer).map((n) => {
                    const rank = t.talents[n.id] ?? 0;
                    const blocker = talentBlocker(g, id, n.id);
                    return (
                      <button key={n.id} className={`tnode ${n.kind} ${rank ? "on" : ""} ${rank >= n.maxRank ? "max" : ""}`}
                        disabled={!!blocker} title={blocker ?? ""} onClick={() => act((s) => addTalent(s, id, n.id))}>
                        <span className="tn-name">
                          {n.name}
                          <span className="faint num">{rank} / {n.maxRank}</span>
                          {!n.mods && <span className="chip">战斗</span>}
                        </span>
                        <span className="tn-desc">{n.desc}{n.maxRank > 1 ? "（每级）" : ""}</span>
                        <span className="tn-cost faint">{actual(n) ? `实际每级 ${actual(n)} · ` : ""}每级 {n.cost} 点</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.querySelector(".stage")!,
  );
}
