import { describe, expect, it } from "vitest";
import {
  addExp, addTalent, advance, CHARACTERS, effectiveStats, GameError, growthBlocker, growthStep, levelCap, newGame,
  newMember, panelStats, RANKS, resetTalents, secretTrial, talentBlocker, talentPoints, train, type GameState,
} from ".";

const always = (v: number) => () => v;

/** 一局已经招募了阿莎姬的游戏。 */
function withAsagi(patch: Partial<GameState["roster"][string]> = {}): GameState {
  const s = newGame("测试", always(0.5));
  s.roster.asagi = { ...newMember("asagi", s.day), ...patch };
  return s;
}

const plenty = (s: GameState) => {
  s.resources.funds = 1_000_000;
  s.resources.supplies = 10_000;
  for (const id of ["mana_shard", "mana_crystal", "mana_gem", "mana_treasure", "demon_crystal"]) s.inventory[id] = 999;
  s.facilities.lab.level = 5;
};

describe("属性", () => {
  it("1 级时等于角色表在初始资质下的基础值", () => {
    const s = withAsagi();
    expect(effectiveStats(s.roster.asagi)).toEqual(CHARACTERS.asagi.base);
    expect(effectiveStats(s.roster.yukikaze)).toEqual(CHARACTERS.yukikaze.base);
  });

  it("疲劳按比例降低属性，疲劳 100 时减半", () => {
    const s = withAsagi({ fatigue: 100 });
    expect(effectiveStats(s.roster.asagi).atk).toBe(Math.round(CHARACTERS.asagi.base.atk / 2));
  });

  it("羁绊每升一级五项属性 +4%", () => {
    const s = withAsagi();
    const before = panelStats(s.roster.asagi).hp;
    s.roster.asagi.bond = 60;
    expect(panelStats(s.roster.asagi).hp).toBe(Math.round(before * 1.04));
  });

  it("训练值不超过资质对应的上限", () => {
    const s = newGame("测试", always(0.5));
    const cap = Math.round(CHARACTERS.rinko.base.hp * 0.5);
    s.roster.rinko.trained.hp = cap - 1;
    const r = train(s, "rinko", "physical", always(0.5));
    expect(r.gains.hp).toBe(1);
    expect(s.roster.rinko.trained.hp).toBe(cap);
  });
});

describe("等级与位阶", () => {
  it("到达位阶上限后经验不再累积，晋升后才能继续升级", () => {
    const s = withAsagi();
    const t = s.roster.asagi;
    addExp(t, 10_000_000);
    expect(t.level).toBe(20);
    expect(t.exp).toBe(0);
    expect(growthStep(t)).toMatchObject({ kind: "rank", to: 1 });
    expect(growthBlocker(s, "asagi")).toMatch(/忍术研究所/);
    plenty(s);
    advance(s, "asagi");
    expect(t.rank).toBe(1);
    expect(s.inventory.mana_shard).toBe(999 - 10);
    addExp(t, 10_000_000);
    expect(t.level).toBe(RANKS[1].cap);
  });

  it("晋升带来中幅提升", () => {
    const s = withAsagi({ level: 20 });
    plenty(s);
    const before = panelStats(s.roster.asagi).atk;
    advance(s, "asagi");
    expect(panelStats(s.roster.asagi).atk).toBeGreaterThan(before);
  });
});

describe("秘传、秘术回路、淬炼", () => {
  const master = () => withAsagi({ level: 100, rank: 4 });

  it("皆传 100 级后的下一步是秘传，试炼胜利才扣材料", () => {
    const s = master();
    plenty(s);
    expect(growthStep(s.roster.asagi)?.kind).toBe("secret");
    expect(() => advance(s, "asagi")).toThrow(GameError);

    const fail = secretTrial(s, "asagi", always(0.999));
    expect(fail.success).toBe(false);
    expect(s.roster.asagi.injuredDays).toBeGreaterThan(0);
    expect(s.inventory.demon_crystal).toBe(999);

    s.roster.asagi.injuredDays = 0;
    expect(secretTrial(s, "asagi", always(0)).success).toBe(true);
    expect(s.roster.asagi.secret).toBe(true);
    expect(s.inventory.demon_crystal).toBe(999 - 5);
    expect(levelCap(s.roster.asagi)).toBe(100);
  });

  it("每打通一道秘术回路等级上限 +1，最多 110 级", () => {
    const s = master();
    plenty(s);
    const t = s.roster.asagi;
    t.secret = true;
    advance(s, "asagi");
    expect(t.circuits).toBe(1);
    expect(levelCap(t)).toBe(101);
    expect(growthBlocker(s, "asagi")).toMatch(/101 级/);
    for (let i = 1; i < 10; i++) {
      addExp(t, 10_000_000);
      advance(s, "asagi");
    }
    addExp(t, 10_000_000);
    expect(t.level).toBe(110);
    expect(growthStep(t)).toMatchObject({ kind: "temper", to: "UR" });
  });

  it("淬炼提升资质，等级和养成进度保持不变", () => {
    const s = withAsagi({ level: 110, rank: 4, secret: true, circuits: 10 });
    plenty(s);
    const before = panelStats(s.roster.asagi).atk;
    advance(s, "asagi");
    expect(s.roster.asagi).toMatchObject({ aptitude: "UR", level: 110, circuits: 10, secret: true });
    expect(panelStats(s.roster.asagi).atk).toBeGreaterThan(before);
    expect(growthStep(s.roster.asagi)).toBeNull();
  });
});

describe("天赋", () => {
  const firstNode = CHARACTERS.asagi.talents![0].nodes[0];
  const layer2 = CHARACTERS.asagi.talents![0].nodes.find((n) => n.layer === 2)!;

  it("天赋点等于等级，后面的层需要先在本分支投入足够点数", () => {
    const s = withAsagi({ level: 5 });
    expect(talentPoints(s.roster.asagi)).toBe(5);
    expect(talentBlocker(s, "asagi", layer2.id)).toMatch(/投入 10 点/);
    for (let i = 0; i < 5; i++) addTalent(s, "asagi", firstNode.id);
    expect(talentPoints(s.roster.asagi)).toBe(0);
    expect(talentBlocker(s, "asagi", firstNode.id)).toBe("已经点满");
  });

  it("属性节点按资质的天赋系数提升属性，可以免费重置", () => {
    const s = withAsagi({ level: 5 });
    const before = panelStats(s.roster.asagi).spd;
    for (let i = 0; i < 5; i++) addTalent(s, "asagi", firstNode.id);
    // 疾风：速度每级 +1.5%，阿莎姬是 SSR，天赋系数 1.3。5 级时速度 = 基础值 + 4 次成长。
    const { base, growth } = CHARACTERS.asagi;
    expect(panelStats(s.roster.asagi).spd).toBe(Math.round((base.spd + growth.spd * 4) * (1 + 0.015 * 5 * 1.3)));
    resetTalents(s, "asagi");
    expect(panelStats(s.roster.asagi).spd).toBe(before);
    expect(talentPoints(s.roster.asagi)).toBe(5);
  });
});
