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
import { faTrash, faPencilAlt, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';


export default function FacturasList() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    numero: '',
    cliente: '',
    fecha: '',
    estado: '',
    total: '',
    reparaciones: '',
  });

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
  
  // Export factura PDF
  const handleExport = async (id) => {
    try {
      const response = await API.get(`facturas/${id}/exportar/`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `factura_${id}.pdf`);
    } catch {
      alert('Error al exportar PDF');
    }
  };

  // Filtrado local
  const filteredFacturas = facturas.filter(factura => {
    if (filters.numero && !(String(factura.numero_factura || '').toLowerCase().includes(filters.numero.toLowerCase()))) return false;
    if (filters.cliente && !((factura.cliente_nombre || factura.cliente || '').toLowerCase().includes(filters.cliente.toLowerCase()))) return false;
    if (filters.fecha && !(String(factura.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase()))) return false;
    if (filters.estado && !((factura.estado_nombre || factura.estado || '').toLowerCase().includes(filters.estado.toLowerCase()))) return false;
    if (filters.total && !(String(factura.total || '').toLowerCase().includes(filters.total.toLowerCase()))) return false;
    if (filters.reparaciones) {
      const repStr = factura.reparaciones && factura.reparaciones.length > 0
        ? factura.reparaciones.map(t => `${t.localizacion} - ${t.trabajo}`).join(' ').toLowerCase()
        : '';
      if (!repStr.includes(filters.reparaciones.toLowerCase())) return false;
    }
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
            {/* Fila de filtros */}
            <TableRow>
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
                  value={filters.cliente}
                  onChange={e => setFilters(f => ({ ...f, cliente: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.fecha}
                  onChange={e => setFilters(f => ({ ...f, fecha: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.estado}
                  onChange={e => setFilters(f => ({ ...f, estado: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.total}
                  onChange={e => setFilters(f => ({ ...f, total: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.reparaciones}
                  onChange={e => setFilters(f => ({ ...f, reparaciones: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFacturas.map((factura) => (
              <TableRow key={factura.id}>
                <TableCell>{factura.numero_factura}</TableCell>
                <TableCell>{factura.cliente_nombre || factura.cliente}</TableCell>
                <TableCell>{factura.fecha}</TableCell>
                <TableCell>{factura.estado_nombre || factura.estado}</TableCell>
                <TableCell>{factura.total} €</TableCell>
                <TableCell>
                  {factura.reparaciones && factura.reparaciones.length > 0 ? (
                    <Box>
                      {factura.reparaciones.map((t, index) => (
                        <Typography key={index} variant="body2">
                          {`${t.localizacion} - ${t.trabajo}`}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleExport(factura.id)} color="primary" size="small" sx={{ mr: 1 }}>
                    <FontAwesomeIcon icon={faFilePdf} />
                  </IconButton>
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
            {filteredFacturas.length === 0 && (
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