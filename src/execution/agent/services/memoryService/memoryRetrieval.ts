// src/execution/agent/services/memoryService/memoryRetrieval.ts - 记忆检索服务

import type {
  MemoryNode,
  MemoryTree,
  MemoryRetrievalInput,
  MemoryRetrievalResult,
  SimilarityMatch,
  MemoryContext,
  ErrorType,
} from './types.js';
import { MemoryNodeType, ErrorType as ErrorTypeConst } from './types.js';
import { SimilarityMatcher } from './similarityMatcher.js';

/**
 * 记忆检索服务
 */
export class MemoryRetrieval {
  private similarityMatcher: SimilarityMatcher;

  constructor() {
    this.similarityMatcher = new SimilarityMatcher();
  }

  /**
   * 检索相关记忆
   */
  async retrieveMemories(
    memoryTree: MemoryTree,
    input: MemoryRetrievalInput
  ): Promise<MemoryRetrievalResult> {
    try {
      console.log('🔍 开始检索记忆...', {
        sceneId: input.context.meta.sceneId,
        totalNodes: Object.keys(memoryTree.nodes).length,
      });

      // 构建当前上下文
      const currentContext = this.buildCurrentContext(input);

      // 获取候选记忆节点
      const candidates = this.getCandidateNodes(memoryTree, currentContext);

      console.log(`📋 找到 ${candidates.length} 个候选记忆节点`);

      // 计算相似度匹配
      const matches = candidates.map((node) =>
        this.similarityMatcher.calculateSimilarity(node, currentContext, input)
      );

      // 过滤和排序
      const threshold = input.similarityThreshold || 0.3;
      const maxResults = input.maxResults || 10;
      const filteredMatches = this.similarityMatcher.filterAndSort(matches, threshold, maxResults);

      console.log(`🎯 筛选出 ${filteredMatches.length} 个相关记忆`);

      // 构建检索结果
      const result = this.buildRetrievalResult(memoryTree, filteredMatches);

      console.log('✅ 记忆检索完成', {
        totalMatches: result.matches.length,
        strategies: result.guidance.strategies.length,
        experiences: result.guidance.experiences.length,
        caseWarnings: result.guidance.caseWarnings.length,
      });

      return result;
    } catch (error) {
      console.error('❌ 记忆检索失败:', error);

      // 返回空结果
      return {
        matches: [],
        guidance: {
          strategies: [],
          experiences: [],
          caseWarnings: [],
        },
        stats: {
          totalCandidates: 0,
          filteredMatches: 0,
          averageConfidence: 0,
        },
      };
    }
  }

  /**
   * 构建当前上下文
   */
  private buildCurrentContext(input: MemoryRetrievalInput): MemoryContext {
    const url = new URL(input.context.accessUrl);

    // 这里可以根据测试指令推断可能的错误类型，先使用占位符
    const inferredErrorType: ErrorType = this.inferErrorType(input.context.prompt);

    return {
      sceneId: input.context.meta.sceneId,
      caseId: input.context.meta.caseId,
      errorType: inferredErrorType,
      prompt: input.context.prompt,
      routePath: url.pathname,
      uiElementTypes: [], // TODO: 未来可以通过分析提示词提取UI元素类型
    };
  }

  /**
   * 从测试指令推断可能的错误类型（简化版本）
   */
  private inferErrorType(prompt: string): ErrorType {
    const lowerPrompt = prompt.toLowerCase();

    if (
      lowerPrompt.includes('form') ||
      lowerPrompt.includes('input') ||
      lowerPrompt.includes('submit')
    ) {
      return ErrorTypeConst.FORM_VALIDATION_ERROR;
    }

    if (
      lowerPrompt.includes('click') ||
      lowerPrompt.includes('button') ||
      lowerPrompt.includes('interact')
    ) {
      return ErrorTypeConst.INTERACTION_SEQUENCE_ERROR;
    }

    if (
      lowerPrompt.includes('text') ||
      lowerPrompt.includes('content') ||
      lowerPrompt.includes('display')
    ) {
      return ErrorTypeConst.CONTENT_VALIDATION_ERROR;
    }

    if (
      lowerPrompt.includes('load') ||
      lowerPrompt.includes('wait') ||
      lowerPrompt.includes('appear')
    ) {
      return ErrorTypeConst.ASYNC_TIMING_ERROR;
    }

    return ErrorTypeConst.OTHER_ERROR;
  }

  /**
   * 获取候选记忆节点
   */
  private getCandidateNodes(memoryTree: MemoryTree, currentContext: MemoryContext): MemoryNode[] {
    const candidates: MemoryNode[] = [];

    // 1. 优先考虑相同场景ID的记忆
    const sameSceneNodes = memoryTree.indices.bySceneId[currentContext.sceneId] || [];
    sameSceneNodes.forEach((nodeId) => {
      const node = memoryTree.nodes[nodeId];
      if (node) {
        candidates.push(node);
      }
    });

    // 2. 考虑相同错误类型的记忆
    const sameErrorTypeNodes =
      memoryTree.indices.byErrorType[
        currentContext.errorType as keyof typeof memoryTree.indices.byErrorType
      ] || [];
    sameErrorTypeNodes.forEach((nodeId) => {
      const node = memoryTree.nodes[nodeId];
      if (node && !candidates.some((c) => c.id === nodeId)) {
        candidates.push(node);
      }
    });

    // 3. 考虑高置信度的策略记忆（跨场景通用）
    const strategyNodes = Object.values(memoryTree.nodes).filter(
      (node) => node.type === MemoryNodeType.STRATEGY && node.confidence > 0.7
    );
    strategyNodes.forEach((node) => {
      if (!candidates.some((c) => c.id === node.id)) {
        candidates.push(node);
      }
    });

    // 4. 如果候选节点太少，扩展到关键词匹配
    if (candidates.length < 5) {
      const promptKeywords = this.extractKeywords(currentContext.prompt);
      promptKeywords.forEach((keyword) => {
        const keywordNodes = memoryTree.indices.byKeywords[keyword] || [];
        keywordNodes.forEach((nodeId) => {
          const node = memoryTree.nodes[nodeId];
          if (node && !candidates.some((c) => c.id === nodeId)) {
            candidates.push(node);
          }
        });
      });
    }

    return candidates;
  }

  /**
   * 构建检索结果
   */
  private buildRetrievalResult(
    memoryTree: MemoryTree,
    filteredMatches: SimilarityMatch[]
  ): MemoryRetrievalResult {
    const matches = filteredMatches
      .map((match) => ({
        node: memoryTree.nodes[match.nodeId],
        similarity: match,
      }))
      .filter((m) => m.node); // 过滤掉空节点

    // 按节点类型分组指导内容
    const guidance = this.organizeGuidance(matches);

    // 计算统计信息
    const stats = {
      totalCandidates: Object.keys(memoryTree.nodes).length,
      filteredMatches: matches.length,
      averageConfidence:
        matches.length > 0
          ? matches.reduce((sum, m) => sum + m.node.confidence, 0) / matches.length
          : 0,
    };

    return {
      matches,
      guidance,
      stats,
    };
  }

  /**
   * 组织指导内容
   */
  private organizeGuidance(matches: Array<{ node: MemoryNode; similarity: SimilarityMatch }>): {
    strategies: string[];
    experiences: string[];
    caseWarnings: string[];
  } {
    const strategies: string[] = [];
    const experiences: string[] = [];
    const caseWarnings: string[] = [];

    matches.forEach((match) => {
      const { node, similarity } = match;

      // 根据节点类型和相似度决定指导内容的组织方式
      if (node.type === MemoryNodeType.STRATEGY && similarity.score > 0.6) {
        strategies.push(this.formatGuidanceContent(node, similarity.score));
      } else if (node.type === MemoryNodeType.EXPERIENCE && similarity.score > 0.5) {
        experiences.push(this.formatGuidanceContent(node, similarity.score));
      } else if (node.type === MemoryNodeType.CASE && similarity.score > 0.4) {
        // 案例节点主要用于警告
        const warning = this.formatCaseWarning(node, similarity.score);
        if (warning) {
          caseWarnings.push(warning);
        }
      }
    });

    return {
      strategies: this.deduplicateAndLimit(strategies, 3),
      experiences: this.deduplicateAndLimit(experiences, 5),
      caseWarnings: this.deduplicateAndLimit(caseWarnings, 3),
    };
  }

  /**
   * 格式化指导内容
   */
  private formatGuidanceContent(node: MemoryNode, _score: number): string {
    const confidenceTag = this.getConfidenceTag(node.confidence);
    return `${confidenceTag} ${node.content.guidance}`;
  }

  /**
   * 格式化案例警告
   */
  private formatCaseWarning(node: MemoryNode, score: number): string | null {
    // 只有高相似度的案例才生成警告
    if (score < 0.6) {
      return null;
    }

    const errorType = node.context.errorType.replace(/_/g, ' ');
    return `⚠️ 类似情况注意事项（${errorType}）：${node.content.guidance.split('\n')[0]}`;
  }

  /**
   * 获取置信度标签
   */
  private getConfidenceTag(confidence: number): string {
    if (confidence >= 0.8) {
      return '🔥';
    } else if (confidence >= 0.6) {
      return '💡';
    } else {
      return '📝';
    }
  }

  /**
   * 去重和限制数量
   */
  private deduplicateAndLimit(items: string[], limit: number): string[] {
    // 简单去重：移除内容高度相似的项目
    const unique: string[] = [];

    for (const item of items) {
      const isDuplicate = unique.some(
        (existing) => this.calculateTextSimilarity(item, existing) > 0.7
      );

      if (!isDuplicate) {
        unique.push(item);
      }

      if (unique.length >= limit) {
        break;
      }
    }

    return unique;
  }

  /**
   * 计算文本相似度（简化版本）
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);

    if (words1.length === 0 && words2.length === 0) {
      return 1.0;
    }

    if (words1.length === 0 || words2.length === 0) {
      return 0.0;
    }

    const commonWords = words1.filter((word) => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalWords;
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];

    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .slice(0, 10);
  }
}
