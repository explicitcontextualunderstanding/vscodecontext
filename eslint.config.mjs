import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // JavaScript Configuration
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
  },
  // TypeScript Recommended Configuration
  ...tseslint.configs.recommendedTypeChecked,
   // TypeScript Specific Configuration
  {
    files: ["**/*.ts"],
    ignores: ["**/dist/*", "**/coverage/*", "**/*.cjs"],
    plugins: {
      import: (await import("eslint-plugin-import")).default,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
      parserOptions: {
        project: true,
        sourceType: "module",
      },
    },
    rules: {
      // Overriding default rules
      "no-unused-vars": "off", // Turn off default JS no-unused-vars rule
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn", // Forcing return type annotations
      "@typescript-eslint/consistent-type-imports": "warn", // Enforce type imports

    },
  },
  // More specific rules for TS files
    {
      files: ["**/*.ts"],
      rules: {
        "import/order": [
            "warn",
            {
              groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
              pathGroups: [
                {
                  pattern: "~/components/**",
                  group: "internal",
                },
                {
                  pattern: "~/assets/**",
                  group: "internal",
                },
                {
                  pattern: "~/constants/**",
                  group: "internal",
                },
                {
                  pattern: "~/hooks/**",
                  group: "internal",
                },
                {
                  pattern: "~/pages/**",
                  group: "internal",
                },
                {
                  pattern: "~/types/**",
                  group: "internal",
                },
                {
                  pattern: "~/utils/**",
                  group: "internal",
                },
                {
                  pattern: "~/store/**",
                  group: "internal",
                },
                {
                  pattern: "~/lib/**",
                  group: "internal",
                },
              ],
              "newlines-between": "always",
              alphabetize: {
                order: "asc",
                caseInsensitive: true,
              },
            },
          ],
         // Add more specific rules for imports

      }

    }
];