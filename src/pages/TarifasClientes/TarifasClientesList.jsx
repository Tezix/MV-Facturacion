import { useEffect, useState } from 'react';
import { API } from '../../api/axios';
import { Link } from 'react-router-dom';
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  CircularProgress,
} from '@mui/material';

export default function TarifaClienteList() {
  const [tarifasClientes, setTarifasClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('tarifas_clientes/')
      .then((res) => setTarifasClientes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta tarifa de cliente?')) {
      await API.delete(`tarifas_clientes/${id}/`);
      setTarifasClientes(tarifasClientes.filter((tc) => tc.id !== id));
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando tarifas clientes...
        </Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tarifas por Cliente</Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/tarifas-clientes/crear"
        >
          Nueva Tarifa Cliente
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Reparacion</strong></TableCell>
              <TableCell><strong>Precio (€)</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tarifasClientes.map((tc) => (
              <TableRow key={tc.id}>
                <TableCell>{tc.cliente_nombre || tc.cliente}</TableCell>
                <TableCell>{tc.tarifa_nombre || tc.tarifa}</TableCell>
                <TableCell>{tc.precio}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/tarifas-clientes/editar/${tc.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(tc.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tarifasClientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay tarifas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}