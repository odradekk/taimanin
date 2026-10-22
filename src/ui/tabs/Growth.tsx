import { AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  advance, APTITUDE_COEF, bondLevel, CHARACTERS, type CharId, type Cost, growthBlocker, growthStep, type GrowthStep,
  ITEM_BY_ID, levelCap, MAX_CIRCUITS, power, RANKS, successChance, talentPoints,
} from "../../game";
import { useStore } from "../../store";
import { fmt } from "../assets";
import { TalentTree } from "./TalentTree";

function stepTitle(step: GrowthStep, aptitude: string): string {
  switch (step.kind) {
    case "rank": return `晋升${RANKS[step.to].name}`;
    case "secret": return "秘传试炼";
    case "circuit": return `打通第 ${step.to} 道秘术回路`;
    case "temper": return `淬炼 ${aptitude} → ${step.to}`;
  }
}

/** 条件清单：已满足的显示为绿色。 */
function Requirements({ id, step }: { id: CharId; step: GrowthStep }) {
  const g = useStore((s) => s.game)!;
  const t = g.roster[id];
  const cost: Cost = step.cost;
  const rows: [string, boolean][] = [[`等级 ${t.level} / ${step.level}`, t.level >= step.level]];
  if ("lab" in step) rows.push([`忍术研究所 ${g.facilities.lab.level} / ${step.lab} 级`, g.facilities.lab.level >= step.lab]);
  for (const [item, n] of Object.entries(cost.items ?? {})) {
    const have = g.inventory[item] ?? 0;
    rows.push([`${ITEM_BY_ID[item].name} ${have} / ${n}`, have >= n]);
  }
  if (cost.funds) rows.push([`资金 ${fmt(cost.funds)}`, g.resources.funds >= cost.funds]);
  if (cost.supplies) rows.push([`物资 ${fmt(cost.supplies)}`, g.resources.supplies >= cost.supplies]);
  return (
    <div className="reqs">
      {rows.map(([text, ok]) => <span key={text} className={`req ${ok ? "ok" : "no"}`}>{text}</span>)}
    </div>
  );
}

export function GrowthPanel({ id }: { id: CharId }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const toast = useStore((s) => s.toast);
  const startSecret = useStore((s) => s.startSecret);
  const [talentsOpen, setTalentsOpen] = useState(false);
  const t = g.roster[id];
  const def = CHARACTERS[id];
  const step = growthStep(t);
  const blocker = growthBlocker(g, id);
  const bl = bondLevel(t.bond);

  const effect = (s: GrowthStep): string => {
    switch (s.kind) {
      case "rank": return `等级上限 ${levelCap(t)} → ${RANKS[s.to].cap}，属性中幅提升`;
      case "secret": return def.secret
        ? `习得秘传技「${def.secret.skill.name}」，属性大幅提升，开放秘术回路。当前试炼成功率 ${Math.round(successChance(power(t), def.secret.trialPower) * 100)}%`
        : "这名角色的秘传尚未开放";
      case "circuit": return "等级上限 +1，属性大幅提升";
      case "temper": {
        const [a, b] = [APTITUDE_COEF[t.aptitude], APTITUDE_COEF[s.to]];
        return `基础 ×${a.base}→×${b.base}，成长 ×${a.growth}→×${b.growth}，天赋 ×${a.talent}→×${b.talent}，技能 ×${a.skill}→×${b.skill}`;
      }
    }
  };

  const go = () => {
    if (!step) return;
    if (step.kind === "secret") return startSecret(id);
    if (act((s) => advance(s, id))) toast(`${def.name}完成了「${stepTitle(step, t.aptitude)}」`, "good");
  };

  return (
    <div>
      <div className="section-title">养成</div>
      <div className="growth-line">
        <span>资质 <b>{t.aptitude}</b></span>
        <span>位阶 <b>{RANKS[t.rank].name}</b></span>
        <span>秘传 <b>{t.secret ? "已完成" : "未完成"}</b></span>
        <span>秘术回路 <b>{t.circuits} / {MAX_CIRCUITS}</b></span>
      </div>

      {step ? (
        <div className="growth-step">
          <div className="hd">
            <b>下一步：{stepTitle(step, t.aptitude)}</b>
            <button className="btn sm gold" disabled={!!blocker} title={blocker ?? ""} onClick={go}>
              {step.kind === "secret" ? "开始秘传" : "进行"}
            </button>
          </div>
          <div className="faint" style={{ fontSize: 12.5 }}>{effect(step)}</div>
          <Requirements id={id} step={step} />
          {blocker && <div className="faint" style={{ fontSize: 12 }}>{blocker}</div>}
        </div>
      ) : <div className="faint" style={{ fontSize: 13 }}>已经完成全部养成。</div>}

      <div className="growth-line" style={{ marginTop: 10 }}>
        {def.talents ? (
          <>
            <span>天赋点 <b>{talentPoints(t)}</b> / {t.level}</span>
            <button className="btn sm" onClick={() => setTalentsOpen(true)}>天赋树</button>
          </>
        ) : <span className="faint">天赋树待补充</span>}
      </div>

      <div className="skills">
        {def.secret
          ? <Skill label="秘传技" name={def.secret.skill.name} desc={def.secret.skill.desc} unlocked={t.secret} need="完成秘传后习得" />
          : <div className="faint">秘传技待补充</div>}
        {def.bond ? (
          <>
            <Skill label="羁绊被动" name={def.bond.passive.name} desc={def.bond.passive.desc} unlocked={bl >= 5} need="羁绊 5 级解锁" />
            <Skill label="羁绊技" name={def.bond.active.name} desc={def.bond.active.desc} unlocked={bl >= 10} need="羁绊 10 级解锁" />
          </>
        ) : <div className="faint">羁绊技能待补充</div>}
        <div className="faint" style={{ fontSize: 12 }}>技能效果在战斗系统上线后生效。</div>
      </div>

      <AnimatePresence>{talentsOpen && <TalentTree id={id} onClose={() => setTalentsOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function Skill({ label, name, desc, unlocked, need }: { label: string; name: string; desc: string; unlocked: boolean; need: string }) {
  return (
    <div className={`skill ${unlocked ? "" : "locked"}`}>
      <span className="chip">{label}</span>
      <b>{name}</b>
      <span className="faint">{unlocked ? desc : `${need}。${desc}`}</span>
    </div>
  );
}
