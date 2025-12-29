// src/evaluation/compare/multiAgentReport.ts - 多 Agent 横向对比结构

import type { ScoreResult } from '../scoring/binaryScorer.js';
import type { AgentMetrics, MetricsSummary } from '../scoring/metrics.js';

/**
 * 用例级对比明细
 */
export interface CaseComparison {
  caseId: string;
  sceneId: string;
  groundTruthHasDefect: boolean;

  /** 各 Agent 在该用例上的表现 */
  byAgent: Array<{
    agentName: string;
    predictedHasDefect: boolean;
    label: ScoreResult['label'];
    executionSuccess: boolean;
  }>;
}

/**
 * 多 Agent 对比报告
 */
export interface MultiAgentReport {
  runId: string;

  /** 各 Agent 汇总指标 */
  agentMetrics: AgentMetrics[];

  /** 用例级对比明细 */
  caseComparisons: CaseComparison[];

  /** 排名（按 F1 降序） */
  ranking: Array<{
    rank: number;
    agentName: string;
    f1: number;
    precision: number;
    recall: number;
  }>;
}

/**
 * 生成多 Agent 对比报告
 */
export function generateMultiAgentReport(
  scores: ScoreResult[],
  metricsSummary: MetricsSummary
): MultiAgentReport {
  // 用例级对比
  const caseMap = new Map<string, CaseComparison>();

  for (const s of scores) {
    let comparison = caseMap.get(s.caseId);
    if (!comparison) {
      comparison = {
        caseId: s.caseId,
        sceneId: s.sceneId,
        groundTruthHasDefect: s.groundTruthHasDefect,
        byAgent: [],
      };
      caseMap.set(s.caseId, comparison);
    }

    comparison.byAgent.push({
      agentName: s.agentName,
      predictedHasDefect: s.predictedHasDefect,
      label: s.label,
      executionSuccess: s.executionSuccess,
    });
  }

  const caseComparisons = Array.from(caseMap.values()).sort((a, b) =>
    a.caseId.localeCompare(b.caseId)
  );

  // 排名（按 F1 降序）
  const ranking = [...metricsSummary.byAgent]
    .sort((a, b) => b.f1 - a.f1)
    .map((m, i) => ({
      rank: i + 1,
      agentName: m.agentName,
      f1: m.f1,
      precision: m.precision,
      recall: m.recall,
    }));

  return {
    runId: metricsSummary.runId,
    agentMetrics: metricsSummary.byAgent,
    caseComparisons,
    ranking,
  };
}

