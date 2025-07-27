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

const FacturaForm = () => {
  const [form, setForm] = useState({
    cliente: '',
    numero_factura: '',
    fecha: '',
    estado: '',
    total: '',
  });

  const [clientes, setClientes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    Promise.all([
      API.get('clientes/'),
      API.get('estados/'),
      id ? API.get(`facturas/${id}/`) : Promise.resolve(null)
    ]).then(([clientesRes, estadosRes, facturaRes]) => {
      setClientes(clientesRes.data);
      setEstados(estadosRes.data);
      if (facturaRes) setForm(facturaRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await API.put(`facturas/${id}/`, form);
    } else {
      await API.post('facturas/', form);
    }
    navigate('/facturas');
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando datos de factura...
        </Typography>
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
        {id ? 'Editar' : 'Crear'} Factura
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
          <MenuItem value="">
            <em>-- Selecciona --</em>
          </MenuItem>
          {clientes.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required>
        <InputLabel id="estado-label">Estado</InputLabel>
        <Select
          labelId="estado-label"
          name="estado"
          value={form.estado}
          onChange={handleChange}
          label="Estado"
        >
          <MenuItem value="">
            <em>-- Selecciona --</em>
          </MenuItem>
          {estados.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        name="numero_factura"
        label="Número Factura"
        value={form.numero_factura}
        onChange={handleChange}
        fullWidth
        required
      />

      <TextField
        name="fecha"
        label="Fecha"
        type="date"
        value={form.fecha}
        onChange={handleChange}
        fullWidth
        required
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        name="total"
        label="Total (€)"
        type="number"
        step="0.01"
        value={form.total}
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

export default FacturaForm;