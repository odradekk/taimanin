import { produce } from "immer";
import { create } from "zustand";
import * as rules from "./game/rules";
import { writeSave } from "./game/save";
import type { CharId, DayReport, GameState } from "./game/types";
import type { BgId, Cmd, Effect } from "./story/script";

export type Tab = "home" | "facilities" | "roster" | "recruit" | "missions" | "shop" | "memories" | "system";

export interface Toast {
  id: number;
  text: string;
  tone: "info" | "good" | "bad";
}

/** 正在播放的剧情：剧本里的剧情用 sceneId，交谈等临时对话直接给出指令。 */
export interface Playing {
  sceneId?: string;
  cmds?: Cmd[];
  bg?: BgId;
  char?: CharId;
  /** 回想模式：不应用效果，也不记录为已读。 */
  replay: boolean;
}

interface Store {
  game: GameState | null;
  tab: Tab;
  focus: CharId | null;
  playing: Playing | null;
  report: DayReport | null;
  toasts: Toast[];

  startGame: (game: GameState) => void;
  quitToTitle: () => void;
  setTab: (tab: Tab) => void;
  setFocus: (id: CharId | null) => void;
  /** 执行一个规则操作。规则抛出 GameError 时提示原因并返回 undefined。 */
  act: <T>(fn: (s: GameState) => T) => T | undefined;
  play: (p: Playing) => void;
  applySceneEffects: (effects: Effect[]) => void;
  finishPlaying: () => void;
  endDay: () => void;
  closeReport: () => void;
  toast: (text: string, tone?: Toast["tone"]) => void;
}

let toastId = 0;

export const useStore = create<Store>((set, get) => ({
  game: null,
  tab: "home",
  focus: null,
  playing: null,
  report: null,
  toasts: [],

  startGame: (game) => set({ game, tab: "home", focus: null, playing: null, report: null }),
  quitToTitle: () => set({ game: null, playing: null, report: null }),
  setTab: (tab) => set({ tab }),
  setFocus: (focus) => set({ focus }),

  act: (fn) => {
    const { game } = get();
    if (!game) return undefined;
    let result: ReturnType<typeof fn> | undefined;
    try {
      const next = produce(game, (draft) => {
        result = fn(draft);
      });
      set({ game: next });
      return result;
    } catch (e) {
      if (e instanceof rules.GameError) {
        get().toast(e.message, "bad");
        return undefined;
      }
      throw e;
    }
  },

  play: (playing) => set({ playing }),

  applySceneEffects: (effects) => {
    const { playing, act } = get();
    if (!playing || playing.replay || effects.length === 0) return;
    act((s) => effects.forEach((e) => rules.applyEffect(s, e, playing.char)));
  },

  finishPlaying: () => {
    const { playing, act } = get();
    if (playing?.sceneId && !playing.replay) act((s) => rules.markSeen(s, playing.sceneId!));
    set({ playing: null });
  },

  endDay: () => {
    const report = get().act((s) => rules.endDay(s, Math.random));
    if (!report) return;
    set({ report });
    writeSave("auto", get().game!).catch(() => get().toast("自动存档失败", "bad"));
  },

  closeReport: () => set({ report: null }),

  toast: (text, tone = "info") => {
    const id = ++toastId;
    set((st) => ({ toasts: [...st.toasts, { id, text, tone }] }));
    setTimeout(() => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })), 2600);
  },
}));
