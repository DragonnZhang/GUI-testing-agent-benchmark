// src/config/schema.ts - zod schemas（场景/用例/配置）

import { z } from 'zod';

// ============ UI 场景 Schema ============

/** 场景来源：可以是 baseUrl（已运行的地址）或本地 React 项目 */
export const SceneSourceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('baseUrl'),
    baseUrl: z.string().url(),
  }),
  z.object({
    type: z.literal('localProject'),
    projectPath: z.string(),
    devCommand: z.string().default('npm run dev'),
    installCommand: z.string().default('npm install'),
    readyTimeout: z.number().default(60000),
  }),
]);

export const RouteSchema = z.object({
  path: z.string(),
  name: z.string().optional(),
});

export const SceneSchema = z.object({
  scene_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  source: SceneSourceSchema,
  routes: z.array(RouteSchema).min(1),
});

export const ScenesConfigSchema = z.array(SceneSchema);

export type SceneSource = z.infer<typeof SceneSourceSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type Scene = z.infer<typeof SceneSchema>;

// ============ Ground Truth Schema ============

export const GroundTruthSchema = z.object({
  has_defect: z.boolean(),
  defect_details: z.array(z.string()).default([]),
  defect_level: z.enum(['low', 'medium', 'high']).nullable().optional(),
});

export type GroundTruth = z.infer<typeof GroundTruthSchema>;

// ============ 测试用例 Schema ============

export const TestCaseSchema = z.object({
  case_id: z.string(),
  ui_scene_id: z.string(),
  route_path: z.string().default('/'), // 指定场景中的具体路由路径
  case_type: z.string(), // 显示缺陷 / 交互缺陷 / ...
  case_category: z.enum(['正例', '反例']),
  prompt: z.string(),
  ground_truth: GroundTruthSchema,
});

export const TestCasesConfigSchema = z.array(TestCaseSchema);

export type TestCase = z.infer<typeof TestCaseSchema>;

// ============ Agent 配置 Schema ============

export const AgentConfigSchema = z.object({
  name: z.string(),
  enabled: z.boolean().default(true),
  timeout: z.number().default(1200000), // 单用例超时 ms
  options: z.record(z.unknown()).optional(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

// ============ 运行配置 Schema ============

export const RunConfigSchema = z.object({
  scenesPath: z.string().default('data/ui-scenes/scenes.json'),
  casesPath: z.string().default('data/test-cases/test-case-config.json'),
  outputDir: z.string().default('runs'),
  agents: z.array(z.string()).default(['dummy']),
  concurrency: z.number().min(1).default(1),
  timeout: z.number().default(1200000),
  judge: z.enum(['off', 'http']).default('off'),
  judgeUrl: z.string().url().optional(),
});

export type RunConfig = z.infer<typeof RunConfigSchema>;

