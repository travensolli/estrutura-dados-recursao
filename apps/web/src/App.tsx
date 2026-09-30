import { useState } from 'react';
import { Route, Routes } from 'react-router';
import { ContextoMemoria, criarMemoria } from './hooks/memoria';
import { Layout } from './layout/Layout';
import { PaginaApresentacao } from './paginas/Apresentacao';
import { PaginaArvore } from './paginas/Arvore';
import { PaginaCalcular } from './paginas/Calcular';
import { PaginaComparar } from './paginas/Comparar';
import { PaginaInicio } from './paginas/Inicio';
import { PaginaNaoEncontrada } from './paginas/NaoEncontrada';

export function App() {
  // Acima das rotas: a apresentação fica fora do layout e a memória sobrevive a ela.
  const [memoria] = useState(criarMemoria);
  return (
    <ContextoMemoria value={memoria}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<PaginaInicio />} />
          <Route path="calcular" element={<PaginaCalcular />} />
          <Route path="comparar" element={<PaginaComparar />} />
          <Route path="arvore" element={<PaginaArvore />} />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Route>
        <Route path="apresentacao" element={<PaginaApresentacao />} />
      </Routes>
    </ContextoMemoria>
  );
}
