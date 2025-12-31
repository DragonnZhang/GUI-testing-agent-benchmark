// src/config/load.ts - 配置加载与校验

import { readFile, access } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
import { ConfigError, DataLoadError, formatZodError } from '../shared/errors.js';
import {
  RunConfigSchema,
  ScenesConfigSchema,
  TestCasesConfigSchema,
  type RunConfig,
  type Scene,
  type TestCase,
} from './schema.js';

/**
 * 检查文件是否存在
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 加载并校验 JSON 文件
 */
async function loadJsonFile<T>(
  filePath: string,
  parser: (data: unknown) => T,
  fileType: string
): Promise<T> {
  const absPath = resolve(filePath);

  // 检查文件是否存在
  const exists = await checkFileExists(absPath);
  if (!exists) {
    throw new DataLoadError(
      `File not found: ${absPath}`,
      { filePath: absPath, fileType },
      `Create the ${fileType} file or check the path is correct.`
    );
  }

  // 读取文件内容
  let content: string;
  try {
    content = await readFile(absPath, 'utf-8');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new DataLoadError(
      `Failed to read ${fileType} file: ${basename(absPath)}`,
      { filePath: absPath, error: errorMessage },
      `Check file permissions and ensure the file is readable.`
    );
  }

  // 检查文件是否为空
  if (!content.trim()) {
    throw new DataLoadError(
      `${fileType} file is empty: ${basename(absPath)}`,
      { filePath: absPath },
      `Add content to the file. Expected a JSON array.`
    );
  }

  // 解析 JSON
  let json: unknown;
  try {
    json = JSON.parse(content);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new ConfigError(
      `Invalid JSON in ${fileType} file: ${basename(absPath)}`,
      { filePath: absPath, parseError: errorMessage },
      `Fix the JSON syntax. Common issues: missing commas, unclosed brackets, trailing commas.`
    );
  }

  // Schema 校验
  try {
    return parser(json);
  } catch (err) {
    const formattedError = formatZodError(err);
    throw new ConfigError(
      `Validation failed for ${fileType} file: ${basename(absPath)}`,
      { filePath: absPath, validationErrors: formattedError },
      `Review the file format. Check docs/data-format.md for the expected schema.`
    );
  }
}

/**
 * 加载场景配置
 */
export async function loadScenes(scenesPath: string): Promise<Scene[]> {
  return loadJsonFile(scenesPath, (data) => ScenesConfigSchema.parse(data), 'scenes');
}

/**
 * 加载测试用例配置
 */
export async function loadTestCases(casesPath: string): Promise<TestCase[]> {
  return loadJsonFile(casesPath, (data) => TestCasesConfigSchema.parse(data), 'test cases');
}

/**
 * 解析运行配置（CLI 参数合并默认值）
 */
export function parseRunConfig(options: Partial<RunConfig>): RunConfig {
  try {
    return RunConfigSchema.parse(options);
  } catch (err) {
    const formattedError = formatZodError(err);
    throw new ConfigError(
      'Invalid run configuration',
      { validationErrors: formattedError },
      'Check your CLI arguments. Run "uibench run --help" for usage information.'
    );
  }
}

/**
 * 校验用例与场景的关联关系
 */
export function validateCasesSceneRefs(cases: TestCase[], scenes: Scene[]): void {
  const sceneIds = new Set(scenes.map((s) => s.scene_id));
  const missing: string[] = [];

  for (const c of cases) {
    if (!sceneIds.has(c.ui_scene_id)) {
      missing.push(`case ${c.case_id} references unknown scene "${c.ui_scene_id}"`);
    }
  }

  if (missing.length > 0) {
    throw new ConfigError(
      `Test cases reference unknown scenes (${missing.length} errors)`,
      {
        errors: missing.slice(0, 10), // 只显示前 10 个
        totalErrors: missing.length,
      },
      'Ensure all ui_scene_id values in test cases exist in scenes.json.'
    );
  }
}
