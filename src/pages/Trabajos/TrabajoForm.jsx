import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../api/axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const TrabajoForm = () => {
  const [form, setForm] = useState({
    nombre_reparacion: "",
    precio: "",
  });
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      if (id) {
        await API.put(`trabajos/${id}/`, form);
      } else {
        await API.post("trabajos/", form);
      }
      navigate("/trabajos");
    } finally {
      setSaving(false);
    }
  };

  if (id && !form.nombre_reparacion) {
    return (
      <Box p={4} textAlign="center">
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
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        {id ? "Editar" : "Crear"} Trabajo
      </Typography>


      <TextField
        label="Nombre de la Reparación"
        name="nombre_reparacion"
        value={form.nombre_reparacion}
        onChange={handleChange}
        required
        fullWidth
        placeholder="Ej: Reparación de aire acondicionado"
      />

      <TextField
        label="Precio"
        name="precio"
        type="number"
        value={form.precio}
        onChange={handleChange}
        required
        fullWidth
        inputProps={{ step: "0.01", min: "0" }}
        placeholder="Ej: 100.00"
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
    </Box>
  );
};

export default TrabajoForm;