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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const ProformasList = () => {
  const [proformas, setProformas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, proformaId: null });
  // State for showing success after conversion
  const [successDialog, setSuccessDialog] = useState({ open: false, facturaNumero: '' });

  const handleConvertToFactura = async (id) => {
    setConvertingId(id);
    try {
      const res = await API.post(`proformas/${id}/convertir-a-factura/`);
      // Recargar la lista de proformas
      const updated = await API.get("proformas/con-reparaciones/");
      setProformas(updated.data);
      // Mostrar diálogo de éxito
      setSuccessDialog({ open: true, facturaNumero: res.data.factura?.numero_factura || '' });
    } catch {
      alert("Error al convertir la proforma a factura");
    } finally {
      setConvertingId(null);
      setConfirmDialog({ open: false, proformaId: null });
    }
  };

  useEffect(() => {
    API.get("proformas/con-reparaciones/")
      .then((res) => setProformas(res.data))
      .finally(() => setLoading(false));
  }, []);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, proformaId: null });
  const handleDelete = async (id) => {
    try {
      await API.delete(`proformas/${id}/`);
      setProformas(proformas.filter((p) => p.id !== id));
    } catch {
      alert("Error al eliminar la proforma");
    } finally {
      setDeleteDialog({ open: false, proformaId: null });
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center">
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
          Nueva Proforma
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
                  <IconButton
                    component={Link}
                    to={`/proformas/editar/${proforma.id}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faPencilAlt} />
                  </IconButton>
                  <IconButton
                    onClick={() => setDeleteDialog({ open: true, proformaId: proforma.id })}
                    color="error"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
                                    {!proforma.factura && (
                  <Button
                    onClick={() => setConfirmDialog({ open: true, proformaId: proforma.id })}
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={convertingId === proforma.id}
                  >
                    {convertingId === proforma.id ? "Convirtiendo..." : "Convertir a Factura"}
                  </Button>
                                    )}
                </TableCell>
      {/* Dialogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, proformaId: null })}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar esta proforma? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, proformaId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleDelete(deleteDialog.proformaId)}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de confirmación para convertir a factura */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, proformaId: null })}
      >
        <DialogTitle>Confirmar conversión</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres convertir esta proforma en factura? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, proformaId: null })} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={() => handleConvertToFactura(confirmDialog.proformaId)}
            color="success"
            variant="contained"
            disabled={convertingId === confirmDialog.proformaId}
          >
            {convertingId === confirmDialog.proformaId ? "Convirtiendo..." : "Convertir"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de éxito */}
      {successDialog.open && (
        <Dialog
          open={successDialog.open}
          onClose={() => setSuccessDialog({ open: false, facturaNumero: '' })}
        >
          <DialogTitle>Conversión exitosa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Proforma convertida a factura correctamente.<br />
              Número de factura: {successDialog.facturaNumero}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSuccessDialog({ open: false, facturaNumero: '' })}
              variant="contained"
              color="primary"
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
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