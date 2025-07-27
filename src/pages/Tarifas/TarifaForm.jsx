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

const TarifaForm = () => {
  const [form, setForm] = useState({
    nombre_trabajo: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      API.get(`tarifas/${id}/`).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await API.put(`tarifas/${id}/`, form);
    } else {
      await API.post("tarifas/", form);
    }
    navigate("/tarifas");
  };

  if (id && !form.nombre_trabajo) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando...
        </Typography>
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
        {id ? "Editar" : "Crear"} Tarifa
      </Typography>

      <TextField
        label="Nombre del Trabajo"
        name="nombre_trabajo"
        value={form.nombre_trabajo}
        onChange={handleChange}
        required
        fullWidth
        placeholder="Ej: Reparación de aire acondicionado"
      />

      <Button type="submit" variant="contained" color="primary">
        Guardar
      </Button>
    </Box>
  );
};

export default TarifaForm;