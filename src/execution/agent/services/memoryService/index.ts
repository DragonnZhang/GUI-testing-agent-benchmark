// src/execution/agent/services/memoryService/index.ts - 记忆服务主入口

export { MemoryService, type MemoryServiceConfig } from './memoryService.js';
export type {
  MemoryNode,
  MemoryTree,
  MemoryFormationInput,
  MemoryRetrievalInput,
  MemoryRetrievalResult,
  ErrorType,
  MemoryNodeType,
  MemoryContent,
  MemoryContext,
  ErrorAnalysis,
  SimilarityMatch,
} from './types.js';

// 导出服务组件（用于测试和扩展）
export { FileStorage } from './storage/fileStorage.js';
export { MemoryFormation } from './memoryFormation.js';
export { MemoryRetrieval } from './memoryRetrieval.js';
export { ErrorAnalyzer } from './errorAnalyzer.js';
export { SimilarityMatcher } from './similarityMatcher.js';
