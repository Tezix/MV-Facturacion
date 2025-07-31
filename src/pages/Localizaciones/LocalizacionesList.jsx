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


export default function LocalizacionReparacionList() {
  const [localizaciones, setLocalizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    direccion: '',
    numero: '',
    localidad: '',
    ascensor: '',
    escalera: '',
  });

  useEffect(() => {
    API.get('localizaciones_reparaciones/')
      .then((res) => setLocalizaciones(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, localizacionId: null });
  const handleDelete = async (id) => {
    try {
      await API.delete(`localizaciones_reparaciones/${id}/`);
      setLocalizaciones(localizaciones.filter((l) => l.id !== id));
    } catch {
      alert('Error al eliminar la localización');
    } finally {
      setDeleteDialog({ open: false, localizacionId: null });
    }
  };

  // Filtrado local
  const filteredLocalizaciones = localizaciones.filter(loc => {
    if (filters.direccion && !(loc.direccion || '').toLowerCase().includes(filters.direccion.toLowerCase())) return false;
    if (filters.numero && !(String(loc.numero || '').toLowerCase().includes(filters.numero.toLowerCase()))) return false;
    if (filters.localidad && !(loc.localidad || '').toLowerCase().includes(filters.localidad.toLowerCase())) return false;
    if (filters.ascensor && !(String(loc.ascensor ?? '').toLowerCase().includes(filters.ascensor.toLowerCase()))) return false;
    if (filters.escalera && !(String(loc.escalera ?? '').toLowerCase().includes(filters.escalera.toLowerCase()))) return false;
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
        <Typography variant="h4">Localizaciones</Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/localizaciones/crear"
        >
          Nueva Localización
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Dirección</strong></TableCell>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Localidad</strong></TableCell>
              <TableCell><strong>Ascensor</strong></TableCell>
              <TableCell><strong>Escalera</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
            {/* Fila de filtros */}
            <TableRow>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.direccion}
                  onChange={e => setFilters(f => ({ ...f, direccion: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.numero}
                  onChange={e => setFilters(f => ({ ...f, numero: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.localidad}
                  onChange={e => setFilters(f => ({ ...f, localidad: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.ascensor}
                  onChange={e => setFilters(f => ({ ...f, ascensor: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.escalera}
                  onChange={e => setFilters(f => ({ ...f, escalera: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLocalizaciones.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell>{loc.direccion}</TableCell>
                <TableCell>{loc.numero}</TableCell>
                <TableCell>{loc.localidad}</TableCell>
                <TableCell>{loc.ascensor ?? ''}</TableCell>
                <TableCell>{loc.escalera ?? ''}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/localizaciones/editar/${loc.id}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, localizacionId: loc.id })}
                    color="error"
                    size="small"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
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
          <Button onClick={() => setDeleteDialog({ open: false, localizacionId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.localizacionId)}
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
            {localizaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  No hay localizaciones registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}