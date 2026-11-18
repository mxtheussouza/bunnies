const { builtinModules } = require("node:module");
const nodeImports = [
  ...new Set(
    builtinModules.flatMap(name => [
      name,
      name.startsWith("node:") ? name : `node:${name}`,
    ]),
  ),
];
const js = require("@eslint/js");
const parser = require("@typescript-eslint/parser");
const typescript = require("@typescript-eslint/eslint-plugin");
const hooks = require("eslint-plugin-react-hooks");

module.exports = [
  { ignores: ["node_modules/**", ".webpack/**", "out/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["tools/testing/*.cjs"],
    // These globals occur inside functions serialized by Playwright into Chromium.
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        location: "readonly",
        Notification: "readonly",
        getComputedStyle: "readonly",
        fetch: "readonly",
      },
    },
  },
  {
    files: ["**/*.{js,cjs}"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: { parser },
    plugins: { "@typescript-eslint": typescript, "react-hooks": hooks },
    rules: {
      ...typescript.configs.recommended.rules,
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },
  {
    files: [
      "src/renderer/**/*.{ts,tsx}",
      "src/common/**/*.{ts,tsx}",
      "src/providers/**/*.{ts,tsx}",
      "misc/window/**/*.{ts,tsx}",
      "src/shared/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...nodeImports,
            "electron",
            "electron/renderer",
            "electron/common",
          ],
          patterns: [
            "@src/main/**",
            "@src/preload/**",
            "**/main/**",
            "**/preload/**",
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...nodeImports,
            "electron",
            "electron/renderer",
            "electron/common",
            "react",
            "react-dom",
          ],
          patterns: [
            "@src/main/**",
            "@src/preload/**",
            "@src/renderer/**",
            "**/main/**",
            "**/preload/**",
            "**/renderer/**",
          ],
        },
      ],
    },
  },
  {
    files: ["src/preload/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: nodeImports, patterns: ["@src/main/**", "**/main/**"] },
      ],
    },
  },
];
