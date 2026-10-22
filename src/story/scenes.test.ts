import { describe, expect, it } from "vitest";
import { assets } from "../../art/manifest.mjs";
import { CHAR_ORDER, CHARACTERS, MAIN_TRIGGERS } from "../game";
import { parseSceneFile, SCENES, sceneCommands } from "./scenes";
import { parseScript, ScriptError, type Cmd } from "./script";

function walk(cmds: Cmd[], visit: (c: Cmd) => void) {
  for (const c of cmds) {
    visit(c);
    if (c.t === "choice") c.options.forEach((o) => walk(o.reply, visit));
  }
}

describe("剧本语法", () => {
  it("解析台词、选项和缩进的回应", () => {
    const cmds = parseScript(`
      @bg office
      @show asagi left
      asagi: 欢迎，{player}。
      me: 请多指教。
      [学生] 是新来的教官！
      窗外传来钟声。
      @choice
      > 鞠躬 | bond=+5
        asagi: 不必拘礼。
      > 握手
      @effect funds=+100
    `);
    expect(cmds.map((c) => c.t)).toEqual(["bg", "show", "say", "say", "say", "say", "choice", "effect"]);
    const choice = cmds[6] as Extract<Cmd, { t: "choice" }>;
    expect(choice.options[0]).toMatchObject({ text: "鞠躬", effect: { bond: 5 } });
    expect(choice.options[0].reply).toHaveLength(1);
    expect(choice.options[1].reply).toHaveLength(0);
  });

  it("拒绝未知角色和效果", () => {
    expect(() => parseScript("nobody: 你好")).toThrow(ScriptError);
    expect(() => parseScript("@show nobody")).toThrow(ScriptError);
    expect(() => parseScript("@effect luck=+1")).toThrow(ScriptError);
  });

  it("剧情文件由字段头和剧本组成", () => {
    const s = parseSceneFile("x.txt", "id: bond_x_2\ntitle: 标题\nkind: bond\nchar: asagi\nlevel: 2\n---\n旁白");
    expect(s).toMatchObject({ id: "bond_x_2", kind: "bond", char: "asagi", level: 2, script: "旁白" });
    expect(() => parseSceneFile("x.txt", "id: a\ntitle: b\nkind: bond\n旁白")).toThrow(/---/);
    expect(() => parseSceneFile("x.txt", "id: a\ntitle: b\nkind: unknown\n---\n")).toThrow(/剧情类型/);
  });
});

describe("剧情内容", () => {
  const all = Object.values(SCENES);
  const manifest = (kind: string) => new Set(assets.filter((a) => a.kind === kind).map((a) => a.id));

  it("所有剧本都能解析", () => {
    for (const s of all) expect(() => sceneCommands(s.id), s.id).not.toThrow();
  });

  it("字段符合剧情类型", () => {
    for (const s of all) {
      if (s.kind !== "main" && s.kind !== "event") expect(CHARACTERS[s.char!], `${s.id} 的角色`).toBeDefined();
      if (s.kind === "bond") expect(s.level, s.id).toBeGreaterThanOrEqual(2);
      if (s.kind === "bond") expect(s.level, s.id).toBeLessThanOrEqual(10);
      if (s.kind === "fall") expect(s.id, s.id).toBe(`fall_${s.char}_${s.level}`);
      if (s.kind === "rescue") expect(s.id, s.id).toBe(`rescue_${s.char}`);
      if (s.kind === "secret") expect(["before", "after"], s.id).toContain(s.part);
    }
  });

  it("主线触发和招募都有对应剧本", () => {
    for (const t of MAIN_TRIGGERS) expect(SCENES[t.scene], t.scene).toBeDefined();
    for (const id of CHAR_ORDER) {
      if (CHARACTERS[id].recruit) expect(SCENES[`recruit_${id}`], `recruit_${id}`).toBeDefined();
    }
  });

  it("引用的背景、CG 和立绘都登记在 art/manifest.mjs", () => {
    const [bgs, cgs, portraits] = [manifest("bg"), manifest("cg"), manifest("portrait")];
    for (const s of all) {
      walk(sceneCommands(s.id), (c) => {
        if (c.t === "bg") expect(bgs.has(c.id), `${s.id} 背景 ${c.id}`).toBe(true);
        if (c.t === "cg" && c.id) expect(cgs.has(c.id), `${s.id} CG ${c.id}`).toBe(true);
        if (c.t === "show") expect(portraits.has(c.who), `${s.id} 立绘 ${c.who}`).toBe(true);
      });
    }
  });

  it("羁绊效果只出现在属于某个角色的剧情里", () => {
    for (const s of all) {
      walk(sceneCommands(s.id), (c) => {
        const effects = c.t === "effect" ? [c.effect] : c.t === "choice" ? c.options.map((o) => o.effect) : [];
        for (const e of effects) if (e.bond) expect(s.char, `${s.id} 使用了 bond 效果`).toBeDefined();
      });
    }
  });
});
