import { Cartao, Detalhes } from '../componentes';

const TITULO = 'Como a comparação é feita';

const ITENS: ReadonlyArray<{ termo: string; texto: string }> = [
  {
    termo: 'Contagens',
    texto:
      'Uma versão instrumentada da mesma recorrência conta cada invocação, os casos base, os cálculos, os acertos de cache, as entradas guardadas e a profundidade da pilha. São contagens exatas, sem relógio: delas saem as invocações e as chamadas evitadas.',
  },
  {
    termo: 'Tempo',
    texto:
      'Um relógio de nanossegundos mede só as funções puras, sem contadores, as mesmas do código no Início, uma medição por vez num worker do Node. Um aquecimento calibra quantas execuções formam um bloco de 200 ms, com teto de 1 milhão; antes de cada bloco o lixo é coletado, e o tempo do bloco é dividido pelas execuções. Os modos se alternam a cada rodada, o cache nasce vazio em toda execução e vale a mediana das repetições escolhidas à esquerda, que param antes se a medição passar de 8 s.',
  },
  {
    termo: 'Memória',
    texto:
      'Com o lixo coletado, o heap é lido, a função roda e, com o cache ainda vivo, o lixo é coletado e o heap lido de novo: a diferença é o que ficou retido. Vale a mediana de 3 repetições próprias, sempre 3, qualquer que seja o número escolhido para o tempo; o pico é amostrado a cada 10.000 invocações. O coletor não é determinista, então os bytes indicam ordem de grandeza.',
  },
  {
    termo: 'Curvas',
    texto:
      'Cada ponto de Tempo por n é outra medição, com blocos de 20 ms. As invocações por n vêm das fórmulas fechadas, conferidas contra a execução instrumentada nos testes.',
  },
];

function ListaMetodo() {
  return (
    <dl className="space-y-2 text-sm">
      {ITENS.map(({ termo, texto }) => (
        <div key={termo} className="gap-x-4 sm:grid sm:grid-cols-[6rem_1fr]">
          <dt className="font-semibold">{termo}</dt>
          <dd className="text-texto-suave">{texto}</dd>
        </div>
      ))}
    </dl>
  );
}

/** O método da medição: aberto antes da primeira comparação, recolhido depois. */
export function ComoMedimos({ recolhido }: { recolhido: boolean }) {
  if (recolhido) {
    return (
      <Detalhes resumo={<h2 className="text-base font-semibold">{TITULO}</h2>}>
        <ListaMetodo />
      </Detalhes>
    );
  }
  return (
    <Cartao as="section" titulo={TITULO} nivelTitulo={2} compacto>
      <p className="mb-3 text-sm">
        <strong className="font-semibold">Nenhuma comparação ainda</strong>: escolha os parâmetros à
        esquerda e clique em Comparar. Os números saem assim:
      </p>
      <ListaMetodo />
    </Cartao>
  );
}
