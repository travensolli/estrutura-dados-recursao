# @sequencias/cli

Execução por terminal: valor, placar de métricas, invocações por argumento e a árvore de chamadas
em texto indentado. É o segundo degrau do plano B da apresentação: se a interface falhar, o
terminal mostra os mesmos números, porque roda o mesmo
[núcleo](../../packages/nucleo/README.md).

## Uso

Da raiz do repositório:

```bash
pnpm cli <sequencia> <n> [opções]
```

```bash
pnpm cli tribonacci 7 --modo sem_cache --arvore
pnpm cli fibonacci 10 --modo com_cache
pnpm cli fatorial 10 --json
```

| Opção              | Efeito                                                    |
| ------------------ | --------------------------------------------------------- |
| `--modo <modo>`    | `sem_cache` (padrão) ou `com_cache`                       |
| `--arvore`         | Imprime a árvore de chamadas em texto indentado           |
| `--limite-nos <n>` | Nós exibidos na árvore (padrão: 300)                      |
| `--json`           | Saída em JSON, para conferir números ou alimentar scripts |
| `--ajuda`          | Mostra as opções e os limites                             |

As sequências são `fatorial`, `fibonacci` e `tribonacci`. Os limites de n por sequência e modo são
os mesmos do resto do projeto, definidos no
[contrato](../../packages/contrato/README.md).

## Mapa dos arquivos

| Arquivo             | Responsabilidade                                     |
| ------------------- | ---------------------------------------------------- |
| `src/index.ts`      | Ponto de entrada: repassa `argv` e o código de saída |
| `src/cli.ts`        | Interpretação dos argumentos, ajuda e erros          |
| `src/formatacao.ts` | Números, placar e árvore em texto                    |

## Testes

```bash
pnpm --filter @sequencias/cli test
```
