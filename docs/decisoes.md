# Registro de decisões

Formato: data, contexto, decisão e consequência. Dúvidas de interpretação do
enunciado seguem sempre a opção mais fiel ao texto original.

## 2026-09-17: Contexto não informado no briefing

- **Tempo da apresentação** não foi informado. Assumimos 15 minutos; o roteiro
  traz a divisão por seção e indica o que cortar se o tempo for menor.
- **Restrições do professor** (linguagem, bibliotecas, formato de entrega) não
  foram informadas. Assumimos "nenhuma". Se surgir alguma, ela vence e a
  decisão será registrada aqui.
- **Critérios de avaliação 1 a 3** não estavam disponíveis; só o critério 4
  (fluidez na apresentação e na demonstração) é conhecido.

## 2026-09-17: Casos base exatamente como no enunciado

Fibonacci usa f(0) = f(1) = 1 (sequência 1, 1, 2, 3, 5, 8, ...) e Tribonacci
usa f(0) = f(1) = f(2) = 1 (1, 1, 1, 3, 5, 9, 17, 31, ...). Isso difere da
convenção com f(0) = 0 e muda os valores de referência: Tribonacci f(7) = 31.

## 2026-09-17: Convenção de contagem

"Invocação" é toda chamada da função, incluindo a raiz, os casos base e os
acertos de cache. Ordem de verificação: caso base, cache, cálculo. A interface
mostra sempre dois números: invocações totais e chamadas recursivas (total
menos a raiz). A contagem por argumento e a lista de acertos seguem a mesma
convenção. Referência: Tribonacci f(7) tem 46 invocações sem cache e 16 com
cache, logo 30 chamadas evitadas.

## 2026-09-17: Nome do campo "faltas de cache"

Nas métricas, o campo chama-se `calculados` (nós que executaram a fórmula).
No modo com cache ele equivale às faltas de cache; no modo sem cache, toda
chamada não-base é calculada. Preferimos um nome único válido nos dois modos
para não ter campos redundantes. A interface rotula como "Calculados (faltas
de cache)" quando o modo é com cache.

## 2026-09-17: Profundidade máxima

`profundidade_maxima` conta quadros da função simultaneamente na pilha, com a
raiz valendo 1. Para Tribonacci f(7) o valor é 6 (f(7) até f(2)).

## 2026-09-17: Pacotes internos consumidos a partir do código-fonte

`packages/contrato` e `packages/nucleo` exportam `src/index.ts` diretamente
(sem etapa de build). Vite, tsx e Vitest transpilam na hora e `tsc` checa os
tipos a partir da fonte. Para produção, a API é empacotada com tsup incluindo
os pacotes internos. Consequência: `pnpm dev` funciona sem builds prévios.

## 2026-09-17: Valores como texto no JSON

`JSON.stringify` não serializa `bigint`. Todos os valores de sequência
trafegam como string decimal; o frontend só reconverte com `BigInt()` quando
precisa calcular. Os schemas Zod validam o formato com a expressão `^\d+$`.

## 2026-09-17: Versões das dependências

Fixamos TypeScript 5.x (o typescript-eslint ainda não aceita a linha 7),
Vite 7 com Vitest 4, ESLint 9, React 19, React Router 7, Zod 4 e Fastify 5.
Versões mais novas existiam no registro, mas com compatibilidade cruzada
incerta entre plugins.

## 2026-09-17: Trabalho em worktrees paralelos

Cada frente de trabalho usa um `git worktree` proprio em
`/home/g-travensolli/fatec/.worktrees-trabalho-ed`, fora da pasta do
repositorio, com branch `feature/*` saido de `develop`. Ficar fora da pasta
evita que ESLint, Prettier, `tsc` e Vitest do repositorio principal enxerguem
os arquivos das outras frentes. A integracao acontece por merge `--no-ff` em
`develop`, feito em um lugar so.

## 2026-09-17: Ambiente de desenvolvimento

- Node 22.22.1 e pnpm 10, instalado por `corepack` em `~/.local/bin`.
- `jsdom` fica na linha 29: a linha 30 exige Node 22.22.2 ou superior e o
  campo `engines` do pacote bloqueia a instalacao.
- TypeScript fica na linha 5: o `typescript-eslint` 8 ainda declara
  compatibilidade ate a linha 6.
- O daemon do Docker esta ativo na maquina, mas o usuario nao pertence ao
  grupo `docker` e nao ha `sudo` sem senha. Os arquivos do Compose e os
  Dockerfiles foram escritos e revisados, porem `docker compose up` ainda nao
  foi executado de ponta a ponta. Para validar: `sudo usermod -aG docker $USER`
  e reabrir a sessao.

## 2026-09-17: Onde cada numero da interface nasce

Nenhuma tela mostra numero escrito no codigo. Enquanto a API nao existia, o
frontend foi construido sobre mocks que executam a mesma recorrencia e
devolvem metricas reais. Na integracao, os mocks saem e as respostas passam a
vir da API, que usa `packages/nucleo`. O modo apresentacao tem um plano B que
executa o mesmo nucleo num Web Worker do navegador: as contagens continuam
exatas, os tempos aparecem marcados como indicativos e a memoria nao e
exibida, porque o navegador nao oferece medida confiavel.

## 2026-09-28: Contexto informado — apresentação de 10 minutos

O contexto que faltava no briefing foi informado e substitui a suposição de 15
minutos registrada em 17/09.

- **Tempo:** 10 minutos. O roteiro foi refeito com essa duração e organizado na
  ordem do enunciado, para que nenhum dos quatro pedidos fique de fora.
- **Base da apresentação:** o próprio enunciado. Cada seção do roteiro e do
  relatório responde a um pedido dele, na mesma ordem.
- **Material projetado:** `docs/relatorio.html`, gerado por `pnpm relatorio`. É
  um arquivo único, estático, sem servidor e sem dependência de rede, então a
  apresentação não depende de a aplicação subir na hora.
- **A aplicação continua no projeto**, com front e back em Docker Compose, para
  que seja possível informar o n das três funções e conferir os resultados ao
  vivo. A demonstração passou a ser um bloco curto dentro da seção de
  desempenho, e não mais o centro da apresentação.

**Consequência:** a documentação didática foi consolidada no `README.md`, agora
em formato de artigo, que passa a ser a fonte para montar a apresentação. Os
documentos `explicacao-tribonacci.md` e `metodologia-medicao.md` foram
incorporados a ele (seções 2, 3, 5 e 6) e removidos, para não haver duas versões
dos mesmos números.
