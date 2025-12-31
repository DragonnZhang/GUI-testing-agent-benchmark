// src/cli/commands/report.ts - report 命令实现 (T043, T052)

import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { loadTestCases } from '../../config/load.js';
import type { TestCase } from '../../config/schema.js';
import type { ScoreResult } from '../../evaluation/scoring/binaryScorer.js';
import type { MetricsSummary } from '../../evaluation/scoring/metrics.js';
import type { NormalizedResult } from '../../execution/agent/types.js';
import { generateMultiAgentReport } from '../../evaluation/compare/multiAgentReport.js';
import { renderHtmlReport } from '../../visualization/html/render.js';
import { ArtifactsManager } from '../../execution/logging/artifacts.js';

/**
 * report 命令选项
 */
export interface ReportCommandOptions {
  casesPath?: string;
}

/**
 * report 命令入口
 *
 * 从已有的 metrics.json 和 score.json 重新生成 report.html
 */
export async function reportCommand(
  runDir: string,
  options: ReportCommandOptions = {}
): Promise<void> {
  const absRunDir = resolve(runDir);
  console.log(`\n📄 Regenerating report for: ${absRunDir}`);

  // 读取运行配置
  const runConfigPath = join(absRunDir, 'run-config.json');
  let runConfig: { casesPath?: string; runId?: string } = {};
  try {
    const content = await readFile(runConfigPath, 'utf-8');
    runConfig = JSON.parse(content);
  } catch {
    console.warn('⚠️ Could not read run-config.json, using defaults');
  }

  // 读取 metrics.json
  const metricsPath = join(absRunDir, 'metrics.json');
  let metrics: MetricsSummary;
  try {
    const content = await readFile(metricsPath, 'utf-8');
    metrics = JSON.parse(content) as MetricsSummary;
    console.log(`📊 Loaded metrics for ${metrics.totalAgents} agent(s)`);
  } catch (error) {
    console.error(
      `❌ Failed to load metrics.json: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }

  // 读取 score.json
  const scorePath = join(absRunDir, 'score.json');
  let scores: ScoreResult[];
  try {
    const content = await readFile(scorePath, 'utf-8');
    scores = JSON.parse(content) as ScoreResult[];
    console.log(`📋 Loaded ${scores.length} score results`);
  } catch (error) {
    console.error(
      `❌ Failed to load score.json: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }

  // 读取 normalized-results.json (T052)
  const normalizedResultsPath = join(absRunDir, 'normalized-results.json');
  let normalizedResults: NormalizedResult[] | undefined;
  try {
    const content = await readFile(normalizedResultsPath, 'utf-8');
    normalizedResults = JSON.parse(content) as NormalizedResult[];
    console.log(`📦 Loaded ${normalizedResults.length} normalized results`);
  } catch {
    console.warn('⚠️ Could not load normalized-results.json, detail view may be limited');
  }

  // 加载测试用例（用于显示额外信息）
  const casesPath =
    options.casesPath || runConfig.casesPath || 'data/test-cases/test-case-config.json';
  let testCases: TestCase[] = [];
  try {
    testCases = await loadTestCases(resolve(casesPath));
    console.log(`📦 Loaded ${testCases.length} test case(s)`);
  } catch {
    console.warn('⚠️ Could not load test cases, report may have limited information');
  }

  // 从目录名提取 runId
  const runId = runConfig.runId || metrics.runId || absRunDir.split('/').pop() || 'unknown';

  // 生成多 Agent 对比报告
  const multiAgentReport = generateMultiAgentReport(scores, metrics);

  // 生成 HTML 报告
  const htmlReport = renderHtmlReport({
    runId,
    metrics,
    scores,
    multiAgentReport,
    testCases,
    normalizedResults,
  });

  // 写入报告
  const outputDir = absRunDir.split('/').slice(0, -1).join('/');
  const artifacts = new ArtifactsManager(outputDir, runId);
  await artifacts.writeReport(htmlReport);

  console.log(`\n✅ Report regenerated!`);
  console.log(`   📄 report.html: ${join(absRunDir, 'report.html')}`);
}
