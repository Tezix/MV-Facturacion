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
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faFilePdf, faInfoCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import LoadingOverlay from '../../components/LoadingOverlay';
import emailjs from '@emailjs/browser';


export default function FacturasList() {
  // Inicializar EmailJS usando variable de entorno
  emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState([]);
  const [filters, setFilters] = useState({
    numero: '',
    cliente: '',
    fecha: '',
    estado: '',
    total: '',
    reparaciones: '',
  });
  // Estado para el popup de detalle de reparación
  const [detalleReparacion, setDetalleReparacion] = useState({ open: false, reparacion: null });
  const [emailDialog, setEmailDialog] = useState({ open: false, facturaId: null });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    API.get('facturas/con-reparaciones/')
      .then((res) => setFacturas(res.data))
      .finally(() => setLoading(false));
  }, []);
  // Cargar estados para asignar estado 'Enviada'
  useEffect(() => {
    API.get('estados/').then((res) => setEstados(res.data));
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

  // Envío de factura por email usando EmailJS
  const handleSendEmail = async (id) => {
  setSendingEmail(true);
  try {
      // Generar y guardar PDF en el servidor, y obtener datos actualizados
      const resPdf = await API.post(`facturas/${id}/generar-pdf/`);
      const facturaData = resPdf.data;
      const pdfUrl = facturaData.pdf_url;
      const clienteEmail = facturaData.cliente_email;
      const facturaNumero = facturaData.numero_factura;
      // Construir texto de asunto y mensaje
      const subjectText = `Adjunto remito el enlace de descarga a la factura #${facturaNumero}`;
      const message = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>${subjectText}</h2>
          <p><a href="${pdfUrl}">Descargar factura</a></p>
          <p>Gracias por su confianza.</p>
        </div>
      `;
      // Plantilla para EmailJS
      const plantilla = {
        name: 'TMV',
        email: clienteEmail || '',
        factura: facturaNumero,
        message: message,
        pdf_url: pdfUrl
      };
      // Enviar email
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        plantilla
      );
      setSnackbar({ open: true, message: 'Email enviado correctamente', severity: 'success' });
      // Cerrar el diálogo al mostrar el toast
      setEmailDialog({ open: false, facturaId: null });
      // Actualizar estado de factura a 'Enviada'
      const estadoEnviada = estados.find(e => e.nombre === 'Enviada');
      if (estadoEnviada) {
        await API.patch(`facturas/${id}/`, { estado: estadoEnviada.id });
        setFacturas(prev => prev.map(f => f.id === id ? { ...f, estado: estadoEnviada.id, estado_nombre: estadoEnviada.nombre } : f));
      }
  } catch {
    setSnackbar({ open: true, message: 'Error al enviar email', severity: 'error' });
    // Cerrar el diálogo al mostrar el toast en caso de error
    setEmailDialog({ open: false, facturaId: null });
  } finally {
    setSendingEmail(false);
  }
  };

  // Ordenar por número de factura descendente (extraer parte numérica central)
  const extractFacturaNum = (str) => {
    if (!str) return 0;
    // Busca el primer grupo de dígitos de al menos 1 cifra
    const match = String(str).match(/\d+/g);
    if (!match) return 0;
    // Si hay más de un grupo, toma el más largo (normalmente el central)
    const num = match.reduce((max, curr) => curr.length > max.length ? curr : max, '0');
    return parseInt(num, 10);
  };
  const sortedFacturas = [...facturas].sort((a, b) => {
    const numA = extractFacturaNum(a.numero_factura);
    const numB = extractFacturaNum(b.numero_factura);
    return numB - numA;
  });
  // Filtrado local
  const filteredFacturas = sortedFacturas.filter(factura => {
    if (filters.numero && !(String(factura.numero_factura || '').toLowerCase().includes(filters.numero.toLowerCase()))) return false;
    if (filters.cliente && !((factura.cliente_nombre || factura.cliente || '').toLowerCase().includes(filters.cliente.toLowerCase()))) return false;
    if (filters.fecha && !(String(factura.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase()))) return false;
    if (filters.estado && !((factura.estado_nombre || factura.estado || '').toLowerCase().includes(filters.estado.toLowerCase()))) return false;
    if (filters.total && !(String(factura.total || '').toLowerCase().includes(filters.total.toLowerCase()))) return false;
    if (filters.reparaciones) {
      // Buscar en localizaciones y trabajos de cada reparación
      const repStr = factura.reparaciones && factura.reparaciones.length > 0
        ? factura.reparaciones.map(r => `${r.localizacion} ${r.trabajos.map(t => t.nombre_reparacion).join(' ')}`).join(' ').toLowerCase()
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
                        {factura.reparaciones.map((r, index) => (
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
                    <Tooltip title="Exportar PDF">
                      <IconButton onClick={() => handleExport(factura.id)} color="primary" size="small" sx={{ mr: 1 }}>
                        <FontAwesomeIcon icon={faFilePdf} />
                      </IconButton>
                    </Tooltip>
                    {factura.estado_nombre !== 'Enviada' && (
                      <Tooltip title="Enviar por email">
                        <IconButton onClick={() => setEmailDialog({ open: true, facturaId: factura.id })} color="success" size="small" sx={{ mr: 1 }}>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Editar factura">
                      <IconButton
                        component={Link}
                        to={`/facturas/editar/${factura.id}`}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar factura">
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, facturaId: factura.id })}
                        color="error"
                        size="small"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                    </Tooltip>
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

        {/* Dialog de confirmación de envío por email */}
        <Dialog
          open={emailDialog.open}
          onClose={() => setEmailDialog({ open: false, facturaId: null })}
        >
          <DialogTitle>Confirmar envío por email</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres enviar esta factura por email?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEmailDialog({ open: false, facturaId: null })}
              color="inherit"
              disabled={sendingEmail}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleSendEmail(emailDialog.facturaId)}
              color="primary"
              variant="contained"
              disabled={sendingEmail}
              startIcon={sendingEmail ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {!sendingEmail && 'Enviar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for success/error messages */}
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