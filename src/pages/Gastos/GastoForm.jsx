// Helpers para formato dd/MM/yyyy
function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [yyyy, mm, dd] = fechaStr.split('-');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
    const [dd, mm, yyyy] = fechaStr.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return new Date(fechaStr);
}

function formatFecha(date) {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../../api/axios';


import {
  Box, Button, TextField, Typography, MenuItem, InputLabel, Select, FormControl, Paper, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';


// Los tipos y estados se obtendrán dinámicamente del backend

export default function GastoForm() {
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const { id } = useParams();
  // Fecha predeterminada: hoy (dd/MM/yyyy)
  const today = formatFecha(new Date());
  const [form, setForm] = useState({
    nombre: '',
    tipo: '',
    estado: '',
    fecha: today,
    descripcion: '',
    precio: '',
    archivo: null,
  });
  const [archivoUrl, setArchivoUrl] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    // Si el usuario selecciona un nuevo archivo, ya no mostramos el anterior
    if (name === 'archivo' && files && files[0]) {
      setArchivoUrl(null);
    }
  };

  const toIsoDate = (fechaStr) => {
    // Convierte dd/MM/yyyy o Date a yyyy-MM-dd
    if (!fechaStr) return '';
    if (fechaStr instanceof Date) {
      const yyyy = fechaStr.getFullYear();
      const mm = String(fechaStr.getMonth() + 1).padStart(2, '0');
      const dd = String(fechaStr.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
      const [dd, mm, yyyy] = fechaStr.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      return fechaStr;
    }
    // fallback
    return fechaStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'archivo' && !v) return;
      if (k === 'fecha' && v) {
        data.append('fecha', toIsoDate(v));
      } else if (v !== null && v !== '' && k !== 'fecha') {
        data.append(k, v);
      }
    });
    try {
      if (id) {
        await API.patch(`/gastos/${id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate('/gastos/registrar', { state: { success: 'Gasto actualizado correctamente' } });
      } else {
        await API.post('/gastos/', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate('/gastos/registrar', { state: { success: 'Gasto registrado correctamente' } });
      }
    } catch {
      setError('Error al guardar el gasto');
    }
  };

  // Obtener tipos y estados del backend al montar
  useEffect(() => {
    API.get('gastos/choices/').then(res => {
      setTipos(res.data.tipos || []);
      setEstados(res.data.estados || []);
    });
  }, []);

  // Autorrellenar si estamos editando
  useEffect(() => {
    if (id) {
      API.get(`/gastos/${id}/`).then(res => {
        const gasto = res.data;
        setForm({
          nombre: gasto.nombre || '',
          tipo: gasto.tipo || '',
          estado: gasto.estado || '',
          fecha: gasto.fecha || '',
          descripcion: gasto.descripcion || '',
          precio: gasto.precio || '',
          archivo: null, // No prellenar el input file
        });
        setArchivoUrl(gasto.archivo || null);
      });
    }
  }, [id]);

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>{id ? 'Editar Gasto' : 'Registrar Gasto'}</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              name="tipo"
              value={form.tipo}
              label="Tipo"
              onChange={handleChange}
              required
            >
              {tipos.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Estado</InputLabel>
            <Select
              name="estado"
              value={form.estado}
              label="Estado"
              onChange={handleChange}
              required
            >
              {estados.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DatePicker
              label="Fecha"
              value={form.fecha ? parseFecha(form.fecha) : null}
              onChange={newValue => {
                setForm(f => ({ ...f, fecha: newValue ? formatFecha(newValue) : '' }));
              }}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  margin: 'normal',
                  InputLabelProps: { shrink: true },
                  inputProps: {
                    style: { cursor: 'pointer' },
                    readOnly: true,
                  },
                },
              }}
            />
          </LocalizationProvider>
          <TextField
            label="Precio"
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ step: '0.01' }}
          />
          <TextField
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          {archivoUrl && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <a href={archivoUrl} target="_blank" rel="noopener noreferrer">Ver archivo actual</a>
            </Box>
          )}
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2 }}
            fullWidth
          >
            {archivoUrl ? 'Actualizar archivo' : 'Subir archivo'}
            <input
              type="file"
              name="archivo"
              hidden
              onChange={handleChange}
            />
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            fullWidth
          >
            {id ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
