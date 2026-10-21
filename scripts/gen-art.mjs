// 按 art/manifest.mjs 补齐 public/assets 下缺失的图片。
// 用法：npm run art [-- id1 id2 ...] [-- --force]
// 依赖 novalai 技能脚本（NOVALAI_SCRIPT 可覆盖路径）和环境变量 NOVELAI_TOKEN。

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { assets, kinds } from "../art/manifest.mjs";

const NOVALAI =
  process.env.NOVALAI_SCRIPT ?? join(homedir(), ".claude/skills/novalai/scripts/novalai.mjs");
const OUT_ROOT = resolve(import.meta.dirname, "../public/assets");
const MODEL = "nai-diffusion-5-full";

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = new Set(args.filter((a) => !a.startsWith("--")));

const tmp = mkdtempSync(join(tmpdir(), "rpgx-art-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failed = 0;
for (const asset of assets) {
  if (only.size && !only.has(asset.id)) continue;
  const kind = kinds[asset.kind];
  const dir = join(OUT_ROOT, kind.dir);
  if (existsSync(join(dir, `${asset.id}.png`)) && !force) continue;
  mkdirSync(dir, { recursive: true });

  const promptFile = join(tmp, `${asset.id}.txt`);
  writeFileSync(promptFile, kind.prompt(asset));
  const cliArgs = [
    NOVALAI, "--prompt-file", promptFile, "--negative-prompt", asset.negative,
    "--output-dir", dir, "--name", asset.id, "--size", kind.size,
    "--seed", String(asset.seed), "--model", MODEL, "--overwrite",
  ];

  // 429（并发或用量受限）和超时、5xx 属于临时失败，等待后重试。
  for (let attempt = 1; ; attempt++) {
    const run = spawnSync(process.execPath, cliArgs, { encoding: "utf8" });
    const result = JSON.parse(run.stdout || "{}");
    if (result.ok) {
      console.log(`ok   ${kind.dir}/${asset.id}.png`);
      break;
    }
    const err = result.error ?? {};
    const transient = err.kind === "unknown-outcome" || /HTTP 429/.test(err.message ?? "");
    if (transient && attempt < 6) {
      console.log(`wait ${asset.id}: ${err.message}, retry ${attempt}`);
      await sleep(30_000 * attempt);
      continue;
    }
    console.error(`FAIL ${asset.id}: ${JSON.stringify(result.error ?? run.stderr)}`);
    failed++;
    break;
  }
}

rmSync(tmp, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
