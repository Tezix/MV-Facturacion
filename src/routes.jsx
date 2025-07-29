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

import TrabajosList from './pages/Trabajos/TrabajosList';
import TrabajoForm from './pages/Trabajos/TrabajoForm';

import TrabajosClientesList from './pages/TrabajosClientes/TrabajosClientesList';
import TrabajoClienteForm from './pages/TrabajosClientes/TrabajoClienteForm';

import LocalizacionesList from './pages/Localizaciones/LocalizacionesList';
import LocalizacionForm from './pages/Localizaciones/LocalizacionForm';

import ReparacionesList from './pages/Reparaciones/ReparacionesList';
import ReparacionForm from './pages/Reparaciones/ReparacionForm';
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

        <Route path="/trabajos" element={<TrabajosList />} />
        <Route path="/trabajos/crear" element={<TrabajoForm />} />
        <Route path="/trabajos/editar/:id" element={<TrabajoForm />} />

        <Route path="/trabajos-clientes" element={<TrabajosClientesList />} />
        <Route path="/trabajos-clientes/crear" element={<TrabajoClienteForm />} />
        <Route path="/trabajos-clientes/editar/:id" element={<TrabajoClienteForm />} />

        <Route path="/localizaciones" element={<LocalizacionesList />} />
        <Route path="/localizaciones/crear" element={<LocalizacionForm />} />
        <Route path="/localizaciones/editar/:id" element={<LocalizacionForm />} />

        <Route path="/reparaciones" element={<ReparacionesList />} />
        <Route path="/reparaciones/crear" element={<ReparacionForm />} />
        <Route path="/reparaciones/editar/:id" element={<ReparacionForm />} />
      </Routes>
    </BrowserRouter>
      
  );
}