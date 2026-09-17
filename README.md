# Sequências recursivas: com e sem cache (PRJ.ED.1)

Programa que calcula recursivamente, **com e sem cache**, as sequências Fatorial, Fibonacci e
Tribonacci, compara o desempenho das duas abordagens em tempo e memória e exibe a árvore de
chamadas. Trabalho da disciplina de Estrutura de Dados, escrito inteiramente em TypeScript.

- Fatorial: f(n) = n · f(n-1), com f(0) = f(1) = 1
- Fibonacci: f(n) = f(n-1) + f(n-2), com f(0) = f(1) = 1
- Tribonacci: f(n) = f(n-1) + f(n-2) + f(n-3), com f(0) = f(1) = f(2) = 1

Atenção aos casos base: Fibonacci começa em 1, 1, 2, 3, 5, 8 e Tribonacci em 1, 1, 1, 3, 5, 9,
17, 31. Com essa definição, Tribonacci f(7) = 31.

A ideia central do trabalho: a recursão sem cache refaz o mesmo subproblema muitas vezes; o cache
troca um pouco de memória por uma redução enorme no número de chamadas. Em Tribonacci f(7), são 46
invocações sem cache contra 16 com cache. A explicação completa está em
[docs/explicacao-tribonacci.md](docs/explicacao-tribonacci.md).

Todos os valores das sequências são calculados com `bigint`, porque passam do inteiro seguro do
JavaScript, e trafegam em JSON como texto decimal.

## Como rodar

Pré-requisitos: Node.js 22 e pnpm 10 (ative com `corepack enable`).

```bash
pnpm install
pnpm dev
```

- Interface: http://localhost:5173
- API: http://localhost:3333/api/saude
- Documentação OpenAPI: http://localhost:3333/docs

`pnpm dev` sobe a interface e a API em paralelo, as duas com recarga automática.

Com Docker, sem instalar Node nem pnpm na máquina:

```bash
docker compose up --build
```

- Interface: http://localhost:8080
- API: http://localhost:3333

## Telas e endereços

| Tela                | Endereço        | O que mostra                                                      |
| ------------------- | --------------- | ----------------------------------------------------------------- |
| Início              | `/`             | O problema, as três sequências e os caminhos para as outras telas |
| Calcular            | `/calcular`     | Valor e métricas de uma execução: invocações, acertos, casos base |
| Comparar desempenho | `/comparar`     | Os dois modos lado a lado, em tempo, memória e chamadas evitadas  |
| Árvore de chamadas  | `/arvore`       | A árvore da execução, com casos base, cálculos e acertos de cache |
| Modo apresentação   | `/apresentacao` | Tribonacci f(7) nos dois modos em uma tela só, para o projetor    |

O estado fica no endereço, então qualquer tela pode ser aberta pronta ou compartilhada por link:

```text
/calcular?sequencia=tribonacci&n=7&modo=sem_cache
/arvore?sequencia=tribonacci&n=7&modo=com_cache
/comparar?sequencia=fatorial&n=10
```

Os parâmetros são `sequencia` (`fatorial`, `fibonacci` ou `tribonacci`), `n` (inteiro não negativo)
e `modo` (`sem_cache` ou `com_cache`).

Os detalhes visuais das telas ainda estão sendo construídos, então a aparência pode mudar; os
endereços e os parâmetros acima são os definidos para a entrega.

## Linha de comando

```bash
pnpm cli tribonacci 7 --modo sem_cache --arvore
```

Imprime o valor, as métricas da execução e, com `--arvore`, a árvore de chamadas em texto indentado.
Serve para conferir os números sem abrir o navegador.

## Mapa do repositório

```
packages/contrato   schemas Zod, tipos e limites compartilhados
packages/nucleo     algoritmos puros e instrumentados (TypeScript puro)
apps/api            Fastify: cálculo, benchmarks em worker_threads, árvore
apps/web            React + Vite: telas, árvore em SVG, modo apresentação
apps/cli            execução por terminal
docs/               explicação, roteiro, metodologia, decisões e resultados
scripts/            checagens locais equivalentes ao CI
```

O contrato é o centro do projeto: interface, API e linha de comando falam pelos mesmos tipos e pelos
mesmos schemas, validados em tempo de execução.

## Qualidade e testes

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier
pnpm typecheck     # tsc --noEmit em todos os pacotes
pnpm test          # Vitest em todos os pacotes e teste dos hooks
pnpm e2e           # Playwright (após instalar navegadores)
pnpm ci:local      # tudo acima, na mesma ordem do CI
```

O mesmo conjunto roda no GitHub Actions a cada envio, junto com a checagem das mensagens de commit.

## Documentação

O índice completo está em [docs/README.md](docs/README.md).

- [docs/explicacao-tribonacci.md](docs/explicacao-tribonacci.md): as árvores de f(7), as contagens
  e as fórmulas de crescimento.
- [docs/roteiro-apresentacao.md](docs/roteiro-apresentacao.md): o roteiro da apresentação, a
  demonstração passo a passo e o plano B.
- [docs/metodologia-medicao.md](docs/metodologia-medicao.md): como medimos tempo e memória, e o que
  cada número significa.
- [docs/decisoes.md](docs/decisoes.md): as decisões de projeto, com contexto e consequência.

## Convenções de Git

Gitflow (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`) e Conventional Commits com escopos
fixos, validados por hook e pelo CI.

```
tipo(escopo): descrição no imperativo
```

- Tipos: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`.
- Escopos: `nucleo`, `contrato`, `api`, `web`, `cli`, `docs`, `infra`, `repo`.
- Cabeçalho com no máximo 72 caracteres, descrição em minúscula e sem ponto final.
