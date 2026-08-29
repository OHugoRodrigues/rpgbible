// O lint com reconhecimento de tipos não carrega as declarações que o Next traz
// via `next-env.d.ts`, e passa a acusar o import de efeito colateral do CSS
// global. Declarar aqui mantém `tsc` e `oxlint` de acordo.
declare module '*.css';
