import { executarInstrumentado } from '@sequencias/nucleo';
import { describe, expect, it } from 'vitest';
import { executarCli } from './cli';

function rodar(linha: string) {
  return executarCli(linha.split(' ').filter((parte) => parte.length > 0));
}

describe('caso feliz', () => {
  it('tribonacci 7 sem cache mostra os valores de referência', () => {
    const { saida, codigo } = rodar('tribonacci 7 --modo sem_cache');
    expect(codigo).toBe(0);
    expect(saida).toContain('Tribonacci f(7), modo sem cache');
    expect(saida).toContain('f(n) = f(n-1) + f(n-2) + f(n-3), com f(0) = f(1) = f(2) = 1');
    expect(saida).toContain('Valor: 31 (2 dígitos)');
    expect(saida).toMatch(/Invocações\s+46/);
    expect(saida).toMatch(/Chamadas recursivas\s+45/);
    expect(saida).toMatch(/Casos base\s+31/);
    expect(saida).toMatch(/Calculados\s+15/);
    expect(saida).toMatch(/Acertos de cache\s+0/);
    expect(saida).toMatch(/Profundidade máxima\s+6/);
    expect(saida).toMatch(/f\(2\)\s+13/);
    expect(saida).not.toContain('Árvore de chamadas');
  });

  it('tribonacci 7 com cache mostra acertos e economia de chamadas', () => {
    const { saida, codigo } = rodar('tribonacci 7 --modo com_cache');
    expect(codigo).toBe(0);
    expect(saida).toContain('modo com cache');
    expect(saida).toMatch(/Invocações\s+16/);
    expect(saida).toMatch(/Acertos de cache\s+5/);
    expect(saida).toMatch(/Entradas no cache\s+5/);
    expect(saida).toContain('Acertos de cache, na ordem em que aconteceram');
    expect(saida).toContain('f(3) dentro de f(5)');
    expect(saida).toContain('f(4) dentro de f(7)');
  });

  it('fibonacci 10 nos dois modos', () => {
    const sem = rodar('fibonacci 10');
    expect(sem.codigo).toBe(0);
    expect(sem.saida).toContain('modo sem cache');
    expect(sem.saida).toContain('Valor: 89 (2 dígitos)');
    expect(sem.saida).toMatch(/Invocações\s+177/);
    const com = rodar('fibonacci 10 --modo com_cache');
    expect(com.saida).toMatch(/Invocações\s+19/);
  });

  it('fatorial 10 usa separador de milhar e admite que o cache não economiza', () => {
    const sem = rodar('fatorial 10');
    expect(sem.codigo).toBe(0);
    expect(sem.saida).toContain('Valor: 3.628.800 (7 dígitos)');
    expect(sem.saida).toMatch(/Invocações\s+10/);
    const com = rodar('fatorial 10 --modo com_cache');
    expect(com.saida).toMatch(/Invocações\s+10/);
    expect(com.saida).toContain('nenhum acerto de cache aconteceu');
    expect(sem.saida).not.toContain('nenhum acerto de cache aconteceu');
  });

  it('valores grandes aparecem pelas pontas com a contagem de dígitos', () => {
    const { saida, codigo } = rodar('fatorial 200 --modo com_cache');
    expect(codigo).toBe(0);
    expect(saida).toContain('(375 dígitos)');
    expect(saida).toContain('...');
  });

  it('os números impressos vêm da execução instrumentada', () => {
    const { metricas } = executarInstrumentado('tribonacci', 12, 'sem_cache', {
      comArvore: false,
    });
    const { saida } = rodar('tribonacci 12');
    expect(saida).toContain(`Valor: ${metricas.valor}`);
    expect(saida).toMatch(
      new RegExp(`Invocações\\s+${metricas.invocacoes.toLocaleString('pt-BR')}`),
    );
  });
});

describe('--arvore', () => {
  it('imprime a árvore indentada completa de tribonacci 7', () => {
    const { saida, codigo } = rodar('tribonacci 7 --modo sem_cache --arvore');
    expect(codigo).toBe(0);
    expect(saida).toContain('Árvore de chamadas (46 de 46 nós)');
    expect(saida).toContain('f(7) = 31 [calculado]');
    expect(saida).toContain('  f(6) = 17 [calculado]');
    expect(saida).toContain('    f(5) = 9 [calculado]');
    expect(saida).not.toContain('descendentes ocultos');
    expect(saida).not.toContain('Árvore cortada');
    const linhasDeNo = saida.split('\n').filter((linha) => /f\(\d+\) = \d+ \[/.test(linha));
    expect(linhasDeNo).toHaveLength(46);
  });

  it('marca os acertos de cache na árvore', () => {
    const { saida } = rodar('tribonacci 7 --modo com_cache --arvore');
    expect(saida).toContain('Árvore de chamadas (16 de 16 nós)');
    expect(saida).toContain('[acerto de cache]');
    expect(saida).toContain('[base]');
  });
});

describe('--limite-nos', () => {
  it('trunca a árvore e avisa', () => {
    const { saida, codigo } = rodar('tribonacci 7 --arvore --limite-nos 10');
    expect(codigo).toBe(0);
    expect(saida).toContain('Árvore de chamadas (10 de 46 nós)');
    expect(saida).toContain('descendentes ocultos');
    expect(saida).toContain('Árvore cortada no limite de 10 nós');
    expect(saida).toMatch(/Invocações\s+46/);
    const linhasDeNo = saida.split('\n').filter((linha) => /f\(\d+\) = \d+ \[/.test(linha));
    expect(linhasDeNo).toHaveLength(10);
  });

  it('recusa limite inválido', () => {
    for (const argumento of ['0', '-3', '2.5', 'muitos']) {
      const { saida, codigo } = rodar(`tribonacci 7 --arvore --limite-nos ${argumento}`);
      expect(codigo).toBe(1);
      expect(saida).toContain('--limite-nos precisa de um inteiro maior ou igual a 1');
    }
  });
});

describe('--json', () => {
  it('devolve JSON com o valor em texto e as métricas', () => {
    const { saida, codigo } = rodar('tribonacci 7 --modo sem_cache --json');
    expect(codigo).toBe(0);
    const carga = JSON.parse(saida) as Record<string, unknown>;
    expect(carga).toMatchObject({
      sequencia: 'tribonacci',
      n: 7,
      modo: 'sem_cache',
      valor: '31',
      digitos: 2,
      arvore: null,
    });
    expect(carga.metricas).toMatchObject({ invocacoes: 46, casos_base: 31, calculados: 15 });
    expect(typeof (carga.metricas as { valor: unknown }).valor).toBe('string');
  });

  it('inclui a árvore quando pedida e mantém valores grandes exatos', () => {
    const comArvore = JSON.parse(rodar('tribonacci 7 --json --arvore').saida) as {
      arvore: { argumento: number; valor: string; filhos: unknown[] };
      nos_exibidos: number;
      truncada: boolean;
    };
    expect(comArvore.arvore).toMatchObject({ argumento: 7, valor: '31' });
    expect(comArvore.arvore.filhos).toHaveLength(3);
    expect(comArvore.nos_exibidos).toBe(46);
    expect(comArvore.truncada).toBe(false);

    const grande = JSON.parse(rodar('fatorial 30 --modo com_cache --json').saida) as {
      valor: string;
    };
    expect(grande.valor).toBe('265252859812191058636308480000000');
  });
});

describe('entradas inválidas', () => {
  it.each([
    ['tribonacci 7 --modo memo', 'modo inválido: "memo"'],
    ['lucas 7', 'sequência desconhecida: "lucas"'],
    ['tribonacci -3', 'n não pode ser negativo'],
    ['tribonacci 2.5', 'n deve ser um número inteiro'],
    ['tribonacci abc', 'n deve ser um número inteiro'],
    ['tribonacci', 'informe o valor de n depois da sequência'],
    ['tribonacci 7 --turbo', 'opção desconhecida: --turbo'],
  ])('%s sai com código 1', (linha, trecho) => {
    const { saida, codigo } = rodar(linha);
    expect(codigo).toBe(1);
    expect(saida).toContain(trecho);
    expect(saida).toContain('Use --ajuda');
    expect(saida).not.toContain('at ');
  });

  it('recusa n acima do limite e mostra os limites da sequência', () => {
    const { saida, codigo } = rodar('tribonacci 31');
    expect(codigo).toBe(1);
    expect(saida).toContain('n não pode passar de 30');
    expect(saida).toContain('Tribonacci vai até n = 30 sem cache e n = 5000 com cache');
    expect(rodar('tribonacci 31 --modo com_cache').codigo).toBe(0);
    expect(rodar('fibonacci 36').codigo).toBe(1);
    expect(rodar('fibonacci 35').codigo).toBe(0);
  });

  it('sem argumentos mostra a ajuda e sai com código 1', () => {
    const { saida, codigo } = executarCli([]);
    expect(codigo).toBe(1);
    expect(saida).toContain('Erro: informe a sequência e o n');
    expect(saida).toContain('Uso: pnpm cli <sequencia> <n> [opções]');
  });
});

describe('--ajuda', () => {
  it('descreve uso, opções e limites, com código 0', () => {
    const { saida, codigo } = rodar('--ajuda');
    expect(codigo).toBe(0);
    expect(saida).toContain('Uso: pnpm cli <sequencia> <n> [opções]');
    expect(saida).toContain('--modo <sem_cache|com_cache>');
    expect(saida).toContain('--limite-nos <n>');
    expect(saida).toContain('--arvore');
    expect(saida).toContain('--json');
    expect(saida).toContain('pnpm cli tribonacci 7 --modo sem_cache --arvore');
    expect(saida).toContain('Tribonacci sem cache até 30');
  });

  it('a ajuda vence os outros argumentos', () => {
    const { saida, codigo } = rodar('tribonacci 999999 --ajuda');
    expect(codigo).toBe(0);
    expect(saida).toContain('Uso: pnpm cli');
  });
});
