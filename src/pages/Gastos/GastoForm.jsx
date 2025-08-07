// Helpers para formato dd/MM/yyyy
function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [yyyy, mm, dd] = fechaStr.split('-');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
    const [dd, mm, yyyy] = fechaStr.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date(fechaStr);
}

function formatFecha(date) {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Helper para detectar Android
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

// Helper para validar archivos (tanto documentos como imágenes)
function isValidFile(file) {
  // Extensiones válidas para documentos e imágenes
  const validExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|pdf|doc|docx|xls|xlsx|txt|zip|rar)$/i;
  const hasValidExtension = validExtensions.test(file.name);
  
  // Verificar tipo MIME
  const validMimeTypes = [
    'image/', 'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/zip', 'application/x-rar-compressed'
  ];
  const hasValidMimeType = file.type && validMimeTypes.some(type => file.type.startsWith(type));
  
  // Para Android, si el tipo MIME está vacío pero la extensión es válida, aceptar
  if (isAndroid() && !hasValidMimeType && hasValidExtension) {
    console.log('Android: Aceptando archivo con extensión válida pero sin tipo MIME:', file.name);
    return true;
  }
  
  // Para otros navegadores, requerir tanto extensión como tipo MIME válidos
  return hasValidExtension && hasValidMimeType;
}
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../api/axios';


import {
  Box, Button, TextField, Typography, MenuItem, InputLabel, Select, FormControl, Paper, Alert, useMediaQuery, useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';


// Los tipos y estados se obtendrán dinámicamente del backend

export default function GastoForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const { id } = useParams();
  // Fecha predeterminada: hoy (dd/MM/yyyy)
  const today = formatFecha(new Date());
  const [form, setForm] = useState({
    nombre: '',
    tipo: '',
    estado: '',
    fecha: today,
    descripcion: '',
    precio: '',
    archivo: null,
  });
  const [archivoUrl, setArchivoUrl] = useState(null);
  const [archivoPreview, setArchivoPreview] = useState(null); // Para vista previa de imágenes
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'archivo' && files && files[0]) {
      const file = files[0];
      
      // Validar archivo
      if (!isValidFile(file)) {
        setError('Por favor, selecciona un archivo válido (imagen, PDF, documento de oficina, etc.)');
        return;
      }
      
      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));
      
      // Si el usuario selecciona un nuevo archivo, ya no mostramos el anterior
      setArchivoUrl(null);
      
      // Crear vista previa si es una imagen
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setArchivoPreview(previewUrl);
      } else {
        setArchivoPreview(null);
      }
      
      setError(''); // Limpiar errores previos
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleClearArchivo = () => {
    setForm((prev) => ({ ...prev, archivo: null }));
    if (archivoPreview) {
      URL.revokeObjectURL(archivoPreview);
      setArchivoPreview(null);
    }
  };

  // Limpiar URLs al desmontar el componente
  useEffect(() => {
    return () => {
      if (archivoPreview) {
        URL.revokeObjectURL(archivoPreview);
      }
    };
  }, [archivoPreview]);

  const toIsoDate = (fechaStr) => {
    // Convierte dd/MM/yyyy o Date a yyyy-MM-dd
    if (!fechaStr) return '';
    if (fechaStr instanceof Date) {
      const yyyy = fechaStr.getFullYear();
      const mm = String(fechaStr.getMonth() + 1).padStart(2, '0');
      const dd = String(fechaStr.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
      const [dd, mm, yyyy] = fechaStr.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      return fechaStr;
    }
    // fallback
    return fechaStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'archivo' && !v) return;
      if (k === 'fecha' && v) {
        data.append('fecha', toIsoDate(v));
      } else if (v !== null && v !== '' && k !== 'fecha') {
        data.append(k, v);
      }
    });
    try {
      if (id) {
        await API.patch(`/gastos/${id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate('/gastos/registrar', { state: { success: 'Gasto actualizado correctamente' } });
      } else {
        await API.post('/gastos/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate('/gastos/registrar', { state: { success: 'Gasto registrado correctamente' } });
      }
    } catch {
      setError('Error al guardar el gasto');
    }
  };

  // Obtener tipos y estados del backend al montar
  useEffect(() => {
    API.get('gastos/choices/').then(res => {
      setTipos(res.data.tipos || []);
      setEstados(res.data.estados || []);
    });
  }, []);

  // Autorrellenar si estamos editando
  useEffect(() => {
    if (id) {
      API.get(`/gastos/${id}/`).then(res => {
        const gasto = res.data;
        setForm({
          nombre: gasto.nombre || '',
          tipo: gasto.tipo || '',
          estado: gasto.estado || '',
          fecha: gasto.fecha || '',
          descripcion: gasto.descripcion || '',
          precio: gasto.precio || '',
          archivo: null, // No prellenar el input file
        });
        setArchivoUrl(gasto.archivo || null);
      });
    }
  }, [id]);

  return (
    <Box sx={{ 
      maxWidth: isMobile ? '95vw' : 500, 
      mx: 'auto', 
      mt: isMobile ? 2 : 6,
      px: isMobile ? 1 : 0
    }}>
      <Paper sx={{ p: isMobile ? 2 : 3 }}>
        <Typography variant={isMobile ? "h6" : "h5"} mb={2}>{id ? 'Editar Gasto' : 'Registrar Gasto'}</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            size={isMobile ? "small" : "medium"}
          />
          <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="tipo"
              value={form.tipo}
              label="Tipo"
              onChange={handleChange}
              required
            >
              {tipos.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" size={isMobile ? "small" : "medium"}>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={form.estado}
              label="Estado"
              onChange={handleChange}
              required
            >
              {estados.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha"
              value={form.fecha ? parseFecha(form.fecha) : null}
              onChange={newValue => {
                setForm(f => ({ ...f, fecha: newValue ? formatFecha(newValue) : '' }));
              }}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  margin: 'normal',
                  size: isMobile ? "small" : "medium",
                  InputLabelProps: { shrink: true },
                  inputProps: {
                    style: { cursor: 'pointer' },
                    readOnly: true,
                  },
                },
              }}
            />
          </LocalizationProvider>
          <TextField
            label="Precio"
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            size={isMobile ? "small" : "medium"}
            inputProps={{ step: '0.01' }}
          />
          <TextField
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            fullWidth
            margin="normal"
            size={isMobile ? "small" : "medium"}
            multiline
            rows={isMobile ? 2 : 2}
            maxRows={isMobile ? 4 : 6}
          />
          {archivoUrl && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Archivo actual:
              </Typography>
              <a href={archivoUrl} target="_blank" rel="noopener noreferrer">Ver archivo actual</a>
            </Box>
          )}
          
          {/* Sección de subida de archivos mejorada */}
          <Box display="flex" alignItems="center" gap={2} mt={2} sx={{
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            <Button 
              variant="outlined" 
              component="label" 
              size={isMobile ? "small" : "medium"}
              sx={{ minWidth: isMobile ? '100%' : 'auto' }}
            >
              {form.archivo ? 'Cambiar archivo/foto' : (archivoUrl ? 'Actualizar archivo/foto' : 'Subir archivo/foto')}
              <input
                type="file"
                name="archivo"
                hidden
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                onChange={handleChange}
              />
            </Button>
            
            {form.archivo && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: isMobile ? '0.75rem' : 'inherit',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  {form.archivo.name}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={handleClearArchivo}
                >
                  Quitar
                </Button>
              </>
            )}
          </Box>
          
          {/* Vista previa de imagen */}
          {archivoPreview && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Vista previa:
              </Typography>
              <Box
                component="img"
                src={archivoPreview}
                alt="Vista previa"
                sx={{
                  maxWidth: '100%',
                  maxHeight: isMobile ? 200 : 300,
                  objectFit: 'contain',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                }}
              />
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            fullWidth
            size={isMobile ? "medium" : "large"}
          >
            {id ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
