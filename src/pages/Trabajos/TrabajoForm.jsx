import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../api/axios';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const TrabajoForm = () => {
  const [form, setForm] = useState({
    fecha: '',
    num_reparacion: '',
    num_pedido: '',
    factura: '',
    proforma: '',
    localizacion: '',
    tarifa: '',
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      API.get(`trabajos/${id}/`).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await API.put(`trabajos/${id}/`, form);
    } else {
      await API.post('trabajos/', form);
    }
    navigate('/trabajos');
  };

  if (id && !form.fecha) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="body1" fontWeight="bold">Cargando...</Typography>
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
        {id ? 'Editar' : 'Crear'} Trabajo
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

      <TextField
        name="factura"
        label="Factura (ID)"
        type="number"
        value={form.factura || ''}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        name="proforma"
        label="Proforma (ID)"
        type="number"
        value={form.proforma || ''}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        name="localizacion"
        label="Localización (ID)"
        type="number"
        value={form.localizacion || ''}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        name="tarifa"
        label="Tarifa (ID)"
        type="number"
        value={form.tarifa || ''}
        onChange={handleChange}
        fullWidth
      />

      <Button type="submit" variant="contained" color="primary">
        Guardar
      </Button>
    </Box>
  );
};

export default TrabajoForm;