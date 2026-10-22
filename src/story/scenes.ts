// 剧情登记。剧情是 src/content/scenes/<类型>/<id>.txt 文本文件，新增剧情只需要加文件。
// 文件格式见 docs/codebase/architecture.md 的「剧情」一节：开头若干行「字段: 值」，一行 --- 之后是剧本。

import type { CharId } from "../game";
import { parseScript, ScriptError, type Cmd } from "./script";

export const SCENE_KINDS = ["main", "recruit", "bond", "secret", "fall", "rescue", "event"] as const;
export type SceneKind = (typeof SCENE_KINDS)[number];

export interface SceneDef {
  id: string;
  title: string;
  kind: SceneKind;
  char?: CharId;
  /** 羁绊剧情所需的羁绊等级，或堕落剧情对应的堕落等级。 */
  level?: number;
  /** 秘传剧情的前篇或后篇。 */
  part?: "before" | "after";
  /** 任务事件对应的任务等级。 */
  rank?: number;
  script: string;
}

/** 解析剧情文件的字段头，path 只用于报错。 */
export function parseSceneFile(path: string, text: string): SceneDef {
  const lines = text.split(/\r?\n/);
  const sep = lines.findIndex((l) => l.trim() === "---");
  if (sep < 0) throw new ScriptError(`${path}：缺少分隔字段和剧本的 --- 行`);
  const fields: Record<string, string> = {};
  for (const line of lines.slice(0, sep)) {
    if (!line.trim()) continue;
    const m = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (!m) throw new ScriptError(`${path}：无法识别的字段「${line}」`);
    fields[m[1]] = m[2].trim();
  }
  const kind = fields.kind as SceneKind;
  if (!fields.id || !fields.title) throw new ScriptError(`${path}：缺少 id 或 title`);
  if (!SCENE_KINDS.includes(kind)) throw new ScriptError(`${path}：未知的剧情类型「${fields.kind}」`);
  const num = (k: string) => (fields[k] === undefined ? undefined : Number(fields[k]));
  return {
    id: fields.id,
    title: fields.title,
    kind,
    char: fields.char,
    level: num("level"),
    part: fields.part as SceneDef["part"],
    rank: num("rank"),
    script: lines.slice(sep + 1).join("\n"),
  };
}

const files = import.meta.glob<string>("../content/scenes/**/*.txt", { query: "?raw", import: "default", eager: true });

export const SCENES: Record<string, SceneDef> = Object.fromEntries(
  Object.entries(files).map(([path, text]) => {
    const scene = parseSceneFile(path, text);
    return [scene.id, scene];
  }),
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

/** 某名角色的羁绊剧情，按所需羁绊等级排列。 */
export function bondScenesOf(char: CharId): SceneDef[] {
  return Object.values(SCENES).filter((s) => s.kind === "bond" && s.char === char).sort((a, b) => a.level! - b.level!);
}

export function secretScene(char: CharId, part: "before" | "after"): SceneDef | undefined {
  return Object.values(SCENES).find((s) => s.kind === "secret" && s.char === char && s.part === part);
}

function walk(cmds: Cmd[], visit: (c: Cmd) => void) {
  for (const c of cmds) {
    visit(c);
    if (c.t === "choice") c.options.forEach((o) => walk(o.reply, visit));
  }
}

/** 剧情里出现的全部背景和 CG，按剧情顺序去重。 */
export function sceneAssets(ids: string[] = Object.keys(SCENES)): { bgs: string[]; cgs: string[] } {
  const bgs = new Set<string>();
  const cgs = new Set<string>();
  for (const id of ids) {
    walk(sceneCommands(id), (c) => {
      if (c.t === "bg") bgs.add(c.id);
      if (c.t === "cg" && c.id) cgs.add(c.id);
    });
  }
  return { bgs: [...bgs], cgs: [...cgs] };
}
