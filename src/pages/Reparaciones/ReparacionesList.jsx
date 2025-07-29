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

export default function ReparacionList() {
  const [reparaciones, setReparaciones] = useState([]);

  useEffect(() => {
    API.get('reparaciones/agrupados/').then((res) => setReparaciones(res.data));
  }, []);

  const handleDelete = async (id) => {
    // Buscar el grupo correspondiente
    const grupos = await API.get('reparaciones/agrupados/').then(res => res.data);
    const grupo = grupos.find(g => g.reparacion_ids.includes(Number(id)));
    if (grupo && window.confirm('¿Eliminar todos los reparaciones de este grupo?')) {
      await Promise.all(grupo.reparacion_ids.map(tid => API.delete(`reparaciones/${tid}/`)));
      // Refrescar la lista agrupada
      const nuevos = await API.get('reparaciones/agrupados/').then(res => res.data);
      setReparaciones(nuevos);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reparaciones</Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/reparaciones/crear"
        >
          Nueva Reparacion
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
              <TableCell><strong>Trabajo</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reparaciones.map((t, idx) => (
              <TableRow key={idx}>
                <TableCell>{t.fecha}</TableCell>
                <TableCell>{t.num_reparacion || '—'}</TableCell>
                <TableCell>{t.num_pedido || '—'}</TableCell>
                <TableCell>{t.factura_numero || t.factura || '—'}</TableCell>
                <TableCell>{t.proforma || '—'}</TableCell>
                <TableCell>
                  {t.localizacion
                    ? `${t.localizacion.direccion}, ${t.localizacion.numero}, ${t.localizacion.localidad}`
                    : '—'}
                </TableCell>
                <TableCell>
                  {t.trabajos && t.trabajos.length > 0
                    ? t.trabajos.map((trabajo) => trabajo.nombre_reparacion).join(', ')
                    : '—'}
                </TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/reparaciones/editar/${t.reparacion_ids[0]}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  {/* Eliminar solo el primer reparacion del grupo, o puedes adaptar para eliminar todos */}
                  <Button
                    onClick={() => handleDelete(t.reparacion_ids[0])}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {reparaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  No hay reparaciones registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}