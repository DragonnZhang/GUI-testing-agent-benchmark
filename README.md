# UI Agent Benchmark

> UI Testing Agent 实验框架：标准化接入、批量评测、量化对比

## 特性

- 🔌 **标准化 Agent 接口** - 统一的 `AgentAdapter` 抽象，轻松接入新 Agent
- 📊 **自动化评测** - 二分类判分（TP/FP/FN/TN）、Precision/Recall/F1 指标
- 🖥️ **Dev Server 管理** - 自动启动本地 React 项目，动态端口分配
- 📈 **可视化报告** - 生成 HTML 报告，支持 Agent 对比排名

## 快速开始

```bash
# 安装依赖
npm install

# 编译
npm run build

# 查看可用 Agent
npx uibench run --list-agents

# 运行测试
npx uibench run -a dummy,noop

# 查看运行结果
open runs/<runId>/report.html

# 查看控制台日志（避免终端截断）
cat runs/<runId>/console.log
```

## 输出文件说明

每次运行会在 `runs/<runId>/` 目录下生成以下文件：

- **console.log** - 终端输出完整日志（新增）
- **events.ndjson** - 结构化事件日志（NDJSON 格式）
- **report.html** - HTML 可视化报告
- **metrics.json** - 性能指标汇总
- **score.json** - 详细判分结果
- **raw-results.json** - Agent 原始输出
- **normalized-results.json** - 标准化结果
- **run-config.json** - 运行配置
- **env.json** - 环境信息

## CLI 命令

```bash
# 运行测试
npx uibench run [options]
  -s, --scenes <path>      场景配置文件 (默认: data/ui-scenes/scenes.json)
  -c, --cases <path>       用例配置文件 (默认: data/test-cases/test-case-config.json)
  -a, --agents <names>     Agent 列表，逗号分隔 (默认: dummy)
  -o, --output <dir>       输出目录 (默认: runs)
  -p, --concurrency <n>    并发数 (默认: 1)
  -t, --timeout <ms>       单用例超时 (默认: 1200000)
  --filter-cases <ids>     仅运行指定用例（用于重试）
  --list-agents            列出可用 Agent

# 重新评估已有结果
npx uibench eval <runDir>

# 重新生成报告
npx uibench report <runDir>
```

> **备注**: 也可以使用 `npm run start -- <command>` 代替 `npx uibench`

## 目录结构

```
src/
├── cli/              # CLI 入口与命令
├── config/           # Zod Schema 与配置加载
├── execution/
│   ├── agent/        # Agent 适配器与注册表
│   ├── appManager/   # React Dev Server 管理
│   └── runner/       # 批量执行引擎
├── evaluation/       # 判分与指标计算
└── visualization/    # HTML 报告生成

data/                 # 输入数据（场景/用例）
runs/                 # 运行产物（每次 run 一个子目录）
docs/                 # 文档（Agent 接入、数据格式）
```

## 接入新 Agent

1. 创建 Agent 类继承 `AgentAdapter`
2. 实现 `runCase(ctx: AgentContext): Promise<AgentResult>`
3. 在 `src/execution/agent/builtins/index.ts` 注册

详见 [docs/agents.md](docs/agents.md)

## 数据格式

- **scenes.json** - UI 场景定义（baseUrl 或 localProject）
- **test-case-config.json** - 测试用例与 Ground Truth

详见 [docs/data-format.md](docs/data-format.md)

## 开发

```bash
npm run dev          # watch 模式编译
npm run typecheck    # 类型检查
npm run lint         # ESLint
npm run format       # Prettier 格式化
```

## 环境要求

- Node.js >= 20
- TypeScript 5.x

## License

MIT
