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

export default function TrabajoClienteList() {
  const [trabajosClientes, setTrabajosClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('trabajos_clientes/')
      .then((res) => setTrabajosClientes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta trabajo de cliente?')) {
      await API.delete(`trabajos_clientes/${id}/`);
      setTrabajosClientes(trabajosClientes.filter((tc) => tc.id !== id));
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando trabajos clientes...
        </Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Trabajos por Cliente</Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/trabajos-clientes/crear"
        >
          Nueva Trabajo Cliente
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
            {trabajosClientes.map((tc) => (
              <TableRow key={tc.id}>
                <TableCell>{tc.cliente_nombre || tc.cliente}</TableCell>
                <TableCell>{tc.trabajo_nombre || tc.trabajo}</TableCell>
                <TableCell>{tc.precio}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/trabajos-clientes/editar/${tc.id}`}
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
            {trabajosClientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay trabajos registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}