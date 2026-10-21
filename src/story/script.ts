import { CHARACTERS } from "../game/data/characters";
import type { CharId } from "../game/types";

export const BACKGROUNDS = [
  "academy", "academy_dusk", "office", "dojo", "classroom",
  "rooftop", "dorm", "infirmary", "city_night",
] as const;
export type BgId = (typeof BACKGROUNDS)[number];

export const CGS = [
  "title", "prologue", "cg_asagi", "cg_sakura", "cg_murasaki", "cg_shiranui",
  "cg_yukikaze", "cg_rinko", "cg_asuka", "cg_kurenai",
] as const;
export type CgId = (typeof CGS)[number];

export type Slot = "left" | "center" | "right";

/** 说话人：角色 ID、主角，或者只显示名字的路人。省略表示旁白。 */
export type Speaker = { char: CharId } | { player: true } | { name: string };

export interface Effect {
  funds?: number;
  supplies?: number;
  reputation?: number;
  /** 加到本剧情所属角色的羁绊值上。 */
  bond?: number;
}

export type Cmd =
  | { t: "bg"; id: BgId }
  | { t: "cg"; id: CgId | null }
  | { t: "show"; who: CharId; at: Slot }
  | { t: "hide"; who: CharId | null }
  | { t: "say"; who: Speaker | null; text: string }
  | { t: "choice"; options: { text: string; effect: Effect; reply: Cmd[] }[] }
  | { t: "effect"; effect: Effect };

/*
 * 剧本语法（每行一条，前后空白忽略，空行和 # 开头的行忽略）：
 *
 *   @bg office              切换背景
 *   @cg cg_asagi / @cg off  显示 / 关闭 CG
 *   @show asagi center      立绘登场（left / center / right，默认 center）
 *   @hide asagi / @hide     立绘退场（不写角色表示全部退场）
 *   @effect funds=+500 reputation=+10 bond=+5
 *   asagi: 台词             角色台词（角色 ID 加半角冒号）
 *   me: 台词                主角台词
 *   [学生A] 台词            路人台词
 *   其他文字                旁白
 *   @choice                 选项开始，后面紧跟若干选项：
 *   > 选项文字 | bond=+5    选项（| 后面可写效果）
 *     asagi: 回应           选项下缩进的行是选中后播放的内容
 *
 * 台词里的 {player} 会替换成主角名字。
 */

const SLOTS = new Set<string>(["left", "center", "right"]);
const EFFECT_KEYS = new Set<string>(["funds", "supplies", "reputation", "bond"]);

export class ScriptError extends Error {}

function parseEffect(src: string, lineNo: number): Effect {
  const effect: Effect = {};
  for (const part of src.trim().split(/\s+/).filter(Boolean)) {
    const m = /^(\w+)=([+-]?\d+)$/.exec(part);
    if (!m || !EFFECT_KEYS.has(m[1])) throw new ScriptError(`第 ${lineNo} 行：无法识别的效果「${part}」`);
    effect[m[1] as keyof Effect] = Number(m[2]);
  }
  return effect;
}

function isChar(id: string): id is CharId {
  return id in CHARACTERS;
}

function parseLine(line: string, lineNo: number): Cmd {
  if (line.startsWith("@")) {
    const [op, ...args] = line.slice(1).split(/\s+/);
    switch (op) {
      case "bg":
        if (!(BACKGROUNDS as readonly string[]).includes(args[0])) throw new ScriptError(`第 ${lineNo} 行：未知背景「${args[0]}」`);
        return { t: "bg", id: args[0] as BgId };
      case "cg":
        if (args[0] === "off") return { t: "cg", id: null };
        if (!(CGS as readonly string[]).includes(args[0])) throw new ScriptError(`第 ${lineNo} 行：未知 CG「${args[0]}」`);
        return { t: "cg", id: args[0] as CgId };
      case "show": {
        const at = args[1] ?? "center";
        if (!isChar(args[0])) throw new ScriptError(`第 ${lineNo} 行：未知角色「${args[0]}」`);
        if (!SLOTS.has(at)) throw new ScriptError(`第 ${lineNo} 行：未知位置「${at}」`);
        return { t: "show", who: args[0], at: at as Slot };
      }
      case "hide":
        if (args[0] && !isChar(args[0])) throw new ScriptError(`第 ${lineNo} 行：未知角色「${args[0]}」`);
        return { t: "hide", who: (args[0] as CharId) ?? null };
      case "effect":
        return { t: "effect", effect: parseEffect(args.join(" "), lineNo) };
      default:
        throw new ScriptError(`第 ${lineNo} 行：未知指令「@${op}」`);
    }
  }
  const npc = /^\[([^\]]+)\]\s*(.+)$/.exec(line);
  if (npc) return { t: "say", who: { name: npc[1] }, text: npc[2] };
  const said = /^([a-z]+):\s*(.+)$/.exec(line);
  if (said) {
    if (said[1] === "me") return { t: "say", who: { player: true }, text: said[2] };
    if (!isChar(said[1])) throw new ScriptError(`第 ${lineNo} 行：未知说话人「${said[1]}」`);
    return { t: "say", who: { char: said[1] }, text: said[2] };
  }
  return { t: "say", who: null, text: line };
}

export function parseScript(src: string): Cmd[] {
  const lines = src.split(/\r?\n/).map((raw, i) => ({ raw, no: i + 1 }))
    .filter(({ raw }) => raw.trim() && !raw.trim().startsWith("#"));
  // 剧本写在模板字符串里时整体带缩进，先去掉公共缩进，只保留选项回应的相对缩进。
  const base = Math.min(...lines.map(({ raw }) => /^\s*/.exec(raw)![0].length));
  const rows = lines.map(({ raw, no }) => ({ raw: raw.slice(base), no }));
  const out: Cmd[] = [];
  for (let i = 0; i < rows.length; i++) {
    const line = rows[i].raw.trim();
    if (line !== "@choice") {
      if (/^\s/.test(rows[i].raw) || line.startsWith(">")) throw new ScriptError(`第 ${rows[i].no} 行：缩进行或选项只能出现在 @choice 之后`);
      out.push(parseLine(line, rows[i].no));
      continue;
    }
    const options: { text: string; effect: Effect; reply: Cmd[] }[] = [];
    while (i + 1 < rows.length && rows[i + 1].raw.trim().startsWith(">")) {
      const { raw, no } = rows[++i];
      const [text, effectSrc = ""] = raw.trim().slice(1).split("|");
      const reply: Cmd[] = [];
      while (i + 1 < rows.length && /^\s/.test(rows[i + 1].raw) && !rows[i + 1].raw.trim().startsWith(">")) {
        reply.push(parseLine(rows[i + 1].raw.trim(), rows[++i].no));
      }
      options.push({ text: text.trim(), effect: parseEffect(effectSrc, no), reply });
    }
    if (options.length < 2) throw new ScriptError(`第 ${rows[i].no} 行：@choice 至少需要两个选项`);
    out.push({ t: "choice", options });
  }
  return out;
}
