import { useTituloPagina } from '../hooks/titulo-pagina';

export function PaginaComparar() {
  useTituloPagina('Comparar desempenho');

  return (
    <section aria-labelledby="titulo-pagina">
      <h1 id="titulo-pagina" className="text-2xl font-semibold">
        Comparar desempenho
      </h1>
      <p className="mt-2 text-texto-suave">Tempo, memória e chamadas evitadas, com e sem cache.</p>
    </section>
  );
}
