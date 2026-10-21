import type { CharId } from "../game/types";
import { BOND_SCENES } from "./scenes/bond";
import { MAIN_SCENES } from "./scenes/main";
import { RECRUIT_SCENES } from "./scenes/recruit";
import { parseScript, type Cmd } from "./script";

export interface SceneDef {
  id: string;
  title: string;
  /** main：主线，由游戏进度自动触发；recruit：招募时播放；bond：羁绊达到等级后在角色页解锁。 */
  kind: "main" | "recruit" | "bond";
  char?: CharId;
  /** 羁绊剧情所需的羁绊等级。 */
  bondLevel?: number;
  script: string;
}

export const SCENES: Record<string, SceneDef> = Object.fromEntries(
  [...MAIN_SCENES, ...RECRUIT_SCENES, ...BOND_SCENES].map((s) => [s.id, s]),
);

const parsed = new Map<string, Cmd[]>();

export function sceneCommands(id: string): Cmd[] {
  let cmds = parsed.get(id);
  if (!cmds) {
    cmds = parseScript(SCENES[id].script);
    parsed.set(id, cmds);
  }
  return cmds;
}

export function bondScenesOf(char: CharId): SceneDef[] {
  return BOND_SCENES.filter((s) => s.char === char).sort((a, b) => a.bondLevel! - b.bondLevel!);
}
