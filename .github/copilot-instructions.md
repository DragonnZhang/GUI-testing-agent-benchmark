# UI Agent Benchmark - Copilot Instructions

## Architecture Overview

**TypeScript CLI framework** for benchmarking UI Testing Agents with a 4-layer architecture:

```
Data Layer (data/, src/config/) → Execution Layer (src/execution/) → Evaluation Layer (src/evaluation/) → Visualization (src/visualization/)
```

**Data flow**: `scenes.json` + `test-cases.json` → Agent execution → Binary scoring (TP/FP/FN/TN) → Metrics & HTML report

## Project Setup

- **Package manager**: pnpm (not npm/yarn)
- **Runtime**: Node.js >= 20, TypeScript 5.x, ESM-only
- **Build output**: `dist/`, CLI via `pnpm uibench` or `node dist/cli/index.js`

```bash
pnpm install && pnpm build       # Setup
pnpm dev                         # Watch mode
pnpm uibench run -a dummy,noop   # Run benchmark
```

## TypeScript & ESM Conventions

- **All imports must use `.js` extension**: `import { x } from './foo.js'`
- Module config: `"module": "NodeNext"` in tsconfig.json
- No CommonJS - use `import/export` only

## Error Handling Pattern

Use typed errors from `src/shared/errors.ts` with context + suggestion:

```typescript
throw new ConfigError(
  'Validation failed',
  { filePath, errors },           // context object
  'Check docs/data-format.md'     // actionable suggestion
);
```

Error types: `ConfigError`, `DataLoadError`, `AgentExecutionError`, `TimeoutError`, `AppManagerError`

## Schema Validation

All config uses Zod schemas in `src/config/schema.ts`:
- `Scene` - UI scene (baseUrl or localProject source)
- `TestCase` - test case with `ground_truth.has_defect` boolean
- `RunConfig` - CLI options

## Agent Integration

Extend `AgentAdapter` (see `src/execution/agent/builtins/dummyAgent.ts`):

```typescript
export class MyAgent extends AgentAdapter {
  readonly meta: AgentMeta = { name: 'my-agent', version: '1.0.0' };

  async runCase(ctx: AgentContext): Promise<AgentResult> {
    // ctx.accessUrl - target URL, ctx.prompt - test instruction
    return { hasDefect: boolean, defects: [], rawOutput: any, errors: [] };
  }
}
```

Register in `src/execution/agent/builtins/index.ts` via `agentRegistry.register()`.

## UI Scenes (Test Targets)

Local projects go in `data/ui-scenes/` (e.g., `data/ui-scenes/demo-app/`).

Configure in `scenes.json`:
```json
{
  "scene_id": "SCENE_002",
  "source": {
    "type": "localProject",
    "projectPath": "./data/ui-scenes/demo-app",
    "devCommand": "pnpm dev",
    "installCommand": "pnpm install"
  }
}
```

`ReactDevServerManager` auto-starts local projects with dynamic port allocation.

## Directory Structure

```
src/
├── cli/commands/        # run.ts, eval.ts, report.ts
├── config/              # schema.ts (Zod), load.ts
├── execution/
│   ├── agent/           # adapter.ts, registry.ts, builtins/
│   ├── appManager/      # reactDevServer.ts, portAllocator.ts
│   └── runner/          # runEngine.ts, timeouts.ts
├── evaluation/scoring/  # binaryScorer.ts (TP/FP/FN/TN), metrics.ts
└── visualization/html/  # template.ts, render.ts

data/ui-scenes/          # Scene definitions + local UI projects
data/test-cases/         # Test case configs with ground truth
runs/<runId>/            # Output: metrics.json, score.json, report.html
```

## Modification Patterns

| Task | Files to modify |
|------|-----------------|
| New agent | Copy `templateAgent.ts`, implement `runCase()`, register in `builtins/index.ts` |
| New metric | Extend `src/evaluation/scoring/metrics.ts` |
| Schema change | Update `schema.ts`, then `docs/data-format.md` |
| CLI option | Add to `src/cli/index.ts`, handle in command file |
| New UI scene | Add project to `data/ui-scenes/`, update `scenes.json` |
