// src/cli/commands/run.ts - run 命令实现 (T022, T027, T028, T029, T030, T031, T033)

import { resolve } from 'node:path';
import { loadScenes, loadTestCases, parseRunConfig, validateCasesSceneRefs } from '../../config/load.js';
import type { Scene, TestCase, RunConfig } from '../../config/schema.js';
import { agentRegistry } from '../../execution/agent/registry.js';
import { registerBuiltinAgents } from '../../execution/agent/builtins/index.js';
import { runEngine, type RunTask } from '../../execution/runner/runEngine.js';
import { RunLogger } from '../../execution/logging/runLogger.js';
import { ArtifactsManager } from '../../execution/logging/artifacts.js';
import { scoreCases } from '../../evaluation/scoring/binaryScorer.js';
import { generateMetricsSummary } from '../../evaluation/scoring/metrics.js';
import { generateMultiAgentReport } from '../../evaluation/compare/multiAgentReport.js';
import { renderHtmlReport } from '../../visualization/html/render.js';
import { generateRunId } from '../../shared/id.js';
import { PortManager, forceReleasePort } from '../../execution/appManager/portAllocator.js';
import { ReactDevServerManager } from '../../execution/appManager/reactDevServer.js';
import { groupCasesByScene } from '../../data/testCases.js';
import { findSceneById } from '../../data/scenes.js';

/**
 * CLI run 命令选项
 */
export interface RunCommandOptions {
  scenes: string;
  cases: string;
  output: string;
  agents: string;
  concurrency: string;
  timeout: string;
  filterCases?: string;
  listAgents?: boolean;
}

/**
 * 设置进程信号处理，确保退出时清理资源
 */
function setupCleanupHandlers(
  devServerManager: ReactDevServerManager,
  portManager: PortManager
): () => void {
  let cleanupInProgress = false;

  const cleanup = async () => {
    if (cleanupInProgress) return;
    cleanupInProgress = true;

    console.log('\n\n⚠️ Interrupt received, cleaning up...');

    try {
      await devServerManager.stopAll();
      portManager.releaseAll();
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }

    process.exit(1);
  };

  // 处理各种退出信号
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGHUP', cleanup);

  // 处理未捕获的异常
  process.on('uncaughtException', async (error) => {
    console.error('\n❌ Uncaught exception:', error);
    await cleanup();
  });

  process.on('unhandledRejection', async (reason) => {
    console.error('\n❌ Unhandled rejection:', reason);
    await cleanup();
  });

  // 返回清理函数，用于移除监听器
  return () => {
    process.removeListener('SIGINT', cleanup);
    process.removeListener('SIGTERM', cleanup);
    process.removeListener('SIGHUP', cleanup);
  };
}

/**
 * CLI run 命令选项
 */
export interface RunCommandOptions {
  scenes: string;
  cases: string;
  output: string;
  agents: string;
  concurrency: string;
  timeout: string;
  filterCases?: string;
  listAgents?: boolean;
}

/**
 * run 命令入口
 */
export async function runCommand(options: RunCommandOptions): Promise<void> {
  // 注册内置 Agents
  registerBuiltinAgents();

  // 处理 --list-agents
  if (options.listAgents) {
    console.log('\nAvailable agents:');
    for (const meta of agentRegistry.listMeta()) {
      console.log(`  ${meta.name} (v${meta.version})`);
      if (meta.description) {
        console.log(`    ${meta.description}`);
      }
    }
    return;
  }

  // 解析配置
  const config = parseRunConfig({
    scenesPath: options.scenes,
    casesPath: options.cases,
    outputDir: options.output,
    agents: options.agents.split(',').map((a) => a.trim()),
    concurrency: parseInt(options.concurrency, 10),
    timeout: parseInt(options.timeout, 10),
  });

  console.log('\n🚀 UI Testing Agent Benchmark');
  console.log('================================');
  console.log(`Scenes: ${config.scenesPath}`);
  console.log(`Cases: ${config.casesPath}`);
  console.log(`Agents: ${config.agents.join(', ')}`);
  console.log(`Concurrency: ${config.concurrency}`);
  console.log(`Timeout: ${config.timeout}ms`);
  console.log('');

  // 加载场景和用例
  const scenes = await loadScenes(resolve(config.scenesPath));
  let testCases = await loadTestCases(resolve(config.casesPath));

  // 处理 --filter-cases 选项 (T053)
  if (options.filterCases) {
    const filterIds = new Set(options.filterCases.split(',').map((id) => id.trim()));
    const originalCount = testCases.length;
    testCases = testCases.filter((tc) => filterIds.has(tc.case_id));
    console.log(`🔍 Filtered to ${testCases.length} case(s) from ${originalCount} (--filter-cases)`);

    if (testCases.length === 0) {
      console.error('❌ No test cases matched the filter');
      process.exit(1);
    }
  }

  // 校验用例与场景关联
  validateCasesSceneRefs(testCases, scenes);

  console.log(`📦 Loaded ${scenes.length} scene(s), ${testCases.length} test case(s)`);

  // 验证 Agents
  const agentNames = config.agents;
  const missingAgents = agentNames.filter((name) => !agentRegistry.has(name));
  if (missingAgents.length > 0) {
    console.error(`❌ Unknown agents: ${missingAgents.join(', ')}`);
    console.error(`   Available: ${agentRegistry.listNames().join(', ')}`);
    process.exit(1);
  }

  // 生成运行 ID
  const runId = generateRunId();
  console.log(`\n🏃 Run ID: ${runId}`);

  // 初始化产物管理器
  const artifacts = new ArtifactsManager(config.outputDir, runId);
  await artifacts.init();

  // 初始化日志器
  const logger = new RunLogger(artifacts.runDir);
  await logger.init();

  // 写入环境信息和配置
  await artifacts.writeEnv();
  const agentsMeta = agentNames.map((name) => agentRegistry.getRequired(name).meta);
  await artifacts.writeRunConfig(config, agentsMeta);

  // 管理 localProject 场景的 Dev Server
  const portManager = new PortManager();
  const devServerManager = new ReactDevServerManager();
  const sceneAccessUrls = new Map<string, string>();

  // 设置信号处理，确保异常退出时清理资源
  const removeCleanupHandlers = setupCleanupHandlers(devServerManager, portManager);

  try {
    // 启动需要的 Dev Server (T027)
    await startLocalProjectServers(scenes, testCases, portManager, devServerManager, sceneAccessUrls, logger);

    // 设置已有的 baseUrl 场景
    for (const scene of scenes) {
      if (scene.source.type === 'baseUrl' && !sceneAccessUrls.has(scene.scene_id)) {
        sceneAccessUrls.set(scene.scene_id, scene.source.baseUrl);
      }
    }

    // 构建任务列表 (T028)
    const tasks = buildRunTasks(testCases, scenes, agentNames, sceneAccessUrls, runId, config.timeout);

    console.log(`\n📋 Executing ${tasks.length} task(s)...`);

    // 执行批量测试
    const results = await runEngine(tasks, {
      concurrency: config.concurrency,
      runId,
      logger,
    });

    // 写入结果 (T029)
    await artifacts.writeRawResults(results);
    await artifacts.writeNormalizedResults(results);

    // 计算判分 (T030)
    const scores = scoreCases(results, testCases);
    await artifacts.writeScore(scores);

    // 生成指标汇总
    const metrics = generateMetricsSummary(scores, runId);
    await artifacts.writeMetrics(metrics);

    // 生成多 Agent 对比报告 (T031)
    const multiAgentReport = generateMultiAgentReport(scores, metrics);

    // 生成 HTML 报告 (T032, T033, T052)
    const htmlReport = renderHtmlReport({
      runId,
      metrics,
      scores,
      multiAgentReport,
      testCases,
      normalizedResults: results,
    });
    await artifacts.writeReport(htmlReport);

    // 关闭日志
    await logger.close();

    // 输出汇总
    console.log('\n📊 Results Summary:');
    console.log('-------------------');
    for (const agentMetrics of metrics.byAgent) {
      console.log(`\n${agentMetrics.agentName}:`);
      console.log(`  Precision: ${(agentMetrics.precision * 100).toFixed(1)}%`);
      console.log(`  Recall:    ${(agentMetrics.recall * 100).toFixed(1)}%`);
      console.log(`  F1:        ${(agentMetrics.f1 * 100).toFixed(1)}%`);
      console.log(`  Miss Rate: ${(agentMetrics.missRate * 100).toFixed(1)}%`);
      console.log(`  Accuracy:  ${(agentMetrics.accuracy * 100).toFixed(1)}%`);
    }

    console.log(`\n✅ Run completed! Output: ${artifacts.runDir}`);
    console.log(`   📄 Report: ${artifacts.runDir}/report.html`);
  } finally {
    // 清理 Dev Server 和端口
    await devServerManager.stopAll();
    portManager.releaseAll();

    // 移除信号处理器
    removeCleanupHandlers();
  }
}

/**
 * 启动 localProject 类型的场景 Dev Server
 */
async function startLocalProjectServers(
  scenes: Scene[],
  testCases: TestCase[],
  portManager: PortManager,
  devServerManager: ReactDevServerManager,
  sceneAccessUrls: Map<string, string>,
  logger: RunLogger
): Promise<void> {
  const casesByScene = groupCasesByScene(testCases);

  for (const sceneId of casesByScene.keys()) {
    const scene = findSceneById(scenes, sceneId);
    if (!scene) continue;

    if (scene.source.type === 'localProject') {
      console.log(`\n🔧 Starting dev server for scene: ${scene.name}`);

      // 分配端口
      const port = await portManager.allocateForScene(sceneId);

      logger.info('devserver.start', {
        sceneId,
        projectPath: scene.source.projectPath,
        port,
      });

      try {
        const instance = await devServerManager.start(sceneId, {
          projectPath: scene.source.projectPath,
          port,
          installCommand: scene.source.installCommand,
          devCommand: scene.source.devCommand,
          readyTimeout: scene.source.readyTimeout,
        });

        sceneAccessUrls.set(sceneId, instance.url);

        logger.info('devserver.ready', {
          sceneId,
          url: instance.url,
        });

        console.log(`   ✅ Ready at ${instance.url}`);
      } catch (error) {
        logger.error('devserver.error', {
          sceneId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }
  }
}

/**
 * 构建运行任务列表 (T036: 支持 Agent 级别超时)
 */
function buildRunTasks(
  testCases: TestCase[],
  scenes: Scene[],
  agentNames: string[],
  sceneAccessUrls: Map<string, string>,
  runId: string,
  defaultTimeout: number
): RunTask[] {
  const tasks: RunTask[] = [];

  for (const testCase of testCases) {
    const scene = findSceneById(scenes, testCase.ui_scene_id);
    if (!scene) continue;

    // 获取基础 URL
    let baseUrl = sceneAccessUrls.get(scene.scene_id);
    if (!baseUrl && scene.source.type === 'baseUrl') {
      baseUrl = scene.source.baseUrl;
    }
    if (!baseUrl) {
      console.warn(`⚠️ No access URL for scene ${scene.scene_id}, skipping case ${testCase.case_id}`);
      continue;
    }

    // 使用测试用例指定的路由路径
    const routePath = testCase.route_path || '/';
    const accessUrl = combineUrl(baseUrl, routePath);

    // 为每个 Agent 创建任务
    for (const agentName of agentNames) {
      const agent = agentRegistry.getRequired(agentName);
      // 使用 Agent 级别的超时配置，如果没有则使用默认值 (T036)
      const agentTimeout = agentRegistry.getAgentTimeout(agentName, defaultTimeout);
      tasks.push({
        testCase,
        agent,
        accessUrl,
        runId,
        timeoutMs: agentTimeout,
      });
    }
  }

  return tasks;
}

/**
 * 组合 URL
 */
function combineUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
