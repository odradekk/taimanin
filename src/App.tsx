import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { CHAR_ORDER } from "./game/data/characters";
import { SCENES } from "./story/scenes";
import { BACKGROUNDS, CGS } from "./story/script";
import { useStore } from "./store";
import { bgUrl, cgUrl, portraitUrl } from "./ui/assets";
import { Novel } from "./ui/Novel";
import { Shell } from "./ui/Shell";
import { Title } from "./ui/Title";

const W = 1600;
const H = 900;

function useStageScale() {
  const fit = () => Math.min(window.innerWidth / W, window.innerHeight / H);
  const [scale, setScale] = useState(fit);
  useEffect(() => {
    const onResize = () => setScale(fit());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
}

// 图片都是 1～2MB 的 PNG，启动时预加载，避免切换页面和剧情时背景闪黑。
function usePreloadAssets() {
  useEffect(() => {
    const urls = [
      ...CHAR_ORDER.map(portraitUrl), ...BACKGROUNDS.map(bgUrl), ...CGS.map(cgUrl),
    ];
    urls.forEach((u) => { new Image().src = u; });
  }, []);
}

export function App() {
  const scale = useStageScale();
  usePreloadAssets();
  const inGame = useStore((s) => s.game !== null);
  const pending = useStore((s) => s.game?.pendingScenes[0]);
  const playing = useStore((s) => s.playing);
  const report = useStore((s) => s.report);
  const toasts = useStore((s) => s.toasts);
  const play = useStore((s) => s.play);

  // 日报关闭后、没有其他剧情在播时，依次播放待触发的主线剧情。
  useEffect(() => {
    if (pending && !playing && !report) play({ sceneId: pending, char: SCENES[pending]?.char, replay: false });
  }, [pending, playing, report, play]);

  return (
    <div className="viewport">
      <div className="stage" style={{ zoom: scale }}>
        <AnimatePresence mode="wait">
          {inGame ? (
            <motion.div key="game" className="shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <Shell />
            </motion.div>
          ) : (
            <motion.div key="title" className="shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <Title />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{playing && <Novel key={playing.sceneId ?? "talk"} playing={playing} />}</AnimatePresence>

        <div className="toasts">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div key={t.id} className={`toast ${t.tone}`} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
