export interface Env {
  DB: D1Database;
  AI: Ai;
  BUCKET: R2Bucket;
  ENVIRONMENT: string;
}

// Shared Hono generics so every route module is typed against our bindings.
export type AppEnv = { Bindings: Env };
