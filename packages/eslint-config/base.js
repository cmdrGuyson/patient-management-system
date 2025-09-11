import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      import: pluginImport,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      ...pluginImport.configs.recommended.rules,
    },
  },
  {
    plugins: {
      onlyWarn,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
  {
    ignores: ["dist/**"],
  },
];
