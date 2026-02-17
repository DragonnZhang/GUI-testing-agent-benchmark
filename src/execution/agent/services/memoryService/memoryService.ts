// src/execution/agent/services/memoryService/memoryService.ts - 记忆服务核心类

import type {
  MemoryTree,
  MemoryNode,
  MemoryFormationInput,
  MemoryRetrievalInput,
  MemoryRetrievalResult,
  ErrorType,
} from './types.js';
import { FileStorage } from './storage/fileStorage.js';
import { MemoryFormation } from './memoryFormation.js';
import { MemoryRetrieval } from './memoryRetrieval.js';

/**
 * 记忆服务配置
 */
export interface MemoryServiceConfig {
  /** 是否启用记忆系统 */
  enabled: boolean;
  /** 数据存储路径 */
  dataPath: string;
  /** 异步记忆形成 */
  asyncMemoryFormation: boolean;
  /** 记忆检索超时时间(ms) */
  retrievalTimeoutMs: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: MemoryServiceConfig = {
  enabled: true,
  dataPath: 'data/memory',
  asyncMemoryFormation: true,
  retrievalTimeoutMs: 5000,
};

/**
 * 记忆服务主类
 */
export class MemoryService {
  private config: MemoryServiceConfig;
  private storage: FileStorage;
  private formation: MemoryFormation;
  private retrieval: MemoryRetrieval;
  private memoryTree: MemoryTree | null = null;
  private initialized = false;

  constructor(config: Partial<MemoryServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = new FileStorage({ dataRoot: this.config.dataPath });
    this.formation = new MemoryFormation();
    this.retrieval = new MemoryRetrieval();
  }

  /**
   * 初始化记忆服务
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🧠 初始化记忆服务...');

      if (!this.config.enabled) {
        console.log('ℹ️ 记忆系统已禁用');
        return;
      }

      // 初始化存储
      await this.storage.initialize();

      // 加载记忆树
      this.memoryTree = await this.storage.loadMemoryTree();

      this.initialized = true;
      console.log('✅ 记忆服务初始化完成');
    } catch (error) {
      console.error('❌ 记忆服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 检索增强指导
   */
  async retrieveGuidance(input: MemoryRetrievalInput): Promise<string[]> {
    try {
      // 确保服务已初始化
      await this.ensureInitialized();

      if (!this.config.enabled || !this.memoryTree) {
        return [];
      }

      // 设置检索超时
      const retrievalPromise = this.retrieval.retrieveMemories(this.memoryTree, input);
      const timeoutPromise = new Promise<MemoryRetrievalResult>((_, reject) =>
        setTimeout(() => reject(new Error('记忆检索超时')), this.config.retrievalTimeoutMs)
      );

      const result = await Promise.race([retrievalPromise, timeoutPromise]);

      // 组织指导内容
      const guidance: string[] = [];

      // 添加策略层指导
      if (result.guidance.strategies.length > 0) {
        guidance.push('## 🎯 策略指导');
        result.guidance.strategies.forEach((strategy) => {
          guidance.push(strategy);
        });
      }

      // 添加经验层指导
      if (result.guidance.experiences.length > 0) {
        guidance.push('## 💡 经验提醒');
        result.guidance.experiences.forEach((experience) => {
          guidance.push(experience);
        });
      }

      // 添加案例层警告
      if (result.guidance.caseWarnings.length > 0) {
        guidance.push('## ⚠️ 注意事项');
        result.guidance.caseWarnings.forEach((warning) => {
          guidance.push(warning);
        });
      }

      // 记录检索统计
      if (guidance.length > 0) {
        console.log('🎯 记忆检索成功:', {
          totalGuidance: guidance.length,
          strategies: result.guidance.strategies.length,
          experiences: result.guidance.experiences.length,
          warnings: result.guidance.caseWarnings.length,
          avgConfidence: Math.round(result.stats.averageConfidence * 100),
        });
      }

      return guidance;
    } catch (error) {
      console.error('❌ 记忆检索失败:', error);
      return [];
    }
  }

  /**
   * 形成新记忆（异步）
   */
  async formMemory(input: MemoryFormationInput): Promise<void> {
    try {
      // 确保服务已初始化
      await this.ensureInitialized();

      if (!this.config.enabled || !this.memoryTree) {
        return;
      }

      const memoryFormationTask = async () => {
        try {
          // 形成记忆节点
          const memoryNode = await this.formation.formMemory(input);
          if (!memoryNode) {
            return;
          }

          // 保存记忆节点
          await this.saveMemoryNode(memoryNode);

          console.log('✅ 记忆形成并保存成功:', {
            nodeId: memoryNode.id,
            caseId: input.context.meta.caseId,
            errorType: memoryNode.context.errorType,
          });
        } catch (error) {
          console.error('❌ 记忆形成失败:', error);
        }
      };

      if (this.config.asyncMemoryFormation) {
        // 异步执行，不阻塞测试
        setImmediate(() => {
          memoryFormationTask().catch(console.error);
        });
      } else {
        // 同步执行
        await memoryFormationTask();
      }
    } catch (error) {
      console.error('❌ 记忆形成服务调用失败:', error);
    }
  }

  /**
   * 保存记忆节点
   */
  private async saveMemoryNode(node: MemoryNode): Promise<void> {
    if (!this.memoryTree) {
      throw new Error('记忆树未初始化');
    }

    try {
      // 保存节点到存储
      await this.storage.saveMemoryNode(node);

      // 更新记忆树结构
      this.memoryTree.nodes[node.id] = node;

      // 更新索引
      this.updateIndices(node);

      // 如果是根节点，添加到根节点列表
      if (!node.parentId) {
        this.memoryTree.rootIds.push(node.id);
      }

      // 保存更新后的记忆树
      await this.storage.saveMemoryTree(this.memoryTree);
    } catch (error) {
      console.error('❌ 保存记忆节点失败:', error);
      throw error;
    }
  }

  /**
   * 更新索引
   */
  private updateIndices(node: MemoryNode): void {
    if (!this.memoryTree) return;

    const { indices } = this.memoryTree;

    // 更新场景索引
    if (!indices.bySceneId[node.context.sceneId]) {
      indices.bySceneId[node.context.sceneId] = [];
    }
    if (!indices.bySceneId[node.context.sceneId].includes(node.id)) {
      indices.bySceneId[node.context.sceneId].push(node.id);
    }

    // 更新错误类型索引
    const errorType = node.context.errorType as ErrorType;
    if (!indices.byErrorType[errorType]) {
      indices.byErrorType[errorType] = [];
    }
    if (!indices.byErrorType[errorType].includes(node.id)) {
      indices.byErrorType[errorType].push(node.id);
    }

    // 更新关键词索引
    node.content.keywords.forEach((keyword) => {
      if (!indices.byKeywords[keyword]) {
        indices.byKeywords[keyword] = [];
      }
      if (!indices.byKeywords[keyword].includes(node.id)) {
        indices.byKeywords[keyword].push(node.id);
      }
    });
  }

  /**
   * 获取记忆统计信息
   */
  async getMemoryStats(): Promise<{
    totalNodes: number;
    nodesByType: Record<string, number>;
    nodesByErrorType: Record<string, number>;
    averageConfidence: number;
  }> {
    await this.ensureInitialized();

    if (!this.memoryTree) {
      return {
        totalNodes: 0,
        nodesByType: {},
        nodesByErrorType: {},
        averageConfidence: 0,
      };
    }

    const nodes = Object.values(this.memoryTree.nodes);
    const totalNodes = nodes.length;

    // 按类型统计
    const nodesByType: Record<string, number> = {};
    nodes.forEach((node) => {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    });

    // 按错误类型统计
    const nodesByErrorType: Record<string, number> = {};
    nodes.forEach((node) => {
      const errorType = node.context.errorType;
      nodesByErrorType[errorType] = (nodesByErrorType[errorType] || 0) + 1;
    });

    // 平均置信度
    const averageConfidence =
      totalNodes > 0 ? nodes.reduce((sum, node) => sum + node.confidence, 0) / totalNodes : 0;

    return {
      totalNodes,
      nodesByType,
      nodesByErrorType,
      averageConfidence,
    };
  }

  /**
   * 确保服务已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    // 当前实现中没有需要特别清理的资源
    // 未来如果有缓存或网络连接，可以在这里清理
    console.log('🧹 记忆服务清理完成');
  }
}
