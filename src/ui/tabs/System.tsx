import { useState } from "react";
import { exportSave } from "../../game/save";
import { useStore } from "../../store";
import { SaveSlots } from "../SaveSlots";
import { useSettings } from "../settings";
import { TabHead } from "../Shell";

export function System() {
  const g = useStore((s) => s.game)!;
  const startGame = useStore((s) => s.startGame);
  const quitToTitle = useStore((s) => s.quitToTitle);
  const toast = useStore((s) => s.toast);
  const { textSpeed, autoDelay, update } = useSettings();
  const [confirmQuit, setConfirmQuit] = useState(false);

  return (
    <>
      <TabHead title="系统" sub="每天结束时会自动存档。浏览器清理网站数据会删除存档，建议定期导出备份。" wm="系" />
      <div className="tab-body sys">
        <div className="panel corners" style={{ padding: "24px 26px", alignSelf: "start" }}>
          <div className="section-title">存档</div>
          <SaveSlots current={g} onLoad={(s) => { startGame(s); toast("读取完成", "good"); }} />
          <button className="btn" style={{ marginTop: 10 }} onClick={() => exportSave(g)}>导出当前进度到文件</button>
        </div>

        <div className="panel corners" style={{ padding: "24px 26px", alignSelf: "start" }}>
          <div className="section-title">剧情设置</div>
          <label className="setting">
            <span>文字速度</span>
            <input type="range" min={15} max={120} value={textSpeed} onChange={(e) => update({ textSpeed: Number(e.target.value) })} />
            <span className="num faint">{textSpeed}</span>
          </label>
          <label className="setting">
            <span>自动间隔</span>
            <input type="range" min={600} max={4000} step={100} value={autoDelay} onChange={(e) => update({ autoDelay: Number(e.target.value) })} />
            <span className="num faint">{(autoDelay / 1000).toFixed(1)}s</span>
          </label>
          <div className="faint" style={{ fontSize: 12.5, lineHeight: 1.8, marginBottom: 20 }}>
            剧情中：点击或空格键推进，右键隐藏文本框，滚轮向上打开对话记录。
          </div>

          <div className="section-title">返回标题</div>
          {confirmQuit ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="muted" style={{ fontSize: 13, flex: 1 }}>未保存的进度会丢失，确定吗？</span>
              <button className="btn sm ghost" onClick={() => setConfirmQuit(false)}>取消</button>
              <button className="btn sm danger" onClick={quitToTitle}>返回标题</button>
            </div>
          ) : (
            <button className="btn ghost" onClick={() => setConfirmQuit(true)}>返回标题画面</button>
          )}
        </div>
      </div>
    </>
  );
}
