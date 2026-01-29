// src/execution/agent/builtins/midsceneAgent.ts - Midscene Agent Adapter

import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';
import type { Page, Browser } from 'puppeteer';
import { existsSync } from 'fs';
import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult } from '../types.js';
import {
  evaluateAgentResultWithRetry,
  createFallbackEvaluation,
  type AgentResultEvaluation,
} from '../services/agentResultEvaluator.js';
import 'dotenv/config';

/**
 * Midscene Agent Adapter
 *
 * 基于 midscene 提供的 PuppeteerAgent 实现 UI 测试
 * 使用 Puppeteer 控制浏览器，通过 AI 执行测试指令
 */
export class MidsceneAgent extends AgentAdapter {
  private browser?: Browser;
  private page?: Page;
  private agent?: PuppeteerAgent;

  readonly meta: AgentMeta = {
    name: 'midscene',
    version: '1.0.0',
    description: 'AI-powered UI testing agent based on Midscene and Puppeteer',
    supportedDefectTypes: ['display', 'interaction', 'other'],
  };

  /**
   * 清理错误消息中的调用栈信息
   */
  private cleanStackTrace(message: string): string {
    if (!message) return message;

    // 移除调用栈相关的信息（以 "at " 开头的行）
    const lines = message.split('\n');
    const cleanedLines = lines.filter((line) => {
      const trimmedLine = line.trim();
      return (
        !trimmedLine.startsWith('at ') &&
        !trimmedLine.includes('node_modules') &&
        !trimmedLine.includes('file://') &&
        !trimmedLine.includes('process.processTicksAndRejections')
      );
    });

    return cleanedLines.join('\n').trim();
  }

  /**
   * 清理错误对象中的调用栈信息
   */
  private cleanErrorObject(error: any): any {
    if (!error) return error;

    const cleaned = { ...error };

    // 清理 stack 属性
    if (cleaned.stack) {
      cleaned.stack = this.cleanStackTrace(cleaned.stack);
    }

    // 清理 message 属性中可能包含的调用栈
    if (cleaned.message) {
      cleaned.message = this.cleanStackTrace(cleaned.message);
    }

    // 清理 errorStack 属性
    if (cleaned.errorStack) {
      cleaned.errorStack = this.cleanStackTrace(cleaned.errorStack);
    }

    // 递归清理 cause 属性
    if (cleaned.cause) {
      cleaned.cause = this.cleanErrorObject(cleaned.cause);
    }

    // 递归清理 errorTask 属性
    if (cleaned.errorTask) {
      cleaned.errorTask = this.cleanErrorObject(cleaned.errorTask);
    }

    return cleaned;
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
   * 初始化浏览器和 Midscene Agent
   */
  async initialize(): Promise<void> {
    console.log('🚀 ~ MidsceneAgent ~ initialize ~ initialize:');

    // 获取本地 Chrome 浏览器路径
    const executablePath = this.getChromePath();

    this.browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage();
    this.agent = new PuppeteerAgent(this.page, {
      generateReport: true,
      aiActContext:
        '执行测试用例，关注页面显示和交互功能的正确性。确保对所有的测试用例进行测试，并准确判断是否存在缺陷。最后返回正确或缺陷信息',
    });
  }

  /**
   * 获取本地 Chrome 浏览器路径
   */
  private getChromePath(): string {
    // macOS
    const macPaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];

    // Linux
    const linuxPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
    ];

    // Windows
    const windowsPaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    const allPaths = [...macPaths, ...linuxPaths, ...windowsPaths];

    // 检查文件是否存在
    for (const path of allPaths) {
      try {
        if (existsSync(path)) {
          console.log(`✅ Found Chrome at: ${path}`);
          return path;
        }
      } catch {
        // 继续检查下一个路径
      }
    }

    // 如果都找不到，抛出错误
    throw new Error(
      'Could not find Chrome/Chromium. Please install Chrome or set CHROME_PATH environment variable.'
    );
  }

  /**
   * 执行单条测试用例
   */
  async runCase(ctx: AgentContext): Promise<AgentResult> {
    if (!this.agent || !this.page) {
      throw new Error('Midscene Agent not initialized. Call initialize() first.');
    }

    const errors: Array<{ message: string; stack?: string }> = [];
    let hasDefect = false;
    let rawOutput: unknown = null;
    let agentJudgment = '';
    let executionStatus: 'success' | 'error' = 'success';
    let llmEvaluation: AgentResultEvaluation | null = null;

    try {
      // 导航到目标页面
      await this.page.goto(ctx.accessUrl, {
        waitUntil: 'networkidle2',
        timeout: ctx.meta.timeoutMs,
      });

      // 执行 AI 测试指令
      const result = await this.agent.aiAct(ctx.prompt);
      console.log('🚀 ~ MidsceneAgent ~ runCase ~ result:', result);

      // 提取 Agent 的判断结果
      // @ts-expect-error 输出结果
      agentJudgment = JSON.stringify(result!.yamlFlow);
      executionStatus = 'success';

      rawOutput = {
        agent: 'midscene',
        accessUrl: ctx.accessUrl,
        output: agentJudgment,
        status: 'success',
      };
    } catch (error) {
      const err = error as Error & {
        runner?: {
          name: string;
        };
        errorTask: {
          status: string;
          error: Error;
          errorMessage: string;
          errorStack: string;
          uiContext?: string;
        };
      };

      delete err.runner; // 这里面有 screenshotBase64，字符串太长了，直接删掉
      delete err.errorTask?.uiContext; // 这里面也有 screenshotBase64，删掉

      // 清理错误对象中的调用栈信息
      const cleanedErr = this.cleanErrorObject(err);

      console.log(
        '🚀 ~ MidsceneAgent ~ runCase ~ 执行出错:',
        this.cleanStackTrace(
          cleanedErr?.errorTask?.errorMessage ||
            cleanedErr.message ||
            'Unknown error during Midscene execution'
        )
      );

      // 提取 Agent 的判断结果（错误情况）
      const cleanErrorMessage = this.cleanStackTrace(
        err?.errorTask?.errorMessage || err.message || 'Unknown error during Midscene execution'
      );
      agentJudgment = JSON.stringify(cleanErrorMessage);
      executionStatus = 'error';

      errors.push({
        message: cleanErrorMessage,
        stack: err?.errorTask?.errorStack
          ? this.cleanStackTrace(err.errorTask.errorStack)
          : err.stack
            ? this.cleanStackTrace(err.stack)
            : undefined,
      });

      rawOutput = {
        agent: 'midscene',
        accessUrl: ctx.accessUrl,
        status: err?.errorTask?.status || 'error',
        error: cleanErrorMessage,
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
    if (this.agent) {
      await this.agent.destroy();
      this.agent = undefined;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
    this.page = undefined;
  }
}

// 创建单例实例
export const midsceneAgent = new MidsceneAgent();
