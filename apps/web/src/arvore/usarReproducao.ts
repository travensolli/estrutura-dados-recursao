import { useCallback, useEffect, useMemo, useState } from 'react';
import { MOVIMENTO_REDUZIDO, useMidia } from './usarMidia';

export const VELOCIDADES = [0.5, 1, 2, 4, 8] as const;
export type Velocidade = (typeof VELOCIDADES)[number];

/** Intervalo entre passos na velocidade 1x, em milissegundos. */
export const INTERVALO_BASE = 900;
const INTERVALO_MINIMO = 60;

export interface Reproducao {
  passo: number;
  /** Instantes do relógio: 2 por invocação. */
  total: number;
  ultimoPasso: number;
  tocando: boolean;
  velocidade: Velocidade;
  noInicio: boolean;
  noFim: boolean;
  /** prefers-reduced-motion: sem transições, mas os passos continuam. */
  animacaoReduzida: boolean;
  irPara: (passo: number) => void;
  avancar: () => void;
  voltar: () => void;
  paraOInicio: () => void;
  paraOFim: () => void;
  alternarToque: () => void;
  definirVelocidade: (velocidade: Velocidade) => void;
}

/**
 * Relógio da reprodução. Navegar na mão pausa; ao chegar no fim, para sozinho;
 * tocar de novo no fim recomeça do zero.
 */
export function useReproducao(total: number): Reproducao {
  const ultimoPasso = Math.max(0, total - 1);
  const [passo, setPasso] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [velocidade, setVelocidade] = useState<Velocidade>(1);
  const animacaoReduzida = useMidia(MOVIMENTO_REDUZIDO);

  const intervalo = Math.max(INTERVALO_MINIMO, INTERVALO_BASE / velocidade);

  useEffect(() => {
    if (!tocando || passo >= ultimoPasso) return;
    const temporizador = setTimeout(() => {
      setPasso(Math.min(ultimoPasso, passo + 1));
      if (passo + 1 >= ultimoPasso) setTocando(false);
    }, intervalo);
    return () => clearTimeout(temporizador);
  }, [intervalo, passo, tocando, ultimoPasso]);

  const irPara = useCallback(
    (alvo: number) => {
      setTocando(false);
      setPasso(Math.min(ultimoPasso, Math.max(0, Math.trunc(alvo))));
    },
    [ultimoPasso],
  );

  const alternarToque = useCallback(() => {
    if (tocando) {
      setTocando(false);
      return;
    }
    if (passo >= ultimoPasso) setPasso(0);
    setTocando(true);
  }, [passo, tocando, ultimoPasso]);

  return useMemo(
    () => ({
      passo,
      total,
      ultimoPasso,
      tocando,
      velocidade,
      noInicio: passo === 0,
      noFim: passo >= ultimoPasso,
      animacaoReduzida,
      irPara,
      avancar: () => irPara(passo + 1),
      voltar: () => irPara(passo - 1),
      paraOInicio: () => irPara(0),
      paraOFim: () => irPara(ultimoPasso),
      alternarToque,
      definirVelocidade: setVelocidade,
    }),
    [alternarToque, animacaoReduzida, irPara, passo, tocando, total, ultimoPasso, velocidade],
  );
}
