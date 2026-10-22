import { get, set } from "idb-keyval";
import { loadState } from "./state";
import type { GameState } from "./state";

export const SLOTS = ["auto", "1", "2", "3"] as const;
export type SlotId = (typeof SLOTS)[number];

export interface SaveMeta {
  savedAt: number;
  day: number;
  playerName: string;
  reputation: number;
}

interface SaveRecord {
  meta: SaveMeta;
  state: GameState;
}

const key = (slot: SlotId) => `save:${slot}`;

export async function writeSave(slot: SlotId, state: GameState) {
  const meta: SaveMeta = { savedAt: Date.now(), day: state.day, playerName: state.playerName, reputation: state.resources.reputation };
  await set(key(slot), { meta, state } satisfies SaveRecord);
}

export async function readSave(slot: SlotId): Promise<GameState | null> {
  const rec = await get<SaveRecord>(key(slot));
  return rec ? loadState(rec.state) : null;
}

export async function listSaves(): Promise<Record<SlotId, SaveMeta | null>> {
  const metas = await Promise.all(SLOTS.map(async (slot) => (await get<SaveRecord>(key(slot)))?.meta ?? null));
  return Object.fromEntries(SLOTS.map((slot, i) => [slot, metas[i]])) as Record<SlotId, SaveMeta | null>;
}

/** 把存档下载成 JSON 文件，用于备份（浏览器清理网站数据时 IndexedDB 会被一起删除）。 */
export function exportSave(state: GameState) {
  const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `五车学园-第${state.day}天.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importSave(file: File): Promise<GameState> {
  try {
    return loadState(JSON.parse(await file.text()));
  } catch (e) {
    throw e instanceof SyntaxError ? new Error("文件不是有效的 JSON") : e;
  }
}
