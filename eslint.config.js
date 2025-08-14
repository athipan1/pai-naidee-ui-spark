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
        "react/prop-types": "off",
        "react/no-unknown-property": ["error", { "ignore": ["position", "intensity", "args", "object", "emissive", "emissiveIntensity", "color", "distance", "decay", "angle", "penumbra", "castShadow", "receiveShadow", "geometry", "material", "rotation", "scale", "visible", "userData", "attach", "dispose", "raycast", "onClick", "onPointerOver", "onPointerOut", "onPointerDown", "onPointerUp", "onPointerMove", "ref", "transparent", "wireframe", "metalness", "roughness", "map", "fog", "far", "near", "fov", "aspect", "layers"] }]
    }
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/no-unused-expressions": "off",
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error"
    }
  },
  // Special rules for Node.js files
  {
    files: ["**/*.{js,cjs}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];
