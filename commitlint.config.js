// Regras de commit do projeto: Conventional Commits com escopos fixos,
// cabeçalho de até 72 colunas e rodapés restritos a BREAKING CHANGE e Refs.

const ESCOPOS = ['nucleo', 'contrato', 'api', 'web', 'cli', 'docs', 'infra', 'repo'];
const RODAPES_PERMITIDOS = new Set(['breaking change', 'breaking-change', 'refs']);
const TOKEN_RODAPE = /^([A-Za-z][A-Za-z0-9-]*(?: [A-Za-z][A-Za-z0-9-]*)*):(?:\s|$)/;

function paragrafos(raw) {
  const linhas = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((linha) => !linha.startsWith('#'));
  return linhas
    .join('\n')
    .trim()
    .split(/\n[ \t]*\n+/)
    .filter((bloco) => bloco.trim().length > 0);
}

const pluginLocal = {
  rules: {
    'rodape-permitido': (parsed) => {
      const blocos = paragrafos(parsed.raw ?? '');
      if (blocos.length < 2) return [true];
      const ultimo = blocos[blocos.length - 1].split('\n');
      const tokens = ultimo.map((linha) => TOKEN_RODAPE.exec(linha)?.[1]).filter(Boolean);
      const ehBlocoDeRodape =
        tokens.length > 0 &&
        ultimo.every((linha) => TOKEN_RODAPE.test(linha) || /^\s+\S/.test(linha));
      if (!ehBlocoDeRodape) return [true];
      const invalidos = tokens.filter((token) => !RODAPES_PERMITIDOS.has(token.toLowerCase()));
      return [
        invalidos.length === 0,
        `rodapé não permitido: ${invalidos.join(', ')}. Só "BREAKING CHANGE" e "Refs" são aceitos`,
      ];
    },
    'assunto-minusculo': (parsed) => {
      const assunto = parsed.subject ?? '';
      if (assunto.length === 0) return [true];
      const primeira = assunto.charAt(0);
      return [
        primeira === primeira.toLowerCase() && primeira !== primeira.toUpperCase(),
        'a descrição deve começar com letra minúscula',
      ];
    },
  },
};

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [pluginLocal],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', ESCOPOS],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
    'footer-max-line-length': [2, 'always', 100],
    'subject-full-stop': [2, 'never', '.'],
    'rodape-permitido': [2, 'always'],
    'assunto-minusculo': [2, 'always'],
  },
};
