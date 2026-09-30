import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

/**
 * O que cada tela mostrava, guardado enquanto a aba estiver aberta: quem troca
 * de página e volta encontra o mesmo formulário e o mesmo resultado.
 */
export type Memoria = Map<string, unknown>;

export const ContextoMemoria = createContext<Memoria | null>(null);

export function criarMemoria(): Memoria {
  return new Map();
}

const PREFIXO_ENDERECO = 'endereco:';

/** Como o useState, mas o valor sobrevive à saída da tela. Sem provedor, não guarda nada. */
export function useEstadoLembrado<T>(chave: string, inicial: T): readonly [T, (valor: T) => void] {
  const memoria = useContext(ContextoMemoria);
  const [valor, setValor] = useState<T>(() =>
    memoria?.has(chave) ? (memoria.get(chave) as T) : inicial,
  );
  const definir = useCallback(
    (proximo: T) => {
      memoria?.set(chave, proximo);
      setValor(proximo);
    },
    [memoria, chave],
  );
  return [valor, definir] as const;
}

/** Guarda a consulta do endereço atual e devolve o último endereço visto de cada tela. */
export function useEnderecosLembrados(): (caminho: string) => string {
  const memoria = useContext(ContextoMemoria);
  const { pathname, search } = useLocation();

  useEffect(() => {
    memoria?.set(PREFIXO_ENDERECO + pathname, search);
  }, [memoria, pathname, search]);

  return useCallback(
    (caminho: string) => {
      // A tela aberta usa o endereço de agora: o efeito só grava depois de desenhar.
      if (caminho === pathname) return caminho + search;
      const lembrado = memoria?.get(PREFIXO_ENDERECO + caminho);
      return typeof lembrado === 'string' ? caminho + lembrado : caminho;
    },
    [memoria, pathname, search],
  );
}
