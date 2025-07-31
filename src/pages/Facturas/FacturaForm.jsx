import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
        import {
          Autocomplete,
          Chip,
        } from '@mui/material';

const FacturaForm = () => {
  const [form, setForm] = useState({
    cliente: '',
    fecha: '',
    estado: '',
  });

  const [clientes, setClientes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reparaciones, setReparaciones] = useState([]);
  const [reparacionesSeleccionados, setReparacionesSeleccionados] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    Promise.all([
      API.get('clientes/'),
      API.get('estados/'),
      API.get('reparaciones/agrupados/'),
      id ? API.get(`facturas/${id}/`) : Promise.resolve(null)
    ]).then(([clientesRes, estadosRes, reparacionesAgrupadosRes, facturaRes]) => {
      setClientes(clientesRes.data);
      setEstados(estadosRes.data);
      let reparacionesGrupos = [];
      if (Array.isArray(reparacionesAgrupadosRes.data)) {
        reparacionesGrupos = reparacionesAgrupadosRes.data.map(grupo => ({
          id: grupo.reparacion_ids[0],
          fecha: grupo.fecha,
          num_reparacion: grupo.num_reparacion,
          num_pedido: grupo.num_pedido,
          localizacion: grupo.localizacion,
          trabajo: Array.isArray(grupo.trabajos) && grupo.trabajos.length > 0 ? grupo.trabajos[0] : null,
          factura: grupo.factura,
          proforma: grupo.proforma,
          reparacion_ids: grupo.reparacion_ids,
        }));
        // Filtrar reparaciones: solo mostrar los que NO tienen ni factura ni proforma asignada, o los que están asignados a la factura actual (en edición)
        reparacionesGrupos = reparacionesGrupos.filter(grupo => {
          const sinFacturaNiProforma = !grupo.factura && !grupo.proforma;
          const asignadaEstaFactura = id && grupo.factura === Number(id);
          return sinFacturaNiProforma || asignadaEstaFactura;
        });
      }
      setReparaciones(reparacionesGrupos);
      if (facturaRes) {
        const facturaData = facturaRes.data;
        // Excluir numero_factura y total del form
        const restFacturaData = { ...facturaData };
        delete restFacturaData.numero_factura;
        delete restFacturaData.total;
        setForm({
          ...restFacturaData,
          cliente: facturaData.cliente && typeof facturaData.cliente === 'object' ? facturaData.cliente.id : facturaData.cliente,
          estado: facturaData.estado && typeof facturaData.estado === 'object' ? facturaData.estado.id : facturaData.estado,
        });
        // Seleccionar automáticamente los grupos de reparaciones que tengan la propiedad factura igual al id de la factura
        if (id) {
          let gruposSeleccionados = reparacionesGrupos.filter(grupo => grupo.factura === Number(id));
          // Si venimos de crear una nueva reparación, añadirla a los seleccionados
          if (location.state && location.state.nuevaReparacionId) {
            const nueva = reparacionesGrupos.find(g => g.reparacion_ids.includes(location.state.nuevaReparacionId));
            if (nueva && !gruposSeleccionados.some(g => g.id === nueva.id)) {
              gruposSeleccionados = [...gruposSeleccionados, nueva];
            }
          }
          setReparacionesSeleccionados(gruposSeleccionados);
        }
      } else {
        // Si no hay factura cargada (creación), setear estado por defecto a "Creada" y fecha a hoy
        const creada = estadosRes.data.find(e => e.nombre === "Creada");
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        setForm(f => ({
          ...f,
          estado: creada ? creada.id : f.estado,
          fecha: todayStr
        }));
      }
    }).finally(() => setLoading(false));
    // Limpiar el state de navegación para evitar selección múltiple accidental
    // eslint-disable-next-line
    // window.history.replaceState({}, document.title);
  }, [id, location.state]);
  // Guardar la factura y navegar a crear nueva reparación
  const handleNuevaReparacion = async () => {
    setSaving(true);
    let facturaId = id;
    try {
      // Si la factura no existe aún, crearla primero
      if (!facturaId) {
        // Asegurarse de enviar solo los ids en el form
        const formToSend = {
          ...form,
          cliente: typeof form.cliente === 'object' && form.cliente !== null ? form.cliente.id : form.cliente,
          estado: typeof form.estado === 'object' && form.estado !== null ? form.estado.id : form.estado,
        };
        delete formToSend.numero_factura;
        delete formToSend.total;
        const res = await API.post('facturas/', formToSend);
        facturaId = res.data.id;
      } else {
        // Si ya existe, guardar cambios antes de salir
        const formToSend = {
          ...form,
          cliente: typeof form.cliente === 'object' && form.cliente !== null ? form.cliente.id : form.cliente,
          estado: typeof form.estado === 'object' && form.estado !== null ? form.estado.id : form.estado,
        };
        delete formToSend.numero_factura;
        delete formToSend.total;
        await API.put(`facturas/${facturaId}/`, formToSend);
      }
      // Asignar reparaciones seleccionadas actuales
      if (reparacionesSeleccionados.length > 0) {
        const allReparacionIds = reparacionesSeleccionados.flatMap(g => Array.isArray(g.reparacion_ids) ? g.reparacion_ids : []);
        await API.post(`facturas/${facturaId}/asignar-reparaciones/`, {
          reparaciones: allReparacionIds
        });
      }
      // Navegar a crear nueva reparación, pasando el id de la factura y la ruta de retorno
      navigate(`/reparaciones/crear`, {
        state: { fromFactura: true, facturaId: facturaId, returnTo: `/facturas/editar/${facturaId}` }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let facturaId = id;
      // Asegurarse de enviar solo los ids en el form
      const formToSend = {
        ...form,
        cliente: typeof form.cliente === 'object' && form.cliente !== null ? form.cliente.id : form.cliente,
        estado: typeof form.estado === 'object' && form.estado !== null ? form.estado.id : form.estado,
      };
      // Eliminar numero_factura y total si por alguna razón están presentes
      delete formToSend.numero_factura;
      delete formToSend.total;
      if (id) {
        await API.put(`facturas/${id}/`, formToSend);
      } else {
        const res = await API.post('facturas/', formToSend);
        facturaId = res.data.id;
      }
      // Asignar todos los reparacion_ids de los grupos seleccionados a la factura
      if (reparacionesSeleccionados.length > 0) {
        const allReparacionIds = reparacionesSeleccionados.flatMap(g => Array.isArray(g.reparacion_ids) ? g.reparacion_ids : []);
        await API.post(`facturas/${facturaId}/asignar-reparaciones/`, {
          reparaciones: allReparacionIds
        });
      }
      navigate('/facturas');
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
        {id ? 'Editar' : 'Crear'} Factura
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
          {estados
            .filter((e) => e.nombre === "Enviada" || e.nombre === "Pagada" || e.nombre === "Pendiente pago" || e.nombre === "Creada")
            .map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.nombre}
              </MenuItem>
            ))}
        </Select>
      </FormControl>



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




      <Box display="flex" alignItems="center" gap={1}>
        <Box flex={1}>
          <Autocomplete
            multiple
            options={reparaciones}
            getOptionLabel={(option) => {
              if (!option) return '';
              const fecha = option.fecha || '';
              const numReparacion = option.num_reparacion || '';
              const loc = option.localizacion || {};
              const direccion = loc.direccion || '';
              const numero = loc.numero !== undefined && loc.numero !== null ? loc.numero : '';
              return `${fecha} - ${numReparacion} - ${direccion} ${numero}`;
            }}
            value={reparacionesSeleccionados}
            onChange={(_, newValue) => setReparacionesSeleccionados(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const fecha = option.fecha || '';
                const numReparacion = option.num_reparacion || '';
                const loc = option.localizacion || {};
                const direccion = loc.direccion || '';
                const numero = loc.numero !== undefined && loc.numero !== null ? loc.numero : '';
                return (
                  <Chip label={`${fecha} - ${numReparacion} - ${direccion} ${numero}`} {...getTagProps({ index })} key={option.id} />
                );
              })
            }
            renderInput={(params) => (
              <TextField {...params} label="Reparaciones a asociar" placeholder="Selecciona reparaciones" fullWidth />
            )}
          />
        </Box>
        <Button variant="outlined" color="primary" onClick={handleNuevaReparacion} disabled={saving}>
          Nueva
        </Button>
      </Box>

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
    </Box>
  );
};

export default FacturaForm;