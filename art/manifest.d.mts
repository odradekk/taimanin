// manifest.mjs 的类型声明，供测试检查剧情引用的背景、CG 和立绘是否登记在清单里。

export interface AssetEntry {
  id: string;
  kind: "portrait" | "bg" | "cg";
  seed: number;
  negative: string;
  subject: string;
  pose?: string;
}

export const kinds: Record<AssetEntry["kind"], { dir: string; size: string; prompt: (a: AssetEntry) => string }>;
export const assets: AssetEntry[];
