import { useTituloPagina } from '../hooks/titulo-pagina';

export function PaginaInicio() {
  useTituloPagina('Início');

  return (
    <section aria-labelledby="titulo-pagina">
      <h1 id="titulo-pagina" className="text-2xl font-semibold">
        Início
      </h1>
      <p className="mt-2 text-texto-suave">Escolha uma sequência para começar.</p>
    </section>
  );
}
