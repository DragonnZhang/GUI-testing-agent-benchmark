// src/execution/agent/services/memoryService/storage/fileStorage.ts - 记忆系统文件存储

import { promises as fs } from 'fs';
import { join } from 'path';
import type { MemoryTree, MemoryNode } from '../types.js';

/**
 * 文件存储配置
 */
export interface FileStorageConfig {
  /** 数据根目录 */
  dataRoot: string;
  /** 是否启用备份 */
  enableBackup: boolean;
  /** 备份保留数量 */
  backupCount: number;
}

/**
 * 默认存储配置
 */
const DEFAULT_CONFIG: FileStorageConfig = {
  dataRoot: 'data/memory',
  enableBackup: true,
  backupCount: 5,
};

/**
 * 文件存储服务
 */
export class FileStorage {
  private config: FileStorageConfig;
  private memoryTreePath: string;
  private nodesDir: string;
  private indicesDir: string;

  constructor(config: Partial<FileStorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memoryTreePath = join(this.config.dataRoot, 'memory-tree.json');
    this.nodesDir = join(this.config.dataRoot, 'nodes');
    this.indicesDir = join(this.config.dataRoot, 'indices');
  }

  /**
   * 初始化存储目录
   */
  async initialize(): Promise<void> {
    try {
      // 确保所有目录存在
      await this.ensureDirectory(this.config.dataRoot);
      await this.ensureDirectory(this.nodesDir);
      await this.ensureDirectory(this.indicesDir);

      console.log('✅ 记忆存储系统初始化完成');
    } catch (error) {
      console.error('❌ 记忆存储系统初始化失败:', error);
      throw error;
    }
  }

  /**
   * 加载记忆树
   */
  async loadMemoryTree(): Promise<MemoryTree> {
    try {
      if (!(await this.fileExists(this.memoryTreePath))) {
        console.log('📝 记忆树文件不存在，创建新的记忆树');
        return this.createEmptyMemoryTree();
      }

      const content = await fs.readFile(this.memoryTreePath, 'utf-8');
      const memoryTree: MemoryTree = JSON.parse(content);

      console.log(`📂 成功加载记忆树，包含 ${memoryTree.metadata.totalNodes} 个节点`);
      return memoryTree;
    } catch (error) {
      console.error('❌ 加载记忆树失败:', error);

      // 尝试从备份恢复
      const recovered = await this.recoverFromBackup();
      if (recovered) {
        return recovered;
      }

      // 如果恢复也失败，返回空的记忆树
      console.warn('⚠️ 无法恢复记忆树，创建新的空记忆树');
      return this.createEmptyMemoryTree();
    }
  }

  /**
   * 保存记忆树
   */
  async saveMemoryTree(memoryTree: MemoryTree): Promise<void> {
    try {
      // 更新元数据
      memoryTree.metadata.lastUpdated = new Date().toISOString();
      memoryTree.metadata.totalNodes = Object.keys(memoryTree.nodes).length;

      // 创建备份（如果启用）
      if (this.config.enableBackup) {
        await this.createBackup();
      }

      // 保存记忆树
      const content = JSON.stringify(memoryTree, null, 2);
      await fs.writeFile(this.memoryTreePath, content, 'utf-8');

      console.log(`✅ 记忆树已保存，包含 ${memoryTree.metadata.totalNodes} 个节点`);
    } catch (error) {
      console.error('❌ 保存记忆树失败:', error);
      throw error;
    }
  }

  /**
   * 加载单个记忆节点
   */
  async loadMemoryNode(nodeId: string): Promise<MemoryNode | null> {
    try {
      const nodePath = join(this.nodesDir, `${nodeId}.json`);

      if (!(await this.fileExists(nodePath))) {
        return null;
      }

      const content = await fs.readFile(nodePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ 加载记忆节点 ${nodeId} 失败:`, error);
      return null;
    }
  }

  /**
   * 保存单个记忆节点
   */
  async saveMemoryNode(node: MemoryNode): Promise<void> {
    try {
      const nodePath = join(this.nodesDir, `${node.id}.json`);
      const content = JSON.stringify(node, null, 2);
      await fs.writeFile(nodePath, content, 'utf-8');
    } catch (error) {
      console.error(`❌ 保存记忆节点 ${node.id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 批量加载记忆节点
   */
  async loadMemoryNodes(nodeIds: string[]): Promise<MemoryNode[]> {
    const nodes: MemoryNode[] = [];

    for (const nodeId of nodeIds) {
      const node = await this.loadMemoryNode(nodeId);
      if (node) {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * 删除记忆节点
   */
  async deleteMemoryNode(nodeId: string): Promise<void> {
    try {
      const nodePath = join(this.nodesDir, `${nodeId}.json`);

      if (await this.fileExists(nodePath)) {
        await fs.unlink(nodePath);
        console.log(`🗑️ 已删除记忆节点 ${nodeId}`);
      }
    } catch (error) {
      console.error(`❌ 删除记忆节点 ${nodeId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 创建空的记忆树
   */
  private createEmptyMemoryTree(): MemoryTree {
    return {
      rootIds: [],
      nodes: {},
      indices: {
        bySceneId: {},
        byErrorType: {} as Record<string, string[]>,
        byKeywords: {},
      },
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalNodes: 0,
      },
    };
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 检查文件是否存在
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 创建备份
   */
  private async createBackup(): Promise<void> {
    try {
      if (!(await this.fileExists(this.memoryTreePath))) {
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = join(this.config.dataRoot, `memory-tree-backup-${timestamp}.json`);

      await fs.copyFile(this.memoryTreePath, backupPath);

      // 清理旧备份
      await this.cleanupOldBackups();
    } catch (error) {
      console.warn('⚠️ 创建备份失败:', error);
    }
  }

  /**
   * 清理旧备份文件
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.dataRoot);
      const backupFiles = files
        .filter((file) => file.startsWith('memory-tree-backup-') && file.endsWith('.json'))
        .sort()
        .reverse();

      if (backupFiles.length > this.config.backupCount) {
        const filesToDelete = backupFiles.slice(this.config.backupCount);

        for (const file of filesToDelete) {
          await fs.unlink(join(this.config.dataRoot, file));
        }
      }
    } catch (error) {
      console.warn('⚠️ 清理旧备份失败:', error);
    }
  }

  /**
   * 从备份恢复
   */
  private async recoverFromBackup(): Promise<MemoryTree | null> {
    try {
      const files = await fs.readdir(this.config.dataRoot);
      const backupFiles = files
        .filter((file) => file.startsWith('memory-tree-backup-') && file.endsWith('.json'))
        .sort()
        .reverse();

      if (backupFiles.length === 0) {
        return null;
      }

      const latestBackup = backupFiles[0];
      const backupPath = join(this.config.dataRoot, latestBackup);

      console.log(`🔄 尝试从备份恢复: ${latestBackup}`);

      const content = await fs.readFile(backupPath, 'utf-8');
      const memoryTree: MemoryTree = JSON.parse(content);

      console.log(`✅ 成功从备份恢复记忆树`);
      return memoryTree;
    } catch (error) {
      console.error('❌ 从备份恢复失败:', error);
      return null;
    }
  }
}
