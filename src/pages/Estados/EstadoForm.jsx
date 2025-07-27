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
    if (id) {
      await API.put(`estados/${id}/`, form);
    } else {
      await API.post('estados/', form);
    }
    navigate('/estados');
  };

  if (id && !form.nombre) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando...
        </Typography>
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

      <Button type="submit" variant="contained" color="primary">
        Guardar
      </Button>
    </Box>
  );
};

export default EstadoForm;