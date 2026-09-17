import { useTituloPagina } from '../hooks/titulo-pagina';

export function PaginaCalcular() {
  useTituloPagina('Calcular');

  return (
    <section aria-labelledby="titulo-pagina">
      <h1 id="titulo-pagina" className="text-2xl font-semibold">
        Calcular
      </h1>
      <p className="mt-2 text-texto-suave">Escolha a sequência, o valor de n e o modo.</p>
    </section>
  );
}
