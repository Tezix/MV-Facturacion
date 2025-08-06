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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faEllipsisV, faImages } from '@fortawesome/free-solid-svg-icons';
import LoadingOverlay from '../../components/LoadingOverlay';

import { useLocation, useNavigate } from 'react-router-dom';

export default function ReparacionList() {
  const [reparaciones, setReparaciones] = useState([]);
  const [fotosDialog, setFotosDialog] = useState({ open: false, fotos: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fecha: '',
    num_reparacion: '',
    num_pedido: '',
    factura: '',
    proforma: '',
    localizacion: '',
    trabajo: '',
    comentarios: '',
  });
  // Para menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuReparacion, setMenuReparacion] = useState(null);
  const handleMenuOpen = (event, reparacion) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuReparacion(reparacion);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuReparacion(null);
  };
  // Estado para saber si está eliminando una reparación específica
  const [deletingId, setDeletingId] = useState(null);
  // Dialog de borrado
  const [deleteDialog, setDeleteDialog] = useState({ open: false, reparacion: null });
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const location = useLocation();
  const navigate = useNavigate();

  // Mostrar snackbar si viene de una creación
  useEffect(() => {
    if (location.state && location.state.snackbar) {
      setSnackbar(location.state.snackbar);
      // Limpiar el state para que no se repita al refrescar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    API.get('reparaciones/')
      .then((res) => setReparaciones(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (reparacion) => {
    setDeletingId(reparacion.id);
    try {
      await API.delete(`reparaciones/${reparacion.id}/`);
      // Refrescar la lista
      const nuevos = await API.get('reparaciones/').then(res => res.data);
      setReparaciones(nuevos);
      setSnackbar({ open: true, message: 'Reparación eliminada correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar la reparación', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, reparacion: null });
      setDeletingId(null);
    }
  };

  // Filtrado local de la lista
  // Ordenar por fecha descendente (más nuevas primero)
  const sortedReparaciones = [...reparaciones].sort((a, b) => {
    // Si alguna fecha es null/undefined, ponerla al final
    if (!a.fecha) return 1;
    if (!b.fecha) return -1;
    // Comparar como fechas reales si es posible
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return dateB - dateA;
  });

  const filteredReparaciones = sortedReparaciones.filter((reparacion) => {
    // Fecha (permite buscar por substring)
    if (filters.fecha && !(reparacion.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase())) return false;
    // Nº Reparación
    if (filters.num_reparacion && !(String(reparacion.num_reparacion || '').toLowerCase().includes(filters.num_reparacion.toLowerCase()))) return false;
    // Nº Pedido
    if (filters.num_pedido && !(String(reparacion.num_pedido || '').toLowerCase().includes(filters.num_pedido.toLowerCase()))) return false;
    // Factura
    if (filters.factura && !((reparacion.factura_numero || reparacion.factura || '').toLowerCase().includes(filters.factura.toLowerCase()))) return false;
    // Proforma
    if (filters.proforma && !((reparacion.proforma_numero || reparacion.proforma || '').toLowerCase().includes(filters.proforma.toLowerCase()))) return false;
    // Localización
    if (filters.localizacion) {
      const loc = reparacion.localizacion
        ? `${reparacion.localizacion.direccion}, ${reparacion.localizacion.numero}, ${reparacion.localizacion.localidad}`
        : '';
      if (!loc.toLowerCase().includes(filters.localizacion.toLowerCase())) return false;
    }
    // Trabajo (busca en todos los trabajos de la reparación)
    if (filters.trabajo) {
      const trabajos = reparacion.trabajos_reparaciones && reparacion.trabajos_reparaciones.length > 0
        ? reparacion.trabajos_reparaciones.map(tr => tr.trabajo.nombre_reparacion).join(' ').toLowerCase()
        : '';
      if (!trabajos.includes(filters.trabajo.toLowerCase())) return false;
    }
    // Comentarios
    if (filters.comentarios && !(String(reparacion.comentarios || '').toLowerCase().includes(filters.comentarios.toLowerCase()))) return false;
    return true;
  });

  const handleOpenFotos = (fotos) => {
    setFotosDialog({ open: true, fotos });
  };
  const handleCloseFotos = () => {
    setFotosDialog({ open: false, fotos: [] });
  };

  return (
    <LoadingOverlay loading={loading}>
      <Box p={3}>
        {/* Dialog para mostrar fotos */}
        <Dialog open={fotosDialog.open} onClose={handleCloseFotos} maxWidth="sm" fullWidth>
          <DialogTitle>Fotos adjuntas</DialogTitle>
          <DialogContent dividers>
            {fotosDialog.fotos && fotosDialog.fotos.length > 0 ? (
              fotosDialog.fotos.map((foto, idx) => {
                // Manejar tanto el formato nuevo (objeto con foto_url) como el viejo (URL directa)
                const url = typeof foto === 'string' ? foto : foto.foto_url;
                return (
                  <Box key={idx} component="img" src={url} alt={`Foto ${idx+1}`} sx={{ width: '100%', mb: 2 }} />
                );
              })
            ) : (
              <Typography>No hay fotos adjuntas.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFotos}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Reparaciones</Typography>
          <Button
            variant="contained"
            color="success"
            component={Link}
            to="/reparaciones/crear"
            startIcon={<span style={{fontSize: 20, fontWeight: 'bold', lineHeight: 1}}>+</span>}
          >
            Nueva
          </Button>
        </Box>

        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <TextField
                    label="Fecha"
                    name="fecha"
                    value={filters.fecha}
                    onChange={e => setFilters(f => ({ ...f, fecha: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Nº Reparación"
                    name="num_reparacion"
                    value={filters.num_reparacion}
                    onChange={e => setFilters(f => ({ ...f, num_reparacion: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Nº Pedido"
                    name="num_pedido"
                    value={filters.num_pedido}
                    onChange={e => setFilters(f => ({ ...f, num_pedido: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Factura"
                    name="factura"
                    value={filters.factura}
                    onChange={e => setFilters(f => ({ ...f, factura: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Proforma"
                    name="proforma"
                    value={filters.proforma}
                    onChange={e => setFilters(f => ({ ...f, proforma: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Localización"
                    name="localizacion"
                    value={filters.localizacion}
                    onChange={e => setFilters(f => ({ ...f, localizacion: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Trabajo"
                    name="trabajo"
                    value={filters.trabajo}
                    onChange={e => setFilters(f => ({ ...f, trabajo: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Comentarios"
                    name="comentarios"
                    value={filters.comentarios}
                    onChange={e => setFilters(f => ({ ...f, comentarios: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>Fotos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReparaciones.map((reparacion) => (
                <TableRow key={reparacion.id}>
                  <TableCell>
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, reparacion)}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl) && menuReparacion === reparacion}
                      onClose={handleMenuClose}
                    >
                      <MenuItem component={Link} to={`/reparaciones/editar/${reparacion.id}`} onClick={handleMenuClose}>
                        <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                        <ListItemText>Editar</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setDeleteDialog({ open: true, reparacion: reparacion }); handleMenuClose(); }}>
                        <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                        <ListItemText>Eliminar</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell>{
                    reparacion.fecha
                      ? (() => {
                          const d = new Date(reparacion.fecha);
                          if (isNaN(d)) return reparacion.fecha;
                          const day = String(d.getDate()).padStart(2, '0');
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const year = d.getFullYear();
                          return `${day}/${month}/${year}`;
                        })()
                      : ''
                  }</TableCell>
                  <TableCell>{reparacion.num_reparacion || '—'}</TableCell>
                  <TableCell>{reparacion.num_pedido || '—'}</TableCell>
                  <TableCell>{reparacion.factura_numero || reparacion.factura || '—'}</TableCell>
                  <TableCell>{reparacion.proforma_numero || reparacion.proforma || '—'}</TableCell>
                  <TableCell>
                      {reparacion.localizacion
                        ? `${reparacion.localizacion.direccion}, ${reparacion.localizacion.numero}, ${reparacion.localizacion.localidad}, Esc ${reparacion.localizacion.escalera} Asc ${reparacion.localizacion.ascensor}`
                        : '—'}
                  </TableCell>
                  <TableCell>
                    {reparacion.trabajos_reparaciones && reparacion.trabajos_reparaciones.length > 0 ? (
                      <Box>
                        {reparacion.trabajos_reparaciones.map((trabajoRel, index) => (
                          <Typography key={index} variant="body2">
                           - {trabajoRel.trabajo.nombre_reparacion}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{reparacion.comentarios || '—'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenFotos(reparacion.fotos)} disabled={!reparacion.fotos || reparacion.fotos.length === 0}>
                      <FontAwesomeIcon icon={faImages} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReparaciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    No hay reparaciones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Dialog de confirmación de borrado */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, reparacion: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar esta reparación? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, reparacion: null })} color="inherit" disabled={deletingId !== null}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteDialog.reparacion)}
              color="error"
              variant="contained"
              disabled={deletingId !== null}
              startIcon={deletingId !== null ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {deletingId !== null ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para mensajes de éxito/error */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LoadingOverlay>
  );
}