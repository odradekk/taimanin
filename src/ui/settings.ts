import { create } from "zustand";

export interface Settings {
  /** 文字显示速度，每秒字数。 */
  textSpeed: number;
  /** 自动模式下每句台词显示完后的等待时间（毫秒）。 */
  autoDelay: number;
}

const KEY = "gosha:settings";
const DEFAULTS: Settings = { textSpeed: 45, autoDelay: 1600 };

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

export const useSettings = create<Settings & { update: (patch: Partial<Settings>) => void }>((set, get) => ({
  ...load(),
  update: (patch) => {
    set(patch);
    const { textSpeed, autoDelay } = get();
    try {
      localStorage.setItem(KEY, JSON.stringify({ textSpeed, autoDelay }));
    } catch {
      // 存储不可用时只在本次运行中生效。
    }
  },
}));
