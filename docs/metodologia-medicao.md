# Metodologia de medição

Este documento explica como o projeto mede tempo e memória, e por que mede assim. A pergunta que
ele responde é simples: quando a tela mostra que o modo com cache foi mais rápido, o que exatamente
foi cronometrado?

A base conceitual (árvores, contagens e fórmulas) está em `docs/explicacao-tribonacci.md`. O que
dizer na apresentação está em `docs/roteiro-apresentacao.md`.

Princípio que vale para o documento inteiro: **nenhum número exibido é digitado à mão**. Tudo vem de
uma execução de verdade, feita na hora ou registrada em `docs/resultados-benchmark.md`.

Status: este documento define o método combinado e os campos de resposta já fixados em
`packages/contrato/src/api.ts`. O código de medição está sendo escrito em paralelo em
`packages/nucleo` e `apps/api`. Os pontos marcados com "a conferir na revisão final" dependem dele.

## 1. O que medimos e o que não medimos

Há três famílias de números no projeto, e elas têm naturezas diferentes:

| Família              | Exemplos                                    | Natureza               |
| -------------------- | ------------------------------------------- | ---------------------- |
| Contagens            | invocações, calculados, acertos, casos base | exatas e repetíveis    |
| Métricas estruturais | profundidade máxima, entradas no cache      | exatas e repetíveis    |
| Medidas              | tempo, memória retida, pico de heap         | aproximadas, com ruído |

As contagens e as métricas estruturais são propriedades do algoritmo. Rodando duas vezes com o mesmo
n, dão exatamente o mesmo resultado, em qualquer máquina. As medidas dependem do computador, do
sistema operacional e do que mais está rodando. Por isso a interface sempre mostra as duas coisas
lado a lado: a contagem prova o argumento, e a medida ilustra o efeito prático.

### 1.1 Duas versões de cada algoritmo

Cada sequência existe em duas versões dentro de `packages/nucleo`:

- **Versão pura**: só calcula. Não conta chamadas, não monta árvore, não olha a memória.
- **Versão instrumentada**: conta invocações, separa casos base, acertos e cálculos, registra a
  profundidade e, quando pedido, monta a árvore de chamadas.

O cronômetro roda **somente sobre a versão pura**. A versão instrumentada é mais lenta, porque
incrementa contadores e aloca objetos a cada chamada. Cronometrá-la mediria o custo da nossa
instrumentação, não o custo do algoritmo.

A rota `POST /api/calcular` devolve um campo `duracao_ms`. Ele é a duração da execução instrumentada
e serve só para a pessoa saber que a resposta não travou. Não é benchmark, e o próprio contrato diz
isso. Os números oficiais de tempo vêm de `POST /api/comparar` e de `POST /api/serie`.

### 1.2 Uma execução para tempo, outra para memória

Tempo e memória **nunca saem da mesma execução**. Amostrar a memória exige chamar
`process.memoryUsage()` e forçar a coleta de lixo, e as duas coisas custam tempo. Se medíssemos
juntos, o tempo ficaria inflado e a comparação entre os modos perderia o sentido.

A ordem é: primeiro o bloco de tempo, depois o bloco de memória, cada um com suas repetições.

## 2. Medição de tempo

### 2.1 O relógio

Usamos `process.hrtime.bigint()`, que devolve nanossegundos como `bigint`. Três motivos:

- É monotônico: não anda para trás se o relógio do sistema for ajustado.
- Tem resolução de nanossegundos, contra milissegundos de `Date.now()`.
- Devolve `bigint`, então não perde precisão em intervalos longos.

Os tempos trafegam em nanossegundos nos campos terminados em `_ns` e a interface converte para a
unidade mais legível na hora de exibir.

### 2.2 Aquecimento

Antes de cronometrar, a mesma função roda algumas vezes com o resultado descartado. Isso é o
aquecimento.

O motivo é o V8. Ele começa interpretando o código e só depois de algumas execuções decide compilar
e otimizar a função. Sem aquecimento, a primeira repetição mede o código ainda não otimizado e as
seguintes medem o código otimizado, o que polui a média e enche o desvio padrão.

O número de aquecimentos é reportado no campo `aquecimentos`, junto com o resultado. Quem lê o
relatório sabe quantas execuções foram descartadas.

### 2.3 Repetições e execuções por repetição

Cada modo é medido várias vezes. O padrão é 5 repetições, o máximo é 30, e o pedido pode escolher o
valor (`REPETICOES_PADRAO` e `REPETICOES_MAXIMO` em `packages/contrato/src/limites.ts`).

Existe um problema com casos rápidos. Tribonacci f(7) com cache faz 16 chamadas: isso termina em
poucos microssegundos, perto da margem de erro do relógio e do escalonador do sistema. Medir uma
execução só daria um número instável.

A solução é a de sempre em benchmark: **repetir por dentro até acumular um tempo mínimo e dividir**.
Em vez de cronometrar uma execução, o medidor executa a função em laço até o bloco passar de um
tempo mínimo, depois divide o total pelo número de execuções do laço. Cada repetição vira uma média
de um lote.

O tamanho do lote aparece no campo `execucoes_por_repeticao`. Quando ele vale 1, cada repetição foi
uma execução só. Quando vale 2 000, o caso era rápido e o tempo reportado é o tempo médio de uma
execução dentro do lote. (O valor exato do tempo mínimo por lote fica no código do medidor: a
conferir na revisão final.)

### 2.4 Estado limpo a cada repetição

Antes de cada bloco medido:

1. Chamamos o coletor de lixo (`global.gc()`), para o bloco não começar com sujeira da repetição
   anterior. Isso exige o Node com `--expose-gc`, que já está nos scripts `dev` e `start` da API.
2. Criamos um **cache novo e vazio**. O dicionário nunca sobrevive de uma repetição para a outra.

O segundo ponto é o mais importante para a honestidade da comparação. Se o cache sobrevivesse, a
segunda repetição encontraria tudo pronto e mediria uma consulta a dicionário, não o algoritmo. O
resultado passaria a depender da ordem dos cliques.

### 2.5 O que é reportado

O contrato `EstatisticasTempo` fixa os campos:

| Campo                     | Significado                                      |
| ------------------------- | ------------------------------------------------ |
| `mediana_ns`              | valor central das repetições, é o número oficial |
| `media_ns`                | média aritmética das repetições                  |
| `minimo_ns`               | repetição mais rápida                            |
| `maximo_ns`               | repetição mais lenta                             |
| `desvio_padrao_ns`        | dispersão entre as repetições                    |
| `repeticoes`              | quantas repetições entraram na conta             |
| `aquecimentos`            | quantas execuções foram descartadas antes        |
| `execucoes_por_repeticao` | tamanho do lote, quando o caso é rápido demais   |

**A mediana é o número oficial**, e não a média. Basta uma pausa do coletor de lixo, ou o sistema
operacional tirar a CPU por um instante, para uma repetição sair muito lenta. Ela desloca a média,
mas quase não mexe na mediana.

Mínimo, máximo e desvio padrão aparecem para o leitor julgar a qualidade da medida. Se o desvio for
grande perto da mediana, a medida está ruidosa e a comparação merece desconfiança. O campo
`fator_aceleracao` da resposta de comparação é a mediana sem cache dividida pela mediana com cache.

## 3. Medição de memória

Memória é mais difícil de medir do que tempo. Fazemos três leituras diferentes, com propósitos
diferentes, todas em uma execução separada da de tempo.

### 3.1 Memória retida pelo cache

É a pergunta central do trabalho: quanta memória o cache custa? O procedimento tem cinco passos:

1. Chamar o coletor de lixo.
2. Ler `process.memoryUsage().heapUsed` e guardar como linha de base.
3. Rodar o cálculo, mantendo uma referência viva para o cache.
4. Chamar o coletor de lixo de novo, **com o cache ainda referenciado**.
5. Ler `heapUsed` outra vez e subtrair a linha de base.

O passo 4 é o que dá sentido ao número. A segunda coleta joga fora todo o lixo temporário do
cálculo: os `bigint` intermediários, os quadros já desempilhados, os objetos de passagem. O que
sobra acima da linha de base é, essencialmente, o que o cache está segurando. Esse valor vai para o
campo `retida_cache_bytes`.

No modo sem cache, o mesmo procedimento roda e o esperado é um valor perto de zero. Ele existe para
servir de controle: a diferença entre os dois modos é o campo `diferenca_memoria_bytes`.

### 3.2 Pico aproximado do heap

A memória retida no fim não conta toda a história. Durante o cálculo o heap sobe e desce. Para ter
uma ideia do pico, uma variante da execução lê `heapUsed` a cada K invocações e guarda o maior valor
visto.

Duas ressalvas, ditas com todas as letras:

- O número é **aproximado**. Entre duas amostras o heap pode ter subido e descido sem ninguém ver.
- A amostragem custa caro. Por isso ela roda numa **variante que só conta**, nunca durante a medição
  de tempo.

O K usado vai no campo `intervalo_amostragem` e o pico no campo `pico_heap_bytes`. Os dois podem vir
nulos, quando a amostragem não foi feita. (O K é escolhido para render algumas centenas de amostras
sem pesar demais: o valor exato fica no código do medidor, a conferir na revisão final.)

### 3.3 As métricas estruturais

Ao lado das medidas ficam dois números exatos, que não dependem de coletor de lixo nenhum:

- `entradas_cache`: quantos pares o dicionário tem no fim. Para Tribonacci são n - 2 entradas, de
  f(3) a f(n). Para Fibonacci, n - 1. Para Fatorial, n - 1 entradas que nunca são consultadas.
- `profundidade_maxima`: maior número de quadros da função ao mesmo tempo na pilha, contando a raiz
  como 1. É n - 1 no Tribonacci e n no Fibonacci e no Fatorial, **igual nos dois modos**: o cache
  não reduz a profundidade.

Estes dois números são a parte confiável da conversa sobre memória. Quando uma medida parecer
estranha na apresentação, é para eles que se deve apontar.

## 4. Isolamento das execuções

### 4.1 Worker com pilha ampliada

Toda medição roda dentro de um `worker_thread`, e não na thread principal da API. Três ganhos:

- **Pilha ampliada**: o worker é criado com um limite de pilha maior que o padrão, o que permite a
  recursão com cache chegar a n alto sem estourar. A thread principal do Node não aceita esse ajuste
  depois de iniciada.
- **A API continua respondendo**: um cálculo de 10 segundos não congela o servidor inteiro.
- **Encerramento limpo**: se estourar o tempo limite, dá para matar o worker sem derrubar a API.

Um estouro de pilha vira o erro `PILHA_ESTOURADA`, com mensagem clara, em vez de um processo morto.

### 4.2 Um benchmark por vez

Os pedidos de medição entram numa fila e são atendidos **um de cada vez**. Se dois benchmarks
rodassem juntos, eles disputariam núcleos de processador e memória, e os dois sairiam mais lentos,
de forma imprevisível. Numa demonstração ao vivo, com alguém clicando rápido, isso seria fatal.

Cálculos comuns, sem cronômetro, não precisam passar pela fila.

### 4.3 Alternância da ordem dos modos

Quem roda primeiro tende a levar desvantagem: o motor ainda está esquentando, o heap ainda vai
crescer. Para não favorecer sempre o mesmo lado, a ordem dos dois modos **alterna entre as rodadas**:
numa vez mede sem cache e depois com cache, na outra o contrário.

A ordem efetivamente usada é devolvida no campo `ordem_execucao`, então o resultado é auditável.

### 4.4 O ambiente vai junto com o número

Toda resposta de comparação e de série carrega um bloco `ambiente` com a versão do Node, a versão do
V8, plataforma, arquitetura, modelo de processador, número de núcleos e memória total. Tempo sem
máquina não significa nada. Com esse bloco, qualquer número do relatório pode ser lido no contexto
certo.

## 5. Proteções contra travar a demonstração

Medir coisas exponenciais é perigoso. Quatro proteções, todas com valores em
`packages/contrato/src/limites.ts`:

| Proteção                   | Como funciona                                                          |
| -------------------------- | ---------------------------------------------------------------------- |
| Limite de n                | teto por sequência, modo e ambiente, validado antes de executar        |
| Estimativa prévia          | `GET /api/estimativa` calcula por fórmula quantas invocações virão     |
| Tempo limite               | padrão de 15 s; ao estourar, o worker é encerrado e vem `TEMPO_LIMITE` |
| Orçamento de nós da árvore | a árvore devolvida é truncada com segurança                            |

A estimativa é a proteção mais didática. Ela usa as fórmulas fechadas, sem rodar nada: Tribonacci
sem cache dá (3 · T(n) - 1) / 2 invocações, Fibonacci dá 2 · F(n) - 1, Fatorial dá n. Acima de um
milhão de invocações previstas a interface avisa e pede confirmação antes de começar.

Os limites de n no Node hoje são: Tribonacci 30 sem cache e 5000 com cache, Fibonacci 35 e 5000,
Fatorial 5000 nos dois modos. No navegador, usado só no plano B, são bem menores, porque a pilha do
V8 não é configurável ali.

Sobre o truncamento da árvore: o orçamento padrão é 300 nós e o teto é 5000. Quando a árvore passa
disso, os nós que não couberam somem, mas **nenhum número fica errado**. O nó que teve a subárvore
cortada ganha o campo `descendentes_ocultos` com a quantidade escondida, a resposta vem com
`truncada: true`, e as métricas continuam sendo da execução completa, porque elas são calculadas sem
montar a árvore inteira. Truncamento seguro quer dizer isto: some o desenho, não some a contagem.

## 6. Limitações honestas

Nenhuma medição de memória em uma linguagem com coletor de lixo é exata. Estas são as limitações que
assumimos, e o que fazemos com cada uma:

- **Os quadros da pilha ficam fora do heap.** A recursão profunda custa memória de pilha, e essa
  memória não aparece em `heapUsed`. Uma execução com n = 5000 e profundidade 4999 pode mostrar uma
  diferença de heap modesta e ainda assim estar perto do limite da pilha. Por isso reportamos
  `profundidade_maxima` sempre ao lado.
- **O coletor de lixo não é determinista.** Mesmo chamando `global.gc()`, não há garantia de que tudo
  o que virou lixo foi recolhido naquele instante. Duas execuções idênticas podem dar bytes
  diferentes.
- **Operações com `bigint` geram lixo temporário.** Cada soma e cada multiplicação cria um novo
  objeto na memória, porque `bigint` é imutável. Em n grande, o volume de lixo temporário passa de
  longe o tamanho do cache. A segunda coleta (passo 4 da seção 3.1) existe justamente para tirar esse
  lixo da conta.
- **O relógio mede a máquina, não só o algoritmo.** O sistema operacional pode tirar a CPU da thread
  no meio de uma repetição.

O que fazemos por causa disso, em uma frase: **cada medida é repetida, reportamos a mediana com a
dispersão ao lado, e toda medida aparece acompanhada das contagens exatas, que não têm ruído
nenhum.** Se um dia o tempo medido contar uma história diferente da contagem de chamadas, a contagem
é que está certa, e é ela que sustenta a conclusão do trabalho.

## 7. Por que os resultados oficiais saem do Node

O projeto roda no navegador, mas os números oficiais de tempo e memória vêm do Node, pela API. Três
motivos técnicos:

- **O relógio do navegador tem precisão reduzida de propósito.** Depois dos ataques de canal lateral
  do tipo Spectre, os navegadores passaram a arredondar `performance.now()`. A resolução fica na casa
  de dezenas ou centenas de microssegundos, e ainda pode vir com ruído aleatório somado. Para medir
  uma função que leva microssegundos, isso é inútil. No Node, `process.hrtime.bigint()` dá
  nanossegundos sem arredondamento.
- **Não existe interface de memória confiável no navegador.** `performance.memory` não é padrão e só
  aparece em navegadores baseados em Chromium, com valores grosseiros. A API padronizada
  (`measureUserAgentSpecificMemory`) é assíncrona, aproximada, mede a aba inteira e exige isolamento
  de origem. Nenhuma das duas serve para isolar o custo de um `Map`. Além disso, não há como forçar a
  coleta de lixo no navegador.
- **A aba disputa recursos com a própria interface.** Renderização, animações e a árvore em SVG
  dividem a mesma máquina. No servidor o cálculo roda em um worker isolado e enfileirado.

O cálculo no navegador existe, mas com dois papéis bem delimitados: rodar as contagens quando a API
estiver fora do ar (o plano B da apresentação) e desenhar a árvore. Nesses casos o tempo exibido é
rotulado como indicativo. Contagem feita no navegador é exata, igual à do servidor; tempo medido no
navegador, não.

## 8. Por que o Fatorial não ganha com cache

Esta seção existe porque é a pergunta mais provável na defesa, e porque a resposta honesta é mais
interessante do que forçar um ganho que não existe.

O Fatorial é uma **recursão linear**: f(n) chama f(n-1), que chama f(n-2), e assim até o caso base.
Cada chamada gera exatamente uma chamada nova. A "árvore" de chamadas é uma corrente, com um filho
por nó.

Consequência direta: **cada argumento aparece uma única vez**. Não existe subproblema repetido. E
cache só serve para evitar repetição.

Comparando as três sequências com o mesmo n = 10:

| Sequência  | Invocações sem cache | Invocações com cache | Acertos de cache | Ganho      |
| ---------- | -------------------- | -------------------- | ---------------- | ---------- |
| Fatorial   | 10                   | 10                   | 0                | nenhum     |
| Fibonacci  | 177                  | 19                   | 7                | 9,3 vezes  |
| Tribonacci | 289                  | 25                   | 11               | 11,6 vezes |

No Fatorial os dois modos fazem o mesmo trabalho. Com cache, ainda sobram n - 1 entradas guardadas
que nunca são consultadas. O saldo é: mesmo número de chamadas, mesma profundidade de pilha, e um
pouco mais de memória ocupada.

Por isso a interface, no Fatorial, mostra tempos parecidos nos dois modos, zero acertos, zero
chamadas evitadas e uma diferença de memória positiva no modo com cache. **Isso não é erro de
medição.** É o resultado certo, e ele ensina o critério que decide quando vale a pena memoizar.

### Quando o cache ajudaria o Fatorial

O cache seria útil se o mesmo dicionário sobrevivesse a várias consultas. Um serviço que responde
f(1000), depois f(900) e depois f(1000) de novo pagaria o preço cheio só na primeira vez. A segunda
chamada a f(1000) seria um único acerto.

Nós escolhemos não fazer isso, por dois motivos:

- O trabalho compara os dois algoritmos, e um cache compartilhado mediria o histórico de cliques, não
  o algoritmo.
- O resultado passaria a depender da ordem em que a plateia pede os valores, o que é péssimo para uma
  demonstração ao vivo.

A regra geral que fica: **memoização compensa quando existem subproblemas sobrepostos**. Fibonacci e
Tribonacci têm; Fatorial não tem. A técnica não é boa nem ruim em si, ela depende da forma da árvore
de chamadas.

## 9. O relatório de resultados

`docs/resultados-benchmark.md` é **gerado por script**, nunca escrito à mão. O arquivo registra uma
rodada completa de medições e serve de rede de segurança: se a máquina da apresentação estiver lenta
ou a API cair, os números continuam disponíveis.

O relatório contém:

- **A máquina**: modelo do processador, número de núcleos, memória total, sistema operacional e
  arquitetura.
- **As versões**: Node e V8, além da versão do projeto.
- **Os parâmetros**: repetições, aquecimentos, tempo limite, valores de n usados e a ordem em que os
  modos foram medidos.
- **A data e a hora** da rodada.
- **Uma tabela por sequência**, com Fatorial, Fibonacci e Tribonacci, mostrando para cada n: valor,
  dígitos, invocações nos dois modos, chamadas evitadas, tempo mediano nos dois modos, fator de
  aceleração e memória retida pelo cache.

Como o relatório sai de execução real, os tempos dele valem para aquela máquina e aquela data. As
contagens, não: elas valem em qualquer lugar, porque são propriedade do algoritmo. O relatório deixa
essa diferença explícita.

A conferir na revisão final: o nome do comando que gera o relatório e a data da rodada oficial, que
deve ser refeita na véspera da apresentação, na própria máquina que vai ser usada.

## 10. Como conferir

| O que                                       | Onde                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| Estatísticas de tempo e memória lado a lado | tela `/comparar`                                                          |
| Contagens exatas de uma execução            | tela `/calcular`                                                          |
| Crescimento em função de n                  | rota `POST /api/serie` (a tela que a exibe é a conferir na revisão final) |
| Contrato dos campos citados aqui            | `packages/contrato/src/api.ts` e `packages/contrato/src/metricas.ts`      |
| Limites e valores padrão                    | `packages/contrato/src/limites.ts`                                        |
| Rodada registrada                           | `docs/resultados-benchmark.md`                                            |

Na apresentação, a frase curta que resume esta metodologia inteira é: "o tempo é mediana de várias
repetições, com aquecimento, cache novo a cada repetição, e a memória é medida em execução separada".
