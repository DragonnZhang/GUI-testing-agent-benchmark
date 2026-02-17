// src/evaluation/scoring/binaryScorer.ts - 用例级二分类判分（TP/FP/FN/TN）

import type { TestCase } from '../../config/schema.js';
import type { CaseExecutionResult } from '../../execution/agent/types.js';

/**
 * 判分结果类型
 */
export type ScoreLabel = 'TP' | 'FP' | 'FN' | 'TN' | 'ERROR';

/**
 * 单用例判分结果
 */
export interface ScoreResult {
  caseId: string;
  sceneId: string;
  agentName: string;

  /** 真实标签：是否有缺陷 */
  groundTruthHasDefect: boolean;

  /** Agent 预测：是否有缺陷 */
  predictedHasDefect: boolean;

  /** 判分标签 */
  label: ScoreLabel;

  /** Agent 是否执行成功 */
  executionSuccess: boolean;
}

/**
 * 对单个执行结果进行判分
 */
export function scoreCase(execResult: CaseExecutionResult, testCase: TestCase): ScoreResult {
  const groundTruthHasDefect = testCase.ground_truth.has_defect;
  let predictedHasDefect = execResult.result.hasDefect;
  const executionSuccess = execResult.success;

  // 对于 MidsceneAgent 和带记忆的 MidsceneAgent，如果有 LLM 评估结果，使用 LLM 的判断来确定 Agent 的预测准确性
  if (
    (execResult.agentName === 'midscene' || execResult.agentName === 'midscene-memory') &&
    execResult.result.rawOutput
  ) {
    const rawOutput = execResult.result.rawOutput as any;
    if (rawOutput?.llmEvaluation?.isAgentCorrect !== undefined) {
      // 如果 LLM 评估认为 Agent 判断正确，则使用 ground truth 作为预测结果
      // 如果 LLM 评估认为 Agent 判断错误，则使用与 ground truth 相反的结果作为预测
      predictedHasDefect = rawOutput.llmEvaluation.isAgentCorrect
        ? groundTruthHasDefect
        : !groundTruthHasDefect;
    }
  }

  let label: ScoreLabel;

  if (!executionSuccess) {
    // Agent 执行失败，标记为 ERROR
    label = 'ERROR';
  } else if (groundTruthHasDefect && predictedHasDefect) {
    // 真有缺陷 & 预测有缺陷 → True Positive
    label = 'TP';
  } else if (!groundTruthHasDefect && predictedHasDefect) {
    // 真无缺陷 & 预测有缺陷 → False Positive
    label = 'FP';
  } else if (groundTruthHasDefect && !predictedHasDefect) {
    // 真有缺陷 & 预测无缺陷 → False Negative（漏检）
    label = 'FN';
  } else {
    // 真无缺陷 & 预测无缺陷 → True Negative
    label = 'TN';
  }

  return {
    caseId: execResult.caseId,
    sceneId: execResult.sceneId,
    agentName: execResult.agentName,
    groundTruthHasDefect,
    predictedHasDefect,
    label,
    executionSuccess,
  };
}

/**
 * 批量判分
 */
export function scoreCases(
  execResults: CaseExecutionResult[],
  testCases: TestCase[]
): ScoreResult[] {
  const caseMap = new Map(testCases.map((c) => [c.case_id, c]));

  return execResults.map((execResult) => {
    const testCase = caseMap.get(execResult.caseId);
    if (!testCase) {
      // 用例不存在，标记为 ERROR
      return {
        caseId: execResult.caseId,
        sceneId: execResult.sceneId,
        agentName: execResult.agentName,
        groundTruthHasDefect: false,
        predictedHasDefect: execResult.result.hasDefect,
        label: 'ERROR' as const,
        executionSuccess: false,
      };
    }
    return scoreCase(execResult, testCase);
  });
}
