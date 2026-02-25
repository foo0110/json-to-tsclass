# Copilot instructions for json-to-tsclass

This file is intended to give future Copilot/AI sessions concise, repository-specific guidance so they can make accurate changes without guessing project conventions.

## Build, test, and lint commands
- Build (compile + emit declarations):
  - npm run build
  - (This runs: rm -rf dist & tsc)
  - Alternative: npx tsc -p tsconfig.json
- Test (full suite):
  - npm test
  - Equivalent: npx jest --coverage
- Run a single test file or pattern:
  - npx jest __tests__/build.spec.ts
  - or npx jest -t "<test name regex>" to run a specific test case
  - You can also pass a path through npm scripts: npm test -- __tests__/build.spec.ts
- Lint: no lint script or linter configured in this repo (none to run by default).

## High-level architecture
- Purpose: library that converts an array of JSON objects into a TypeScript class declaration string.
- Entry point: src/index.ts — exports the public build(name, jsonArray) API used by README examples.
- Core logic: src/build.ts — contains type-inference and rendering logic that inspects JSON values and emits TypeScript property declarations (handles nested objects, arrays, unions, arrays-of-arrays, and quoted keys).
- Output: compiled code and .d.ts files are emitted to ./dist (tsconfig outDir), and package.json points main -> dist/index.js.
- Tests: Jest (ts-jest preset) located under __tests__ with snapshot usage in __tests__/__snapshots__ to validate generated class output.

## Key conventions and repo-specific patterns
- Type inference behavior (observed from README/tests):
  - null values are represented as unknown.
  - ISO-like date strings are inferred to Date in outputs when detected.
  - Arrays produce Array<T> types; heterogeneous arrays become unions (e.g., Array<number | string>).
  - Nested objects are emitted inline as object type literals; keys that are not valid identifiers (e.g., contain hyphens) are preserved and quoted in the generated types.
  - Arrays of arrays and deeply nested combinations are explicitly supported (e.g., Array<Array<...>> and Array<{ ... } | { ... }> unions).
- Source layout and build expectations:
  - TypeScript sources live in src/**/*.ts; tsc generates dist/ with JS + .d.ts files. Ensure a clean dist/ (npm run build) before publishing.
- Tests and snapshots:
  - Snapshot files live under __tests__/__snapshots__ alongside test specs; updating code that changes generated output will typically require updating snapshots (npx jest -u).
- Configuration files worth consulting before edits:
  - package.json (scripts, main/files)
  - tsconfig.json (strict=true, declaration output, outDir=./dist)
  - jest.config.ts (ts-jest preset)

## Where to look when changing behavior
- Implementations affecting type logic: src/build.ts
- Public API surface: src/index.ts and README.md (example usage)
- Tests to update when changing output format: __tests__/build.spec.ts and its snapshots

## Publishing notes
- dist/ is included in package.json "files"; build must be run before publishing to ensure dist/ is present.

---

If anything above should be more detailed or you want additional coverage (for example: contributor workflows, CI, or release steps), say which area to expand and it will be added.
