import { useCallback, useEffect, useState } from 'react';

export interface TelaCheia {
  suportada: boolean;
  ativa: boolean;
  alternar: () => void;
}

function temSuporte(): boolean {
  if (typeof document === 'undefined') return false;
  return typeof document.documentElement.requestFullscreen === 'function';
}

function estaAtiva(): boolean {
  return typeof document !== 'undefined' && Boolean(document.fullscreenElement);
}

/** Tela cheia pela Fullscreen API, acompanhando também a saída pelo Escape. */
export function useTelaCheia(): TelaCheia {
  const [suportada] = useState(temSuporte);
  const [ativa, setAtiva] = useState(estaAtiva);

  useEffect(() => {
    if (!suportada) return;
    const aoMudar = () => setAtiva(estaAtiva());
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, [suportada]);

  const alternar = useCallback(() => {
    if (!suportada) return;
    const conferir = () => setAtiva(estaAtiva());
    try {
      const pedido = document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen();
      void Promise.resolve(pedido).then(conferir, conferir);
    } catch {
      conferir();
    }
  }, [suportada]);

  return { suportada, ativa, alternar };
}
