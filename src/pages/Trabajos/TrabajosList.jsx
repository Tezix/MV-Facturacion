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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const TrabajosList = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: '',
    precio: '',
  });

  useEffect(() => {
    API.get("trabajos/")
      .then((res) => setTrabajos(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, trabajoId: null });
  const handleDelete = async (id) => {
    try {
      await API.delete(`trabajos/${id}/`);
      setTrabajos(trabajos.filter((t) => t.id !== id));
    } catch {
      alert("Error al eliminar el trabajo");
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
        >
          Nuevo Trabajo
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre Reparación</strong></TableCell>
              <TableCell><strong>Precio</strong></TableCell>
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
                  value={filters.precio}
                  onChange={e => setFilters(f => ({ ...f, precio: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrabajos.map((trabajo) => (
              <TableRow key={trabajo.id}>
                <TableCell>{trabajo.nombre_reparacion}</TableCell>
                <TableCell>{Number(trabajo.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/trabajos/editar/${trabajo.id}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, trabajoId: trabajo.id })}
                    color="error"
                    size="small"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
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
                </TableCell>
              </TableRow>
            ))}
            {trabajos.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No hay trabajos disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TrabajosList;