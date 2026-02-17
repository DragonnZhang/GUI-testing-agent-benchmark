// src/execution/agent/services/memoryService/types.ts - 记忆系统类型定义

import type { AgentContext, AgentResult } from '../../types.js';
import type { AgentResultEvaluation } from '../agentResultEvaluator.js';

/**
 * 错误类型分类体系
 */
export const ErrorType = {
  STATE_DETECTION_ERROR: 'state_detection_error',
  ASYNC_TIMING_ERROR: 'async_timing_error',
  ELEMENT_LOCATING_ERROR: 'element_locating_error',
  CONTENT_VALIDATION_ERROR: 'content_validation_error',
  INTERACTION_SEQUENCE_ERROR: 'interaction_sequence_error',
  FORM_VALIDATION_ERROR: 'form_validation_error',
  BUSINESS_RULE_ERROR: 'business_rule_error',
  EDGE_CASE_ERROR: 'edge_case_error',
  OTHER_ERROR: 'other_error',
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/**
 * 记忆节点类型
 */
export const MemoryNodeType = {
  /** 案例节点：具体的错误实例 */
  CASE: 'case',
  /** 经验节点：从多个案例中抽象的经验 */
  EXPERIENCE: 'experience',
  /** 策略节点：高层次的通用指导策略 */
  STRATEGY: 'strategy',
} as const;

export type MemoryNodeType = (typeof MemoryNodeType)[keyof typeof MemoryNodeType];

/**
 * 记忆内容结构
 */
export interface MemoryContent {
  /** 记忆的标题 */
  title: string;
  /** 记忆的描述 */
  description: string;
  /** 指导内容（用于增强测试指令） */
  guidance: string;
  /** 触发条件描述 */
  triggers: string[];
  /** 相关关键词 */
  keywords: string[];
}

/**
 * 记忆上下文
 */
export interface MemoryContext {
  /** 场景 ID */
  sceneId: string;
  /** 用例 ID */
  caseId: string;
  /** 错误类型 */
  errorType: ErrorType;
  /** 测试指令 */
  prompt: string;
  /** 路由路径（从 URL 提取） */
  routePath?: string;
  /** UI 元素类型 */
  uiElementTypes?: string[];
}

/**
 * 记忆节点
 */
export interface MemoryNode {
  /** 唯一标识符 */
  id: string;
  /** 节点类型 */
  type: MemoryNodeType;
  /** 记忆内容 */
  content: MemoryContent;
  /** 上下文信息 */
  context: MemoryContext;
  /** 创建时间 */
  createdAt: string;
  /** 最后更新时间 */
  updatedAt: string;
  /** 使用次数 */
  usageCount: number;
  /** 成功应用次数 */
  successCount: number;
  /** 置信度分数 (0-1) */
  confidence: number;
  /** 父节点 ID（用于构建记忆树） */
  parentId?: string;
  /** 子节点 ID 列表 */
  childrenIds: string[];
  /** 相关案例 ID 列表（对于经验和策略节点） */
  relatedCaseIds: string[];
}

/**
 * 记忆树结构
 */
export interface MemoryTree {
  /** 根节点 ID 列表 */
  rootIds: string[];
  /** 所有节点的映射 */
  nodes: Record<string, MemoryNode>;
  /** 索引信息 */
  indices: {
    /** 按场景 ID 索引 */
    bySceneId: Record<string, string[]>;
    /** 按错误类型索引 */
    byErrorType: Record<ErrorType, string[]>;
    /** 按关键词索引 */
    byKeywords: Record<string, string[]>;
  };
  /** 元数据 */
  metadata: {
    version: string;
    lastUpdated: string;
    totalNodes: number;
  };
}

/**
 * 错误分析结果
 */
export interface ErrorAnalysis {
  /** 错误类型 */
  errorType: ErrorType;
  /** 错误根因分析 */
  rootCause: string;
  /** 错误模式描述 */
  pattern: string;
  /** 预防指导 */
  guidance: string;
  /** 相关关键词 */
  keywords: string[];
  /** 分析置信度 */
  confidence: number;
}

/**
 * 相似度匹配结果
 */
export interface SimilarityMatch {
  /** 记忆节点 ID */
  nodeId: string;
  /** 相似度分数 (0-1) */
  score: number;
  /** 匹配维度详情 */
  dimensions: {
    sceneMatch: number;
    errorTypeMatch: number;
    keywordMatch: number;
    semanticMatch: number;
  };
}

/**
 * 记忆检索结果
 */
export interface MemoryRetrievalResult {
  /** 匹配的记忆节点列表 */
  matches: Array<{
    node: MemoryNode;
    similarity: SimilarityMatch;
  }>;
  /** 组织后的指导内容 */
  guidance: {
    /** 策略层指导 */
    strategies: string[];
    /** 经验层指导 */
    experiences: string[];
    /** 案例层警告 */
    caseWarnings: string[];
  };
  /** 检索统计 */
  stats: {
    totalCandidates: number;
    filteredMatches: number;
    averageConfidence: number;
  };
}

/**
 * 记忆形成参数
 */
export interface MemoryFormationInput {
  /** Agent 执行上下文 */
  context: AgentContext;
  /** Agent 执行结果 */
  result: AgentResult;
  /** LLM 评估结果 */
  evaluation: AgentResultEvaluation;
}

/**
 * 记忆检索参数
 */
export interface MemoryRetrievalInput {
  /** Agent 执行上下文 */
  context: AgentContext;
  /** 相似度阈值 (0-1) */
  similarityThreshold?: number;
  /** 最大返回数量 */
  maxResults?: number;
}

/**
 * 记忆演化配置
 */
export interface MemoryEvolutionConfig {
  /** 触发演化的案例数量阈值 */
  caseCountThreshold: number;
  /** 相似度聚合阈值 */
  similarityThreshold: number;
  /** 置信度提升阈值 */
  confidenceThreshold: number;
}
