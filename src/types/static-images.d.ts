/**
 * Tipos dos imports estáticos de imagem (issue #42) — `next-env.d.ts` (que
 * referencia isto) é gerado pelo `next dev`/`next build` e está no
 * .gitignore, então num checkout limpo o `tsc --noEmit` do CI não conhece
 * `*.webp`/`*.png` etc. Esta referência explícita (idempotente quando o
 * next-env.d.ts também existe) mantém o typecheck verde sem build prévio.
 */
/// <reference types="next/image-types/global" />
