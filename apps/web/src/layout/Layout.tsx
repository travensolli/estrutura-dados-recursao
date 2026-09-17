import { NavLink, Outlet } from 'react-router';

const links = [
  { para: '/', rotulo: 'Início' },
  { para: '/calcular', rotulo: 'Calcular' },
  { para: '/comparar', rotulo: 'Comparar' },
  { para: '/arvore', rotulo: 'Árvore' },
  { para: '/apresentacao', rotulo: 'Apresentação' },
];

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-superficie focus:px-3 focus:py-2"
      >
        Ir para o conteúdo
      </a>
      <header className="border-b border-borda bg-superficie">
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2"
        >
          <span className="mr-auto py-2 font-semibold">Sequências recursivas</span>
          {links.map((link) => (
            <NavLink
              key={link.para}
              to={link.para}
              end={link.para === '/'}
              className={({ isActive }) =>
                `inline-flex min-h-toque items-center rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-primaria-suave font-medium text-primaria'
                    : 'text-texto-suave hover:bg-superficie-suave'
                }`
              }
            >
              {link.rotulo}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
