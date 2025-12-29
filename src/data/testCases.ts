// src/data/testCases.ts - 测试用例加载与关联校验

import type { TestCase, Scene } from '../config/schema.js';

/**
 * 按场景 ID 分组测试用例
 */
export function groupCasesByScene(cases: TestCase[]): Map<string, TestCase[]> {
  const grouped = new Map<string, TestCase[]>();

  for (const c of cases) {
    const existing = grouped.get(c.ui_scene_id) ?? [];
    existing.push(c);
    grouped.set(c.ui_scene_id, existing);
  }

  return grouped;
}

/**
 * 根据用例 ID 查找用例
 */
export function findCaseById(cases: TestCase[], caseId: string): TestCase | undefined {
  return cases.find((c) => c.case_id === caseId);
}

/**
 * 过滤用例（按场景/按类型/按类别）
 */
export interface CaseFilter {
  sceneIds?: string[];
  caseTypes?: string[];
  caseCategories?: ('正例' | '反例')[];
  caseIds?: string[];
}

export function filterCases(cases: TestCase[], filter: CaseFilter): TestCase[] {
  return cases.filter((c) => {
    if (filter.sceneIds && !filter.sceneIds.includes(c.ui_scene_id)) return false;
    if (filter.caseTypes && !filter.caseTypes.includes(c.case_type)) return false;
    if (filter.caseCategories && !filter.caseCategories.includes(c.case_category)) return false;
    if (filter.caseIds && !filter.caseIds.includes(c.case_id)) return false;
    return true;
  });
}

/**
 * 获取用例统计信息
 */
export interface CaseStats {
  total: number;
  byCategory: { positive: number; negative: number };
  byType: Record<string, number>;
  byScene: Record<string, number>;
}

export function getCaseStats(cases: TestCase[]): CaseStats {
  const stats: CaseStats = {
    total: cases.length,
    byCategory: { positive: 0, negative: 0 },
    byType: {},
    byScene: {},
  };

  for (const c of cases) {
    // 按类别
    if (c.case_category === '正例') {
      stats.byCategory.positive++;
    } else {
      stats.byCategory.negative++;
    }

    // 按类型
    stats.byType[c.case_type] = (stats.byType[c.case_type] ?? 0) + 1;

    // 按场景
    stats.byScene[c.ui_scene_id] = (stats.byScene[c.ui_scene_id] ?? 0) + 1;
  }

  return stats;
}

