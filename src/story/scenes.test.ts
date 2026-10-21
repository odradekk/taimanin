import { describe, expect, it } from "vitest";
import { CHARACTERS, CHAR_ORDER } from "../game/data/characters";
import { BOND_LEVELS_WITH_SCENES, MAIN_TRIGGERS } from "../game/data/story";
import { SCENES, sceneCommands } from "./scenes";
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

  it("拒绝未知角色、背景和效果", () => {
    expect(() => parseScript("nobody: 你好")).toThrow(ScriptError);
    expect(() => parseScript("@bg moon")).toThrow(ScriptError);
    expect(() => parseScript("@effect luck=+1")).toThrow(ScriptError);
  });
});

describe("剧情内容", () => {
  const all = Object.values(SCENES);

  it("所有剧本都能解析", () => {
    for (const s of all) expect(() => sceneCommands(s.id), s.id).not.toThrow();
  });

  it("主线触发、招募和羁绊剧情都有对应剧本", () => {
    for (const t of MAIN_TRIGGERS) expect(SCENES[t.scene], t.scene).toBeDefined();
    for (const id of CHAR_ORDER) {
      if (CHARACTERS[id].recruit) expect(SCENES[`recruit_${id}`], `recruit_${id}`).toBeDefined();
      BOND_LEVELS_WITH_SCENES.forEach((level, i) => {
        const s = SCENES[`bond_${id}_${i + 1}`];
        expect(s, `bond_${id}_${i + 1}`).toMatchObject({ kind: "bond", char: id, bondLevel: level });
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
