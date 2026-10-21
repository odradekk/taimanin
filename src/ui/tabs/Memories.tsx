import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { SCENES, sceneCommands, type SceneDef } from "../../story/scenes";
import { CGS, type CgId, type Cmd } from "../../story/script";
import { useStore } from "../../store";
import { cgUrl } from "../assets";
import { TabHead } from "../Shell";

const KIND_NAMES: Record<SceneDef["kind"], string> = { main: "主线", recruit: "招募", bond: "羁绊" };

function cgsIn(cmds: Cmd[], out = new Set<CgId>()): Set<CgId> {
  for (const c of cmds) {
    if (c.t === "cg" && c.id) out.add(c.id);
    if (c.t === "choice") c.options.forEach((o) => cgsIn(o.reply, out));
  }
  return out;
}

export function Memories() {
  const g = useStore((s) => s.game)!;
  const play = useStore((s) => s.play);
  const [viewing, setViewing] = useState<CgId | null>(null);
  const scenes = Object.values(SCENES);

  // CG 在包含它的任意一段剧情看过后解锁；标题 CG 一开始就解锁。
  const unlocked = useMemo(() => {
    const set = new Set<CgId>(["title"]);
    for (const id of g.seenScenes) if (SCENES[id]) cgsIn(sceneCommands(id), set);
    return set;
  }, [g.seenScenes]);

  return (
    <>
      <TabHead title="回想" sub="重温看过的剧情和 CG。回放不会重复获得奖励。" wm="憶" />
      <div className="tab-body mem">
        <div className="panel mem-col">
          <div className="section-title">剧情回想 · {scenes.filter((s) => g.seenScenes.includes(s.id)).length} / {scenes.length}</div>
          <div className="scene-list scroll">
            {scenes.map((s) => {
              const seen = g.seenScenes.includes(s.id);
              return (
                <button key={s.id} className="scene-row" disabled={!seen} onClick={() => play({ sceneId: s.id, char: s.char, replay: true })}>
                  <span className="chip">{KIND_NAMES[s.kind]}</span>
                  <span className="grow">{seen ? s.title : "？？？"}</span>
                  {seen && <span className="faint">▶</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="panel mem-col">
          <div className="section-title">CG 鉴赏 · {unlocked.size} / {CGS.length}</div>
          <div className="cg-grid scroll">
            {CGS.map((id) => (
              <button key={id} className="cg-thumb" disabled={!unlocked.has(id)} onClick={() => setViewing(id)}>
                {unlocked.has(id) ? <img src={cgUrl(id)} alt="" loading="lazy" /> : <span className="lock">封</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {viewing && (
          <motion.div className="cg-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewing(null)}>
            <img src={cgUrl(viewing)} alt="" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
