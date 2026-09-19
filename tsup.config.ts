import { defineConfig } from "tsup"

const external = [
  "react",
  "react-dom",
  "ai",
  "@openrouter/ai-sdk-provider",
]

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
    external,
  },
  {
    entry: { server: "src/server.ts", openrouter: "src/openrouter.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
    external,
  },
])
