import { BrowserRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './auth/LoginPage';
import Navbar from './components/Navbar';
import ClientesList from './pages/Clientes/ClientesList';
import ClienteForm from './pages/Clientes/ClienteForm';
import FacturasList from './pages/Facturas/FacturasList';
import FacturaForm from './pages/Facturas/FacturaForm';
import ProformasList from "./pages/Proformas/ProformasList";
import ProformaForm from "./pages/Proformas/ProformaForm";
import EstadosList from './pages/Estados/EstadosList';
import EstadoForm from './pages/Estados/EstadoForm';

import TarifasList from './pages/Tarifas/TarifasList';
import TarifaForm from './pages/Tarifas/TarifaForm';

import TarifasClientesList from './pages/TarifasClientes/TarifasClientesList';
import TarifaClienteForm from './pages/TarifasClientes/TarifaClienteForm';

import LocalizacionesList from './pages/Localizaciones/LocalizacionesList';
import LocalizacionForm from './pages/Localizaciones/LocalizacionForm';

import TrabajosList from './pages/Trabajos/TrabajosList';
import TrabajoForm from './pages/Trabajos/TrabajoForm';
export default function AppRoutes() {

const [auth, setAuth] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
  };

  if (!auth) return <LoginPage onLogin={() => setAuth(true)} />;

  return (

    <BrowserRouter>
      <Navbar onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<FacturasList />} />
        <Route path="/clientes" element={<ClientesList />} />
        <Route path="/clientes/crear" element={<ClienteForm />} />
        <Route path="/clientes/editar/:id" element={<ClienteForm />} />
        <Route path="/facturas" element={<FacturasList />} />
        <Route path="/facturas/crear" element={<FacturaForm />} />
        <Route path="/facturas/editar/:id" element={<FacturaForm />} />
        <Route path="/proformas" element={<ProformasList />} />
        <Route path="/proformas/nueva" element={<ProformaForm />} />
        <Route path="/proformas/editar/:id" element={<ProformaForm />} />
        <Route path="/estados" element={<EstadosList />} />
        <Route path="/estados/crear" element={<EstadoForm />} />
        <Route path="/estados/editar/:id" element={<EstadoForm />} />

        <Route path="/tarifas" element={<TarifasList />} />
        <Route path="/tarifas/crear" element={<TarifaForm />} />
        <Route path="/tarifas/editar/:id" element={<TarifaForm />} />

        <Route path="/tarifas-clientes" element={<TarifasClientesList />} />
        <Route path="/tarifas-clientes/crear" element={<TarifaClienteForm />} />
        <Route path="/tarifas-clientes/editar/:id" element={<TarifaClienteForm />} />

        <Route path="/localizaciones" element={<LocalizacionesList />} />
        <Route path="/localizaciones/crear" element={<LocalizacionForm />} />
        <Route path="/localizaciones/editar/:id" element={<LocalizacionForm />} />

        <Route path="/trabajos" element={<TrabajosList />} />
        <Route path="/trabajos/crear" element={<TrabajoForm />} />
        <Route path="/trabajos/editar/:id" element={<TrabajoForm />} />
      </Routes>
    </BrowserRouter>
      
  );
}