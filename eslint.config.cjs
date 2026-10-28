const js = require("@eslint/js");
const parser = require("@typescript-eslint/parser");
const typescript = require("@typescript-eslint/eslint-plugin");
const hooks = require("eslint-plugin-react-hooks");

module.exports = [
  { ignores: ["node_modules/**", ".webpack/**", "out/**", "coverage/**"] },
  js.configs.recommended,
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
];
