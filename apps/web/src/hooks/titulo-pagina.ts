import { useEffect } from 'react';

export const TITULO_BASE = 'Sequências recursivas: com e sem cache';

/** Define o título do documento por rota. */
export function useTituloPagina(titulo?: string): void {
  useEffect(() => {
    document.title = titulo ? `${titulo} - ${TITULO_BASE}` : TITULO_BASE;
  }, [titulo]);
}
