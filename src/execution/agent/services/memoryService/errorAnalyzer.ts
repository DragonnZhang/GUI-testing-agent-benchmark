// src/execution/agent/services/memoryService/errorAnalyzer.ts - 错误分析服务

import OpenAI from 'openai';
import type { ErrorAnalysis, MemoryFormationInput, MemoryContext } from './types.js';
import { ErrorType } from './types.js';
import 'dotenv/config';

/**
 * 错误分析服务
 */
export class ErrorAnalyzer {
  private openaiClient: OpenAI | null = null;

  /**
   * 获取 OpenAI 客户端
   */
  private getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API 密钥未配置。请在 .env 文件中设置 OPENAI_API_KEY。');
      }

      this.openaiClient = new OpenAI({
        apiKey,
        baseURL: process.env.OPENAI_BASE_URL,
      });
    }

    return this.openaiClient;
  }

  /**
   * 分析测试错误
   */
  async analyzeError(input: MemoryFormationInput): Promise<ErrorAnalysis> {
    try {
      // 只分析实际的错误情况
      if (!input.evaluation.isAgentCorrect || !input.context.groundTruth.has_defect) {
        throw new Error('只能分析Agent判断错误或存在真实缺陷的情况');
      }

      const client = this.getOpenAIClient();
      const prompt = this.buildAnalysisPrompt(input);

      console.log('🚀 ~ ErrorAnalyzer ~ analyzeError ~ prompt:', prompt);

      console.log('🔍 开始分析测试错误...');

      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '你是一个专业的UI测试错误分析专家。请深入分析Agent的测试错误，识别错误模式和根本原因。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI 返回空响应');
      }

      const analysis = this.parseAnalysisResponse(content);

      console.log('✅ 错误分析完成:', {
        errorType: analysis.errorType,
        confidence: analysis.confidence,
      });

      return analysis;
    } catch (error) {
      console.error('❌ 错误分析失败:', error);

      // 返回降级的分析结果
      return this.createFallbackAnalysis(input);
    }
  }

  /**
   * 构建错误分析 prompt
   */
  private buildAnalysisPrompt(input: MemoryFormationInput): string {
    const { context, result, evaluation } = input;

    return `你是一个UI测试错误分析专家。请分析以下测试错误，识别错误类型、根本原因和预防指导。

## 测试背景
**场景ID**: ${context.meta.sceneId}
**用例ID**: ${context.meta.caseId}
**测试URL**: ${context.accessUrl}

## 测试指令
${context.prompt}

## Agent执行结果
**是否检测到缺陷**: ${result.hasDefect ? '是' : '否'}
**Agent输出**: ${JSON.stringify(result.rawOutput, null, 2)}
**执行错误**: ${result.errors.map((e) => e.message).join('; ') || '无'}

## 期望结果
**应该检测到缺陷**: ${context.groundTruth.has_defect ? '是' : '否'}
**缺陷详情**: ${context.groundTruth.defect_details.join('; ') || '无'}
**缺陷级别**: ${context.groundTruth.defect_level || '无'}

## LLM评估结果
**Agent判断是否正确**: ${evaluation.isAgentCorrect ? '正确' : '错误'}
**评估分析**: ${evaluation.matchingAnalysis}
**置信度**: ${evaluation.confidence}

## 分析任务
请从以下几个维度深入分析这个错误：

1. **错误类型识别**：
   - state_detection_error: 状态检测错误（页面状态、元素状态判断错误）
   - async_timing_error: 异步时序错误（等待时间、加载状态处理）
   - element_locating_error: 元素定位错误（找不到元素、定位方式问题）
   - content_validation_error: 内容验证错误（文本、数据验证错误）
   - interaction_sequence_error: 交互序列错误（操作步骤、流程错误）
   - form_validation_error: 表单验证错误（输入验证、表单状态）
   - business_rule_error: 业务规则错误（业务逻辑理解错误）
   - edge_case_error: 边界情况错误（特殊场景处理不当）

2. **根本原因分析**：
   - 技术层面的问题（选择器、API调用等）
   - 理解层面的问题（需求理解、业务逻辑）
   - 时序层面的问题（等待策略、事件处理）

3. **错误模式描述**：
   - 描述这种错误的典型表现
   - 类似错误的共同特征

4. **预防指导**：
   - 针对这类错误的具体预防措施
   - 测试时应该注意的关键点
   - 改进的操作步骤或检查点

## 输出要求
请严格按照以下JSON格式返回结果：

{
  "errorType": "错误类型枚举值",
  "rootCause": "根本原因的详细分析，包括技术和理解层面的问题",
  "pattern": "错误模式的具体描述，说明这类错误的典型表现和特征",
  "guidance": "具体的预防指导，包括操作建议和检查要点，要求是字符串格式",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "confidence": 0.85
}

注意：
- errorType必须是上述8种类型之一
- rootCause要深入分析问题的根本原因
- pattern要描述错误的典型模式和特征
- guidance要给出具体可操作的预防建议
- keywords要提取3-5个关键词用于后续检索
- confidence是分析的置信度(0-1)`;
  }

  /**
   * 解析错误分析响应
   */
  private parseAnalysisResponse(response: string): ErrorAnalysis {
    try {
      const parsed = JSON.parse(response);

      console.log('🚀 ~ ErrorAnalyzer ~ parseAnalysisResponse ~ parsed:', parsed);

      // 验证必要字段
      if (
        typeof parsed.errorType !== 'string' ||
        typeof parsed.rootCause !== 'string' ||
        typeof parsed.pattern !== 'string' ||
        typeof parsed.guidance !== 'string' ||
        !Array.isArray(parsed.keywords) ||
        typeof parsed.confidence !== 'number'
      ) {
        throw new Error('响应格式不正确：缺少必要字段或字段类型错误');
      }

      // 验证错误类型
      const validErrorTypes = Object.values(ErrorType);
      if (!validErrorTypes.includes(parsed.errorType)) {
        throw new Error(`无效的错误类型: ${parsed.errorType}`);
      }

      // 验证置信度范围
      if (parsed.confidence < 0 || parsed.confidence > 1) {
        parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
      }

      return {
        errorType: parsed.errorType as ErrorType,
        rootCause: parsed.rootCause,
        pattern: parsed.pattern,
        guidance: parsed.guidance,
        keywords: parsed.keywords,
        confidence: parsed.confidence,
      };
    } catch (error) {
      throw new Error(
        `解析错误分析响应失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 创建降级的错误分析结果
   */
  private createFallbackAnalysis(input: MemoryFormationInput): ErrorAnalysis {
    // 基于Agent错误信息和ground truth进行简单分析
    const errorMessages = input.result.errors
      .map((e) => e.message)
      .join(' ')
      .toLowerCase();

    // 简单的错误类型推断
    let errorType: ErrorType = ErrorType.OTHER_ERROR;

    if (errorMessages.includes('element') || errorMessages.includes('selector')) {
      errorType = ErrorType.ELEMENT_LOCATING_ERROR;
    } else if (errorMessages.includes('timeout') || errorMessages.includes('wait')) {
      errorType = ErrorType.ASYNC_TIMING_ERROR;
    } else if (errorMessages.includes('content') || errorMessages.includes('text')) {
      errorType = ErrorType.CONTENT_VALIDATION_ERROR;
    } else if (errorMessages.includes('form') || errorMessages.includes('input')) {
      errorType = ErrorType.FORM_VALIDATION_ERROR;
    } else if (errorMessages.includes('state') || errorMessages.includes('status')) {
      errorType = ErrorType.STATE_DETECTION_ERROR;
    }

    const sceneInfo = input.context.meta.sceneId || '未知场景';
    const keywords = [
      sceneInfo,
      errorType.replace(/_error$/, '').replace(/_/g, '-'),
      'fallback-analysis',
    ];

    return {
      errorType,
      rootCause: `系统降级分析：基于Agent错误信息"${errorMessages}"和期望结果的简单分析。建议手动审查以获得更准确的分析结果。`,
      pattern: `在${sceneInfo}场景中出现的${errorType}类型错误，需要进一步分析确定具体模式。`,
      guidance: `针对${errorType}类型错误的通用建议：仔细检查相关操作步骤，确保正确理解测试要求。建议启用LLM分析以获得更准确的指导。`,
      keywords,
      confidence: 0.3, // 低置信度
    };
  }

  /**
   * 提取记忆上下文
   */
  extractMemoryContext(input: MemoryFormationInput, errorAnalysis: ErrorAnalysis): MemoryContext {
    const url = new URL(input.context.accessUrl);

    return {
      sceneId: input.context.meta.sceneId,
      caseId: input.context.meta.caseId,
      errorType: errorAnalysis.errorType,
      prompt: input.context.prompt,
      routePath: url.pathname,
      // TODO: 未来可以通过分析页面内容提取UI元素类型
      uiElementTypes: [],
    };
  }
}
