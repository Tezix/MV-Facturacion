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

export default function FacturasList() {
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    API.get('facturas/').then((res) => setFacturas(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta factura?')) {
      await API.delete(`facturas/${id}/`);
      setFacturas(facturas.filter((f) => f.id !== id));
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Facturas
        </Typography>
        <Button
          variant="contained"
          color="success"
          component={Link}
          to="/facturas/crear"
        >
          Nueva Factura
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
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map((factura) => (
              <TableRow key={factura.id}>
                <TableCell>{factura.numero_factura}</TableCell>
                <TableCell>{factura.cliente_nombre || factura.cliente}</TableCell>
                <TableCell>{factura.fecha}</TableCell>
                <TableCell>{factura.estado_nombre || factura.estado}</TableCell>
                <TableCell>{factura.total} €</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/facturas/editar/${factura.id}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(factura.id)}
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
}