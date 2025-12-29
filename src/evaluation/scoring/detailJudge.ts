// src/evaluation/scoring/detailJudge.ts - 语义裁判可插拔接口 (T044, T045, T046)

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DetectedDefect } from '../../execution/agent/types.js';
import type { GroundTruth } from '../../config/schema.js';

/**
 * 判定结果
 */
export type JudgeVerdict = 'match' | 'partial' | 'mismatch' | 'unknown' | 'error';

/**
 * 单个缺陷详情的判定结果
 */
export interface DetailJudgeResult {
  /** 判定结果 */
  verdict: JudgeVerdict;

  /** 置信度 0~1 */
  confidence: number;

  /** 判定理由 */
  rationale: string;

  /** 原始响应（调试用） */
  rawResponse?: unknown;
}

/**
 * 用例级别的详情判定汇总
 */
export interface CaseDetailJudgeSummary {
  /** 用例 ID */
  caseId: string;

  /** Agent 名称 */
  agentName: string;

  /** 各缺陷详情的判定结果 */
  detailResults: DetailJudgeResult[];

  /** 汇总：匹配数 */
  matchCount: number;

  /** 汇总：部分匹配数 */
  partialCount: number;

  /** 汇总：不匹配数 */
  mismatchCount: number;

  /** 汇总：未知/无法判定数 */
  unknownCount: number;

  /** 汇总：错误数 */
  errorCount: number;

  /** 详情一致率 = match / total */
  detailAccuracy: number;
}

/**
 * Judge 配置
 */
export interface JudgeConfig {
  /** 模式：off / http */
  mode: 'off' | 'http';

  /** HTTP 模式下的 API URL */
  httpUrl?: string;

  /** 请求超时（毫秒） */
  timeout?: number;

  /** 是否启用缓存 */
  enableCache?: boolean;

  /** 缓存目录 */
  cacheDir?: string;
}

/**
 * HTTP Judge 请求体
 */
export interface HttpJudgeRequest {
  /** Agent 检测到的缺陷描述 */
  agentDefect: string;

  /** Ground Truth 的缺陷描述 */
  groundTruthDefect: string;

  /** 可选：用例上下文 */
  context?: {
    caseId: string;
    prompt: string;
    accessUrl: string;
  };
}

/**
 * HTTP Judge 响应体
 */
export interface HttpJudgeResponse {
  /** 判定结果 */
  verdict: JudgeVerdict;

  /** 置信度 0~1 */
  confidence: number;

  /** 判定理由 */
  rationale: string;
}

/**
 * Judge 缓存条目
 */
interface CacheEntry {
  hash: string;
  result: DetailJudgeResult;
  timestamp: string;
}

/**
 * Detail Judge 类
 */
export class DetailJudge {
  private cache = new Map<string, DetailJudgeResult>();
  private cacheLoaded = false;
  private cacheFile: string | null = null;

  constructor(private readonly config: JudgeConfig) {
    if (config.cacheDir) {
      this.cacheFile = join(config.cacheDir, 'judge-cache.json');
    }
  }

  /**
   * 判定单个缺陷详情是否与 Ground Truth 一致
   */
  async judgeDetail(
    agentDefect: DetectedDefect,
    groundTruthDetail: string,
    context?: { caseId: string; prompt: string; accessUrl: string }
  ): Promise<DetailJudgeResult> {
    // 如果 Judge 关闭，返回 unknown
    if (this.config.mode === 'off') {
      return {
        verdict: 'unknown',
        confidence: 0,
        rationale: 'Detail judge is disabled',
      };
    }

    // 计算缓存 key
    const cacheKey = this.computeCacheKey(agentDefect.description, groundTruthDetail);

    // 检查缓存
    if (this.config.enableCache) {
      await this.loadCacheIfNeeded();
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 调用 HTTP Judge
    try {
      const result = await this.callHttpJudge({
        agentDefect: agentDefect.description,
        groundTruthDefect: groundTruthDetail,
        context,
      });

      // 保存到缓存
      if (this.config.enableCache) {
        this.cache.set(cacheKey, result);
        await this.saveCache();
      }

      return result;
    } catch (error) {
      return {
        verdict: 'error',
        confidence: 0,
        rationale: `Judge error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 判定用例的所有缺陷详情
   */
  async judgeCaseDetails(
    caseId: string,
    agentName: string,
    agentDefects: DetectedDefect[],
    groundTruth: GroundTruth,
    context?: { prompt: string; accessUrl: string }
  ): Promise<CaseDetailJudgeSummary> {
    const detailResults: DetailJudgeResult[] = [];
    let matchCount = 0;
    let partialCount = 0;
    let mismatchCount = 0;
    let unknownCount = 0;
    let errorCount = 0;

    // 对每个 Agent 检测到的缺陷，尝试与 Ground Truth 详情匹配
    for (const agentDefect of agentDefects) {
      // 尝试找到最佳匹配的 Ground Truth 详情
      let bestResult: DetailJudgeResult = {
        verdict: 'mismatch',
        confidence: 0,
        rationale: 'No matching ground truth detail found',
      };

      for (const gtDetail of groundTruth.defect_details) {
        const result = await this.judgeDetail(agentDefect, gtDetail, {
          caseId,
          prompt: context?.prompt || '',
          accessUrl: context?.accessUrl || '',
        });

        // 如果找到更好的匹配，更新结果
        if (this.isResultBetter(result, bestResult)) {
          bestResult = result;
        }
      }

      detailResults.push(bestResult);

      // 统计
      switch (bestResult.verdict) {
        case 'match':
          matchCount++;
          break;
        case 'partial':
          partialCount++;
          break;
        case 'mismatch':
          mismatchCount++;
          break;
        case 'unknown':
          unknownCount++;
          break;
        case 'error':
          errorCount++;
          break;
      }
    }

    const total = detailResults.length;
    const detailAccuracy = total > 0 ? matchCount / total : 0;

    return {
      caseId,
      agentName,
      detailResults,
      matchCount,
      partialCount,
      mismatchCount,
      unknownCount,
      errorCount,
      detailAccuracy,
    };
  }

  /**
   * 调用 HTTP Judge API
   */
  private async callHttpJudge(request: HttpJudgeRequest): Promise<DetailJudgeResult> {
    if (!this.config.httpUrl) {
      throw new Error('HTTP Judge URL is not configured');
    }

    const response = await fetch(this.config.httpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP Judge returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as HttpJudgeResponse;

    return {
      verdict: data.verdict,
      confidence: data.confidence,
      rationale: data.rationale,
      rawResponse: data,
    };
  }

  /**
   * 计算缓存 key（基于输入的 hash）
   */
  private computeCacheKey(agentDescription: string, groundTruthDetail: string): string {
    const input = JSON.stringify({ agentDescription, groundTruthDetail });
    return createHash('sha256').update(input).digest('hex').slice(0, 16);
  }

  /**
   * 加载缓存
   */
  private async loadCacheIfNeeded(): Promise<void> {
    if (this.cacheLoaded || !this.cacheFile) return;

    try {
      const content = await readFile(this.cacheFile, 'utf-8');
      const entries = JSON.parse(content) as CacheEntry[];
      for (const entry of entries) {
        this.cache.set(entry.hash, entry.result);
      }
    } catch {
      // 缓存文件不存在或无效，忽略
    }

    this.cacheLoaded = true;
  }

  /**
   * 保存缓存
   */
  private async saveCache(): Promise<void> {
    if (!this.cacheFile) return;

    const entries: CacheEntry[] = [];
    for (const [hash, result] of this.cache) {
      entries.push({
        hash,
        result,
        timestamp: new Date().toISOString(),
      });
    }

    await writeFile(this.cacheFile, JSON.stringify(entries, null, 2), 'utf-8');
  }

  /**
   * 比较两个判定结果，返回第一个是否更好
   */
  private isResultBetter(a: DetailJudgeResult, b: DetailJudgeResult): boolean {
    const priority: Record<JudgeVerdict, number> = {
      match: 4,
      partial: 3,
      mismatch: 2,
      unknown: 1,
      error: 0,
    };

    if (priority[a.verdict] !== priority[b.verdict]) {
      return priority[a.verdict] > priority[b.verdict];
    }

    return a.confidence > b.confidence;
  }
}

/**
 * 创建 Detail Judge 实例
 */
export function createDetailJudge(config: JudgeConfig): DetailJudge {
  return new DetailJudge(config);
}
