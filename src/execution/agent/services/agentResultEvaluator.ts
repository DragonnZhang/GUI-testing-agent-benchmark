// src/execution/agent/services/agentResultEvaluator.ts - Agent 结果评估服务

import OpenAI from 'openai';
import type { GroundTruth } from '../../../config/schema.js';
import 'dotenv/config';

/**
 * Agent 结果评估参数
 */
export interface AgentResultEvaluationInput {
  /** 测试指令 */
  testPrompt: string;
  /** Agent 的判断结果（yamlFlow 或 errorMessage） */
  agentJudgment: string;
  /** 执行状态 */
  executionStatus: 'success' | 'error';
  /** 期望的测试结果 */
  groundTruth: GroundTruth;
}

/**
 * Agent 结果评估输出
 */
export interface AgentResultEvaluation {
  /** Agent 判断是否正确 */
  isAgentCorrect: boolean;
  /** Agent 发现的错误数量 */
  detectedDefectCount: number;
  /** 期望的错误总数 */
  expectedDefectCount: number;
  /** 匹配度分析 */
  matchingAnalysis: string;
  /** 评估置信度 0-1 */
  confidence: number;
}

/**
 * OpenAI 客户端实例
 */
let openaiClient: OpenAI | null = null;

/**
 * 初始化 OpenAI 客户端
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAI API 密钥未配置。请在 .env 文件中设置 OPENAI_API_KEY。\n' +
          '如果您没有 OpenAI API 密钥，请访问 https://platform.openai.com/api-keys 获取。'
      );
    }

    openaiClient = new OpenAI({
      apiKey,
      // 使用环境变量中的 base URL（如果配置了的话）
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  return openaiClient;
}

/**
 * 构建评估 prompt
 */
function buildEvaluationPrompt(input: AgentResultEvaluationInput): string {
  const { testPrompt, agentJudgment, executionStatus, groundTruth } = input;

  return `你是一个AI Agent测试结果评估专家。请评估Midscene Agent的测试判断是否准确。

## 测试信息
**测试指令**: ${testPrompt}

**Agent执行状态**: ${executionStatus}

**Agent判断结果**:
${agentJudgment}

## 期望结果
**是否应该有缺陷**: ${groundTruth.has_defect ? '是' : '否'}

**期望的缺陷详情**:
${
  groundTruth.defect_details.length > 0
    ? groundTruth.defect_details.map((detail, i) => `${i + 1}. ${detail}`).join('\n')
    : '无缺陷'
}

**缺陷严重程度**: ${groundTruth.defect_level || '无'}

## 评估任务
请分析以下几个方面：

1. **准确性判断**: Agent的最终判断（成功/失败）是否与期望结果一致？
   - 如果期望无缺陷但Agent报错，那么Agent判断错误
   - 如果期望有缺陷但Agent成功执行，那么Agent判断错误
   - 如果期望有缺陷且Agent报错，需要进一步分析Agent是否识别到了正确的缺陷

2. **缺陷检出统计**: 如果有多个预期缺陷，Agent发现了几个？
   - 仔细比对Agent提到的问题与期望缺陷详情的匹配度
   - 计算Agent实际检测到的缺陷数量

3. **判断质量评估**:
   - Agent的理由是否合理？
   - 是否存在误报或漏报？
   - 置信度应该如何评定？

## 输出要求
请严格按照以下JSON格式返回结果，不要添加任何额外的文字说明：

{
  "isAgentCorrect": boolean,
  "detectedDefectCount": number,
  "expectedDefectCount": number,
  "matchingAnalysis": "详细的匹配度分析，说明Agent的判断与期望结果的对比情况",
  "confidence": number
}

注意：
- isAgentCorrect: true表示Agent的总体判断正确，false表示判断错误
- detectedDefectCount: Agent实际发现的缺陷数量（基于其判断结果推断）
- expectedDefectCount: 期望发现的缺陷数量（ground_truth.defect_details的长度）
- confidence: 评估置信度，0-1之间的小数
- matchingAnalysis: 用中文详细说明分析过程和结论`;
}

/**
 * 解析 OpenAI 响应
 */
function parseEvaluationResponse(response: string): AgentResultEvaluation {
  try {
    // 尝试解析 JSON 响应
    const parsed = JSON.parse(response);

    // 验证必要字段
    if (
      typeof parsed.isAgentCorrect !== 'boolean' ||
      typeof parsed.detectedDefectCount !== 'number' ||
      typeof parsed.expectedDefectCount !== 'number' ||
      typeof parsed.matchingAnalysis !== 'string' ||
      typeof parsed.confidence !== 'number'
    ) {
      throw new Error('响应格式不正确：缺少必要字段或字段类型错误');
    }

    // 验证数值范围
    if (parsed.confidence < 0 || parsed.confidence > 1) {
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
    }

    if (parsed.detectedDefectCount < 0) {
      parsed.detectedDefectCount = 0;
    }

    if (parsed.expectedDefectCount < 0) {
      parsed.expectedDefectCount = 0;
    }

    return parsed;
  } catch (error) {
    throw new Error(`解析 OpenAI 响应失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 使用 OpenAI 大模型评估 Agent 结果
 */
export async function evaluateAgentResult(
  input: AgentResultEvaluationInput
): Promise<AgentResultEvaluation> {
  try {
    const client = getOpenAIClient();
    const prompt = buildEvaluationPrompt(input);

    console.log('🚀 ~ evaluateAgentResult ~ prompt:', prompt);

    console.log('🔍 开始评估 Agent 结果...');

    const response = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '你是一个专业的AI Agent测试结果评估专家。请仔细分析Agent的判断结果，并给出准确的评估。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // 降低随机性，保持评估一致性
        max_tokens: 2000,
      },
      {
        timeout: 30000, // 30秒超时
      }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI 返回空响应');
    }

    const evaluation = parseEvaluationResponse(content);

    console.log('✅ Agent 结果评估完成', {
      isCorrect: evaluation.isAgentCorrect,
      detected: evaluation.detectedDefectCount,
      expected: evaluation.expectedDefectCount,
      confidence: evaluation.confidence,
    });

    return evaluation;
  } catch (error) {
    console.error('❌ Agent 结果评估失败:', error);

    // 根据错误类型提供不同的错误信息
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error(
        'OpenAI API 密钥配置错误。请检查 .env 文件中的 OPENAI_API_KEY 设置。\n' +
          '获取 API 密钥：https://platform.openai.com/api-keys'
      );
    }

    throw new Error(`Agent 结果评估失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 评估 Agent 结果（带重试机制）
 */
export async function evaluateAgentResultWithRetry(
  input: AgentResultEvaluationInput,
  maxRetries: number = 2
): Promise<AgentResultEvaluation> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await evaluateAgentResult(input);
    } catch (error) {
      lastError = error as Error;

      if (attempt <= maxRetries) {
        console.warn(`🔄 Agent 结果评估失败，正在重试 (${attempt}/${maxRetries})...`);
        // 等待一段时间后重试
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError!;
}

/**
 * 创建降级的评估结果（当 LLM 评估失败时使用）
 */
export function createFallbackEvaluation(
  executionStatus: 'success' | 'error',
  expectedDefectCount: number
): AgentResultEvaluation {
  // 简单的降级逻辑：基于执行状态判断
  const isAgentCorrect =
    expectedDefectCount === 0 ? executionStatus === 'success' : executionStatus === 'error';

  return {
    isAgentCorrect,
    detectedDefectCount: executionStatus === 'error' ? 1 : 0, // 粗略估计
    expectedDefectCount,
    matchingAnalysis:
      '由于 LLM 评估服务不可用，使用降级逻辑：基于执行状态与期望缺陷数量进行简单判断。此结果可能不够准确。',
    confidence: 0.5, // 低置信度
  };
}
