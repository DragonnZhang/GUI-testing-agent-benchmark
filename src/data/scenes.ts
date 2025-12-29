// src/data/scenes.ts - UI 场景加载与路由展开

import type { Scene, Route } from '../config/schema.js';

/**
 * 展开后的测试目标（场景 + 单个路由）
 */
export interface TestTarget {
  sceneId: string;
  sceneName: string;
  route: Route;
  baseUrl: string;
  accessUrl: string;
  source: Scene['source'];
}

/**
 * 将场景列表展开为测试目标列表
 * 每个场景的每个路由变成一个独立的测试目标
 */
export function expandScenesToTargets(scenes: Scene[]): TestTarget[] {
  const targets: TestTarget[] = [];

  for (const scene of scenes) {
    const baseUrl = getSceneBaseUrl(scene);

    for (const route of scene.routes) {
      const accessUrl = combineUrl(baseUrl, route.path);
      targets.push({
        sceneId: scene.scene_id,
        sceneName: scene.name,
        route,
        baseUrl,
        accessUrl,
        source: scene.source,
      });
    }
  }

  return targets;
}

/**
 * 获取场景的基础 URL
 * - baseUrl 类型：直接返回 baseUrl
 * - localProject 类型：返回占位符，实际 URL 在启动时确定
 */
export function getSceneBaseUrl(scene: Scene): string {
  if (scene.source.type === 'baseUrl') {
    return scene.source.baseUrl;
  }
  // localProject 的实际 URL 需要在启动时确定（端口分配后）
  return `http://localhost:{{PORT}}`;
}

/**
 * 组合 baseUrl 和 path
 */
function combineUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * 根据场景 ID 查找场景
 */
export function findSceneById(scenes: Scene[], sceneId: string): Scene | undefined {
  return scenes.find((s) => s.scene_id === sceneId);
}

