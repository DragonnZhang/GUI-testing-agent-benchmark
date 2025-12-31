// src/shared/errors.ts - 框架统一错误定义

// ANSI 颜色代码（用于终端输出）
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

/**
 * 框架基础错误类
 */
export class BenchmarkError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
    public readonly suggestion?: string
  ) {
    super(message);
    this.name = 'BenchmarkError';
  }

  /**
   * 获取格式化的错误输出（带颜色）
   */
  toColoredString(): string {
    const lines: string[] = [];
    lines.push(`${colors.red}${colors.bold}✖ Error [${this.code}]${colors.reset}`);
    lines.push(`  ${this.message}`);

    if (this.context && Object.keys(this.context).length > 0) {
      lines.push(`${colors.gray}  Context:${colors.reset}`);
      for (const [key, value] of Object.entries(this.context)) {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        // 处理多行值
        if (valueStr.includes('\n')) {
          lines.push(`    ${colors.cyan}${key}:${colors.reset}`);
          for (const line of valueStr.split('\n')) {
            lines.push(`      ${colors.gray}${line}${colors.reset}`);
          }
        } else {
          lines.push(`    ${colors.cyan}${key}:${colors.reset} ${valueStr}`);
        }
      }
    }

    if (this.suggestion) {
      lines.push(`${colors.yellow}  💡 Suggestion: ${this.suggestion}${colors.reset}`);
    }

    return lines.join('\n');
  }

  /**
   * 获取格式化的错误输出（无颜色，用于日志文件）
   */
  toPlainString(): string {
    const lines: string[] = [];
    lines.push(`✖ Error [${this.code}]`);
    lines.push(`  ${this.message}`);

    if (this.context && Object.keys(this.context).length > 0) {
      lines.push(`  Context:`);
      for (const [key, value] of Object.entries(this.context)) {
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        lines.push(`    ${key}: ${valueStr}`);
      }
    }

    if (this.suggestion) {
      lines.push(`  💡 Suggestion: ${this.suggestion}`);
    }

    return lines.join('\n');
  }
}

/**
 * 配置/校验错误
 */
export class ConfigError extends BenchmarkError {
  constructor(message: string, context?: Record<string, unknown>, suggestion?: string) {
    super(
      message,
      'CONFIG_ERROR',
      context,
      suggestion ?? 'Check your configuration files for syntax errors or missing fields.'
    );
    this.name = 'ConfigError';
  }
}

/**
 * 数据加载错误（场景/用例）
 */
export class DataLoadError extends BenchmarkError {
  constructor(message: string, context?: Record<string, unknown>, suggestion?: string) {
    super(
      message,
      'DATA_LOAD_ERROR',
      context,
      suggestion ?? 'Verify that the data files exist and contain valid JSON.'
    );
    this.name = 'DataLoadError';
  }
}

/**
 * Agent 执行错误
 */
export class AgentExecutionError extends BenchmarkError {
  constructor(message: string, context?: Record<string, unknown>, suggestion?: string) {
    super(
      message,
      'AGENT_EXECUTION_ERROR',
      context,
      suggestion ?? 'Check the agent implementation or increase the timeout.'
    );
    this.name = 'AgentExecutionError';
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends BenchmarkError {
  constructor(message: string, context?: Record<string, unknown>, suggestion?: string) {
    super(
      message,
      'TIMEOUT_ERROR',
      context,
      suggestion ?? 'Increase the timeout value with --timeout option.'
    );
    this.name = 'TimeoutError';
  }
}

/**
 * 被测应用启动/管理错误
 */
export class AppManagerError extends BenchmarkError {
  constructor(message: string, context?: Record<string, unknown>, suggestion?: string) {
    super(
      message,
      'APP_MANAGER_ERROR',
      context,
      suggestion ??
        'Ensure the application can be started manually and all dependencies are installed.'
    );
    this.name = 'AppManagerError';
  }
}

/**
 * Agent 注册错误
 */
export class AgentRegistryError extends BenchmarkError {
  constructor(message: string, context?: Record<string, unknown>, suggestion?: string) {
    super(
      message,
      'AGENT_REGISTRY_ERROR',
      context,
      suggestion ?? 'Check that the agent is registered correctly with registerAgent().'
    );
    this.name = 'AgentRegistryError';
  }
}

/**
 * 格式化错误信息，包含上下文（简单版本）
 */
export function formatError(error: unknown): string {
  if (error instanceof BenchmarkError) {
    const ctx = error.context ? ` | context: ${JSON.stringify(error.context)}` : '';
    return `[${error.code}] ${error.message}${ctx}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * 打印错误到控制台（带颜色和格式）
 */
export function printError(error: unknown, options: { showStack?: boolean } = {}): void {
  if (error instanceof BenchmarkError) {
    console.error(error.toColoredString());
    if (options.showStack && error.stack) {
      console.error(`${colors.gray}${error.stack}${colors.reset}`);
    }
  } else if (error instanceof Error) {
    console.error(`${colors.red}${colors.bold}✖ Error${colors.reset}`);
    console.error(`  ${error.message}`);
    if (options.showStack && error.stack) {
      console.error(`${colors.gray}${error.stack}${colors.reset}`);
    }
  } else {
    console.error(`${colors.red}${colors.bold}✖ Error${colors.reset}`);
    console.error(`  ${String(error)}`);
  }
}

/**
 * 打印警告到控制台
 */
export function printWarning(message: string, context?: Record<string, unknown>): void {
  console.warn(`${colors.yellow}⚠ Warning:${colors.reset} ${message}`);
  if (context) {
    for (const [key, value] of Object.entries(context)) {
      console.warn(`  ${colors.cyan}${key}:${colors.reset} ${JSON.stringify(value)}`);
    }
  }
}

/**
 * 打印成功消息到控制台
 */
export function printSuccess(message: string): void {
  console.log(`${colors.cyan}✔${colors.reset} ${message}`);
}

/**
 * 打印信息到控制台
 */
export function printInfo(message: string): void {
  console.log(`${colors.gray}ℹ${colors.reset} ${message}`);
}

/**
 * 从 Zod 错误中提取人类可读的错误信息
 */
export function formatZodError(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error) {
    const issues = (error as { issues: Array<{ path: (string | number)[]; message: string }> })
      .issues;
    return issues
      .map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join('\n');
  }
  return String(error);
}
