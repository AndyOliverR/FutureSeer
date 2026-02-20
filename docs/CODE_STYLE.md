# Code style and conventions

## Naming

- **TypeScript/JavaScript**: Use **camelCase** for variables, functions, and method names. Use **PascalCase** for types, interfaces, classes, and React components.
- **Reserve snake_case** for fields that mirror external APIs or database documents (e.g. Firestore keys, third-party JSON). Do not use snake_case for local variables or function names.
- Constants: **UPPER_SNAKE_CASE** for true constants; camelCase for config objects that are mutated or reassigned.

## Typing

- Prefer **concrete types** or **`unknown` with type guards** over `any`. Use `unknown` and narrow with `typeof`, `in`, or small guard functions (e.g. `isRecord(x)`) instead of `as any`.
- When touching high-traffic modules (e.g. `lib/firebase.ts`, `lib/dashboardDataExtractor.ts`, API routes), improve types incrementally: replace one or two `any` usages with proper types per change.
- Add shared type guards in `lib/` when the same shape is checked in multiple places.

## Logging

- Use **`devLog`** from `@/lib/devLogger` for app, components, and lib. No raw `console.log` / `console.warn` / `console.debug`; use `devLog.debug`, `devLog.warn`. Use `devLog.error` in catch blocks. Logger implementation files (`lib/consoleLogger.ts`, `lib/devLogger.ts`) may call `console.*` internally.
