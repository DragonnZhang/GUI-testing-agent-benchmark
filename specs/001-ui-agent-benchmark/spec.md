# Feature Specification: UI Testing Agent 实验框架

**Feature Branch**: `001-ui-agent-benchmark`  
**Created**: 2025-12-29  
**Status**: Draft  
**Input**: 用户希望搭建一个可复现、可扩展的 UI Testing Agent 实验框架：统一接入不同 Agent，连接真实本地开发环境的前端项目进行交互测试，批量运行带 Ground Truth 的用例并量化对比准确率、召回率等指标。

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 端到端批量基准测试（Priority: P1）

作为实验人员，我可以选择一组被测 UI 场景与测试用例，并选择一个或多个 UI Testing Agent 进行批量执行；框架自动完成被测应用的启动/就绪检查/停止，并输出每个 Agent 的结构化结果、运行日志与对比指标。

**Why this priority**: 没有端到端可跑通的批量执行 + 统一输出，就无法开展任何有效对比实验。

**Independent Test**: 准备 1 个被测应用、2 条用例、1 个 Agent 适配器，运行一次批量执行后即可得到可核对的结果 JSON 与指标汇总。

**Acceptance Scenarios**:

1. **Given** 已配置至少 1 个 UI 场景与 1 个用例，**When** 选择 1 个 Agent 发起一次实验运行，**Then** 系统产出：每条用例的 Agent 输出、判分结果、耗时与失败原因（若失败）。
2. **Given** 选择多个 Agent 且用例数量 > 1，**When** 发起一次实验运行，**Then** 系统产出按 Agent 横向对比的汇总指标（准确率/召回率/F1/漏检率等）以及可追溯到用例级别的明细。

---

### User Story 2 - 标准化接入新 Agent（Priority: P2）

作为实验人员/开发者，我可以以一致的“输入 → 输出”契约接入新的 UI Testing Agent（不同实现、不同运行方式），并在不改动既有用例与评估逻辑的前提下参与同一套实验对比。

**Why this priority**: 实验框架的核心价值是“可扩展、可持续对比”，否则每接一个 Agent 都要重写流程与评估。

**Independent Test**: 增加一个最小化 Agent（例如固定输出），注册后即可在同一批用例上被调度执行并进入统一评估。

**Acceptance Scenarios**:

1. **Given** 已存在可运行的一套用例与评估流程，**When** 新增一个 Agent 适配器并注册，**Then** 新 Agent 可以被选择执行，且输出被转为统一的结构化结果供评估使用。
2. **Given** 新 Agent 在运行中发生超时/异常，**When** 执行实验，**Then** 系统将该用例标记为失败并记录原因，但不会影响同批次其他用例/其他 Agent 的执行与汇总输出。

---

### User Story 3 - 用例/场景扩展与结果复现（Priority: P3）

作为实验人员，我可以持续新增 UI 场景与带标注的测试用例（含 Ground Truth），并在不同时间、不同机器上复现实验，得到一致的判分规则与可比的指标。

**Why this priority**: Benchmark 需要可复现与可演进，否则无法形成稳定对比结论。

**Independent Test**: 在同一套环境下重复运行同一批次，应得到一致的判分输出；新增用例后可自动进入下一次实验并出现在报表中。

**Acceptance Scenarios**:

1. **Given** 已存在一次实验运行的完整产物（配置、用例、输出、判分），**When** 在相同版本输入下重复运行，**Then** 关键产出（用例集合、Agent 原始输出、判分、汇总指标）在可接受误差范围内一致，并能追溯差异来源。
2. **Given** 新增一个 UI 场景或一条用例，**When** 发起新一轮实验运行，**Then** 新增项被纳入执行范围并体现在明细与汇总中。

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- 被测应用启动失败、启动后不可访问、或就绪检测超时。
- 多个被测应用并行运行时端口/资源冲突导致部分场景不可用。
- Agent 输出为空、非结构化、或无法解析为统一格式。
- 单条用例执行超时、交互步骤卡死、或页面出现不可预期弹窗。
- Ground Truth 缺失/格式错误/与用例不一致。
- 同一用例存在多个缺陷点，Agent 输出只有“是否有缺陷”但无细节（或反之）。
- 评估匹配存在歧义：Agent 文本描述与标准答案措辞不同但语义一致。

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: 系统 MUST 支持定义“UI 场景库”，每个场景包含：场景 ID、被测应用来源（本地项目或已可访问的地址）、可访问入口（基础地址）与可测试的页面路由集合。
- **FR-002**: 系统 MUST 管理被测应用生命周期：启动、就绪检测、停止/清理；并在实验结束后释放占用资源，避免影响下一次运行。
- **FR-003**: 系统 MUST 支持在一次实验中使用同一被测应用下的多个页面路由作为不同测试目标（例如以不同路由作为不同 UI 场景或场景子项）。
- **FR-004**: 系统 MUST 支持多个被测应用并行运行（数量可配置），并为每个应用分配可用访问入口，保证并行批量测试。

- **FR-005**: 系统 MUST 支持定义“测试用例库”，每条用例至少包含：用例 ID、关联 UI 场景 ID、用例类别（正例/反例）、用例类型/标签、自然语言测试指令（prompt）、以及 Ground Truth（是否存在缺陷、缺陷细节、high程度等）。
- **FR-006**: 系统 MUST 对用例输入进行校验：字段完整性、引用关系（用例→场景）存在性、Ground Truth 结构合法性；校验失败时拒绝执行并给出可定位的错误信息。

- **FR-007**: 系统 MUST 提供“Agent 适配器契约”，使不同 Agent 能以统一方式被调用；契约至少包含：Agent 标识信息、能力声明（如支持的缺陷类型/输出粒度）、以及“执行单条用例”的标准入口。
- **FR-008**: 系统 MUST 为每次执行向 Agent 提供一致的最小输入集合：目标访问入口（可访问 URL）、用例 prompt、以及可选的上下文（如场景说明、已知限制）。
- **FR-009**: 系统 MUST 将 Agent 的输出规范化为统一结构，至少包含：是否存在缺陷、缺陷列表（每项含缺陷类型/描述/high程度/证据或定位信息）、以及置信度（若 Agent 提供）。

- **FR-010**: 系统 MUST 提供批量执行引擎，支持按配置串行或并行执行，并支持：超时控制、失败隔离（单用例/单 Agent 失败不影响整体）、以及可重复的执行顺序记录。
- **FR-011**: 系统 MUST 记录运行日志与产物：每条用例的输入、Agent 原始输出、规范化输出、执行耗时、错误堆栈/原因（若失败）、以及运行元数据（时间、版本标识、配置摘要）。

- **FR-012**: 系统 MUST 基于 Ground Truth 与规范化输出计算评估指标，至少包含：准确率（Precision）、召回率（Recall）、F1、漏检率（Miss Rate），并支持多 Agent 横向对比。
- **FR-013**: 系统 MUST 输出结果对比报表，至少支持：按 Agent 汇总、按用例明细、按缺陷类型分组统计。
- **FR-014**: 系统 MUST 提供可视化结果产物（图表或等价的可视化表示），并能从汇总指标下钻到用例明细与“Agent 判断 vs Ground Truth”的差异。

- **FR-015**: 系统 MUST 定义“判分匹配规则”，用于将 Agent 的缺陷输出与 Ground Truth 对齐计算 TP/FP/FN。
- **FR-016**: 系统 MUST 以“用例级二分类（是否存在缺陷）”作为主评估粒度，并据此计算 Precision/Recall/F1/漏检率等核心指标；当 Ground Truth 与 Agent 均判定“存在缺陷”时，系统 MUST 进一步对缺陷原因/缺陷细节做一致性判定，并输出“原因一致率/细节命中率”等辅助指标。
- **FR-017**: 系统 MUST 使用“语义一致性”作为缺陷原因/缺陷细节的匹配方式：当且仅当 Agent 输出的缺陷原因与 Ground Truth 的缺陷细节在语义上表达同一问题时，判定为“原因一致/细节命中”；系统 MUST 支持输出不确定/无法判定的状态并记录依据，以便人工抽检与复核。

### Non-Functional Requirements

- **NFR-001**: 系统 MUST 支持可复现运行：同一套输入与版本下可重复得到可比的输出与指标，并能定位导致差异的来源（配置/版本/执行失败）。
- **NFR-002**: 系统 MUST 具备可扩展性：新增 Agent、新增 UI 场景、新增用例不应要求改动既有数据结构与评估输出格式。
- **NFR-003**: 系统 MUST 提供可审计性：任何指标数字都能追溯到对应的用例与判分依据。

### Key Entities *(include if feature involves data)*

- **UI Scene**: 被测 UI 场景定义（场景 ID、访问入口、路由集合、启动/停止所需信息、可选说明）。
- **Test Case**: 测试用例（用例 ID、关联场景 ID、类别/标签、prompt、Ground Truth）。
- **Ground Truth**: 标准答案（是否有缺陷、缺陷项集合、high程度/分级、可选证据/说明）。
- **Agent**: 被评测的 UI Testing Agent（标识、版本、能力声明）。
- **Agent Adapter**: Agent 与框架之间的契约实现（负责接收标准输入、返回标准输出）。
- **Run (Experiment Run)**: 一次实验运行（输入配置、参与 Agent、用例集合、时间范围、产物引用）。
- **Case Result**: 单条用例在单个 Agent 下的执行结果（原始输出、规范化输出、判分结果、耗时、错误信息）。
- **Metrics Summary**: 指标汇总（按 Agent/按缺陷类型/按用例集合的统计结果）。

### Assumptions

- 被测应用在实验机上可被自动启动并通过本机网络访问（例如通过本地地址）。
- 用例与 Ground Truth 由人工或外部流程维护，框架负责加载、校验、执行与评估。
- Agent 可以在给定访问入口与 prompt 的条件下完成必要的页面交互与输出（若无法交互，应明确返回失败原因）。

### Out of Scope

- 不负责生成或自动修复被测应用的缺陷；只做检测、记录与评估。
- 不规定 Agent 的内部实现方式与推理策略（只规定输入输出契约）。

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 在单机环境下，实验人员可以对至少 3 个 Agent、至少 100 条用例完成一次批量运行，并生成可下载/可查看的汇总指标与用例明细。
- **SC-002**: 每条用例的执行产物具备可追溯链路：从汇总指标可定位到具体用例，并查看 Agent 原始输出、规范化输出与判分依据。
- **SC-003**: 同一套输入（相同用例、场景、Agent 版本与配置）重复运行 3 次，汇总指标差异为 0（或差异来源可被明确标注为“执行失败/超时导致用例缺失”）。
- **SC-004**: 新增一个 Agent 后，能够在不修改既有用例与评估规则的前提下，参与同一轮实验并进入对比报表。
