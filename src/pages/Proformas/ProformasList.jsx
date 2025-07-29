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

const ProformasList = () => {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("proformas/con-reparaciones/")
      .then((res) => setProformas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta proforma?")) {
      await API.delete(`proformas/${id}/`);
      setProformas(proformas.filter((p) => p.id !== id));
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body1" fontWeight="bold">
          Cargando proformas...
        </Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Proformas
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/proformas/nueva"
        >
          Añadir Proforma
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Reparaciones Asociadas</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proformas.map((proforma) => (
              <TableRow key={proforma.id}>
                <TableCell>{proforma.numero_proforma}</TableCell>
                <TableCell>{proforma.cliente_nombre || proforma.cliente}</TableCell>
                <TableCell>{proforma.fecha}</TableCell>
                <TableCell>{proforma.estado_nombre || proforma.estado}</TableCell>
                <TableCell>{proforma.total} €</TableCell>
                <TableCell>
                  {proforma.reparaciones && proforma.reparaciones.length > 0
                    ? proforma.reparaciones.map(t => `${t.fecha} - ${t.localizacion} - ${t.trabajo}`).join(', ')
                    : '—'}
                </TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/proformas/editar/${proforma.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(proforma.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {proformas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No hay proformas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ProformasList;