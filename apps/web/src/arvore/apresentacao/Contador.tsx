import { useEffect, useState } from 'react';
import { formatarInteiro } from '../../utilitarios/formatar';
import { MOVIMENTO_REDUZIDO, useMidia } from '../usarMidia';
import { DURACAO_CONTAGEM_MS, suavizar } from './contagem';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export interface ContadorProps {
  de: number;
  para: number;
  /** Mudar este número refaz a contagem. */
  rodada?: number;
  duracaoMs?: number;
  classe?: string;
}

/** Conta de um total ao outro; com movimento reduzido mostra o destino direto. */
export function Contador({
  de,
  para,
  rodada = 0,
  duracaoMs = DURACAO_CONTAGEM_MS,
  classe = '',
}: ContadorProps) {
  const reduzida = useMidia(MOVIMENTO_REDUZIDO);
  const [animado, setAnimado] = useState<number | null>(null);
  const anima =
    !reduzida && duracaoMs > 0 && typeof requestAnimationFrame === 'function' && de !== para;
  const valor = animado ?? (anima ? de : para);

  useEffect(() => {
    if (!anima) return;
    const inicio = performance.now();
    const avancar = (agora: number) => {
      const fracao = Math.min(1, (agora - inicio) / duracaoMs);
      setAnimado(Math.round(de + (para - de) * suavizar(fracao)));
      if (fracao < 1) quadro = requestAnimationFrame(avancar);
    };
    let quadro = requestAnimationFrame(avancar);
    return () => cancelAnimationFrame(quadro);
  }, [anima, de, duracaoMs, para, rodada]);

  // Escondido do leitor de tela: o número final está escrito no texto ao lado.
  return (
    <p
      data-testid="contador"
      aria-hidden="true"
      className={`font-mono leading-none tabular-nums ${classe}`}
    >
      {formatarInteiro(valor)}
    </p>
  );
}
