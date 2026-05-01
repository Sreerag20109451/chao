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
      "react/no-unescaped-entities": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["src/controllers/**/*.ts", "src/controllers/**/*.tsx"],
    rules: {
      // Strict MVC enforcement for controller layer.
      // Controllers can coordinate models/services, but must not import page Views.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/pages/*"],
              message:
                "Controllers must not import page components. Keep View dependencies one-way.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/models/**/*.ts"],
    rules: {
      // Strict MVC enforcement for model layer.
      // Models are pure contracts/domain objects.
      // Prevent framework/UI/service coupling at the model layer.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "next/*", "@/components/*", "@/lib/firebase/*", "@/controllers/*"],
              message:
                "Models must stay framework-agnostic and must not import UI, controllers, or Firebase.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/pages/Orders.tsx"],
    rules: {
      // Strict MVC enforcement on the refactored Orders view.
      // This page now uses controllers and should never regress to direct Firebase imports.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/firebase/*"],
              message:
                "Orders view must use controllers/hooks instead of importing Firebase directly.",
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
