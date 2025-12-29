// src/visualization/html/render.ts - 报告渲染 (T032, T052)

import type { TestCase } from '../../config/schema.js';
import type { ScoreResult } from '../../evaluation/scoring/binaryScorer.js';
import type { MetricsSummary } from '../../evaluation/scoring/metrics.js';
import type { MultiAgentReport } from '../../evaluation/compare/multiAgentReport.js';
import type { NormalizedResult } from '../../execution/agent/types.js';
import {
  htmlTemplate,
  generateRankingHtml,
  generateMetricsHtml,
  generateResultRowHtml,
  generateCaseDataJson,
  escapeHtml,
  type CaseDetailData,
} from './template.js';

/**
 * 报告渲染输入
 */
export interface ReportRenderInput {
  runId: string;
  metrics: MetricsSummary;
  scores: ScoreResult[];
  multiAgentReport: MultiAgentReport;
  testCases: TestCase[];
  normalizedResults?: NormalizedResult[];
}

/**
 * 渲染 HTML 报告
 */
export function renderHtmlReport(input: ReportRenderInput): string {
  const { runId, metrics, multiAgentReport, testCases, normalizedResults } = input;

  // 创建测试用例映射
  const testCaseMap = new Map<string, TestCase>();
  for (const tc of testCases) {
    testCaseMap.set(tc.case_id, tc);
  }

  // 创建归一化结果映射 (caseId::agentName -> result)
  const resultMap = new Map<string, NormalizedResult>();
  if (normalizedResults) {
    for (const result of normalizedResults) {
      const key = `${result.caseId}::${result.agentName}`;
      resultMap.set(key, result);
    }
  }

  // 生成排名 HTML
  const rankingHtml = generateRankingHtml(multiAgentReport.ranking);

  // 生成指标 HTML
  const metricsHtml = generateMetricsHtml(
    metrics.byAgent.map((m) => ({
      agentName: m.agentName,
      precision: m.precision,
      recall: m.recall,
      f1: m.f1,
      missRate: m.missRate,
      accuracy: m.accuracy,
      errorRate: m.errorRate,
      counts: m.counts,
    }))
  );

  // 生成 Agent 表头
  const agentNames = metrics.byAgent.map((m) => m.agentName);
  const agentHeaders = agentNames.map((name) => `<th>${escapeHtml(name)}</th>`).join('');

  // 构建 case detail 数据用于 modal
  const caseData: Record<string, CaseDetailData> = {};

  // 生成结果行
  const resultsHtml = multiAgentReport.caseComparisons
    .map((comparison) => {
      const testCase = testCaseMap.get(comparison.caseId);
      const prompt = testCase?.prompt || '';

      const agentResults = agentNames.map((agentName) => {
        const result = comparison.byAgent.find((r) => r.agentName === agentName);
        const key = `${comparison.caseId}::${agentName}`;
        const normalizedResult = resultMap.get(key);

        // 构建详情数据
        caseData[key] = {
          groundTruth: {
            has_defect: comparison.groundTruthHasDefect,
            defect_details: testCase?.ground_truth?.defect_details || [],
          },
          prediction: {
            has_defect: normalizedResult?.output?.has_defect ?? false,
            defect_details: normalizedResult?.output?.defect_details || [],
          },
          rawOutput: normalizedResult?.rawOutput || '',
          prompt: prompt,
          label: result?.label || 'N/A',
          success: normalizedResult?.success ?? false,
          durationMs: normalizedResult?.durationMs,
          error: normalizedResult?.error,
        };

        return {
          agentName,
          label: result?.label || 'N/A',
        };
      });

      return generateResultRowHtml(
        comparison.caseId,
        comparison.sceneId,
        prompt,
        comparison.groundTruthHasDefect,
        agentResults
      );
    })
    .join('');

  // 生成 case data JSON
  const caseDataJson = generateCaseDataJson(caseData);

  // 替换模板变量
  let html = htmlTemplate;
  html = html.replace(/\{\{runId\}\}/g, escapeHtml(runId));
  html = html.replace('{{generatedAt}}', escapeHtml(metrics.generatedAt));
  html = html.replace('{{totalCases}}', String(metrics.totalCases));
  html = html.replace('{{totalAgents}}', String(metrics.totalAgents));
  html = html.replace('{{rankingHtml}}', rankingHtml);
  html = html.replace('{{metricsHtml}}', metricsHtml);
  html = html.replace('{{agentHeaders}}', agentHeaders);
  html = html.replace('{{resultsHtml}}', resultsHtml);
  html = html.replace('{{caseDataJson}}', caseDataJson);

  return html;
}
