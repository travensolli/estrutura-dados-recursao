# @sequencias/web

A interface do trabalho, em React + Vite. É o palco da apresentação: todas as telas do
[roteiro](../../docs/roteiro-apresentacao.md) estão aqui, calibradas para caber numa janela de
1366×768 sem rolagem.

## Como rodar

```bash
pnpm dev        # da raiz: sobe API e interface juntas — http://localhost:5173
```

Com Docker, `docker compose up --build` serve a interface em <http://localhost:8080>.

## Telas

| Tela                | Rota            | O que mostra                                                       |
| ------------------- | --------------- | ------------------------------------------------------------------ |
| Início              | `/`             | O problema, a definição de recursão e as três sequências           |
| Calcular            | `/calcular`     | Valor e métricas de uma execução, com os dois modos comparáveis    |
| Comparar desempenho | `/comparar`     | Tempo, memória e chamadas evitadas, com as curvas por n            |
| Árvore de chamadas  | `/arvore`       | A árvore em SVG, com zoom, recolhimento e exportação em SVG e PNG  |
| Modo apresentação   | `/apresentacao` | Os slides da aula: o cache no Tribonacci f(7), de 46 a 16 chamadas |

O estado das telas vive no endereço (`/calcular?sequencia=tribonacci&n=7&modo=sem_cache`), então
qualquer configuração pode ser aberta pronta ou compartilhada por link.

## Mapa das pastas

| Pasta                      | Responsabilidade                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `src/paginas/`             | Uma página por tela, com os testes ao lado                                                |
| `src/arvore/`              | Layout (d3-hierarchy), desenho em SVG, zoom, lista, reprodução passo a passo e exportação |
| `src/arvore/apresentacao/` | Os slides do modo apresentação                                                            |
| `src/comparar/`            | O cartão "Como a comparação é feita" e o resultado da medição                             |
| `src/api/`                 | Cliente da API, consultas (TanStack Query) e detecção de indisponibilidade                |
| `src/plano-b/`             | Cálculo no próprio navegador quando a API não responde (ver abaixo)                       |
| `src/trabalhadores/`       | O Web Worker que executa o plano B fora da thread da interface                            |
| `src/componentes/`         | Componentes compartilhados: abas, alertas, barras, painéis                                |

## O plano B embutido

Se a API estiver fora do ar, a interface não trava: detecta a indisponibilidade
(`src/api/cliente.ts`) e calcula no próprio navegador, num Web Worker, usando o mesmo
[núcleo](../../packages/nucleo/README.md). Valor, contagens e árvore continuam exatos, com os
limites de n do navegador; só a comparação de tempo e memória exige a API, porque o método de
medição precisa do Node (ver o [README da API](../api/README.md)).

## Testes

```bash
pnpm --filter @sequencias/web test   # Vitest + Testing Library, API simulada com MSW
pnpm e2e                             # Playwright: navegação, telas do roteiro, dobra em 1366×768 e acessibilidade (axe)
```

Para o e2e, instale os navegadores antes: `pnpm --filter @sequencias/web exec playwright install`.
