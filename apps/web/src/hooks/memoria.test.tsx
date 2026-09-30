import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { ContextoMemoria, criarMemoria, useEstadoLembrado } from './memoria';

function Contador() {
  const [valor, definir] = useEstadoLembrado('teste.contador', 0);
  return (
    <button type="button" onClick={() => definir(valor + 1)}>
      {`Contou ${valor}`}
    </button>
  );
}

/** Monta e desmonta o contador, como a troca de rota faz com uma tela. */
function Alternador() {
  const [visivel, setVisivel] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setVisivel((atual) => !atual)}>
        Alternar
      </button>
      {visivel ? <Contador /> : null}
    </>
  );
}

async function contarSairEVoltar() {
  const usuario = userEvent.setup();
  await usuario.click(screen.getByRole('button', { name: 'Contou 0' }));
  await usuario.click(screen.getByRole('button', { name: 'Contou 1' }));
  await usuario.click(screen.getByRole('button', { name: 'Alternar' }));
  await usuario.click(screen.getByRole('button', { name: 'Alternar' }));
}

describe('useEstadoLembrado', () => {
  it('devolve o último valor quando o componente volta a montar', async () => {
    render(
      <ContextoMemoria value={criarMemoria()}>
        <Alternador />
      </ContextoMemoria>,
    );
    await contarSairEVoltar();
    expect(screen.getByRole('button', { name: 'Contou 2' })).toBeInTheDocument();
  });

  it('sem provedor, recomeça do valor inicial como um useState', async () => {
    render(<Alternador />);
    await contarSairEVoltar();
    expect(screen.getByRole('button', { name: 'Contou 0' })).toBeInTheDocument();
  });
});
