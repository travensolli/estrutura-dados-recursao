import type { ReactNode } from 'react';
import { descreverErro } from '../utilitarios/erros';
import { Alerta } from './Alerta';
import { Botao } from './Botao';

export interface EstadoErroProps {
  erro: unknown;
  aoTentarDeNovo?: () => void;
  aoReduzirN?: () => void;
  acoesExtras?: ReactNode;
  className?: string;
}

/** Erro com título humano, mensagem da API e ações sugeridas. */
export function EstadoErro({
  erro,
  aoTentarDeNovo,
  aoReduzirN,
  acoesExtras,
  className,
}: EstadoErroProps) {
  const descricao = descreverErro(erro);
  const cancelado = descricao.codigo === 'CANCELADO';
  const acoes = (
    <>
      {descricao.sugerirTentarDeNovo && aoTentarDeNovo ? (
        <Botao variante="secundaria" tamanho="pequeno" icone="tentar" onClick={aoTentarDeNovo}>
          Tentar de novo
        </Botao>
      ) : null}
      {descricao.sugerirReduzirN && aoReduzirN ? (
        <Botao variante="secundaria" tamanho="pequeno" icone="reduzir" onClick={aoReduzirN}>
          {descricao.limite !== undefined ? `Usar n = ${descricao.limite}` : 'Reduzir n'}
        </Botao>
      ) : null}
      {acoesExtras}
    </>
  );
  return (
    <Alerta
      tipo={cancelado ? 'alerta' : 'erro'}
      titulo={descricao.titulo}
      acoes={acoes}
      className={className}
    >
      <p>{descricao.mensagem}</p>
      <p className="mt-1 font-mono text-xs text-texto-suave">Código: {descricao.codigo}</p>
    </Alerta>
  );
}
