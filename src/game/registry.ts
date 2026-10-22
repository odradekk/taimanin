// 汇总 src/content/ 的内容数据，建立 ID 索引。规则和界面只从这里读取内容。
// 角色按文件自动收集：在 content/characters/ 新增一个文件就会生效，不用改这里。

import { ITEMS } from "../content/items";
import type { CharacterDef, CharId, ItemDef, ItemId } from "./defs";

const characterFiles = import.meta.glob<CharacterDef>("../content/characters/*.ts", { eager: true, import: "default" });

export const CHARACTERS: Record<CharId, CharacterDef> = Object.fromEntries(
  Object.values(characterFiles).map((c) => [c.id, c]),
);

/** 开局成员在前，其余按招募所需声望排列。 */
export const CHAR_ORDER: CharId[] = Object.values(CHARACTERS)
  .sort((a, b) => (a.recruit?.reputation ?? -1) - (b.recruit?.reputation ?? -1))
  .map((c) => c.id);

export const ITEM_BY_ID: Record<ItemId, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export * from "../content/balance";
export * from "../content/events";
export * from "../content/facilities";
export * from "../content/items";
export * from "../content/missions";
export * from "../content/story-triggers";
export * from "../content/trainings";
