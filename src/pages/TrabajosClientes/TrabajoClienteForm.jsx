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
import Autocomplete from '@mui/material/Autocomplete';

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
      let isCreacion = false;
      if (id) {
        await API.put(`trabajos_clientes/${id}/`, form);
      } else {
        await API.post('trabajos_clientes/', form);
        isCreacion = true;
      }
      if (isCreacion) {
        navigate('/trabajos-clientes', { state: { snackbar: { open: true, message: 'Trabajo de cliente creado correctamente', severity: 'success' } } });
      } else {
        navigate('/trabajos-clientes', { state: { snackbar: { open: true, message: 'Trabajo de cliente actualizado correctamente', severity: 'success' } } });
      }
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

      <Autocomplete
        fullWidth
        required
        options={clientes}
        getOptionLabel={(option) => option?.nombre || ''}
        value={clientes.find((c) => c.id === form.cliente) || null}
        onChange={(_, newValue) => {
          setForm({ ...form, cliente: newValue ? newValue.id : '' });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Cliente"
            name="cliente"
            required
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText="No hay coincidencias"
      />

      <Autocomplete
        fullWidth
        required
        options={trabajos}
        getOptionLabel={(option) => option?.nombre_reparacion || ''}
        value={trabajos.find((t) => t.id === form.trabajo) || null}
        onChange={(_, newValue) => {
          setForm({ ...form, trabajo: newValue ? newValue.id : '' });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Reparación"
            name="trabajo"
            required
          />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText="No hay coincidencias"
      />

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