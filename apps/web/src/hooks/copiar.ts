import { useCallback, useEffect, useRef, useState } from 'react';

export type EstadoCopia = 'ocioso' | 'copiado' | 'falhou';

export interface UsoCopiar {
  estado: EstadoCopia;
  copiar: (texto: string) => Promise<void>;
}

/** Copia para a área de transferência e volta ao estado inicial depois de um tempo. */
export function useCopiar(msDeVolta = 2500): UsoCopiar {
  const [estado, setEstado] = useState<EstadoCopia>('ocioso');
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (relogio.current !== null) clearTimeout(relogio.current);
    };
  }, []);

  const copiar = useCallback(
    async (texto: string) => {
      if (relogio.current !== null) clearTimeout(relogio.current);
      try {
        await navigator.clipboard.writeText(texto);
        setEstado('copiado');
      } catch {
        setEstado('falhou');
      }
      relogio.current = setTimeout(() => setEstado('ocioso'), msDeVolta);
    },
    [msDeVolta],
  );

  return { estado, copiar };
}
