// src/evaluation/scoring/metrics.ts - 指标计算（precision/recall/f1/miss rate）(T047 增强)

import type { ScoreResult, ScoreLabel } from './binaryScorer.js';
import type { CaseDetailJudgeSummary } from './detailJudge.js';

/**
 * 详情一致性指标 (T047)
 */
export interface DetailConsistencyMetrics {
  /** 详情一致率 = match / total */
  detailAccuracy: number;

  /** 部分匹配率 = partial / total */
  partialMatchRate: number;

  /** 不匹配率 = mismatch / total */
  mismatchRate: number;

  /** Unknown 占比 = unknown / total */
  unknownRate: number;

  /** 错误占比 = error / total */
  detailErrorRate: number;

  /** 总详情数 */
  totalDetails: number;
}

/**
 * 单 Agent 指标
 */
export interface AgentMetrics {
  agentName: string;

  /** 总用例数 */
  total: number;

  /** 各标签计数 */
  counts: Record<ScoreLabel, number>;

  /** 精确率 = TP / (TP + FP) */
  precision: number;

  /** 召回率 = TP / (TP + FN) */
  recall: number;

  /** F1 = 2 * P * R / (P + R) */
  f1: number;

  /** 漏检率 = FN / (TP + FN) = 1 - recall */
  missRate: number;

  /** 准确率 = (TP + TN) / total (excluding ERROR) */
  accuracy: number;

  /** 错误率（Agent 执行失败）= ERROR / total */
  errorRate: number;

  /** 详情一致性指标（可选，仅当启用 Judge 时） */
  detailConsistency?: DetailConsistencyMetrics;
}

/**
 * 指标汇总
 */
export interface MetricsSummary {
  /** 运行 ID */
  runId: string;

  /** 总用例数 */
  totalCases: number;

  /** 参与的 Agent 数量 */
  totalAgents: number;

  /** 各 Agent 指标 */
  byAgent: AgentMetrics[];

  /** 汇总时间 */
  generatedAt: string;

  /** 是否启用了详情 Judge */
  detailJudgeEnabled?: boolean;
}

/**
 * 计算单 Agent 指标
 */
export function calculateAgentMetrics(
  scores: ScoreResult[],
  agentName: string,
  detailSummaries?: CaseDetailJudgeSummary[]
): AgentMetrics {
  const agentScores = scores.filter((s) => s.agentName === agentName);
  const total = agentScores.length;

  const counts: Record<ScoreLabel, number> = {
    TP: 0,
    FP: 0,
    FN: 0,
    TN: 0,
    ERROR: 0,
  };

  for (const s of agentScores) {
    counts[s.label]++;
  }

  const { TP, FP, FN, TN, ERROR } = counts;

  // 计算指标（避免除零）
  const precision = TP + FP > 0 ? TP / (TP + FP) : 0;
  const recall = TP + FN > 0 ? TP / (TP + FN) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const missRate = TP + FN > 0 ? FN / (TP + FN) : 0;

  const validTotal = total - ERROR;
  const accuracy = validTotal > 0 ? (TP + TN) / validTotal : 0;
  const errorRate = total > 0 ? ERROR / total : 0;

  const metrics: AgentMetrics = {
    agentName,
    total,
    counts,
    precision: round4(precision),
    recall: round4(recall),
    f1: round4(f1),
    missRate: round4(missRate),
    accuracy: round4(accuracy),
    errorRate: round4(errorRate),
  };

  // 计算详情一致性指标 (T047)
  if (detailSummaries && detailSummaries.length > 0) {
    const agentDetails = detailSummaries.filter((d) => d.agentName === agentName);
    if (agentDetails.length > 0) {
      metrics.detailConsistency = calculateDetailConsistencyMetrics(agentDetails);
    }
  }

  return metrics;
}

/**
 * 计算详情一致性指标 (T047)
 */
export function calculateDetailConsistencyMetrics(
  summaries: CaseDetailJudgeSummary[]
): DetailConsistencyMetrics {
  let totalMatch = 0;
  let totalPartial = 0;
  let totalMismatch = 0;
  let totalUnknown = 0;
  let totalError = 0;
  let totalDetails = 0;

  for (const s of summaries) {
    totalMatch += s.matchCount;
    totalPartial += s.partialCount;
    totalMismatch += s.mismatchCount;
    totalUnknown += s.unknownCount;
    totalError += s.errorCount;
    totalDetails += s.detailResults.length;
  }

  return {
    detailAccuracy: totalDetails > 0 ? round4(totalMatch / totalDetails) : 0,
    partialMatchRate: totalDetails > 0 ? round4(totalPartial / totalDetails) : 0,
    mismatchRate: totalDetails > 0 ? round4(totalMismatch / totalDetails) : 0,
    unknownRate: totalDetails > 0 ? round4(totalUnknown / totalDetails) : 0,
    detailErrorRate: totalDetails > 0 ? round4(totalError / totalDetails) : 0,
    totalDetails,
  };
}

/**
 * 生成指标汇总
 */
export function generateMetricsSummary(
  scores: ScoreResult[],
  runId: string,
  detailSummaries?: CaseDetailJudgeSummary[]
): MetricsSummary {
  // 获取所有 Agent 名称
  const agentNames = [...new Set(scores.map((s) => s.agentName))];

  // 获取所有用例 ID（去重）
  const caseIds = new Set(scores.map((s) => s.caseId));

  const byAgent = agentNames.map((name) => calculateAgentMetrics(scores, name, detailSummaries));

  return {
    runId,
    totalCases: caseIds.size,
    totalAgents: agentNames.length,
    byAgent,
    generatedAt: new Date().toISOString(),
    detailJudgeEnabled: detailSummaries && detailSummaries.length > 0,
  };
}

/**
 * 四舍五入到 4 位小数
 */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
