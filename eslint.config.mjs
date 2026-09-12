import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Source design file plus its vendored Claude Design runtime — input to the build, not
    // application code.
    "design/**",
    // Node build script for `npm run design:build`; runs outside the bundler.
    "tools/**",
  ]),
]);

export default eslintConfig;
