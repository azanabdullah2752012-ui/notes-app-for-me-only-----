/// <reference types="vite/client" />

// Allow CSS module imports as side-effects
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
