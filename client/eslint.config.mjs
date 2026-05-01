import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Keep CI useful for deploy gating without failing existing app code on
      // advisory React compiler checks or broad legacy typing cleanup.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // NOTE: Client app still has significant legacy lint debt.
  // We keep Next + TypeScript strictness from eslint-config-next, and add
  // targeted architecture rules incrementally as modules are refactored.
  {
    files: ["src/controllers/**/*.ts", "src/controllers/**/*.tsx"],
    rules: {
      // MVC boundary for client controllers:
      // controllers must not import pages/components directly.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/pages/*", "@/components/*"],
              message:
                "Client controllers must not import UI directly. Keep controller logic UI-agnostic.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/models/**/*.ts"],
    rules: {
      // MVC boundary for client models:
      // models must stay pure and framework/data-layer agnostic.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "next/*", "@/pages/*", "@/components/*", "@/lib/firebase/*", "@/controllers/*"],
              message:
                "Client models must not depend on UI, controllers, or Firebase implementation details.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
