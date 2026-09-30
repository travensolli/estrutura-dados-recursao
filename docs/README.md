# Documentação

O [`README.md`](../README.md) da raiz é o **artigo** do trabalho: enunciado, fundamentação, método,
resultados, discussão, a explicação de Tribonacci f(7) e as instruções de execução. Ele é a fonte a
partir da qual a apresentação é montada.

Aqui ficam **apenas** o material da apresentação, a rodada de medições registrada e as decisões de
projeto — nada é sobra de outro trabalho: o `relatorio.html` e as figuras são gerados ou exportados
por este repositório (a coluna **Origem** diz por quem). A documentação de cada app e pacote fica
junto do código, no README de cada um:
[`packages/contrato`](../packages/contrato/README.md),
[`packages/nucleo`](../packages/nucleo/README.md), [`apps/api`](../apps/api/README.md),
[`apps/web`](../apps/web/README.md) e [`apps/cli`](../apps/cli/README.md).

## Índice

| Documento                                          | Para que serve                                                          | Origem            |
| -------------------------------------------------- | ----------------------------------------------------------------------- | ----------------- |
| [relatorio.html](relatorio.html)                   | Apoio e plano B: enunciado, árvore de f(7), gráficos e tabelas, sem app | Gerado por script |
| [resultados-benchmark.md](resultados-benchmark.md) | A mesma rodada de medições em Markdown, para revisar no editor          | Gerado por script |
| [decisoes.md](decisoes.md)                         | Registro de decisões: data, contexto, decisão e consequência            | Vivo              |
| [figuras/](figuras/)                               | Árvores e gráficos em SVG e PNG, para slides e plano B                  | Misto             |

## Por onde começar

- Quem vai **entender o trabalho**: o [artigo](../README.md), da seção 1 à 7.
- Quem vai **apresentar**: o app no ar (`pnpm dev`) e o [relatorio.html](relatorio.html) numa aba
  de reserva.
- Quem vai **duvidar dos números**: seção 3 do artigo (método) e
  [resultados-benchmark.md](resultados-benchmark.md) (a rodada inteira, com dispersão).
- Quem quer saber **por que foi feito assim**: [decisoes.md](decisoes.md).

## Como regerar o que é gerado

```bash
pnpm relatorio
```

O comando roda a bateria completa de medições (cerca de um minuto e meio) e reescreve
`relatorio.html`, `resultados-benchmark.md` e os quatro SVGs de `figuras/` gerados por script.
**Rode-o na véspera, na máquina que vai ser usada na aula**, para os tempos do relatório serem os
daquela máquina.

## Figuras

| Arquivo                                               | O que mostra                                                  | Origem            |
| ----------------------------------------------------- | ------------------------------------------------------------- | ----------------- |
| `figuras/arvore-tribonacci-f7.svg`                    | Os 46 nós de f(7), pintados pelo destino de cada um com cache | Gerado por script |
| `figuras/grafico-invocacoes.svg`                      | Invocações por n, nas três sequências, em eixo logarítmico    | Gerado por script |
| `figuras/grafico-tempo.svg`                           | Tempo mediano por n, em eixo logarítmico                      | Gerado por script |
| `figuras/grafico-memoria.svg`                         | Memória retida pelo cache por n, em eixo linear               | Gerado por script |
| `figuras/arvore-tribonacci-f7-sem-cache.svg` e `.png` | Os 46 nós coloridos por argumento, exportados da interface    | Exportado do app  |
| `figuras/arvore-tribonacci-f7-com-cache.svg` e `.png` | Os 16 nós, com os acertos tracejados                          | Exportado do app  |
| `figuras/tela-apresentacao-slide-conta.png`           | O slide da conta: 46 para 16, um quadrado por chamada         | Exportado do app  |
| `figuras/tela-comparar-tribonacci-f18.png`            | A tela de comparação com tempo, memória e curvas              | Exportado do app  |

Para exportar de novo as figuras da interface: abra
`/arvore?sequencia=tribonacci&n=7&modo=sem_cache`, use o botão dos quatro cantos, ajustar à tela,
e depois o de baixar, que abre a escolha entre SVG e PNG. O SVG sai com cores literais, sem
variáveis de tema, e abre em qualquer editor de slides.

## Regras destes documentos

- Português do Brasil, frases curtas e tom didático.
- Nenhum número é escrito à mão: todos vêm de execução instrumentada ou de fórmula fechada conferida
  contra execução.
- As contagens oficiais são as da seção 6 do artigo. Se um documento discordar dela, ela vence.
- `decisoes.md` só recebe decisões já tomadas, no formato data, contexto, decisão e consequência.
