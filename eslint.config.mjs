// ESLint flat config (Next.js 16 + ESLint 9).
// `next lint` foi removido no Next 16; usamos o ESLint CLI com os flat configs
// exportados pelo eslint-config-next.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "drizzle/**",
      "coverage/**",
      "content/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Permite parâmetros/variáveis intencionalmente não usados com prefixo "_".
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default config;
