import { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login/', {
        username,
        password
      });
      const token = res.data.token;
      localStorage.setItem('token', token);
      onLogin(); // Cambia el estado en App
    } catch (e) {
      setError('Credenciales inválidas', e);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded shadow">
      <h2 className="text-xl mb-4">Login</h2>
      <form onSubmit={handleLogin}>
        <input
          className="border p-2 mb-2 w-full"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 mb-2 w-full"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white p-2 w-full rounded" type="submit">
          Iniciar sesión
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </div>
  );
}