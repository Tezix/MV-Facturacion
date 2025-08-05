import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
    especial: false,
  });
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`trabajos/${id}/`);
      navigate('/trabajos');
    } finally {
      setDeleting(false);
    }
  };

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (location.state?.fromReparacion) {
      setForm((prev) => ({ ...prev, especial: true }));
    }
    if (id) {
      API.get(`trabajos/${id}/`).then((res) => setForm(res.data));
    }
  }, [id, location.state?.fromReparacion]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let savedTrabajo = null;
      if (id) {
        const res = await API.put(`trabajos/${id}/`, form);
        savedTrabajo = res.data;
      } else {
        const res = await API.post("trabajos/", form);
        savedTrabajo = res.data;
      }
      if (location.state?.fromReparacion) {
        const reparId = location.state.reparacionId;
        const path = reparId ? `/reparaciones/editar/${reparId}` : '/reparaciones/crear';
        navigate(path, {
          state: {
            nuevaTrabajo: savedTrabajo,
            reparacionFormState: location.state.reparacionFormState,
          },
        });
      } else {
        const snackbar = {
          open: true,
          message: id ? 'Trabajo actualizado correctamente' : 'Trabajo creado correctamente',
          severity: 'success',
        };
        navigate('/trabajos', { state: { snackbar } });
      }
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
        width: '70vw',
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

export default TrabajoForm;