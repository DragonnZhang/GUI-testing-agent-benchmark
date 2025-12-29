// src/shared/id.ts - ID 生成工具

import { randomBytes } from 'node:crypto';

/**
 * 生成运行 ID，格式：YYYY-MM-DDTHH-mm-ss_<random>
 * 例如：2025-12-29T21-30-45_a1b2c3
 */
export function generateRunId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 19).replace(/:/g, '-');
  const randomPart = randomBytes(3).toString('hex');
  return `${datePart}_${randomPart}`;
}

/**
 * 生成短随机 ID
 */
export function shortId(bytes = 4): string {
  return randomBytes(bytes).toString('hex');
}
