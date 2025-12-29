# Implementation Plan: UI Testing Agent 实验框架

**Branch**: `001-ui-agent-benchmark` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from [specs/001-ui-agent-benchmark/spec.md](./spec.md)

## Summary

实现一个基于 TypeScript 的“UI Testing Agent Benchmark”框架：

- **数据层**：管理 UI 场景（真实 React 项目 dev 环境）与带 Ground Truth 的测试用例。
- **执行层**：统一调度多个 Agent（通过适配器接入），自动启动/停止被测 React 项目，批量运行用例并记录全量日志与产物。
- **评估层**：以“用例是否有缺陷”为主指标计算 Precision/Recall/F1/漏检率；当双方都判定有缺陷时，用可插拔的“语义裁判（LLM Judge）”计算缺陷原因/细节一致性作为辅助指标。
- **可视化层**：输出可下钻的 HTML 报告 + 机器可读 JSON，支持多 Agent 横向对比。

目标是先交付 **可跑通、可复现、可扩展** 的 MVP：1 个 React 场景 + 2 条用例 + 1~2 个 Agent 适配器（含一个 Dummy/Noop Agent），一条命令完成端到端跑分与报表产出。

## Technical Context

**Language/Version**: TypeScript (TS 5.x) + Node.js (>= 20)  
**Primary Dependencies**:

- CLI: `commander`（或 `yargs`，二选一）
- Process: `execa`（管理 `npm install` / `npm run dev`）
- Validation: `zod`（校验 scenes/cases/config）
- Logging: `pino`（结构化日志）
- Concurrency: `p-limit`（并发控制）
- HTTP/Ready checks: Node `fetch` + 可选 `get-port`/`portfinder`
- Report: 纯静态 `report.html`（内嵌 `chart.js` 或最小化自绘图表）

**Storage**: 文件系统（输入 JSON；输出 JSON/NDJSON + HTML），不引入数据库  
**Testing**: `vitest`（单元测试）+ 可选最小集成测试（启动一个简单 http server / 或 mock）  
**Target Platform**: macOS/Linux/Windows（本地运行），默认 localhost 访问  
**Project Type**: Single Node.js CLI project（仓库根目录）  
**Performance Goals**: 100+ 用例 * 3 Agent 可在合理时间内完成（并发可配置）  
**Constraints**:

- 被测 React 项目通过本机 dev server 提供服务（无快照）
- 需要可靠的进程清理，避免端口占用
- LLM Judge 可能带来成本/时延：必须可缓存与可关闭

## Constitution Check

仓库的 `.specify/memory/constitution.md` 目前是占位模板；本 feature 定义最小“质量门禁”以保证可扩展与可复现：

- **Gate A（CLI 可用）**：所有核心能力必须可通过 CLI 驱动（批量执行/评估/报告生成）。
- **Gate B（结构化产物）**：每次 run 必须输出可机器读取的结果 JSON（含原始输出与判分）。
- **Gate C（可复现）**：run 产物必须记录：输入摘要、Agent 版本、场景版本（如可得）、框架 git commit、时间戳与配置。
- **Gate D（失败隔离）**：单用例/单 Agent 失败不影响同批次其它执行。

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-agent-benchmark/
├── spec.md
├── plan.md
├── checklists/
│   └── requirements.md
└── (later)
    ├── contracts/
    ├── data-model.md
    ├── research.md
    └── quickstart.md
```

### Source Code (repository root)

```text
src/
├── cli/
│   ├── index.ts                 # CLI 入口
│   └── commands/
│       ├── run.ts               # 批量执行：启动场景→跑用例→评估→产物
│       ├── eval.ts              # 仅评估（复用已有 run 产物）
│       └── report.ts            # 仅生成报告（复用评估结果）
├── config/
│   ├── schema.ts                # zod schemas
│   └── load.ts                  # 加载/校验配置文件
├── data/
│   ├── scenes.ts                # UI 场景库加载与模型
│   └── testCases.ts             # 测试用例加载与模型
├── execution/
│   ├── appManager/
│   │   ├── reactDevServer.ts    # npm install / npm run dev / ready / stop
│   │   └── portAllocator.ts     # 端口分配/冲突避免
│   ├── agent/
│   │   ├── types.ts             # Agent 输入输出统一契约
│   │   ├── adapter.ts           # 抽象类/接口
│   │   └── registry.ts          # agent 注册与发现
│   ├── runner/
│   │   ├── runEngine.ts         # 串行/并发调度、超时、失败隔离
│   │   └── timeouts.ts
│   └── logging/
│       ├── runLogger.ts         # 结构化日志与 NDJSON
│       └── artifacts.ts         # run 产物写入（results.json 等）
├── evaluation/
│   ├── scoring/
│   │   ├── binaryScorer.ts      # 用例级 TP/FP/FN
│   │   ├── detailJudge.ts       # 缺陷细节语义一致性（可插拔）
│   │   └── metrics.ts           # precision/recall/f1/miss rate
│   └── compare/
│       └── multiAgentReport.ts  # 多 agent 横向对比结构
├── visualization/
│   ├── html/
│   │   ├── template.ts          # report.html 模板
│   │   └── render.ts
│   └── assets/
│       └── (optional)           # 内嵌/复制的静态资源
└── shared/
    ├── errors.ts
    ├── id.ts
    └── time.ts

data/
├── ui-scenes/
│   └── scenes.json
└── test-cases/
    └── test-case-config.json

runs/
└── 2025-12-29T21-xx-xxZ__.../
    ├── run-config.json          # 本次 run 的生效配置（展开后的）
    ├── env.json                 # node/os/git 信息
    ├── events.ndjson            # 过程日志（逐行 JSON）
    ├── raw-results.json         # 每用例/每 agent 原始输出
    ├── normalized-results.json  # 规范化输出
    ├── score.json               # 判分结果（TP/FP/FN + 细节一致性）
    ├── metrics.json             # 汇总指标
    └── report.html

tests/
├── unit/
│   ├── config.schema.test.ts
│   └── evaluation.metrics.test.ts
└── integration/
    └── appManager.reactDevServer.test.ts (optional)
```

**Structure Decision**: 选择“单项目 CLI 工具”结构，原因：

- 核心交付物是一个可运行的 benchmark runner（而不是服务端）；
- 便于在本地快速复现与迭代；
- 后续若需要 Web UI，可在此基础上再加 `frontend/` 或提供 `--serve`。

## Design Details (Key Interfaces & Flows)

### 1) 数据层（Scenes / Cases）

- `Scene`：定义一个可启动的 React 项目（或直接给定 baseUrl）及其路由集合。
- `TestCase`：绑定 `sceneId`，包含 prompt 与 groundTruth。
- 加载策略：
  - `data/ui-scenes/scenes.json`
  - `data/test-cases/test-case-config.json`
- 使用 `zod` 严格校验；校验失败直接阻止 run。

### 2) 执行层（React 项目生命周期）

- `ReactDevServerManager`：
  - `ensureInstalled()`：首次/按需执行 `npm install`（可通过 lockfile hash 缓存）
  - `start({port})`：`npm run dev -- --port <port> --host 127.0.0.1`
  - `waitUntilReady({url})`：轮询 `GET /` 或指定健康检查路由
  - `stop()`：终止进程组，释放端口
- 多项目并发：通过 `portAllocator` 分配端口；每个场景一个实例。

### 3) 执行层（Agent 适配器契约）

统一输入：

- `accessUrl`: string（例如 `http://localhost:5173/page/1`）
- `prompt`: string
- `meta`: { caseId, sceneId, tags, timeoutMs, runId }

统一输出（规范化结果）：

- `hasDefect`: boolean
- `defects`: Array<{ type?: 'display'|'interaction'|'other', description: string, severity?: string, evidence?: string }>
- `rawOutput`: unknown（原始 Agent 输出，完整保留）
- `errors`: Array<{ message: string, stack?: string }>（若失败）

接入方式：

- AgentAdapter 抽象类：`runCase(ctx): Promise<AgentResult>`
- Registry：通过配置选择 agent（支持本地内置 + 外部扩展）

### 4) 评估层（判分规则）

- **主判分**：用例级二分类
  - groundTruth.has_defect vs agent.hasDefect
  - 统计 TP/FP/FN/TN → precision/recall/f1/miss rate
- **细节一致性**：仅在 `groundTruth.has_defect === true && agent.hasDefect === true` 时触发
  - 采用“语义一致性裁判（LLM Judge）”比较 `agent.defects[].description` 与 `groundTruth.defect_details[]`
  - 输出：`detailMatch: { matched: boolean|'unknown', rationale, judgeModel, confidence }`
  - 必须支持：关闭裁判（只做二分类）、缓存裁判结果（按输入 hash）

### 5) 可视化层（报告产物）

- 机器可读：`metrics.json`、`score.json`、`normalized-results.json`
- 人可读：`report.html`
  - 展示：各 Agent 指标对比、按缺陷类型分组、用例下钻查看“GT vs Agent vs Judge 理由”

## Milestones

1. **M0（脚手架）**：初始化 TS 项目、CLI 雏形、配置加载/校验
2. **M1（最小跑通）**：单场景（baseUrl 模式不启动项目）+ Dummy Agent + 二分类评估 + 结果 JSON
3. **M2（React 生命周期）**：支持本地 React 项目 `npm install + npm run dev` 启停与就绪检查
4. **M3（多 Agent & 并发）**：多 Agent 横向对比、并发调度、失败隔离、全量日志
5. **M4（语义裁判）**：LLM Judge 插件化 + 缓存 + 细节一致性指标
6. **M5（报告）**：HTML 报告 + 下钻明细

## Risks & Mitigations

- **React dev server 启停不稳定/端口残留**：使用进程组 kill + 端口检测；run 结束强制清理。
- **LLM Judge 成本/波动**：提供 `--judge=off`，并对判题请求做缓存（hash key）；输出 `unknown` 状态。
- **Agent 输出不统一**：适配器层必须保留 rawOutput，同时做 best-effort 规范化；无法解析时标记失败但不中断全局。
- **跨平台差异**：所有 shell 命令通过 `execa`，避免依赖 bash 特性；路径处理用 Node API。

## Complexity Tracking

无需引入数据库/服务端；复杂度主要来自“多进程生命周期管理 + 并发 + 可追溯产物 + 语义裁判”。当前计划通过模块化与清晰的 run 产物格式控制复杂度。
