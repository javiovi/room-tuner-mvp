import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    rules: {
      // This codebase relies on the mounted-guard pattern (useState(false) + useEffect
      // -> setState(true)) to avoid SSR/client hydration mismatches for browser-only
      // APIs (ThemeToggle, locale, audio support, etc). That's the exact case this
      // rule flags — keep it off rather than fight a correct, deliberate pattern.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default eslintConfig
