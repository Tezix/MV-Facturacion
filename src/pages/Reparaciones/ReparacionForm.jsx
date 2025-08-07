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

// Helper para validar archivos de imagen más estrictamente
function isValidImageFile(file) {
  // Verificar extensión del archivo
  const validExtensions = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
  const hasValidExtension = validExtensions.test(file.name);
  
  // Verificar tipo MIME (puede estar vacío en Android)
  const hasValidMimeType = file.type && file.type.startsWith('image/');
  
  // Para Android, si el tipo MIME está vacío pero la extensión es válida, aceptar
  if (isAndroid() && !hasValidMimeType && hasValidExtension) {
    console.log('Android: Aceptando archivo con extensión válida pero sin tipo MIME:', file.name);
    return true;
  }
  
  // Para otros navegadores, requerir tanto extensión como tipo MIME válidos
  return hasValidExtension && hasValidMimeType;
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API } from '../../api/axios';
import { Box, TextField, Button, Typography, CircularProgress, Autocomplete, Chip, Card, CardMedia, IconButton, Grid, useTheme, useMediaQuery } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const ReparacionForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Formato dd/MM/yyyy
  const getTodayStr = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  const [form, setForm] = useState({
    fecha: getTodayStr(),
    num_reparacion: '',
    num_pedido: '',
    factura: '',
    proforma: '',
    localizacion: '',
    comentarios: '',
  });
  const [localizaciones, setLocalizaciones] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [trabajosSeleccionadas, setTrabajosSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false); // loading de submit
  const [fetching, setFetching] = useState(true); // loading de datos iniciales
  const [fotos, setFotos] = useState([]);
  const [fotosExistentes, setFotosExistentes] = useState([]); // Fotos que ya existen en el servidor
  const [previewUrls, setPreviewUrls] = useState([]); // URLs de vista previa para fotos nuevas
  
  const [dataLoaded, setDataLoaded] = useState(false); // Nueva flag para controlar si los datos ya fueron cargados
  
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Si volvemos desde crear Trabajo, agregarlo y restaurar estado
  useEffect(() => {
    if (location.state?.nuevaTrabajo) {
      const newTrabajo = location.state.nuevaTrabajo;
      
      // Cargar datos necesarios primero
      const loadData = async () => {
        const [localizacionesRes, trabajosRes] = await Promise.all([
          API.get('localizaciones_reparaciones/'),
          API.get('trabajos/')
        ]);
        
        // Establecer los datos base primero
        setLocalizaciones(localizacionesRes.data);
        
        // Agregar el nuevo trabajo a la lista si no existe ya
        const trabajosActualizados = trabajosRes.data.some(trabajo => trabajo.id === newTrabajo.id) 
          ? trabajosRes.data 
          : [...trabajosRes.data, newTrabajo];
        setTrabajos(trabajosActualizados);
        
        // Ahora restaurar estado del formulario y trabajos seleccionados
        if (location.state.reparacionFormState) {
          setForm(location.state.reparacionFormState.form);
          setFotos(location.state.reparacionFormState.fotos);
          
          // Restaurar trabajos seleccionados y agregar el nuevo
          const trabajosPrevios = location.state.reparacionFormState.trabajosSeleccionadas || [];
          const exists = trabajosPrevios.some(trabajo => trabajo.id === newTrabajo.id);
          const trabajosFinales = exists ? trabajosPrevios : [...trabajosPrevios, newTrabajo];
          setTrabajosSeleccionadas(trabajosFinales);
        } else {
          // Si no hay estado previo, solo agregar el nuevo trabajo
          setTrabajosSeleccionadas([newTrabajo]);
        }
        
        setFetching(false);
        setDataLoaded(true); // Marcar que los datos ya fueron cargados
      };
      
      loadData();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);


  useEffect(() => {
    // No ejecutar si venimos de crear un trabajo O si los datos ya fueron cargados
    if (location.state?.nuevaTrabajo || dataLoaded) {
      return;
    }
    
    let isMounted = true;
    setFetching(true);
    const fetchAll = async () => {
      try {
        let reparacion = null;
        if (id) {
          // Cargar la reparación específica
          const reparacionRes = await API.get(`reparaciones/${id}/`);
          reparacion = reparacionRes.data;
        }
        const [localizacionesRes, trabajosRes] = await Promise.all([
          API.get('localizaciones_reparaciones/'),
          API.get('trabajos/')
        ]);
        if (!isMounted) return;
        setLocalizaciones(localizacionesRes.data);
        setTrabajos(trabajosRes.data);
        if (reparacion) {
          setForm((prev) => ({
            ...prev,
            fecha: reparacion.fecha,
            num_reparacion: reparacion.num_reparacion,
            num_pedido: reparacion.num_pedido,
            factura: reparacion.factura,
            proforma: reparacion.proforma,
            localizacion: reparacion.localizacion.id,
            localizacionInput: `${reparacion.localizacion.direccion}, ${reparacion.localizacion.numero} ${reparacion.localizacion.ascensor || ''} ${reparacion.localizacion.escalera || ''}, ${reparacion.localizacion.localidad}`,
            comentarios: reparacion.comentarios || '',
          }));
          // Establecer trabajos seleccionados desde trabajos_reparaciones
          const trabajosSeleccionados = reparacion.trabajos_reparaciones.map(tr => tr.trabajo);
          setTrabajosSeleccionadas(trabajosSeleccionados);
          // Establecer fotos existentes si las hay
          if (reparacion.fotos && reparacion.fotos.length > 0) {
            // Las fotos ya vienen con el formato correcto: { id, foto_url }
            setFotosExistentes(reparacion.fotos);
            // Guardar una copia para detectar cambios
            setForm(prev => ({ ...prev, fotosOriginales: [...reparacion.fotos] }));
          }
        } else {
          // Si es creación, setear fecha a hoy (por si el usuario vuelve a la página)
          setForm((prev) => ({ ...prev, fecha: getTodayStr() }));
        }
      } finally {
        if (isMounted) setFetching(false);
      }
    };
    fetchAll();
    return () => { isMounted = false; };
  }, [id, location.state?.nuevaTrabajo, dataLoaded]);

  // Si volvemos de crear una localización, seleccionarla automáticamente
  useEffect(() => {
    if (location.state && location.state.nuevaLocalizacionId) {
      setForm((prev) => ({ ...prev, localizacion: location.state.nuevaLocalizacionId }));
    }
  }, [location.state]);

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    console.log('=== DEBUG INFO ===');
    console.log('Archivos seleccionados:', selectedFiles.length);
    console.log('Dispositivo Android detectado:', isAndroid());
    console.log('User Agent:', navigator.userAgent);
    console.log('=================');
    
    // Convertir FileList a Array y validar cada archivo
    const newFiles = Array.from(selectedFiles).filter(file => {
      console.log('Procesando archivo:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        constructor: file.constructor.name
      });
      
      // Usar la función de validación mejorada
      if (!isValidImageFile(file)) {
        console.warn('Archivo no válido:', file.name, 'tipo:', file.type);
        alert(`El archivo ${file.name} no parece ser una imagen válida.`);
        return false;
      }
      
      // Validar tamaño (máximo 10MB por archivo)
      if (file.size > 10 * 1024 * 1024) {
        console.warn('Archivo muy grande:', file.name, 'tamaño:', file.size);
        alert(`El archivo ${file.name} es muy grande. Máximo 10MB por archivo.`);
        return false;
      }
      
      // Validar que el archivo no esté vacío
      if (file.size === 0) {
        console.warn('Archivo vacío:', file.name);
        alert(`El archivo ${file.name} está vacío.`);
        return false;
      }
      
      return true;
    });
    
    if (newFiles.length === 0) {
      console.log('No hay archivos válidos para procesar');
      e.target.value = '';
      return;
    }
    
    console.log('Archivos válidos procesados:', newFiles.length);
    
    // Agregar las nuevas fotos a las existentes en lugar de reemplazarlas
    const updatedFotos = [...fotos, ...newFiles];
    setFotos(updatedFotos);
    
    // Crear URLs de vista previa para las nuevas fotos de forma segura
    const newPreviewUrls = [];
    newFiles.forEach((file) => {
      try {
        // Verificar que el archivo sea válido antes de crear la URL
        if (file && file.size > 0) {
          const url = URL.createObjectURL(file);
          newPreviewUrls.push(url);
          console.log(`URL creada exitosamente para ${file.name}`);
        } else {
          console.warn('Archivo inválido o vacío:', file);
          newPreviewUrls.push(null);
        }
      } catch (error) {
        console.error('Error creando URL de vista previa para:', file.name, error);
        // En Android, a veces fallan las URLs pero el archivo es válido
        if (isAndroid()) {
          console.log('Intentando fallback para Android...');
          newPreviewUrls.push(null); // Permitir null pero continuar
        } else {
          newPreviewUrls.push(null);
        }
      }
    });
    
    // Agregar las nuevas URLs a las existentes
    const updatedPreviewUrls = [...previewUrls, ...newPreviewUrls];
    setPreviewUrls(updatedPreviewUrls);
    
    // Limpiar el input para permitir seleccionar los mismos archivos otra vez si es necesario
    e.target.value = '';
  };

  const handleRemoveFoto = (index) => {
    const newFotos = fotos.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Limpiar la URL que se está eliminando
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setFotos(newFotos);
    setPreviewUrls(newPreviewUrls);
  };

  const handleRemoveFotoExistente = async (index) => {
    const fotoToDelete = fotosExistentes[index];
    
    try {
      // Si la foto tiene un ID real, eliminarla del servidor
      if (fotoToDelete.id && !fotoToDelete.id.toString().startsWith('temp-')) {
        // Eliminar la foto directamente usando el ID de la reparación
        await API.delete(`reparaciones/${id}/fotos/${fotoToDelete.id}/`);
      }
      
      // Actualizar el estado local
      const newFotosExistentes = fotosExistentes.filter((_, i) => i !== index);
      setFotosExistentes(newFotosExistentes);
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      alert('Error al eliminar la foto');
    }
  };

  const handleClearAllNewFotos = () => {
    // Limpiar todas las URLs de vista previa
    previewUrls.forEach(url => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    });
    setFotos([]);
    setPreviewUrls([]);
  };

  // Limpiar URLs al desmontar el componente
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveReparacionAndNavigate = async () => {
    // Validar que hay una localización seleccionada
    if (!form.localizacion) {
      alert('Debes seleccionar una localización antes de crear un trabajo.');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      // Append form fields
      formData.append('fecha', form.fecha);
      if (form.num_reparacion) formData.append('num_reparacion', form.num_reparacion);
      if (form.num_pedido) formData.append('num_pedido', form.num_pedido);
      if (form.factura) formData.append('factura', form.factura);
      if (form.proforma) formData.append('proforma', form.proforma);
      formData.append('localizacion_id', form.localizacion);
      if (form.comentarios) formData.append('comentarios', form.comentarios);
      // Append trabajos
      trabajosSeleccionadas.forEach(t => formData.append('trabajos', t.id));
      // Append fotos nuevas con validación
      console.log('Agregando fotos al FormData (saveReparacionAndNavigate):', fotos.length);
      fotos.forEach((file, index) => {
        if (file && file instanceof File) {
          console.log(`Foto ${index + 1}:`, file.name, 'tamaño:', file.size, 'tipo:', file.type);
          formData.append('fotos', file);
        } else {
          console.error(`Foto ${index + 1} no es válida:`, file);
        }
      });
      
      let nuevaReparacionId = null;
      
      if (id) {
        // EDICIÓN: Actualizar reparación existente
        // SIEMPRE enviar fotos_a_mantener para indicar qué fotos mantener
        const fotosIdsAMantener = fotosExistentes.map(foto => foto.id).filter(id => id);
        formData.append('fotos_a_mantener', fotosIdsAMantener.join(','));
        
        await API.patch(`reparaciones/${id}/`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        nuevaReparacionId = id;
      } else {
        // CREACIÓN: Crear nueva reparación
        const res = await API.post('reparaciones/', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        nuevaReparacionId = res.data.id;
      }

      // Navegar a crear trabajo
      navigate('/trabajos/crear', {
        state: {
          fromReparacion: true,
          reparacionId: nuevaReparacionId,
          reparacionFormState: { 
            form, 
            trabajosSeleccionadas, 
            fotos 
          }
        }
      });
    } catch (error) {
      console.error('Error al guardar reparación (saveReparacionAndNavigate):', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      let errorMessage = 'Error al guardar la reparación';
      if (error.response?.data) {
        errorMessage += ': ' + JSON.stringify(error.response.data);
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      // Append form fields
      formData.append('fecha', form.fecha);
      if (form.num_reparacion) formData.append('num_reparacion', form.num_reparacion);
      if (form.num_pedido) formData.append('num_pedido', form.num_pedido);
      if (form.factura) formData.append('factura', form.factura);
      if (form.proforma) formData.append('proforma', form.proforma);
      formData.append('localizacion_id', form.localizacion);
      if (form.comentarios) formData.append('comentarios', form.comentarios);
      // Append trabajos
      trabajosSeleccionadas.forEach(t => formData.append('trabajos', t.id));
      // Append fotos nuevas con validación
      console.log('Agregando fotos al FormData (handleSubmit):', fotos.length);
      fotos.forEach((file, index) => {
        if (file && file instanceof File) {
          console.log(`Foto ${index + 1}:`, {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          });
          
          // Validación adicional para Android
          if (file.size === 0) {
            console.error(`Foto ${index + 1} tiene tamaño 0, omitiendo:`, file.name);
            return;
          }
          
          // Para Android, a veces el tipo viene vacío, intentar inferirlo del nombre
          if (!file.type && file.name) {
            const extension = file.name.split('.').pop().toLowerCase();
            console.log(`Tipo MIME vacío para ${file.name}, extensión detectada:`, extension);
          }
          
          formData.append('fotos', file, file.name);
        } else {
          console.error(`Foto ${index + 1} no es válida:`, file);
        }
      });
      
      let nuevaReparacionId = null;
      let isCreacion = false;
      
      if (id) {
        // EDICIÓN: Actualizar reparación existente
        // SIEMPRE enviar fotos_a_mantener para indicar qué fotos mantener
        const fotosIdsAMantener = fotosExistentes.map(foto => foto.id).filter(id => id);
        formData.append('fotos_a_mantener', fotosIdsAMantener.join(','));
        
        await API.patch(`reparaciones/${id}/`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        nuevaReparacionId = id;
      } else {
        // CREACIÓN: Crear nueva reparación
        const res = await API.post('reparaciones/', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        isCreacion = true;
        nuevaReparacionId = res.data.id;
      }
      
      // Si venimos de una factura o proforma, volver y pasar el id de la nueva reparación
      if (location.state && location.state.fromFactura && location.state.facturaId) {
        navigate(`/facturas/editar/${location.state.facturaId}`, {
          state: { nuevaReparacionId: nuevaReparacionId }
        });
      } else if (location.state && location.state.fromProforma && location.state.proformaId) {
        navigate(`/proformas/editar/${location.state.proformaId}`, {
          state: { nuevaReparacionId: nuevaReparacionId }
        });
      } else {
        // Pasar mensaje de éxito a la lista tras crear o editar
        if (isCreacion) {
          navigate('/reparaciones', { state: { snackbar: { open: true, message: 'Reparación creada correctamente', severity: 'success' } } });
        } else {
          navigate('/reparaciones', { state: { snackbar: { open: true, message: 'Reparación actualizada correctamente', severity: 'success' } } });
        }
      }
    } catch (error) {
      console.error('Error al guardar reparación (handleSubmit):', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('User Agent:', navigator.userAgent);
      console.error('Es Android:', isAndroid());
      
      let errorMessage = 'Error al guardar la reparación';
      
      // Manejo específico de errores comunes
      if (error.response?.status === 413) {
        errorMessage = 'Las fotos son demasiado grandes. Intenta con imágenes más pequeñas.';
      } else if (error.response?.status === 415) {
        errorMessage = 'Formato de archivo no soportado. Usa JPG, PNG o WEBP.';
      } else if (error.response?.data) {
        // Mostrar errores específicos del servidor
        if (typeof error.response.data === 'object') {
          const errorDetails = Object.entries(error.response.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              }
              return `${field}: ${messages}`;
            })
            .join('; ');
          errorMessage += ': ' + errorDetails;
        } else {
          errorMessage += ': ' + error.response.data;
        }
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      // Para Android, agregar sugerencias específicas
      if (isAndroid()) {
        errorMessage += '\n\nSi tienes problemas subiendo fotos desde Android, intenta:\n- Reducir el tamaño de las imágenes\n- Subir las fotos de una en una\n- Usar la cámara del navegador en lugar de seleccionar desde galería';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching || (id && !form.fecha)) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: isMobile ? 2 : 3,
          width: isMobile ? '95vw' : '70vw',
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? 2 : 3,
        }}
      >
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
          {id ? 'Editar' : 'Crear'} Reparacion
        </Typography>

        <Box display="flex" alignItems="center" gap={1} sx={{ 
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Box flex={1} sx={{ width: '100%' }}>
            <Autocomplete
              options={localizaciones}
              getOptionLabel={(option) =>
                option && typeof option === 'object'
                  ? `${option.direccion}, ${option.numero}, Esc ${option.escalera || ''} Asc ${option.ascensor || ''}, ${option.localidad}`
                  : (typeof option === 'string' ? option : '')
              }
              value={
                localizaciones.find((loc) => loc.id === form.localizacion) || null
              }
              onChange={(_, newValue) => {
                setForm((prev) => ({
                  ...prev,
                  localizacion: newValue ? newValue.id : '',
                  localizacionInput: newValue && typeof newValue === 'object'
                    ? `${newValue.direccion}, ${newValue.numero}, Esc ${newValue.escalera || ''} Asc ${newValue.ascensor || ''}, ${newValue.localidad}`
                    : prev.localizacionInput
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Localización"
                  required
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              inputValue={form.localizacionInput || ''}
              onInputChange={(_, newInputValue) => {
                setForm((prev) => ({ ...prev, localizacionInput: newInputValue }));
              }}
              freeSolo
            />
          </Box>
          <Button
            variant="outlined"
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              minWidth: isMobile ? '100%' : 'auto',
              mt: isMobile ? 1 : 0
            }}
            onClick={() => {
              // Usar la ruta correcta para crear localización
              const direccion = form.localizacionInput || '';
              // Si venimos de una factura o proforma, pasar también ese seguimiento
              let extraState = { fromReparacion: true, reparacionId: id };
              if (location.state && location.state.fromFactura && location.state.facturaId) {
                extraState = {
                  ...extraState,
                  fromFactura: true,
                  facturaId: location.state.facturaId,
                  returnTo: location.state.returnTo || undefined
                };
              } else if (location.state && location.state.fromProforma && location.state.proformaId) {
                extraState = {
                  ...extraState,
                  fromProforma: true,
                  proformaId: location.state.proformaId,
                  returnTo: location.state.returnTo || undefined
                };
              }
              navigate(`/localizaciones/crear?direccion=${encodeURIComponent(direccion)}`, {
                state: extraState
              });
            }}
          >
            Nueva
          </Button>
        </Box>

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
          name="num_reparacion"
          label="Nº Reparación"
          value={form.num_reparacion || ''}
          onChange={handleChange}
          fullWidth
          size={isMobile ? "small" : "medium"}
        />

        <TextField
          name="num_pedido"
          label="Nº Pedido"
          value={form.num_pedido || ''}
          onChange={handleChange}
          fullWidth
          size={isMobile ? "small" : "medium"}
        />

        <Box display="flex" alignItems="center" gap={1} sx={{ 
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Box flex={1} sx={{ width: '100%' }}>
            <Autocomplete
              multiple
              options={trabajos}
              getOptionLabel={(option) => option.nombre_reparacion}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    {option.nombre_reparacion}
                    {option.especial && <StarIcon color="warning" fontSize="small" sx={{ ml: 1 }} />}
                  </li>
                );
              }}
              value={trabajosSeleccionadas}
              onChange={(_, newValue) => setTrabajosSeleccionadas(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...otherProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...otherProps}
                      icon={option.especial ? <StarIcon color="warning" /> : undefined}
                      label={option.nombre_reparacion}
                      size={isMobile ? "small" : "medium"}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Trabajos" 
                  placeholder="Selecciona trabajos" 
                  fullWidth 
                  size={isMobile ? "small" : "medium"}
                />
              )}
            />
          </Box>
          <Button
            variant="outlined"
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{ 
              minWidth: isMobile ? '100%' : 'auto',
              mt: isMobile ? 1 : 0
            }}
            onClick={saveReparacionAndNavigate}
            disabled={loading}
          >
            Nuevo
          </Button>
        </Box>

        <TextField
          name="comentarios"
          label="Comentarios"
          value={form.comentarios || ''}
          onChange={handleChange}
          fullWidth
          multiline
          minRows={isMobile ? 2 : 2}
          maxRows={isMobile ? 4 : 6}
          size={isMobile ? "small" : "medium"}
        />

        <Box display="flex" alignItems="center" gap={2} mt={2} sx={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <Button variant="outlined" component="label" size={isMobile ? "small" : "medium"}>
            Subir fotos
            <input 
              hidden 
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/*" 
              multiple 
              type="file" 
              onChange={handleFileChange}
            />
          </Button>
          
          {fotos.length > 0 && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: isMobile ? '0.75rem' : 'inherit',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                {fotos.length} foto{fotos.length !== 1 ? 's' : ''} nueva{fotos.length !== 1 ? 's' : ''} seleccionada{fotos.length !== 1 ? 's' : ''}
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                size="small"
                onClick={handleClearAllNewFotos}
              >
                Limpiar nuevas
              </Button>
            </>
          )}
        </Box>
        
        {(fotosExistentes.length > 0 || fotos.length > 0) && (
          <Box mt={2}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
              Fotos de la reparación ({fotosExistentes.length + fotos.length} total{fotosExistentes.length + fotos.length !== 1 ? 'es' : ''})
            </Typography>
            <Grid container spacing={isMobile ? 1 : 2}>
              {/* Mostrar fotos existentes */}
              {fotosExistentes.map((foto, idx) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={`existente-${foto.id || idx}`}>
                  <Card sx={{ 
                    position: 'relative', 
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 2
                  }}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "150" : "200"}
                      image={foto.foto_url}
                      alt={`Foto existente ${idx + 1}`}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Error cargando imagen:', foto.foto_url);
                        e.target.style.display = 'none';
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      onClick={() => handleRemoveFotoExistente(idx)}
                      size="small"
                    >
                      <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <Box p={isMobile ? 0.5 : 1}>
                      <Typography variant="caption" display="block" noWrap color="primary" sx={{
                        fontSize: isMobile ? '0.65rem' : 'inherit'
                      }}>
                        📷 Existente {idx + 1}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
              
              {/* Mostrar fotos nuevas */}
              {fotos.map((file, idx) => (
                <Grid item xs={6} sm={6} md={4} lg={3} key={`nueva-${idx}`}>
                  <Card sx={{ 
                    position: 'relative', 
                    border: '2px solid',
                    borderColor: 'success.main',
                    borderRadius: 2
                  }}>
                    <CardMedia
                      component="img"
                      height={isMobile ? "150" : "200"}
                      image={previewUrls[idx]}
                      alt={file.name}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Error cargando vista previa:', previewUrls[idx], 'para archivo:', file.name);
                        e.target.style.display = 'none';
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                      onClick={() => handleRemoveFoto(idx)}
                      size="small"
                    >
                      <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                    <Box p={isMobile ? 0.5 : 1}>
                      <Typography variant="caption" display="block" noWrap color="success.main" sx={{
                        fontSize: isMobile ? '0.65rem' : 'inherit'
                      }}>
                        🆕 {file.name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={loading} 
          size={isMobile ? "medium" : "large"}
          sx={{ 
            mt: 3,
            minHeight: isMobile ? 40 : 48,
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}
        >
          {loading ? <CircularProgress size={isMobile ? 20 : 24} /> : id ? 'Actualizar' : 'Crear'}
        </Button>
      </Box>
      {/* Snackbar eliminado, ahora se muestra en la lista */}
    </>
  );
};

export default ReparacionForm;