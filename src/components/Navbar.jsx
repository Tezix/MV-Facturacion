import { AppBar, Toolbar, Button, Box, Menu, MenuItem, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';


const emitidasLinks = [
  { label: 'Reparaciones', path: '/reparaciones' },
  { label: 'Facturas', path: '/facturas' },
  { label: 'Proformas', path: '/proformas' },
];

const gastosLinks = [
  { label: 'Gastos', path: '/gastos/registrar' },
];

const dropdownLinks = [
  { label: 'Clientes', path: '/clientes' },
  { label: 'Precios Trabajos', path: '/trabajos' },
  { label: 'Precios especiales', path: '/trabajos-clientes' },
  { label: 'Localizaciones', path: '/localizaciones' },
  { label: 'Estados', path: '/estados' },
];

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Todos los enlaces para el menú móvil
  const allLinks = [
    ...emitidasLinks,
    ...gastosLinks,
    { label: 'Gastos', path: '/gastos/registrar' },
    ...dropdownLinks,
  ];

  return (
    <AppBar position="fixed" elevation={3} sx={{ backgroundColor: "black", width: "100%", top: 0, left: 0, borderRadius: 0 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link to="/">
          <Box
            component="img"
            src="/favicon.webp"
            alt="Logo"
            className="logo-img"
            sx={{ backgroundColor: 'white', borderRadius: '50%', padding: 1 }}
          />
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {emitidasLinks.map(({ label, path }) => (
                <Button
                  key={path}
                  color="inherit"
                  component={Link}
                  to={path}
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
              {gastosLinks.map(({ label, path }) => (
                <Button
                  key={path}
                  color="inherit"
                  component={Link}
                  to={path}
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
          </>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={handleMobileMenuToggle}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </IconButton>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <Menu
            anchorEl={null}
            open={mobileMenuOpen}
            onClose={handleMobileMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: '#222',
                color: 'white',
                width: '100%',
                maxWidth: '300px',
                mt: 1,
              },
            }}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {allLinks.map(({ label, path }) => (
              <MenuItem
                key={path}
                component={Link}
                to={path}
                onClick={handleMobileMenuClose}
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
        )}
      </Toolbar>
    </AppBar>
  );
}