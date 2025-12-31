// src/execution/logging/runLogger.ts - NDJSON 日志记录器

import { createWriteStream, type WriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { nowISO } from '../../shared/time.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
}

/**
 * NDJSON 格式的运行日志记录器
 */
export class RunLogger {
  private stream: WriteStream | null = null;
  private buffer: LogEntry[] = [];
  private initialized = false;
  private readonly logFilePath: string;

  /**
   * @param runDirOrLogPath 运行目录或日志文件完整路径
   * @param isDirectory 如果为 true，则 runDirOrLogPath 是目录，日志文件名为 events.ndjson
   */
  constructor(runDirOrLogPath: string, isDirectory = true) {
    this.logFilePath = isDirectory ? join(runDirOrLogPath, 'events.ndjson') : runDirOrLogPath;
  }

  /**
   * 初始化日志文件
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    await mkdir(dirname(this.logFilePath), { recursive: true });
    this.stream = createWriteStream(this.logFilePath, { flags: 'a' });
    this.initialized = true;

    // 写入缓冲的日志
    for (const entry of this.buffer) {
      this.writeEntry(entry);
    }
    this.buffer = [];
  }

  /**
   * 记录日志
   */
  log(level: LogLevel, event: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: nowISO(),
      level,
      event,
      data,
    };

    if (!this.initialized) {
      this.buffer.push(entry);
      return;
    }

    this.writeEntry(entry);
  }

  debug(event: string, data?: Record<string, unknown>): void {
    this.log('debug', event, data);
  }

  info(event: string, data?: Record<string, unknown>): void {
    this.log('info', event, data);
  }

  warn(event: string, data?: Record<string, unknown>): void {
    this.log('warn', event, data);
  }

  error(event: string, data?: Record<string, unknown>): void {
    this.log('error', event, data);
  }

  private writeEntry(entry: LogEntry): void {
    if (this.stream) {
      this.stream.write(JSON.stringify(entry) + '\n');
    }
  }

  /**
   * 关闭日志流
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.stream) {
        this.stream.end(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
