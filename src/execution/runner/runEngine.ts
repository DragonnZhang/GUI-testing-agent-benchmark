// src/execution/runner/runEngine.ts - 批量调度引擎（失败隔离、可重复顺序）

import type { TestCase } from '../../config/schema.js';
import type { AgentAdapter } from '../agent/adapter.js';
import type { AgentContext, AgentResult, CaseExecutionResult } from '../agent/types.js';
import { RunLogger } from '../logging/runLogger.js';
import { withTimeout, runWithConcurrencyIsolated } from './timeouts.js';
import { timer } from '../../shared/time.js';
import { nowISO } from '../../shared/time.js';
import { formatError } from '../../shared/errors.js';

export interface RunTask {
  testCase: TestCase;
  agent: AgentAdapter;
  accessUrl: string;
  runId: string;
  timeoutMs: number;
}

/**
 * 执行单个任务
 */
async function executeTask(task: RunTask, logger: RunLogger): Promise<CaseExecutionResult> {
  const { testCase, agent, accessUrl, runId, timeoutMs } = task;
  const agentName = agent.meta.name;
  const startedAt = nowISO();
  const stopTimer = timer();

  logger.info('task.start', {
    caseId: testCase.case_id,
    agent: agentName,
    accessUrl,
  });

  const ctx: AgentContext = {
    accessUrl,
    prompt: testCase.prompt,
    meta: {
      caseId: testCase.case_id,
      sceneId: testCase.ui_scene_id,
      runId,
      timeoutMs,
    },
  };

  let result: AgentResult;
  let success = true;

  try {
    result = await withTimeout(
      agent.runCase(ctx),
      timeoutMs,
      `Agent "${agentName}" timed out for case "${testCase.case_id}"`
    );
  } catch (error) {
    success = false;
    result = {
      hasDefect: false,
      defects: [],
      rawOutput: null,
      errors: [
        { message: formatError(error), stack: error instanceof Error ? error.stack : undefined },
      ],
    };

    logger.error('task.error', {
      caseId: testCase.case_id,
      agent: agentName,
      error: formatError(error),
    });
  }

  const durationMs = stopTimer();
  const finishedAt = nowISO();

  logger.info('task.complete', {
    caseId: testCase.case_id,
    agent: agentName,
    success,
    durationMs,
    hasDefect: result.hasDefect,
  });

  return {
    caseId: testCase.case_id,
    sceneId: testCase.ui_scene_id,
    agentName,
    result,
    durationMs,
    startedAt,
    finishedAt,
    success,
  };
}

export interface RunEngineOptions {
  concurrency: number;
  runId: string;
  logger: RunLogger;
}

/**
 * 批量执行引擎
 */
export async function runEngine(
  tasks: RunTask[],
  options: RunEngineOptions
): Promise<CaseExecutionResult[]> {
  const { concurrency, logger } = options;

  logger.info('engine.start', {
    totalTasks: tasks.length,
    concurrency,
  });

  // 确保执行顺序可重复：按 caseId + agentName 排序
  const sortedTasks = [...tasks].sort((a, b) => {
    const aKey = `${a.testCase.case_id}:${a.agent.meta.name}`;
    const bKey = `${b.testCase.case_id}:${b.agent.meta.name}`;
    return aKey.localeCompare(bKey);
  });

  const results = await runWithConcurrencyIsolated(sortedTasks, concurrency, async (task) => {
    return executeTask(task, logger);
  });

  // 提取结果（无论成功失败都有 CaseExecutionResult）
  const execResults: CaseExecutionResult[] = results.map((r, i) => {
    if (r.success) {
      return r.value;
    }
    // 不应该走到这里，因为 executeTask 内部已经捕获了错误
    const task = sortedTasks[i];
    return {
      caseId: task.testCase.case_id,
      sceneId: task.testCase.ui_scene_id,
      agentName: task.agent.meta.name,
      result: {
        hasDefect: false,
        defects: [],
        rawOutput: null,
        errors: [{ message: formatError(r.error) }],
      },
      durationMs: 0,
      startedAt: nowISO(),
      finishedAt: nowISO(),
      success: false,
    };
  });

  logger.info('engine.complete', {
    totalTasks: tasks.length,
    successCount: execResults.filter((r) => r.success).length,
    failCount: execResults.filter((r) => !r.success).length,
  });

  return execResults;
}
