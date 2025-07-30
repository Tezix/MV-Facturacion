import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API } from '../../api/axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

const LocalizacionReparacionForm = () => {
  const [form, setForm] = useState({
    direccion: '',
    numero: '',
    localidad: '',
    ascensor: false,
  });
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (id) {
      API.get(`localizaciones_reparaciones/${id}/`).then((res) => {
        setForm({
          direccion: res.data.direccion || '',
          numero: res.data.numero || '',
          localidad: res.data.localidad || '',
          ascensor: res.data.ascensor ?? false,
        });
      });
    } else {
      // Si hay query param direccion, autocompletar
      const params = new URLSearchParams(location.search);
      const direccion = params.get('direccion') || '';
      if (direccion) {
        setForm((prev) => ({ ...prev, direccion }));
      }
    }
  }, [id, location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Siempre tratar ascensor como string
    setForm({
      ...form,
      [name]: name === 'ascensor' ? String(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // No enviar ascensor si está vacío o es booleano (por error)
      const data = { ...form };
      if (
        data.ascensor === '' ||
        data.ascensor === undefined ||
        typeof data.ascensor === 'boolean'
      ) {
        delete data.ascensor;
      }
      if (id) {
        await API.put(`localizaciones_reparaciones/${id}/`, data);
        navigate('/localizaciones');
      } else {
        // Crear y obtener el id de la nueva localización
        const res = await API.post('localizaciones_reparaciones/', data);
        // Si venimos de Reparacion, volver y pasar el id
        if (location.state && location.state.fromReparacion) {
          // Si venimos de Reparacion, volver siempre a crear nueva reparacion y preseleccionar la localizacion
          navigate('/reparaciones/crear', {
            state: { nuevaLocalizacionId: res.data.id },
            replace: true
          });
        } else {
          navigate('/localizaciones');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (id && !form.direccion) {
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
        {id ? 'Editar' : 'Crear'} Localización de Reparacion
      </Typography>

      <TextField
        label="Dirección"
        name="direccion"
        value={form.direccion}
        onChange={handleChange}
        required
        fullWidth
      />

      <TextField
        label="Número"
        name="numero"
        type="number"
        value={form.numero}
        onChange={handleChange}
        required
        fullWidth
      />

      <TextField
        label="Localidad"
        name="localidad"
        value={form.localidad}
        onChange={handleChange}
        required
        fullWidth
      />

      <TextField
        label="Ascensor"
        name="ascensor"
        value={form.ascensor || ''}
        onChange={handleChange}
        fullWidth
      />

      <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ position: 'relative' }}>
        {saving ? (
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

export default LocalizacionReparacionForm;