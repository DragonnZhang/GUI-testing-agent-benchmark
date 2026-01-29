// src/execution/agent/services/memoryService/memoryFormation.ts - 记忆形成服务

import { randomUUID } from 'crypto';
import type {
  MemoryNode,
  MemoryFormationInput,
  MemoryContent,
  ErrorAnalysis,
  MemoryContext,
} from './types.js';
import { MemoryNodeType } from './types.js';
import { ErrorAnalyzer } from './errorAnalyzer.js';

/**
 * 记忆形成服务
 */
export class MemoryFormation {
  private errorAnalyzer: ErrorAnalyzer;

  constructor() {
    this.errorAnalyzer = new ErrorAnalyzer();
  }

  /**
   * 从Agent执行结果形成记忆
   */
  async formMemory(input: MemoryFormationInput): Promise<MemoryNode | null> {
    try {
      console.log('🧠 开始形成记忆...', {
        caseId: input.context.meta.caseId,
        sceneId: input.context.meta.sceneId,
        isAgentCorrect: input.evaluation.isAgentCorrect,
        hasDefect: input.context.groundTruth.has_defect,
      });

      // 只有在以下情况下才形成记忆：
      // 1. Agent判断错误（需要学习改进）
      // 2. 或者存在真实缺陷（无论Agent是否正确检测到，都有学习价值）
      const shouldFormMemory =
        !input.evaluation.isAgentCorrect || input.context.groundTruth.has_defect;

      if (!shouldFormMemory) {
        console.log('ℹ️ 无需形成记忆：Agent判断正确且无缺陷');
        return null;
      }

      // 分析错误
      const errorAnalysis = await this.errorAnalyzer.analyzeError(input);

      // 提取记忆上下文
      const memoryContext = this.errorAnalyzer.extractMemoryContext(input, errorAnalysis);

      // 创建记忆内容
      const memoryContent = this.createMemoryContent(input, errorAnalysis, memoryContext);

      // 构建记忆节点
      const memoryNode = this.buildCaseMemoryNode(
        memoryContent,
        memoryContext,
        input.evaluation.confidence
      );

      console.log('✅ 记忆形成成功', {
        nodeId: memoryNode.id,
        errorType: memoryNode.context.errorType,
        confidence: memoryNode.confidence,
      });

      return memoryNode;
    } catch (error) {
      console.error('❌ 记忆形成失败:', error);
      return null;
    }
  }

  /**
   * 创建记忆内容
   */
  private createMemoryContent(
    input: MemoryFormationInput,
    errorAnalysis: ErrorAnalysis,
    memoryContext: MemoryContext
  ): MemoryContent {
    const { context, evaluation } = input;

    // 确定错误场景描述
    let scenarioDesc = '';
    if (!evaluation.isAgentCorrect && context.groundTruth.has_defect) {
      // Agent应该发现缺陷但判断错误
      if (evaluation.detectedDefectCount < evaluation.expectedDefectCount) {
        scenarioDesc = 'Agent漏报缺陷';
      } else {
        scenarioDesc = 'Agent误报或判断逻辑错误';
      }
    } else if (!evaluation.isAgentCorrect && !context.groundTruth.has_defect) {
      scenarioDesc = 'Agent误报缺陷';
    } else if (evaluation.isAgentCorrect && context.groundTruth.has_defect) {
      scenarioDesc = 'Agent正确检测到缺陷';
    }

    // 构建标题
    const title = `${scenarioDesc} - ${context.meta.sceneId}`;

    // 构建描述
    const description = `
场景: ${context.meta.sceneId}
指令: ${context.prompt}
缺陷类型: ${errorAnalysis.errorType}
根本原因: ${errorAnalysis.rootCause}
错误模式: ${errorAnalysis.pattern}
Agent判断: ${evaluation.isAgentCorrect ? '正确' : '错误'}
实际缺陷数: ${evaluation.expectedDefectCount}
检测到的缺陷数: ${evaluation.detectedDefectCount}
    `.trim();

    // 构建指导内容
    const guidance = this.buildGuidanceContent(input, errorAnalysis, scenarioDesc);

    // 提取触发条件
    const triggers = this.extractTriggers(memoryContext, errorAnalysis);

    return {
      title,
      description,
      guidance,
      triggers,
      keywords: errorAnalysis.keywords,
    };
  }

  /**
   * 构建指导内容
   */
  private buildGuidanceContent(
    input: MemoryFormationInput,
    errorAnalysis: ErrorAnalysis,
    scenarioDesc: string
  ): string {
    const { context } = input;
    const sceneId = context.meta.sceneId;

    let guidance = `## ${scenarioDesc}情况预防指南

**场景类型**: ${sceneId}
**错误类型**: ${errorAnalysis.errorType.replace(/_/g, ' ')}

### 关键注意点
${errorAnalysis.guidance}

### 具体建议
`;

    // 根据错误类型提供具体指导
    switch (errorAnalysis.errorType) {
      case 'state_detection_error':
        guidance += `
- 仔细观察页面的当前状态和预期状态
- 检查页面是否完全加载完成
- 注意动态内容的状态变化
- 验证页面元素的可见性和可交互性`;
        break;

      case 'async_timing_error':
        guidance += `
- 确保给异步操作足够的等待时间
- 检查网络请求和数据加载状态
- 注意页面渲染的时序问题
- 验证动态内容是否已完全显示`;
        break;

      case 'element_locating_error':
        guidance += `
- 使用更精确的元素选择器
- 检查页面结构是否发生变化
- 确认目标元素确实存在于页面上
- 考虑元素可能的加载延迟`;
        break;

      case 'content_validation_error':
        guidance += `
- 仔细验证页面显示的文本内容
- 检查数据格式和数值的准确性
- 注意文本的完整性和格式
- 验证多语言或动态内容的正确性`;
        break;

      case 'interaction_sequence_error':
        guidance += `
- 检查操作步骤的正确顺序
- 确认每个交互操作都成功执行
- 验证页面响应和状态转换
- 注意操作之间的依赖关系`;
        break;

      case 'form_validation_error':
        guidance += `
- 仔细检查表单字段的验证规则
- 测试各种输入情况（有效/无效）
- 验证错误消息的显示
- 检查表单提交后的状态`;
        break;

      case 'business_rule_error':
        guidance += `
- 深入理解业务逻辑和规则
- 验证业务流程的每个步骤
- 检查权限和访问控制
- 确认业务规则的执行结果`;
        break;

      case 'edge_case_error':
        guidance += `
- 考虑特殊输入和边界条件
- 测试异常情况的处理
- 验证系统的容错机制
- 检查极端数据的处理`;
        break;

      default:
        guidance += `
- 仔细分析具体的错误原因
- 检查测试环境和数据
- 验证功能的各个方面
- 记录和分析错误模式`;
        break;
    }

    guidance += `

### 检查清单
- [ ] 页面加载完成
- [ ] 目标元素存在且可见
- [ ] 操作步骤正确执行
- [ ] 结果符合预期
- [ ] 无意外错误或异常

**记忆来源**: 案例 ${context.meta.caseId}
**分析置信度**: ${Math.round(errorAnalysis.confidence * 100)}%`;

    return guidance;
  }

  /**
   * 提取触发条件
   */
  private extractTriggers(context: MemoryContext, errorAnalysis: ErrorAnalysis): string[] {
    const triggers: string[] = [];

    // 基于场景ID
    if (context.sceneId) {
      triggers.push(`scene:${context.sceneId}`);
    }

    // 基于错误类型
    triggers.push(`error_type:${errorAnalysis.errorType}`);

    // 基于路由路径
    if (context.routePath) {
      triggers.push(`route:${context.routePath}`);
    }

    // 基于关键词
    errorAnalysis.keywords.forEach((keyword) => {
      triggers.push(`keyword:${keyword}`);
    });

    return triggers;
  }

  /**
   * 构建案例记忆节点
   */
  private buildCaseMemoryNode(
    content: MemoryContent,
    context: MemoryContext,
    evaluationConfidence: number
  ): MemoryNode {
    const now = new Date().toISOString();

    return {
      id: randomUUID(),
      type: MemoryNodeType.CASE,
      content,
      context,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      successCount: 0,
      confidence: Math.min(evaluationConfidence, 0.9), // 案例节点的最大置信度限制在0.9
      childrenIds: [],
      relatedCaseIds: [context.caseId],
    };
  }
}
