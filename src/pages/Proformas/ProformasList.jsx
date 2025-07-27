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
} from "@mui/material";

const ProformasList = () => {
  const [proformas, setProformas] = useState([]);

  useEffect(() => {
    API.get("proformas/").then((res) => setProformas(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta proforma?")) {
      await API.delete(`proformas/${id}/`);
      setProformas(proformas.filter((p) => p.id !== id));
    }
  };

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
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proformas.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.cliente}</TableCell>
                <TableCell>{p.numero_proforma}</TableCell>
                <TableCell>{p.fecha}</TableCell>
                <TableCell>{p.estado}</TableCell>
                <TableCell>{p.total} €</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/proformas/editar/${p.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(p.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ProformasList;