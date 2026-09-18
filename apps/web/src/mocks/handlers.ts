import {
  ArvoreRequisicaoSchema,
  CalcularRequisicaoSchema,
  CompararRequisicaoSchema,
  DESCRICAO_SEQUENCIAS,
  EstimativaConsultaSchema,
  LIMIAR_CONFIRMACAO_INVOCACOES,
  LIMITE_NOS_ARVORE_MAXIMO,
  LIMITE_NOS_ARVORE_PADRAO,
  LIMITES_N,
  SEQUENCIAS,
  SerieRequisicaoSchema,
  limiteN,
  type AmbienteExecucao,
  type ArvoreResposta,
  type CalcularResposta,
  type CompararResposta,
  type Erro,
  type EstatisticasTempo,
  type EstimativaResposta,
  type MemoriaModo,
  type Modo,
  type PontoSerie,
  type Sequencia,
  type SequenciasResposta,
  type SerieResposta,
} from '@sequencias/contrato';
import { HttpResponse, delay, http } from 'msw';
import type { z } from 'zod';
import { executarMock, metricasMock, tempoSimuladoNs, truncarArvore } from './referencia-mock';

const ambienteMock: AmbienteExecucao = {
  node: 'mock',
  v8: 'mock',
  plataforma: 'navegador (mock MSW)',
  arquitetura: 'x64',
  cpu: 'simulada',
  nucleos: 1,
  memoria_total_bytes: 0,
};

function erro(status: number, codigo: Erro['codigo'], mensagem: string, detalhes?: unknown) {
  const corpo: Erro =
    detalhes === undefined ? { codigo, mensagem } : { codigo, mensagem, detalhes };
  return HttpResponse.json(corpo, { status });
}

function validar<T extends z.ZodType>(schema: T, dados: unknown) {
  const analise = schema.safeParse(dados);
  if (analise.success) return { ok: true as const, dados: analise.data as z.output<T> };
  const primeira = analise.error.issues[0];
  return {
    ok: false as const,
    resposta: erro(
      400,
      'ENTRADA_INVALIDA',
      primeira
        ? `${primeira.path.join('.') || 'entrada'}: ${primeira.message}`
        : 'Entrada inválida.',
      analise.error.issues,
    ),
  };
}

function conferirLimite(sequencia: Sequencia, n: number, modo: Modo) {
  const limite = limiteN('node', sequencia, modo);
  if (n > limite) {
    return erro(
      422,
      'LIMITE_EXCEDIDO',
      `Para ${DESCRICAO_SEQUENCIAS[sequencia].nome} ${modo === 'sem_cache' ? 'sem' : 'com'} cache, o maior n permitido é ${limite}.`,
      { limite },
    );
  }
  return null;
}

function estatisticas(ns: number, repeticoes: number): EstatisticasTempo {
  const ruido = ns * 0.04;
  return {
    mediana_ns: ns,
    media_ns: ns + ruido / 2,
    minimo_ns: ns - ruido,
    maximo_ns: ns + ruido * 2,
    desvio_padrao_ns: ruido,
    repeticoes,
    aquecimentos: 3,
    execucoes_por_repeticao: ns < 1_000_000 ? Math.ceil(200_000_000 / Math.max(ns, 1)) : 1,
  };
}

function memoria(entradas: number, profundidade: number, repeticoes: number): MemoriaModo {
  return {
    retida_cache_bytes: entradas * 96,
    pico_heap_bytes: 2_500_000 + entradas * 120 + profundidade * 64,
    intervalo_amostragem: 1000,
    entradas_cache: entradas,
    profundidade_maxima: profundidade,
    repeticoes,
  };
}

export const handlers = [
  http.get('/api/saude', async () => {
    await delay(50);
    return HttpResponse.json({ status: 'ok', versao: 'mock', node: 'mock', tempo_ativo_s: 1 });
  }),

  http.get('/api/sequencias', async () => {
    await delay(100);
    const corpo: SequenciasResposta = {
      sequencias: SEQUENCIAS.map((id) => ({
        ...DESCRICAO_SEQUENCIAS[id],
        limites: LIMITES_N.node[id],
      })),
      limite_nos_arvore_padrao: LIMITE_NOS_ARVORE_PADRAO,
      limite_nos_arvore_maximo: LIMITE_NOS_ARVORE_MAXIMO,
      limiar_confirmacao_invocacoes: LIMIAR_CONFIRMACAO_INVOCACOES,
    };
    return HttpResponse.json(corpo);
  }),

  http.get('/api/estimativa', async ({ request }) => {
    const url = new URL(request.url);
    const analise = validar(EstimativaConsultaSchema, Object.fromEntries(url.searchParams));
    if (!analise.ok) return analise.resposta;
    const { sequencia, n, modo } = analise.dados;
    await delay(80);
    const limite = limiteN('node', sequencia, modo);
    // No mock, executa de fato só quando cabe no limite; acima disso estima por crescimento.
    const previstas =
      n <= Math.min(limite, 25)
        ? BigInt(metricasMock(sequencia, n, modo).invocacoes)
        : modo === 'com_cache' || sequencia === 'fatorial'
          ? BigInt(
              Math.max(
                1,
                sequencia === 'fibonacci' ? 2 * n - 1 : sequencia === 'tribonacci' ? 3 * n - 5 : n,
              ),
            )
          : BigInt(Math.round((sequencia === 'fibonacci' ? 1.618 : 1.839) ** n));
    const pesado = previstas > BigInt(LIMIAR_CONFIRMACAO_INVOCACOES);
    const corpo: EstimativaResposta = {
      sequencia,
      n,
      modo,
      invocacoes_previstas: previstas.toString(),
      profundidade_prevista: Math.max(1, sequencia === 'tribonacci' ? n - 1 : n),
      limite_n: limite,
      dentro_do_limite: n <= limite,
      pesado,
      aviso: pesado ? 'Este cálculo gera muitas invocações e pode demorar alguns segundos.' : null,
    };
    return HttpResponse.json(corpo);
  }),

  http.post('/api/calcular', async ({ request }) => {
    const analise = validar(CalcularRequisicaoSchema, await request.json());
    if (!analise.ok) return analise.resposta;
    const { sequencia, n, modo } = analise.dados;
    const bloqueio = conferirLimite(sequencia, n, modo);
    if (bloqueio) return bloqueio;
    await delay(150);
    const inicio = performance.now();
    const metricas = metricasMock(sequencia, n, modo);
    const corpo: CalcularResposta = {
      sequencia,
      n,
      modo,
      metricas,
      duracao_ms: performance.now() - inicio,
    };
    return HttpResponse.json(corpo);
  }),

  http.post('/api/comparar', async ({ request }) => {
    const analise = validar(CompararRequisicaoSchema, await request.json());
    if (!analise.ok) return analise.resposta;
    const { sequencia, n, repeticoes } = analise.dados;
    const bloqueio = conferirLimite(sequencia, n, 'sem_cache');
    if (bloqueio) return bloqueio;
    await delay(400);
    const sem = metricasMock(sequencia, n, 'sem_cache');
    const com = metricasMock(sequencia, n, 'com_cache');
    const tempoSem = tempoSimuladoNs(sem.invocacoes, sem.digitos);
    const tempoCom = tempoSimuladoNs(com.invocacoes, com.digitos) + 40 * com.entradas_cache;
    const memSem = memoria(0, sem.profundidade_maxima, repeticoes);
    const memCom = memoria(com.entradas_cache, com.profundidade_maxima, repeticoes);
    const corpo: CompararResposta = {
      sequencia,
      n,
      valor: sem.valor,
      digitos: sem.digitos,
      repeticoes,
      tempo: {
        sem_cache: estatisticas(tempoSem, repeticoes),
        com_cache: estatisticas(tempoCom, repeticoes),
      },
      memoria: { sem_cache: memSem, com_cache: memCom },
      invocacoes: { sem_cache: sem.invocacoes, com_cache: com.invocacoes },
      fator_aceleracao: tempoSem / tempoCom,
      chamadas_evitadas: sem.invocacoes - com.invocacoes,
      diferenca_memoria_bytes: memCom.retida_cache_bytes - memSem.retida_cache_bytes,
      ordem_execucao: ['sem_cache', 'com_cache'],
      ambiente: ambienteMock,
    };
    return HttpResponse.json(corpo);
  }),

  http.post('/api/serie', async ({ request }) => {
    const analise = validar(SerieRequisicaoSchema, await request.json());
    if (!analise.ok) return analise.resposta;
    const { sequencia, n_inicial, n_final, passo, repeticoes } = analise.dados;
    await delay(500);
    const limiteSem = limiteN('node', sequencia, 'sem_cache');
    const pontos: PontoSerie[] = [];
    for (let n = n_inicial; n <= n_final; n += passo) {
      const com = metricasMock(sequencia, n, 'com_cache');
      const semDisponivel = n <= limiteSem;
      const sem = semDisponivel ? metricasMock(sequencia, n, 'sem_cache') : null;
      pontos.push({
        n,
        digitos: com.digitos,
        tempo_ns: {
          sem_cache: sem ? tempoSimuladoNs(sem.invocacoes, sem.digitos) : null,
          com_cache: tempoSimuladoNs(com.invocacoes, com.digitos) + 40 * com.entradas_cache,
        },
        invocacoes: { sem_cache: sem ? sem.invocacoes : com.invocacoes, com_cache: com.invocacoes },
      });
    }
    const corpo: SerieResposta = {
      sequencia,
      n_inicial,
      n_final,
      passo,
      repeticoes,
      pontos,
      ambiente: ambienteMock,
    };
    return HttpResponse.json(corpo);
  }),

  http.post('/api/arvore', async ({ request }) => {
    const analise = validar(ArvoreRequisicaoSchema, await request.json());
    if (!analise.ok) return analise.resposta;
    const { sequencia, n, modo, limite_nos } = analise.dados;
    const bloqueio = conferirLimite(sequencia, n, modo);
    if (bloqueio) return bloqueio;
    await delay(200);
    const { metricas, raiz } = executarMock(sequencia, n, modo);
    const truncamento = truncarArvore(raiz, limite_nos);
    const corpo: ArvoreResposta = {
      sequencia,
      n,
      modo,
      metricas,
      raiz: truncamento.raiz,
      truncada: truncamento.truncada,
      limite_nos,
      nos_exibidos: truncamento.nos,
    };
    return HttpResponse.json(corpo);
  }),
];
