# Roteiro da apresentação (10 minutos)

Trabalho PRJ.ED.1, Estrutura de Dados. As seções vão do fato medido à explicação: calcular com e
sem cache, ver a árvore sem cache, explicar o cache em f(7) e, por fim, medir tempo e memória. A
tabela abaixo liga cada pedido do enunciado à seção que o responde. O palco é a
**própria aplicação**, projetada do notebook (`pnpm dev` ou Docker Compose). As telas foram
calibradas para caber numa janela de 1366×768 sem rolagem: em Calcular, Comparar e Árvore a
configuração fica numa coluna à esquerda e o resultado inteiro à direita, e as tabelas de prova
abrem sob demanda.

O `docs/relatorio.html` continua no projeto como material de apoio e primeiro degrau do plano B: é
um arquivo só, estático, com todos os números. A base conceitual e as contas completas estão no
[artigo](../README.md); a explicação de f(7) é a seção 6 dele.

## A ideia central

Uma frase para guiar tudo: **a recursão ingênua refaz o mesmo trabalho muitas vezes; o cache troca
um pouco de memória por uma redução enorme de chamadas, e dá para ver isso na árvore.**

Se sobrar tempo para uma tela só, é a etapa 5 da apresentação: 46 chamadas viram 16.

## O que o enunciado pede, e onde cada pedido é respondido

| Pedido do enunciado                                 | Seção do roteiro | Tela do app     | Apoio no relatório |
| --------------------------------------------------- | ---------------- | --------------- | ------------------ |
| Calcular as três sequências, com e sem cache        | 3                | `/calcular`     | seções 1 e 2       |
| Exibir a árvore de chamadas dos casos **sem cache** | 4                | `/arvore`       | seção 3            |
| Explicar o cache no Tribonacci e **quantas** evita  | 5                | `/apresentacao` | seção 5            |
| Comparar desempenho em **tempo e memória**          | 6                | `/comparar`     | seção 4            |

A tela inicial mostra os quatro pedidos como uma faixa de atalhos ("O enunciado:", numerados de 1 a
4 na ordem em que o enunciado os faz): aponte-a no começo, porque ela prova de cara que nada ficou de
fora, e use-a para navegar.

Nenhum dos quatro pode ser cortado: cada um vale nota. O que é cortável está marcado na tabela de
tempos.

## Números que precisam sair de cor

| Onde                        | Número                                                     |
| --------------------------- | ---------------------------------------------------------- |
| Tribonacci f(7)             | 31                                                         |
| f(7) sem cache              | 46 invocações, 45 recursivas, 15 calculados, 31 casos base |
| f(7) com cache              | 16 invocações, 5 calculados, 5 acertos, 6 casos base       |
| **Chamadas evitadas**       | **30**                                                     |
| Soma das subárvores podadas | 12 + 6 + 6 + 3 + 3 = 30                                    |
| Profundidade nos dois modos | 6                                                          |
| Repetição que o cache mata  | f(3) calculado 7 vezes; f(4), 4 vezes                      |
| Fibonacci f(10)             | 89, com 177 invocações sem cache e 19 com cache            |
| Fatorial f(10)              | 3 628 800, com 10 invocações nos dois modos                |

Regra de ouro: **nunca cite um número que não esteja na tela.** Todos os números do app vêm de
execuções instrumentadas de verdade; se a tela mostrar outro valor, leia o da tela e comente a
diferença com naturalidade.

## Divisão do tempo

| Seção | Assunto                                       | Tela            | Tempo | Acumulado | Cortável? |
| ----- | --------------------------------------------- | --------------- | ----- | --------- | --------- |
| 1     | O enunciado, item a item                      | `/`             | 0:45  | 0:45      | não       |
| 2     | As três sequências                            | `/`             | 1:00  | 1:45      | não       |
| 3     | Calcular f(7): mesmo valor, contagens opostas | `/calcular`     | 1:30  | 3:15      | não       |
| 4     | A árvore de chamadas sem cache                | `/arvore`       | 1:45  | 5:00      | não       |
| 5     | O palco do f(7): 46 → 16, e as 30 evitadas    | `/apresentacao` | 2:30  | 7:30      | não       |
| 6     | Tempo e memória, medidos ao vivo              | `/comparar`     | 1:45  | 9:15      | encurta   |
| 7     | O Fatorial honesto e fechamento               | `/calcular`     | 0:45  | 10:00     | não       |

Marque **7:30** no relógio como o instante de entrar na seção 6. Se passar disso, encurte a medição
ao vivo, nunca a seção 5.

## Seção a seção

### 1. O enunciado, item a item (0:45) — tela `/`

Na tela: o Início. Logo abaixo do título estão as duas linhas que motivam o trabalho, uma para cada
modo, e a faixa "O enunciado:".

- Leia o enunciado em uma frase: calcular três sequências recursivas de dois jeitos, com e sem
  cache, comparar tempo e memória e mostrar a árvore de chamadas.
- Leia as duas linhas do topo, que são a tese da apresentação: **sem cache**, cada chamada que não
  é caso base abre uma chamada por termo anterior, e com ordem 2 ou mais os subproblemas se repetem
  em custo exponencial; **com cache**, cada f(k) acima dos casos base é calculado uma vez e, quando
  se repete, só consulta o cache: o custo vira linear.
- Aponte a faixa: **cada pedido do enunciado tem uma tela, e a apresentação passa por todas.**
- A pergunta que atravessa tudo: **quantas vezes o computador calcula a mesma coisa?**

### 2. As três sequências (1:00) — tela `/`

Na tela: os três cartões, com o tipo de recursão e a ordem ao lado do nome ("recursão tripla ·
ordem 3"), a fórmula, o caso base escrito como no enunciado ("com f(0) = f(1) = 1") e os primeiros
termos. Abaixo deles, fechado, o painel **Fórmulas gerais**.

- Leia as três recorrências com os casos base **do enunciado**. Avise explicitamente que o
  Fibonacci aqui começa em 1, 1, 2, 3, 5 e não em 0, 1: é a convenção do enunciado, e por isso os
  valores ficam deslocados em relação ao que se vê na internet.
- Aponte a **ordem** de cada uma: 1 no Fatorial, 2 no Fibonacci, 3 no Tribonacci. É quantos termos
  anteriores a recorrência usa, e portanto quantas chamadas abre cada nó que não é caso base.
  **Guardem esse número, porque é ele que decide tudo.**
- Toque em **Código** no cartão do Tribonacci: abre o código TypeScript real das duas funções, lido
  do próprio arquivo que o app executa e cronometra. Aponte as três chamadas recursivas no `return`,
  que são a ordem 3, e, na versão com cache, as três linhas marcadas: consultar o cache, devolver o
  acerto e guardar o valor. É tudo o que o cache acrescenta. Feche com Esc; os outros dois cartões
  têm o mesmo botão, se alguém pedir.
- Aponte as linhas de crescimento: sem cache o Fibonacci é Θ(φⁿ), com φ ≈ 1,618, a razão áurea, e
  o Tribonacci é Θ(τⁿ), com τ ≈ 1,839, a constante de Tribonacci: exponenciais. Com cache, os dois
  viram lineares, com 2n − 1 invocações a partir de n = 1 e 3n − 5 a partir de n = 2; abaixo disso
  a chamada já é caso base. O Fatorial é linear nos dois modos, sem ganho.
- Fatorial é uma corrente. Fibonacci e Tribonacci são árvores. Só quem é árvore repete subproblema.
- Se houver pergunta sobre de onde saem as contagens, abra **Fórmulas gerais**: com k = ordem e
  b = casos base, as invocações com cache são 1 + k · (n − b + 1), e a tabela já traz a conta de
  f(7) nas três colunas. No Tribonacci: (3 · 31 − 1) / 2 = 46 sem cache, 1 + 3 · (7 − 3 + 1) = 16
  com cache, 30 evitadas. Feche o painel antes de seguir.
- Anuncie o exemplo que atravessa a apresentação: **Tribonacci f(7) = 31**. Clique no item
  **1 · Calcular com e sem cache** da faixa.

### 3. Calcular f(7): mesmo valor, contagens opostas (1:30) — tela `/calcular`

Na tela: `/calcular?sequencia=tribonacci&n=7&modo=comparar`. Na coluna da esquerda, confira
Tribonacci, o modo **Comparar** e n = 7, e toque em **Calcular**.

Este é o item (a)–(c) do enunciado acontecendo ao vivo, e não uma captura de tela.

- No topo da direita, três cartões: o valor **31**, "igual nos dois modos", porque **o cache muda o
  caminho, nunca o resultado**; as **30 chamadas evitadas**; e as barras de invocações por modo,
  46 contra 16.
- Logo abaixo, os dois placares **lado a lado**, sem cache à esquerda e com cache à direita. Leia
  linha por linha: 46 contra 16 invocações, 15 contra 5 calculados, 0 contra 5 acertos e a mesma
  profundidade 6. A explicação do porquê fica para daqui a pouco; agora é só o fato medido.
- Se perguntarem o que cada número significa, abra **O que cada número conta**.
- Role um pouco, abra o bloco **Invocações por argumento** e aponte a linha de f(3): **7
  invocações sem cache, 3 com cache**. É o trabalho repetido aparecendo em número.
- Siga para a árvore pela navegação: a tela Árvore já abre em Tribonacci f(7) sem cache.

### 4. A árvore de chamadas sem cache (1:45) — tela `/arvore`

Na tela: `/arvore?sequencia=tribonacci&n=7&modo=sem_cache`. A tela abre inteira, sem rolagem: os
controles à esquerda e, à direita, os contadores e a árvore completa de f(7).

Este é um pedido explícito do enunciado; dê o tempo dele.

- Cada caixa é uma invocação, cada linha é uma chamada recursiva. São **46 no total**: 1 raiz e 45
  recursivas. Os contadores em cima do desenho dizem isso.
- Só **15** dessas chamadas fazem conta. As outras **31** são casos base, que só devolvem 1.
- A cor mostra o argumento: aponte que **f(3) aparece 7 vezes, sempre na mesma cor**, e f(4), 4
  vezes, sempre com o mesmo resultado. Seis dos sete cálculos de f(3) são trabalho jogado fora.
- Detalhe bonito para citar: o número de folhas é igual ao valor da sequência. f(7) = 31 porque a
  soma final é 31 parcelas iguais a 1.
- Os nós aparecem pequenos para a árvore caber inteira: use **+** ou a roda do mouse para
  aproximar uma região, e **Ajustar à tela** para voltar. Quem precisar ler cada chamada em texto
  tem a vista **Lista**.
- Se a turma quiser interagir: clique num nó para recolher a subárvore, ou marque **com cache** na
  coluna da esquerda, toque em **Ver árvore** e mostre a árvore podada, com os acertos de cache em
  borda tracejada e marca de triângulo.

### 5. O palco do f(7): 46 → 16, e as 30 evitadas (2:30) — tela `/apresentacao`

Na tela: `/apresentacao?etapa=3`, em **Tela cheia**. As etapas 1 e 2 repetem o que a turma acabou
de ver; entre direto na 3 e avance com as setas.

Esta é a resposta que o enunciado pede por escrito. Não corra.

- **Etapa 3, o cache em três regras.** Diga as regras na ordem exata em que a função as executa:
  1. **É caso base?** Devolve 1 e não mexe no cache.
  2. **Já está no cache?** Devolve o valor guardado e **não visita nenhum filho**. É o acerto.
  3. **Senão**, calcula, guarda e devolve.
     O nome da técnica é **memoização**: a mesma recursão de cima para baixo, com um caderninho ao
     lado. Se estiver atrasado, diga só a regra 2: é ela que explica a poda.
- **Etapa 4, as duas árvores lado a lado.** As subárvores tracejadas são as que o acerto cortou.
  Conte a história em duas partes: na **descida**, cada argumento aparece pela primeira vez e são
  **5 cálculos**, de f(3) a f(7); na **volta**, os irmãos à direita encontram tudo pronto e são
  **5 acertos**, cada um cortando a subárvore inteira que viria abaixo.
- **Etapa 5, a conta.** O contador anima de 46 para 16 na frente da turma. Some as podas em voz
  alta: **12 + 6 + 6 + 3 + 3 = 30**; o acerto de f(5) sozinho corta 12 chamadas. E a conta fecha
  dos dois jeitos: 46 − 16 pela diferença dos totais, 45 − 15 contando só as recursivas.
- Feche com a frase da resposta: "**com cache, f(7) faz 16 chamadas em vez de 46: são 30 chamadas
  recursivas evitadas, 65% do total**".
- Saia da apresentação pelo botão **Sair** e vá para `/comparar`.

### 6. Tempo e memória, medidos ao vivo (1:45) — tela `/comparar`

Na tela: `/comparar?sequencia=tribonacci&n=20&repeticoes=5`. Antes de medir, o resultado mostra o
cartão **Como a comparação é feita**.

- Leia uma frase por item do cartão: as **contagens** são exatas, da versão instrumentada; o
  **tempo** é das funções puras, com aquecimento, coleta de lixo antes de cada bloco, os dois modos
  alternados e a mediana; a **memória** é o que fica retido entre duas coletas, com o cache ainda
  vivo. Depois toque em **Comparar** na coluna da esquerda: o cartão fica recolhido abaixo das
  curvas.

- Os três destaques respondem o item de desempenho do enunciado: **fator de aceleração**, **chamadas
  evitadas** e **memória a mais com cache**. Leia os três em voz alta; a leitura embaixo do fator já
  traz as medianas dos dois modos. As duas curvas aparecem logo abaixo, na mesma tela.
- Troque o **n para 25** na frente da turma e compare de novo. O app avisa que a medição é pesada e
  pergunta antes de rodar: confirme em **Medir mesmo assim** e, se demorar, fale por cima: "são 2,7
  milhões de chamadas de um lado e 70 do outro".
- Nas curvas "Como cada modo cresce com n", troque a **Escala dos gráficos** para
  **Logarítmica**, no pé da coluna da esquerda: a linha sem cache vira uma **reta subindo**, que é a
  assinatura do crescimento exponencial, e a com cache fica quase horizontal. As invocações são
  contagem exata; o tempo segue a mesma forma.
- A memória aparece no terceiro destaque: da ordem de 1 KiB de cache para ganhar quatro ordens de
  grandeza em tempo. Quem quiser os números completos rola até os blocos **Tempo**, **Memória** e
  **Ambiente de execução**, fechados de propósito.
- Se o destaque de memória disser que a execução com cache reteve **menos**, não se assuste: com
  poucas entradas, como as 5 de f(7), a variação do coletor de lixo entre rodadas pesa mais que o
  próprio cache, e a tela diz isso. Nos ensaios com n = 20 e 5 repetições a diferença saiu positiva
  em todas as rodadas.
- Diga a frase do método: "o tempo é mediana de várias repetições, com aquecimento, e o cache
  começa vazio a cada execução".

### 7. O Fatorial honesto e fechamento (0:45) — tela `/calcular`

Na tela: `/calcular?sequencia=fatorial&n=10&modo=comparar`, e toque em **Calcular**.

- Olhe para o professor e diga: no Fatorial o cache **não ajuda**, e a ferramenta mostra isso em
  vez de esconder: **10 invocações nos dois modos, zero evitadas**. No placar com cache, zero
  acertos e **9 entradas guardadas** que nunca foram usadas: só custo.
- O motivo, em uma frase: o Fatorial é uma corrente, não uma árvore. Nenhum argumento se repete,
  então não há nada para reaproveitar.
- **A pilha não muda.** A profundidade máxima é a mesma com e sem cache, porque a primeira descida
  é idêntica. O cache economiza chamadas, não altura de pilha.
- Fechamento: memoização é uma troca de espaço por tempo, e ela só compensa onde existe trabalho
  repetido. Medir é o que permite afirmar isso.
- Encerre abrindo para perguntas.

## Checklist dez minutos antes

- [ ] App no ar: `docker compose up --build` (interface em `http://localhost:8080`) ou `pnpm dev`
      (interface em `http://localhost:5173`).
- [ ] Passar uma vez por todas as telas do roteiro, na ordem, para nenhum carregamento acontecer no
      palco — inclusive uma comparação com n = 25, para o aviso de medição pesada não surpreender.
- [ ] Janela maximizada e **zoom em 100%**: as telas foram calibradas para 1366×768, e zoom mexe na
      dobra. Se o projetor tiver resolução menor, use F11; o modo apresentação se adapta sozinho.
- [ ] Conferir na etapa 5 da apresentação os três números: **46**, **16** e **30**.
- [ ] Notificações desligadas, uma janela só, sem abas pessoais.
- [ ] `docs/relatorio.html` aberto numa aba de reserva, com zoom entre 125% e 150%.

## Plano B

Suba na escada só até onde for necessário.

1. **Vá para o relatório.** `docs/relatorio.html` é estático, não depende de servidor nem de rede e
   tem todos os números da apresentação, inclusive a árvore de f(7) e os gráficos. Se o app falhar,
   não conserte ao vivo: troque de aba e siga falando na mesma ordem.
2. **Linha de comando.** Terminal já aberto, fonte grande, comando pronto para o Enter:

   ```bash
   pnpm cli tribonacci 7 --modo sem_cache --arvore
   pnpm cli tribonacci 7 --modo com_cache --arvore
   ```

3. **O artigo.** `README.md` tem as duas árvores em texto e todas as tabelas, pronto para projetar.

Regra única do plano B: se algo falhar, **troque de nível e continue falando**. O critério de
avaliação é a fluidez, não o conserto.

## Perguntas prováveis e respostas curtas

**Memoização ou programação dinâmica de baixo para cima?** Memoização é de cima para baixo: a
recursão continua e só calcula os subproblemas que realmente aparecem. De baixo para cima é um laço
que preenche uma tabela de 0 até n, sem recursão. O resultado é o mesmo; de baixo para cima não usa
pilha. O enunciado pede recursão, então usamos memoização, que é a versão recursiva dessa ideia.

**Por que o Fatorial não ganha nada com cache?** Porque não tem subproblemas sobrepostos. Cada
argumento aparece uma única vez: é uma corrente, não uma árvore. Com cache são as mesmas n chamadas,
nenhum acerto, e ainda n − 1 entradas guardadas sem uso.

**Por que `bigint` e não `number`?** Porque os valores estouram o inteiro seguro do JavaScript
(2⁵³ − 1). O Fatorial passa disso em n = 19, o Tribonacci em n = 62 e o Fibonacci em n = 78. Com
`number` o erro seria silencioso: a tela mostraria um número arredondado com cara de certo.

**Por que a contagem inclui os acertos de cache?** Porque um acerto é uma chamada de função de
verdade: entra na pilha, consulta o dicionário e retorna. É mais barato, mas não é de graça. Com essa
convenção as contas fecham sozinhas: invocações = casos base + calculados + acertos.

**E o risco de estourar a pilha?** É real, e o cache não ajuda: a profundidade máxima é a mesma nos
dois modos. Tratamos com limite de n por sequência e modo, execução em worker com pilha ampliada, e
captura do erro, que vira mensagem clara em vez de derrubar o servidor.

**Por que medir no Node e não no navegador?** No navegador o relógio tem precisão reduzida de
propósito, não dá para forçar a coleta de lixo e a aba disputa processador com a renderização. No
Node temos relógio de nanossegundos, coleta sob demanda e leitura do heap.

**Qual é a complexidade dos dois modos?** Sem cache, as invocações são Θ(τⁿ) no Tribonacci, com
τ ≈ 1,839, e Θ(φⁿ) no Fibonacci, com φ ≈ 1,618. Com cache, são exatamente 3n − 5 (a partir de n = 2)
e 2n − 1 (a partir de n = 1). A pilha é Θ(n) nos dois modos, mais Θ(n) entradas de cache no modo com
cache.

**Se o bigint cresce, por que o tempo com cache é Θ(n)?** Porque a análise conta invocações, como diz
o artigo: cada chamada vale uma unidade. Com `bigint`, uma multiplicação ou soma fica mais cara
conforme o número ganha dígitos, então o tempo real cresce mais rápido que n para n grande,
sobretudo no Fatorial. O que o cache elimina são chamadas, e isso a contagem mostra sem ruído.
