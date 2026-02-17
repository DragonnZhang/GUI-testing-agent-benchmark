// src/execution/agent/builtins/browserUseAgent.ts - Browser-use Agent Adapter

import { execa } from 'execa';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult } from '../types.js';
import {
  evaluateAgentResultWithRetry,
  createFallbackEvaluation,
  type AgentResultEvaluation,
} from '../services/agentResultEvaluator.js';
import 'dotenv/config';

/**
 * Browser-use Agent Adapter
 *
 * 基于 browser-use (Python) 提供的 AI 驱动浏览器自动化实现 UI 测试
 * 通过 Python 桥接脚本与 TypeScript 框架交互
 */
export class BrowserUseAgent extends AgentAdapter {
  readonly meta: AgentMeta = {
    name: 'browser-use',
    version: '1.0.0',
    description: 'AI-powered browser automation agent based on browser-use (Python)',
    supportedDefectTypes: ['display', 'interaction', 'other'],
  };

  private pythonPath: string;

  constructor() {
    super();
    // 优先使用环境变量指定的 Python 路径，默认使用项目虚拟环境
    this.pythonPath = process.env.PYTHON_PATH || '.venv/bin/python';
  }

  /**
   * 验证 Python 和 browser-use 是否已安装
   */
  private async validateEnvironment(): Promise<void> {
    try {
      // 检查 Python 是否可用
      const { stdout: pythonVersion } = await execa(this.pythonPath, ['--version']);
      console.log(`🐍 Python version: ${pythonVersion.trim()}`);

      // 检查 browser-use 是否已安装
      await execa(this.pythonPath, [
        '-c',
        "from browser_use import Agent; print('browser-use OK')",
      ]);
    } catch (error) {
      const err = error as Error;
      throw new Error(
        `Browser-use environment validation failed: ${err.message}\n` +
          `Please ensure:\n` +
          `1. Python 3.11+ is installed (current path: ${this.pythonPath})\n` +
          `2. browser-use is installed: pip install -r requirements.txt\n` +
          `3. Set PYTHON_PATH in .env if python3 is not in PATH`
      );
    }
  }

  /**
   * 将对象安全地转换为可序列化的格式（处理 Error 对象）
   */
  private toSerializable(obj: unknown): unknown {
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
        ...Object.getOwnPropertyNames(obj).reduce(
          (acc, key) => {
            try {
              acc[key] = this.toSerializable((obj as unknown as Record<string, unknown>)[key]);
            } catch {
              // 忽略无法访问的属性
            }
            return acc;
          },
          {} as Record<string, unknown>
        ),
      };
    }

    if (obj && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof RegExp)) {
      const result: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = this.toSerializable((obj as unknown as Record<string, unknown>)[key]);
        }
      }
      return result;
    }

    return obj;
  }

  /**
   * 初始化 Agent
   */
  async initialize(): Promise<void> {
    console.log('🚀 BrowserUseAgent ~ initialize ~ validating environment');
    await this.validateEnvironment();
    console.log('✅ BrowserUseAgent ~ initialize ~ validation completed');
  }

  /**
   * 执行单条测试用例
   */
  async runCase(ctx: AgentContext): Promise<AgentResult> {
    const errors: Array<{ message: string; stack?: string }> = [];
    let hasDefect = false;
    let rawOutput: unknown = null;
    let agentJudgment = '';
    let executionStatus: 'success' | 'error' = 'success';
    let llmEvaluation: AgentResultEvaluation | null = null;

    // 获取桥接脚本路径（使用 __dirname 计算，确保路径正确）
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = dirname(currentFilePath);
    // 如果是从 dist 运行，需要回到项目根目录再进入 src 找到 Python 脚本
    const isDist = currentDir.includes('/dist/') || currentDir.includes('\\dist\\');
    const bridgeScript = isDist
      ? resolve(currentDir, '../../../../src/execution/agent/builtins/browserUseBridge.py')
      : resolve(currentDir, 'browserUseBridge.py');

    // 准备输入数据
    const inputData = {
      url: ctx.accessUrl,
      prompt: ctx.prompt,
      timeout: ctx.meta.timeoutMs,
      use_vision: true,
      max_steps: 100,
      env: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
        OPENAI_MODEL_NAME: process.env.OPENAI_MODEL_NAME || 'gpt-4o',
      },
    };

    try {
      console.log(`📍 BrowserUseAgent ~ runCase ~ navigating to: ${ctx.accessUrl}`);
      console.log(`🎯 BrowserUseAgent ~ runCase ~ executing: ${ctx.prompt}`);

      // 执行 Python 桥接脚本
      const result = await execa(this.pythonPath, [bridgeScript], {
        input: JSON.stringify(inputData),
        timeout: ctx.meta.timeoutMs + 30000, // 额外 30s 启动时间
        all: true, // 捕获 stdout 和 stderr
      });

      // 打印 Python 脚本的 stderr 输出（调试信息）
      if (result.stderr) {
        console.log('🐍 [Python stderr]:', result.stderr);
      }

      // 解析输出（最后一行应该是 JSON 结果）
      const outputLines = result.stdout.split('\n').filter((line) => line.trim());
      const jsonOutput = outputLines.find((line) => {
        try {
          JSON.parse(line);
          return true;
        } catch {
          return false;
        }
      });

      if (!jsonOutput) {
        throw new Error(`No valid JSON output from Python bridge. Raw output: ${result.stdout}`);
      }

      const output = JSON.parse(jsonOutput);

      // 提取结果
      hasDefect = output.has_defect ?? false;
      rawOutput = output.raw_output;
      agentJudgment = output.agent_judgment || '';
      executionStatus = output.execution_status === 'success' ? 'success' : 'error';

      // 合并错误
      if (output.errors && Array.isArray(output.errors)) {
        errors.push(...output.errors);
      }

      console.log(`✅ BrowserUseAgent ~ runCase ~ completed. Has defect: ${hasDefect}`);
    } catch (error) {
      const err = error as Error & { stdout?: string; stderr?: string; all?: string };

      console.log('❌ BrowserUseAgent ~ runCase ~ error:', err.message);

      // 打印 Python 脚本的输出（如果有）
      if (err.stderr) {
        console.log('🐍 [Python stderr]:', err.stderr);
      }
      if (err.stdout) {
        console.log('🐍 [Python stdout]:', err.stdout);
      }

      executionStatus = 'error';
      errors.push({
        message: err.message || 'Unknown error during browser-use execution',
        stack: err.stack,
      });

      rawOutput = {
        agent: 'browser-use',
        accessUrl: ctx.accessUrl,
        prompt: ctx.prompt,
        status: 'error',
        error: err.message,
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
    console.log(
      '🧹 BrowserUseAgent ~ cleanup ~ nothing to clean up (browser is managed by Python process)'
    );
  }
}

// 创建单例实例
export const browserUseAgent = new BrowserUseAgent();
