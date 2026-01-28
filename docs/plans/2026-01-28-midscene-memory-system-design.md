# MidsceneAgent 记忆系统设计文档

## 项目概述

为 MidsceneAgent 设计一个智能记忆系统，通过学习历史测试错误来提升未来测试的准确性。系统采用三阶段设计：记忆形成、记忆演化、记忆检索，在测试执行前通过增强测试指令的方式提供避错指导。

## 系统架构

### 整体架构
```
记忆形成 → 记忆演化 → 记忆检索
    ↓         ↓         ↓
案例收集   抽象提炼   指令增强
```

### 核心特性
- **分层树结构**：策略层(L3) → 经验层(L2) → 案例层(L1)
- **错误类型分类**：按UI测试错误模式组织记忆树
- **混合演化机制**：规则驱动 + LLM 智能抽象
- **多层级检索**：精确匹配 + 语义匹配 + 场景匹配

## 数据结构设计

### 记忆树节点
```typescript
interface MemoryNode {
  id: string;
  type: 'strategy' | 'experience' | 'case';
  level: number; // 3=策略层, 2=经验层, 1=案例层
  errorType: string; // 错误类型分类
  content: {
    description: string;
    guidance: string; // 避错指导
    confidence: number; // 0-1, 可信度
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
    successRate: number;
  };
  children: string[];
  parent?: string;
}
```

### 案例节点结构
```typescript
interface CaseMemoryNode extends MemoryNode {
  type: 'case';
  level: 1;
  caseData: {
    testCase: {
      case_id: string;
      scene_id: string;
      prompt: string;
      ground_truth: GroundTruth;
    };
    agentJudgment: string;
    actualError: string;
    errorReason: string;
    avoidanceHint: string;
  };
}
```

## 第一阶段：记忆形成

### 错误类型分类体系
```typescript
enum ErrorType {
  // 状态判断类错误
  STATE_DETECTION_ERROR = "state_detection_error",
  ASYNC_TIMING_ERROR = "async_timing_error",

  // 元素识别类错误
  ELEMENT_LOCATING_ERROR = "element_locating_error",
  CONTENT_VALIDATION_ERROR = "content_validation_error",

  // 交互逻辑类错误
  INTERACTION_SEQUENCE_ERROR = "interaction_sequence_error",
  FORM_VALIDATION_ERROR = "form_validation_error",

  // 业务逻辑类错误
  BUSINESS_RULE_ERROR = "business_rule_error",
  EDGE_CASE_ERROR = "edge_case_error"
}
```

### 记忆形成流程
1. **错误检测**：通过 agentResultEvaluator 识别判断错误
2. **错误分析**：使用 LLM 深度分析错误原因和类型
3. **案例创建**：生成结构化的案例节点
4. **树结构插入**：将案例按错误类型插入记忆树
5. **演化触发检查**：判断是否需要触发上层抽象

### LLM 错误分析 Prompt
```typescript
private buildErrorAnalysisPrompt(testCase, agentJudgment, evaluation): string {
  return `你是UI测试错误分析专家。请分析以下测试错误：

## 测试信息
测试指令: ${testCase.prompt}
页面场景: ${testCase.ui_scene_id}
Agent判断: ${agentJudgment}
期望结果: ${JSON.stringify(testCase.ground_truth)}
评估结果: Agent判断${evaluation.isAgentCorrect ? '正确' : '错误'}

## 分析任务
请分析Agent为什么会做出错误判断，并提供避错指导。

输出JSON格式：
{
  "errorType": "具体的错误类型",
  "errorReason": "Agent犯错的根本原因分析",
  "specificError": "这次错误的具体表现",
  "avoidanceStrategy": "下次如何避免这类错误的具体建议",
  "confidence": 0.8
}`;
}
```

## 第二阶段：记忆演化

### 演化规则配置
```typescript
interface EvolutionRule {
  errorType: ErrorType;
  caseThreshold: number;      // 触发经验生成的案例数
  experienceThreshold: number; // 触发策略更新的经验数
  minConfidence: number;      // 最低置信度要求
  timeWindow: number;         // 时间窗口（天）
}
```

### 演化触发机制
- **经验层生成**：同类错误案例积累≥3个时，通过LLM提炼共同模式生成经验节点
- **策略层更新**：同类经验积累≥2个时，更新或创建更高层的策略指导
- **质量控制**：基于置信度和时间窗口过滤低质量记忆

### 抽象提炼流程
1. **模式识别**：识别多个案例的共同错误模式
2. **经验生成**：使用LLM提炼中层经验指导
3. **策略更新**：基于经验集合更新高层策略
4. **置信度计算**：基于历史成功率动态调整节点可信度

## 第三阶段：记忆检索

### 多层级检索策略
```typescript
async retrieveGuidance(ctx: AgentContext): Promise<MemoryGuidance> {
  // 1. 策略层检索（高抽象，通用性强）
  const strategies = await this.retrieveStrategies(ctx);

  // 2. 经验层检索（中抽象，领域相关）
  const experiences = await this.retrieveExperiences(ctx);

  // 3. 案例层检索（低抽象，高精确度）
  const cases = await this.retrieveCases(ctx);

  return { strategies, experiences, cases };
}
```

### 相似度匹配算法
- **精确匹配**：scene_id + route_path 完全匹配（权重1.0）
- **语义匹配**：基于prompt的embedding相似度（权重0.8）
- **场景匹配**：基于UI场景类型的匹配（权重0.6）

### 指令增强机制
```typescript
enhancePromptWithMemory(originalPrompt: string, guidance: MemoryGuidance): string {
  let enhanced = originalPrompt;

  if (guidance.strategies.length > 0) {
    enhanced += `\n\n【测试策略提醒】:\n${strategicHints}`;
  }

  if (guidance.experiences.length > 0) {
    enhanced += `\n\n【历史经验参考】:\n${experienceHints}`;
  }

  if (guidance.cases.length > 0) {
    enhanced += `\n\n【注意避免】:\n${caseWarnings}`;
  }

  return enhanced;
}
```

## 系统集成

### 在 MidsceneAgent 中的集成点
```typescript
async runCase(ctx: AgentContext): Promise<AgentResult> {
  // 1. 记忆检索 - 获取相关指导
  const memoryGuidance = await this.memoryService.retrieveGuidance(ctx);

  // 2. 指令增强 - 添加避错提示
  const enhancedPrompt = this.enhancePromptWithMemory(ctx.prompt, memoryGuidance);

  // 3. 执行测试 - 使用增强后的指令
  const result = await agent.aiAct(enhancedPrompt);

  // 4. 记忆形成 - 在评估后异步处理
  this.scheduleMemoryFormation(ctx, result, evaluation);

  return result;
}
```

### 存储架构
- **内存缓存**：热点记忆的快速访问
- **文件存储**：记忆树的持久化存储（JSON格式）
- **索引系统**：基于错误类型和语义的多维索引

### 性能优化
- **懒加载**：按需加载记忆节点
- **缓存策略**：LRU缓存热门记忆
- **并发控制**：记忆形成异步处理，不影响测试执行
- **定期清理**：移除过时和低效记忆

## 实现路径

### 第一阶段（MVP）
1. 实现基础的记忆形成和存储
2. 简单的案例层检索和指令增强
3. 基本的错误类型分类

### 第二阶段（增强）
1. 添加记忆演化机制
2. 实现多层级检索
3. 优化相似度匹配算法

### 第三阶段（完善）
1. 添加性能监控和效果评估
2. 实现自动化的记忆质量管理
3. 支持记忆导入导出和共享

## 预期效果

- **减少重复错误**：通过历史经验避免相同类型的判断错误
- **提升测试准确性**：特别是在复杂UI场景下的判断准确性
- **知识积累**：随着使用时间增长，系统测试能力持续改进
- **可解释性**：清晰的记忆来源和应用逻辑，便于调试和优化

## 风险控制

- **记忆质量管理**：基于成功率动态调整记忆权重
- **过度拟合防护**：限制特定场景记忆的过度应用
- **系统性能**：记忆检索时间控制在合理范围内
- **存储空间**：定期清理无效记忆，控制存储增长

---

**设计完成时间**: 2026-01-28
**设计目标**: 为 MidsceneAgent 提供智能记忆能力，通过学习历史错误提升测试准确性
**架构特点**: 三阶段设计，分层树结构，混合演化机制，多维度检索