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

const LocalizacionTrabajoForm = () => {
  const [form, setForm] = useState({
    direccion: '',
    numero: '',
    localidad: '',
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      API.get(`localizaciones_trabajos/${id}/`).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await API.put(`localizaciones_trabajos/${id}/`, form);
    } else {
      await API.post('localizaciones_trabajos/', form);
    }
    navigate('/localizaciones');
  };

  if (id && !form.direccion) {
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
        {id ? 'Editar' : 'Crear'} Localización de Trabajo
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

      <Button type="submit" variant="contained" color="primary">
        Guardar
      </Button>
    </Box>
  );
};

export default LocalizacionTrabajoForm;