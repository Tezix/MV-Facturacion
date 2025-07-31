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

  const [deleteDialog, setDeleteDialog] = useState({ open: false, estadoId: null });
  const handleDelete = async (id) => {
    try {
      await API.delete(`estados/${id}/`);
      setEstados(estados.filter((e) => e.id !== id));
    } catch {
      alert('Error al eliminar el estado');
    } finally {
      setDeleteDialog({ open: false, estadoId: null });
    }
  };

  // Filtrado local
  const filteredEstados = estados.filter(estado => {
    if (filters.nombre && !(estado.nombre || '').toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.descripcion && !(estado.descripcion || '').toLowerCase().includes(filters.descripcion.toLowerCase())) return false;
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
          Estados
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/estados/crear"
        >
          Nuevo Estado
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Descripción</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
            {/* Fila de filtros */}
            <TableRow>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.nombre}
                  onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.descripcion}
                  onChange={e => setFilters(f => ({ ...f, descripcion: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEstados.map((estado) => (
              <TableRow key={estado.id}>
                <TableCell>{estado.nombre}</TableCell>
                <TableCell>{estado.descripcion}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/estados/editar/${estado.id}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, estadoId: estado.id })}
                    color="error"
                    size="small"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
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
          <Button onClick={() => setDeleteDialog({ open: false, estadoId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.estadoId)}
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
            {estados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay estados registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
