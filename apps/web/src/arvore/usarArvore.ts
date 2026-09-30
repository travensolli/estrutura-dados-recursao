import type { ArvoreResposta } from '@sequencias/contrato';
import { useQuery } from '@tanstack/react-query';
import { api, apiIndisponivel } from '../api/cliente';
import { OPCOES_EXECUCAO } from '../api/consultas';
import { usePlanoB } from '../plano-b/usarPlanoB';
import type { ConsultaArvore } from './consulta';

export type OrigemArvore = 'api' | 'plano_b';

export interface ArvoreComOrigem {
  resposta: ArvoreResposta;
  origem: OrigemArvore;
}

/** Busca a árvore na API e, se a API estiver fora do ar, calcula no navegador. */
export function useArvoreComPlanoB(consulta: ConsultaArvore | null) {
  const planoB = usePlanoB();
  return useQuery<ArvoreComOrigem>({
    queryKey: ['arvore-com-plano-b', consulta],
    enabled: consulta !== null,
    ...OPCOES_EXECUCAO,
    // Sem o signal, como as outras execuções: sair da tela não joga a conta fora.
    queryFn: async (): Promise<ArvoreComOrigem> => {
      const pedido = consulta as ConsultaArvore;
      try {
        return { resposta: await api.arvore(pedido), origem: 'api' };
      } catch (erro) {
        if (!apiIndisponivel(erro) || !planoB.disponivel) throw erro;
        return { resposta: await planoB.calcularArvore(pedido), origem: 'plano_b' };
      }
    },
  });
}
