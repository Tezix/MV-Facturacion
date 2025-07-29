import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../api/axios';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';

const TarifaClienteForm = () => {
  const [form, setForm] = useState({
    cliente: '',
    tarifa: '',
    precio: '',
  });

  const [clientes, setClientes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    Promise.all([
      API.get('clientes/'),
      API.get('tarifas/'),
      id ? API.get(`tarifas_clientes/${id}/`) : Promise.resolve(null)
    ]).then(([clientesRes, tarifasRes, tarifaClienteRes]) => {
      setClientes(clientesRes.data);
      setTarifas(tarifasRes.data);
      if (tarifaClienteRes) setForm(tarifaClienteRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await API.put(`tarifas_clientes/${id}/`, form);
    } else {
      await API.post('tarifas_clientes/', form);
    }
    navigate('/tarifas-clientes');
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">Cargando datos de tarifa cliente...</Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
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
        {id ? 'Editar' : 'Crear'} Tarifa por Cliente
      </Typography>

      <FormControl fullWidth required>
        <InputLabel id="cliente-label">Cliente</InputLabel>
        <Select
          labelId="cliente-label"
          name="cliente"
          value={form.cliente}
          onChange={handleChange}
          label="Cliente"
        >
          <MenuItem value=""><em>-- Selecciona --</em></MenuItem>
          {clientes.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required>
        <InputLabel id="tarifa-label">Reparacion</InputLabel>
        <Select
          labelId="tarifa-label"
          name="tarifa"
          value={form.tarifa}
          onChange={handleChange}
          label="Reparacion"
        >
          <MenuItem value=""><em>-- Selecciona --</em></MenuItem>
          {tarifas.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.nombre_reparacion}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        name="precio"
        label="Precio (€)"
        type="number"
        value={form.precio}
        onChange={handleChange}
        fullWidth
        required
      />

      <Button type="submit" variant="contained" color="primary">
        Guardar
      </Button>
    </Box>
  );
};

export default TarifaClienteForm;