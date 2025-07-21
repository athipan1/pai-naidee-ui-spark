import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


export default [
  {
    ignores: ["dist", "build", "postcss.config.js", "tailwind.config.js", "vite.config.ts", "eslint.config.js", ".github/"],
  },
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
        ...pluginReact.configs.flat.recommended.rules,
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off"
    }
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off"
    }
  }
];
