import "./App.css";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./features/layout/appLayout";
import NuevaEntrega from "./features/entregas/entrega";
import ControlStock from "./features/stock/stock";
import GestionClinicas from "./features/clinicas/clinicas";
import Entradas from "./features/entradas/entradas";
import Login from "./features/login/login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route element={<AppLayout />}>
        <Route path="/entregas" element={<NuevaEntrega />} />
        <Route path="/stock" element={<ControlStock />} />
        <Route path="/clinicas" element={<GestionClinicas />} />
        <Route path="/entradas" element={<Entradas />} />
      </Route>
    </Routes>
  );
}

export default App;

