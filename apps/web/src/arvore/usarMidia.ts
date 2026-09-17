import { useEffect, useState } from 'react';

/** Abaixo disso a árvore larga não cabe: a visão em lista assume. */
export const TELA_ESTREITA = '(max-width: 767px)';
export const MOVIMENTO_REDUZIDO = '(prefers-reduced-motion: reduce)';

function avaliar(consulta: string): boolean {
  return typeof matchMedia === 'function' ? matchMedia(consulta).matches : false;
}

/** Acompanha uma media query; devolve false onde matchMedia não existe. */
export function useMidia(consulta: string): boolean {
  const [combina, setCombina] = useState(() => avaliar(consulta));

  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const lista = matchMedia(consulta);
    const aoMudar = (evento: MediaQueryListEvent) => setCombina(evento.matches);
    lista.addEventListener('change', aoMudar);
    return () => lista.removeEventListener('change', aoMudar);
  }, [consulta]);

  return combina;
}
