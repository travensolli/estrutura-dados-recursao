import { abreviarValor, formatarInteiro } from '../../utilitarios/formatar';
import type { DadosApresentacao } from './dados';
import { N_APRESENTACAO, SEQUENCIA_APRESENTACAO } from './slides';

// Peça local da árvore: o Orquestrador harmoniza depois com o design system.

export function SlideFuncao({ dados }: { dados: DadosApresentacao }) {
  const info = dados.descricoes[SEQUENCIA_APRESENTACAO];
  const metricas = dados.semCache.metricas;
  const valor = abreviarValor(metricas.valor, 18);
  const mesmoValor = metricas.valor === dados.comCache.metricas.valor;
  const termos = info.primeiros_termos;

  return (
    <div className="grid min-w-0 items-center gap-[clamp(1rem,3vw,3rem)] lg:grid-cols-[1.15fr_1fr]">
      <div className="flex min-w-0 flex-col gap-[clamp(0.75rem,2vh,1.75rem)]">
        <p className="font-mono text-[clamp(1.3rem,3.1vw,2.9rem)] leading-tight text-balance">
          {info.formula}
        </p>
        <p className="font-mono text-[clamp(1rem,1.9vw,1.8rem)] text-texto-suave">
          {info.casos_base}
        </p>
        <p className="max-w-[60ch] text-[clamp(0.95rem,1.35vw,1.35rem)]">
          Para chegar em f({N_APRESENTACAO}), a função precisa dos três termos anteriores, e cada um
          deles precisa dos seus três. Os casos base são o único lugar onde a descida para.
        </p>
        <ol className="flex flex-wrap gap-2" aria-label="Primeiros termos">
          {termos.map((termo, indice) => {
            const alvo = indice === N_APRESENTACAO;
            return (
              <li
                key={indice}
                data-testid="termo"
                className={`rounded-md border px-3 py-1 text-center font-mono ${
                  alvo
                    ? 'border-primaria bg-primaria-suave text-texto'
                    : 'border-borda text-texto-suave'
                }`}
              >
                <span className="block text-[clamp(0.65rem,0.8vw,0.85rem)]">f({indice})</span>
                <span className="block text-[clamp(0.95rem,1.5vw,1.5rem)]">
                  {formatarInteiro(termo)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex min-w-0 flex-col gap-2 border-t-3 border-primaria pt-4 lg:border-t-0 lg:border-l-3 lg:pt-0 lg:pl-[clamp(1rem,2.5vw,2.5rem)]">
        <p className="font-mono text-[clamp(1rem,1.8vw,1.7rem)] text-texto-suave">
          {info.nome} f({dados.semCache.n})
        </p>
        <p
          data-testid="valor-alvo"
          className="font-mono text-[clamp(3rem,10vw,9rem)] leading-none font-semibold break-all"
        >
          {valor.abreviado}
        </p>
        <p className="text-[clamp(0.9rem,1.2vw,1.2rem)] text-texto-suave">
          {`${formatarInteiro(metricas.digitos)} ${metricas.digitos === 1 ? 'dígito' : 'dígitos'}, calculado na hora pela própria recursão.`}
        </p>
        {mesmoValor && (
          <p className="text-[clamp(0.9rem,1.2vw,1.2rem)]">
            Os dois modos devolvem exatamente este valor: o cache muda o caminho, não a resposta.
          </p>
        )}
      </div>
    </div>
  );
}
