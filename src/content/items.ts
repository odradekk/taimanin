import type { ItemDef } from "../game/defs";

export const ITEMS: ItemDef[] = [
  // 礼物：在商店购买，赠送给成员提升羁绊。
  { id: "yokan", kind: "gift", icon: "羹", name: "高级羊羹", desc: "老字号和果子店的招牌。", price: 150 },
  { id: "matcha", kind: "gift", icon: "茶", name: "抹茶礼盒", desc: "宇治产的上等抹茶。", price: 200 },
  { id: "sake", kind: "gift", icon: "酒", name: "吟酿清酒", desc: "口感清冽的地酒。仅限成年人。", price: 300 },
  { id: "gunkit", kind: "gift", icon: "械", name: "枪械保养套件", desc: "专业级的清洁和润滑工具。", price: 260 },
  { id: "whetstone", kind: "gift", icon: "砥", name: "天然磨刀石", desc: "京都产的天然砥石。", price: 240 },
  { id: "parts", kind: "gift", icon: "件", name: "精密伺服零件", desc: "军规级的机械零件。", price: 320 },
  { id: "tomato", kind: "gift", icon: "汁", name: "番茄汁礼盒", desc: "浓郁的无盐番茄汁。", price: 120 },
  { id: "novel", kind: "gift", icon: "书", name: "新刊小说", desc: "最近流行的长篇小说。", price: 100 },

  // 养成材料：从魔族身上回收、经忍术研究所提纯的魔力（见 docs/lorebook/terms.md 的「养成与战斗」）。
  { id: "mana_shard", kind: "material", icon: "片", name: "魔力碎片", desc: "纯度最低的魔力，用于晋升初传、中传。" },
  { id: "mana_crystal", kind: "material", icon: "晶", name: "魔力结晶", desc: "凝成结晶的魔力，用于晋升中传、奥传。" },
  { id: "mana_gem", kind: "material", icon: "玉", name: "魔力宝玉", desc: "高纯度的魔力，用于晋升奥传、皆传。" },
  { id: "mana_treasure", kind: "material", icon: "宝", name: "魔力至宝", desc: "极少见的高纯度魔力，用于晋升皆传和秘传。" },
  { id: "demon_crystal", kind: "material", icon: "魔", name: "魔界结晶", desc: "只在魔界之门附近和魔族贵族身上出现，用于秘传、打通秘术回路和淬炼。" },
];
