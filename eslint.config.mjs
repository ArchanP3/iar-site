import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Imported marketing-site components (from automiq-website @ ee95a01) break
  // the React Compiler hook rules in ways that work at runtime (URL-param
  // prefill in effects, refs read during render in WebGL effects). Warn
  // rather than fail CI; fix when these components are next touched.
  {
    files: [
      "src/components/CircularGallery.tsx",
      "src/components/GradientWaves.jsx",
      "src/components/IndustriesCarousel.tsx",
      "src/components/ReflectiveCard.tsx",
      "src/components/SpotlightCard.jsx",
      "src/components/fault-codes/**",
      "src/components/request/**",
    ],
    rules: {
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  // CMS export buttons are file downloads from route handlers, not pages.
  { files: ["src/app/admin/**"], rules: { "@next/next/no-html-link-for-pages": "off" } },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
