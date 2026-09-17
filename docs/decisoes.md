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
