// 内容校验：数据之间的引用都能找到，结构符合设计。新增内容数据后由它发现拼写错误和遗漏。

import { describe, expect, it } from "vitest";
import {
  CHARACTERS, CIRCUIT_COST, FACILITIES, ITEM_BY_ID, ITEMS, MATERIAL_DROPS, MISSION_BY_ID, RANKS, SECRET_COST,
  STAT_ORDER, TALENT_LAYER_UNLOCK, TEMPER_COST, type Cost,
} from ".";

describe("角色", () => {
  const chars = Object.values(CHARACTERS);

  it("喜好的礼物和招募所需的设施都存在", () => {
    for (const c of chars) {
      for (const g of c.likes) expect(ITEM_BY_ID[g]?.kind, `${c.id} 喜好 ${g}`).toBe("gift");
      if (c.recruit?.facility) expect(FACILITIES[c.recruit.facility[0]], c.id).toBeDefined();
    }
  });

  it("天赋树是三个分支，每个分支四层、60 点，节点 ID 不重复", () => {
    const seen = new Set<string>();
    for (const c of chars.filter((x) => x.talents)) {
      expect(c.talents, c.id).toHaveLength(3);
      for (const b of c.talents!) {
        expect(b.nodes.reduce((sum, n) => sum + n.maxRank * n.cost, 0), `${c.id}/${b.id}`).toBe(60);
        expect(new Set(b.nodes.map((n) => n.layer)), `${c.id}/${b.id}`).toEqual(new Set([1, 2, 3, 4]));
        expect(b.nodes.filter((n) => n.kind === "core"), `${c.id}/${b.id}`).toHaveLength(1);
        for (const n of b.nodes) {
          expect(seen.has(n.id), n.id).toBe(false);
          seen.add(n.id);
          expect(TALENT_LAYER_UNLOCK[n.layer], n.id).toBeDefined();
          for (const m of n.mods ?? []) expect(STAT_ORDER, n.id).toContain(m.stat);
        }
      }
    }
  });

  it("有秘传的角色都设置了试炼战力", () => {
    for (const c of chars.filter((x) => x.secret)) expect(c.secret!.trialPower, c.id).toBeGreaterThan(0);
  });
});

describe("物品与消耗", () => {
  it("物品 ID 不重复，养成消耗和任务掉落引用的材料都存在", () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    const costs: Cost[] = [...RANKS.flatMap((r) => (r.cost ? [r.cost] : [])), SECRET_COST, CIRCUIT_COST, ...Object.values(TEMPER_COST)];
    const ids = [...costs.flatMap((c) => Object.keys(c.items ?? {})), ...MATERIAL_DROPS.flatMap((d) => Object.keys(d))];
    for (const id of ids) expect(ITEM_BY_ID[id]?.kind, id).toBe("material");
  });

  it("每个可能被俘的任务等级都有对应的营救任务", () => {
    for (let rank = 1; rank <= 5; rank++) {
      const rescue = MISSION_BY_ID[`rescue_${Math.min(5, rank + 1)}`];
      expect(rescue?.rescue, `rank ${rank}`).toBe(true);
    }
  });
});
