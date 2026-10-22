import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  BOND_THRESHOLDS, bondLevel, CHARACTERS, type CharId, corruptionLevel, effectiveStats, expToNext, fatigueFactor,
  type GameState, giveGift, isAvailable, isRecovering, ITEM_BY_ID, ITEMS, levelCap, power, RECOVERY, rosterIds,
  setSecretary, STAT_NAMES, STAT_ORDER, talk, train, TRAINING_ORDER, TRAININGS,
} from "../../game";
import { bondScenesOf } from "../../story/scenes";
import { useStore } from "../../store";
import { portraitUrl } from "../assets";
import { TabHead } from "../Shell";
import { GrowthPanel } from "./Growth";

// 属性条的满格数值随等级放大，1 级和 100 级的属性条都有区分度。
const STAT_SCALE: Record<string, number> = { hp: 900, atk: 200, def: 200, spd: 200, nin: 200 };

export function statusChip(g: GameState, id: CharId) {
  const t = g.roster[id];
  if (t.captive) return <span className="chip red">被俘</span>;
  if (t.missionUid !== null) return <span className="chip violet">任务中</span>;
  if (t.injuredDays > 0) return <span className="chip red">负伤 {t.injuredDays} 天</span>;
  if (isRecovering(t)) return <span className="chip violet">恢复期</span>;
  if (t.fatigue >= 60) return <span className="chip gold">疲劳</span>;
  return <span className="chip green">待命</span>;
}

export function Roster() {
  const g = useStore((s) => s.game)!;
  const focus = useStore((s) => s.focus);
  const setFocus = useStore((s) => s.setFocus);
  const ids = rosterIds(g);
  const id = focus && g.roster[focus] ? focus : ids[0];

  return (
    <>
      <TabHead title="对魔忍" sub="训练和交谈消耗行动力。等级到达上限后晋升位阶，羁绊每升一级解锁一段剧情。" wm="忍" />
      <div className="tab-body roster">
        <div className="roster-list scroll">
          {ids.map((cid) => {
            const t = g.roster[cid];
            const def = CHARACTERS[cid];
            return (
              <button key={cid} className={`mcard ${cid === id ? "on" : ""}`} style={{ ["--c" as string]: def.color }} onClick={() => setFocus(cid)}>
                <span className="face" style={{ backgroundImage: `url(${portraitUrl(cid)})` }} />
                <span className="info">
                  <span className="nm">{def.name}<span className={`rarity ${t.aptitude}`}>{t.aptitude}</span></span>
                  <span className="meta"><span>Lv.{t.level}</span><span>战力 {power(t)}</span><span>羁绊 {bondLevel(t.bond)}</span></span>
                  <span className="bar" style={{ display: "block" }}><i style={{ width: `${t.fatigue}%`, background: t.fatigue >= 60 ? "var(--crimson)" : "var(--gold)" }} /></span>
                </span>
                {statusChip(g, cid)}
              </button>
            );
          })}
        </div>
        <Detail key={id} id={id} />
      </div>
    </>
  );
}

function Detail({ id }: { id: CharId }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const toast = useStore((s) => s.toast);
  const play = useStore((s) => s.play);
  const [floatText, setFloatText] = useState<{ key: number; text: string } | null>(null);
  const t = g.roster[id];
  const def = CHARACTERS[id];
  const stats = effectiveStats(t);
  const bl = bondLevel(t.bond);
  const nextBond = BOND_THRESHOLDS[bl];
  const available = isAvailable(t);
  const away = t.missionUid !== null || !!t.captive;
  const cap = levelCap(t);
  const gifts = ITEMS.filter((it) => it.kind === "gift" && (g.inventory[it.id] ?? 0) > 0);
  const scale = 1 + (t.level - 1) / 25;

  const flash = (text: string) => setFloatText({ key: Date.now(), text });

  const doTrain = (tid: (typeof TRAINING_ORDER)[number]) => {
    const r = act((s) => train(s, id, tid, Math.random));
    if (!r) return;
    const gains = Object.entries(r.gains).map(([k, v]) => `${STAT_NAMES[k as keyof typeof STAT_NAMES]} +${v}`).join("　");
    flash(r.great ? `大成功！ ${gains}` : gains || "疲劳恢复了");
    if (r.levelUps) toast(`${def.name}升到了 ${g.roster[id].level + r.levelUps} 级`, "good");
    if (r.injured) toast(`${def.name}因过度疲劳受伤了`, "bad");
  };

  const doTalk = () => {
    const r = act((s) => talk(s, id, Math.random));
    if (!r) return;
    play({
      bg: "dorm", char: id, replay: false,
      cmds: [
        { t: "show", who: id, at: "center" },
        { t: "say", who: { char: id }, text: r.line },
        { t: "say", who: null, text: `和${def.name}的羁绊加深了。（羁绊 +${r.bond}）` },
        ...(r.cleansed ? [{ t: "say" as const, who: null, text: `她的神情比前几天安定了一些。（堕落值 -${r.cleansed}）` }] : []),
      ],
    });
  };

  const doGift = (gid: string) => {
    const r = act((s) => giveGift(s, id, gid));
    if (!r) return;
    play({
      bg: "dorm", char: id, replay: false,
      cmds: [
        { t: "show", who: id, at: "center" },
        { t: "say", who: null, text: `我把「${ITEM_BY_ID[gid].name}」递给了${def.name}。` },
        { t: "say", who: null, text: r.liked
          ? `${def.name}的眼睛一下子亮了起来，小心翼翼地收下了礼物。（羁绊 +${r.bond}）`
          : `${def.name}礼貌地道了谢，收下了礼物。（羁绊 +${r.bond}）` },
      ],
    });
  };

  return (
    <div className="panel corners detail" style={{ ["--c" as string]: def.color }}>
      <img className="detail-portrait" src={portraitUrl(id)} alt="" />
      <AnimatePresence>
        {floatText && (
          <motion.div key={floatText.key} className="float-gain" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -30 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }} onAnimationComplete={() => setTimeout(() => setFloatText(null), 700)}>
            {floatText.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="detail-body scroll">
        <div className="detail-name">
          <div className="t">{def.title}</div>
          <h3>{def.name}<span className={`rarity ${t.aptitude}`}>{t.aptitude}</span></h3>
          <div className="tags">
            <span className="chip">{def.role}</span>
            <span className="chip violet">{def.ninjutsu}</span>
            {statusChip(g, id)}
            {g.secretary === id && <span className="chip gold">秘书</span>}
          </div>
        </div>

        {t.captive && (
          <div className="alert">
            {def.name}被敌人俘获了。堕落等级 {corruptionLevel(t)}（堕落值 {t.corruption} / 1000）。
            {t.captive.locateDaysLeft > 0 ? `情报室正在追查她的下落，还需要 ${t.captive.locateDaysLeft} 天。` : "营救任务已经出现在任务栏。"}
          </div>
        )}
        {isRecovering(t) && (
          <div className="alert soft">
            恢复期：堕落等级 {corruptionLevel(t)}（堕落值 {t.corruption}）。降到 0 之前不能出击或训练。医务室每天帮她恢复，和她交谈额外降低 {RECOVERY.talk}。
          </div>
        )}

        <p className="profile">{def.profile}</p>

        <div className="lvrow">
          <span>Lv. <span className="lv">{t.level}</span><span className="faint"> / {cap}</span></span>
          <span className="grow">
            <span className="faint" style={{ fontSize: 12 }}>经验 {t.level >= cap ? "已到达上限" : `${t.exp} / ${expToNext(t.level)}`}</span>
            <span className="bar" style={{ display: "block", marginTop: 4 }}><i style={{ width: `${t.level >= cap ? 100 : (t.exp / expToNext(t.level)) * 100}%` }} /></span>
          </span>
          <span>战力 <b className="gold num" style={{ fontSize: 22 }}>{power(t)}</b></span>
        </div>

        <div className="stats">
          {STAT_ORDER.map((k) => (
            <div className="stat" key={k}>
              <span className="k">{STAT_NAMES[k]}</span>
              <span className="bar"><i style={{ width: `${Math.min(100, (stats[k] / (STAT_SCALE[k] * scale)) * 100)}%`, background: def.color }} /></span>
              <span className="v num">{stats[k]}</span>
            </div>
          ))}
          <div className="stat">
            <span className="k">疲劳</span>
            <span className="bar"><i style={{ width: `${t.fatigue}%`, background: t.fatigue >= 60 ? "var(--crimson)" : "var(--gold)" }} /></span>
            <span className="v num">{t.fatigue}</span>
          </div>
          {t.fatigue > 0 && <div className="faint" style={{ fontSize: 12 }}>疲劳使属性降低 {Math.round((1 - fatigueFactor(t)) * 100)}%</div>}
        </div>

        <GrowthPanel id={id} />

        <div>
          <div className="section-title">羁绊 · Lv.{bl}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
            <span className="pips">{Array.from({ length: BOND_THRESHOLDS.length }, (_, i) => <i key={i} className={i < bl ? "on" : ""} />)}</span>
            <span className="faint">{nextBond ? `${t.bond} / ${nextBond}` : `${t.bond} · 已达到最高等级`}</span>
            <span className="faint" style={{ marginLeft: "auto" }}>喜好：{def.likes.map((x) => ITEM_BY_ID[x].name).join("、")}</span>
          </div>
        </div>

        <div>
          <div className="section-title">训练 · 消耗 1 行动力</div>
          <div className="actions">
            {TRAINING_ORDER.map((tid) => {
              const tr = TRAININGS[tid];
              const locked = tid === "ninjutsu" && g.facilities.lab.level === 0;
              return (
                <button key={tid} className="act" disabled={!available || g.ap === 0 || locked || g.resources.supplies < tr.supplies} onClick={() => doTrain(tid)}>
                  <b>{tr.name}</b>
                  <small>
                    {Object.entries(tr.gains).map(([k, v]) => `${STAT_NAMES[k as keyof typeof STAT_NAMES]}+${v}`).join(" ") || "疲劳 -30"}
                    <br />{locked ? "需要忍术研究所" : `物资 ${tr.supplies} · 疲劳 ${tr.fatigue > 0 ? "+" : ""}${tr.fatigue}`}
                  </small>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="section-title">互动</div>
          <div className="gift-row">
            <button className="btn primary" disabled={away || g.ap === 0 || t.lastTalkDay === g.day} onClick={doTalk}>
              {t.lastTalkDay === g.day ? "今天已交谈" : "交谈 · 1 行动力"}
            </button>
            {g.secretary !== id && !t.captive && <button className="btn ghost" onClick={() => act((s) => setSecretary(s, id))}>设为秘书</button>}
          </div>
          <div className="gift-row" style={{ marginTop: 10 }}>
            {t.lastGiftDay === g.day ? <span className="faint" style={{ fontSize: 13 }}>今天已经送过礼物了</span>
              : gifts.length === 0 ? <span className="faint" style={{ fontSize: 13 }}>没有可以赠送的礼物，可以去商店购买。</span>
              : gifts.map((it) => (
                <button key={it.id} className={`btn sm ${def.likes.includes(it.id) ? "gold" : ""}`} disabled={away} onClick={() => doGift(it.id)}>
                  赠送{it.name} ×{g.inventory[it.id]}
                </button>
              ))}
          </div>
        </div>

        <div>
          <div className="section-title">羁绊剧情</div>
          <div className="bondlist">
            {bondScenesOf(id).map((s) => {
              const unlocked = bl >= s.level!;
              const seen = g.seenScenes.includes(s.id);
              return (
                <div key={s.id} className="bonditem">
                  <span className="grow">{unlocked ? s.title : "？？？"}</span>
                  {!unlocked ? <span className="faint">羁绊 Lv.{s.level} 解锁</span>
                    : <button className={`btn sm ${seen ? "ghost" : "gold"}`} disabled={!!t.captive} onClick={() => play({ sceneId: s.id, char: id, replay: seen })}>
                        {seen ? "回放" : "观看"}
                      </button>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
