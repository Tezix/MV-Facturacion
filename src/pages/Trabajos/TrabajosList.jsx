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

export default function TrabajoList() {
  const [trabajos, setTrabajos] = useState([]);

  useEffect(() => {
    API.get('trabajos/').then((res) => setTrabajos(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este trabajo?')) {
      await API.delete(`trabajos/${id}/`);
      setTrabajos(trabajos.filter((t) => t.id !== id));
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Trabajos</Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/trabajos/crear"
        >
          Nuevo Trabajo
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Nº Reparación</strong></TableCell>
              <TableCell><strong>Nº Pedido</strong></TableCell>
              <TableCell><strong>Factura</strong></TableCell>
              <TableCell><strong>Proforma</strong></TableCell>
              <TableCell><strong>Localización</strong></TableCell>
              <TableCell><strong>Tarifa</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trabajos.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.fecha}</TableCell>
                <TableCell>{t.num_reparacion || '—'}</TableCell>
                <TableCell>{t.num_pedido || '—'}</TableCell>
                <TableCell>{t.factura || '—'}</TableCell>
                <TableCell>{t.proforma || '—'}</TableCell>
                <TableCell>{t.localizacion || '—'}</TableCell>
                <TableCell>{t.tarifa || '—'}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/trabajos/editar/${t.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(t.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {trabajos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  No hay trabajos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}