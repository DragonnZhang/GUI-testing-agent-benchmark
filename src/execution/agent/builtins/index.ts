// src/execution/agent/builtins/index.ts - 内置 Agent 注册入口 (T024)

import { agentRegistry } from '../registry.js';
import { dummyAgent, noopAgent, alwaysDefectAgent } from './dummyAgent.js';
import { midsceneAgent } from './midsceneAgent.js';
import { midsceneAgentWithMemory } from './midsceneAgentWithMemory.js';
import { stagehandAgent } from './stagehandAgent.js';
import { browserUseAgent } from './browserUseAgent.js';

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

  if (!agentRegistry.has('midscene')) {
    agentRegistry.register(midsceneAgent);
  }

  if (!agentRegistry.has('midscene-memory')) {
    agentRegistry.register(midsceneAgentWithMemory);
  }

  if (!agentRegistry.has('stagehand')) {
    agentRegistry.register(stagehandAgent);
  }

  if (!agentRegistry.has('browser-use')) {
    agentRegistry.register(browserUseAgent);
  }
}

// 导出内置 Agent 以便外部直接使用
export {
  dummyAgent,
  noopAgent,
  alwaysDefectAgent,
  midsceneAgent,
  midsceneAgentWithMemory,
  stagehandAgent,
  browserUseAgent,
};
