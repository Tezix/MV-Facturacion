import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { Link } from "react-router-dom";
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
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const TrabajosList = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: '',
    precio: '',
  });
  // Para menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuTrabajo, setMenuTrabajo] = useState(null);
  const handleMenuOpen = (event, trabajo) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuTrabajo(trabajo);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuTrabajo(null);
  };
  // Dialog de borrado
  const [deleteDialog, setDeleteDialog] = useState({ open: false, trabajoId: null });
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    API.get("trabajos/")
      .then((res) => setTrabajos(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`trabajos/${id}/`);
      setTrabajos(trabajos.filter((t) => t.id !== id));
      setSnackbar({ open: true, message: 'Trabajo eliminado correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar el trabajo', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, trabajoId: null });
    }
  };

  // Filtrado local
  const filteredTrabajos = trabajos.filter(trabajo => {
    if (filters.nombre && !(trabajo.nombre_reparacion || '').toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.precio && !(String(trabajo.precio || '').toLowerCase().includes(filters.precio.toLowerCase()))) return false;
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
        <Typography variant="h4" component="h1">
          Precios Trabajos
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/trabajos/crear"
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
                  label="Nombre Reparación"
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
            {filteredTrabajos.map((trabajo) => (
              <TableRow key={trabajo.id}>
                <TableCell>
                  <Tooltip title="Acciones">
                    <IconButton size="small" onClick={e => handleMenuOpen(e, trabajo)}>
                      <FontAwesomeIcon icon={faEllipsisV} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl) && menuTrabajo === trabajo}
                    onClose={handleMenuClose}
                  >
                    <MenuItem component={Link} to={`/trabajos/editar/${trabajo.id}`} onClick={handleMenuClose}>
                      <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                      <ListItemText>Editar</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setDeleteDialog({ open: true, trabajoId: trabajo.id }); handleMenuClose(); }}>
                      <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                      <ListItemText>Eliminar</ListItemText>
                    </MenuItem>
                  </Menu>
                </TableCell>
                <TableCell>{trabajo.nombre_reparacion}</TableCell>
                <TableCell>{Number(trabajo.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</TableCell>
              </TableRow>
            ))}
            {filteredTrabajos.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No hay trabajos disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog de confirmación de borrado */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, trabajoId: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar este trabajo? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, trabajoId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.trabajoId)}
            color="error"
            variant="contained"
          >
            Eliminar
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
  );
};

export default TrabajosList;