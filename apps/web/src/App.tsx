import { Route, Routes } from 'react-router';
import { Layout } from './layout/Layout';
import { PaginaApresentacao } from './paginas/Apresentacao';
import { PaginaArvore } from './paginas/Arvore';
import { PaginaCalcular } from './paginas/Calcular';
import { PaginaComparar } from './paginas/Comparar';
import { PaginaInicio } from './paginas/Inicio';
import { PaginaNaoEncontrada } from './paginas/NaoEncontrada';

export function App() {
  return (
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
  );
}
