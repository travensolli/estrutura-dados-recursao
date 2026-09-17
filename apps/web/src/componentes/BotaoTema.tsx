import { useTema } from '../hooks/tema';
import { Botao, BotaoIcone } from './Botao';

export interface BotaoTemaProps {
  /** Mostra o texto ao lado do ícone. */
  comRotulo?: boolean;
  className?: string;
}

/** Alterna entre claro e escuro e guarda a escolha em `localStorage`. */
export function BotaoTema({ comRotulo = false, className }: BotaoTemaProps) {
  const { tema, alternar } = useTema();
  const escuro = tema === 'escuro';
  const rotulo = escuro ? 'Ativar tema claro' : 'Ativar tema escuro';
  const icone = escuro ? 'sol' : 'lua';

  if (comRotulo) {
    return (
      <Botao variante="neutra" icone={icone} onClick={alternar} className={className}>
        {rotulo}
      </Botao>
    );
  }
  return <BotaoIcone icone={icone} rotulo={rotulo} onClick={alternar} className={className} />;
}
