import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [form, setForm] = useState({
    fecha: '',
    num_reparacion: '',
    num_pedido: '',
    factura: '',
    proforma: '',
    localizacion: '',
  });
  const [localizaciones, setLocalizaciones] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [trabajosSeleccionadas, setTrabajosSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      // Buscar el grupo correspondiente en el endpoint agrupado
      API.get('reparaciones/agrupados/').then((res) => {
        const grupos = res.data;
        // Buscar el grupo que contenga este id
        const grupo = grupos.find(g => g.reparacion_ids.includes(Number(id)));
        if (grupo) {
          setForm((prev) => ({
            ...prev,
            fecha: grupo.fecha,
            num_reparacion: grupo.num_reparacion,
            num_pedido: grupo.num_pedido,
            factura: grupo.factura,
            proforma: grupo.proforma,
            localizacion: grupo.localizacion.id,
          }));
          setTrabajosSeleccionadas(grupo.trabajos);
        }
      });
    }
    API.get('localizaciones_reparaciones/').then((res) => setLocalizaciones(res.data));
    API.get('trabajos/').then((res) => setTrabajos(res.data));
  }, [id]);

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
      if (id) {
        // Obtener el grupo de reparaciones a editar
        const grupos = await API.get('reparaciones/agrupados/').then(res => res.data);
        const grupo = grupos.find(g => g.reparacion_ids.includes(Number(id)));
        if (grupo) {
          // Eliminar todos los reparaciones del grupo
          await Promise.all(grupo.reparacion_ids.map(tid => API.delete(`reparaciones/${tid}/`)));
        }
        // Crear los nuevos reparaciones con las trabajos seleccionadas
        await API.post('reparaciones/', payload);
      } else {
        await API.post('reparaciones/', payload);
      }
      navigate('/reparaciones');
    } finally {
      setLoading(false);
    }
  };

  if (id && !form.fecha) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
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


      <FormControl fullWidth required>
        <InputLabel id="localizacion-label">Localización</InputLabel>
        <Select
          labelId="localizacion-label"
          name="localizacion"
          value={form.localizacion || ''}
          label="Localización"
          onChange={handleChange}
        >
          {localizaciones.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.direccion}, {loc.numero}, {loc.localidad}
            </MenuItem>
          ))}
        </Select>
      </FormControl>


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
  );
};

export default ReparacionForm;