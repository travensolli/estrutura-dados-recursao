import { Link, NavLink, Outlet } from 'react-router';
import { BotaoTema } from '../componentes/BotaoTema';
import { Icone, type NomeIcone } from '../componentes/Icone';
import { juntarClasses } from '../utilitarios/classes';

interface ItemNavegacao {
  para: string;
  rotulo: string;
  icone: NomeIcone;
}

const ITENS: ItemNavegacao[] = [
  { para: '/', rotulo: 'Início', icone: 'inicio' },
  { para: '/calcular', rotulo: 'Calcular', icone: 'calcular' },
  { para: '/comparar', rotulo: 'Comparar', icone: 'comparar' },
  { para: '/arvore', rotulo: 'Árvore', icone: 'arvore' },
  { para: '/apresentacao', rotulo: 'Apresentação', icone: 'apresentacao' },
];

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-superficie focus:px-3 focus:py-2 focus:shadow-flutuante"
      >
        Ir para o conteúdo
      </a>
      <header className="border-b border-borda bg-superficie">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1">
          <Link
            to="/"
            className="inline-flex min-h-toque items-center gap-2 rounded-md px-1 font-semibold"
          >
            <Icone nome="arvore" className="text-primaria" />
            <span>Sequências recursivas</span>
          </Link>
          <div className="nav:order-last nav:ml-0 ml-auto flex items-center gap-2">
            <BotaoTema />
          </div>
          <nav
            aria-label="Principal"
            className="rolagem-fina nav:order-none nav:ml-auto nav:w-auto order-last w-full overflow-x-auto"
          >
            {/* A folga interna impede que o scroller recorte o anel de foco das pontas. */}
            <ul className="flex gap-1 p-1">
              {ITENS.map((item) => (
                <li key={item.para}>
                  <NavLink
                    to={item.para}
                    end={item.para === '/'}
                    className={({ isActive }) =>
                      juntarClasses(
                        'inline-flex min-h-toque items-center gap-2 rounded-md px-3 text-sm whitespace-nowrap',
                        'transition-colors duration-150 ease-suave',
                        isActive
                          ? 'bg-primaria-suave font-semibold text-primaria'
                          : 'text-texto-suave hover:bg-superficie-suave hover:text-texto',
                      )
                    }
                  >
                    <Icone nome={item.icone} tamanho={18} />
                    {item.rotulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-3">
        <Outlet />
      </main>
    </div>
  );
}
