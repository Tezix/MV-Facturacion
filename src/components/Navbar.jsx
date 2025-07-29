import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const mainLinks = [
  { label: 'Facturas', path: '/facturas' },
  { label: 'Proformas', path: '/proformas' },
  { label: 'Reparaciones', path: '/reparaciones' },
];

const dropdownLinks = [
  { label: 'Clientes', path: '/clientes' },
  { label: 'Tarifas', path: '/tarifas' },
  { label: 'Tarifas Clientes', path: '/tarifas-clientes' },
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
    <AppBar position="static" elevation={3} sx={{ backgroundColor: "black", borderRadius: "10px" }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
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

          {/* Dropdown para "Otros" */}
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