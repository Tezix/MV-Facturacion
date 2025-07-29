import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { Link } from "react-router-dom";
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";

const TrabajosList = () => {
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("trabajos/")
      .then((res) => setTrabajos(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta trabajo?")) {
      await API.delete(`trabajos/${id}/`);
      setTrabajos(trabajos.filter((t) => t.id !== id));
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando trabajos...
        </Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Trabajos
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/trabajos/crear"
        >
          Nueva Trabajo
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre Reparación</strong></TableCell>
              <TableCell><strong>Precio</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trabajos.map((trabajo) => (
              <TableRow key={trabajo.id}>
                <TableCell>{trabajo.nombre_reparacion}</TableCell>
                <TableCell>{Number(trabajo.precio).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/trabajos/editar/${trabajo.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(trabajo.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {trabajos.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No hay trabajos disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TrabajosList;