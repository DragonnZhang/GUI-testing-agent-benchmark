// src/execution/appManager/reactDevServer.ts - React dev server 生命周期管理 (T026)

import { execa, type ResultPromise } from 'execa';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { AppManagerError } from '../../shared/errors.js';
import { delay } from '../../shared/time.js';

/**
 * Dev Server 配置
 */
export interface DevServerConfig {
  /** 项目路径 */
  projectPath: string;

  /** 分配的端口 */
  port: number;

  /** 安装命令 */
  installCommand?: string;

  /** 启动命令 */
  devCommand?: string;

  /** 就绪检测超时（毫秒） */
  readyTimeout?: number;

  /** 就绪检测间隔（毫秒） */
  readyPollInterval?: number;
}

/**
 * Dev Server 实例信息
 */
export interface DevServerInstance {
  sceneId: string;
  projectPath: string;
  port: number;
  url: string;
  process: ResultPromise | null;
  status: 'starting' | 'ready' | 'stopped' | 'error';
  error?: string;
}

/**
 * React Dev Server 管理器
 */
export class ReactDevServerManager {
  private servers = new Map<string, DevServerInstance>();
  private defaultReadyTimeout = 60000;
  private defaultReadyPollInterval = 500;

  /**
   * 启动 Dev Server
   */
  async start(sceneId: string, config: DevServerConfig): Promise<DevServerInstance> {
    const {
      projectPath,
      port,
      installCommand = 'npm install',
      devCommand = 'npm run dev',
      readyTimeout = this.defaultReadyTimeout,
      readyPollInterval = this.defaultReadyPollInterval,
    } = config;

    // 检查项目路径是否存在
    const absPath = resolve(projectPath);
    if (!existsSync(absPath)) {
      throw new AppManagerError(`Project path does not exist: ${absPath}`);
    }

    // 检查 package.json 是否存在
    const packageJsonPath = join(absPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      throw new AppManagerError(`No package.json found in: ${absPath}`);
    }

    // 创建实例记录
    const instance: DevServerInstance = {
      sceneId,
      projectPath: absPath,
      port,
      url: `http://localhost:${port}`,
      process: null,
      status: 'starting',
    };

    this.servers.set(sceneId, instance);

    try {
      // 执行安装命令（如果需要）
      if (installCommand) {
        await this.runInstall(absPath, installCommand);
      }

      // 启动 dev server
      const serverProcess = this.startDevProcess(absPath, devCommand, port);
      instance.process = serverProcess;

      // 等待服务就绪
      await this.waitForReady(instance.url, readyTimeout, readyPollInterval);

      instance.status = 'ready';
      return instance;
    } catch (error) {
      instance.status = 'error';
      instance.error = error instanceof Error ? error.message : String(error);
      // 尝试清理进程
      if (instance.process) {
        instance.process.kill('SIGTERM');
      }
      throw error;
    }
  }

  /**
   * 停止 Dev Server
   */
  async stop(sceneId: string): Promise<void> {
    const instance = this.servers.get(sceneId);
    if (!instance) {
      return;
    }

    if (instance.process) {
      // 发送 SIGTERM 信号
      instance.process.kill('SIGTERM');

      // 等待进程结束（最多 5 秒）
      try {
        await Promise.race([
          instance.process,
          delay(5000).then(() => {
            // 强制杀死
            instance.process?.kill('SIGKILL');
          }),
        ]);
      } catch {
        // 忽略进程退出错误
      }
    }

    instance.status = 'stopped';
    this.servers.delete(sceneId);
  }

  /**
   * 停止所有 Dev Server
   */
  async stopAll(): Promise<void> {
    const sceneIds = Array.from(this.servers.keys());
    await Promise.all(sceneIds.map((id) => this.stop(id)));
  }

  /**
   * 获取 Dev Server 实例
   */
  getInstance(sceneId: string): DevServerInstance | undefined {
    return this.servers.get(sceneId);
  }

  /**
   * 获取所有运行中的 Dev Server
   */
  getRunningServers(): DevServerInstance[] {
    return Array.from(this.servers.values()).filter((s) => s.status === 'ready');
  }

  /**
   * 执行安装命令
   */
  private async runInstall(projectPath: string, installCommand: string): Promise<void> {
    const [cmd, ...args] = installCommand.split(' ');
    try {
      await execa(cmd, args, {
        cwd: projectPath,
        stdio: 'pipe',
        timeout: 300000, // 5 分钟超时
      });
    } catch (error) {
      throw new AppManagerError(`Install failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 启动 Dev Server 进程
   */
  private startDevProcess(projectPath: string, devCommand: string, port: number): ResultPromise {
    const [cmd, ...args] = devCommand.split(' ');

    // 设置端口环境变量（支持 Vite、CRA 等）
    const env = {
      ...process.env,
      PORT: String(port),
      VITE_PORT: String(port),
      BROWSER: 'none', // 禁止自动打开浏览器
    };

    const childProcess = execa(cmd, args, {
      cwd: projectPath,
      env,
      stdio: 'pipe',
      detached: false,
    });

    return childProcess;
  }

  /**
   * 等待服务就绪
   */
  private async waitForReady(url: string, timeout: number, interval: number): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: AbortSignal.timeout(2000),
        });

        if (response.ok || response.status === 304) {
          return;
        }
      } catch {
        // 服务未就绪，继续等待
      }

      await delay(interval);
    }

    throw new AppManagerError(`Dev server did not become ready within ${timeout}ms: ${url}`);
  }
}

/**
 * 全局 Dev Server 管理器实例
 */
export const reactDevServerManager = new ReactDevServerManager();
