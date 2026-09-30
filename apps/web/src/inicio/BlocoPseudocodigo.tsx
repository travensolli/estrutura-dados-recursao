import type { Modo } from '@sequencias/contrato';
import { juntarClasses } from '../utilitarios/classes';
import { PSEUDOCODIGO, trechosDaLinha } from './pseudocodigo';

/**
 * O pseudocódigo de um modo, com as palavras-chave em negrito como no
 * material. As linhas do cache ganham a mesma marca da janela de código.
 * Quebra a linha em vez de rolar: numa tela estreita, uma região rolável
 * sem foco seria uma barreira para quem usa teclado.
 */
export function BlocoPseudocodigo({ modo, className }: { modo: Modo; className?: string }) {
  return (
    <pre
      className={juntarClasses(
        'rounded-lg border border-borda bg-superficie-suave py-1.5 font-mono text-sm leading-dados whitespace-pre-wrap',
        className,
      )}
    >
      <code>
        {PSEUDOCODIGO[modo].map((linha, indice) => {
          const conteudo = trechosDaLinha(linha.texto).map((trecho, posicao) =>
            trecho.palavraChave ? (
              <strong key={posicao} className="font-bold">
                {trecho.texto}
              </strong>
            ) : (
              trecho.texto
            ),
          );
          return linha.cache ? (
            <mark
              key={indice}
              className="block border-l-4 border-serie-com-cache bg-primaria-suave px-3 text-texto"
            >
              {conteudo}
            </mark>
          ) : (
            <span key={indice} className="block border-l-4 border-transparent px-3">
              {conteudo}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
