// src/execution/agent/types.ts - Agent 标准输入/输出类型

import type { GroundTruth } from '../../config/schema.js';

/**
 * Agent 执行上下文（统一输入）
 */
export interface AgentContext {
  /** 可访问的目标 URL，例如 http://localhost:5173/login */
  accessUrl: string;

  /** 测试指令/提示词 */
  prompt: string;

  /** 期望的测试结果（用于智能评估 Agent 判断的准确性） */
  groundTruth: GroundTruth;

  /** 元数据 */
  meta: {
    caseId: string;
    sceneId: string;
    runId: string;
    tags?: string[];
    timeoutMs: number;
  };
}

/**
 * 检测到的单个缺陷
 */
export interface DetectedDefect {
  /** 缺陷类型：显示/交互/其他 */
  type?: 'display' | 'interaction' | 'other';

  /** 缺陷描述 */
  description: string;

  /** high程度 */
  severity?: string;

  /** 证据/定位信息 */
  evidence?: string;
}

/**
 * Agent 执行结果（规范化输出）
 */
export interface AgentResult {
  /** 是否检测到缺陷 */
  hasDefect: boolean;

  /** 缺陷列表 */
  defects: DetectedDefect[];

  /** 置信度（0~1，可选） */
  confidence?: number;

  /** Agent 原始输出（完整保留） */
  rawOutput: unknown;

  /** 执行错误（若有） */
  errors: Array<{ message: string; stack?: string }>;
}

/**
 * 单用例执行结果（含元数据）
 */
export interface CaseExecutionResult {
  caseId: string;
  sceneId: string;
  agentName: string;
  result: AgentResult;
  durationMs: number;
  startedAt: string;
  finishedAt: string;
  success: boolean;
}

/**
 * 归一化结果（用于存储和 HTML 报告）
 */
export interface NormalizedResult {
  caseId: string;
  sceneId: string;
  agentName: string;
  success: boolean;
  durationMs: number;
  rawOutput?: string;
  error?: string;
  output?: {
    has_defect: boolean;
    defect_details: string[];
  };
}
