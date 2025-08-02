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

const ClienteForm = () => {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    numero: '',
    cp: '',
    localidad: '',
    cif: '',
    email: '',
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`clientes/${id}/`);
      navigate('/clientes');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (id) {
      API.get(`clientes/${id}/`).then((res) => setForm(res.data));
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
        await API.put(`clientes/${id}/`, form);
      } else {
        await API.post('clientes/', form);
        isCreacion = true;
      }
      if (isCreacion) {
        navigate('/clientes', { state: { snackbar: { open: true, message: 'Cliente creado correctamente', severity: 'success' } } });
      } else {
        navigate('/clientes', { state: { snackbar: { open: true, message: 'Cliente actualizado correctamente', severity: 'success' } } });
      }
    } finally {
      setSaving(false);
    }
  };

  if (id && !form.nombre) {
    return (
      <Box p={4}>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '70vw',
        mx: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {id ? 'Editar Cliente' : 'Crear Cliente'}
      </Typography>

      {Object.keys(form).map((field) => (
        <TextField
          key={field}
          label={field.charAt(0).toUpperCase() + field.slice(1)}
          name={field}
          value={form[field]}
          onChange={handleChange}
          fullWidth
          variant="outlined"
        />
      ))}

      <Button variant="contained" color="primary" type="submit" disabled={saving} sx={{ position: 'relative' }}>
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

export default ClienteForm;