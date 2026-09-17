import { Link } from 'react-router';

export function PaginaNaoEncontrada() {
  return (
    <section aria-labelledby="titulo-pagina" className="py-12 text-center">
      <h1 id="titulo-pagina" className="text-2xl font-semibold">
        Página não encontrada
      </h1>
      <p className="mt-2 text-texto-suave">O endereço que você abriu não existe.</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-toque items-center rounded-md bg-primaria px-4 py-2 font-medium text-primaria-contraste"
      >
        Voltar ao início
      </Link>
    </section>
  );
}
