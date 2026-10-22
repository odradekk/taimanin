import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { newGame } from "../game";
import { listSaves, readSave } from "../game/save";
import { useStore } from "../store";
import { cgUrl } from "./assets";
import { SaveSlots } from "./SaveSlots";

function Petals() {
  const petals = useMemo(
    () => Array.from({ length: 26 }, (_, i) => ({
      left: `${(i * 37) % 100 + 10}%`,
      delay: `${-(i * 1.7) % 14}s`,
      duration: `${10 + (i % 7) * 1.6}s`,
      scale: 0.6 + (i % 5) * 0.15,
    })),
    [],
  );
  return (
    <div className="petals">
      {petals.map((p, i) => (
        <i key={i} style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, scale: String(p.scale) }} />
      ))}
    </div>
  );
}

export function Title() {
  const startGame = useStore((s) => s.startGame);
  const toast = useStore((s) => s.toast);
  const [hasAuto, setHasAuto] = useState(false);
  const [dialog, setDialog] = useState<"new" | "load" | null>(null);
  const [name, setName] = useState("藤堂");

  useEffect(() => {
    listSaves().then((m) => setHasAuto(!!m.auto), () => setHasAuto(false));
  }, []);

  const begin = () => {
    const n = name.trim();
    if (!n) return toast("请输入名字", "bad");
    startGame(newGame(n.slice(0, 8), Math.random));
  };
  const resume = async () => {
    try {
      const s = await readSave("auto");
      if (s) startGame(s);
    } catch (e) {
      toast((e as Error).message, "bad");
    }
  };

  return (
    <div className="title-screen">
      <div className="title-bg" style={{ backgroundImage: `url(${cgUrl("title")})` }} />
      <div className="title-shade" />
      <Petals />

      <motion.div className="title-logo" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }}>
        <div className="sup">TAIMANIN</div>
        <h1>对魔忍</h1>
        <h2>五车学园物语</h2>
        <div className="en">GOSHA ACADEMY CHRONICLE</div>
      </motion.div>

      <motion.div className="title-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.7 }}>
        <button className="title-item" onClick={() => setDialog("new")}>新的开始<small>NEW GAME</small></button>
        <button className="title-item" disabled={!hasAuto} onClick={resume}>继续游戏<small>CONTINUE</small></button>
        <button className="title-item" onClick={() => setDialog("load")}>读取存档<small>LOAD</small></button>
      </motion.div>

      <div className="title-foot">同人作品 · 仅供个人娱乐</div>

      <AnimatePresence>
        {dialog && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDialog(null)}>
            <motion.div className="panel corners modal" style={dialog === "load" ? { width: 720 } : undefined}
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
              {dialog === "new" ? (
                <>
                  <h3>赴任五车学园</h3>
                  <div className="muted">请输入你的名字。学园的大家会称呼你为「{name.trim() || "……"}教官」。</div>
                  <input className="input" autoFocus value={name} maxLength={8}
                    onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && begin()} />
                  <div className="actions">
                    <button className="btn ghost" onClick={() => setDialog(null)}>返回</button>
                    <button className="btn primary" onClick={begin}>赴任</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ marginBottom: 18 }}>读取存档</h3>
                  <SaveSlots onLoad={startGame} />
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
