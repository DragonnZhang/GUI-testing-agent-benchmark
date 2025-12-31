# 数据格式文档

本文档详细说明 UI Testing Agent Benchmark 框架使用的数据格式。

## scenes.json - UI 场景配置

场景定义了被测 UI 应用的入口和路由。

### 完整 Schema

```typescript
interface Scene {
  scene_id: string;        // 场景唯一标识
  name: string;            // 场景名称
  description?: string;    // 场景描述
  source: SceneSource;     // 场景来源
  routes: Route[];         // 路由列表（至少 1 个）
}

// 场景来源：二选一
type SceneSource = BaseUrlSource | LocalProjectSource;

interface BaseUrlSource {
  type: 'baseUrl';
  baseUrl: string;         // 已运行应用的 URL
}

interface LocalProjectSource {
  type: 'localProject';
  projectPath: string;     // 项目路径（相对或绝对）
  devCommand?: string;     // 启动命令，默认 "npm run dev"
  installCommand?: string; // 安装命令，默认 "npm install"
  readyTimeout?: number;   // 就绪超时（毫秒），默认 60000
}

interface Route {
  path: string;            // 路由路径，如 "/login"
  name?: string;           // 路由名称
}
```

### 示例

**使用已运行的应用**：

```json
[
  {
    "scene_id": "SCENE_001",
    "name": "电商首页",
    "description": "电商网站首页展示",
    "source": {
      "type": "baseUrl",
      "baseUrl": "https://demo.example.com"
    },
    "routes": [
      { "path": "/", "name": "首页" },
      { "path": "/products", "name": "商品列表" },
      { "path": "/cart", "name": "购物车" }
    ]
  }
]
```

**使用本地 React 项目**：

```json
[
  {
    "scene_id": "SCENE_002",
    "name": "本地开发项目",
    "source": {
      "type": "localProject",
      "projectPath": "./my-app",
      "devCommand": "npm run dev",
      "readyTimeout": 1200000
    },
    "routes": [
      { "path": "/login" },
      { "path": "/dashboard" }
    ]
  }
]
```

---

## test-case-config.json - 测试用例配置

测试用例定义了具体的测试输入和预期输出（Ground Truth）。

### 完整 Schema

```typescript
interface TestCase {
  case_id: string;              // 用例唯一标识
  ui_scene_id: string;          // 关联的场景 ID
  case_type: string;            // 用例类型（自定义分类）
  case_category: '正例' | '反例'; // 正例=无缺陷，反例=有缺陷
  prompt: string;               // 测试指令/提示词
  ground_truth: GroundTruth;    // 真实标签
}

interface GroundTruth {
  has_defect: boolean;                          // 是否有缺陷
  defect_details: string[];                     // 缺陷详情列表
  defect_level?: 'low' | 'medium' | 'high' | null; // high程度
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `case_id` | string | ✅ | 用例唯一标识，建议格式 `CASE_001` |
| `ui_scene_id` | string | ✅ | 关联的场景 ID，必须在 scenes.json 中存在 |
| `case_type` | string | ✅ | 用例类型，如 "显示缺陷"、"交互缺陷" |
| `case_category` | enum | ✅ | `正例`（期望无缺陷）或 `反例`（期望有缺陷） |
| `prompt` | string | ✅ | 发送给 Agent 的测试指令 |
| `ground_truth.has_defect` | boolean | ✅ | 真实标签，用于计算 TP/FP/FN/TN |
| `ground_truth.defect_details` | string[] | ✅ | 具体缺陷描述（空数组表示无缺陷） |
| `ground_truth.defect_level` | enum | ❌ | 缺陷high程度 |

### 示例

```json
[
  {
    "case_id": "CASE_001",
    "ui_scene_id": "SCENE_001",
    "case_type": "显示缺陷",
    "case_category": "反例",
    "prompt": "检查登录按钮的显示是否正常，特别关注文字是否完整显示",
    "ground_truth": {
      "has_defect": true,
      "defect_details": [
        "登录按钮文字 '立即登录' 被截断为 '立即...'",
        "按钮右侧边距不足"
      ],
      "defect_level": "medium"
    }
  },
  {
    "case_id": "CASE_002",
    "ui_scene_id": "SCENE_001",
    "case_type": "交互缺陷",
    "case_category": "正例",
    "prompt": "测试登录表单的输入功能是否正常",
    "ground_truth": {
      "has_defect": false,
      "defect_details": [],
      "defect_level": null
    }
  }
]
```

---

## 产物文件格式

运行完成后，在 `runs/<runId>/` 目录下生成以下文件：

### env.json

环境和版本信息，用于结果复现。

```json
{
  "nodeVersion": "v20.10.0",
  "platform": "darwin",
  "arch": "arm64",
  "hostname": "my-mac",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "gitCommit": "abc123def456..."
}
```

### run-config.json

运行配置快照。

```json
{
  "scenesPath": "data/ui-scenes/scenes.json",
  "casesPath": "data/test-cases/test-case-config.json",
  "outputDir": "runs",
  "agents": [
    { "name": "dummy", "version": "1.0.0", "description": "..." }
  ],
  "concurrency": 2,
  "timeout": 1200000,
  "startedAt": "2024-01-01T12:00:00.000Z"
}
```

### score.json

用例级判分结果。

```json
[
  {
    "caseId": "CASE_001",
    "sceneId": "SCENE_001",
    "agentName": "dummy",
    "groundTruthHasDefect": true,
    "predictedHasDefect": true,
    "label": "TP",
    "executionSuccess": true
  }
]
```

**label 取值**：

- `TP`: True Positive（真阳性）- 正确检测到缺陷
- `TN`: True Negative（真阴性）- 正确判断无缺陷
- `FP`: False Positive（假阳性）- 误报
- `FN`: False Negative（假阴性）- 漏检
- `ERROR`: 执行错误

### metrics.json

指标汇总。

```json
{
  "runId": "2024-01-01T12-00-00_abc123",
  "totalCases": 10,
  "totalAgents": 2,
  "byAgent": [
    {
      "agentName": "dummy",
      "total": 10,
      "counts": { "TP": 4, "TN": 3, "FP": 1, "FN": 2, "ERROR": 0 },
      "precision": 0.8,
      "recall": 0.6667,
      "f1": 0.7273,
      "missRate": 0.3333,
      "accuracy": 0.7,
      "errorRate": 0
    }
  ],
  "generatedAt": "2024-01-01T12:05:00.000Z"
}
```

---

## 最佳实践

1. **用例 ID 规范**：使用 `CASE_001`、`CASE_002` 格式，便于排序和追踪

2. **场景复用**：多个用例可以共享同一个场景

3. **Prompt 设计**：
   - 明确指出检查目标
   - 提供足够的上下文
   - 避免歧义

4. **Ground Truth 质量**：
   - `has_defect` 必须准确
   - `defect_details` 尽可能具体
   - 用于语义一致性判定

5. **版本控制**：将 scenes.json 和 test-case-config.json 纳入 Git 管理
