// src/execution/logging/consoleLogger.ts - 控制台日志同步到文件

import { createWriteStream, type WriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

/**
 * 控制台日志记录器 - 同时输出到终端和文件
 */
export class ConsoleLogger {
  private stream: WriteStream | null = null;
  private buffer: string[] = [];
  private initialized = false;
  private readonly logFilePath: string;
  private readonly originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
  };

  constructor(runDir: string, filename = 'console.log') {
    this.logFilePath = join(runDir, filename);
    // 保存原始的 console 方法
    this.originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    };
  }

  /**
   * 初始化日志文件
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    await mkdir(dirname(this.logFilePath), { recursive: true });
    this.stream = createWriteStream(this.logFilePath, { flags: 'a', encoding: 'utf8' });
    this.initialized = true;

    // 写入缓冲的日志
    for (const line of this.buffer) {
      this.writeLine(line);
    }
    this.buffer = [];
  }

  /**
   * 写入一行日志
   */
  private writeLine(line: string): void {
    if (this.stream && this.initialized) {
      this.stream.write(line + '\n');
    } else {
      this.buffer.push(line);
    }
  }

  /**
   * 格式化参数为字符串
   */
  private formatArgs(...args: unknown[]): string {
    return args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (arg instanceof Error) return arg.stack || arg.message;
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      })
      .join(' ');
  }

  /**
   * 拦截 console 方法
   */
  intercept(): void {
    const self = this;

    console.log = function (...args: unknown[]) {
      const message = self.formatArgs(...args);
      self.originalConsole.log(...args);
      self.writeLine(`[LOG] ${message}`);
    };

    console.info = function (...args: unknown[]) {
      const message = self.formatArgs(...args);
      self.originalConsole.info(...args);
      self.writeLine(`[INFO] ${message}`);
    };

    console.warn = function (...args: unknown[]) {
      const message = self.formatArgs(...args);
      self.originalConsole.warn(...args);
      self.writeLine(`[WARN] ${message}`);
    };

    console.error = function (...args: unknown[]) {
      const message = self.formatArgs(...args);
      self.originalConsole.error(...args);
      self.writeLine(`[ERROR] ${message}`);
    };
  }

  /**
   * 恢复原始的 console 方法
   */
  restore(): void {
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
  }

  /**
   * 关闭日志流
   */
  async close(): Promise<void> {
    this.restore();
    return new Promise((resolve) => {
      if (this.stream) {
        this.stream.end(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
