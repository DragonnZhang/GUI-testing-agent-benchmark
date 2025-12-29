# 快速开始指南

本文档帮助你快速上手 UI Testing Agent Benchmark 框架。

## 前置条件

- Node.js >= 20
- npm 或 pnpm
- Git（可选，用于版本追踪）

## 安装

```bash
# 克隆项目
git clone <repo-url>
cd ui-agent-benchmark

# 安装依赖
npm install

# 构建
npm run build
```

## 准备测试数据

### 1. 配置 UI 场景

编辑 `data/ui-scenes/scenes.json`：

```json
[
  {
    "scene_id": "SCENE_001",
    "name": "登录页面",
    "description": "用户登录功能",
    "source": {
      "type": "baseUrl",
      "baseUrl": "http://localhost:3000"
    },
    "routes": [
      { "path": "/login", "name": "登录页" }
    ]
  }
]
```

**场景来源类型**：

- `baseUrl`: 已运行的应用（提供 URL）
- `localProject`: 本地 React 项目（自动启动 dev server）

```json
{
  "type": "localProject",
  "projectPath": "./my-react-app",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "readyTimeout": 60000
}
```

### 2. 配置测试用例

编辑 `data/test-cases/test-case-config.json`：

```json
[
  {
    "case_id": "CASE_001",
    "ui_scene_id": "SCENE_001",
    "case_type": "显示缺陷",
    "case_category": "反例",
    "prompt": "检查登录表单是否有布局问题",
    "ground_truth": {
      "has_defect": true,
      "defect_details": ["登录按钮文字被截断"],
      "defect_level": "中等"
    }
  },
  {
    "case_id": "CASE_002",
    "ui_scene_id": "SCENE_001",
    "case_type": "显示缺陷",
    "case_category": "正例",
    "prompt": "检查登录页面整体布局",
    "ground_truth": {
      "has_defect": false,
      "defect_details": [],
      "defect_level": null
    }
  }
]
```

**字段说明**：

- `case_category`: `正例`（无缺陷）或 `反例`（有缺陷）
- `ground_truth.has_defect`: 真实标签，用于计算指标
- `defect_details`: 具体缺陷描述（用于语义判定）
- `defect_level`: 严重程度（轻微/中等/严重）

## 运行测试

### 基本用法

```bash
# 使用默认配置运行
npx uibench run

# 指定 Agent
npx uibench run --agents dummy,noop

# 查看可用 Agent
npx uibench run --list-agents

# 指定场景和用例文件
npx uibench run --scenes data/my-scenes.json --cases data/my-cases.json

# 调整并发和超时
npx uibench run --concurrency 4 --timeout 60000
```

### 查看结果

运行完成后，在 `runs/<runId>/` 目录下查看：

- `report.html` - 可视化报告（在浏览器中打开）
- `metrics.json` - 指标汇总
- `score.json` - 用例级判分
- `raw-results.json` - 原始执行结果

### 重新评估

```bash
# 对已有结果重新计算指标
npx uibench eval runs/2024-01-01T12-00-00_abc123/

# 重新生成报告
npx uibench report runs/2024-01-01T12-00-00_abc123/
```

## 接入自定义 Agent

参见 [Agent 接入文档](../docs/agents.md)。

简要步骤：

1. 复制模板：`src/execution/agent/builtins/templateAgent.ts`
2. 实现 `runCase` 方法
3. 在 `src/execution/agent/builtins/index.ts` 中注册
4. 重新构建：`npm run build`

## 常见问题

### 1. 端口冲突

如果 localProject 场景启动失败：

```
Error: Dev server did not become ready within 60000ms
```

检查：

- 端口是否被占用
- 项目是否可以正常 `npm run dev`
- 增加 `readyTimeout`

### 2. 用例与场景不匹配

```
ConfigError: Test cases reference unknown scenes
```

确保用例的 `ui_scene_id` 在 scenes.json 中存在。

### 3. Agent 未找到

```
Error: Agent "xxx" not found
```

使用 `--list-agents` 查看可用 Agent，或检查注册代码。

## 下一步

- 阅读 [数据格式文档](../docs/data-format.md) 了解完整配置选项
- 阅读 [Agent 接入文档](../docs/agents.md) 接入你的 Agent
- 查看 `runs/` 目录下的报告，理解指标含义
