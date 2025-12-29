// src/shared/time.ts - 时间工具

/**
 * 返回当前 ISO 时间戳
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * 计算耗时（毫秒）
 */
export function elapsedMs(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * 创建一个计时器，返回 stop 函数获取耗时
 */
export function timer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}

/**
 * 延迟指定毫秒
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
