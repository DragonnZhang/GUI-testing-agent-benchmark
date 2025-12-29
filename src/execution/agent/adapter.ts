// src/execution/agent/adapter.ts - Agent 适配器抽象契约

import type { AgentContext, AgentResult } from './types.js';

/**
 * Agent 元信息
 */
export interface AgentMeta {
  /** Agent 名称 */
  name: string;

  /** 版本 */
  version: string;

  /** 描述 */
  description?: string;

  /** 支持的缺陷类型 */
  supportedDefectTypes?: ('display' | 'interaction' | 'other')[];
}

/**
 * Agent 适配器抽象基类
 *
 * 所有 Agent 实现必须继承此类并实现 runCase 方法
 */
export abstract class AgentAdapter {
  abstract readonly meta: AgentMeta;

  /**
   * 执行单条测试用例
   * @param ctx Agent 执行上下文
   * @returns 规范化的 Agent 结果
   */
  abstract runCase(ctx: AgentContext): Promise<AgentResult>;

  /**
   * 可选：Agent 初始化（在 run 开始前调用一次）
   */
  async initialize?(): Promise<void>;

  /**
   * 可选：Agent 清理（在 run 结束后调用一次）
   */
  async cleanup?(): Promise<void>;
}

