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
    if (id) {
      await API.put(`clientes/${id}/`, form);
    } else {
      await API.post('clientes/', form);
    }
    navigate('/clientes');
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
        maxWidth: 600,
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

      <Button variant="contained" color="primary" type="submit">
        Guardar
      </Button>
    </Box>
  );
};

export default ClienteForm;