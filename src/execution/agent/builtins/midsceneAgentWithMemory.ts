// src/execution/agent/builtins/midsceneAgentWithMemory.ts - 带记忆功能的 Midscene Agent

import type { AgentContext, AgentResult } from '../types.js';
import type { AgentMeta } from '../adapter.js';
import { MidsceneAgent } from './midsceneAgent.js';
import {
  MemoryService,
  type MemoryServiceConfig,
  type MemoryFormationInput,
  type MemoryRetrievalInput
} from '../services/memoryService/index.js';

/**
 * 带记忆功能的 Midscene Agent
 *
 * 继承原有的 MidsceneAgent，集成记忆系统功能：
 * 1. 测试前：检索相关记忆，增强测试指令
 * 2. 测试后：异步形成新记忆（如果有错误）
 */
export class MidsceneAgentWithMemory extends MidsceneAgent {
  private memoryService: MemoryService;
  private memoryConfig: MemoryServiceConfig;

  readonly meta: AgentMeta = {
    name: 'midscene-memory',
    version: '1.0.0',
    description: 'AI-powered UI testing agent with memory system - learns from past errors',
    supportedDefectTypes: ['display', 'interaction', 'other'],
  };

  constructor(memoryConfig: Partial<MemoryServiceConfig> = {}) {
    super();

    // 设置记忆系统配置
    this.memoryConfig = {
      enabled: true,
      dataPath: 'data/memory',
      asyncMemoryFormation: true,
      retrievalTimeoutMs: 5000,
      ...memoryConfig,
    };

    this.memoryService = new MemoryService(this.memoryConfig);
  }

  /**
   * 初始化Agent（包括记忆系统）
   */
  async initialize(): Promise<void> {
    console.log('🚀 初始化带记忆功能的 MidsceneAgent...');

    // 初始化基础 MidsceneAgent
    await super.initialize();

    // 初始化记忆系统
    try {
      await this.memoryService.initialize();
      console.log('🧠 记忆系统初始化成功');
    } catch (error) {
      console.warn('⚠️ 记忆系统初始化失败，将以普通模式运行:', error);
      // 记忆系统失败不影响基本功能
    }
  }

  /**
   * 执行单条测试用例（带记忆增强）
   */
  async runCase(ctx: AgentContext): Promise<AgentResult> {
    console.log('🎯 开始记忆增强的测试执行...', {
      caseId: ctx.meta.caseId,
      sceneId: ctx.meta.sceneId,
    });

    try {
      // 1. 检索相关记忆并增强测试指令
      const enhancedContext = await this.enhanceContextWithMemory(ctx);

      // 2. 执行测试（使用父类的逻辑）
      const result = await super.runCase(enhancedContext);

      // 3. 异步形成记忆（如果有学习价值）
      await this.formMemoryAsync(ctx, result);

      return result;
    } catch (error) {
      console.error('❌ 记忆增强测试执行失败:', error);

      // 如果记忆系统出错，降级到普通执行
      console.log('🔄 降级到普通测试执行...');
      return await super.runCase(ctx);
    }
  }

  /**
   * 使用记忆增强测试上下文
   */
  private async enhanceContextWithMemory(ctx: AgentContext): Promise<AgentContext> {
    try {
      if (!this.memoryConfig.enabled) {
        return ctx;
      }

      console.log('🔍 检索相关记忆...');

      // 构建记忆检索输入
      const retrievalInput: MemoryRetrievalInput = {
        context: ctx,
        similarityThreshold: 0.3,
        maxResults: 8,
      };

      // 检索记忆指导
      const memoryGuidance = await this.memoryService.retrieveGuidance(retrievalInput);

      if (memoryGuidance.length === 0) {
        console.log('ℹ️ 未找到相关记忆，使用原始指令');
        return ctx;
      }

      // 增强测试指令
      const enhancedPrompt = this.buildEnhancedPrompt(ctx.prompt, memoryGuidance);

      console.log('✅ 测试指令已通过记忆增强', {
        originalLength: ctx.prompt.length,
        enhancedLength: enhancedPrompt.length,
        guidanceCount: memoryGuidance.length,
      });

      return {
        ...ctx,
        prompt: enhancedPrompt,
      };
    } catch (error) {
      console.warn('⚠️ 记忆检索失败，使用原始指令:', error);
      return ctx;
    }
  }

  /**
   * 构建增强的测试指令
   */
  private buildEnhancedPrompt(originalPrompt: string, memoryGuidance: string[]): string {
    // 构建增强指令，保持原始指令的完整性
    const enhancedPrompt = `${originalPrompt}

---
🧠 **基于历史经验的提醒**：

${memoryGuidance.join('\n\n')}

---
⚠️ **重要提醒**：请在执行测试时特别注意上述经验指导，但仍需根据当前页面的实际情况进行判断。`;

    return enhancedPrompt;
  }

  /**
   * 异步形成记忆
   */
  private async formMemoryAsync(ctx: AgentContext, result: AgentResult): Promise<void> {
    try {
      if (!this.memoryConfig.enabled) {
        return;
      }

      // 检查结果中是否包含 LLM 评估
      const rawOutput = result.rawOutput as any;
      const llmEvaluation = rawOutput?.llmEvaluation;

      if (!llmEvaluation) {
        console.log('ℹ️ 缺少 LLM 评估结果，跳过记忆形成');
        return;
      }

      // 构建记忆形成输入
      const formationInput: MemoryFormationInput = {
        context: ctx,
        result: result,
        evaluation: llmEvaluation,
      };

      // 异步形成记忆
      await this.memoryService.formMemory(formationInput);
    } catch (error) {
      console.warn('⚠️ 记忆形成过程中出现错误:', error);
      // 记忆形成失败不影响测试结果
    }
  }

  /**
   * 获取记忆系统统计信息
   */
  async getMemoryStats(): Promise<any> {
    try {
      return await this.memoryService.getMemoryStats();
    } catch (error) {
      console.error('❌ 获取记忆统计失败:', error);
      return null;
    }
  }

  /**
   * 清理资源（包括记忆系统）
   */
  async cleanup(): Promise<void> {
    console.log('🧹 清理带记忆功能的 MidsceneAgent...');

    // 清理记忆系统
    try {
      await this.memoryService.cleanup();
    } catch (error) {
      console.warn('⚠️ 记忆系统清理时出现警告:', error);
    }

    // 清理基础 Agent
    await super.cleanup();

    console.log('✅ 清理完成');
  }
}

// 创建单例实例
export const midsceneAgentWithMemory = new MidsceneAgentWithMemory();