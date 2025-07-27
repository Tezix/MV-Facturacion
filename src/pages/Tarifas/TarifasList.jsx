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

const TarifasList = () => {
  const [tarifas, setTarifas] = useState([]);

  useEffect(() => {
    API.get("tarifas/").then((res) => setTarifas(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta tarifa?")) {
      await API.delete(`tarifas/${id}/`);
      setTarifas(tarifas.filter((t) => t.id !== id));
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tarifas
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/tarifas/crear"
        >
          Nueva Tarifa
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Nombre Trabajo</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tarifas.map((tarifa) => (
              <TableRow key={tarifa.id}>
                <TableCell>{tarifa.id}</TableCell>
                <TableCell>{tarifa.nombre_trabajo}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/tarifas/editar/${tarifa.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(tarifa.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tarifas.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No hay tarifas disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TarifasList;