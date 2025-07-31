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

export default function TrabajoClienteList() {
  const [trabajosClientes, setTrabajosClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cliente: '',
    reparacion: '',
    precio: '',
  });

  useEffect(() => {
    API.get('trabajos_clientes/')
      .then((res) => setTrabajosClientes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, trabajoClienteId: null });
  const handleDelete = async (id) => {
    try {
      await API.delete(`trabajos_clientes/${id}/`);
      setTrabajosClientes(trabajosClientes.filter((tc) => tc.id !== id));
    } catch {
      alert('Error al eliminar el trabajo de cliente');
    } finally {
      setDeleteDialog({ open: false, trabajoClienteId: null });
    }
  };

  // Filtrado local
  const filteredTrabajosClientes = trabajosClientes.filter(tc => {
    if (filters.cliente && !((tc.cliente_nombre || tc.cliente || '').toLowerCase().includes(filters.cliente.toLowerCase()))) return false;
    if (filters.reparacion && !((tc.trabajo_nombre || tc.trabajo || '').toLowerCase().includes(filters.reparacion.toLowerCase()))) return false;
    if (filters.precio && !(String(tc.precio || '').toLowerCase().includes(filters.precio.toLowerCase()))) return false;
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
        <Typography variant="h4">Precios Especiales</Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/trabajos-clientes/crear"
        >
          Nuevo Precio Especial
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Reparacion</strong></TableCell>
              <TableCell><strong>Precio (€)</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
            {/* Fila de filtros */}
            <TableRow>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.cliente}
                  onChange={e => setFilters(f => ({ ...f, cliente: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.reparacion}
                  onChange={e => setFilters(f => ({ ...f, reparacion: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.precio}
                  onChange={e => setFilters(f => ({ ...f, precio: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrabajosClientes.map((tc) => (
              <TableRow key={tc.id}>
                <TableCell>{tc.cliente_nombre || tc.cliente}</TableCell>
                <TableCell>{tc.trabajo_nombre || tc.trabajo}</TableCell>
                <TableCell>{tc.precio}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/trabajos-clientes/editar/${tc.id}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, trabajoClienteId: tc.id })}
                    color="error"
                    size="small"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
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
          <Button onClick={() => setDeleteDialog({ open: false, trabajoClienteId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.trabajoClienteId)}
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
            {trabajosClientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay trabajos registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}