import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHARACTERS } from "../game/data/characters";
import { choose, next, skip, start, type Line, type NovelState } from "../story/engine";
import { SCENES, sceneCommands } from "../story/scenes";
import type { Effect, Slot } from "../story/script";
import { useStore, type Playing } from "../store";
import { bgUrl, cgUrl, portraitUrl } from "./assets";
import { useSettings } from "./settings";

const SLOT_X: Record<Slot, string> = { left: "23%", center: "50%", right: "77%" };

export function Novel({ playing }: { playing: Playing }) {
  const playerName = useStore((s) => s.game?.playerName ?? "");
  const applySceneEffects = useStore((s) => s.applySceneEffects);
  const finishPlaying = useStore((s) => s.finishPlaying);
  const { textSpeed, autoDelay } = useSettings();

  const cmds = useMemo(() => playing.cmds ?? sceneCommands(playing.sceneId!), [playing]);
  const [initial] = useState(() => start(cmds, playing.bg ?? null));
  const [state, setState] = useState<NovelState>(initial[0]);
  const [shown, setShown] = useState(0);
  const [auto, setAuto] = useState(false);
  const [fast, setFast] = useState(false);
  const [backlog, setBacklog] = useState(false);
  const [hidden, setHidden] = useState(false);
  const initialApplied = useRef(false);

  const text = (state.line?.text ?? "").replaceAll("{player}", playerName);
  const typing = shown < text.length;

  const apply = useCallback((effects: Effect[]) => applySceneEffects(effects), [applySceneEffects]);

  useEffect(() => {
    if (initialApplied.current) return;
    initialApplied.current = true;
    apply(initial[1]);
  }, [apply, initial]);

  const commit = useCallback(([s, effects]: [NovelState, Effect[]]) => {
    apply(effects);
    setState(s);
  }, [apply]);

  // 换到新台词时重新逐字显示；出现选项时保留的是同一句台词，不重放。
  useEffect(() => setShown(0), [state.line]);

  const advance = useCallback(() => {
    if (hidden) return setHidden(false);
    if (typing) return setShown(text.length);
    if (!state.choice) commit(next(state));
  }, [hidden, typing, text.length, state, commit]);

  // 逐字显示
  useEffect(() => {
    if (!typing) return;
    const id = setTimeout(() => setShown((n) => n + 1), fast ? 0 : 1000 / textSpeed);
    return () => clearTimeout(id);
  }, [typing, shown, textSpeed, fast]);

  // 自动和快进
  useEffect(() => {
    if (state.choice || state.done || backlog) return;
    if (fast) {
      const id = setTimeout(() => commit(next(state)), 60);
      return () => clearTimeout(id);
    }
    if (auto && !typing) {
      const id = setTimeout(() => commit(next(state)), autoDelay + text.length * 25);
      return () => clearTimeout(id);
    }
  }, [auto, fast, typing, state, backlog, autoDelay, text.length, commit]);

  useEffect(() => {
    if (state.choice) setFast(false);
  }, [state.choice]);

  useEffect(() => {
    if (!state.done) return;
    const id = setTimeout(finishPlaying, 350);
    return () => clearTimeout(id);
  }, [state.done, finishPlaying]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (backlog) {
        if (e.key === "Escape") setBacklog(false);
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!state.choice) advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, backlog, state.choice]);

  const speaker = state.line?.who;
  const speakingChar = speaker && "char" in speaker ? speaker.char : null;
  const name = !speaker ? null
    : "char" in speaker ? CHARACTERS[speaker.char].name
    : "player" in speaker ? playerName
    : speaker.name;
  const color = speakingChar ? CHARACTERS[speakingChar].color : undefined;
  const title = playing.sceneId ? SCENES[playing.sceneId]?.title : undefined;

  return (
    <motion.div
      className="novel"
      initial={{ opacity: 0 }} animate={{ opacity: state.done ? 0 : 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
      onContextMenu={(e) => { e.preventDefault(); setHidden((h) => !h); }}
      onWheel={(e) => { if (e.deltaY < 0 && !backlog) setBacklog(true); }}
    >
      <AnimatePresence>
        {state.bg && (
          <motion.div key={state.bg} className="novel-bg" style={{ backgroundImage: `url(${bgUrl(state.bg)})` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!state.cg && state.actors.map((a) => (
          <motion.div key={a.who}
            className={`novel-actor ${state.actors.length >= 3 ? "crowd" : ""} ${speakingChar && speakingChar !== a.who ? "dim" : ""}`}
            style={{ left: SLOT_X[a.at] }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.45 }}>
            <img src={portraitUrl(a.who)} alt="" />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {state.cg && (
          <motion.div key={state.cg} className="novel-cg" style={{ backgroundImage: `url(${cgUrl(state.cg)})` }}
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1 }} />
        )}
      </AnimatePresence>

      <div className="novel-click" onClick={() => !state.choice && advance()} />

      {!hidden && title && <div className="novel-title">{title}</div>}

      {!hidden && state.line && (
        <div className="textbox" onClick={advance}>
          {name && (
            <div className="nameplate" style={{ ["--c" as string]: color ? `${color}cc` : undefined }}>
              {name}
              {speakingChar && <small>{CHARACTERS[speakingChar].title}</small>}
            </div>
          )}
          <div className="novel-ctl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setBacklog(true)}>记录</button>
            <button className={auto ? "on" : ""} onClick={() => setAuto((v) => !v)}>自动</button>
            <button className={fast ? "on" : ""} onClick={() => setFast((v) => !v)}>快进</button>
            <button onClick={() => setHidden(true)}>隐藏</button>
            <button onClick={() => commit(skip(state))}>跳过</button>
          </div>
          <div className={`say ${speaker ? "" : "narr"}`}>
            {text.slice(0, shown)}
            {!typing && !state.choice && <span className="caret" />}
          </div>
        </div>
      )}

      {!hidden && state.choice && (
        <div className="choices">
          {state.choice.map((o, i) => (
            <motion.button key={i} className="choice" onClick={() => commit(choose(state, i))}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              {o.text}
            </motion.button>
          ))}
        </div>
      )}

      {backlog && <Backlog log={state.log} playerName={playerName} onClose={() => setBacklog(false)} />}
    </motion.div>
  );
}

function Backlog({ log, playerName, onClose }: { log: Line[]; playerName: string; onClose: () => void }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView(), []);
  return (
    <div className="backlog" onClick={onClose}>
      <h3>对话记录</h3>
      <div className="scroll" onClick={(e) => e.stopPropagation()}>
        {log.map((l, i) => {
          const who = !l.who ? "" : "char" in l.who ? CHARACTERS[l.who.char].name : "player" in l.who ? playerName : l.who.name;
          return (
            <div key={i} className={`entry ${l.who ? "" : "narr"}`}>
              <span className="w">{who}</span>
              <span className="t">{l.text.replaceAll("{player}", playerName)}</span>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <div className="faint" style={{ marginTop: 16, fontSize: 13 }}>点击空白处或按 Esc 返回</div>
    </div>
  );
}
