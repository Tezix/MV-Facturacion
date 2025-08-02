import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API } from '../../api/axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const ReparacionForm = () => {
  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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
  // Eliminado Snackbar local, ahora se maneja en la lista

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    setFetching(true);
    const fetchAll = async () => {
      try {
        let grupo = null;
        if (id) {
          // Buscar el grupo correspondiente en el endpoint agrupado
          const grupos = await API.get('reparaciones/agrupados/').then(res => res.data);
          grupo = grupos.find(g => g.reparacion_ids.includes(Number(id)));
        }
        const [localizacionesRes, trabajosRes] = await Promise.all([
          API.get('localizaciones_reparaciones/'),
          API.get('trabajos/')
        ]);
        if (!isMounted) return;
        setLocalizaciones(localizacionesRes.data);
        setTrabajos(trabajosRes.data);
        if (grupo) {
          setForm((prev) => ({
            ...prev,
            fecha: grupo.fecha,
            num_reparacion: grupo.num_reparacion,
            num_pedido: grupo.num_pedido,
            factura: grupo.factura,
            proforma: grupo.proforma,
            localizacion: grupo.localizacion.id,
            localizacionInput: `${grupo.localizacion.direccion}, ${grupo.localizacion.numero} ${grupo.localizacion.ascensor || ''} ${grupo.localizacion.escalera || ''}, ${grupo.localizacion.localidad}`,
            comentarios: grupo.comentarios || '',
          }));
          setTrabajosSeleccionadas(grupo.trabajos);
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
  }, [id]);

  // Si volvemos de crear una localización, seleccionarla automáticamente
  useEffect(() => {
    if (location.state && location.state.nuevaLocalizacionId) {
      setForm((prev) => ({ ...prev, localizacion: location.state.nuevaLocalizacionId }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (trabajosSeleccionadas.length === 0) {
      alert('Debes seleccionar al menos una trabajo.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        localizacion_id: form.localizacion,
        trabajos: trabajosSeleccionadas.map((t) => t.id),
      };
      delete payload.localizacion;
      // Eliminar localizacionInput si existe
      if (payload.localizacionInput) delete payload.localizacionInput;
      let nuevaReparacionId = null;
      let isCreacion = false;
      if (id) {
        // Obtener el grupo de reparaciones a editar
        const grupos = await API.get('reparaciones/agrupados/').then(res => res.data);
        const grupo = grupos.find(g => g.reparacion_ids.includes(Number(id)));
        if (grupo) {
          // Eliminar todos los reparaciones del grupo
          await Promise.all(grupo.reparacion_ids.map(tid => API.delete(`reparaciones/${tid}/`)));
        }
        // Crear los nuevos reparaciones con las trabajos seleccionadas
        const res = await API.post('reparaciones/', payload);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          nuevaReparacionId = res.data[0].id;
        }
      } else {
        // Crear y obtener el id de la nueva reparación
        const res = await API.post('reparaciones/', payload);
        isCreacion = true;
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          nuevaReparacionId = res.data[0].id;
        } else if (res.data && res.data.id) {
          nuevaReparacionId = res.data.id;
        }
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
          p: 3,
          maxWidth: 600,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {id ? 'Editar' : 'Crear'} Reparacion
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Box flex={1}>
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

        <TextField
          name="fecha"
          label="Fecha"
          type="date"
          value={form.fecha}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
          required
        />

        <TextField
          name="num_reparacion"
          label="Nº Reparación"
          value={form.num_reparacion || ''}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          name="num_pedido"
          label="Nº Pedido"
          value={form.num_pedido || ''}
          onChange={handleChange}
          fullWidth
        />

        <Autocomplete
          multiple
          options={trabajos}
          getOptionLabel={(option) => option.nombre_reparacion}
          value={trabajosSeleccionadas}
          onChange={(_, newValue) => setTrabajosSeleccionadas(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.nombre_reparacion} {...getTagProps({ index })} key={option.id} />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} label="Trabajos" placeholder="Selecciona trabajos" fullWidth />
          )}
        />

        <TextField
          name="comentarios"
          label="Comentarios"
          value={form.comentarios || ''}
          onChange={handleChange}
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
        />

        <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ position: 'relative' }}>
          {loading ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ position: 'absolute', left: '50%', top: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
              <span style={{ opacity: 0 }}>Guardar</span>
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </Box>
      {/* Snackbar eliminado, ahora se muestra en la lista */}
    </>
  );
};

export default ReparacionForm;