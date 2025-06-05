/// <reference types="vite/client" />

// Fix for sockjs-client global variable
declare const global: typeof globalThis;
