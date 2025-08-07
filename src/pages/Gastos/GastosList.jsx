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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEllipsisV, faPencilAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import LoadingOverlay from '../../components/LoadingOverlay';

export default function GastosList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nombre: '',
    tipo: '',
    estado: '',
    fecha: '',
    precio: '',
  });
  const [deleting, setDeleting] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuGasto, setMenuGasto] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, gastoId: null });
  const [estadoDialog, setEstadoDialog] = useState({ open: false, estado: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    API.get('gastos/')
      .then((res) => setGastos(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleMenuOpen = (event, gasto) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuGasto(gasto);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuGasto(null);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await API.delete(`gastos/${id}/`);
      setGastos(gastos.filter((g) => g.id !== id));
      setSnackbar({ open: true, message: 'Gasto eliminado correctamente', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar el gasto', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, gastoId: null });
      setDeleting(false);
    }
  };

  // Filtrado local
  const filteredGastos = gastos.filter(g => {
    if (filters.nombre && !(g.nombre || '').toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    if (filters.tipo && !(g.tipo || '').toLowerCase().includes(filters.tipo.toLowerCase())) return false;
    if (filters.estado && !(String(g.estado || '').toLowerCase().includes(filters.estado.toLowerCase()))) return false;
    if (filters.fecha && !(g.fecha || '').toLowerCase().includes(filters.fecha.toLowerCase())) return false;
    if (filters.precio && !(String(g.precio || '').toLowerCase().includes(filters.precio.toLowerCase()))) return false;
    return true;
  });

  return (
    <LoadingOverlay loading={loading}>
      <Box p={isMobile ? 1 : 3} sx={{ overflowX: 'hidden' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} sx={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0
        }}>
          <Typography variant={isMobile ? "h5" : "h4"} sx={{ mb: isMobile ? 1 : 0 }}>Gastos</Typography>
          <Button
            variant="contained"
            color="success"
            component={Link}
            to="/gastos/registrar/nuevo"
            startIcon={<span style={{fontSize: 20, fontWeight: 'bold', lineHeight: 1}}>+</span>}
            size={isMobile ? "small" : "medium"}
          >
            Nuevo
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
                <TableCell sx={{ minWidth: isMobile ? 70 : 120, padding: isMobile ? '4px 2px' : '4px 2px' }}>
                  <TextField
                    label="Nombre"
                    name="nombre"
                    value={filters.nombre}
                    onChange={e => setFilters(f => ({ ...f, nombre: e.target.value }))}
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
                  <TableCell sx={{ minWidth: 90, padding: '4px 2px' }}>
                    <TextField
                      label="Tipo"
                      name="tipo"
                      value={filters.tipo}
                      onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))}
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
                <TableCell sx={{ minWidth: isMobile ? 35 : 105, fontSize: isMobile ? '0.75rem' : 'inherit', padding: isMobile ? '4px 1px' : '4px 2px' }}>
                  {isMobile ? 'Pre' : (
                    <TextField
                      label="Precio"
                      name="precio"
                      value={filters.precio}
                      onChange={e => setFilters(f => ({ ...f, precio: e.target.value }))}
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
                <TableCell sx={{ minWidth: isMobile ? 30 : 50, fontSize: isMobile ? '0.75rem' : 'inherit', padding: isMobile ? '4px 1px' : '4px 2px' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell sx={{ minWidth: isMobile ? 35 : 45, padding: isMobile ? '4px 2px' : '4px 2px' }}>
                    <Tooltip title="Acciones">
                      <IconButton size="small" onClick={e => handleMenuOpen(e, gasto)}>
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl) && menuGasto === gasto}
                      onClose={handleMenuClose}
                    >
                      <MenuItem component={Link} to={`/gastos/editar/${gasto.id}`} onClick={handleMenuClose}>
                        <ListItemIcon><FontAwesomeIcon icon={faPencilAlt} /></ListItemIcon>
                        <ListItemText>Editar</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => { setDeleteDialog({ open: true, gastoId: gasto.id }); handleMenuClose(); }}>
                        <ListItemIcon><FontAwesomeIcon icon={faTrash} /></ListItemIcon>
                        <ListItemText>Eliminar</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell sx={{ 
                    minWidth: isMobile ? 70 : 120,
                    fontSize: isMobile ? '0.65rem' : 'inherit',
                    wordBreak: 'break-word',
                    maxWidth: isMobile ? 70 : 'none',
                    padding: isMobile ? '4px 2px' : '4px 2px'
                  }}>{gasto.nombre}</TableCell>
                  {!isMobile && (
                    <TableCell sx={{ minWidth: 90, fontSize: '0.9rem', padding: '4px 2px' }}>{gasto.tipo}</TableCell>
                  )}
                  <TableCell sx={{ minWidth: isMobile ? 35 : 85, padding: isMobile ? '4px 1px' : '4px 2px' }}>
                    {isMobile ? (
                      <IconButton 
                        onClick={() => setEstadoDialog({ 
                          open: true, 
                          estado: {
                            nombre: gasto.estado,
                            descripcion: ''
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
                              (gasto.estado === 'Pagada') ? '#1976d2' :
                              (gasto.estado === 'Enviada') ? '#43a047' :
                              (gasto.estado === 'Pendiente de pago' || gasto.estado === 'pendiente de pago') ? '#ff9800' :
                              '#bdbdbd',
                          }}
                        />
                      </IconButton>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: 12,
                          color: '#fff',
                          fontWeight: 600,
                          backgroundColor:
                            (gasto.estado === 'Pagada') ? '#1976d2' :
                            (gasto.estado === 'Enviada') ? '#43a047' :
                            (gasto.estado === 'Pendiente de pago' || gasto.estado === 'pendiente de pago') ? '#ff9800' :
                            '#bdbdbd',
                        }}
                      >
                        {Array.isArray(gasto.estado) ? gasto.estado.join(', ') : gasto.estado}
                      </span>
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ minWidth: 90, fontSize: '0.9rem', padding: '4px 2px' }}>{gasto.fecha}</TableCell>
                  )}
                  <TableCell sx={{ minWidth: isMobile ? 35 : 105, padding: isMobile ? '4px 1px' : '4px 2px', fontSize: isMobile ? '0.7rem' : 'inherit' }}>{
                    Number(gasto.precio) % 1 === 0
                      ? Number(gasto.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : Number(gasto.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  }</TableCell>
                  <TableCell sx={{ minWidth: isMobile ? 30 : 50, padding: isMobile ? '4px 1px' : '4px 2px' }}>
                    {gasto.archivo ? (
                      <Tooltip title="Ver archivo">
                        <a href={gasto.archivo} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                          <FontAwesomeIcon icon={faFileAlt} size="lg" />
                        </a>
                      </Tooltip>
                    ) : ''}
                  </TableCell>
                </TableRow>
              ))}
              {filteredGastos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 5 : 7} align="center" sx={{ py: 4 }}>
                    No hay gastos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
        {/* Dialog de confirmación de borrado */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, gastoId: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, gastoId: null })} color="inherit" disabled={deleting}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleDelete(deleteDialog.gastoId)}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
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
          <DialogTitle>Estado del gasto</DialogTitle>
          <DialogContent>
            {estadoDialog.estado && (
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor:
                      (estadoDialog.estado.nombre === 'Pagada') ? '#1976d2' :
                      (estadoDialog.estado.nombre === 'Enviada') ? '#43a047' :
                      (estadoDialog.estado.nombre === 'Pendiente de pago' || estadoDialog.estado.nombre === 'pendiente de pago') ? '#ff9800' :
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
        {/* Snackbar para mensajes de éxito/error */}
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
