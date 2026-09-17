import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type Tema = 'claro' | 'escuro';

/** Mesma chave lida pelo script embutido em index.html. */
export const CHAVE_TEMA = 'tema';
const CLASSE_ESCURO = 'tema-escuro';

const ouvintes = new Set<() => void>();

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function lerTema(): Tema {
  return document.documentElement.classList.contains(CLASSE_ESCURO) ? 'escuro' : 'claro';
}

function lerNoServidor(): Tema {
  return 'claro';
}

function guardar(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE_TEMA, tema);
  } catch {
    /* sem localStorage: a escolha vale só nesta sessão */
  }
}

function temEscolhaGuardada(): boolean {
  try {
    return localStorage.getItem(CHAVE_TEMA) !== null;
  } catch {
    return false;
  }
}

/** Aplica o tema no documento e avisa quem estiver ouvindo. */
export function aplicarTema(tema: Tema, persistir = true): void {
  document.documentElement.classList.toggle(CLASSE_ESCURO, tema === 'escuro');
  if (persistir) guardar(tema);
  avisar();
}

export interface UsoTema {
  tema: Tema;
  definir: (tema: Tema) => void;
  alternar: () => void;
}

export function useTema(): UsoTema {
  const tema = useSyncExternalStore(assinar, lerTema, lerNoServidor);

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const aoMudarSistema = (evento: MediaQueryListEvent) => {
      if (!temEscolhaGuardada()) aplicarTema(evento.matches ? 'escuro' : 'claro', false);
    };
    consulta.addEventListener('change', aoMudarSistema);
    return () => consulta.removeEventListener('change', aoMudarSistema);
  }, []);

  const definir = useCallback((novo: Tema) => aplicarTema(novo), []);
  const alternar = useCallback(() => aplicarTema(lerTema() === 'escuro' ? 'claro' : 'escuro'), []);

  return { tema, definir, alternar };
}
