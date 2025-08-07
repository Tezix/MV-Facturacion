import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faFilePdf, faEnvelope, faEllipsisV, faFileInvoiceDollar, faFileText } from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';
import NumPedidoDialog from './NumPedidoDialog';
import LoadingOverlay from '../../components/LoadingOverlay';
import emailjs from '@emailjs/browser';

const ProformasList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Inicializar EmailJS usando variable de entorno
  emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

  // Estados y estados UI para email
  const [emailDialog, setEmailDialog] = useState({ open: false, proformaId: null });
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
  const [estados, setEstados] = useState([]);
  useEffect(() => {
    API.get('estados/').then(res => setEstados(res.data));
  }, []);
  // Estado para el popup de detalle de reparación
  const [detalleReparacion, setDetalleReparacion] = useState({ open: false, reparacion: null });
  // Estado para el popup de estado
  const [estadoDialog, setEstadoDialog] = useState({ open: false, estado: null });
  // Estado para el menú de acciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuProformaId, setMenuProformaId] = useState(null);
  const handleMenuOpen = (event, id) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuProformaId(id);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuProformaId(null);
  };

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
  // Estado global para tooltip flotante de fila convertida
  const [hoveredRow, setHoveredRow] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Paso 1: Cuando se confirma la conversión, abrir el diálogo de número de pedido
  const handleConfirmConvert = (proformaId) => {
    setConfirmDialog({ open: false, proformaId: null });
    setNumPedidoDialog({ open: true, proformaId });
  };

  // Paso 2: Cuando se introduce el número de pedido, actualizar reparaciones y convertir
  const handleNumPedidoSubmit = async (numPedido) => {
    const proformaId = numPedidoDialog.proformaId;
    setConvertingId(proformaId);
    // No cerrar el diálogo hasta terminar
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
      // Mostrar snackbar de éxito
      setSnackbar({ open: true, message: `Proforma convertida a factura correctamente. Número de factura: ${res.data.factura?.numero_factura || ''}`, severity: 'success' });
      setNumPedidoDialog({ open: false, proformaId: null });
    } catch {
      alert("Error al convertir la proforma a factura o actualizar número de pedido");
      setNumPedidoDialog({ open: false, proformaId: null });
    } finally {
      setConvertingId(null);
    }
  };

  useEffect(() => {
    Promise.all([
      API.get('proformas/'),
      API.get('reparaciones/'),
      API.get('estados/'),
      API.get('clientes/')
    ]).then(([proformasRes, reparacionesRes, estadosRes, clientesRes]) => {
      const proformas = proformasRes.data;
      const reparaciones = reparacionesRes.data;
      const estados = estadosRes.data;
      const clientes = clientesRes.data;

      // Crear mapas para búsqueda rápida
      const estadosMap = estados.reduce((acc, estado) => {
        acc[estado.id] = estado;
        return acc;
      }, {});

      const clientesMap = clientes.reduce((acc, cliente) => {
        acc[cliente.id] = cliente;
        return acc;
      }, {});

      // Agrupar reparaciones por proforma
      const reparacionesPorProforma = reparaciones.reduce((acc, reparacion) => {
        if (reparacion.proforma) {
          if (!acc[reparacion.proforma]) {
            acc[reparacion.proforma] = [];
          }
          acc[reparacion.proforma].push({
            id: reparacion.id,
            fecha: reparacion.fecha,
            num_reparacion: reparacion.num_reparacion,
            num_pedido: reparacion.num_pedido,
            localizacion: reparacion.localizacion ? 
              `${reparacion.localizacion.direccion || ''} ${reparacion.localizacion.numero || ''}`.trim() : 
              'Sin localización',
            trabajos: reparacion.trabajos_reparaciones ? 
              reparacion.trabajos_reparaciones.map(tr => ({
                nombre_reparacion: tr.trabajo.nombre_reparacion,
                precio: tr.trabajo.precio,
                especial: tr.trabajo.especial
              })) : []
          });
        }
        return acc;
      }, {});

      // Enriquecer proformas con datos relacionados
      const proformasEnriquecidas = proformas.map(proforma => ({
        ...proforma,
        estado_nombre: estadosMap[proforma.estado]?.nombre || 'Desconocido',
        cliente_nombre: clientesMap[proforma.cliente]?.nombre || 'Cliente desconocido',
        reparaciones: reparacionesPorProforma[proforma.id] || []
      }));

      setProformas(proformasEnriquecidas);
    }).finally(() => setLoading(false));
  }, []);

  // Estado para saber si está eliminando una proforma específica
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, proformaId: null });
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await API.delete(`proformas/${id}/`);
      setProformas(proformas.filter((p) => p.id !== id));
      setSnackbar({ open: true, message: 'Proforma eliminada correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar la proforma', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, proformaId: null });
      setDeletingId(null);
    }
  };

  // Envío de proforma por email usando EmailJS
  const handleSendEmail = async (id) => {
    setSendingEmail(true);
    try {
      // Generar y guardar PDF en el servidor, y obtener datos actualizados
      const resPdf = await API.post(`proformas/${id}/generar-pdf/`);
      const proformaData = resPdf.data;
      const pdfUrl = proformaData.pdf_url;
      const clienteEmail = proformaData.cliente_email;
      const proformaNumero = proformaData.numero_proforma;
      const subjectText = `Adjunto remito el enlace de descarga a la proforma #${proformaNumero}`;
      const message = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>${subjectText}</h2>
          <p><a href="${pdfUrl}">Descargar Proforma</a></p>
          <p>Gracias por su confianza.</p>
        </div>
      `;
      const plantilla = { name: 'TMV Ascensores', email: clienteEmail || '', factura: proformaNumero, message, pdf_url: pdfUrl };
      await emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, plantilla);
      setSnackbar({ open: true, message: 'Email enviado correctamente', severity: 'success' });
      setEmailDialog({ open: false, proformaId: null });
      const estadoEnviada = estados.find(e => e.nombre === 'Enviada');
      if (estadoEnviada) {
        await API.patch(`proformas/${id}/`, { estado: estadoEnviada.id });
        setProformas(prev => prev.map(p => p.id === id ? { ...p, estado: estadoEnviada.id, estado_nombre: estadoEnviada.nombre } : p));
      }
    } catch {
      setSnackbar({ open: true, message: 'Error al enviar email', severity: 'error' });
      setEmailDialog({ open: false, proformaId: null });
    } finally {
      setSendingEmail(false);
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
  // Determinar la última proforma (por número más alto)
  const lastProformaId = sortedProformas.length > 0 ? sortedProformas[0].id : null;
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
      <Box p={isMobile ? 1 : 1} sx={{overflowX: 'hidden' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ mb: isMobile ? 1 : 0 }}>
            Proformas
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/proformas/nueva"
            startIcon={<span style={{fontSize: 20, fontWeight: 'bold', lineHeight: 1}}>+</span>}
            size={isMobile ? "small" : "medium"}
          >
            Nueva
          </Button>
        </Box>

        <Paper elevation={3} sx={{ overflowX: 'auto' }}>
          <Table sx={{ 
            minWidth: isMobile ? 'auto' : 650,
            '& .MuiTableCell-root': {
              padding: isMobile ? '4px 2px' : '4px 2px'
            }
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: isMobile ? 35 : 45, padding: isMobile ? '4px 2px' : '4px 2px' }} />
                <TableCell sx={{ minWidth: isMobile ? 50 : 75, padding: isMobile ? '4px 2px' : '4px 2px' }}>
                  <TextField
                    label="Número"
                    name="numero"
                    value={filters.numero}
                    onChange={e => setFilters(f => ({ ...f, numero: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818', fontSize: isMobile ? '0.75rem' : 'inherit' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        fontSize: isMobile ? '0.75rem' : 'inherit'
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: isMobile ? 70 : 120, padding: isMobile ? '4px 2px' : '4px 2px' }}>
                  <TextField
                    label="Cliente"
                    name="cliente"
                    value={filters.cliente}
                    onChange={e => setFilters(f => ({ ...f, cliente: e.target.value }))}
                    fullWidth
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiInputBase-input': { color: '#181818', fontSize: isMobile ? '0.75rem' : 'inherit' },
                        '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        fontSize: isMobile ? '0.75rem' : 'inherit'
                      }
                    }}
                  />
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ width: 25, padding: '4px 2px' }}>
                    <TextField
                      label="Fecha"
                      name="fecha"
                      value={filters.fecha}
                      onChange={e => setFilters(f => ({ ...f, fecha: e.target.value }))}
                      fullWidth
                      size="small"
                      InputProps={{
                        sx: {
                          '& .MuiInputBase-input': { color: '#181818' },
                          '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                        },
                      }}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ minWidth: isMobile ? 35 : 85, fontSize: isMobile ? '0.75rem' : 'inherit', padding: isMobile ? '4px 1px' : '4px 2px' }}>
                  {isMobile ? 'Est' : (
                    <TextField
                      label="Estado"
                      name="estado"
                      value={filters.estado}
                      onChange={e => setFilters(f => ({ ...f, estado: e.target.value }))}
                      fullWidth
                      size="small"
                      InputProps={{
                        sx: {
                          '& .MuiInputBase-input': { color: '#181818' },
                          '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                        },
                      }}
                    />
                  )}
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ minWidth: 90, padding: '4px 2px' }}>
                    <TextField
                      label="Total"
                      name="total"
                      value={filters.total}
                      onChange={e => setFilters(f => ({ ...f, total: e.target.value }))}
                      fullWidth
                      size="small"
                      InputProps={{
                        sx: {
                          '& .MuiInputBase-input': { color: '#181818' },
                          '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                        },
                      }}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ minWidth: isMobile ? 35 : 105, fontSize: isMobile ? '0.75rem' : 'inherit', padding: isMobile ? '4px 1px' : '4px 2px' }}>
                  {isMobile ? 'Rep' : (
                    <TextField
                      label="Reparaciones"
                      name="reparaciones"
                      value={filters.reparaciones}
                      onChange={e => setFilters(f => ({ ...f, reparaciones: e.target.value }))}
                      fullWidth
                      size="small"
                      InputProps={{
                        sx: {
                          '& .MuiInputBase-input': { color: '#181818' },
                          '& .MuiOutlinedInput-notchedOutline': { borderLeft: 'none', borderRight: 'none', borderTop: 'none' },
                        },
                      }}
                    />
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Filas de proformas */}
              {filteredProformas.map((proforma) => {
                const isConverted = !!proforma.factura;
                return (
                  <TableRow
                    key={proforma.id}
                    sx={isConverted ? {
                      backgroundColor: '#e3f2fd !important',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                    } : {}}
                    onMouseEnter={isConverted ? () => setHoveredRow(proforma.id) : undefined}
                    onMouseLeave={isConverted ? () => setHoveredRow(null) : undefined}
                    onMouseMove={isConverted ? (e) => setMousePos({ x: e.clientX, y: e.clientY }) : undefined}
                  >
                    <TableCell sx={{ minWidth: isMobile ? 35 : 45, padding: isMobile ? '4px 2px' : '4px 2px' }}>
                      <Tooltip title="Acciones">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, proforma.id)}>
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl) && menuProformaId === proforma.id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => { handleExport(proforma.id); handleMenuClose(); }}>
                          <ListItemIcon><FontAwesomeIcon icon={faFilePdf} /></ListItemIcon>
                          <ListItemText>Exportar PDF</ListItemText>
                        </MenuItem>
                        <MenuItem component={Link} to={`/proformas/editar/${proforma.id}`} onClick={handleMenuClose}>
                          <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                          <ListItemText>Editar</ListItemText>
                        </MenuItem>
                        {proforma.id === lastProformaId && (
                          <MenuItem onClick={() => { setDeleteDialog({ open: true, proformaId: proforma.id }); handleMenuClose(); }}>
                            <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                            <ListItemText>Eliminar</ListItemText>
                          </MenuItem>
                        )}
                        {!proforma.factura && (
                          <MenuItem onClick={() => { setConfirmDialog({ open: true, proformaId: proforma.id }); handleMenuClose(); }}>
                            <ListItemIcon><FontAwesomeIcon icon={faFileInvoiceDollar} /></ListItemIcon>
                            <ListItemText>Convertir a factura</ListItemText>
                          </MenuItem>
                        )}
                        {proforma.estado_nombre !== 'Enviada' && (
                          <MenuItem onClick={() => { setEmailDialog({ open: true, proformaId: proforma.id }); handleMenuClose(); }}>
                            <ListItemIcon><FontAwesomeIcon icon={faEnvelope} /></ListItemIcon>
                            <ListItemText>Enviar por email</ListItemText>
                          </MenuItem>
                        )}
                      </Menu>
                    </TableCell>
                    <TableCell sx={{ 
                      minWidth: isMobile ? 50 : 75,
                      fontSize: isMobile ? '0.7rem' : 'inherit',
                      padding: isMobile ? '4px 2px' : '4px 2px'
                    }}>{proforma.numero_proforma}</TableCell>
                    <TableCell sx={{ 
                      minWidth: isMobile ? 70 : 120,
                      fontSize: isMobile ? '0.65rem' : 'inherit',
                      wordBreak: 'break-word',
                      maxWidth: isMobile ? 70 : 'none',
                      padding: isMobile ? '4px 2px' : '4px 2px'
                    }}>{proforma.cliente_nombre || proforma.cliente}</TableCell>
                    {!isMobile && (
                      <TableCell sx={{ minWidth: 90, fontSize: '0.9rem', padding: '4px 2px' }}>{
                        proforma.fecha
                          ? (() => {
                              const d = new Date(proforma.fecha);
                              if (isNaN(d)) return proforma.fecha;
                              const day = String(d.getDate()).padStart(2, '0');
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const year = d.getFullYear();
                              return `${day}/${month}/${year}`;
                            })()
                          : ''
                      }</TableCell>
                    )}
                    <TableCell sx={{ minWidth: isMobile ? 35 : 85, padding: isMobile ? '4px 1px' : '4px 2px' }}>
                      {isMobile ? (
                        <IconButton 
                          onClick={() => setEstadoDialog({ 
                            open: true, 
                            estado: {
                              nombre: proforma.estado_nombre || proforma.estado,
                              descripcion: (() => {
                                const estadoObj = estados.find(e => e.nombre === (proforma.estado_nombre || proforma.estado));
                                return estadoObj && estadoObj.descripcion ? estadoObj.descripcion : '';
                              })()
                            }
                          })} 
                          size="small"
                          sx={{ padding: '2px' }}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor:
                                (proforma.estado_nombre === 'Enviada') ? '#43a047' :
                                (proforma.estado_nombre === 'Aceptada') ? '#1976d2' :
                                (proforma.estado_nombre === 'Creada') ? '#757575' :
                                '#bdbdbd',
                            }}
                          />
                        </IconButton>
                      ) : (
                        <Tooltip
                          title={(() => {
                            const estadoObj = estados.find(e => e.nombre === (proforma.estado_nombre || proforma.estado));
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
                                (proforma.estado_nombre === 'Enviada') ? '#43a047' :
                                (proforma.estado_nombre === 'Aceptada') ? '#1976d2' :
                                (proforma.estado_nombre === 'Creada') ? '#757575' :
                                '#bdbdbd',
                            }}
                          >
                            {proforma.estado_nombre || proforma.estado}
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell sx={{ minWidth: 90, fontSize: '0.9rem', padding: '4px 2px' }}>{proforma.total} €</TableCell>
                    )}
                    <TableCell sx={{ minWidth: isMobile ? 35 : 105, padding: isMobile ? '4px 1px' : '4px 2px' }}>
                      {isMobile ? (
                        <IconButton 
                          onClick={() => setDetalleReparacion({ open: true, reparacion: proforma.reparaciones || null })} 
                          disabled={!proforma.reparaciones || proforma.reparaciones.length === 0}
                          size="small"
                        >
                          <FontAwesomeIcon icon={faFileText} />
                        </IconButton>
                      ) : (
                        proforma.reparaciones && proforma.reparaciones.length > 0 ? (
                          <Box>
                            {proforma.reparaciones.map((r, index) => (
                              <Box key={index} display="flex" alignItems="center" mb={0.5}>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => setDetalleReparacion({ open: true, reparacion: r })}
                                >
                                  <span style={{ fontSize: 18, fontWeight: 'bold', lineHeight: 1 }}>+</span>
                                </IconButton>
                                <Typography variant="body2" sx={{ mr: 1, fontSize: '0.8rem' }}>
                                  {r.localizacion}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          '—'
                        )
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Tooltip flotante personalizado para proformas convertidas */}
              {(() => {
                const proforma = filteredProformas.find(p => p.id === hoveredRow);
                if (!proforma || !proforma.factura) return null;
                // Usar factura_numero si existe, si no, intentar extraer el número de la factura
                let numeroFactura = '';
                if (proforma.factura_numero) {
                  numeroFactura = proforma.factura_numero;
                } else if (typeof proforma.factura === 'object' && proforma.factura !== null && 'numero_factura' in proforma.factura) {
                  numeroFactura = proforma.factura.numero_factura;
                } else if (typeof proforma.factura === 'string' && proforma.factura.match(/\d{4}\/\d{4}/)) {
                  numeroFactura = proforma.factura;
                } else {
                  numeroFactura = 'Desconocido';
                }
                return (
                  <div
                    style={{
                      position: 'fixed',
                      top: mousePos.y + 12,
                      left: mousePos.x + 12,
                      background: '#1976d2',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      zIndex: 2000,
                      pointerEvents: 'none',
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    Ya convertida en factura<br />
                    Nº factura: <b>{numeroFactura}</b>
                  </div>
                );
              })()}
      {/* Popup de detalle de reparación */}
      <Dialog
        open={detalleReparacion.open}
        onClose={() => {
          // Primero cerrar el popup
          setDetalleReparacion(prev => ({ ...prev, open: false }));
          // Luego limpiar los datos con un pequeño delay
          setTimeout(() => {
            setDetalleReparacion({ open: false, reparacion: null });
          }, 300);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalle de Reparación{Array.isArray(detalleReparacion.reparacion) && detalleReparacion.reparacion.length > 1 ? 'es' : ''}</DialogTitle>
        <DialogContent>
          {detalleReparacion.reparacion && (
            <>
              {Array.isArray(detalleReparacion.reparacion) ? (
                // Mostrar múltiples reparaciones (versión móvil)
                detalleReparacion.reparacion.map((reparacion, index) => (
                  <Box key={index} mb={3} sx={{ borderBottom: index < detalleReparacion.reparacion.length - 1 ? '1px solid #e0e0e0' : 'none', pb: index < detalleReparacion.reparacion.length - 1 ? 2 : 0 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                      Reparación {index + 1}
                    </Typography>
                    <DialogContentText>
                      <strong>Localización:</strong> {reparacion.localizacion}<br />
                      <strong>Fecha:</strong> {reparacion.fecha || '—'}<br />
                      <strong>Nº Reparación:</strong> {reparacion.num_reparacion || '—'}<br />
                      <strong>Nº Pedido:</strong> {reparacion.num_pedido || '—'}<br />
                    </DialogContentText>
                    <Box mt={2}>
                      <Typography variant="subtitle1"><strong>Trabajos:</strong></Typography>
                      {reparacion.trabajos && reparacion.trabajos.length > 0 ? (
                        <ul style={{ marginTop: 4 }}>
                          {reparacion.trabajos.map((trabajo, idx) => (
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
                  </Box>
                ))
              ) : (
                // Mostrar una sola reparación (versión desktop)
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
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              // Primero cerrar el popup
              setDetalleReparacion(prev => ({ ...prev, open: false }));
              // Luego limpiar los datos con un pequeño delay
              setTimeout(() => {
                setDetalleReparacion({ open: false, reparacion: null });
              }, 300);
            }} 
            color="primary"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
                  
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
          <Button onClick={() => setDeleteDialog({ open: false, proformaId: null })} color="inherit" disabled={deletingId !== null}>
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.proformaId)}
            color="error"
            variant="contained"
            disabled={deletingId !== null}
            startIcon={deletingId !== null ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {deletingId !== null ? 'Eliminando...' : 'Eliminar'}
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
            disabled={convertingId !== null}
          >
            {convertingId !== null ? "Guardando..." : "Convertir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo para introducir número de pedido */}
      <NumPedidoDialog
        open={numPedidoDialog.open}
        onClose={() => setNumPedidoDialog({ open: false, proformaId: null })}
        onSubmit={handleNumPedidoSubmit}
        loading={!!convertingId}
        disableClose={!!convertingId}
      />

      {/* Dialogo de envío por email */}
        <Dialog open={emailDialog.open} onClose={() => setEmailDialog({ open: false, proformaId: null })}>
          <DialogTitle>Enviar proforma por email</DialogTitle>
          <DialogContent>
            <DialogContentText>¿Deseas enviar la proforma por email?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailDialog({ open: false, proformaId: null })} color="inherit">Cancelar</Button>
            <Button
              onClick={() => handleSendEmail(emailDialog.proformaId)}
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

      {/* Dialog para mostrar estado */}
      <Dialog
        open={estadoDialog.open}
        onClose={() => setEstadoDialog({ open: false, estado: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Estado de la proforma</DialogTitle>
        <DialogContent>
          {estadoDialog.estado && (
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor:
                    (estadoDialog.estado.nombre === 'Enviada') ? '#43a047' :
                    (estadoDialog.estado.nombre === 'Aceptada') ? '#1976d2' :
                    (estadoDialog.estado.nombre === 'Creada') ? '#757575' :
                    '#bdbdbd',
                }}
              />
              <Box>
                <Typography variant="h6">{estadoDialog.estado.nombre}</Typography>
                {estadoDialog.estado.descripcion && (
                  <Typography variant="body2" color="textSecondary">
                    {estadoDialog.estado.descripcion}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstadoDialog({ open: false, estado: null })} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
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
              {proformas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 7} align="center" sx={{ py: 4 }}>
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