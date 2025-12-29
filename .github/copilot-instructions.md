# UI Agent Benchmark - Copilot Instructions

## Architecture Overview

This is a **TypeScript CLI framework** for benchmarking UI Testing Agents. The 4-layer architecture:

```
Data Layer (data/, src/config/) → Execution Layer (src/execution/) → Evaluation Layer (src/evaluation/) → Visualization (src/visualization/)
```

**Key data flow**: `scenes.json` + `test-cases.json` → Agent execution → Binary scoring (TP/FP/FN/TN) → Metrics & HTML report

## Project Conventions

### TypeScript & ESM
- **ESM modules only** - all imports must use `.js` extension: `import { x } from './foo.js'`
- Node.js >= 20, TypeScript 5.x with `"module": "NodeNext"`
- Output to `dist/`, run CLI via `npx uibench` or `node dist/cli/index.js`

### Error Handling Pattern
Use typed errors from `src/shared/errors.ts` with context and suggestions:
```typescript
throw new ConfigError(
  'Validation failed for scenes file',
  { filePath, validationErrors },
  'Check docs/data-format.md for the expected schema.'
);
```

### Schema Validation
All config/data uses Zod schemas in `src/config/schema.ts`. Key types:
- `Scene` - UI scene definition (baseUrl or localProject source)
- `TestCase` - test case with ground_truth.has_defect boolean
- `RunConfig` - CLI options schema

## Agent Integration Pattern

To add a new agent, follow `src/execution/agent/builtins/dummyAgent.ts`:

```typescript
export class MyAgent extends AgentAdapter {
  readonly meta: AgentMeta = { name: 'my-agent', version: '1.0.0' };

  async runCase(ctx: AgentContext): Promise<AgentResult> {
    // ctx.accessUrl - target URL, ctx.prompt - test instruction
    return {
      hasDefect: boolean,
      defects: [{ description: string }],
      rawOutput: any,  // preserved for debugging
      errors: [],
    };
  }
}
```

Register in `src/execution/agent/builtins/index.ts` via `agentRegistry.register()`.

## CLI Commands

```bash
npm run build                    # Compile TypeScript
uibench run -a dummy,noop        # Run benchmark with agents
uibench run --list-agents        # List available agents
uibench eval runs/<id>/          # Re-evaluate existing run
uibench report runs/<id>/        # Regenerate HTML report
```

## Directory Structure

```
src/
├── cli/commands/     # run.ts, eval.ts, report.ts - command implementations
├── config/           # schema.ts (Zod), load.ts (file loading)
├── execution/
│   ├── agent/        # adapter.ts (base class), registry.ts, builtins/
│   ├── appManager/   # React dev server lifecycle management
│   └── runner/       # runEngine.ts - batch execution with timeout
├── evaluation/
│   ├── scoring/      # binaryScorer.ts (TP/FP/FN/TN), metrics.ts
│   └── compare/      # multiAgentReport.ts
└── visualization/html/  # template.ts, render.ts
```

## Data Files

- `data/ui-scenes/scenes.json` - Scene definitions (URLs or local React projects)
- `data/test-cases/test-case-config.json` - Test cases with ground truth
- `runs/<runId>/` - Output artifacts (metrics.json, score.json, report.html)

## Key Patterns

1. **Scoring**: Binary classification comparing `ground_truth.has_defect` vs `AgentResult.hasDefect`
2. **Dev Server**: `ReactDevServerManager` auto-starts local projects with dynamic port allocation
3. **Registry**: Singleton `agentRegistry` for agent discovery and runtime config
4. **Artifacts**: `ArtifactsManager` writes all run outputs to timestamped directories

## When Modifying

- New agent: Copy `templateAgent.ts`, implement `runCase()`, register in `index.ts`
- New metric: Extend `src/evaluation/scoring/metrics.ts`
- Schema change: Update Zod schema in `schema.ts`, then update `docs/data-format.md`
- CLI option: Add to commander in `src/cli/index.ts`, handle in command file
