import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import tsConfig from "eslint-config-next/typescript";
import securityPlugin from "eslint-plugin-security";

export default [
  ...coreWebVitals,
  ...tsConfig,
  {
    ...securityPlugin.configs.recommended,
    rules: {
      ...securityPlugin.configs.recommended.rules,
      "security/detect-object-injection": "off",
      "security/detect-possible-timing-attacks": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "android/**",
      "ios/**",
      "electron/**",
    ],
  },
  // Pragmatic warnings (CI still fails on errors; warnings do not fail unless --max-warnings 0).
  // Covers app routes, UI, hooks, and lib: legacy `any`, effect/setState patterns, and unescaped
  // entities in copy. Tighten types per folder over time, then narrow these globs or add a later
  // block with "error" for cleaned paths (see AGENTS.md — ESLint phased cleanup).
  {
    files: [
      "app/tools/**/*.{ts,tsx}",
      "app/api/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "hooks/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
];
