// src/execution/agent/builtins/stagehandAgent.ts - Stagehand Agent Adapter

import { CustomOpenAIClient, Stagehand } from '@browserbasehq/stagehand';
import OpenAI from 'openai';
import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult } from '../types.js';
import 'dotenv/config';

/**
 * Stagehand Agent Adapter
 *
 * 基于 Stagehand 提供的 AI 驱动浏览器自动化实现 UI 测试
 */
export class StagehandAgent extends AgentAdapter {
  private stagehand?: Stagehand;

  readonly meta: AgentMeta = {
    name: 'stagehand',
    version: '1.0.0',
    description: 'AI-powered browser automation agent based on Stagehand',
    supportedDefectTypes: ['display', 'interaction', 'other'],
  };

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
   * 验证环境变量是否已配置
   */
  private validateEnvironmentVariables(): void {
    const requiredEnvVars = ['OPENAI_API_KEY']; // 本地模式只需要 AI 模型配置
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables for Stagehand: ${missingVars.join(', ')}. ` +
          'Please check your .env file and ensure these variables are set.'
      );
    }
  }

  /**
   * 初始化 Stagehand 实例
   */
  async initialize(): Promise<void> {
    console.log('🚀 StagehandAgent ~ initialize ~ starting initialization');

    // 验证环境变量
    this.validateEnvironmentVariables();

    // 初始化 Stagehand 实例（本地模式）
    this.stagehand = new Stagehand({
      env: 'LOCAL', // 使用本地浏览器而非 Browserbase 云服务
      // model: {
      //   modelName: 'qwen3-vl-plus',
      //   apiKey: process.env.OPENAI_API_KEY,
      //   baseURL: process.env.OPENAI_BASE_URL,
      // },
      llmClient: new CustomOpenAIClient({
        modelName: process.env.OPENAI_MODEL_NAME || 'qwen3-vl-plus',
        // @ts-expect-error -- ai client type mismatch
        client: new OpenAI({
          baseURL: process.env.OPENAI_BASE_URL,
          apiKey: process.env.OPENAI_API_KEY!,
        }),
      }),
      verbose: 1,
      experimental: true, // 启用 hybrid mode
      // 本地浏览器配置选项
      localBrowserLaunchOptions: {
        headless: true, // 设为 false 可显示浏览器窗口用于调试
      },
    });

    await this.stagehand.init();
    console.log('✅ StagehandAgent ~ initialize ~ initialization completed (LOCAL mode)');

    // 本地模式下没有 Browserbase 会话 URL
  }

  /**
   * 执行单条测试用例
   */
  async runCase(ctx: AgentContext): Promise<AgentResult> {
    if (!this.stagehand) {
      throw new Error('StagehandAgent not initialized. Call initialize() first.');
    }

    const errors: Array<{ message: string; stack?: string }> = [];
    let hasDefect = false;
    let rawOutput: unknown = null;

    try {
      // 获取页面实例
      const page = this.stagehand.context.pages()[0];

      // 导航到目标页面
      console.log(`📍 Navigating to: ${ctx.accessUrl}`);
      await page.goto(ctx.accessUrl, {
        waitUntil: 'networkidle',
        timeoutMs: ctx.meta.timeoutMs,
      });

      // 使用 AI 执行测试指令
      console.log(`🎯 Executing instruction: ${ctx.prompt}`);
      const result = await this.stagehand.act(ctx.prompt, {
        timeout: ctx.meta.timeoutMs,
      });

      console.log('✅ StagehandAgent ~ runCase ~ result:', JSON.stringify(result, null, 2));

      // 根据 Stagehand 返回结果判断是否成功
      if (!result.success) {
        hasDefect = true;
        errors.push({
          message: result.message || 'Stagehand action failed',
        });
      }

      rawOutput = {
        agent: 'stagehand',
        accessUrl: ctx.accessUrl,
        prompt: ctx.prompt,
        status: result.success ? 'success' : 'failed',
        result: this.toSerializable(result),
        mode: 'LOCAL', // 标记为本地模式
      };
    } catch (error) {
      const err = error as Error;

      console.log(
        '❌ StagehandAgent ~ runCase ~ error:',
        JSON.stringify(this.toSerializable(err), null, 2)
      );
      console.log('❌ StagehandAgent ~ runCase ~ error message:', err.message);

      errors.push({
        message: err.message || 'Unknown error during Stagehand execution',
        stack: err.stack,
      });

      hasDefect = true;
      rawOutput = {
        agent: 'stagehand',
        accessUrl: ctx.accessUrl,
        prompt: ctx.prompt,
        status: 'error',
        error: err.message,
        mode: 'LOCAL', // 标记为本地模式
      };
    }

    return {
      hasDefect,
      defects: hasDefect
        ? [
            {
              type: 'interaction',
              description: errors.map((e) => e.message).join('; '),
              severity: 'high',
            },
          ]
        : [],
      confidence: hasDefect ? 0.8 : 0.9,
      rawOutput,
      errors,
    };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.stagehand) {
      console.log('🧹 StagehandAgent ~ cleanup ~ closing Stagehand instance');
      try {
        await this.stagehand.close();
      } catch (error) {
        console.warn('⚠️ StagehandAgent ~ cleanup ~ error during cleanup:', error);
      } finally {
        this.stagehand = undefined;
      }
    }
  }
}

// 创建单例实例
export const stagehandAgent = new StagehandAgent();
