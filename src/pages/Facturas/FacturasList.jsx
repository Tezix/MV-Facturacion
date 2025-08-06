import { useEffect, useState } from 'react';
import { API } from '../../api/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faFilePdf, faEnvelope, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import LoadingOverlay from '../../components/LoadingOverlay';
import emailjs from '@emailjs/browser';


export default function FacturasList() {
  // ...existing code...
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
  // Estado para el menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuFacturaId, setMenuFacturaId] = useState(null);
  const handleMenuOpen = (event, id) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuFacturaId(id);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuFacturaId(null);
  };
  const [emailDialog, setEmailDialog] = useState({ open: false, facturaId: null });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const location = useLocation();
  const navigate = useNavigate();

  // Mostrar snackbar si viene de una creación
  useEffect(() => {
    if (location.state && location.state.snackbar) {
      setSnackbar(location.state.snackbar);
      // Limpiar el state para que no se repita al refrescar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    Promise.all([
      API.get('facturas/'),
      API.get('reparaciones/'),
      API.get('estados/'),
      API.get('clientes/')
    ]).then(([facturasRes, reparacionesRes, estadosRes, clientesRes]) => {
      const facturasData = facturasRes.data;
      const reparacionesData = reparacionesRes.data;
      const estadosData = estadosRes.data;
      const clientesData = clientesRes.data;
      
      // Enriquecer facturas con sus reparaciones, estados y clientes
      const facturasConReparaciones = facturasData.map(factura => {
        const reparacionesFactura = reparacionesData.filter(rep => rep.factura === factura.id);
        
        // Buscar el estado y cliente correspondientes
        const estadoObj = estadosData.find(e => e.id === factura.estado);
        const clienteObj = clientesData.find(c => c.id === factura.cliente);
        
        // Agrupar reparaciones por localizacion y num_reparacion para mostrar trabajos juntos
        const gruposReparaciones = {};
        reparacionesFactura.forEach(rep => {
          const key = `${rep.num_reparacion}-${rep.localizacion?.id || 'sin-loc'}`;
          if (!gruposReparaciones[key]) {
            gruposReparaciones[key] = {
              id: rep.id,
              fecha: rep.fecha,
              num_reparacion: rep.num_reparacion,
              num_pedido: rep.num_pedido,
              localizacion: rep.localizacion ? 
                `${rep.localizacion.direccion} ${rep.localizacion.numero}${rep.localizacion.escalera ? `, Esc ${rep.localizacion.escalera}` : ''}${rep.localizacion.ascensor ? `, Asc ${rep.localizacion.ascensor}` : ''}` : 
                'Sin localización',
              trabajos: []
            };
          }
          
          // Añadir trabajos de esta reparación al grupo
          if (rep.trabajos_reparaciones && rep.trabajos_reparaciones.length > 0) {
            rep.trabajos_reparaciones.forEach(tr => {
              gruposReparaciones[key].trabajos.push({
                nombre_reparacion: tr.trabajo.nombre_reparacion,
                precio: tr.trabajo.precio,
                especial: tr.trabajo.especial
              });
            });
          }
        });
        
        return {
          ...factura,
          estado_nombre: estadoObj ? estadoObj.nombre : factura.estado,
          cliente_nombre: clienteObj ? clienteObj.nombre : factura.cliente,
          reparaciones: Object.values(gruposReparaciones)
        };
      });
      
      setFacturas(facturasConReparaciones);
    }).finally(() => setLoading(false));
  }, []);
  // Cargar estados para asignar estado 'Enviada'
  useEffect(() => {
    API.get('estados/').then((res) => setEstados(res.data));
  }, []);

  // Estado para saber si está eliminando una factura específica
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, facturaId: null });
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`facturas/${id}/`);
      setFacturas(facturas.filter((f) => f.id !== id));
      setSnackbar({ open: true, message: 'Factura eliminada correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar la factura', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, facturaId: null });
      setDeletingId(null);
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
        name: 'TMV Ascensores',
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
  // Determinar la última factura (por número más alto)
  const lastFacturaId = sortedFacturas.length > 0 ? sortedFacturas[0].id : null;
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
            startIcon={<span style={{fontSize: 20, fontWeight: 'bold', lineHeight: 1}}>+</span>}
          >
            Nueva
          </Button>
        </Box>

        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <TextField
                    label="Número"
                    name="numero"
                    value={filters.numero}
                    onChange={e => setFilters(f => ({ ...f, numero: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#181818',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderLeft: 'none',
                          borderRight: 'none',
                          borderTop: 'none',
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Cliente"
                    name="cliente"
                    value={filters.cliente}
                    onChange={e => setFilters(f => ({ ...f, cliente: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#181818',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderLeft: 'none',
                          borderRight: 'none',
                          borderTop: 'none',
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Fecha"
                    name="fecha"
                    value={filters.fecha}
                    onChange={e => setFilters(f => ({ ...f, fecha: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#181818',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderLeft: 'none',
                          borderRight: 'none',
                          borderTop: 'none',
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Estado"
                    name="estado"
                    value={filters.estado}
                    onChange={e => setFilters(f => ({ ...f, estado: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#181818',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderLeft: 'none',
                          borderRight: 'none',
                          borderTop: 'none',
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Total"
                    name="total"
                    value={filters.total}
                    onChange={e => setFilters(f => ({ ...f, total: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#181818',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderLeft: 'none',
                          borderRight: 'none',
                          borderTop: 'none',
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    label="Reparaciones"
                    name="reparaciones"
                    value={filters.reparaciones}
                    onChange={e => setFilters(f => ({ ...f, reparaciones: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': {
                          color: '#181818',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderLeft: 'none',
                          borderRight: 'none',
                          borderTop: 'none',
                        },
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFacturas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell>
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, factura.id)}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl) && menuFacturaId === factura.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => { handleExport(factura.id); handleMenuClose(); }}>
                        <ListItemIcon><FontAwesomeIcon icon={faFilePdf} /></ListItemIcon>
                        <ListItemText>Exportar PDF</ListItemText>
                      </MenuItem>
                      {factura.estado_nombre !== 'Enviada' && (
                        <MenuItem onClick={() => { setEmailDialog({ open: true, facturaId: factura.id }); handleMenuClose(); }}>
                          <ListItemIcon><FontAwesomeIcon icon={faEnvelope} /></ListItemIcon>
                          <ListItemText>Enviar por email</ListItemText>
                        </MenuItem>
                      )}
                      {factura.estado_nombre !== 'Pagada' && (
                        <MenuItem component={Link} to={`/facturas/editar/${factura.id}`} onClick={handleMenuClose}>
                          <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                          <ListItemText>Editar</ListItemText>
                        </MenuItem>
                      )}
                      {factura.id === lastFacturaId && (
                        <MenuItem onClick={() => { setDeleteDialog({ open: true, facturaId: factura.id }); handleMenuClose(); }}>
                          <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                          <ListItemText>Eliminar</ListItemText>
                        </MenuItem>
                      )}
                    </Menu>
                  </TableCell>
                  <TableCell>{factura.numero_factura}</TableCell>
                  <TableCell>{factura.cliente_nombre || factura.cliente}</TableCell>
                  <TableCell>{
                    factura.fecha
                      ? (() => {
                          const d = new Date(factura.fecha);
                          if (isNaN(d)) return factura.fecha;
                          const day = String(d.getDate()).padStart(2, '0');
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const year = d.getFullYear();
                          return `${day}/${month}/${year}`;
                        })()
                      : ''
                  }</TableCell>
                  <TableCell>
                    <Tooltip
                      title={(() => {
                        // Buscar la descripción del estado correspondiente
                        const estadoObj = estados.find(e => e.nombre === (factura.estado_nombre || factura.estado));
                        return estadoObj && estadoObj.descripcion ? estadoObj.descripcion : '';
                      })()}
                      arrow
                      disableHoverListener={false}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 12,
                          color: '#fff',
                          fontWeight: 600,
                          backgroundColor:
                            (factura.estado_nombre === 'Enviada') ? '#43a047' :
                            (factura.estado_nombre === 'Pagada') ? '#1976d2' :
                            (factura.estado_nombre === 'Pendiente pago') ? '#ff9800' :
                            (factura.estado_nombre === 'Creada') ? '#757575' :
                            '#bdbdbd',
                        }}
                      >
                        {factura.estado_nombre || factura.estado}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{factura.total} €</TableCell>
                  <TableCell>
                    {factura.reparaciones && factura.reparaciones.length > 0 ? (
                      <Box>
                        {factura.reparaciones.map((r, index) => (
                          <Box key={index} display="flex" alignItems="center" mb={0.5}>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => setDetalleReparacion({ open: true, reparacion: r })}
                            >
                              <span style={{ fontSize: 18, fontWeight: 'bold', lineHeight: 1 }}>+</span>
                            </IconButton>
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {r.localizacion}
                            </Typography>
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
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <span>
                          {trabajo.nombre_reparacion} ({trabajo.precio} €)
                          {trabajo.especial && <StarIcon color="warning" fontSize="small" sx={{ ml: 1 }} />}
                        </span>
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
          <Button onClick={() => setDeleteDialog({ open: false, facturaId: null })} color="inherit" disabled={deletingId !== null}>
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.facturaId)}
            color="error"
            variant="contained"
            disabled={deletingId !== null}
            startIcon={deletingId !== null ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {deletingId !== null ? 'Eliminando...' : 'Eliminar'}
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
              // Quitar el spinner y mostrar 'Enviando...' en vez de 'Enviar' cuando sendingEmail es true
              startIcon={null}
            >
              {sendingEmail ? 'Enviando...' : 'Enviar'}
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