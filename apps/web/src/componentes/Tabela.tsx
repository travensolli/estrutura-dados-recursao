import type { ReactNode } from 'react';
import { juntarClasses } from '../utilitarios/classes';

export interface ColunaTabela<T> {
  chave: string;
  rotulo: ReactNode;
  conteudo: (linha: T) => ReactNode;
  /** Alinha à direita e usa dígitos de largura fixa. */
  numerico?: boolean;
  /** A célula vira o cabeçalho da linha. */
  cabecalhoDeLinha?: boolean;
  className?: string;
}

export interface TabelaProps<T> {
  legenda: string;
  legendaVisivel?: boolean;
  colunas: ReadonlyArray<ColunaTabela<T>>;
  linhas: ReadonlyArray<T>;
  chave: (linha: T, indice: number) => string | number;
  vazio?: ReactNode;
  rodape?: ReactNode;
  /** Cabeçalho grudado no topo quando a tabela rola na vertical. */
  cabecalhoFixo?: boolean;
  destacar?: (linha: T) => boolean;
  alturaMaxima?: string;
  className?: string;
}

/**
 * Tabela com rolagem horizontal alcançável pelo teclado e cabeçalho fixo.
 * A região rolável é focável para quem navega sem mouse.
 */
export function Tabela<T>({
  legenda,
  legendaVisivel = false,
  colunas,
  linhas,
  chave,
  vazio = 'Nada para mostrar ainda.',
  rodape,
  cabecalhoFixo = true,
  destacar,
  alturaMaxima,
  className,
}: TabelaProps<T>) {
  return (
    <div
      role="region"
      aria-label={legenda}
      tabIndex={0}
      style={alturaMaxima ? { maxHeight: alturaMaxima } : undefined}
      className={juntarClasses(
        'rolagem-fina overflow-auto rounded-xl border border-borda bg-superficie',
        className,
      )}
    >
      <table className="w-full border-collapse text-left text-sm">
        <caption
          className={legendaVisivel ? 'px-4 py-3 text-left text-sm text-texto-suave' : 'sr-only'}
        >
          {legenda}
        </caption>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.chave}
                scope="col"
                className={juntarClasses(
                  'border-b border-borda-forte bg-superficie px-4 py-3 font-semibold whitespace-nowrap',
                  cabecalhoFixo && 'sticky top-0 z-10',
                  coluna.numerico && 'text-right',
                  coluna.className,
                )}
              >
                {coluna.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="px-4 py-8 text-center text-texto-suave">
                {vazio}
              </td>
            </tr>
          ) : (
            linhas.map((linha, indice) => (
              <tr
                key={chave(linha, indice)}
                className={juntarClasses(
                  'border-b border-borda last:border-b-0',
                  destacar?.(linha) && 'bg-primaria-suave',
                )}
              >
                {colunas.map((coluna) => {
                  const conteudo = coluna.conteudo(linha);
                  const classes = juntarClasses(
                    'px-4 py-2.5 align-middle',
                    coluna.numerico && 'text-right tabular-nums',
                    coluna.className,
                  );
                  return coluna.cabecalhoDeLinha ? (
                    <th
                      key={coluna.chave}
                      scope="row"
                      className={juntarClasses(classes, 'font-medium')}
                    >
                      {conteudo}
                    </th>
                  ) : (
                    <td key={coluna.chave} className={classes}>
                      {conteudo}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
        {rodape ? (
          <tfoot>
            <tr>
              <td
                colSpan={colunas.length}
                className="border-t border-borda px-4 py-3 text-texto-suave"
              >
                {rodape}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
