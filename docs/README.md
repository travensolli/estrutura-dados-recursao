# Documentação

Índice dos documentos do trabalho PRJ.ED.1. O `README.md` da raiz explica como instalar e rodar o
projeto; aqui ficam o conteúdo didático, o roteiro da aula e as decisões técnicas.

## Índice

| Documento                                            | Para que serve                                                            | Status                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------- |
| [explicacao-tribonacci.md](explicacao-tribonacci.md) | Base conceitual: árvores de f(7), contagens, fórmulas e custo em memória  | Pronto                        |
| [roteiro-apresentacao.md](roteiro-apresentacao.md)   | O que dizer nos 15 minutos, demonstração clique a clique e plano B        | Pronto, com pontos a conferir |
| [metodologia-medicao.md](metodologia-medicao.md)     | Como medimos tempo e memória, e as limitações assumidas                   | Pronto, com pontos a conferir |
| [decisoes.md](decisoes.md)                           | Registro de decisões: data, contexto, decisão e consequência              | Vivo, cresce com o projeto    |
| [resultados-benchmark.md](resultados-benchmark.md)   | Rodada de medições registrada, gerada por script                          | Pronto, regerável             |
| [figuras/](figuras/)                                 | Árvores de f(7) em SVG e PNG e telas do aplicativo, para slides e plano B | Pronto                        |

"Pronto, com pontos a conferir" quer dizer que o texto está completo, mas contém trechos marcados
com **a conferir na revisão final**. São pontos que dependem de partes da interface, da linha de
comando ou do medidor que ainda estão sendo construídas em paralelo.

## Por onde começar

- Quem vai **entender o trabalho**: `explicacao-tribonacci.md`.
- Quem vai **apresentar**: `roteiro-apresentacao.md`, com a explicação ao lado.
- Quem vai **duvidar dos números**: `metodologia-medicao.md`.
- Quem quer saber **por que foi feito assim**: `decisoes.md`.

## Regras destes documentos

- Português do Brasil, frases curtas e tom didático.
- Nenhum número é escrito à mão: todos vêm de execução instrumentada ou de fórmula fechada
  conferida contra execução.
- As contagens oficiais são as de `explicacao-tribonacci.md`. Se um documento discordar dela, ela
  vence.
- `decisoes.md` só recebe decisões já tomadas, no formato data, contexto, decisão e consequência.

## Figuras

Exportadas do próprio aplicativo, então mostram a execução real:

| Arquivo                                               | O que mostra                                         |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `figuras/arvore-tribonacci-f7-sem-cache.svg` e `.png` | Os 46 nós de f(7) sem cache, coloridos por argumento |
| `figuras/arvore-tribonacci-f7-com-cache.svg` e `.png` | Os 16 nós com cache, com os acertos tracejados       |
| `figuras/tela-apresentacao-etapa-conta.png`           | A etapa da conta: 46 para 16, com as duas provas     |
| `figuras/tela-comparar-tribonacci-f18.png`            | A tela de comparação com tempo, memória e curvas     |

Para gerar de novo: abra `/arvore?sequencia=tribonacci&n=7&modo=sem_cache`, use
"Ajustar à tela" e depois "Baixar SVG" ou "Baixar PNG". O SVG sai com cores literais,
sem variáveis de tema, e abre em qualquer editor de slides.
