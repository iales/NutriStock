import "./App.css";
import { Route, Routes, Navigate } from "react-router-dom";
import AppLayout from "./features/layout/appLayout";
import NuevaEntrega from "./features/entregas/entrega";
import NuevaEntregaPage from "./features/entregas/nuevaEntregaPage";
import ControlStock from "./features/stock/stock";
import GestionClinicas from "./features/clinicas/clinicas";
import Entradas from "./features/entradas/entradas";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/entregas" element={<NuevaEntrega />} />
        <Route path="/entregas/nueva" element={<NuevaEntregaPage />} />
        <Route path="/stock" element={<ControlStock />} />
        <Route path="/clinicas" element={<GestionClinicas />} />
        <Route path="/entradas" element={<Entradas />} />
        <Route path="*" element={<Navigate to="/entregas" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

