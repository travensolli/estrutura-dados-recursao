# Sequências recursivas: com e sem cache (PRJ.ED.1)

Programa que calcula recursivamente, **com e sem cache**, as sequências
Fatorial, Fibonacci e Tribonacci, compara o desempenho das duas abordagens em
tempo e memória e exibe a árvore de chamadas. Trabalho da disciplina de
Estrutura de Dados, escrito inteiramente em TypeScript.

- Fatorial: f(n) = n · f(n-1), com f(0) = f(1) = 1
- Fibonacci: f(n) = f(n-1) + f(n-2), com f(0) = f(1) = 1
- Tribonacci: f(n) = f(n-1) + f(n-2) + f(n-3), com f(0) = f(1) = f(2) = 1

## Como rodar

Pré-requisitos: Node.js 22 e pnpm 10 (ative com `corepack enable`).

```bash
pnpm install
pnpm dev
```

- Interface: http://localhost:5173
- API: http://localhost:3333/api/saude
- Documentação OpenAPI: http://localhost:3333/docs

Com Docker:

```bash
docker compose up --build
```

- Interface: http://localhost:8080
- API: http://localhost:3333

Pela linha de comando:

```bash
pnpm cli tribonacci 7 --modo sem_cache --arvore
```

## Mapa do repositório

```
packages/contrato   schemas Zod, tipos e limites compartilhados
packages/nucleo     algoritmos puros e instrumentados (TypeScript puro)
apps/api            Fastify: cálculo, benchmarks em worker_threads, árvore
apps/web            React + Vite: telas, árvore em SVG, modo apresentação
apps/cli            execução por terminal
docs/               roteiro, decisões, figuras e resultados de benchmark
scripts/            checagens locais equivalentes ao CI
```

## Qualidade

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm typecheck     # tsc --noEmit em todos os pacotes
pnpm test          # Vitest em todos os pacotes e teste dos hooks
pnpm e2e           # Playwright (após instalar navegadores)
pnpm ci:local      # tudo acima, na mesma ordem do CI
```

## Convenções de Git

Gitflow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`) e
Conventional Commits com escopos fixos, validados por hook e pelo CI.
Decisões de projeto em [docs/decisoes.md](docs/decisoes.md).
