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
    escalera: '',
    ascensor: false,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`localizaciones_reparaciones/${id}/`);
      navigate('/localizaciones');
    } finally {
      setDeleting(false);
    }
  };

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
          escalera: res.data.escalera || '',
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
    // Siempre tratar ascensor y escalera como string
    setForm({
      ...form,
      [name]: (name === 'ascensor' || name === 'escalera') ? String(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // No enviar ascensor/escalera si están vacíos o ascensor es booleano (por error)
      const data = { ...form };
      if (
        data.ascensor === '' ||
        data.ascensor === undefined ||
        typeof data.ascensor === 'boolean'
      ) {
        delete data.ascensor;
      }
      if (data.escalera === '' || data.escalera === undefined) {
        delete data.escalera;
      }
      let isCreacion = false;
      if (id) {
        await API.put(`localizaciones_reparaciones/${id}/`, data);
      } else {
        // Crear y obtener el id de la nueva localización
        const res = await API.post('localizaciones_reparaciones/', data);
        isCreacion = true;
        // Si venimos de Reparacion, volver y pasar el id y el seguimiento de factura si existe
        if (location.state && location.state.fromReparacion) {
          let reparacionState = { nuevaLocalizacionId: res.data.id };
          if (location.state.fromFactura && location.state.facturaId) {
            reparacionState = {
              ...reparacionState,
              fromFactura: true,
              facturaId: location.state.facturaId,
              returnTo: location.state.returnTo || undefined
            };
          } else if (location.state.fromProforma && location.state.proformaId) {
            reparacionState = {
              ...reparacionState,
              fromProforma: true,
              proformaId: location.state.proformaId,
              returnTo: location.state.returnTo || undefined
            };
          }
          navigate('/reparaciones/crear', {
            state: reparacionState,
            replace: true
          });
          return;
        }
      }
      if (isCreacion) {
        navigate('/localizaciones', { state: { snackbar: { open: true, message: 'Localización creada correctamente', severity: 'success' } } });
      } else {
        navigate('/localizaciones', { state: { snackbar: { open: true, message: 'Localización actualizada correctamente', severity: 'success' } } });
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
        width: '70vw',
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
        label="Escalera"
        name="escalera"
        value={form.escalera || ''}
        onChange={handleChange}
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
      {id && (
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={deleting}
          sx={{ position: 'relative' }}
        >
          {deleting ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ position: 'absolute', left: '50%', top: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
              <span style={{ opacity: 0 }}>Eliminar</span>
            </>
          ) : (
            'Eliminar'
          )}
        </Button>
      )}
    </Box>
  );
};

export default LocalizacionReparacionForm;