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
import { faTrash, faPencilAlt, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import LoadingOverlay from '../../components/LoadingOverlay';


export default function LocalizacionReparacionList() {
  const [localizaciones, setLocalizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    direccion: '',
    numero: '',
    localidad: '',
    escalera: '',
    ascensor: '',
  });
  // Estado para saber si está eliminando
  const [deleting, setDeleting] = useState(false);
  // Para menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuLocalizacion, setMenuLocalizacion] = useState(null);
  const handleMenuOpen = (event, loc) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuLocalizacion(loc);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuLocalizacion(null);
  };
  // Dialog de borrado
  const [deleteDialog, setDeleteDialog] = useState({ open: false, localizacionId: null });
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    API.get('localizaciones_reparaciones/')
      .then((res) => setLocalizaciones(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await API.delete(`localizaciones_reparaciones/${id}/`);
      setLocalizaciones(localizaciones.filter((l) => l.id !== id));
      setSnackbar({ open: true, message: 'Localización eliminada correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar la localización', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, localizacionId: null });
      setDeleting(false);
    }
  };

  // Filtrado local
  const filteredLocalizaciones = localizaciones.filter(loc => {
    if (filters.direccion && !(loc.direccion || '').toLowerCase().includes(filters.direccion.toLowerCase())) return false;
    if (filters.numero && !(String(loc.numero || '').toLowerCase().includes(filters.numero.toLowerCase()))) return false;
    if (filters.localidad && !(loc.localidad || '').toLowerCase().includes(filters.localidad.toLowerCase())) return false;
    if (filters.escalera && !(String(loc.escalera ?? '').toLowerCase().includes(filters.escalera.toLowerCase()))) return false;
    if (filters.ascensor && !(String(loc.ascensor ?? '').toLowerCase().includes(filters.ascensor.toLowerCase()))) return false;
    return true;
  });

  return (
    <LoadingOverlay loading={loading}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Localizaciones</Typography>
          <Button
            variant="contained"
            color="success"
            component={Link}
            to="/localizaciones/crear"
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
                    label="Dirección"
                    name="direccion"
                    value={filters.direccion}
                    onChange={e => setFilters(f => ({ ...f, direccion: e.target.value }))}
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
                    label="Número"
                    name="numero"
                    value={filters.numero}
                    onChange={e => setFilters(f => ({ ...f, numero: e.target.value }))}
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
                    label="Localidad"
                    name="localidad"
                    value={filters.localidad}
                    onChange={e => setFilters(f => ({ ...f, localidad: e.target.value }))}
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
                    label="Escalera"
                    name="escalera"
                    value={filters.escalera}
                    onChange={e => setFilters(f => ({ ...f, escalera: e.target.value }))}
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
                    label="Ascensor"
                    name="ascensor"
                    value={filters.ascensor}
                    onChange={e => setFilters(f => ({ ...f, ascensor: e.target.value }))}
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
              {filteredLocalizaciones.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell>
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, loc)}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl) && menuLocalizacion === loc}
                      onClose={handleMenuClose}
                    >
                      <MenuItem component={Link} to={`/localizaciones/editar/${loc.id}`} onClick={handleMenuClose}>
                        <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                        <ListItemText>Editar</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setDeleteDialog({ open: true, localizacionId: loc.id }); handleMenuClose(); }}>
                        <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                        <ListItemText>Eliminar</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell>{loc.direccion}</TableCell>
                  <TableCell>{loc.numero}</TableCell>
                  <TableCell>{loc.localidad}</TableCell>
                  <TableCell>{loc.escalera ?? ''}</TableCell>
                  <TableCell>{loc.ascensor ?? ''}</TableCell>
                </TableRow>
              ))}
              {filteredLocalizaciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    No hay localizaciones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Dialog de confirmación de borrado */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, localizacionId: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar esta localización? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, localizacionId: null })} color="inherit" disabled={deleting}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteDialog.localizacionId)}
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