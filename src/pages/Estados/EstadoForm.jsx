import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../api/axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

const EstadoForm = () => {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`estados/${id}/`);
      navigate('/estados');
    } finally {
      setDeleting(false);
    }
  };

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      API.get(`estados/${id}/`).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let isCreacion = false;
      if (id) {
        await API.put(`estados/${id}/`, form);
      } else {
        await API.post('estados/', form);
        isCreacion = true;
      }
      if (isCreacion) {
        navigate('/estados', { state: { snackbar: { open: true, message: 'Estado creado correctamente', severity: 'success' } } });
      } else {
        navigate('/estados', { state: { snackbar: { open: true, message: 'Estado actualizado correctamente', severity: 'success' } } });
      }
    } finally {
      setSaving(false);
    }
  };

  if (id && !form.nombre) {
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
        {id ? 'Editar' : 'Crear'} Estado
      </Typography>

      <TextField
        label="Nombre"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        required
        fullWidth
      />

      <TextField
        label="Descripción"
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        required
        multiline
        rows={4}
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

export default EstadoForm;