# Roteiro da apresentação (10 minutos)

Trabalho PRJ.ED.1, Estrutura de Dados. As seções seguem a **ordem do enunciado**, e o material
projetado é o relatório `docs/relatorio.html`, aberto no navegador. Ele é um arquivo só, não precisa
de servidor e não quebra no meio da aula.

A base conceitual e as contas completas estão no [artigo](../README.md); a explicação de f(7) é a
seção 6 dele.

## A ideia central

Uma frase para guiar tudo: **a recursão ingênua refaz o mesmo trabalho muitas vezes; o cache troca
um pouco de memória por uma redução enorme de chamadas, e dá para ver isso na árvore.**

Se sobrar tempo para um slide só, é o da árvore de f(7): 46 chamadas viram 16.

## O que o enunciado pede, e onde cada pedido é respondido

| Pedido do enunciado                                 | Seção do roteiro | Onde está no relatório |
| --------------------------------------------------- | ---------------- | ---------------------- |
| Calcular as três sequências, com e sem cache        | 2                | seções 1 e 2           |
| Exibir a árvore de chamadas dos casos **sem cache** | 3                | seção 3                |
| Comparar desempenho em **tempo e memória**          | 6                | seção 4                |
| Explicar o cache no Tribonacci e **quantas** evita  | 5                | seção 5                |

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

Regra de ouro: **nunca cite um número que não esteja na tela.** Se a tela mostrar outro valor, leia o
da tela e comente a diferença com naturalidade.

## Divisão do tempo

| Seção | Assunto                                     | Tempo | Acumulado | Cortável? |
| ----- | ------------------------------------------- | ----- | --------- | --------- |
| 1     | O enunciado e a pergunta                    | 0:45  | 0:45      | não       |
| 2     | As três sequências e a forma da árvore      | 1:15  | 2:00      | não       |
| 3     | A árvore de chamadas sem cache              | 1:45  | 3:45      | não       |
| 4     | O cache em três regras                      | 1:00  | 4:45      | encurta   |
| 5     | Tribonacci f(7): 46 → 16, e as 30 evitadas  | 2:15  | 7:00      | não       |
| 6     | Tempo e memória, com a demonstração ao vivo | 2:00  | 9:00      | encurta   |
| 7     | O Fatorial honesto e fechamento             | 1:00  | 10:00     | não       |

Marque **7:00** no relógio como o instante de entrar na seção 6. Se passar disso, encurte a
demonstração ao vivo, nunca a seção 5.

## Seção a seção

### 1. O enunciado e a pergunta (0:45)

Na tela: seção 1 do relatório, com o enunciado citado.

- Leia o enunciado em uma frase: calcular três sequências recursivas de dois jeitos, com e sem
  cache, comparar tempo e memória e mostrar a árvore de chamadas.
- A pergunta que atravessa tudo: **quantas vezes o computador calcula a mesma coisa?**
- A recursão é elegante porque se escreve quase igual à definição matemática. O problema é que ela
  não tem memória.

### 2. As três sequências e a forma da árvore (1:15)

Na tela: seção 2 do relatório, com a tabela das três sequências.

- Leia as três recorrências com os casos base **do enunciado**. Avise explicitamente que o Fibonacci
  aqui começa em 1, 1, 2, 3, 5 e não em 0, 1: é a convenção do enunciado, e por isso os valores ficam
  deslocados em relação ao que se vê na internet.
- Aponte a coluna "filhos por nó": Fatorial 1, Fibonacci 2, Tribonacci 3. **Guardem esse número,
  porque é ele que decide tudo.**
- Fatorial é uma corrente. Fibonacci e Tribonacci são árvores. Só quem é árvore repete subproblema.
- Anuncie o exemplo que atravessa a apresentação: **Tribonacci f(7) = 31**.

### 3. A árvore de chamadas sem cache (1:45)

Na tela: seção 3 do relatório, a figura da árvore de f(7) com 46 nós.

Este é um pedido explícito do enunciado; dê o tempo dele.

- Cada nó é uma invocação, cada aresta é uma chamada recursiva. São **46 no total**: 1 raiz e 45
  recursivas.
- Só 15 dessas chamadas fazem conta. As outras 31 são casos base, que só devolvem 1.
- Aponte as repetições: **f(3) aparece 7 vezes e f(4), 4 vezes**, sempre com o mesmo resultado. Seis
  dos sete cálculos de f(3) são trabalho jogado fora.
- Detalhe bonito para citar: o número de folhas é igual ao valor da sequência. f(7) = 31 porque a
  soma final é 31 parcelas iguais a 1.
- Se perguntarem pelas outras duas árvores, abra os blocos recolhidos logo abaixo da figura: o
  programa imprime as três em texto.

### 4. O cache em três regras (1:00)

Na tela: seção 5 do relatório, a lista das três regras.

Diga as regras na ordem exata em que a função as executa:

1. **É caso base?** Devolve 1 e não mexe no cache.
2. **Já está no cache?** Devolve o valor guardado e **não visita nenhum filho**. É o acerto.
3. **Senão**, calcula, guarda e devolve.

- O nome da técnica é **memoização**: continua sendo a mesma recursão de cima para baixo, só que com
  um caderninho ao lado.
- A primeira vez que um argumento aparece paga o preço cheio; da segunda em diante custa uma consulta.
- Casos base não entram no cache porque devolver 1 já é mais barato que consultar.

Se estiver atrasado, diga só a regra 2 e siga: ela é a que explica a poda.

### 5. Tribonacci f(7): 46 → 16, e as 30 evitadas (2:15)

Na tela: seção 5 do relatório, com os três números grandes no topo.

Esta é a resposta que o enunciado pede por escrito. Não corra.

- Aponte os três números: **46**, **16**, **30**.
- Conte a história em duas etapas:
  1. **A descida.** f(7) chama f(6), que chama f(5), f(4), f(3) até os casos base. Nesse caminho cada
     argumento aparece pela primeira vez: são **5 cálculos**, de f(3) a f(7).
  2. **A volta.** Os irmãos à direita já encontram tudo pronto: são **5 acertos**. E cada acerto
     **corta a subárvore inteira** que estaria abaixo dele.
- Mostre a tabela das podas e some em voz alta: **12 + 6 + 6 + 3 + 3 = 30**. O acerto de f(5)
  sozinho corta 12 chamadas.
- Feche com a frase da resposta: "**com cache, f(7) faz 16 chamadas em vez de 46: são 30 chamadas
  recursivas evitadas, 65% do total**".
- Se quiser reforçar, diga que a conta dá 30 dos dois jeitos: pela diferença dos totais (46 − 16) e
  pela soma das podas. A chamada inicial existe nos dois modos, então contar só as recursivas dá o
  mesmo: 45 − 15.

### 6. Tempo e memória, com a demonstração ao vivo (2:00)

Na tela: seção 4 do relatório, os gráficos.

- **Invocações primeiro** (gráfico 4.1). Este é o número exato, não depende de máquina nenhuma. No
  eixo logarítmico, a linha sem cache é uma **reta subindo**: isso é crescimento exponencial. A linha
  com cache é quase horizontal.
- **Depois o tempo** (gráfico 4.2). Mesma forma, porque o tempo segue as chamadas.
- **Por último a memória** (gráfico 4.3). O cache custa memória proporcional a n, e no Fibonacci e no
  Tribonacci isso é da ordem de 1 KiB para ganhar quatro ordens de grandeza em tempo.
- Diga a frase do método: "o tempo é mediana de várias repetições, com aquecimento, e o cache começa
  vazio a cada execução".

**Demonstração ao vivo (40 s, dentro deste bloco).** Vá à interface e digite um n na tela
`/comparar`, para mostrar que a ferramenta calcula de verdade e aceita qualquer valor:

```
http://localhost:5173/comparar?sequencia=tribonacci&n=20
```

Troque o n para 25 na frente da turma e clique em **Comparar**. Aponte as invocações dos dois modos
e a aceleração. Se a medição demorar, fale por cima: "são 2,7 milhões de chamadas de um lado e 70 do
outro".

Se estiver atrasado, **pule a demonstração** e fique só nos gráficos do relatório.

### 7. O Fatorial honesto e fechamento (1:00)

Na tela: seção 6 do relatório.

- Olhe para o professor e diga: no Fatorial o cache **não ajuda**, e a nossa ferramenta mostra isso
  em vez de esconder. Mesmas invocações nos dois modos, zero acertos, e ainda memória a mais.
- O motivo, em uma frase: o Fatorial é uma corrente, não uma árvore. Nenhum argumento se repete,
  então não há nada para reaproveitar.
- **A pilha não muda.** A profundidade máxima é a mesma com e sem cache, porque a primeira descida é
  idêntica. O cache economiza chamadas, não altura de pilha.
- Fechamento: memoização é uma troca de espaço por tempo, e ela só compensa onde existe trabalho
  repetido. Medir é o que permite afirmar isso.
- Encerre abrindo para perguntas.

## Checklist dez minutos antes

- [ ] `docs/relatorio.html` aberto no navegador, em uma aba, com zoom entre 125% e 150%.
- [ ] Conferir que a seção 5 mostra **46**, **16** e **30**. Se mostrar outra coisa, rode
      `pnpm relatorio` de novo ou apresente pelo artigo.
- [ ] Notificações desligadas, uma janela só, sem abas pessoais.
- [ ] Para a demonstração: `docker compose up --build` (interface em `http://localhost:8080`) ou
      `pnpm dev` (interface em `http://localhost:5173`), com a tela `/comparar` já aberta uma vez,
      para o primeiro carregamento não acontecer no palco.

## Plano B

Suba na escada só até onde for necessário.

1. **Fique no relatório.** Ele é estático e tem todos os números, inclusive os gráficos. A
   apresentação inteira cabe nele, sem app e sem rede. Se a demonstração falhar, não conserte ao
   vivo: volte para o relatório e siga falando.
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

**Qual é a complexidade dos dois modos?** Sem cache, as invocações crescem como 1,839ⁿ no Tribonacci
e 1,618ⁿ no Fibonacci. Com cache, são 3n − 5 e 2n − 1. A memória é O(n) de pilha nos dois modos, mais
O(n) entradas de cache no modo com cache.
