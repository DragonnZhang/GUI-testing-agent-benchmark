// src/execution/logging/artifacts.ts - run 产物写入与目录约定

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import os from 'node:os';
import type { RunConfig } from '../../config/schema.js';
import type { CaseExecutionResult, NormalizedResult } from '../agent/types.js';
import type { ScoreResult } from '../../evaluation/scoring/binaryScorer.js';
import type { MetricsSummary } from '../../evaluation/scoring/metrics.js';

/**
 * 运行产物管理器
 */
export class ArtifactsManager {
  public readonly runDir: string;

  constructor(
    outputDir: string,
    private readonly runId: string
  ) {
    this.runDir = join(outputDir, runId);
  }

  /**
   * 初始化产物目录
   */
  async init(): Promise<void> {
    await mkdir(this.runDir, { recursive: true });
  }

  /**
   * 写入环境信息
   */
  async writeEnv(): Promise<void> {
    const env = {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      timestamp: new Date().toISOString(),
      gitCommit: getGitCommit(),
    };
    await this.writeJson('env.json', env);
  }

  /**
   * 写入运行配置
   */
  async writeRunConfig(config: RunConfig, agentsMeta: unknown[]): Promise<void> {
    const runConfig = {
      ...config,
      agents: agentsMeta,
      startedAt: new Date().toISOString(),
    };
    await this.writeJson('run-config.json', runConfig);
  }

  /**
   * 写入原始结果
   */
  async writeRawResults(results: CaseExecutionResult[]): Promise<void> {
    await this.writeJson('raw-results.json', results);
  }

  /**
   * 写入规范化结果 (T052: 增加 rawOutput 和 output 用于报告展示)
   */
  async writeNormalizedResults(results: CaseExecutionResult[]): Promise<NormalizedResult[]> {
    // 提取规范化输出
    const normalized: NormalizedResult[] = results.map((r) => ({
      caseId: r.caseId,
      sceneId: r.sceneId,
      agentName: r.agentName,
      success: r.success,
      durationMs: r.durationMs,
      rawOutput: typeof r.result.rawOutput === 'string'
        ? r.result.rawOutput
        : JSON.stringify(r.result.rawOutput),
      error: r.result.errors?.length > 0
        ? r.result.errors.map((e) => e.message).join('; ')
        : undefined,
      output: {
        has_defect: r.result.hasDefect,
        defect_details: r.result.defects.map((d) => d.description),
      },
    }));
    await this.writeJson('normalized-results.json', normalized);
    return normalized;
  }

  /**
   * 写入判分结果
   */
  async writeScore(scores: ScoreResult[]): Promise<void> {
    await this.writeJson('score.json', scores);
  }

  /**
   * 写入指标汇总
   */
  async writeMetrics(metrics: MetricsSummary): Promise<void> {
    await this.writeJson('metrics.json', metrics);
  }

  /**
   * 写入 HTML 报告
   */
  async writeReport(html: string): Promise<void> {
    const reportPath = join(this.runDir, 'report.html');
    await writeFile(reportPath, html, 'utf-8');
  }

  /**
   * 写入 JSON 文件
   */
  private async writeJson(filename: string, data: unknown): Promise<void> {
    const filePath = join(this.runDir, filename);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

/**
 * 获取当前 git commit hash
 */
function getGitCommit(): string | null {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

