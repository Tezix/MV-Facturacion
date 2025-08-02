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


export default function EstadosList() {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    API.get('estados/')
      .then((res) => setEstados(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Para menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuEstado, setMenuEstado] = useState(null);
  const handleMenuOpen = (event, estado) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuEstado(estado);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuEstado(null);
  };
  // Estado para saber si está eliminando un estado específico
  const [deletingId, setDeletingId] = useState(null);
  // Dialog de borrado
  const [deleteDialog, setDeleteDialog] = useState({ open: false, estadoId: null });
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`estados/${id}/`);
      setEstados(estados.filter((e) => e.id !== id));
      setSnackbar({ open: true, message: 'Estado eliminado correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar el estado', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, estadoId: null });
      setDeletingId(null);
    }
  };

  // Filtrado local
  const filteredEstados = estados.filter(estado => {
    if (filters.nombre && !(estado.nombre || '').toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.descripcion && !(estado.descripcion || '').toLowerCase().includes(filters.descripcion.toLowerCase())) return false;
    return true;
  });

  return (
    <LoadingOverlay loading={loading}>
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
                    label="Descripción"
                    name="descripcion"
                    value={filters.descripcion}
                    onChange={e => setFilters(f => ({ ...f, descripcion: e.target.value }))}
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
              {filteredEstados.map((estado) => (
                <TableRow key={estado.id}>
                  <TableCell>
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, estado)}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl) && menuEstado === estado}
                      onClose={handleMenuClose}
                    >
                      <MenuItem component={Link} to={`/estados/editar/${estado.id}`} onClick={handleMenuClose}>
                        <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                        <ListItemText>Editar</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setDeleteDialog({ open: true, estadoId: estado.id }); handleMenuClose(); }}>
                        <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                        <ListItemText>Eliminar</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell>{estado.nombre}</TableCell>
                  <TableCell>{estado.descripcion}</TableCell>
                </TableRow>
              ))}
              {filteredEstados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    No hay estados registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Dialog de confirmación de borrado */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, estadoId: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar este estado? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, estadoId: null })} color="inherit" disabled={deletingId !== null}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteDialog.estadoId)}
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
