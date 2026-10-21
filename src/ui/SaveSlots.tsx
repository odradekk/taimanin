import { useEffect, useRef, useState } from "react";
import { importSave, listSaves, readSave, SLOTS, writeSave, type SaveMeta, type SlotId } from "../game/save";
import type { GameState } from "../game/types";
import { useStore } from "../store";
import { dateOf } from "./assets";

const SLOT_NAMES: Record<SlotId, string> = { auto: "自动", "1": "存档一", "2": "存档二", "3": "存档三" };

/** 存档栏。传入 current 时可以存档，否则只能读档。 */
export function SaveSlots({ current, onLoad }: { current?: GameState; onLoad: (s: GameState) => void }) {
  const toast = useStore((s) => s.toast);
  const [metas, setMetas] = useState<Record<SlotId, SaveMeta | null> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = () => listSaves().then(setMetas, () => toast("无法读取存档列表", "bad"));
  useEffect(() => { refresh(); }, []);

  const save = async (slot: SlotId) => {
    await writeSave(slot, current!);
    toast(`已保存到${SLOT_NAMES[slot]}`, "good");
    refresh();
  };
  const load = async (slot: SlotId) => {
    try {
      const s = await readSave(slot);
      if (s) onLoad(s);
    } catch (e) {
      toast((e as Error).message, "bad");
    }
  };
  const onFile = async (file?: File) => {
    if (!file) return;
    try {
      onLoad(await importSave(file));
    } catch (e) {
      toast((e as Error).message, "bad");
    }
  };

  return (
    <div className="slots">
      {SLOTS.map((slot) => {
        const m = metas?.[slot];
        return (
          <div className="slot" key={slot}>
            <span className="sid">{SLOT_NAMES[slot]}</span>
            <span className="sm">
              {m ? (
                <>
                  {m.playerName}教官 · 第 {m.day} 天（{dateOf(m.day).md}）· 声望 {m.reputation}
                  <br /><span className="faint">{new Date(m.savedAt).toLocaleString("zh-CN")}</span>
                </>
              ) : <span className="faint">空</span>}
            </span>
            <span className="btns">
              {current && slot !== "auto" && <button className="btn sm" onClick={() => save(slot)}>保存</button>}
              <button className="btn sm ghost" disabled={!m} onClick={() => load(slot)}>读取</button>
            </span>
          </div>
        );
      })}
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <button className="btn ghost" onClick={() => fileInput.current?.click()}>从文件导入存档</button>
    </div>
  );
}
