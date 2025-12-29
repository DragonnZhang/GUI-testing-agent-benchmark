# Agent 接入文档

本文档说明如何在 UI Testing Agent Benchmark 框架中接入新的测试 Agent。

## 概述

接入新 Agent 非常简单，只需：

1. 创建一个继承 `AgentAdapter` 的类
2. 实现 `runCase` 方法
3. 在 registry 中注册

完成后，新 Agent 即可参与批量测试并进入对比报表。

## Agent 接口契约

### AgentAdapter 抽象类

```typescript
abstract class AgentAdapter {
  // 必须定义的元信息
  abstract readonly meta: AgentMeta;

  // 必须实现：执行单条测试用例
  abstract runCase(ctx: AgentContext): Promise<AgentResult>;

  // 可选：初始化（run 开始前调用一次）
  async initialize?(): Promise<void>;

  // 可选：清理资源（run 结束后调用一次）
  async cleanup?(): Promise<void>;
}
```

### AgentMeta 元信息

```typescript
interface AgentMeta {
  name: string;           // Agent 唯一标识符（CLI 中使用）
  version: string;        // 版本号
  description?: string;   // 描述
  supportedDefectTypes?: ('display' | 'interaction' | 'other')[];
}
```

### AgentContext 输入

```typescript
interface AgentContext {
  accessUrl: string;      // 目标页面 URL
  prompt: string;         // 测试指令/提示词
  meta: {
    caseId: string;       // 测试用例 ID
    sceneId: string;      // 场景 ID
    runId: string;        // 本次运行 ID
    timeoutMs: number;    // 超时时间（毫秒）
  };
}
```

### AgentResult 输出

```typescript
interface AgentResult {
  hasDefect: boolean;           // 是否检测到缺陷
  defects: DetectedDefect[];    // 缺陷列表
  confidence?: number;          // 置信度 0~1
  rawOutput: unknown;           // 原始输出（保留完整信息）
  errors: Array<{               // 执行错误（非致命）
    message: string;
    stack?: string;
  }>;
}

interface DetectedDefect {
  type?: 'display' | 'interaction' | 'other';
  description: string;
  severity?: string;
  evidence?: string;
}
```

## 快速开始

### 1. 复制模板

```bash
cp src/execution/agent/builtins/templateAgent.ts src/execution/agent/builtins/myAgent.ts
```

### 2. 修改实现

```typescript
import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult } from '../types.js';

export class MyAgent extends AgentAdapter {
  readonly meta: AgentMeta = {
    name: 'my-agent',
    version: '1.0.0',
    description: '我的自定义 Agent',
  };

  async runCase(ctx: AgentContext): Promise<AgentResult> {
    // 实现你的检测逻辑
    // 例如：调用 API、运行 Playwright、使用 LLM 等

    const response = await fetch('https://your-api.com/analyze', {
      method: 'POST',
      body: JSON.stringify({ url: ctx.accessUrl }),
    });
    const data = await response.json();

    return {
      hasDefect: data.hasIssue,
      defects: data.issues.map(i => ({
        type: 'display',
        description: i.message,
      })),
      rawOutput: data,
      errors: [],
    };
  }
}

export const myAgent = new MyAgent();
```

### 3. 注册 Agent

在 `src/execution/agent/builtins/index.ts` 中添加：

```typescript
import { myAgent } from './myAgent.js';

export function registerBuiltinAgents(): void {
  // ... 其他 agent
  if (!agentRegistry.has('my-agent')) {
    agentRegistry.register(myAgent);
  }
}
```

### 4. 使用 Agent

```bash
# 查看可用 Agent
uibench run --list-agents

# 运行测试
uibench run --agents my-agent,dummy
```

## 高级用法

### 生命周期钩子

```typescript
export class MyAgent extends AgentAdapter {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    // 启动浏览器（整个 run 开始时调用一次）
    this.browser = await chromium.launch();
  }

  async runCase(ctx: AgentContext): Promise<AgentResult> {
    const page = await this.browser!.newPage();
    await page.goto(ctx.accessUrl);
    // ... 检测逻辑
    await page.close();
    return { ... };
  }

  async cleanup(): Promise<void> {
    // 关闭浏览器（整个 run 结束时调用一次）
    await this.browser?.close();
  }
}
```

### 超时处理

框架会自动对 `runCase` 应用超时控制。如果需要自行处理：

```typescript
async runCase(ctx: AgentContext): Promise<AgentResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ctx.meta.timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    // ...
  } finally {
    clearTimeout(timeout);
  }
}
```

### 错误处理

- 返回 `errors` 数组记录非致命错误（Agent 仍然返回结果）
- 抛出异常表示致命错误（框架会捕获并记录）

```typescript
async runCase(ctx: AgentContext): Promise<AgentResult> {
  const errors: Array<{ message: string }> = [];

  try {
    const primary = await primaryCheck(ctx.accessUrl);
  } catch (e) {
    errors.push({ message: `Primary check failed: ${e.message}` });
  }

  try {
    const backup = await backupCheck(ctx.accessUrl);
    return {
      hasDefect: backup.hasIssue,
      defects: backup.issues,
      rawOutput: backup,
      errors,  // 包含非致命错误
    };
  } catch (e) {
    // 致命错误：直接抛出
    throw new Error(`All checks failed: ${e.message}`);
  }
}
```

## 常见错误

### 1. Agent 名称重复

```
Error: Agent "xxx" is already registered
```

解决：确保每个 Agent 的 `meta.name` 是唯一的。

### 2. 超时

```
TimeoutError: Agent "xxx" timed out for case "yyy"
```

解决：

- 增加 `--timeout` 参数
- 优化 Agent 的检测逻辑
- 检查网络连接

### 3. 目标页面无法访问

确保：

- 目标 URL 可访问
- 如果使用 `localProject` 模式，检查 React 项目是否正常启动

## 调试技巧

1. 查看原始输出：`runs/<runId>/raw-results.json`
2. 查看日志：`runs/<runId>/events.ndjson`
3. 使用 Dummy Agent 验证流程：`--agents dummy`

## 示例 Agent

参考内置 Agent 实现：

- `dummyAgent.ts` - 基于关键词的简单 Agent
- `templateAgent.ts` - 完整的模板文件

---

如有问题，请提交 Issue 或查看 README.md 获取更多信息。
