// src/execution/appManager/portAllocator.ts - 端口分配与冲突检测 (T025)

import getPort from 'get-port';

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
