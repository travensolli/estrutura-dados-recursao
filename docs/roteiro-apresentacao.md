# Roteiro da apresentação (15 minutos)

Trabalho PRJ.ED.1, Estrutura de Dados. Tema: cálculo recursivo de Fatorial, Fibonacci e Tribonacci,
com e sem cache, comparando desempenho em tempo e memória e exibindo a árvore de chamadas.

Formato assumido e registrado em `docs/decisoes.md`: 15 minutos, ao vivo, com projetor, sem
restrição de ferramentas. A base conceitual (árvores, contagens e fórmulas) está em
`docs/explicacao-tribonacci.md`.

## A ideia central

Uma frase para guiar tudo: **a recursão ingênua refaz o mesmo trabalho muitas vezes; o cache troca
um pouco de memória por uma redução enorme de chamadas, e dá para ver isso na árvore.**

Se sobrar tempo para um slide só, é o da árvore de f(7): 46 chamadas viram 16.

## Números de referência

Estes números precisam sair de cor, porque são o fio da apresentação inteira.

| Onde                           | Número                                                     |
| ------------------------------ | ---------------------------------------------------------- |
| Tribonacci f(7)                | 31                                                         |
| f(7) sem cache                 | 46 invocações, 45 recursivas, 15 calculados, 31 casos base |
| f(7) com cache                 | 16 invocações, 5 calculados, 5 acertos, 6 casos base       |
| Chamadas evitadas              | 30                                                         |
| Profundidade máxima nos dois   | 6                                                          |
| Repetições que o cache elimina | f(3) calculado 7 vezes, f(4) calculado 4 vezes             |
| Fibonacci f(10)                | 89, com 177 invocações sem cache e 19 com cache            |
| Fatorial f(10)                 | 3 628 800, com 10 invocações nos dois modos                |

Regra de ouro na demonstração: nunca cite um número que não esteja na tela. Se a tela mostrar outro
valor, leia o da tela e comente a diferença com naturalidade.

## Divisão do tempo

| Seção | Assunto                                    | Tempo | Acumulado |
| ----- | ------------------------------------------ | ----- | --------- |
| 1     | Abertura e o problema                      | 1:00  | 1:00      |
| 2     | As três sequências e os casos base         | 1:30  | 2:30      |
| 3     | Subproblemas sobrepostos: a árvore de f(7) | 2:00  | 4:30      |
| 4     | O cache em três regras                     | 1:30  | 6:00      |
| 5     | Demonstração ao vivo                       | 5:00  | 11:00     |
| 6     | Escala: as fórmulas e o n grande           | 2:00  | 13:00     |
| 7     | Os custos e a parte honesta                | 1:00  | 14:00     |
| 8     | Fechamento                                 | 1:00  | 15:00     |

Quem apresenta deve marcar 6:00 no relógio como o instante de começar a demonstração. Se passar
disso, corte a seção 6 na hora, não a demonstração.

## Slide a slide

### Slide 1: capa (0:10)

Na tela: título do trabalho, nomes da equipe, disciplina e data.

O que dizer: "Nosso trabalho calcula três sequências recursivas de dois jeitos, com e sem cache, e
mostra na tela o preço de cada jeito."

### Slide 2: o problema em uma pergunta (0:50)

Na tela: a pergunta "quantas vezes o computador calcula a mesma coisa?" e o desenho pequeno de
f(7) chamando f(6), f(5) e f(4).

O que dizer:

- A recursão é elegante: escreve-se quase igual à definição matemática.
- O problema é que ela não tem memória. Se o mesmo subproblema aparece em dois ramos, ela resolve
  duas vezes, do zero.
- A pergunta do trabalho: quanto custa essa falta de memória, e quanto custa resolver isso.

### Slide 3: as três sequências (1:30)

Na tela: as três definições com os casos base do enunciado.

- Fatorial: f(n) = n · f(n-1), com f(0) = f(1) = 1.
- Fibonacci: f(n) = f(n-1) + f(n-2), com f(0) = f(1) = 1. Sequência 1, 1, 2, 3, 5, 8.
- Tribonacci: f(n) = f(n-1) + f(n-2) + f(n-3), com f(0) = f(1) = f(2) = 1. Sequência 1, 1, 1, 3, 5,
  9, 17, 31.

O que dizer:

- Avise explicitamente que o Fibonacci aqui começa em 1, 1, e não em 0, 1. É a convenção do
  enunciado, e por isso os valores são deslocados em relação ao que se vê na internet.
- O Fatorial tem um filho por chamada. O Fibonacci tem dois. O Tribonacci tem três. Guardem esse
  detalhe, porque é ele que decide tudo.
- Anuncie o exemplo que vai atravessar a apresentação: Tribonacci f(7) = 31.

### Slide 4: a árvore que explode (2:00)

Na tela: a árvore de f(7) sem cache, em texto indentado, com os casos base marcados, ao lado da
tabela de invocações por argumento.

| Argumento | Invocações |
| --------- | ---------- |
| f(7)      | 1          |
| f(6)      | 1          |
| f(5)      | 2          |
| f(4)      | 4          |
| f(3)      | 7          |
| f(2)      | 13         |
| f(1)      | 11         |
| f(0)      | 7          |
| Total     | 46         |

O que dizer:

- Cada linha da árvore é uma chamada de função. São 46 no total: 1 raiz e 45 recursivas.
- Só 15 dessas chamadas fazem conta. As outras 31 são casos base, que só devolvem 1.
- Aponte a linha do f(3): sete vezes. Sempre dá 3. Seis dessas vezes são trabalho jogado fora.
- Detalhe bonito para citar: o número de folhas é igual ao valor da sequência. f(7) = 31 porque a
  soma final é 31 parcelas iguais a 1.

### Slide 5: o cache em três regras (1:30)

Na tela: as três regras, na ordem exata em que a função as executa.

1. É caso base? Devolve 1 e não mexe no cache.
2. Já está no cache? Devolve o valor guardado. Nenhum filho é visitado. Isso é um acerto.
3. Senão, calcula, guarda no cache e devolve. Isso é uma falta.

O que dizer:

- A técnica chama-se memoização: continua sendo a mesma recursão de cima para baixo, só que com um
  caderninho ao lado.
- A primeira vez que um argumento aparece paga o preço cheio. Da segunda em diante custa uma
  consulta.
- Casos base não entram no cache porque devolver 1 já é mais barato que consultar.

### Slide 6: a demonstração (5:00)

Passe para o navegador. O passo a passo está na seção seguinte.

### Slide 7: escala (2:00)

Na tela: a tabela das fórmulas fechadas.

| n   | Tribonacci T(n) | Sem cache  | Com cache | Chamadas evitadas |
| --- | --------------- | ---------- | --------- | ----------------- |
| 7   | 31              | 46         | 16        | 30                |
| 10  | 193             | 289        | 25        | 264               |
| 20  | 85 525          | 128 287    | 55        | 128 232           |
| 30  | 37 895 489      | 56 843 233 | 85        | 56 843 148        |

O que dizer:

- Sem cache o total de chamadas é (3 · T(n) - 1) / 2. Como T(n) cresce como 1,839 elevado a n, cada
  unidade a mais em n multiplica o trabalho por quase dois.
- Com cache o total é 3n - 5. Cada unidade a mais em n custa exatamente três chamadas.
- Uma é exponencial, a outra é uma reta. Em n = 30 a diferença já é de 56 843 233 chamadas para 85.
- Para o Fibonacci vale o mesmo raciocínio com dois filhos: 2 · F(n) - 1 sem cache e 2n - 1 com
  cache.

### Slide 8: os custos e a parte honesta (1:00)

Na tela: três linhas curtas.

- Memória do cache: n - 2 entradas no Tribonacci. Para n = 30, 28 valores guardados.
- Pilha: a profundidade é n - 1 nos dois modos. O cache economiza chamadas, não economiza pilha.
- Fatorial: mesma quantidade de chamadas com e sem cache, nenhum acerto, e memória a mais.

O que dizer:

- Diga o do Fatorial olhando para o professor: "aqui o cache não ajuda, e a nossa tela mostra isso
  em vez de esconder".
- O motivo: o Fatorial é uma corrente, não uma árvore. Nenhum argumento se repete, então não há
  nada para reaproveitar.

### Slide 9: fechamento (1:00)

Na tela: a frase central e os três números 46, 16, 30.

O que dizer:

- Recursão pura é clara, mas repete trabalho quando os subproblemas se sobrepõem.
- O cache resolve com uma linha de código e um dicionário, e o preço é memória proporcional a n.
- Onde não há repetição, como no Fatorial, o cache só custa. Medir é o que permite afirmar isso.
- Encerre abrindo para perguntas.

## Demonstração ao vivo, clique a clique

Endereços prontos, todos com a interface em `http://localhost:5173`. Deixe as abas já abertas na
ordem abaixo e navegue com Ctrl+Tab, em vez de digitar endereço na frente de todo mundo.

### Passo 1: Início (0:10)

`http://localhost:5173/`

Apontar: as três sequências com fórmula e casos base. Dizer: "tudo que vem a seguir sai de execução
de verdade, nada está fixo na tela".

### Passo 2: Calcular, sem cache (0:50)

`http://localhost:5173/calcular?sequencia=tribonacci&n=7&modo=sem_cache`

Apontar, nesta ordem:

- Valor: 31.
- Invocações: 46. Chamadas recursivas: 45.
- Calculados: 15. Casos base: 31.
- Profundidade máxima: 6.

Dizer: "46 chamadas para somar 31 parcelas iguais a 1".

### Passo 3: Calcular, com cache (0:30)

Um clique no seletor de modo, na mesma tela. O endereço vira
`http://localhost:5173/calcular?sequencia=tribonacci&n=7&modo=com_cache`.

Apontar: valor continua 31; invocações caem para 16; calculados 5; acertos 5; casos base 6;
entradas no cache 5; profundidade continua 6.

Dizer: "mesmo resultado, um terço das chamadas, e a profundidade não mudou".

### Passo 4: Árvore sem cache (1:00)

`http://localhost:5173/arvore?sequencia=tribonacci&n=7&modo=sem_cache`

Apontar:

- O tamanho da árvore: 46 nós.
- As sete cópias de f(3) e as quatro de f(4). Passe o cursor por duas delas e mostre que o valor é
  o mesmo.
- As folhas: 31 casos base, a maior parte da árvore.

Dizer: "o desperdício não é uma teoria, é isto aqui".

### Passo 5: Árvore com cache (0:50)

Um clique no seletor de modo. O endereço vira
`http://localhost:5173/arvore?sequencia=tribonacci&n=7&modo=com_cache`.

Apontar:

- A árvore encolheu para 16 nós.
- Os 5 acertos, na ordem: f(3) dentro de f(5); f(4) dentro de f(6); f(3) dentro de f(6); f(5)
  dentro de f(7); f(4) dentro de f(7).
- A conta: 46 - 16 = 30 chamadas evitadas. Some as subárvores podadas na tela: 12 + 6 + 6 + 3 + 3,
  também 30.

Dizer: "cada acerto corta uma subárvore inteira; o acerto de f(5) sozinho corta 12 chamadas".

### Passo 6: Comparar desempenho (1:00)

`http://localhost:5173/comparar?sequencia=tribonacci&n=25`

Apontar:

- Invocações: 2 700 421 sem cache contra 70 com cache.
- Chamadas evitadas: 2 700 351.
- Tempo mediano dos dois modos e o fator de aceleração.
- A memória retida pelo cache, que é maior no modo com cache.

Dizer: "o tempo é mediana de várias repetições, com aquecimento, e o cache começa vazio a cada
repetição". Se o público estiver acompanhando bem e sobrar tempo, repita com n = 30, que é o limite
do modo sem cache; avise que vai demorar alguns segundos.

### Passo 7: o Fatorial honesto (0:40)

`http://localhost:5173/comparar?sequencia=fatorial&n=10`

Apontar: valor 3 628 800, 10 invocações nos dois modos, zero acertos, chamadas evitadas igual a
zero, e a memória um pouco maior no modo com cache.

Dizer: "escolhemos mostrar o caso em que a nossa própria otimização não serve para nada".

Se sobrar tempo, troque n para 1000 na mesma tela: o valor passa a ter 2 568 dígitos. Serve para
justificar o uso de `bigint` sem precisar de slide.

### Alternativa de um clique só: modo apresentação

`http://localhost:5173/apresentacao` mostra Tribonacci f(7) nos dois modos lado a lado, em uma tela
só. Use esta tela se estiver atrasado, se o projetor tiver pouca resolução ou se a demonstração
começar a travar. Ela substitui os passos 2 a 5 em cerca de 1:30.

A conferir na revisão final: os nomes exatos dos parâmetros nos endereços, se o seletor de modo
realmente altera a URL sem recarregar, e se a tela Comparar aceita o número de repetições pelo
endereço. As telas ainda estão sendo construídas em paralelo.

## Plano B

Tenha os quatro níveis prontos antes de começar. Suba na escada só até onde for necessário.

1. **Recarregar e reduzir.** Se uma tela travar ou a API demorar, pressione F5 e repita com n
   menor: Tribonacci 20 no lugar de 25. Confira a API em `http://localhost:3333/api/saude`.
2. **Modo offline no navegador.** A interface calcula sem a API, em um Web Worker, dentro dos
   limites do navegador (Tribonacci até 22 sem cache). Serve para salvar a demonstração se só a API
   cair. As contagens continuam exatas; os tempos aparecem marcados como indicativos e a memória
   não é exibida, porque o navegador não dá medida confiável. Diga isso em voz alta ao usar.
3. **Linha de comando.** Terminal já aberto, fonte grande, comando digitado e pronto para o Enter:

   ```bash
   pnpm cli tribonacci 7 --modo sem_cache --arvore
   pnpm cli tribonacci 7 --modo com_cache --arvore
   ```

   Ela imprime o valor, as métricas e a árvore em texto indentado. Dá para fazer a apresentação
   inteira só com isso.

4. **Figuras estáticas.** Exporte antes as imagens das duas árvores e da tela de comparação para
   `docs/figuras/` e deixe abertas em uma aba ou em um PDF. Como último recurso, o documento
   `explicacao-tribonacci.md` tem as duas árvores completas em texto, prontas para projetar.

Duas regras do plano B:

- Não use os mocks de desenvolvimento da interface na apresentação. As contagens deles são reais,
  mas os tempos são simulados, e apresentar tempo simulado como se fosse medição invalida o
  argumento.
- Se algo falhar, não conserte ao vivo. Troque de nível, continue falando e volte ao assunto. O
  critério de avaliação é a fluidez.

A conferir na revisão final: se o modo offline do navegador já está implementado de ponta a ponta e
se as figuras de `docs/figuras/` já foram exportadas.

## Checklist dez minutos antes

Ambiente:

- [ ] Notebook na tomada, notificações desligadas, modo não perturbe ligado.
- [ ] Projetor testado, resolução ajustada, navegador com zoom entre 125% e 150%.
- [ ] Uma janela do navegador só, sem abas pessoais, sem histórico aparecendo ao digitar.
- [ ] Terminal com fonte grande e tema claro, se a sala tiver muita luz.

Aplicação:

- [ ] `cd` para a raiz do repositório e `pnpm install --frozen-lockfile --prefer-offline`.
- [ ] `pnpm dev` rodando. Interface em `http://localhost:5173`, API em `http://localhost:3333`.
- [ ] `http://localhost:3333/api/saude` respondendo `{"status":"ok"}`.
- [ ] Abrir uma vez cada tela da demonstração, para o primeiro carregamento não acontecer no palco.
- [ ] Rodar uma vez `pnpm cli tribonacci 7 --modo com_cache` para o terminal já estar quente.
- [ ] Conferir que Tribonacci f(7) mostra 46 e 16. Se mostrar outra coisa, use o plano B e avise a
      equipe.

Abas abertas, nesta ordem:

1. `http://localhost:5173/`
2. `http://localhost:5173/calcular?sequencia=tribonacci&n=7&modo=sem_cache`
3. `http://localhost:5173/arvore?sequencia=tribonacci&n=7&modo=sem_cache`
4. `http://localhost:5173/comparar?sequencia=tribonacci&n=25`
5. `http://localhost:5173/apresentacao`

Se for mostrar no celular: suba a interface expondo o host e acesse pelo endereço IP da máquina na
rede da sala, ou use `docker compose up --build` na porta 8080. Teste antes, porque a rede da
faculdade pode isolar os aparelhos e porque o Compose ainda não foi executado de ponta a ponta
nesta máquina (registro em `docs/decisoes.md`). A conferir na revisão final: se o script de
desenvolvimento já expõe o servidor na rede local.

## Se o tempo for outro

### Dez minutos: o que cortar

| Seção                    | Tempo | O que muda                                    |
| ------------------------ | ----- | --------------------------------------------- |
| Abertura e problema      | 0:45  | Corta o slide da pergunta, junta com a capa   |
| As três sequências       | 0:45  | Só as fórmulas, sem detalhar os casos base    |
| Árvore de f(7) sem cache | 1:45  | Mantém inteira, é o coração                   |
| O cache em três regras   | 1:15  | Mantém inteira                                |
| Demonstração             | 4:00  | Só os passos 2, 4 e 5 (calcular e as árvores) |
| Escala e fechamento      | 1:30  | Uma frase sobre 3n - 5 e o encerramento       |

Cortes, em ordem: a tela Comparar, o slide de escala, o Fatorial e o slide de custos. O Fatorial
vira uma frase: "no Fatorial o cache não ajuda, e mostramos isso na ferramenta".

### Vinte minutos: o que acrescentar

| Acréscimo                                                                          | Tempo |
| ---------------------------------------------------------------------------------- | ----- |
| Série de n com o gráfico das duas curvas na mesma escala                           | 1:30  |
| Tribonacci n = 30 ao vivo, o limite do modo sem cache                              | 1:00  |
| A árvore do Fibonacci f(10), para mostrar o mesmo efeito com dois filhos           | 1:00  |
| Como medimos: mediana, repetições, aquecimento, ordem alternada e coleta de lixo   | 1:00  |
| Arquitetura: contrato compartilhado, worker com pilha ampliada, OpenAPI em `/docs` | 0:30  |

## Perguntas prováveis e respostas curtas

**Memoização ou programação dinâmica de baixo para cima?** Memoização é de cima para baixo: a
recursão continua e só calcula os subproblemas que realmente aparecem. De baixo para cima é um laço
que preenche uma tabela de 0 até n, sem recursão. O resultado é o mesmo; de baixo para cima não usa
pilha e, no Tribonacci, dá para guardar só os três últimos valores, com memória constante. O
enunciado pede recursão, então usamos memoização, que é a versão recursiva dessa mesma ideia.

**Por que o Fatorial não ganha nada com cache?** Porque não tem subproblemas sobrepostos. Cada
argumento aparece uma única vez: f(10) chama f(9), que chama f(8), e assim por diante. É uma
corrente, não uma árvore. Com cache são as mesmas n chamadas, nenhum acerto, e ainda n - 1 entradas
guardadas sem uso. Só ganharia se o cache sobrevivesse entre execuções diferentes.

**Por que bigint e não number?** Porque os valores estouram o inteiro seguro do JavaScript, que vai
até 2^53 - 1. O Fatorial passa disso em n = 19, o Tribonacci em n = 62 e o Fibonacci em n = 78. Com
`number` o erro seria silencioso: a tela mostraria um número arredondado com cara de certo. Como
`JSON.stringify` não serializa bigint, os valores trafegam como texto decimal e voltam a virar
bigint quando precisamos calcular.

**Por que a contagem inclui os acertos de cache?** Porque um acerto é uma chamada de função de
verdade: entra na pilha, consulta o dicionário e retorna. Ele é mais barato, mas não é de graça.
Contar só os cálculos esconderia esse custo. Com a nossa convenção as contas fecham sozinhas:
invocações = casos base + calculados + acertos, e chamadas recursivas = invocações - 1. A tela
mostra os dois números lado a lado.

**E o risco de estourar a pilha?** É real, e o cache não ajuda nisso: a profundidade máxima é n - 1
nos dois modos, porque o caminho mais à esquerda é idêntico. Tratamos de três formas: limite de n
por sequência, modo e ambiente; execução em um worker com pilha ampliada; e captura do erro, que
vira uma mensagem clara na tela com o código `PILHA_ESTOURADA` em vez de derrubar o servidor.

**Por que medir no Node e não no navegador?** No navegador o relógio tem precisão reduzida de
propósito, por segurança, não dá para forçar a coleta de lixo e a aba disputa processador com a
renderização. No Node temos relógio de nanossegundos, coleta de lixo sob demanda e leitura do heap.
Por isso a medição oficial roda no servidor; o cálculo no navegador existe só como plano B e é
rotulado como indicativo.

**Por que zerar o cache a cada execução?** Para medir o algoritmo e não o histórico. Se o cache
sobrevivesse, a segunda medição encontraria tudo pronto e o resultado dependeria da ordem dos
cliques. Cada repetição começa com o dicionário vazio. Também alternamos a ordem dos dois modos
entre as rodadas e usamos a mediana, para o aquecimento do motor não favorecer quem roda primeiro.

**Qual é a complexidade dos dois modos?** Sem cache, o número de chamadas do Tribonacci é
proporcional a 1,839 elevado a n, e do Fibonacci a 1,618 elevado a n; a memória é O(n), só de
pilha. Com cache, são 3n - 5 chamadas no Tribonacci e 2n - 1 no Fibonacci, com O(n) de pilha mais
O(n) entradas de cache. Contando cada soma como uma operação, o modo com cache é linear; contando
dígito a dígito, fica perto de n², porque os números crescem junto com n.

**O que aconteceria com n grande?** Sem cache, inviável rápido: o Tribonacci em n = 50 daria mais
de 11 trilhões de chamadas, algo como dois dias de processamento. Por isso o limite do modo sem
cache é n = 30. Com cache, as chamadas crescem devagar, mas a pilha cresce junto com n; o limite é
5000, com pilha ampliada. Acima disso a resposta correta não é mais recursão: é o laço de baixo
para cima, que não usa pilha nenhuma.

**Vocês usaram alguma biblioteca para os algoritmos?** Não. Os algoritmos são TypeScript puro em
`packages/nucleo`, sem dependências. As bibliotecas do projeto são só de interface, servidor,
validação e testes.

## Últimos avisos para quem apresenta

- Fale os números devagar. 46, 16 e 30 são o que o professor vai lembrar.
- Não leia os slides. Eles têm poucas palavras de propósito.
- Se a demonstração atrasar, abandone a seção de escala, nunca a árvore.
- Se não souber uma resposta, diga o que sabe e onde está a resposta no projeto. A ferramenta mede,
  então é sempre possível responder "podemos rodar e ver".
