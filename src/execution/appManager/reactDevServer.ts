// src/execution/appManager/reactDevServer.ts - React dev server 生命周期管理 (T026)

import { execa, type ResultPromise } from 'execa';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { AppManagerError } from '../../shared/errors.js';
import { delay } from '../../shared/time.js';
import {
  isPortInUse,
  forceReleasePort,
  waitForPortReady,
  killProcessOnPort,
} from './portAllocator.js';

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

  /** 启动前是否清理端口 */
  cleanPortBeforeStart?: boolean;
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
  /** 进程 PID */
  pid?: number;
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
      cleanPortBeforeStart = true,
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

    // 启动前检查并清理端口
    if (cleanPortBeforeStart && (await isPortInUse(port))) {
      console.log(`   ⚠️ Port ${port} is in use, attempting to release...`);
      const released = await forceReleasePort(port, { timeout: 5000 });
      if (!released) {
        throw new AppManagerError(
          `Port ${port} is occupied and could not be released`,
          { port, sceneId },
          'Manually stop the process using the port or choose a different port'
        );
      }
      console.log(`   ✅ Port ${port} released successfully`);
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
      instance.pid = serverProcess.pid;

      // 等待服务就绪（使用端口检测 + HTTP 检测双重验证）
      await this.waitForReady(instance.url, port, readyTimeout, readyPollInterval);

      instance.status = 'ready';
      return instance;
    } catch (error) {
      instance.status = 'error';
      instance.error = error instanceof Error ? error.message : String(error);
      // 尝试清理进程
      await this.cleanupProcess(instance);
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

    await this.cleanupProcess(instance);
    this.servers.delete(sceneId);
  }

  /**
   * 清理进程和端口
   */
  private async cleanupProcess(instance: DevServerInstance): Promise<void> {
    const { process: serverProcess, port, pid } = instance;

    // 1. 首先尝试通过进程句柄终止
    if (serverProcess) {
      try {
        serverProcess.kill('SIGTERM');

        // 等待进程优雅退出（最多 3 秒）
        await Promise.race([
          serverProcess.catch(() => {}), // 忽略进程错误
          delay(3000),
        ]);
      } catch {
        // 忽略
      }
    }

    // 2. 如果有 PID，尝试直接杀死进程
    if (pid) {
      try {
        process.kill(pid, 'SIGTERM');
        await delay(1000);
        // 检查进程是否还在
        try {
          process.kill(pid, 0); // 检查进程是否存在
          process.kill(pid, 'SIGKILL'); // 强制杀死
        } catch {
          // 进程已退出
        }
      } catch {
        // 忽略
      }
    }

    // 3. 最后通过端口强制清理（确保端口被释放）
    if (await isPortInUse(port)) {
      console.log(`   🔄 Cleaning up port ${port}...`);
      await forceReleasePort(port, { timeout: 5000, forceKill: true });
    }

    instance.status = 'stopped';
  }

  /**
   * 停止所有 Dev Server
   */
  async stopAll(): Promise<void> {
    const sceneIds = Array.from(this.servers.keys());
    console.log(`\n🛑 Stopping ${sceneIds.length} dev server(s)...`);

    // 并行停止所有服务器
    await Promise.all(sceneIds.map((id) => this.stop(id)));

    console.log('   ✅ All dev servers stopped');
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
    // 解析命令，支持在命令后追加端口参数
    const parts = devCommand.split(' ');
    const [cmd, ...args] = parts;

    // 检查是否已经包含端口参数
    const hasPortArg = args.some(
      (arg) => arg.startsWith('--port') || arg.startsWith('-p')
    );

    // 如果没有端口参数，自动追加 --port（适配 Vite/CRA 等）
    if (!hasPortArg) {
      args.push('--port', String(port));
    }

    // 设置端口环境变量（作为后备，支持 CRA 等读取 PORT 环境变量的工具）
    const env = {
      ...process.env,
      PORT: String(port),
      BROWSER: 'none', // 禁止自动打开浏览器
    };

    console.log(`   🚀 Running: ${cmd} ${args.join(' ')}`);

    const childProcess = execa(cmd, args, {
      cwd: projectPath,
      env,
      stdio: 'pipe',
      detached: false,
    });

    return childProcess;
  }

  /**
   * 等待服务就绪（端口检测 + HTTP 检测双重验证）
   */
  private async waitForReady(
    url: string,
    port: number,
    timeout: number,
    interval: number
  ): Promise<void> {
    const startTime = Date.now();

    // 第一阶段：等待端口可连接
    console.log(`   ⏳ Waiting for port ${port} to be ready...`);
    const portReady = await waitForPortReady(port, timeout / 2, interval);

    if (!portReady) {
      throw new AppManagerError(
        `Port ${port} did not become available within ${timeout / 2}ms`,
        { port, url },
        'Check if the dev server started correctly'
      );
    }

    // 第二阶段：等待 HTTP 服务响应
    console.log(`   ⏳ Waiting for HTTP service at ${url}...`);
    const remainingTimeout = timeout - (Date.now() - startTime);

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

    throw new AppManagerError(
      `Dev server did not become ready within ${timeout}ms: ${url}`,
      { port, url, timeout },
      'Increase readyTimeout or check the application startup logs'
    );
  }
}

/**
 * 全局 Dev Server 管理器实例
 */
export const reactDevServerManager = new ReactDevServerManager();
