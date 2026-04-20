// Re-export the runtime execution prompt so other providers can reuse it
// without creating a circular import on ollama.ts.
export { RUNTIME_EXECUTION_PROMPT } from './ollama';
