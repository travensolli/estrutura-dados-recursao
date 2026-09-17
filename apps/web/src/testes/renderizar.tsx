import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

export function criarClienteTeste(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
}

interface OpcoesRenderizar extends Omit<RenderOptions, 'wrapper'> {
  rota?: string;
  cliente?: QueryClient;
}

/** Renderiza com TanStack Query e um roteador em memória na rota indicada. */
export function renderizarComProvedores(
  ui: ReactElement,
  { rota = '/', cliente = criarClienteTeste(), ...opcoes }: OpcoesRenderizar = {},
) {
  function Provedores({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={cliente}>
        <MemoryRouter initialEntries={[rota]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  return { cliente, ...render(ui, { wrapper: Provedores, ...opcoes }) };
}
