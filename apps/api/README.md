# @sequencias/api

API Fastify que executa os algoritmos do [núcleo](../../packages/nucleo/README.md) e devolve valor,
métricas, árvore de chamadas e comparações de desempenho. É também quem gera o relatório estático
de `docs/` (`pnpm relatorio`).

O método de medição está descrito no [artigo](../../README.md), seção 3.

## Como rodar

```bash
pnpm --filter @sequencias/api dev   # http://localhost:3333, com --expose-gc e watch
```

- Saúde: <http://localhost:3333/api/saude>
- Documentação OpenAPI (Swagger UI): <http://localhost:3333/docs>

O `--expose-gc` não é opcional: a medição de memória força a coleta de lixo antes e depois de cada
bloco, e sem a flag o endpoint de comparação não consegue medir.

## Rotas

| Rota                   | O que faz                                                                   |
| ---------------------- | --------------------------------------------------------------------------- |
| `POST /api/calcular`   | Uma execução instrumentada: valor, placar e invocações por argumento        |
| `POST /api/comparar`   | Os dois modos lado a lado: contagens exatas, tempo mediano e memória retida |
| `POST /api/arvore`     | A árvore de chamadas de uma execução, com corte por limite de nós           |
| `POST /api/serie`      | A série de medições por n, que vira as curvas da tela Comparar              |
| `POST /api/estimativa` | Previsão de invocações pela fórmula fechada, sem executar nada              |
| `GET /api/sequencias`  | As sequências disponíveis, limites e o código-fonte real das funções        |
| `GET /api/saude`       | Healthcheck usado pelo Docker Compose                                       |

Entrada e saída são validadas com os schemas Zod do
[contrato](../../packages/contrato/README.md).

## Mapa das pastas

| Pasta            | Responsabilidade                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/rotas/`     | Uma rota por arquivo, com os testes ao lado                                                                                 |
| `src/trabalho/`  | Execução em `worker_threads`: fila, tempo limite, pilha ampliada e tradução de erros (estouro de pilha vira mensagem clara) |
| `src/medicao/`   | O método: aquecimento, modos alternados, mediana das repetições, coleta de lixo forçada e leitura do heap                   |
| `src/relatorio/` | O gerador de `docs/relatorio.html`, `docs/resultados-benchmark.md` e dos SVGs de `docs/figuras/`                            |
| `src/http/`      | Swagger, registro de schemas e formato único de erro                                                                        |

## Por que medir aqui, e não no navegador

No Node há relógio de nanossegundos (`process.hrtime.bigint`), coleta de lixo sob demanda e leitura
do heap. No navegador o relógio tem precisão reduzida de propósito e a aba disputa processador com a
renderização. Por isso os números oficiais do trabalho saem sempre desta API.

## Testes

```bash
pnpm --filter @sequencias/api test
```
