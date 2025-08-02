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
import LoadingOverlay from '../../components/LoadingOverlay';


export default function ClientesList() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: '',
    cif: '',
    email: '',
  });

  useEffect(() => {
    API.get('clientes/')
      .then((res) => setClientes(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, clienteId: null });
  const deleteCliente = async (id) => {
    try {
      await API.delete(`clientes/${id}/`);
      setClientes(clientes.filter((c) => c.id !== id));
    } catch {
      alert('Error al eliminar el cliente');
    } finally {
      setDeleteDialog({ open: false, clienteId: null });
    }
  };

  // Filtrado local
  const filteredClientes = clientes.filter(cliente => {
    if (filters.nombre && !(cliente.nombre || '').toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.cif && !(cliente.cif || '').toLowerCase().includes(filters.cif.toLowerCase())) return false;
    if (filters.email && !(cliente.email || '').toLowerCase().includes(filters.email.toLowerCase())) return false;
    return true;
  });

  return (
    <LoadingOverlay loading={loading}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Clientes
          </Typography>
          <Button
            variant="contained"
            color="success"
            component={Link}
            to="/clientes/crear"
          >
            Nuevo Cliente
          </Button>
        </Box>

        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>CIF</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
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
                    value={filters.cif}
                    onChange={e => setFilters(f => ({ ...f, cif: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filters.email}
                    onChange={e => setFilters(f => ({ ...f, email: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nombre}</TableCell>
                  <TableCell>{cliente.cif}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>
                    <IconButton
                      component={Link}
                      to={`/clientes/editar/${cliente.id}`}
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </IconButton>
                    <IconButton
                      onClick={() => setDeleteDialog({ open: true, clienteId: cliente.id })}
                      color="error"
                      size="small"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                    <Dialog
                      open={deleteDialog.open}
                      onClose={() => setDeleteDialog({ open: false, clienteId: null })}
                    >
                      <DialogTitle>Confirmar eliminación</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          ¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={() => setDeleteDialog({ open: false, clienteId: null })} color="inherit">
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => deleteCliente(deleteDialog.clienteId)}
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
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </LoadingOverlay>
  );
}