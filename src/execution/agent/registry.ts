// src/execution/agent/registry.ts - Agent 注册与发现 (T035 增强)

import type { AgentAdapter, AgentMeta } from './adapter.js';
import type { AgentConfig } from '../../config/schema.js';

/**
 * Agent 运行时配置
 */
export interface AgentRuntimeConfig {
  /** Agent 实例 */
  adapter: AgentAdapter;

  /** 是否启用 */
  enabled: boolean;

  /** 单用例超时（覆盖全局） */
  timeout?: number;

  /** 自定义选项 */
  options?: Record<string, unknown>;
}

/**
 * Agent 注册表（单例）
 */
class AgentRegistry {
  private agents = new Map<string, AgentAdapter>();
  private runtimeConfigs = new Map<string, AgentRuntimeConfig>();

  /**
   * 注册 Agent
   */
  register(adapter: AgentAdapter): void {
    const name = adapter.meta.name;
    if (this.agents.has(name)) {
      throw new Error(`Agent "${name}" is already registered`);
    }
    this.agents.set(name, adapter);
  }

  /**
   * 获取 Agent
   */
  get(name: string): AgentAdapter | undefined {
    return this.agents.get(name);
  }

  /**
   * 获取 Agent（必须存在）
   */
  getRequired(name: string): AgentAdapter {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent "${name}" not found. Available: ${this.listNames().join(', ')}`);
    }
    return agent;
  }

  /**
   * 列出所有已注册 Agent 名称
   */
  listNames(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * 列出所有已注册 Agent 元信息
   */
  listMeta(): AgentMeta[] {
    return Array.from(this.agents.values()).map((a) => a.meta);
  }

  /**
   * 检查 Agent 是否存在
   */
  has(name: string): boolean {
    return this.agents.has(name);
  }

  /**
   * 清空注册表（主要用于测试）
   */
  clear(): void {
    this.agents.clear();
    this.runtimeConfigs.clear();
  }

  /**
   * 从配置加载 Agent 运行时配置 (T035)
   */
  loadFromConfigs(configs: AgentConfig[]): AgentRuntimeConfig[] {
    const result: AgentRuntimeConfig[] = [];

    for (const config of configs) {
      const adapter = this.get(config.name);
      if (!adapter) {
        console.warn(`[registry] Agent "${config.name}" not found, skipping.`);
        continue;
      }

      const runtimeConfig: AgentRuntimeConfig = {
        adapter,
        enabled: config.enabled,
        timeout: config.timeout,
        options: config.options,
      };

      this.runtimeConfigs.set(config.name, runtimeConfig);

      if (config.enabled) {
        result.push(runtimeConfig);
      }
    }

    return result;
  }

  /**
   * 获取 Agent 的运行时配置
   */
  getRuntimeConfig(name: string): AgentRuntimeConfig | undefined {
    return this.runtimeConfigs.get(name);
  }

  /**
   * 获取 Agent 的超时配置（优先使用 Agent 级别，否则使用默认值）
   */
  getAgentTimeout(name: string, defaultTimeout: number): number {
    const config = this.runtimeConfigs.get(name);
    return config?.timeout ?? defaultTimeout;
  }

  /**
   * 列出启用的 Agent
   */
  listEnabledNames(): string[] {
    const enabled: string[] = [];
    for (const [name, config] of this.runtimeConfigs) {
      if (config.enabled) {
        enabled.push(name);
      }
    }
    // 如果没有配置，返回所有已注册的
    return enabled.length > 0 ? enabled : this.listNames();
  }
}

/** 全局 Agent 注册表 */
export const agentRegistry = new AgentRegistry();
