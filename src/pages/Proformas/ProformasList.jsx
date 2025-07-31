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
import { faTrash, faPencilAlt, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';

const ProformasList = () => {
  // Export proforma PDF
  const handleExport = async (id) => {
    try {
      const response = await API.get(`proformas/${id}/exportar/`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `proforma_${id}.pdf`);
    } catch {
      alert('Error al exportar PDF');
    }
  };
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    numero: '',
    cliente: '',
    fecha: '',
    estado: '',
    total: '',
    reparaciones: '',
  });
  const [convertingId, setConvertingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, proformaId: null });
  // State for showing success after conversion
  const [successDialog, setSuccessDialog] = useState({ open: false, facturaNumero: '' });

  const handleConvertToFactura = async (id) => {
    setConvertingId(id);
    try {
      const res = await API.post(`proformas/${id}/convertir-a-factura/`);
      // Recargar la lista de proformas
      const updated = await API.get("proformas/con-reparaciones/");
      setProformas(updated.data);
      // Mostrar diálogo de éxito
      setSuccessDialog({ open: true, facturaNumero: res.data.factura?.numero_factura || '' });
    } catch {
      alert("Error al convertir la proforma a factura");
    } finally {
      setConvertingId(null);
      setConfirmDialog({ open: false, proformaId: null });
    }
  };

  useEffect(() => {
    API.get("proformas/con-reparaciones/")
      .then((res) => setProformas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, proformaId: null });
  const handleDelete = async (id) => {
    try {
      await API.delete(`proformas/${id}/`);
      setProformas(proformas.filter((p) => p.id !== id));
    } catch {
      alert("Error al eliminar la proforma");
    } finally {
      setDeleteDialog({ open: false, proformaId: null });
    }
  };

  // Filtrado local
  const filteredProformas = proformas.filter(proforma => {
    if (filters.numero && !(String(proforma.numero_proforma || '').toLowerCase().includes(filters.numero.toLowerCase()))) return false;
    if (filters.cliente && !((proforma.cliente_nombre || proforma.cliente || '').toLowerCase().includes(filters.cliente.toLowerCase()))) return false;
    if (filters.fecha && !(String(proforma.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase()))) return false;
    if (filters.estado && !((proforma.estado_nombre || proforma.estado || '').toLowerCase().includes(filters.estado.toLowerCase()))) return false;
    if (filters.total && !(String(proforma.total || '').toLowerCase().includes(filters.total.toLowerCase()))) return false;
    if (filters.reparaciones) {
      const repStr = proforma.reparaciones && proforma.reparaciones.length > 0
        ? proforma.reparaciones.map(t => `${t.localizacion} - ${t.trabajo}`).join(' ').toLowerCase()
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
          Proformas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/proformas/nueva"
        >
          Nueva Proforma
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
            {filteredProformas.map((proforma) => (
              <TableRow key={proforma.id}>
                <TableCell>{proforma.numero_proforma}</TableCell>
                <TableCell>{proforma.cliente_nombre || proforma.cliente}</TableCell>
                <TableCell>{proforma.fecha}</TableCell>
                <TableCell>{proforma.estado_nombre || proforma.estado}</TableCell>
                <TableCell>{proforma.total} €</TableCell>
                <TableCell>
                  {proforma.reparaciones && proforma.reparaciones.length > 0 ? (
                    <Box>
                      {proforma.reparaciones.map((t, index) => (
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
                  <IconButton onClick={() => handleExport(proforma.id)} color="primary" size="small" sx={{ mr: 1 }}>
                    <FontAwesomeIcon icon={faFilePdf} />
                  </IconButton>
                  <IconButton
                    component={Link}
                    to={`/proformas/editar/${proforma.id}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, proformaId: proforma.id })}
                    color="error"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
                  {!proforma.factura && (
                    <Button
                      onClick={() => setConfirmDialog({ open: true, proformaId: proforma.id })}
                      variant="contained"
                      color="success"
                      size="small"
                      disabled={convertingId === proforma.id}
                    >
                      {convertingId === proforma.id ? "Convirtiendo..." : "Convertir a Factura"}
                    </Button>
                  )}
                </TableCell>
      {/* Dialogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, proformaId: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar esta proforma? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, proformaId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.proformaId)}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de confirmación para convertir a factura */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, proformaId: null })}
      >
        <DialogTitle>Confirmar conversión</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres convertir esta proforma en factura? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, proformaId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleConvertToFactura(confirmDialog.proformaId)}
            color="success"
            variant="contained"
            disabled={convertingId === confirmDialog.proformaId}
          >
            {convertingId === confirmDialog.proformaId ? "Convirtiendo..." : "Convertir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de éxito */}
      {successDialog.open && (
        <Dialog
          open={successDialog.open}
          onClose={() => setSuccessDialog({ open: false, facturaNumero: '' })}
        >
          <DialogTitle>Conversión exitosa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Proforma convertida a factura correctamente.<br />
              Número de factura: {successDialog.facturaNumero}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSuccessDialog({ open: false, facturaNumero: '' })}
              variant="contained"
              color="primary"
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
              </TableRow>
            ))}
            {proformas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No hay proformas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ProformasList;