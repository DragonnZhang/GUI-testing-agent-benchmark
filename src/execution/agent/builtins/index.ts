// src/execution/agent/builtins/index.ts - 内置 Agent 注册入口 (T024)

import { agentRegistry } from '../registry.js';
import { dummyAgent, noopAgent, alwaysDefectAgent } from './dummyAgent.js';

/**
 * 注册所有内置 Agent
 */
export function registerBuiltinAgents(): void {
  // 防止重复注册
  if (!agentRegistry.has('dummy')) {
    agentRegistry.register(dummyAgent);
  }

  if (!agentRegistry.has('noop')) {
    agentRegistry.register(noopAgent);
  }

  if (!agentRegistry.has('always-defect')) {
    agentRegistry.register(alwaysDefectAgent);
  }
}

// 导出内置 Agent 以便外部直接使用
export { dummyAgent, noopAgent, alwaysDefectAgent };
