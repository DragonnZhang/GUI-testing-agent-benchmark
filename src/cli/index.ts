#!/usr/bin/env node
// src/cli/index.ts - CLI 入口与命令路由 (T021)

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { printError, BenchmarkError } from '../shared/errors.js';

// 获取 package.json 版本
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const program = new Command();

program
  .name('uibench')
  .description('UI Testing Agent Benchmark Framework')
  .version(packageJson.version);

// 包装命令处理函数以统一错误处理
function wrapAction<T extends unknown[]>(
  fn: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await fn(...args);
    } catch (error) {
      printError(error, { showStack: process.env.DEBUG === 'true' });
      process.exit(1);
    }
  };
}

// run 命令
program
  .command('run')
  .description('Execute benchmark tests with one or more agents')
  .option('-s, --scenes <path>', 'Path to scenes.json', 'data/ui-scenes/scenes.json')
  .option(
    '-c, --cases <path>',
    'Path to test-case-config.json',
    'data/test-cases/test-case-config.json'
  )
  .option('-o, --output <dir>', 'Output directory for runs', 'runs')
  .option('-a, --agents <names>', 'Comma-separated agent names', 'dummy')
  .option('-p, --concurrency <n>', 'Max parallel executions', '1')
  .option('-t, --timeout <ms>', 'Per-case timeout in milliseconds', '1200000')
  .option('--filter-cases <ids>', 'Comma-separated case IDs to run (for retry)')
  .option('--list-agents', 'List available agents and exit')
  .action(
    wrapAction(async (options) => {
      const { runCommand } = await import('./commands/run.js');
      await runCommand(options);
    })
  );

// eval 命令 (T042)
program
  .command('eval')
  .description('Re-evaluate existing run results')
  .argument('<runDir>', 'Path to the run directory')
  .option('-c, --cases <path>', 'Path to test-case-config.json (overrides run-config)')
  .action(
    wrapAction(async (runDir, options) => {
      const { evalCommand } = await import('./commands/eval.js');
      await evalCommand(runDir, options);
    })
  );

// report 命令 (T043)
program
  .command('report')
  .description('Regenerate HTML report from existing metrics')
  .argument('<runDir>', 'Path to the run directory')
  .option('-c, --cases <path>', 'Path to test-case-config.json (overrides run-config)')
  .action(
    wrapAction(async (runDir, options) => {
      const { reportCommand } = await import('./commands/report.js');
      await reportCommand(runDir, options);
    })
  );

// 解析命令行参数
program.parse();
