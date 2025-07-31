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

const TrabajoClienteForm = () => {
  const [form, setForm] = useState({
    cliente: '',
    trabajo: '',
    precio: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`trabajos_clientes/${id}/`);
      navigate('/trabajos-clientes');
    } finally {
      setDeleting(false);
    }
  };

  const [clientes, setClientes] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    Promise.all([
      API.get('clientes/'),
      API.get('trabajos/'),
      id ? API.get(`trabajos_clientes/${id}/`) : Promise.resolve(null)
    ]).then(([clientesRes, trabajosRes, trabajoClienteRes]) => {
      setClientes(clientesRes.data);
      setTrabajos(trabajosRes.data);
      if (trabajoClienteRes) setForm(trabajoClienteRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id) {
        await API.put(`trabajos_clientes/${id}/`, form);
      } else {
        await API.post('trabajos_clientes/', form);
      }
      navigate('/trabajos-clientes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
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
        {id ? 'Editar' : 'Crear'} Trabajo por Cliente
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
        <InputLabel id="trabajo-label">Reparacion</InputLabel>
        <Select
          labelId="trabajo-label"
          name="trabajo"
          value={form.trabajo}
          onChange={handleChange}
          label="Reparacion"
        >
          <MenuItem value=""><em>-- Selecciona --</em></MenuItem>
          {trabajos.map((t) => (
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

export default TrabajoClienteForm;