import { useCallback, useSyncExternalStore } from 'react';

/** Acompanha uma media query sem redesenhar fora de hora. */
export function useConsultaMidia(consulta: string): boolean {
  const assinar = useCallback(
    (ouvinte: () => void) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener('change', ouvinte);
      return () => lista.removeEventListener('change', ouvinte);
    },
    [consulta],
  );
  const ler = useCallback(() => window.matchMedia(consulta).matches, [consulta]);
  return useSyncExternalStore(assinar, ler, () => false);
}

export function usePrefereMenosMovimento(): boolean {
  return useConsultaMidia('(prefers-reduced-motion: reduce)');
}
