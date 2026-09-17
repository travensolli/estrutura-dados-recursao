import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = process.cwd();

function rodarHookCommitMsg(mensagem: string) {
  const pasta = mkdtempSync(join(tmpdir(), 'hook-commit-msg-'));
  const arquivo = join(pasta, 'COMMIT_EDITMSG');
  writeFileSync(arquivo, mensagem, 'utf8');
  return spawnSync('sh', ['-e', '.husky/commit-msg', arquivo], {
    cwd: raiz,
    encoding: 'utf8',
    env: { ...process.env, HUSKY: '0' },
  });
}

describe('hook commit-msg', () => {
  it('aceita mensagem válida com corpo', () => {
    const r = rodarHookCommitMsg(
      'feat(nucleo): adiciona tribonacci recursiva com cache instrumentado\n\n' +
        'Registra acertos, faltas e ordem de entrada e saída de cada nó\n' +
        'para permitir a reprodução passo a passo da execução.\n',
    );
    expect(r.stderr + r.stdout).not.toMatch(/ERRO|✖/);
    expect(r.status).toBe(0);
  });

  it('aceita rodapés BREAKING CHANGE e Refs', () => {
    const r = rodarHookCommitMsg(
      'feat(contrato)!: renomeia campo ordem para ordem_entrada nos nós\n\n' +
        'BREAKING CHANGE: o campo ordem dos nós da árvore passa a se chamar\n' +
        'ordem_entrada, e o frontend precisa regenerar os tipos.\n' +
        'Refs: PRJ.ED.1\n',
    );
    expect(r.status).toBe(0);
  });

  it('aceita commit de merge com a mensagem padrão do Git', () => {
    const r = rodarHookCommitMsg("Merge branch 'feature/api-comparar' into develop\n");
    expect(r.status).toBe(0);
  });

  it('rejeita cabeçalho fora do padrão', () => {
    const r = rodarHookCommitMsg('Feat: Added tribonacci function.\n');
    expect(r.status).not.toBe(0);
  });

  it('rejeita escopo fora da lista', () => {
    const r = rodarHookCommitMsg('feat(backend): adiciona rota\n');
    expect(r.status).not.toBe(0);
  });

  it('rejeita rodapé fora de BREAKING CHANGE e Refs', () => {
    const r = rodarHookCommitMsg('fix(web): ajusta contraste\n\nSigned-off-by: X <x@y.z>\n');
    expect(r.status).not.toBe(0);
  });

  it('rejeita descrição começando com maiúscula', () => {
    const r = rodarHookCommitMsg('fix(web): Ajusta contraste\n');
    expect(r.status).not.toBe(0);
  });
});
