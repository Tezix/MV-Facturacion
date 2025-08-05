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
  CircularProgress,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEllipsisV, faPencilAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function GastosList() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: '',
    tipo: '',
    estado: '',
    fecha: '',
    precio: '',
  });
  const [deleting, setDeleting] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuGasto, setMenuGasto] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, gastoId: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    API.get('gastos/')
      .then((res) => setGastos(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleMenuOpen = (event, gasto) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuGasto(gasto);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuGasto(null);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await API.delete(`gastos/${id}/`);
      setGastos(gastos.filter((g) => g.id !== id));
      setSnackbar({ open: true, message: 'Gasto eliminado correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar el gasto', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, gastoId: null });
      setDeleting(false);
    }
  };

  // Filtrado local
  const filteredGastos = gastos.filter(g => {
    if (filters.nombre && !(g.nombre || '').toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.tipo && !(g.tipo || '').toLowerCase().includes(filters.tipo.toLowerCase())) return false;
    if (filters.estado && !(String(g.estado || '').toLowerCase().includes(filters.estado.toLowerCase()))) return false;
    if (filters.fecha && !(g.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase())) return false;
    if (filters.precio && !(String(g.precio || '').toLowerCase().includes(filters.precio.toLowerCase()))) return false;
    return true;
  });

  return (
    <LoadingOverlay loading={loading}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Gastos</Typography>
          <Button
            variant="contained"
            color="success"
            component={Link}
            to="/gastos/registrar/nuevo"
            startIcon={<span style={{fontSize: 20, fontWeight: 'bold', lineHeight: 1}}>+</span>}
          >
            Nuevo
          </Button>
        </Box>
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <TextField
                    label="Nombre"
                    name="nombre"
                    value={filters.nombre}
                    onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
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
                    label="Tipo"
                    name="tipo"
                    value={filters.tipo}
                    onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))}
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
                    label="Estado"
                    name="estado"
                    value={filters.estado}
                    onChange={e => setFilters(f => ({ ...f, estado: e.target.value }))}
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
                    label="Precio"
                    name="precio"
                    value={filters.precio}
                    onChange={e => setFilters(f => ({ ...f, precio: e.target.value }))}
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
                <TableCell>Archivo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, gasto)}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl) && menuGasto === gasto}
                      onClose={handleMenuClose}
                    >
                      <MenuItem component={Link} to={`/gastos/editar/${gasto.id}`} onClick={handleMenuClose}>
                        <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                        <ListItemText>Editar</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setDeleteDialog({ open: true, gastoId: gasto.id }); handleMenuClose(); }}>
                        <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                        <ListItemText>Eliminar</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell>{gasto.nombre}</TableCell>
                  <TableCell>{gasto.tipo}</TableCell>
                  <TableCell>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        color: '#fff',
                        fontWeight: 600,
                        backgroundColor:
                          (gasto.estado === 'Pagada') ? '#1976d2' :
                          (gasto.estado === 'Enviada') ? '#43a047' :
                          (gasto.estado === 'Pendiente de pago' || gasto.estado === 'pendiente de pago') ? '#ff9800' :
                          '#bdbdbd',
                      }}
                    >
                      {Array.isArray(gasto.estado) ? gasto.estado.join(', ') : gasto.estado}
                    </span>
                  </TableCell>
                  <TableCell>{gasto.fecha}</TableCell>
                  <TableCell>{
                    Number(gasto.precio) % 1 === 0
                      ? Number(gasto.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : Number(gasto.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  }</TableCell>
                  <TableCell>
                    {gasto.archivo ? (
                      <Tooltip title="Ver archivo">
                        <a href={gasto.archivo} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                          <FontAwesomeIcon icon={faFileAlt} size="lg" />
                        </a>
                      </Tooltip>
                    ) : ''}
                  </TableCell>
                </TableRow>
              ))}
              {filteredGastos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    No hay gastos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
        {/* Dialog de confirmación de borrado */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, gastoId: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, gastoId: null })} color="inherit" disabled={deleting}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteDialog.gastoId)}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
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
