// src/execution/agent/services/memoryService/similarityMatcher.ts - 相似度匹配服务

import type {
  MemoryNode,
  SimilarityMatch,
  MemoryRetrievalInput,
  MemoryContext
} from './types.js';

/**
 * 相似度匹配服务
 */
export class SimilarityMatcher {
  /**
   * 计算记忆节点与当前上下文的相似度
   */
  calculateSimilarity(
    node: MemoryNode,
    currentContext: MemoryContext,
    input: MemoryRetrievalInput
  ): SimilarityMatch {
    const dimensions = {
      sceneMatch: this.calculateSceneMatch(node.context, currentContext),
      errorTypeMatch: this.calculateErrorTypeMatch(node.context, currentContext),
      keywordMatch: this.calculateKeywordMatch(node.content.keywords, input),
      semanticMatch: this.calculateSemanticMatch(node.context, currentContext),
    };

    // 加权计算总体相似度
    const weights = {
      sceneMatch: 1.0,     // 精确匹配权重最高
      errorTypeMatch: 0.9,  // 错误类型很重要
      keywordMatch: 0.8,    // 关键词匹配重要
      semanticMatch: 0.6,   // 语义匹配作为补充
    };

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const score = Object.entries(dimensions).reduce(
      (sum, [key, value]) => sum + value * weights[key as keyof typeof weights],
      0
    ) / totalWeight;

    return {
      nodeId: node.id,
      score,
      dimensions,
    };
  }

  /**
   * 计算场景匹配度
   */
  private calculateSceneMatch(nodeContext: MemoryContext, currentContext: MemoryContext): number {
    // 精确匹配场景ID
    if (nodeContext.sceneId === currentContext.sceneId) {
      return 1.0;
    }

    // 部分匹配（如果有通用场景标识）
    if (this.hasCommonScenePattern(nodeContext.sceneId, currentContext.sceneId)) {
      return 0.7;
    }

    return 0.0;
  }

  /**
   * 计算错误类型匹配度
   */
  private calculateErrorTypeMatch(nodeContext: MemoryContext, currentContext: MemoryContext): number {
    if (nodeContext.errorType === currentContext.errorType) {
      return 1.0;
    }

    // 相关错误类型的部分匹配
    const relatedErrorTypes = this.getRelatedErrorTypes(currentContext.errorType);
    if (relatedErrorTypes.includes(nodeContext.errorType)) {
      return 0.5;
    }

    return 0.0;
  }

  /**
   * 计算关键词匹配度
   */
  private calculateKeywordMatch(nodeKeywords: string[], input: MemoryRetrievalInput): number {
    if (nodeKeywords.length === 0) {
      return 0.0;
    }

    const promptWords = this.extractKeywords(input.context.prompt);
    const sceneWords = this.extractKeywords(input.context.meta.sceneId);
    const allCurrentWords = [...promptWords, ...sceneWords];

    if (allCurrentWords.length === 0) {
      return 0.0;
    }

    // 计算关键词重叠度
    const matches = nodeKeywords.filter(keyword =>
      allCurrentWords.some(word =>
        this.isKeywordMatch(keyword.toLowerCase(), word.toLowerCase())
      )
    );

    return matches.length / nodeKeywords.length;
  }

  /**
   * 计算语义匹配度（简化版本）
   */
  private calculateSemanticMatch(nodeContext: MemoryContext, currentContext: MemoryContext): number {
    let score = 0.0;
    let factors = 0;

    // 路由路径匹配
    if (nodeContext.routePath && currentContext.routePath) {
      factors++;
      if (nodeContext.routePath === currentContext.routePath) {
        score += 1.0;
      } else if (this.hasCommonPathSegments(nodeContext.routePath, currentContext.routePath)) {
        score += 0.5;
      }
    }

    // 测试指令相似度（简单的词汇重叠）
    if (nodeContext.prompt && currentContext.prompt) {
      factors++;
      const promptSimilarity = this.calculatePromptSimilarity(
        nodeContext.prompt,
        currentContext.prompt
      );
      score += promptSimilarity;
    }

    // UI元素类型匹配
    if (nodeContext.uiElementTypes && currentContext.uiElementTypes &&
        nodeContext.uiElementTypes.length > 0 && currentContext.uiElementTypes.length > 0) {
      factors++;
      const elementSimilarity = this.calculateArraySimilarity(
        nodeContext.uiElementTypes,
        currentContext.uiElementTypes
      );
      score += elementSimilarity;
    }

    return factors > 0 ? score / factors : 0.0;
  }

  /**
   * 检查是否有通用场景模式
   */
  private hasCommonScenePattern(sceneId1: string, sceneId2: string): boolean {
    // 提取场景类型前缀（如 "login-", "form-", "table-" 等）
    const pattern1 = sceneId1.split('-')[0];
    const pattern2 = sceneId2.split('-')[0];

    return pattern1 === pattern2 && pattern1.length > 2;
  }

  /**
   * 获取相关错误类型
   */
  private getRelatedErrorTypes(errorType: string): string[] {
    const relatedTypes: Record<string, string[]> = {
      'state_detection_error': ['async_timing_error', 'content_validation_error'],
      'async_timing_error': ['state_detection_error', 'element_locating_error'],
      'element_locating_error': ['async_timing_error', 'state_detection_error'],
      'content_validation_error': ['state_detection_error', 'business_rule_error'],
      'interaction_sequence_error': ['state_detection_error', 'async_timing_error'],
      'form_validation_error': ['content_validation_error', 'business_rule_error'],
      'business_rule_error': ['content_validation_error', 'form_validation_error'],
      'edge_case_error': ['other_error'],
      'other_error': ['edge_case_error'],
    };

    return relatedTypes[errorType] || [];
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];

    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s]/g, ' ') // 保留中英文字符和数字
      .split(/\s+/)
      .filter(word => word.length > 1) // 过滤太短的词
      .slice(0, 10); // 限制关键词数量
  }

  /**
   * 检查关键词匹配
   */
  private isKeywordMatch(keyword: string, word: string): boolean {
    // 精确匹配
    if (keyword === word) {
      return true;
    }

    // 包含匹配
    if (keyword.length > 3 && word.includes(keyword)) {
      return true;
    }

    if (word.length > 3 && keyword.includes(word)) {
      return true;
    }

    return false;
  }

  /**
   * 检查路径段的共同性
   */
  private hasCommonPathSegments(path1: string, path2: string): boolean {
    const segments1 = path1.split('/').filter(s => s.length > 0);
    const segments2 = path2.split('/').filter(s => s.length > 0);

    const commonSegments = segments1.filter(seg => segments2.includes(seg));
    return commonSegments.length > 0;
  }

  /**
   * 计算提示词相似度
   */
  private calculatePromptSimilarity(prompt1: string, prompt2: string): number {
    const words1 = this.extractKeywords(prompt1);
    const words2 = this.extractKeywords(prompt2);

    if (words1.length === 0 && words2.length === 0) {
      return 1.0;
    }

    if (words1.length === 0 || words2.length === 0) {
      return 0.0;
    }

    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;

    return commonWords.length / totalWords;
  }

  /**
   * 计算数组相似度
   */
  private calculateArraySimilarity(array1: string[], array2: string[]): number {
    if (array1.length === 0 && array2.length === 0) {
      return 1.0;
    }

    if (array1.length === 0 || array2.length === 0) {
      return 0.0;
    }

    const common = array1.filter(item => array2.includes(item));
    const total = new Set([...array1, ...array2]).size;

    return common.length / total;
  }

  /**
   * 过滤和排序相似度匹配结果
   */
  filterAndSort(
    matches: SimilarityMatch[],
    threshold: number = 0.3,
    maxResults: number = 10
  ): SimilarityMatch[] {
    return matches
      .filter(match => match.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }
}