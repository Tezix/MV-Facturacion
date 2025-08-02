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
import { faTrash, faPencilAlt, faFilePdf, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import NumPedidoDialog from './NumPedidoDialog';
import LoadingOverlay from '../../components/LoadingOverlay';

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
  // Dialog para pedir número de pedido
  const [numPedidoDialog, setNumPedidoDialog] = useState({ open: false, proformaId: null });
  // State for showing success after conversion
  const [successDialog, setSuccessDialog] = useState({ open: false, facturaNumero: '' });
  // Estado para el popup de detalle de reparación
  const [detalleReparacion, setDetalleReparacion] = useState({ open: false, reparacion: null });

  // Paso 1: Cuando se confirma la conversión, abrir el diálogo de número de pedido
  const handleConfirmConvert = (proformaId) => {
    setConfirmDialog({ open: false, proformaId: null });
    setNumPedidoDialog({ open: true, proformaId });
  };

  // Paso 2: Cuando se introduce el número de pedido, actualizar reparaciones y convertir
  const handleNumPedidoSubmit = async (numPedido) => {
    const proformaId = numPedidoDialog.proformaId;
    setConvertingId(proformaId);
    setNumPedidoDialog({ open: false, proformaId: null });
    try {
      // 1. Obtener solo las reparaciones asociadas a la proforma seleccionada
      const reparacionesRes = await API.get(`reparaciones/?proforma=${proformaId}`);
      // Filtrar solo las reparaciones que tienen proforma === proformaId (por si el backend devuelve más)
      const reparaciones = Array.isArray(reparacionesRes.data)
        ? reparacionesRes.data.filter(r => r.proforma === proformaId || r.proforma === Number(proformaId))
        : [];
      const reparacionIds = reparaciones.map(r => r.id);
      // 2. Actualizar el num_pedido solo de esas reparaciones
      if (reparacionIds.length > 0) {
        await Promise.all(reparacionIds.map(id =>
          API.patch(`reparaciones/${id}/`, { num_pedido: numPedido })
        ));
      }
      // 3. Convertir la proforma a factura
      const res = await API.post(`proformas/${proformaId}/convertir-a-factura/`);
      // Recargar la lista de proformas
      const updated = await API.get("proformas/con-reparaciones/");
      setProformas(updated.data);
      // Mostrar diálogo de éxito
      setSuccessDialog({ open: true, facturaNumero: res.data.factura?.numero_factura || '' });
    } catch {
      alert("Error al convertir la proforma a factura o actualizar número de pedido");
    } finally {
      setConvertingId(null);
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

  // Ordenar por número de proforma descendente (extraer parte numérica central)
  const extractProformaNum = (str) => {
    if (!str) return 0;
    // Busca el primer grupo de dígitos de al menos 1 cifra
    const match = String(str).match(/\d+/g);
    if (!match) return 0;
    // Si hay más de un grupo, toma el más largo (normalmente el central)
    const num = match.reduce((max, curr) => curr.length > max.length ? curr : max, '0');
    return parseInt(num, 10);
  };
  const sortedProformas = [...proformas].sort((a, b) => {
    const numA = extractProformaNum(a.numero_proforma);
    const numB = extractProformaNum(b.numero_proforma);
    return numB - numA;
  });
  // Filtrado local
  const filteredProformas = sortedProformas.filter(proforma => {
    if (filters.numero && !(String(proforma.numero_proforma || '').toLowerCase().includes(filters.numero.toLowerCase()))) return false;
    if (filters.cliente && !((proforma.cliente_nombre || proforma.cliente || '').toLowerCase().includes(filters.cliente.toLowerCase()))) return false;
    if (filters.fecha && !(String(proforma.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase()))) return false;
    if (filters.estado && !((proforma.estado_nombre || proforma.estado || '').toLowerCase().includes(filters.estado.toLowerCase()))) return false;
    if (filters.total && !(String(proforma.total || '').toLowerCase().includes(filters.total.toLowerCase()))) return false;
    if (filters.reparaciones) {
      // Buscar en localizaciones y trabajos de cada reparación
      const repStr = proforma.reparaciones && proforma.reparaciones.length > 0
        ? proforma.reparaciones.map(r => `${r.localizacion} ${r.trabajos ? r.trabajos.map(t => t.nombre_reparacion).join(' ') : ''}`).join(' ').toLowerCase()
        : '';
      if (!repStr.includes(filters.reparaciones.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <LoadingOverlay loading={loading}>
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
                        {proforma.reparaciones.map((r, index) => (
                          <Box key={index} display="flex" alignItems="center" mb={0.5}>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {r.localizacion}
                            </Typography>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => setDetalleReparacion({ open: true, reparacion: r })}
                            >
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
      {/* Popup de detalle de reparación */}
      <Dialog
        open={detalleReparacion.open}
        onClose={() => setDetalleReparacion({ open: false, reparacion: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalle de Reparación</DialogTitle>
        <DialogContent>
          {detalleReparacion.reparacion && (
            <>
              <DialogContentText>
                <strong>Localización:</strong> {detalleReparacion.reparacion.localizacion}<br />
                <strong>Fecha:</strong> {detalleReparacion.reparacion.fecha || '—'}<br />
                <strong>Nº Reparación:</strong> {detalleReparacion.reparacion.num_reparacion || '—'}<br />
                <strong>Nº Pedido:</strong> {detalleReparacion.reparacion.num_pedido || '—'}<br />
              </DialogContentText>
              <Box mt={2}>
                <Typography variant="subtitle1"><strong>Trabajos:</strong></Typography>
                {detalleReparacion.reparacion.trabajos && detalleReparacion.reparacion.trabajos.length > 0 ? (
                  <ul style={{ marginTop: 4 }}>
                    {detalleReparacion.reparacion.trabajos.map((trabajo, idx) => (
                      <li key={idx}>
                        {trabajo.nombre_reparacion} ({trabajo.precio} €)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="body2">No hay trabajos registrados.</Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetalleReparacion({ open: false, reparacion: null })} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
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
            onClick={() => handleConfirmConvert(confirmDialog.proformaId)}
            color="success"
            variant="contained"
            disabled={convertingId === confirmDialog.proformaId}
          >
            {convertingId === confirmDialog.proformaId ? "Convirtiendo..." : "Convertir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo para introducir número de pedido */}
      <NumPedidoDialog
        open={numPedidoDialog.open}
        onClose={() => setNumPedidoDialog({ open: false, proformaId: null })}
        onSubmit={handleNumPedidoSubmit}
        loading={!!convertingId}
      />

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
    </LoadingOverlay>
  );
};

export default ProformasList;