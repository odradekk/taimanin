// 剧情播放的状态机。纯函数：每次推进返回新状态和这一步产生的效果，由调用方决定是否应用效果（回想模式不应用）。

import type { CharId } from "../game/types";
import type { BgId, CgId, Cmd, Effect, Slot, Speaker } from "./script";

type ChoiceOption = Extract<Cmd, { t: "choice" }>["options"][number];

export interface Line {
  who: Speaker | null;
  text: string;
}

export interface NovelState {
  stack: { cmds: Cmd[]; i: number }[];
  bg: BgId | null;
  cg: CgId | null;
  actors: { who: CharId; at: Slot }[];
  line: Line | null;
  choice: ChoiceOption[] | null;
  log: Line[];
  done: boolean;
}

type Step = [NovelState, Effect[]];

/** 执行指令直到遇到台词或选项（需要玩家操作）或剧本结束。 */
function run(state: NovelState): Step {
  const s: NovelState = { ...state, stack: state.stack.map((f) => ({ ...f })), actors: [...state.actors], line: null, choice: null };
  const effects: Effect[] = [];
  while (s.stack.length) {
    const frame = s.stack[s.stack.length - 1];
    if (frame.i >= frame.cmds.length) {
      s.stack.pop();
      continue;
    }
    const c = frame.cmds[frame.i++];
    switch (c.t) {
      case "bg": s.bg = c.id; break;
      case "cg": s.cg = c.id; break;
      case "show":
        s.actors = [...s.actors.filter((a) => a.who !== c.who && a.at !== c.at), { who: c.who, at: c.at }];
        break;
      case "hide": s.actors = c.who ? s.actors.filter((a) => a.who !== c.who) : []; break;
      case "effect": effects.push(c.effect); break;
      case "say":
        s.line = { who: c.who, text: c.text };
        s.log = [...s.log, s.line];
        return [s, effects];
      case "choice":
        // 选项出现时保留上一句台词，玩家可以对照着选择。
        s.choice = c.options;
        s.line = state.line;
        return [s, effects];
    }
  }
  return [{ ...s, done: true }, effects];
}

export function start(cmds: Cmd[], bg: BgId | null = null): Step {
  return run({ stack: [{ cmds, i: 0 }], bg, cg: null, actors: [], line: null, choice: null, log: [], done: false });
}

export function next(state: NovelState): Step {
  if (state.choice || state.done) return [state, []];
  return run(state);
}

export function choose(state: NovelState, index: number): Step {
  const option = state.choice?.[index];
  if (!option) return [state, []];
  const picked: NovelState = {
    ...state,
    stack: [...state.stack, { cmds: option.reply, i: 0 }],
    log: [...state.log, { who: { player: true }, text: `「${option.text}」` }],
  };
  const [s, effects] = run(picked);
  return [s, [option.effect, ...effects]];
}

/** 跳过剧情：直接结束，但收集剩余主干上的 @effect，保证主线奖励不会因为跳过而丢失。 */
export function skip(state: NovelState): Step {
  const effects: Effect[] = [];
  for (const frame of state.stack) {
    for (const c of frame.cmds.slice(frame.i)) if (c.t === "effect") effects.push(c.effect);
  }
  return [{ ...state, stack: [], line: null, choice: null, done: true }, effects];
}
