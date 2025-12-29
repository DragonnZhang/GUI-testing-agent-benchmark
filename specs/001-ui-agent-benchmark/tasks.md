---

description: "Task list for implementing UI Testing Agent Benchmark"

---

# Tasks: UI Testing Agent 实验框架

**Input**: Design documents from `/specs/001-ui-agent-benchmark/`
**Prerequisites**: plan.md (required), spec.md (required)
**Tests**: 未在 spec 中要求 TDD，本任务列表不包含测试任务（可在后续加回）。

## Task Checklist Format (STRICT)

每条任务严格使用：

- [ ] `- [ ] T### [P?] [US?] 描述 + 文件路径`

说明：

- `[P]` = 可并行（不同文件/无依赖）
- `[US1]/[US2]/[US3]` = 仅用于用户故事阶段任务

---

## Phase 1: Setup（项目初始化）

**Purpose**: 初始化 TypeScript CLI 项目骨架与目录结构

- [x] T001 初始化 Node+TypeScript 项目脚手架（package.json, tsconfig.json）
- [x] T002 [P] 建立源码目录结构（src/cli, src/config, src/data, src/execution, src/evaluation, src/visualization, src/shared）
- [x] T003 [P] 建立数据与产物目录（data/ui-scenes/scenes.json, data/test-cases/test-case-config.json, runs/.gitkeep）
- [x] T004 [P] 配置基础开发体验：格式化/检查脚本（package.json scripts）
- [x] T005 [P] 添加最小 README 使用说明（README.md）

**Checkpoint**: `npm run build` 可以编译通过（即使还没有核心逻辑）。 ✅ PASSED

---

## Phase 2: Foundational（通用基础设施，阻塞所有 User Story）

**Purpose**: 统一输入/输出契约、配置加载、日志与产物写入、并发与超时、基础评估能力

- [x] T006 定义核心错误与类型工具（src/shared/errors.ts, src/shared/id.ts, src/shared/time.ts）
- [x] T007 [P] 定义配置与数据 schema（zod）（src/config/schema.ts）
- [x] T008 实现配置加载与校验（src/config/load.ts）
- [x] T009 [P] 定义 Agent 标准输入/输出类型（src/execution/agent/types.ts）
- [x] T010 定义 Agent 适配器抽象契约（src/execution/agent/adapter.ts）
- [x] T011 实现 Agent 注册/发现（内置 + 配置选择）（src/execution/agent/registry.ts）
- [x] T012 [P] 实现 UI 场景加载与路由展开（src/data/scenes.ts）
- [x] T013 [P] 实现测试用例加载与关联校验（用例→场景）（src/data/testCases.ts）
- [x] T014 实现运行日志（NDJSON）记录器（src/execution/logging/runLogger.ts）
- [x] T015 实现 run 产物写入与目录约定（runs/<runId>/...）（src/execution/logging/artifacts.ts）
- [ ] T016 实现并发控制与超时策略（src/execution/runner/timeouts.ts）
- [ ] T017 实现批量调度骨架（失败隔离、可重复顺序）（src/execution/runner/runEngine.ts）
- [ ] T018 [P] 实现用例级二分类判分（TP/FP/FN/TN）（src/evaluation/scoring/binaryScorer.ts）
- [ ] T019 [P] 实现指标计算（precision/recall/f1/miss rate）（src/evaluation/scoring/metrics.ts）
- [ ] T020 [P] 定义多 Agent 横向对比数据结构（src/evaluation/compare/multiAgentReport.ts）

**Checkpoint**: 可通过加载 `data/` 下的 JSON 并产出可序列化的“空跑”结果结构（不依赖 React 项目、不依赖真实 Agent）。 ✅ PASSED

---

## Phase 3: User Story 1 - 端到端批量基准测试（Priority: P1）🎯 MVP

**Goal**: 一条命令完成：加载场景/用例 → 启动/就绪检查（如需要）→ 调用 Agent → 评估 → 产物输出

**Independent Test**: 准备 1 个场景（可用 baseUrl 模式）、2 条用例、1 个 Dummy Agent；执行 `run` 后生成 runs 目录与 metrics.json。

### Implementation

- [x] T021 [P] [US1] 实现 CLI 入口与命令路由（src/cli/index.ts）
- [x] T022 [US1] 实现 `run` 命令参数（选择 agents、并发度、超时、输出目录）（src/cli/commands/run.ts）
- [x] T023 [P] [US1] 实现内置 Dummy/Noop Agent（固定输出，用于跑通链路）（src/execution/agent/builtins/dummyAgent.ts）
- [x] T024 [US1] 将内置 Agent 注册到 registry（src/execution/agent/registry.ts）
- [x] T025 [P] [US1] 实现端口分配与冲突检测（src/execution/appManager/portAllocator.ts）
- [x] T026 [US1] 实现 React dev server 生命周期管理（npm install / npm run dev / ready / stop）（src/execution/appManager/reactDevServer.ts）
- [x] T027 [US1] 在 run 流程中按 scene 配置启动/停止被测应用并生成 accessUrl（src/cli/commands/run.ts）
- [x] T028 [US1] 实现“单用例×单 Agent”执行与规范化输出（调用 adapter，保留 rawOutput）（src/execution/runner/runEngine.ts）
- [x] T029 [US1] 在 run 流程中写入基础产物（env.json, run-config.json, raw-results.json, normalized-results.json）（src/execution/logging/artifacts.ts）
- [x] T030 [US1] 在 run 流程中生成用例级判分与核心指标（score.json, metrics.json）（src/evaluation/scoring/binaryScorer.ts, src/evaluation/scoring/metrics.ts）
- [x] T031 [US1] 输出多 Agent 汇总结构（按 Agent 汇总+按用例明细）（src/evaluation/compare/multiAgentReport.ts）
- [x] T032 [P] [US1] 生成最小可视化报告（HTML）展示指标与用例列表（src/visualization/html/template.ts, src/visualization/html/render.ts）
- [x] T033 [US1] 将 report.html 写入 runs/<runId>/report.html（src/execution/logging/artifacts.ts）

**Checkpoint**: US1 完成后，`run` 一次即可得到 runs 目录全套产物，并可用 report.html 下钻查看用例级明细。 ✅ PASSED

---

## Phase 4: User Story 2 - 标准化接入新 Agent（Priority: P2）

**Goal**: 新增 Agent 不改用例、不改评估逻辑，只需实现适配器并注册即可参与跑分

**Independent Test**: 添加一个示例 Agent（例如读取本地 JSON/或调用外部进程），注册后可在同一批用例上被选择执行并进入 metrics.json。

### Implementation

- [x] T034 [P] [US2] 提供“新 Agent 适配器模板”文件（src/execution/agent/builtins/templateAgent.ts）
- [x] T035 [US2] 增强 registry：支持从配置声明 agent 列表与参数（src/execution/agent/registry.ts）
- [x] T036 [US2] 支持 agent 级超时/失败隔离策略（src/execution/runner/timeouts.ts, src/execution/runner/runEngine.ts）
- [x] T037 [P] [US2] 产出 Agent 运行元信息（name/version/config 摘要）写入 runs/<runId>/run-config.json（src/execution/logging/artifacts.ts）
- [x] T038 [US2] 增加 CLI `--agents` 选择与 `--list-agents` 列表输出（src/cli/commands/run.ts, src/execution/agent/registry.ts）
- [x] T039 [P] [US2] 编写接入文档（Agent 契约、示例、常见错误） （docs/agents.md）

**Checkpoint**: 新增一个 agent 文件并在配置中启用后，可直接进入对比报表，无需修改其它模块。 ✅ PASSED

---

## Phase 5: User Story 3 - 用例/场景扩展与结果复现（Priority: P3）

**Goal**: 可复现运行、可复用已有产物做二次评估/生成报告；用例与场景扩展无需改代码

**Independent Test**: 同一套输入重复运行两次，runs 产物包含可复现元数据；对已有 run 目录执行 `eval`/`report` 可重新生成 metrics/report。

### Implementation

- [x] T040 [P] [US3] 记录环境与版本元数据（node/os/git commit）到 runs/<runId>/env.json（src/execution/logging/artifacts.ts）
- [x] T041 [US3] 固化生效配置快照（展开后的 config）到 runs/<runId>/run-config.json（src/config/load.ts, src/execution/logging/artifacts.ts）
- [x] T042 [US3] 实现 `eval` 命令：读取 raw/normalized 产物重新计算 score/metrics（src/cli/commands/eval.ts, src/evaluation/scoring/*）
- [x] T043 [US3] 实现 `report` 命令：读取 metrics/score 重新生成 report.html（src/cli/commands/report.ts, src/visualization/html/render.ts）
- [x] T044 [US3] 定义并实现“语义裁判”可插拔接口（off/http），并将结果纳入 score.json（src/evaluation/scoring/detailJudge.ts）
- [x] T045 [US3] 实现 HTTP Judge 调用与请求/响应契约（src/evaluation/scoring/detailJudge.ts）
- [x] T046 [US3] 实现 Judge 结果缓存（按输入 hash）以提升复现性与降低成本（src/evaluation/scoring/detailJudge.ts, runs/<runId>/judge-cache.json）
- [x] T047 [US3] 将“原因一致率/细节命中率/unknown 占比”加入汇总指标（src/evaluation/scoring/metrics.ts, src/evaluation/compare/multiAgentReport.ts）
- [x] T048 [US3] 支持数据扩展：新增 scene/case 后无需改代码即可被加载（src/data/scenes.ts, src/data/testCases.ts）

**Checkpoint**: US3 完成后，任何指标数字都能追溯到用例与判分依据；并可对历史 run 目录重复生成评估与报告。 ✅ PASSED

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事的体验优化、文档与可复现验证

- [ ] T049 [P] 增加 quickstart（如何准备 React 项目、如何配置场景与用例、如何运行） （specs/001-ui-agent-benchmark/quickstart.md）
- [ ] T050 [P] 补充数据格式文档（scenes.json 与 test-case-config.json） （docs/data-format.md）
- [ ] T051 增强错误输出：校验错误/运行错误可读性与定位信息（src/shared/errors.ts, src/config/load.ts）
- [ ] T052 [P] 增强 report.html 下钻：展示 rawOutput 与 judge rationale（src/visualization/html/template.ts）
- [ ] T053 增加“失败用例重跑”能力（按 caseId 过滤执行）（src/cli/commands/run.ts）

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1（Setup）→ Phase 2（Foundational）→ User Stories（US1/US2/US3）→ Polish

### User Story Dependencies

- US1（P1）依赖 Foundational，交付 MVP
- US2（P2）依赖 Foundational，可在 US1 完成后或并行推进（但 registry/runner 的基础能力需已落地）
- US3（P3）依赖 US1 的 runs 产物格式（因此建议在 US1 稳定后推进）

### Completion Order Graph (Suggested)

```text
Setup → Foundational → US1
                 ├→ US2
                 └→ US3 → Polish
```

---

## Parallel Execution Examples

### US1

- [P] 可并行：T021（CLI 入口）与 T023（Dummy Agent）与 T025（端口分配）与 T032（HTML 报告模板）
- 串行关键路径：T022 → T027 → T028 → T029 → T030 → T033

### US2

- [P] 可并行：T034（模板 Agent）与 T039（接入文档）与 T037（元信息写入）
- 串行关键路径：T035 → T038

### US3

- [P] 可并行：T040（env 元数据）与 T043（report 命令）
- 串行关键路径：T042（eval）→ T044/T045/T046（judge）→ T047（指标汇总）
