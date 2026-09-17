import { BotaoLink } from '../componentes/Botao';
import { useTituloPagina } from '../hooks/titulo-pagina';

export function PaginaNaoEncontrada() {
  useTituloPagina('Página não encontrada');

  return (
    <section aria-labelledby="titulo-pagina" className="py-12 text-center">
      <h1 id="titulo-pagina" className="text-2xl font-semibold">
        Página não encontrada
      </h1>
      <p className="mt-2 text-texto-suave">
        O endereço que você abriu não existe. Volte ao início e escolha uma sequência.
      </p>
      <BotaoLink to="/" icone="inicio" className="mt-6">
        Voltar ao início
      </BotaoLink>
    </section>
  );
}
