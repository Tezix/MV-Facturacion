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


export default function FacturasList() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('facturas/con-reparaciones/')
      .then((res) => setFacturas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, facturaId: null });
  const handleDelete = async (id) => {
    try {
      await API.delete(`facturas/${id}/`);
      setFacturas(facturas.filter((f) => f.id !== id));
    } catch {
      alert('Error al eliminar la factura');
    } finally {
      setDeleteDialog({ open: false, facturaId: null });
    }
  };

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
          Facturas
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/facturas/crear"
        >
          Nueva Factura
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Reparaciones</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map((factura) => (
              <TableRow key={factura.id}>
                <TableCell>{factura.numero_factura}</TableCell>
                <TableCell>{factura.cliente_nombre || factura.cliente}</TableCell>
                <TableCell>{factura.fecha}</TableCell>
                <TableCell>{factura.estado_nombre || factura.estado}</TableCell>
                <TableCell>{factura.total} €</TableCell>
                <TableCell>
                  {factura.reparaciones && factura.reparaciones.length > 0
                    ? factura.reparaciones.map(t => `${t.fecha} - ${t.localizacion} - ${t.trabajo}`).join(', ')
                    : '—'}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/facturas/editar/${factura.id}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, facturaId: factura.id })}
                    color="error"
                    size="small"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, facturaId: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar esta factura? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, facturaId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.facturaId)}
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
            {facturas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No hay facturas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}