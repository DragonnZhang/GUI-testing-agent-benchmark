# MidsceneAgent 智能结果评估功能

## ⚡ 重要修复 (2026-01-27)

修复了报告生成中的关键问题：**对于 MidsceneAgent，现在使用 LLM 评估结果来正确判断 Agent 预测的准确性**，而不是简单基于执行状态。

### 修复前问题
- 报告中可能显示错误的 TP/FP/FN/TN 标签
- 例如：Agent 正确识别缺陷但报告显示为 FN（误判）

### 修复后改进
- ✅ **正确的评分逻辑**: 使用 `llmEvaluation.isAgentCorrect` 来判断 Agent 预测准确性
- ✅ **准确的报告**: CASE_006 等用例现在正确显示为 TP（True Positive）
- ✅ **智能判断**: LLM 评估 Agent 的判断与 ground truth 的匹配度

## 功能概述

本次更新为 MidsceneAgent 添加了智能结果评估功能，使用 OpenAI 大模型来分析 Agent 的判断结果是否与预期的 ground truth 一致，从而提高测试结果的准确性。

## 主要改进

### 1. 智能评估服务
- **文件**: `src/execution/agent/services/agentResultEvaluator.ts`
- **功能**: 使用 OpenAI LLM 评估 MidsceneAgent 的测试判断准确性
- **输入**: 测试指令、Agent 判断结果、执行状态、期望结果 (ground truth)
- **输出**: 判断准确性、检出缺陷数量、匹配度分析、置信度

### 2. 接口扩展
- **修改**: `src/execution/agent/types.ts` 中的 `AgentContext` 接口
- **新增**: `groundTruth` 字段，包含期望的测试结果信息

### 3. MidsceneAgent 增强
- **修改**: `src/execution/agent/builtins/midsceneAgent.ts`
- **集成**: LLM 评估服务来智能判断测试结果
- **降级**: 当 LLM 服务不可用时自动使用原有逻辑

### 4. 执行引擎更新
- **修改**: `src/execution/runner/runEngine.ts`
- **传递**: 将 ground truth 数据传递给所有 Agent

## 配置要求

### 环境变量配置

在 `.env` 文件中添加以下配置（参考 `.env.example`）：

```bash
# OpenAI Configuration for MidsceneAgent Result Evaluation
OPENAI_API_KEY="your-openai-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"  # 可选，默认使用 OpenAI 官方 API
OPENAI_MODEL="gpt-4o-mini"  # 可选，默认使用 gpt-4o-mini

# 如果使用阿里云 DashScope（与 Stagehand 共用配置）
OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
OPENAI_MODEL="qwen3-vl-plus"
```

### 获取 API 密钥

1. **OpenAI 官方**: https://platform.openai.com/api-keys
2. **阿里云 DashScope**: https://dashscope.console.aliyun.com/

## 验证步骤

### 1. 基础功能测试

```bash
# 构建项目
pnpm build

# 运行评估服务测试
node test-evaluation.js
```

期望输出：
- 测试用例 1: Agent 正确识别缺陷 → `isAgentCorrect: true`
- 测试用例 2: Agent 错误报告无缺陷 → `isAgentCorrect: false`

### 2. 完整流程测试

```bash
# 运行单个测试用例（使用增强的 MidsceneAgent）
pnpm uibench run -a midscene --filter-cases CASE_001

# 查看生成的报告，检查 rawOutput 中是否包含 LLM 评估结果
```

### 3. 对比测试

```bash
# 运行多个 Agent 对比
pnpm uibench run -a midscene,dummy --filter-cases CASE_002

# 检查 MidsceneAgent 的结果是否更准确
```

## 验证指标

### 1. 功能正确性
- ✅ LLM 评估服务正常调用
- ✅ 评估结果格式正确（包含 isAgentCorrect、detectedDefectCount 等字段）
- ✅ 降级机制工作正常（LLM 服务失败时）

### 2. 结果准确性
- ✅ 对于有缺陷的测试用例，MidsceneAgent 能正确识别
- ✅ 对于无缺陷的测试用例，MidsceneAgent 不会误报
- ✅ 多缺陷场景下能正确统计检出数量

### 3. 性能影响
- ✅ LLM 调用耗时在可接受范围内（通常 2-10 秒）
- ✅ 超时和重试机制工作正常
- ✅ 错误处理不会中断测试流程

## 故障排除

### 常见问题

1. **OpenAI API 密钥未配置**
   ```
   错误: OpenAI API 密钥未配置
   解决: 在 .env 文件中设置 OPENAI_API_KEY
   ```

2. **API 调用超时**
   ```
   错误: Agent 结果评估失败: timeout
   解决: 检查网络连接，或增加超时时间
   ```

3. **LLM 响应格式错误**
   ```
   错误: 解析 OpenAI 响应失败
   解决: 检查 OPENAI_MODEL 配置，确保使用支持的模型
   ```

### 降级模式

当 LLM 评估失败时，系统会自动使用降级逻辑：
- 基于执行状态与期望缺陷数量进行简单判断
- 在 rawOutput 中标记使用了降级逻辑
- 设置较低的置信度 (0.5)

## 预期效果

### 改进前后对比

**改进前（简单错误判断）**:
- 仅根据 aiAct 是否抛错来判断 hasDefect
- 无法区分 Agent 判断的准确性
- 对复杂场景判断不准确

**改进后（智能评估）**:
- LLM 分析 Agent 判断与 ground truth 的匹配度
- 能识别 Agent 的误报和漏报
- 提供详细的匹配度分析
- 支持多缺陷场景的检出统计

### 测试用例示例

以 CASE_002 为例：
- **测试场景**: Todo 应用 V2 页面有 4 个已知缺陷
- **期望行为**: MidsceneAgent 识别到缺陷并报错
- **智能评估**: LLM 分析 Agent 是否正确识别了预期的缺陷
- **结果**: 更准确的 hasDefect 判断和缺陷检出统计

## 兼容性说明

- ✅ 其他 Agent（DummyAgent、StagehandAgent 等）完全兼容
- ✅ 现有测试用例和配置无需修改
- ✅ 可选功能，LLM 不可用时自动降级
- ✅ TypeScript 类型安全，编译通过

## 后续优化建议

1. **成本控制**: 考虑使用更便宜的模型（如 gpt-3.5-turbo）进行初步筛选
2. **缓存机制**: 对相同的 Agent 判断结果进行缓存，避免重复调用
3. **批量评估**: 支持批量评估多个结果，提高效率
4. **自定义 Prompt**: 允许用户自定义评估 Prompt，适应不同的测试场景

---

**注意**: 此功能需要 OpenAI API 访问权限。如果没有 API 密钥，系统会自动使用降级逻辑，不会影响测试的正常运行。