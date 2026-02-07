/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GEMINI_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_LYRIA_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
