# 代码架构

状态：目标架构。最后一节的迁移步骤里，第 1 步（目录重组、剧情文本文件、字符串 ID）和第 3 步（养成系统）已经完成，第 2 步只完成了内容校验测试，效果系统要等战斗系统一起实现。玩法规则见 [docs/design/](../design/)。

## 1. 原则

1. **数据与实现分离。** 角色、技能、天赋、敌人、任务、道具、状态、剧情等游戏内容都写成数据。规则代码只实现通用机制，按数据执行。新增内容只加数据；只有新增一种机制（新的效果、触发时机或条件）时才改代码。
2. **规则与界面分离。** 规则是不依赖 React 的纯函数：输入状态、操作和随机数，修改状态并返回结果。界面只负责显示，并把玩家操作转成规则调用，自己不计算数值。
3. **结果可以复现。** 规则里的随机数全部来自传入的、带种子的随机数生成器。同一个种子加同样的操作，得到同样的结果。测试、硬核存档和数值模拟都依赖这一点。
4. **存档只存会变化的东西。** 存档里只有 ID 和会变化的数字（等级、经验、羁绊值等），定义一律从内容数据读取。调整数值、修改技能都不需要迁移存档。

## 2. 目录与分层

```
src/
  content/              内容数据：只有数据，不含逻辑
    characters/         每个角色一个文件：属性、技能、天赋树、羁绊技能、招募条件、台词
    enemies/            敌人，按势力分文件
    missions/           任务模板，按任务等级分文件
    scenes/             剧情文本文件，按剧情类型分目录
    attack-types.ts     八种攻击类型的规则参数
    traits.ts           特性（装甲、飞行、机械等）
    statuses.ts         状态
    items.ts            道具、临时装备、材料、礼物
    facilities.ts       设施
    trainings.ts        训练
    events.ts           学园日常随机事件
    story-triggers.ts   主线剧情的触发条件
    map.ts              各任务等级的地图层数和节点比例
    balance.ts          全局数值：资质系数、成长倍数、经验曲线、俘获概率、每日堕落值等
  game/                 规则：纯函数，不依赖 React
    defs.ts             内容数据的类型定义
    state.ts            GameState 类型、新游戏、存档版本迁移
    registry.ts         汇总 content/，建立 ID 索引
    rng.ts              带种子的随机数生成器
    effects/            效果系统：效果、修正、触发、条件的实现
    stats.ts            属性计算
    progression.ts      升级、位阶、秘传、秘术回路、淬炼、天赋、羁绊
    academy.ts          训练、交谈、赠礼、招募、设施
    day.ts              结束一天
    missions.ts         任务栏、出击准备、派遣
    map.ts              任务地图的生成和推进
    combat/             行动轴、指令、伤害、架势、状态、敌人行动
    captivity.ts        俘获、堕落、营救、恢复
  story/                剧本解析和播放
  ui/                   React 界面
  store.ts              zustand：持有 GameState，调用规则，处理存档
```

各层只能引用下表列出的部分：

| 层 | 可以引用 |
| --- | --- |
| `content/` | `game/defs.ts` 里的类型 |
| `game/` | `game/` 内部；内容只通过 `registry.ts` 读取 |
| `story/` | `game/defs.ts`、`game/registry.ts` |
| `store.ts` | `game/`、`story/` |
| `ui/` | `store.ts`、`story/`，以及 `game/` 里的只读查询函数 |

`ui/` 不直接修改 GameState，所有修改都经过 `store.act` 调用规则。

## 3. 内容数据

### 写法

- 用 TypeScript 文件写数据。每个文件默认导出一个定义或一个数组，用 `satisfies` 做类型检查。选 TypeScript 而不选 JSON，是因为它有类型检查和自动补全、能写注释、不需要额外的加载和校验代码，写出来仍然是纯数据。
- 剧情这类大段文字用纯文本文件，见「剧情」一节。
- 每个定义有一个字符串 `id`，定义之间只通过 `id` 引用。

```ts
// src/content/characters/yukikaze.ts（节选）
export default {
  id: "yukikaze",
  name: "水城雪风",
  aptitude: "R",
  base: { hp: 140, atk: 34, def: 20, spd: 36, nin: 32 },
  growth: { hp: 8, atk: 2.6, def: 1.6, spd: 2.6, nin: 2.4 },
  skills: [
    {
      id: "yukikaze_thunder_bullet",
      slot: "ninjutsu",
      name: "雷遁弹",
      type: "lightning",
      cost: 30,
      target: "enemy",
      effects: [
        { op: "damage", mult: 1.5, stance: 20 },
        { op: "applyStatus", status: "paralysis", chance: 0.25 },
      ],
    },
  ],
} satisfies CharacterDef;
```

### 注册

- `registry.ts` 用 Vite 的 `import.meta.glob("../content/characters/*.ts", { eager: true, import: "default" })` 收集各目录下的文件。新增一个角色或敌人文件就会自动生效，不用改任何索引文件。Vitest 走同一套 Vite 转换，测试里也能用。
- 汇总后建立「ID → 定义」的索引，供规则和界面查询。

### ID

- ID 一律用字符串类型（例如 `type CharId = string`），不再用现在的联合类型。联合类型要求每加一个角色就改代码，和数据驱动冲突。
- 拼错 ID 由内容校验测试发现，见「测试」一节。

### 数值

全局数值集中在 `content/balance.ts`。公式（例如伤害公式）只在规则代码里写一次，引用 `balance.ts` 里的常数。调整难度时只改数据。

## 4. 效果系统

技能、天赋节点、羁绊技能、道具、临时装备、状态、特性、攻击类型和剧情选项，都用同一套基本结构描述：

| 结构 | 作用 | 例子 |
| --- | --- | --- |
| 效果 | 立即执行的一个动作 | 造成伤害、施加状态、行动提前、增加羁绊 |
| 修正 | 持续生效的数值修改 | 攻击 +2%、受到的雷属性伤害 +25% |
| 触发 | 在某个时机、满足条件时执行一组效果 | 普通攻击后 30% 概率追加一次普通攻击 |
| 条件 | 判断当前情况 | 目标潮湿、自身体力低于 50%、夜间任务 |

规则代码为每一种效果、触发时机和条件各写一个实现，内容数据只做组合。

| 初始需要的效果 | 说明 |
| --- | --- |
| `damage` | 按攻击类型和倍率造成伤害，同时削减架势 |
| `heal`、`shield` | 回复体力、获得护盾 |
| `applyStatus`、`removeStatus` | 施加、移除状态 |
| `dispel` | 移除增益或护盾 |
| `advance` | 行动提前或推迟 |
| `particles` | 增减对魔粒子 |
| `swapRow` | 交换敌人的前后排 |
| `chain` | 对带有某种状态的其他敌人造成传导伤害 |
| `revive` | 倒下的成员归队 |
| `summon` | 召唤敌人 |
| `extraAction` | 立即追加一次行动 |
| `grant` | 学园层面的收益：资金、物资、声望、羁绊、道具、材料 |

触发时机：战斗开始、回合开始、回合结束、行动前、行动后、命中时、受到伤害时、击败敌人时、倒下时、战斗结束。

条件：带有某状态（可以指定层数）、带有某特性、攻击类型、体力低于、所在排、夜间、概率。

攻击类型也是数据。例如导电：

```ts
// src/content/attack-types.ts（节选）
lightning: {
  name: "雷",
  range: "ranged",
  stat: "nin",
  vsTrait: { mechanical: 1.5 },
  modifiers: [{ when: { targetHas: "wet" }, damagePct: 30 }],
  onHit: [
    {
      when: { targetHas: "wet" },
      effects: [
        { op: "chain", toStatus: "wet", pct: 50 },
        { op: "removeStatus", status: "wet" },
      ],
    },
  ],
},
```

### 敌人行动

敌人的行动用一张有序规则表描述：从上到下找到第一条满足条件的规则，使用它的技能。例如「每第 3 回合用蓄力重击，否则普通攻击」。首领的阶段也是数据：每个阶段有进入条件（体力低于多少）、进入时执行的效果和一张新的规则表。意图显示就是提前算出下一条会命中的规则，所以显示的意图一定和实际行动一致。

### 特例

极少数无法用基本结构组合出来的机制（例如某场秘传试炼的胜利条件），在 `game/combat/specials.ts` 里按 ID 注册一个函数，内容数据用 `{ op: "special", id }` 引用。每个特例都要有测试。出现第二个相似的特例时，把它改成正式的效果或条件。

## 5. 状态与存档

- `GameState` 保存学园和角色的全部可变数据。角色新增的字段见 [character-progression.md](../design/character-progression.md) 的「与现有系统的关系」。
- 出击中的任务保存在 `GameState.run`：任务 ID、地图（节点、连线、每个节点的随机种子）、当前位置、队伍的体力和倒下状态、跨战斗保留的状态（瘴气侵蚀）、道具、临时装备、已获得的经验和材料。
- 战斗状态只在内存中，进入节点时由 `run` 和节点种子创建，不写入存档。读档总是回到节点开始时，这和战斗设计里的存档规则一致。
- 面板属性等派生数值每次从状态和内容数据算出，不保存。
- `state.ts` 按版本号写迁移函数，读档时依次执行。
- 文字速度等界面设置继续放在 localStorage（现有的 `ui/settings.ts`）；「硬核存档」属于玩法选项，存在 `GameState.options` 里，每个存档单独记录。

## 6. 战斗模块

- `combat/` 对外只提供几个函数：开始战斗、列出当前可用的指令、执行一条指令、推进到下一个需要玩家输入的时刻。
- 每一步都返回事件列表：伤害、暴击、状态变化、联动、行动提前、倒下、阶段转换等。界面按顺序播放这些事件来做动画和伤害数字，而不是从状态前后的差异反推发生了什么。规则和演出因此互不影响，测试也可以直接断言「触发了导电」。
- 战斗不依赖界面，所以可以写一个数值模拟脚本（`npm run sim`）：用简单的出招策略批量跑任务，统计各任务等级的通关率，对照战斗设计里的难度基准。

## 7. 剧情

### 文件格式

剧情改为纯文本文件，放在 `src/content/scenes/<类型>/<id>.txt`。文件开头是若干行字段，用一行 `---` 隔开，后面是现有的剧本语法：

```
id: bond_yukikaze_4
title: 雪风 · 某个标题
kind: bond
char: yukikaze
level: 4
---
@bg rooftop
……
```

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一 ID，和文件名相同 |
| `title` | 回想和角色页显示的标题 |
| `kind` | `main` 主线、`recruit` 招募、`bond` 羁绊、`secret` 秘传、`fall` 堕落、`rescue` 营救、`event` 任务事件 |
| `char` | 角色剧情所属的角色 |
| `level` | 羁绊剧情的羁绊等级、堕落剧情的堕落等级 |
| `part` | 秘传剧情的前篇 `before` 或后篇 `after` |
| `rank` | 任务事件对应的任务等级 |

### 加载与触发

- 用 `import.meta.glob("../content/scenes/**/*.txt", { query: "?raw", import: "default", eager: true })` 把所有剧情读成字符串，启动时解析。新增剧情只需要加一个文件。
- 触发关系由文件字段决定：羁绊剧情按 `char` 和 `level` 出现在角色页；堕落剧情按 `char` 和 `level` 加入当天结束时的待播放列表；秘传剧情按 `char` 和 `part` 查找；任务事件按 `rank` 抽取。主线剧情的触发条件放在 `content/story-triggers.ts`。
- 缺少的剧情不阻止游戏运行：羁绊剧情不显示，堕落剧情只显示一句提示，任务事件从已有的里抽。这样剧情可以分批补写。
- 剧情的 `@effect` 和选项效果改为调用效果系统，在现有的资金、物资、声望、羁绊之外，增加体力、疲劳、道具和临时装备。
- 背景、CG 和立绘的 ID 以 `art/manifest.mjs` 为准，测试检查剧情引用的 ID 都存在，不再在 `story/script.ts` 里维护另一份列表。

### 编写流程

1. 按 [剧情清单 #1](https://github.com/odradekk/taimanin/issues/1) 确认要写的剧情和字段。
2. 新建文件，写字段和剧本。
3. 运行 `npm test`，检查语法、角色 ID、背景和 CG。
4. 游戏中自动出现，不需要改代码。

## 8. 界面

- 页面继续按 `ui/tabs/` 组织，只读取 store 里的状态和 registry 里的定义，数值通过 `game/` 的查询函数获得。
- 新增页面：角色养成（等级、位阶、秘传、秘术回路、淬炼）、天赋树、出击准备、任务地图、战斗。被俘和恢复期的状态显示在角色页。
- 图片路径仍由 `ui/assets.ts` 按 ID 拼出，新增敌人立绘目录 `public/assets/enemies/`。

## 9. 测试

| 测试 | 内容 |
| --- | --- |
| 规则测试 | 固定种子，覆盖各规则模块。战斗规则断言返回的事件列表 |
| 内容校验 | 所有 ID 引用都能找到；数值在合理范围内；每个角色的天赋树是三个分支、各 60 点；每个技能只有一种攻击类型 |
| 剧情解析 | 所有剧情文件都能解析；字段完整；引用的角色、背景、CG 都存在 |
| 数值模拟 | `npm run sim`，不放进 `npm test`，调整数值时手动运行 |

## 10. 新增内容需要改什么

| 新增 | 需要做的 |
| --- | --- |
| 角色 | `content/characters/` 加一个文件；`art/manifest.mjs` 加立绘和 CG；按剧情清单（[#1](https://github.com/odradekk/taimanin/issues/1)）加剧情文件 |
| 敌人 | `content/enemies/` 加定义；`art/manifest.mjs` 加立绘 |
| 任务 | `content/missions/` 加模板 |
| 技能、天赋、道具、临时装备、状态、特性 | 在对应的数据文件里用现有效果组合 |
| 剧情 | 加一个剧情文件 |
| 新机制（新的效果、触发时机或条件） | 在 `game/` 里加实现和测试。这是唯一需要改规则代码的情况 |

## 11. 迁移与实现顺序

| 现在 | 之后 |
| --- | --- |
| `src/game/data/*.ts` | `src/content/` |
| `src/game/rules.ts`（全部规则在一个文件） | 按领域拆成 `progression`、`academy`、`day`、`missions` 等模块 |
| `CharId` 等联合类型 | 字符串 ID 加内容校验测试 |
| 剧情写在 `story/scenes/*.ts` 的字符串里 | `content/scenes/` 下的文本文件 |
| `story/script.ts` 里的 `BACKGROUNDS`、`CGS` 列表 | 以 `art/manifest.mjs` 为准，由测试检查 |
| 剧情效果只支持资金、物资、声望、羁绊 | 统一使用效果系统 |

每一步完成后都能运行，并且现有测试保持通过：

1. 重组目录，不改行为：数据移到 `content/`，拆分 `rules.ts`，剧情移到文本文件，ID 改为字符串。
2. 效果系统和内容校验测试。
3. 养成系统：资质、位阶、秘传、秘术回路、淬炼、天赋、10 级羁绊、疲劳折算。
4. 战斗核心（含事件列表）和数值模拟脚本。
5. 战斗界面。
6. 任务地图和出击流程，替换现有的自动结算，加入派遣。
7. 俘获、营救、堕落和恢复，以及秘传、堕落、营救剧情的触发。
8. SS 级任务和硬核存档选项。
9. 敌人立绘和数值调整。
