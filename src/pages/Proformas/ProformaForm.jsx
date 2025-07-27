import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "@mui/material";

const ProformaForm = () => {
  const [form, setForm] = useState({
    cliente: "",
    factura: "",
    numero_proforma: "",
    fecha: "",
    estado: "",
    total: "",
  });

  const [clientes, setClientes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    Promise.all([
      API.get("clientes/"),
      API.get("facturas/"),
      API.get("estados/"),
      id ? API.get(`proformas/${id}/`) : Promise.resolve(null)
    ]).then(([clientesRes, facturasRes, estadosRes, proformaRes]) => {
      setClientes(clientesRes.data);
      setFacturas(facturasRes.data);
      setEstados(estadosRes.data);
      if (proformaRes) setForm(proformaRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await API.put(`proformas/${id}/`, form);
    } else {
      await API.post("proformas/", form);
    }
    navigate("/proformas");
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando datos de proforma...
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
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        {id ? "Editar" : "Crear"} Proforma
      </Typography>
      {/* ...existing code for dropdowns and fields... */}
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
            <em>Selecciona cliente</em>
          </MenuItem>
          {clientes.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="factura-label">Factura (opcional)</InputLabel>
        <Select
          labelId="factura-label"
          name="factura"
          value={form.factura || ""}
          onChange={handleChange}
          label="Factura (opcional)"
        >
          <MenuItem value="">
            <em>Sin asociar</em>
          </MenuItem>
          {facturas.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.numero_factura}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        name="numero_proforma"
        label="Número Proforma"
        value={form.numero_proforma}
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
        InputLabelProps={{ shrink: true }}
        fullWidth
        required
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
            <em>Selecciona estado</em>
          </MenuItem>
          {estados.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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

      <Button type="submit" variant="contained" color="success">
        Guardar
      </Button>
    </Box>
  );
};

export default ProformaForm;