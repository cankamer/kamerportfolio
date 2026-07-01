import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // React Three Fiber drives a mutable render loop (mutating meshes/refs inside
  // useFrame, one-time randomized geometry in useMemo). The React Compiler
  // purity/immutability rules are fundamentally incompatible with that model,
  // so we disable them for the 3D layer only.
  {
    files: ["components/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // Measuring the DOM, reading matchMedia and SSR "mounted" flags legitimately
  // require setState inside an effect; keep the rule as advisory, not an error.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
