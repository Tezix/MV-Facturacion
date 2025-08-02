import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API } from "../../api/axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Autocomplete,
  Chip,
  Tooltip
} from "@mui/material";

const ProformaForm = () => {
  const [form, setForm] = useState({
    cliente: "",
    fecha: "",
    estado: "",
  });
  const [clientes, setClientes] = useState([]);
  const [estados, setEstados] = useState([]);
  const [reparaciones, setReparaciones] = useState([]);
  const [reparacionesSeleccionados, setReparacionesSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const [clientesRes, estadosRes, reparacionesAgrupadosRes, proformaRes] = await Promise.all([
        API.get("clientes/"),
        API.get("estados/"),
        API.get("reparaciones/agrupados/"),
        id ? API.get(`proformas/${id}/`) : Promise.resolve(null)
      ]);
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
        // Filtrar reparaciones: solo mostrar los que NO tienen ni factura ni proforma asignada, o los que están asignados a la proforma actual (en edición)
        reparacionesGrupos = reparacionesGrupos.filter(grupo => {
          const sinFacturaNiProforma = !grupo.factura && !grupo.proforma;
          const asignadaEstaProforma = id && grupo.proforma === Number(id);
          return sinFacturaNiProforma || asignadaEstaProforma;
        });
      }
      setReparaciones(reparacionesGrupos);
      if (proformaRes) {
        const proformaData = proformaRes.data;
        // Excluir numero_proforma y total del form
        const restProformaData = { ...proformaData };
        delete restProformaData.numero_proforma;
        delete restProformaData.total;
        setForm({
          ...restProformaData,
          cliente: proformaData.cliente && typeof proformaData.cliente === 'object' ? proformaData.cliente.id : proformaData.cliente,
          estado: proformaData.estado && typeof proformaData.estado === 'object' ? proformaData.estado.id : proformaData.estado,
        });
        // Seleccionar automáticamente los grupos de reparaciones que tengan la propiedad proforma igual al id de la proforma
        if (id) {
          let gruposSeleccionados = reparacionesGrupos.filter(grupo => grupo.proforma === Number(id));
          // Si venimos de crear una nueva reparación, añadirla a los seleccionados
          if (location.state && location.state.nuevaReparacionId) {
            let nueva = reparacionesGrupos.find(g => g.reparacion_ids.includes(location.state.nuevaReparacionId));
            // Si la nueva reparación no está en la lista, recargar el grupo desde la API
            if (!nueva) {
              // Buscar la nueva reparación en el endpoint agrupado y añadirla
              const nuevosGrupos = (await API.get('reparaciones/agrupados/')).data.map(grupo => ({
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
              nueva = nuevosGrupos.find(g => g.reparacion_ids.includes(location.state.nuevaReparacionId));
              if (nueva && !gruposSeleccionados.some(g => g.id === nueva.id)) {
                gruposSeleccionados = [...gruposSeleccionados, nueva];
                // También actualizar la lista de reparaciones para que aparezca en el autocomplete
                setReparaciones(prev => {
                  if (!prev.some(g => g.id === nueva.id)) {
                    return [...prev, nueva];
                  }
                  return prev;
                });
              }
            } else if (!gruposSeleccionados.some(g => g.id === nueva.id)) {
              gruposSeleccionados = [...gruposSeleccionados, nueva];
            }
          }
          setReparacionesSeleccionados(gruposSeleccionados);
        }
      } else {
        // Si no hay proforma cargada (creación), setear estado por defecto a "Creada" y fecha a hoy
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
      // Limpiar el state de navegación para evitar selección múltiple accidental
      // window.history.replaceState({}, document.title);
      setLoading(false);
    };
    fetchData();
  }, [id, location.state]);
  // Validación de campos requeridos
  const requiredFieldsFilled = form.cliente && form.estado && form.fecha;

  // Guardar la proforma y navegar a crear nueva reparación
  const handleNuevaReparacion = async () => {
    setSaving(true);
    let proformaId = id;
    try {
      // Si la proforma no existe aún, crearla primero
      if (!proformaId) {
        // Asegurarse de enviar solo los ids en el form
        const formToSend = {
          ...form,
          cliente: typeof form.cliente === 'object' && form.cliente !== null ? form.cliente.id : form.cliente,
          estado: typeof form.estado === 'object' && form.estado !== null ? form.estado.id : form.estado,
        };
        delete formToSend.numero_proforma;
        delete formToSend.total;
        const res = await API.post('proformas/', formToSend);
        proformaId = res.data.id;
      } else {
        // Si ya existe, guardar cambios antes de salir
        const formToSend = {
          ...form,
          cliente: typeof form.cliente === 'object' && form.cliente !== null ? form.cliente.id : form.cliente,
          estado: typeof form.estado === 'object' && form.estado !== null ? form.estado.id : form.estado,
        };
        delete formToSend.numero_proforma;
        delete formToSend.total;
        await API.put(`proformas/${proformaId}/`, formToSend);
      }
      // Asignar reparaciones seleccionadas actuales
      if (reparacionesSeleccionados.length > 0) {
        const allReparacionIds = reparacionesSeleccionados.flatMap(g => Array.isArray(g.reparacion_ids) ? g.reparacion_ids : []);
        await API.post(`proformas/${proformaId}/asignar-reparaciones/`, {
          reparaciones: allReparacionIds
        });
      }
      // Navegar a crear nueva reparación, pasando el id de la proforma y la ruta de retorno
      navigate(`/reparaciones/crear`, {
        state: { fromProforma: true, proformaId: proformaId, returnTo: `/proformas/editar/${proformaId}` }
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
      let proformaId = id;
      let isCreacion = false;
      // Asegurarse de enviar solo los ids en el form
      const formToSend = {
        ...form,
        cliente: typeof form.cliente === 'object' && form.cliente !== null ? form.cliente.id : form.cliente,
        estado: typeof form.estado === 'object' && form.estado !== null ? form.estado.id : form.estado,
      };
      // Eliminar numero_proforma y total si por alguna razón están presentes
      delete formToSend.numero_proforma;
      delete formToSend.total;
      if (id) {
        await API.put(`proformas/${id}/`, formToSend);
      } else {
        const res = await API.post('proformas/', formToSend);
        proformaId = res.data.id;
        isCreacion = true;
      }
      // Asignar todos los reparacion_ids de los grupos seleccionados a la proforma
      if (reparacionesSeleccionados.length > 0) {
        const allReparacionIds = reparacionesSeleccionados.flatMap(g => Array.isArray(g.reparacion_ids) ? g.reparacion_ids : []);
        await API.post(`proformas/${proformaId}/asignar-reparaciones/`, {
          reparaciones: allReparacionIds
        });
      }
      if (isCreacion) {
        navigate('/proformas', { state: { snackbar: { open: true, message: 'Proforma creada correctamente', severity: 'success' } } });
      } else {
        navigate('/proformas', { state: { snackbar: { open: true, message: 'Proforma actualizada correctamente', severity: 'success' } } });
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
        {id ? 'Editar' : 'Crear'} Proforma
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
            .filter((e) => e.nombre === "Enviada" || e.nombre === "Aceptada" || e.nombre === "Creada")
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
        <Tooltip
          title={
            !requiredFieldsFilled
              ? 'Completa todos los campos obligatorios para habilitar este botón'
              : ''
          }
          arrow
          disableHoverListener={requiredFieldsFilled}
        >
          <span>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNuevaReparacion}
              disabled={saving || !requiredFieldsFilled}
            >
              Nueva
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Tooltip
        title={
          !requiredFieldsFilled
            ? 'Completa todos los campos obligatorios para habilitar este botón'
            : ''
        }
        arrow
        disableHoverListener={requiredFieldsFilled}
      >
        <span>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={saving || !requiredFieldsFilled}
            sx={{ position: 'relative' }}
            fullWidth
          >
            {saving ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ position: 'absolute', left: '50%', top: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
                <span style={{ opacity: 0 }}>Guardar</span>
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </span>
      </Tooltip>
    </Box>
  );
};

export default ProformaForm;