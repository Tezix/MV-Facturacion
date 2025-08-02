import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

const mainLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Reparaciones', path: '/reparaciones' },
  { label: 'Facturas', path: '/facturas' },
  { label: 'Proformas', path: '/proformas' },
];

const dropdownLinks = [
  { label: 'Clientes', path: '/clientes' },
  { label: 'Precios Trabajos', path: '/trabajos' },
  { label: 'Precios especiales', path: '/trabajos-clientes' },
  { label: 'Localizaciones', path: '/localizaciones' },
  { label: 'Estados', path: '/estados' },
];

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" elevation={3} sx={{ backgroundColor: "black", width: "100%", top: 0, left: 0, borderRadius: 0 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link to="/">
            <Box
            component="img"
            src="/favicon.webp"
            alt="Logo"
            className="logo-img"
            sx={{ backgroundColor: 'white', borderRadius: '50%', padding: 1 }}
            />
          </Link>
          {mainLinks.map(({ label, path }) => (
            <Button
              key={path}
              component={Link}
              to={path}
              color="inherit"
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(137, 188, 234, 1)',
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
        <Box>
          <Button
            color="inherit"
            onClick={handleClick}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(137, 188, 234, 1)',
              },
            }}
          >
            Otros
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                backgroundColor: '#222',
                color: 'white',
              },
            }}
          >
            {dropdownLinks.map(({ label, path }) => (
              <MenuItem
                key={path}
                component={Link}
                to={path}
                onClick={handleClose}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(137, 188, 234, 1)',
                  },
                }}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}