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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

export default function ReparacionList() {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fecha: '',
    num_reparacion: '',
    num_pedido: '',
    factura: '',
    proforma: '',
    localizacion: '',
    trabajo: '',
  });

  useEffect(() => {
    API.get('reparaciones/agrupados/')
      .then((res) => setReparaciones(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, grupo: null });
  const handleDelete = async (grupo) => {
    try {
      await Promise.all(grupo.reparacion_ids.map(tid => API.delete(`reparaciones/${tid}/`)));
      // Refrescar la lista agrupada
      const nuevos = await API.get('reparaciones/agrupados/').then(res => res.data);
      setReparaciones(nuevos);
    } catch {
      alert('Error al eliminar las reparaciones del grupo');
    } finally {
      setDeleteDialog({ open: false, grupo: null });
    }
  };

  // Filtrado local de la lista
  const filteredReparaciones = reparaciones.filter((t) => {
    // Fecha (permite buscar por substring)
    if (filters.fecha && !(t.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase())) return false;
    // Nº Reparación
    if (filters.num_reparacion && !(String(t.num_reparacion || '').toLowerCase().includes(filters.num_reparacion.toLowerCase()))) return false;
    // Nº Pedido
    if (filters.num_pedido && !(String(t.num_pedido || '').toLowerCase().includes(filters.num_pedido.toLowerCase()))) return false;
    // Factura
    if (filters.factura && !((t.factura_numero || t.factura || '').toLowerCase().includes(filters.factura.toLowerCase()))) return false;
    // Proforma
    if (filters.proforma && !((t.proforma_numero || t.proforma || '').toLowerCase().includes(filters.proforma.toLowerCase()))) return false;
    // Localización
    if (filters.localizacion) {
      const loc = t.localizacion
        ? `${t.localizacion.direccion}, ${t.localizacion.numero}, ${t.localizacion.localidad}`
        : '';
      if (!loc.toLowerCase().includes(filters.localizacion.toLowerCase())) return false;
    }
    // Trabajo (busca en todos los trabajos del grupo)
    if (filters.trabajo) {
      const trabajos = t.trabajos && t.trabajos.length > 0
        ? t.trabajos.map(tr => tr.nombre_reparacion).join(' ').toLowerCase()
        : '';
      if (!trabajos.includes(filters.trabajo.toLowerCase())) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }
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
            {/* Fila de filtros */}
            <TableRow>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.fecha}
                  onChange={e => setFilters(f => ({ ...f, fecha: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.num_reparacion}
                  onChange={e => setFilters(f => ({ ...f, num_reparacion: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.num_pedido}
                  onChange={e => setFilters(f => ({ ...f, num_pedido: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.factura}
                  onChange={e => setFilters(f => ({ ...f, factura: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.proforma}
                  onChange={e => setFilters(f => ({ ...f, proforma: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.localizacion}
                  onChange={e => setFilters(f => ({ ...f, localizacion: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.trabajo}
                  onChange={e => setFilters(f => ({ ...f, trabajo: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReparaciones.map((t, idx) => (
              <TableRow key={idx}>
                <TableCell>{t.fecha}</TableCell>
                <TableCell>{t.num_reparacion || '—'}</TableCell>
                <TableCell>{t.num_pedido || '—'}</TableCell>
                <TableCell>{t.factura_numero || t.factura || '—'}</TableCell>
                <TableCell>{t.proforma_numero || t.proforma || '—'}</TableCell>
                <TableCell>
                    {t.localizacion
                      ? `${t.localizacion.direccion}, ${t.localizacion.numero}, ${t.localizacion.localidad}, ${t.localizacion.ascensor}${t.localizacion.escalera ? ', ' + t.localizacion.escalera : ''}`
                      : '—'}
                </TableCell>
                <TableCell>
                  {t.trabajos && t.trabajos.length > 0 ? (
                    <Box>
                      {t.trabajos.map((trabajo, index) => (
                        <Typography key={index} variant="body2">
                         - {trabajo.nombre_reparacion}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/reparaciones/editar/${t.reparacion_ids[0]}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  {/* Eliminar solo el primer reparacion del grupo, o puedes adaptar para eliminar todos */}
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, grupo: t })}
                    color="error"
                    size="small"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, grupo: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar todas las reparaciones de este grupo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, grupo: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.grupo)}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
                </TableCell>
              </TableRow>
            ))}
            {filteredReparaciones.length === 0 && (
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