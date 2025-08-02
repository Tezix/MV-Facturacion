import React from 'react';
import { CircularProgress } from '@mui/material';

const overlayStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  backgroundColor: '#fff',
  zIndex: 1000,
  transition: 'opacity 0.5s ease',
};

const contentStyle = {
  transition: 'opacity 0.5s ease',
};

export default function LoadingOverlay({ loading, children }) {
  return (
    <>
      <div
        style={{
          ...overlayStyle,
          opacity: loading ? 1 : 0,
          pointerEvents: loading ? 'auto' : 'none',
        }}
      >
        <img src="/favicon.webp" alt="Logo" style={{ width: 100, marginBottom: 16 }} />
        <CircularProgress />
      </div>
      <div
        style={{
          ...contentStyle,
          opacity: loading ? 0 : 1,
          pointerEvents: loading ? 'none' : 'auto',
        }}
      >
        {children}
      </div>
    </>
  );
}
