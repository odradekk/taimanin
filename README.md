# 对魔忍 · 五车学园物语

《对魔忍》同人游戏，仅供个人娱乐。玩法是经营五车学园（设施建设、资金和声望），招募和培养对魔忍（训练、任务派遣、交谈和赠礼提升羁绊），并以 galgame 形式推进剧情。

## 运行

```bash
npm install
npm run dev        # 开发：http://localhost:5730
npm run build      # 构建到 dist/
npm run preview    # 用构建结果在 http://localhost:5730 游玩
npm test           # 规则和剧本测试
```

不要直接双击 `dist/index.html`。浏览器会拦截 `file://` 下的 ES 模块，页面无法加载。

端口固定为 5730。存档保存在浏览器的 IndexedDB 中，按「协议 + 域名 + 端口」隔离：换了端口，旧存档就读不到了；清理浏览器的网站数据，存档也会被删除。请定期在「系统」页把存档导出为 JSON 文件备份。

## 目录

| 路径 | 内容 |
| --- | --- |
| `docs/` | 世界观、术语表、角色档案和剧本稿（`lorebook/`、`stories/`），玩法设计（`design/`），代码架构（`codebase/`）。代码里的设定文本与它冲突时，以 `docs/` 为准 |
| `src/game/rules.ts` | 全部游戏规则（训练、交谈、招募、设施、任务、结束一天） |
| `src/game/data/` | 角色、设施、任务、礼物、随机事件、主线触发条件等数值表 |
| `src/story/script.ts` | 剧本语法说明和解析器 |
| `src/story/scenes/` | 剧本：主线（main）、招募（recruit）、羁绊（bond） |
| `src/story/engine.ts` | 剧情播放状态机 |
| `src/ui/` | 界面：标题、主框架、各页面、剧情播放器 |
| `art/manifest.mjs` | 美术资源清单（画师串、尺寸、提示词、种子） |
| `public/assets/` | 生成好的立绘、背景和 CG |

## 美术资源

图片由 NovelAI V5（`nai-diffusion-5-full`）生成，需要 novalai 技能脚本，并设置环境变量 `NOVELAI_TOKEN`。

```bash
npm run art                  # 补齐缺失的图片
npm run art -- rinko office  # 只生成指定的几张（文件已存在时跳过）
npm run art -- rinko --force # 覆盖重新生成
```

所有图片共用同一组画师串和负面词，并按类型固定尺寸：立绘为 832×1216 透明背景，背景和 CG 为 1472×832。新增角色时，在 `art/manifest.mjs` 里加一条立绘和一条 CG，在 `src/game/data/characters.ts` 里加角色数据，再在 `src/story/scenes/` 里补上招募剧情和羁绊剧情。`npm test` 会检查剧情是否齐全。
