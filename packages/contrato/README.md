# @sequencias/contrato

A fonte única de verdade sobre os dados que circulam no repositório: schemas Zod, tipos derivados
deles e constantes de limite. Núcleo, API, CLI e interface importam daqui, então uma mudança de
formato acontece num lugar só e o TypeScript aponta todos os afetados.

## Mapa dos arquivos

| Arquivo             | O que define                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/sequencias.ts` | As sequências (`fatorial`, `fibonacci`, `tribonacci`), os modos (`sem_cache`, `com_cache`), nomes e descrições |
| `src/limites.ts`    | Os tetos de n por ambiente (Node e navegador), sequência e modo, e os limites de nós da árvore                 |
| `src/metricas.ts`   | O placar de uma execução: invocações, casos base, acertos, cálculos, profundidade                              |
| `src/arvore.ts`     | O nó da árvore de chamadas e a resposta com a árvore, inclusive o corte por limite de nós                      |
| `src/api.ts`        | Pedidos e respostas de cada rota da API                                                                        |
| `src/erros.ts`      | O formato único de erro (`codigo` + `mensagem`) e a classe `ErroSequencia`                                     |

## Regras que este pacote garante

- **Validação nas bordas.** A API valida entrada e saída com estes schemas
  (`fastify-type-provider-zod`), e a interface valida o que recebe antes de renderizar.
- **Limites antes de executar.** Sem cache o custo é exponencial, então `limites.ts` define um teto
  por sequência e modo, diferente no Node e no navegador. Quem valida n usa a mesma tabela.
- **`bigint` trafega como string.** JSON não tem `bigint`, então os schemas serializam os valores
  como texto e cada ponta converte de volta.

## Testes

```bash
pnpm --filter @sequencias/contrato test
```
