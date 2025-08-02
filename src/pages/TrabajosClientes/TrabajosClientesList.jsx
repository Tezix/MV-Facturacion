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
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function TrabajoClienteList() {
  const [trabajosClientes, setTrabajosClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cliente: '',
    reparacion: '',
    precio: '',
  });
  // Para menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuTrabajoCliente, setMenuTrabajoCliente] = useState(null);
  const handleMenuOpen = (event, tc) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuTrabajoCliente(tc);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuTrabajoCliente(null);
  };
  // Estado para saber si está eliminando un trabajoCliente específico
  const [deletingId, setDeletingId] = useState(null);
  // Dialog de borrado
  const [deleteDialog, setDeleteDialog] = useState({ open: false, trabajoClienteId: null });
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    API.get('trabajos_clientes/')
      .then((res) => setTrabajosClientes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`trabajos_clientes/${id}/`);
      setTrabajosClientes(trabajosClientes.filter((tc) => tc.id !== id));
      setSnackbar({ open: true, message: 'Trabajo de cliente eliminado correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar el trabajo de cliente', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, trabajoClienteId: null });
      setDeletingId(null);
    }
  };

  // Filtrado local
  const filteredTrabajosClientes = trabajosClientes.filter(tc => {
    if (filters.cliente && !((tc.cliente_nombre || tc.cliente || '').toLowerCase().includes(filters.cliente.toLowerCase()))) return false;
    if (filters.reparacion && !((tc.trabajo_nombre || tc.trabajo || '').toLowerCase().includes(filters.reparacion.toLowerCase()))) return false;
    if (filters.precio && !(String(tc.precio || '').toLowerCase().includes(filters.precio.toLowerCase()))) return false;
    return true;
  });

  return (
    <LoadingOverlay loading={loading}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Precios Especiales</Typography>
          <Button
            variant="contained"
            color="success"
            component={Link}
            to="/trabajos-clientes/crear"
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
                    label="Cliente"
                    name="cliente"
                    value={filters.cliente}
                    onChange={e => setFilters(f => ({ ...f, cliente: e.target.value }))}
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
                    label="Reparación"
                    name="reparacion"
                    value={filters.reparacion}
                    onChange={e => setFilters(f => ({ ...f, reparacion: e.target.value }))}
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
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrabajosClientes.map((tc) => (
                <TableRow key={tc.id}>
                  <TableCell>
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, tc)}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl) && menuTrabajoCliente === tc}
                      onClose={handleMenuClose}
                    >
                      <MenuItem component={Link} to={`/trabajos-clientes/editar/${tc.id}`} onClick={handleMenuClose}>
                        <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                        <ListItemText>Editar</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setDeleteDialog({ open: true, trabajoClienteId: tc.id }); handleMenuClose(); }}>
                        <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                        <ListItemText>Eliminar</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell>{tc.cliente_nombre || tc.cliente}</TableCell>
                  <TableCell>{tc.trabajo_nombre || tc.trabajo}</TableCell>
                  <TableCell>{
                    Number(tc.precio) % 1 === 0
                      ? Number(tc.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : Number(tc.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  }</TableCell>
                </TableRow>
              ))}
              {filteredTrabajosClientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    No hay trabajos registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Dialog de confirmación de borrado */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, trabajoClienteId: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar este trabajo de cliente? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, trabajoClienteId: null })} color="inherit" disabled={deletingId !== null}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteDialog.trabajoClienteId)}
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