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
} from '@mui/material';

export default function EstadosList() {
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    API.get('estados/').then((res) => setEstados(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este estado?')) {
      await API.delete(`estados/${id}/`);
      setEstados(estados.filter((e) => e.id !== id));
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Estados
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/estados/crear"
        >
          Nuevo Estado
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estados.map((estado) => (
              <TableRow key={estado.id}>
                <TableCell>{estado.id}</TableCell>
                <TableCell>{estado.nombre}</TableCell>
                <TableCell>{estado.descripcion}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/estados/editar/${estado.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(estado.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {estados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay estados registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
