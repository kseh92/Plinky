
// Fix: Removed problematic type reference to 'vite' that was not found in the environment
// and replaced it with manual declarations to satisfy TypeScript.

interface ImportMetaEnv {
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fix: Augmenting the NodeJS namespace to add API_KEY to process.env.
// This avoids "Cannot redeclare block-scoped variable 'process'" errors
// by extending the existing global process type definition.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
