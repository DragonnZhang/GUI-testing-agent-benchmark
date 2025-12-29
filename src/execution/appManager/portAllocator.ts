// src/execution/appManager/portAllocator.ts - 端口分配与冲突检测 (T025)

import getPort from 'get-port';
import { execa } from 'execa';
import { createConnection } from 'node:net';
import { delay } from '../../shared/time.js';

/**
 * 已分配的端口记录（进程内全局）
 */
const allocatedPorts = new Set<number>();

/**
 * 默认端口范围
 */
const DEFAULT_PORT_RANGE = { min: 3000, max: 9000 };

/**
 * 端口分配选项
 */
export interface PortAllocateOptions {
  /** 首选端口（可选） */
  preferred?: number;

  /** 端口范围 */
  range?: { min: number; max: number };

  /** 要排除的端口 */
  exclude?: number[];
}

/**
 * 检查端口是否正在被使用
 *
 * @param port 端口号
 * @returns 是否被占用
 */
export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: 'localhost' });

    socket.once('connect', () => {
      socket.destroy();
      resolve(true); // 端口被占用
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false); // 端口未被占用
    });

    // 设置超时
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

/**
 * 获取占用指定端口的进程 PID（支持 macOS 和 Linux）
 *
 * @param port 端口号
 * @returns 进程 PID 列表
 */
export async function getProcessesByPort(port: number): Promise<number[]> {
  try {
    // 使用 lsof 命令查找占用端口的进程
    const { stdout } = await execa('lsof', ['-i', `:${port}`, '-t'], {
      reject: false,
    });

    if (!stdout.trim()) {
      return [];
    }

    return stdout
      .trim()
      .split('\n')
      .map((pid) => parseInt(pid, 10))
      .filter((pid) => !isNaN(pid));
  } catch {
    // lsof 可能不可用，尝试使用 netstat（Linux）
    try {
      const { stdout } = await execa('ss', ['-tlnp', `sport = :${port}`], {
        reject: false,
      });

      const pids: number[] = [];
      const pidRegex = /pid=(\d+)/g;
      let match;
      while ((match = pidRegex.exec(stdout)) !== null) {
        pids.push(parseInt(match[1], 10));
      }
      return pids;
    } catch {
      return [];
    }
  }
}

/**
 * 强制终止占用指定端口的进程
 *
 * @param port 端口号
 * @param signal 信号（默认 SIGTERM，可用 SIGKILL 强制杀死）
 * @returns 是否成功终止
 */
export async function killProcessOnPort(
  port: number,
  signal: 'SIGTERM' | 'SIGKILL' = 'SIGTERM'
): Promise<boolean> {
  const pids = await getProcessesByPort(port);

  if (pids.length === 0) {
    return false;
  }

  for (const pid of pids) {
    try {
      process.kill(pid, signal);
    } catch {
      // 进程可能已经退出
    }
  }

  return true;
}

/**
 * 强制释放端口（终止占用进程并等待端口释放）
 *
 * @param port 端口号
 * @param options 选项
 * @returns 是否成功释放
 */
export async function forceReleasePort(
  port: number,
  options: {
    /** 最大等待时间（毫秒） */
    timeout?: number;
    /** 检测间隔（毫秒） */
    pollInterval?: number;
    /** 是否使用 SIGKILL */
    forceKill?: boolean;
  } = {}
): Promise<boolean> {
  const { timeout = 10000, pollInterval = 500, forceKill = false } = options;

  // 首先检查端口是否被占用
  if (!(await isPortInUse(port))) {
    return true;
  }

  // 尝试终止进程
  const signal = forceKill ? 'SIGKILL' : 'SIGTERM';
  await killProcessOnPort(port, signal);

  // 等待端口释放
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (!(await isPortInUse(port))) {
      return true;
    }

    // 如果超过一半时间还没释放，使用 SIGKILL
    if (!forceKill && Date.now() - startTime > timeout / 2) {
      await killProcessOnPort(port, 'SIGKILL');
    }

    await delay(pollInterval);
  }

  return !(await isPortInUse(port));
}

/**
 * 等待端口就绪（可连接）
 *
 * @param port 端口号
 * @param timeout 超时时间（毫秒）
 * @param pollInterval 检测间隔（毫秒）
 * @returns 是否就绪
 */
export async function waitForPortReady(
  port: number,
  timeout: number = 60000,
  pollInterval: number = 500
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await isPortInUse(port)) {
      return true;
    }
    await delay(pollInterval);
  }

  return false;
}

/**
 * 分配一个可用端口
 *
 * @param options 分配选项
 * @returns 分配的端口号
 */
export async function allocatePort(options: PortAllocateOptions = {}): Promise<number> {
  const { preferred, range = DEFAULT_PORT_RANGE, exclude = [] } = options;

  // 合并已分配的端口和排除的端口
  const excludeSet = new Set([...allocatedPorts, ...exclude]);

  // 尝试获取端口
  const port = await getPort({
    port: preferred,
    exclude: Array.from(excludeSet),
    host: 'localhost',
  });

  // 验证端口在范围内
  if (port < range.min || port > range.max) {
    // 如果不在范围内，尝试在范围内找一个
    const portInRange = await getPort({
      port: getPortRange(range.min, range.max),
      exclude: Array.from(excludeSet),
      host: 'localhost',
    });
    allocatedPorts.add(portInRange);
    return portInRange;
  }

  allocatedPorts.add(port);
  return port;
}

/**
 * 释放一个端口（标记为可复用）
 */
export function releasePort(port: number): void {
  allocatedPorts.delete(port);
}

/**
 * 获取所有已分配的端口
 */
export function getAllocatedPorts(): number[] {
  return Array.from(allocatedPorts);
}

/**
 * 清空所有已分配端口记录
 */
export function clearAllocatedPorts(): void {
  allocatedPorts.clear();
}

/**
 * 检查端口是否已被分配
 */
export function isPortAllocated(port: number): boolean {
  return allocatedPorts.has(port);
}

/**
 * 生成端口范围数组（用于 get-port）
 */
function getPortRange(min: number, max: number): number[] {
  const ports: number[] = [];
  for (let p = min; p <= max; p++) {
    ports.push(p);
  }
  return ports;
}

/**
 * 端口管理器（面向对象封装，用于场景级管理）
 */
export class PortManager {
  private scenePorts = new Map<string, number>();

  /**
   * 为场景分配端口
   */
  async allocateForScene(sceneId: string, options?: PortAllocateOptions): Promise<number> {
    // 如果场景已有端口，返回已有的
    const existing = this.scenePorts.get(sceneId);
    if (existing !== undefined) {
      return existing;
    }

    const port = await allocatePort(options);
    this.scenePorts.set(sceneId, port);
    return port;
  }

  /**
   * 释放场景的端口
   */
  releaseForScene(sceneId: string): void {
    const port = this.scenePorts.get(sceneId);
    if (port !== undefined) {
      releasePort(port);
      this.scenePorts.delete(sceneId);
    }
  }

  /**
   * 获取场景的端口
   */
  getScenePort(sceneId: string): number | undefined {
    return this.scenePorts.get(sceneId);
  }

  /**
   * 释放所有场景端口
   */
  releaseAll(): void {
    for (const [sceneId] of this.scenePorts) {
      this.releaseForScene(sceneId);
    }
  }

  /**
   * 获取所有场景端口映射
   */
  getAllScenePorts(): Map<string, number> {
    return new Map(this.scenePorts);
  }
}
