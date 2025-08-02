import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@mui/material';

const NumPedidoDialog = ({ open, onClose, onSubmit, loading }) => {
  const [numPedido, setNumPedido] = useState('');

  const handleSubmit = () => {
    onSubmit(numPedido);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Introducir Número de Pedido</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Introduce el número de pedido que se asignará a todas las reparaciones asociadas a esta proforma.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Número de Pedido"
          type="text"
          fullWidth
          value={numPedido}
          onChange={e => setNumPedido(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="success" variant="contained" disabled={loading || !numPedido}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NumPedidoDialog;
