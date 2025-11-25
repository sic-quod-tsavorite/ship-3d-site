import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist/**", "public/**", "node_modules/**"],
  },
  // Base configuration for all files
  {
    plugins: {
      "@typescript-eslint": tsPlugin,
      vue: vuePlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        __THREE_DEVTOOLS__: "readonly",
        VideoFrame: "readonly",
        DracoDecoderModule: "readonly",
      },
    },
  },
  // Vue files configuration
  {
    files: ["**/*.vue"],
    plugins: {
      vue: vuePlugin,
    },
    languageOptions: {
      // use the vue-eslint-parser to parse SFCs, and use @typescript-eslint/parser for the script blocks
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        sourceType: "module",
        ecmaVersion: 2022,
        extraFileExtensions: [".vue"],
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...(tsPlugin.configs?.recommended?.rules ?? {}),
      ...(tsPlugin.configs?.["recommended-requiring-type-checking"]?.rules ??
        {}),
      ...(vuePlugin.configs?.["vue3-recommended"]?.rules ?? {}),
      ...(vuePlugin.configs?.["vue3-typescript"]?.rules ?? {}),
      ...(prettierPlugin.configs?.recommended?.rules ?? {}),
      "vue/html-indent": ["error", 2],
      "vue/max-attributes-per-line": "off",
      "vue/multi-word-component-names": "error",
      "vue/no-unused-components": "error",
      "prettier/prettier": [
        "error",
        {
          htmlWhitespaceSensitivity: "ignore",
          bracketSameLine: false,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "no-undef": "off",
    },
  },
  // TypeScript files configuration
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "@typescript-eslint": tsPlugin },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      ...(tsPlugin.configs?.recommended?.rules ?? {}),
      ...(tsPlugin.configs?.["recommended-requiring-type-checking"]?.rules ??
        {}),
      ...(prettierPlugin.configs?.recommended?.rules ?? {}),
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "no-undef": "off",
    },
  },
];
