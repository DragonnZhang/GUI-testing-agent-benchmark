// src/execution/agent/builtins/dummyAgent.ts - 内置 Dummy/Noop Agent (T023)

import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult } from '../types.js';

/**
 * Dummy Agent - 固定输出，用于跑通链路
 *
 * 行为：
 * - 如果 prompt 包含 "defect" 或 "缺陷"，则报告有缺陷
 * - 否则报告无缺陷
 */
export class DummyAgent extends AgentAdapter {
  readonly meta: AgentMeta = {
    name: 'dummy',
    version: '1.0.0',
    description:
      'A dummy agent for testing the benchmark pipeline. Returns predictable results based on prompt keywords.',
    supportedDefectTypes: ['display', 'interaction', 'other'],
  };

  async runCase(ctx: AgentContext): Promise<AgentResult> {
    console.log('🚀 ~ DummyAgent ~ runCase ~ ctx:', ctx);
    // 模拟一些处理延迟
    await delay(10);

    // 简单关键词匹配逻辑
    const promptLower = ctx.prompt.toLowerCase();
    const hasDefectKeyword = promptLower.includes('defect') || ctx.prompt.includes('缺陷');

    if (hasDefectKeyword) {
      return {
        hasDefect: true,
        defects: [
          {
            type: 'display',
            description: '[Dummy] Detected potential defect based on prompt keywords',
            severity: 'medium',
          },
        ],
        confidence: 0.8,
        rawOutput: {
          agent: 'dummy',
          prompt: ctx.prompt,
          accessUrl: ctx.accessUrl,
          decision: 'hasDefect',
          reason: 'Keyword match: prompt contains defect-related terms',
        },
        errors: [],
      };
    }

    return {
      hasDefect: false,
      defects: [],
      confidence: 0.9,
      rawOutput: {
        agent: 'dummy',
        prompt: ctx.prompt,
        accessUrl: ctx.accessUrl,
        decision: 'noDefect',
        reason: 'No defect-related keywords found in prompt',
      },
      errors: [],
    };
  }
}

/**
 * Noop Agent - 始终返回无缺陷
 */
export class NoopAgent extends AgentAdapter {
  readonly meta: AgentMeta = {
    name: 'noop',
    version: '1.0.0',
    description: 'A no-operation agent that always reports no defects. Useful as a baseline.',
    supportedDefectTypes: [],
  };

  async runCase(_ctx: AgentContext): Promise<AgentResult> {
    return {
      hasDefect: false,
      defects: [],
      confidence: 1.0,
      rawOutput: { agent: 'noop', message: 'Always returns no defect' },
      errors: [],
    };
  }
}

/**
 * AlwaysDefect Agent - 始终返回有缺陷
 */
export class AlwaysDefectAgent extends AgentAdapter {
  readonly meta: AgentMeta = {
    name: 'always-defect',
    version: '1.0.0',
    description: 'An agent that always reports defects. Useful for testing FP scenarios.',
    supportedDefectTypes: ['other'],
  };

  async runCase(_ctx: AgentContext): Promise<AgentResult> {
    return {
      hasDefect: true,
      defects: [
        {
          type: 'other',
          description: '[AlwaysDefect] This agent always reports a defect',
          severity: 'low',
        },
      ],
      confidence: 1.0,
      rawOutput: { agent: 'always-defect', message: 'Always returns defect' },
      errors: [],
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 创建单例实例
export const dummyAgent = new DummyAgent();
export const noopAgent = new NoopAgent();
export const alwaysDefectAgent = new AlwaysDefectAgent();
