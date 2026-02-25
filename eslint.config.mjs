import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import tsConfig from "eslint-config-next/typescript";

export default [
  ...coreWebVitals,
  ...tsConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "android/**",
      "ios/**",
      "electron/**",
    ],
  },
];
