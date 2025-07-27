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


export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('clientes/')
      .then((res) => setClientes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const deleteCliente = (id) => {
    if (window.confirm('¿Eliminar este cliente?')) {
      API.delete(`clientes/${id}/`).then(() => {
        setClientes(clientes.filter((c) => c.id !== id));
      });
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando clientes...
        </Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Clientes
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/clientes/crear"
        >
          Nuevo Cliente
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>CIF</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.cif}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/clientes/editar/${cliente.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => deleteCliente(cliente.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}