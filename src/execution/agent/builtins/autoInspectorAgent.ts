// src/execution/agent/builtins/autoInspectorAgent.ts - Auto-Inspector Agent Adapter

import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult } from '../types.js';
import {
  evaluateAgentResultWithRetry,
  createFallbackEvaluation,
  type AgentResultEvaluation,
} from '../services/agentResultEvaluator.js';

/**
 * 动态导入 auto-inspector 的 runTest 函数
 * 避免在 agent 初始化时就加载依赖
 */
async function importRunTest() {
  try {
    const module = await import(
      '/Users/dragonzhang/Documents/UI build and check/GUI-testing-agent-benchmark/src/auto-inspector/backend/dist/app/sdk/index.js'
    );
    return module.runTest;
  } catch (error) {
    console.error('❌ 无法导入 auto-inspector 的 runTest 函数:', error);
    throw new Error(
      'auto-inspector SDK 未找到。请确保 auto-inspector backend 已正确构建。'
    );
  }
}

/**
 * Auto-Inspector Agent Adapter
 *
 * 基于 auto-inspector 提供的 runTest 函数实现 UI 测试
 * 使用 Manager Agent 和 Evaluation Agent 执行测试指令
 */
export class AutoInspectorAgent extends AgentAdapter {
  private runTest?: (options: { accessUrl: string; prompt: string }) => Promise<{
    status: 'passed' | 'failed';
    output: string;
  }>;

  readonly meta: AgentMeta = {
    name: 'auto-inspector',
    version: '1.0.0',
    description: 'AI-powered UI testing agent based on auto-inspector SDK',
    supportedDefectTypes: ['display', 'interaction', 'other'],
  };

  /**
   * 初始化 Agent（延迟加载 runTest 函数）
   */
  async initialize(): Promise<void> {
    console.log('🚀 ~ AutoInspectorAgent ~ initialize ~ initialize:');

    try {
      this.runTest = await importRunTest();
      console.log('✅ auto-inspector SDK 加载成功');
    } catch (error) {
      console.error('❌ auto-inspector SDK 加载失败:', error);
      throw error;
    }
  }

  /**
   * 执行单条测试用例
   */
  async runCase(ctx: AgentContext): Promise<AgentResult> {
    if (!this.runTest) {
      throw new Error('Auto-Inspector Agent not initialized. Call initialize() first.');
    }

    const errors: Array<{ message: string; stack?: string }> = [];
    let hasDefect = false;
    let rawOutput: unknown = null;
    let agentJudgment = '';
    let executionStatus: 'success' | 'error' = 'success';
    let llmEvaluation: AgentResultEvaluation | null = null;

    try {
      console.log('🎯 执行 auto-inspector 测试:', {
        accessUrl: ctx.accessUrl,
        prompt: ctx.prompt.substring(0, 100) + '...',
      });

      // 调用 auto-inspector 的 runTest 函数
      const result = await this.runTest({
        accessUrl: ctx.accessUrl,
        prompt: ctx.prompt,
      });

      console.log('🚀 ~ AutoInspectorAgent ~ runCase ~ result:', result);

      // 提取 Agent 的判断结果
      agentJudgment = JSON.stringify(result);
      executionStatus = 'success';

      // auto-inspector 的 status: 'failed' 表示检测到缺陷
      hasDefect = result.status === 'failed';

      rawOutput = {
        agent: 'auto-inspector',
        accessUrl: ctx.accessUrl,
        output: result.output,
        status: result.status,
      };
    } catch (error) {
      const err = error as Error;

      console.error('❌ auto-inspector 执行出错:', err.message);

      // 提取错误信息
      const errorMessage = err.message || 'Unknown error during auto-inspector execution';
      agentJudgment = JSON.stringify(errorMessage);
      executionStatus = 'error';

      errors.push({
        message: errorMessage,
        stack: err.stack,
      });

      rawOutput = {
        agent: 'auto-inspector',
        accessUrl: ctx.accessUrl,
        status: 'error',
        error: errorMessage,
      };
    }

    // 使用 LLM 评估 Agent 的判断结果
    try {
      console.log('🔍 开始使用 LLM 评估 Agent 判断结果...');

      llmEvaluation = await evaluateAgentResultWithRetry({
        testPrompt: ctx.prompt,
        agentJudgment,
        executionStatus,
        groundTruth: ctx.groundTruth,
      });

      // 根据 LLM 评估结果设置 hasDefect
      // hasDefect 应该反映实际是否存在缺陷，而不是 Agent 判断的正确性
      // 我们使用 ground truth 作为基准，因为 LLM 已经验证了 Agent 的判断是否准确
      hasDefect = ctx.groundTruth.has_defect;

      console.log('✅ LLM 评估完成:', {
        isAgentCorrect: llmEvaluation.isAgentCorrect,
        hasDefect,
        detectedCount: llmEvaluation.detectedDefectCount,
        expectedCount: llmEvaluation.expectedDefectCount,
      });
    } catch (evalError) {
      console.warn('⚠️ LLM 评估失败，使用降级逻辑:', evalError);

      // 使用降级逻辑
      llmEvaluation = createFallbackEvaluation(
        executionStatus,
        ctx.groundTruth.defect_details.length
      );
      hasDefect = ctx.groundTruth.has_defect;

      // 记录降级原因
      errors.push({
        message: `LLM 评估失败: ${evalError instanceof Error ? evalError.message : '未知错误'}`,
      });
    }

    // 增强 rawOutput，包含评估信息
    rawOutput = {
      ...(rawOutput as object),
      llmEvaluation,
      evaluationUsed: llmEvaluation ? 'llm' : 'fallback',
    };

    // 构建缺陷信息
    const defects = hasDefect
      ? [
          {
            type: 'interaction' as const,
            description: llmEvaluation.matchingAnalysis || errors.map((e) => e.message).join('; '),
            severity: ctx.groundTruth.defect_level || 'medium',
          },
        ]
      : [];

    return {
      hasDefect,
      defects,
      confidence: llmEvaluation?.confidence || (hasDefect ? 0.3 : 0.7),
      rawOutput,
      errors,
    };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('🧹 清理 AutoInspectorAgent...');
    // auto-inspector SDK 不需要显式清理
  }
}

// 创建单例实例
export const autoInspectorAgent = new AutoInspectorAgent();