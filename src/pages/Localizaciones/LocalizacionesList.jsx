import { useEffect, useState } from 'react';
import { API } from '../../api/axios';
import { Link } from 'react-router-dom';
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
} from '@mui/material';

export default function LocalizacionTrabajoList() {
  const [localizaciones, setLocalizaciones] = useState([]);

  useEffect(() => {
    API.get('localizaciones_trabajos/').then((res) => setLocalizaciones(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta localización?')) {
      await API.delete(`localizaciones_trabajos/${id}/`);
      setLocalizaciones(localizaciones.filter((l) => l.id !== id));
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Localizaciones de Trabajo</Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/localizaciones/crear"
        >
          Nueva Localización
        </Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Dirección</strong></TableCell>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Localidad</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {localizaciones.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell>{loc.direccion}</TableCell>
                <TableCell>{loc.numero}</TableCell>
                <TableCell>{loc.localidad}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/localizaciones/editar/${loc.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(loc.id)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {localizaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  No hay localizaciones registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}