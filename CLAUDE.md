# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UI Agent Benchmark 是一个用于评测 UI 测试 Agent 的标准化实验框架。它提供统一的 Agent 接口、批量执行测试、自动化评分（二分类 TP/FP/FN/TN）以及可视化报告生成。

## Build and Development Commands

### Development
```bash
pnpm install               # 安装依赖
pnpm build                 # TypeScript 编译到 dist/
pnpm dev                   # TypeScript watch 模式
pnpm typecheck            # 类型检查
pnpm lint                 # ESLint 检查
pnpm lint:fix             # ESLint 自动修复
pnpm format               # Prettier 格式化
pnpm format:check         # 检查格式化
pnpm check                # 运行所有检查（lint + format + typecheck）
```

### Runtime
```bash
pnpm uibench run --list-agents              # 查看可用 Agent
pnpm uibench run -a dummy,noop              # 运行测试（指定 Agent）
pnpm uibench run -a midscene --filter-cases TC_001  # 运行特定用例
pnpm uibench eval runs/<runId>              # 重新评估已有结果
pnpm uibench report runs/<runId>            # 重新生成报告
```

### Environment Setup
- 复制 `.env.example` 为 `.env` 并配置 Midscene AI 模型参数（如果使用 midscene agent）
- Node.js >= 20 是必需的

## Architecture

### 4-Layer Architecture
```
Data Layer (data/, src/config/)
  ↓
Execution Layer (src/execution/)
  ↓
Evaluation Layer (src/evaluation/)
  ↓
Visualization Layer (src/visualization/)
```

### Key Components

**Agent System (`src/execution/agent/`)**
- `AgentAdapter` - 抽象基类，所有 Agent 必须继承
- `agentRegistry` - Agent 注册表，运行时发现机制
- `builtins/` - 内置 Agent 实现（dummy, noop, midscene 等）

**React Dev Server Management (`src/execution/appManager/`)**
- `ReactDevServerManager` - 自动启动本地 React 项目
- `PortManager` - 动态端口分配，避免冲突
- 支持自动依赖安装和 dev server 启动

**Binary Scoring System (`src/evaluation/scoring/`)**
- 基于 `ground_truth.has_defect` 进行二分类判分
- 计算 TP/FP/FN/TN 并生成 Precision/Recall/F1 指标
- 支持多 Agent 对比排名

**Config & Schema (`src/config/`)**
- 使用 Zod 进行配置验证
- `Scene` - UI 场景定义（baseUrl 或 localProject）
- `TestCase` - 测试用例，包含 prompt 和 ground_truth
- `RunConfig` - CLI 选项配置

## Important Conventions

### TypeScript & ESM
- **所有 import 必须使用 `.js` 扩展名**：`import { x } from './foo.js'`（即使是 .ts 文件）
- 项目是 ESM-only，`"module": "NodeNext"` 配置
- 禁止 CommonJS，只使用 `import/export`

### Error Handling Pattern
使用 `src/shared/errors.ts` 中的类型化错误：
```typescript
throw new ConfigError(
  'Validation failed',
  { filePath, errors },           // context object
  'Check docs/data-format.md'     // actionable suggestion
);
```
错误类型：`ConfigError`, `DataLoadError`, `AgentExecutionError`, `TimeoutError`, `AppManagerError`

### Package Management
- 使用 **pnpm**，不是 npm 或 yarn
- 工作区配置在 `pnpm-workspace.yaml`

## Common Development Tasks

### Adding a New Agent
1. 在 `src/execution/agent/builtins/` 创建新文件
2. 继承 `AgentAdapter` 并实现 `runCase()` 方法
3. 在 `src/execution/agent/builtins/index.ts` 中注册

Example:
```typescript
export class MyAgent extends AgentAdapter {
  readonly meta: AgentMeta = { name: 'my-agent', version: '1.0.0' };

  async runCase(ctx: AgentContext): Promise<AgentResult> {
    // ctx.accessUrl - 目标 URL
    // ctx.prompt - 测试指令
    return {
      hasDefect: boolean,
      defects: [],
      rawOutput: any,
      errors: []
    };
  }
}
```

### Adding UI Scenes
1. 在 `data/ui-scenes/` 创建项目目录
2. 在 `data/ui-scenes/scenes.json` 中配置 scene
3. 对于本地项目，使用 `localProject` 类型并指定 `devCommand`

### Modifying Test Cases
编辑 `data/test-cases/test-case-config.json`，确保每个用例有：
- `case_id` - 唯一标识
- `scene_id` - 关联的 UI 场景
- `prompt` - 测试指令
- `ground_truth.has_defect` - 期望结果（布尔值）

## File Structure Significance

- `src/cli/commands/` - CLI 命令实现（run.ts, eval.ts, report.ts）
- `src/config/schema.ts` - Zod 数据模型，修改需同步更新文档
- `src/execution/runner/runEngine.ts` - 批量执行引擎，处理并发和超时
- `src/evaluation/scoring/binaryScorer.ts` - 二分类判分核心逻辑
- `data/ui-scenes/` - UI 场景定义和本地测试项目
- `runs/<runId>/` - 每次运行的输出目录（报告、日志、结果）

## Output Files

每次运行在 `runs/<runId>/` 生成：
- `console.log` - 完整终端输出（避免截断）
- `report.html` - 可视化报告
- `metrics.json` - 性能指标汇总
- `score.json` - 详细判分结果
- `raw-results.json` - Agent 原始输出
- `normalized-results.json` - 标准化结果
- `events.ndjson` - 结构化事件日志

## Key Dependencies

- `@midscene/web` - AI 驱动的 UI 测试框架
- `zod` - 数据验证和类型安全
- `commander` - CLI 框架
- `puppeteer` - 浏览器自动化
- `execa` - 进程执行
- `get-port` - 动态端口分配
- `p-limit` - 并发控制