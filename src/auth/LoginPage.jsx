import { useState } from 'react';
import favicon from '../../public/favicon.webp';
import {API} from '../api/axios';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await API.post('login/', {
        username,
        password
      });
      const token = res.data.token;
      localStorage.setItem('token', token);
      onLogin();
    } catch (err) {
      setError('Credenciales inválidas', err);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 400,
        mx: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <img src={favicon} alt="Favicon" style={{ width: 64}} />
      </Box>
      <Typography variant="h5" mb={2}>
        Login
      </Typography>
      <form onSubmit={handleLogin}>
        <TextField
          label="Usuario"
          variant="outlined"
          fullWidth
          margin="normal"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          sx={{ mt: 2 }}
          disabled={!username || !password}
        >
          Iniciar sesión
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </form>
    </Box>
  );
}