import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { sceneAssets, SCENES, sceneCommands, type SceneKind } from "../../story/scenes";
import type { CgId, Cmd } from "../../story/script";
import { useStore } from "../../store";
import { cgUrl } from "../assets";
import { TabHead } from "../Shell";

const KIND_NAMES: Record<SceneKind, string> = { main: "主线", recruit: "招募", bond: "羁绊", secret: "秘传", fall: "堕落", rescue: "营救", event: "事件" };

/** 鉴赏列表：标题 CG 加上剧情里出现过的全部 CG。 */
const ALL_CGS = ["title", ...sceneAssets().cgs.filter((id) => id !== "title")];

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
          <div className="section-title">CG 鉴赏 · {unlocked.size} / {ALL_CGS.length}</div>
          <div className="cg-grid scroll">
            {ALL_CGS.map((id) => <CgThumb key={id} id={id} unlocked={unlocked.has(id)} onView={() => setViewing(id)} />)}
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

/** CG 可以晚于剧本绘制，图片还不存在时显示「未绘制」。 */
function CgThumb({ id, unlocked, onView }: { id: CgId; unlocked: boolean; onView: () => void }) {
  const [missing, setMissing] = useState(false);
  return (
    <button className="cg-thumb" disabled={!unlocked || missing} onClick={onView}>
      {!unlocked ? <span className="lock">封</span>
        : missing ? <span className="lock">未绘制</span>
        : <img src={cgUrl(id)} alt="" loading="lazy" onError={() => setMissing(true)} />}
    </button>
  );
}
