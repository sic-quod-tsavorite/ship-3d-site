import globals from "globals";
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vuePlugin from "eslint-plugin-vue";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist/**", "public/**", "node_modules/**"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      vue: vuePlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        __THREE_DEVTOOLS__: "readonly",
        VideoFrame: "readonly",
        DracoDecoderModule: "readonly",
      },
    },
  },

  js.configs.recommended,

  {
    rules: {
      "no-undef": "error",
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-empty": "error",
      "prettier/prettier": ["warn", {}],
    },
  },

  ...((vuePlugin.configs && vuePlugin.configs["flat/essential"]) || []),

  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  },
];
