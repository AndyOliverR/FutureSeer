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
];
