// src/cli/commands/eval.ts - eval 命令实现 (T042)

import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { loadTestCases } from '../../config/load.js';
import type { TestCase } from '../../config/schema.js';
import type { CaseExecutionResult } from '../../execution/agent/types.js';
import { scoreCases } from '../../evaluation/scoring/binaryScorer.js';
import { generateMetricsSummary } from '../../evaluation/scoring/metrics.js';
import { ArtifactsManager } from '../../execution/logging/artifacts.js';

/**
 * eval 命令选项
 */
export interface EvalCommandOptions {
  casesPath?: string;
}

/**
 * eval 命令入口
 *
 * 重新评估已有的运行结果，生成新的 score.json 和 metrics.json
 */
export async function evalCommand(runDir: string, options: EvalCommandOptions = {}): Promise<void> {
  const absRunDir = resolve(runDir);
  console.log(`\n🔄 Re-evaluating run: ${absRunDir}`);

  // 读取运行配置以获取原始用例路径
  const runConfigPath = join(absRunDir, 'run-config.json');
  let runConfig: { casesPath?: string; runId?: string } = {};
  try {
    const content = await readFile(runConfigPath, 'utf-8');
    runConfig = JSON.parse(content);
  } catch {
    console.warn('⚠️ Could not read run-config.json, using defaults');
  }

  // 加载测试用例
  const casesPath = options.casesPath || runConfig.casesPath || 'data/test-cases/test-case-config.json';
  console.log(`📦 Loading test cases from: ${casesPath}`);
  
  let testCases: TestCase[];
  try {
    testCases = await loadTestCases(resolve(casesPath));
  } catch (error) {
    console.error(`❌ Failed to load test cases: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // 读取原始结果（优先使用 normalized-results.json）
  const normalizedPath = join(absRunDir, 'normalized-results.json');
  const rawPath = join(absRunDir, 'raw-results.json');

  let execResults: CaseExecutionResult[];
  try {
    const content = await readFile(normalizedPath, 'utf-8');
    const normalized = JSON.parse(content) as Array<{
      caseId: string;
      sceneId: string;
      agentName: string;
      hasDefect: boolean;
      defects: Array<{ type?: 'display' | 'interaction' | 'other'; description: string }>;
      confidence?: number;
      errors: Array<{ message: string }>;
      durationMs: number;
      success: boolean;
    }>;

    // 转换为 CaseExecutionResult 格式
    execResults = normalized.map((r) => ({
      caseId: r.caseId,
      sceneId: r.sceneId,
      agentName: r.agentName,
      result: {
        hasDefect: r.hasDefect,
        defects: r.defects || [],
        confidence: r.confidence,
        rawOutput: null,
        errors: r.errors || [],
      },
      durationMs: r.durationMs,
      startedAt: '',
      finishedAt: '',
      success: r.success,
    }));
    console.log(`📄 Loaded ${execResults.length} results from normalized-results.json`);
  } catch {
    // 尝试使用 raw-results.json
    try {
      const content = await readFile(rawPath, 'utf-8');
      execResults = JSON.parse(content) as CaseExecutionResult[];
      console.log(`📄 Loaded ${execResults.length} results from raw-results.json`);
    } catch (error) {
      console.error(`❌ Could not load results: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }

  // 计算判分
  console.log('🧮 Calculating scores...');
  const scores = scoreCases(execResults, testCases);

  // 从目录名提取 runId
  const runId = runConfig.runId || absRunDir.split('/').pop() || 'unknown';

  // 生成指标汇总
  const metrics = generateMetricsSummary(scores, runId);

  // 写入结果（复用 ArtifactsManager 的部分功能）
  const outputDir = absRunDir.split('/').slice(0, -1).join('/');
  const artifacts = new ArtifactsManager(outputDir, runId);

  await artifacts.writeScore(scores);
  await artifacts.writeMetrics(metrics);

  // 输出汇总
  console.log('\n📊 Re-evaluation Results:');
  console.log('-------------------------');
  for (const agentMetrics of metrics.byAgent) {
    console.log(`\n${agentMetrics.agentName}:`);
    console.log(`  Precision: ${(agentMetrics.precision * 100).toFixed(1)}%`);
    console.log(`  Recall:    ${(agentMetrics.recall * 100).toFixed(1)}%`);
    console.log(`  F1:        ${(agentMetrics.f1 * 100).toFixed(1)}%`);
    console.log(`  Miss Rate: ${(agentMetrics.missRate * 100).toFixed(1)}%`);
  }

  console.log(`\n✅ Re-evaluation completed!`);
  console.log(`   📄 score.json: ${join(absRunDir, 'score.json')}`);
  console.log(`   📄 metrics.json: ${join(absRunDir, 'metrics.json')}`);
}
