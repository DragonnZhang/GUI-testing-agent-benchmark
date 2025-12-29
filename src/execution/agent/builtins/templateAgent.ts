// src/execution/agent/builtins/templateAgent.ts - Agent 适配器模板 (T034)
/**
 * 这是一个 Agent 适配器模板，展示如何接入新的 UI 测试 Agent。
 *
 * 接入步骤：
 * 1. 复制此文件并重命名（例如 myAgent.ts）
 * 2. 实现 runCase 方法
 * 3. 在 builtins/index.ts 中导入并注册
 *
 * 关键接口：
 * - AgentContext: 包含 accessUrl, prompt, meta (caseId, sceneId, runId, timeoutMs)
 * - AgentResult: 返回 hasDefect, defects[], rawOutput, errors[]
 */

import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult, DetectedDefect } from '../types.js';

/**
 * 示例：自定义 Agent 实现
 *
 * 你可以在这里：
 * - 调用外部 HTTP API
 * - 执行 Shell 命令/子进程
 * - 使用 Playwright/Puppeteer 进行实际的 UI 测试
 * - 调用 LLM API 进行智能分析
 */
export class TemplateAgent extends AgentAdapter {
  // 元信息：必须定义
  readonly meta: AgentMeta = {
    name: 'template',  // Agent 唯一标识符（在 CLI --agents 中使用）
    version: '1.0.0',
    description: '这是一个 Agent 模板，展示如何接入新的 UI 测试 Agent',
    supportedDefectTypes: ['display', 'interaction', 'other'],
  };

  /**
   * 可选：初始化（在整个 run 开始前调用一次）
   *
   * 适用场景：
   * - 初始化浏览器实例
   * - 加载模型
   * - 建立 WebSocket 连接
   */
  override async initialize(): Promise<void> {
    // console.log(`[${this.meta.name}] Initializing...`);
  }

  /**
   * 核心方法：执行单条测试用例
   *
   * @param ctx 执行上下文，包含：
   *   - accessUrl: 可访问的目标页面 URL
   *   - prompt: 测试指令/提示词
   *   - meta.caseId: 用例 ID
   *   - meta.sceneId: 场景 ID
   *   - meta.runId: 本次运行 ID
   *   - meta.timeoutMs: 超时时间
   *
   * @returns 规范化的检测结果
   */
  async runCase(ctx: AgentContext): Promise<AgentResult> {
    try {
      // ========== 在这里实现你的检测逻辑 ==========

      // 示例 1：调用外部 HTTP API
      // const response = await fetch('https://your-agent-api.com/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url: ctx.accessUrl, prompt: ctx.prompt }),
      //   signal: AbortSignal.timeout(ctx.meta.timeoutMs),
      // });
      // const rawOutput = await response.json();

      // 示例 2：使用 Playwright 进行实际检测
      // const browser = await chromium.launch();
      // const page = await browser.newPage();
      // await page.goto(ctx.accessUrl);
      // const screenshot = await page.screenshot();
      // await browser.close();

      // 示例 3：简单的固定逻辑（用于演示）
      const hasDefect = ctx.prompt.toLowerCase().includes('error');
      const defects: DetectedDefect[] = hasDefect
        ? [
            {
              type: 'display',
              description: '检测到可能的显示问题',
              severity: 'medium',
              evidence: `Analyzed URL: ${ctx.accessUrl}`,
            },
          ]
        : [];

      // ========== 返回规范化结果 ==========
      return {
        hasDefect,
        defects,
        confidence: 0.85, // 可选：置信度 0~1
        rawOutput: {
          // 保留原始输出，便于调试和审计
          agent: this.meta.name,
          analyzedUrl: ctx.accessUrl,
          prompt: ctx.prompt,
          timestamp: new Date().toISOString(),
        },
        errors: [], // 如果有非致命错误，记录在这里
      };
    } catch (error) {
      // 发生错误时，返回错误信息
      return {
        hasDefect: false,
        defects: [],
        rawOutput: null,
        errors: [
          {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        ],
      };
    }
  }

  /**
   * 可选：清理资源（在整个 run 结束后调用一次）
   *
   * 适用场景：
   * - 关闭浏览器实例
   * - 释放模型资源
   * - 断开连接
   */
  override async cleanup(): Promise<void> {
    // console.log(`[${this.meta.name}] Cleaning up...`);
  }
}

// 导出单例实例（可选，也可以在 index.ts 中实例化）
export const templateAgent = new TemplateAgent();

/*
 * ========== 注册说明 ==========
 *
 * 在 src/execution/agent/builtins/index.ts 中添加：
 *
 * import { templateAgent } from './templateAgent.js';
 *
 * export function registerBuiltinAgents(): void {
 *   // ... 其他 agent
 *   if (!agentRegistry.has('template')) {
 *     agentRegistry.register(templateAgent);
 *   }
 * }
 *
 * 然后就可以通过 CLI 使用：
 *   uibench run --agents template,dummy
 */
