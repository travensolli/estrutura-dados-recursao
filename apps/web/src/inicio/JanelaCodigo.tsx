import { DESCRICAO_SEQUENCIAS, MODOS, type Modo, type Sequencia } from '@sequencias/contrato';
import { Dialogo, RotuloModo } from '../componentes';
import { formatarQuantidade } from '../utilitarios/formatar';
import { codigoDaFuncao, LINHA_DO_CACHE } from './codigo';

function BlocoCodigo({ sequencia, modo }: { sequencia: Sequencia; modo: Modo }) {
  const linhas = codigoDaFuncao(sequencia, modo).split('\n');
  return (
    <pre className="mt-1 overflow-x-auto rounded-lg border border-borda bg-superficie-suave py-2 font-mono text-sm leading-5">
      <code>
        {linhas.map((linha, indice) =>
          LINHA_DO_CACHE.test(linha) ? (
            <mark
              key={indice}
              className="block border-l-4 border-serie-com-cache bg-primaria-suave px-3 text-texto"
            >
              {linha}
            </mark>
          ) : (
            <span key={indice} className="block border-l-4 border-transparent px-3">
              {linha}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}

function legendaDoModo(modo: Modo, ordem: number): string {
  const chamadas = formatarQuantidade(ordem, 'chamada recursiva', 'chamadas recursivas');
  if (modo === 'sem_cache') return `${chamadas} por caso não base`;
  const mesmas = ordem === 1 ? 'a mesma' : 'as mesmas';
  return `${mesmas} ${chamadas}; as linhas marcadas consultam e gravam o cache`;
}

export interface JanelaCodigoProps {
  sequencia: Sequencia;
  aberta: boolean;
  aoFechar: () => void;
}

/** As duas funções puras da sequência, como estão no arquivo que o app executa. */
export function JanelaCodigo({ sequencia, aberta, aoFechar }: JanelaCodigoProps) {
  const { nome, ordem } = DESCRICAO_SEQUENCIAS[sequencia];
  return (
    <Dialogo
      aberto={aberta}
      aoFechar={aoFechar}
      titulo={`${nome} em TypeScript`}
      descricao="As funções reais de packages/nucleo/src/puros.ts, lidas do próprio arquivo: são elas que a tela Comparar cronometra. As contagens do Calcular vêm de uma versão instrumentada da mesma recorrência."
      tamanho="largo"
    >
      <div className="space-y-3">
        {MODOS.map((modo) => (
          <section key={modo} aria-label={`${nome} ${modo === 'sem_cache' ? 'sem' : 'com'} cache`}>
            <h3 className="flex flex-wrap items-center gap-x-2 text-sm">
              <RotuloModo modo={modo} titulo className="font-semibold" />
              <span className="text-texto-suave">— {legendaDoModo(modo, ordem)}</span>
            </h3>
            <BlocoCodigo sequencia={sequencia} modo={modo} />
          </section>
        ))}
      </div>
    </Dialogo>
  );
}
