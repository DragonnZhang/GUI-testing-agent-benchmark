// src/execution/agent/builtins/midsceneAgent.ts - Midscene Agent Adapter

import puppeteer from 'puppeteer';
import { PuppeteerAgent } from '@midscene/web/puppeteer';
import type { Page, Browser } from 'puppeteer';
import { existsSync } from 'fs';
import { AgentAdapter, type AgentMeta } from '../adapter.js';
import type { AgentContext, AgentResult } from '../types.js';
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
   * 初始化浏览器和 Midscene Agent
   */
  async initialize(): Promise<void> {
    console.log("🚀 ~ MidsceneAgent ~ initialize ~ initialize:")
    
    // 获取本地 Chrome 浏览器路径
    const executablePath = this.getChromePath();
    
    this.browser = await puppeteer.launch({
      executablePath,
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage();
    this.agent = new PuppeteerAgent(this.page, {
      generateReport: true,
      aiActContext: '执行测试用例，关注页面功能和用户体验',
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

    try {
      // 导航到目标页面
      await this.page.goto(ctx.accessUrl, {
        waitUntil: 'networkidle2',
        timeout: ctx.meta.timeoutMs,
      });

      // 执行 AI 测试指令
      await this.agent.aiAct(ctx.prompt);

      rawOutput = {
        agent: 'midscene',
        accessUrl: ctx.accessUrl,
        prompt: ctx.prompt,
        status: 'success',
      };
    } catch (error) {
      const err = error as Error;
      errors.push({
        message: err?.message || 'Unknown error during Midscene execution',
        stack: err?.stack,
      });
      hasDefect = true;
      rawOutput = {
        agent: 'midscene',
        accessUrl: ctx.accessUrl,
        prompt: ctx.prompt,
        status: 'error',
        error: err?.message,
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
      confidence: hasDefect ? 0 : 0.9,
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
