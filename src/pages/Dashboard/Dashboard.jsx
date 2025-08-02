import React, { useState, useEffect } from 'react';
import { API } from '../../api/axios';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';
import './Dashboard.css';

// Custom tooltip to show Subtotal, IVA and Total per slice
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, subtotal, iva, total } = payload[0].payload;
    return (
      <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc', padding: 10 }}>
        <Typography variant="subtitle2">{name}</Typography>
        <Typography variant="body2">Subtotal: {subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</Typography>
        <Typography variant="body2">IVA: {iva.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</Typography>
        <Typography variant="body2">Total: {total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</Typography>
      </div>
    );
  }
  return null;
};

// custom label for Pie charts to format values in EUR, sin decimales si terminan en .00
const renderPieLabel = ({ value }) => {
  const isWhole = value % 1 === 0;
  return value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  });
};

// tooltip for BarChart showing subtotal, IVA and total per client
const BarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const items = payload.filter(p => p.value && p.value !== 0);
    if (!items.length) return null;
    return (
      <div style={{ backgroundColor: '#f9f9f9', border: '1px solid #ccc', padding: 10, maxWidth: 300, overflowY: 'auto' }}>
        {items.map((p, i) => {
          const name = p.name;
          const subtotal = p.value;
          const iva = Number((subtotal * 0.21).toFixed(2));
          const total = Number((subtotal + iva).toFixed(2));
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <Typography variant="subtitle2">{name}</Typography>
              <Typography variant="body2">Subtotal: {subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Typography>
              <Typography variant="body2">IVA: {iva.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Typography>
              <Typography variant="body2">Total: {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Typography>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

const quarters = [
  { num: 1, label: '1º T', startMonth: 1 },
  { num: 2, label: '2º T', startMonth: 4 },
  { num: 3, label: '3º T', startMonth: 7 },
  { num: 4, label: '4º T', startMonth: 10 },
];

export default function Dashboard() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('facturas/')
      .then((res) => setFacturas(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const year = now.getFullYear();

  // helper to compute data per quarter
  const computeQuarterData = (q) => {
    const start = new Date(year, q.startMonth - 1, 1);
    const end = new Date(year, q.startMonth - 1 + 3, 1);
    const relevant = facturas.filter((f) => {
      const d = new Date(f.fecha);
      return d >= start && d < end;
    });
    // group by client
    const map = {};
    relevant.forEach((f) => {
      const key = f.cliente_nombre;
      if (!map[key]) map[key] = { name: key, subtotal: 0 };
      map[key].subtotal += f.total;
    });
    // Prepare data with subtotal, compute IVA and total for tooltip
    const data = Object.values(map).map((item) => {
      const subtotal = item.subtotal;
      const iva = Number((subtotal * 0.21).toFixed(2));
      const total = Number((subtotal + iva).toFixed(2));
      return { name: item.name, subtotal, iva, total };
    });
    // Compute totals for header: subtotal sum, IVA 21%, total = subtotal + IVA
    const subtotalSum = data.reduce((acc, cur) => acc + cur.subtotal, 0);
    const ivaSum = Number((subtotalSum * 0.21).toFixed(2));
    const totalSum = Number((subtotalSum + ivaSum).toFixed(2));
    const totals = { subtotal: subtotalSum, iva: ivaSum, total: totalSum };
    return { ...q, data, totals, show: now >= start };
  };

  const quarterData = quarters.map(computeQuarterData);

  // annual summary: aggregate subtotals per client and compute IVA and total
  const annualMap = {};
  quarterData.forEach((q) => {
    q.data.forEach((item) => {
      if (!annualMap[item.name]) annualMap[item.name] = { name: item.name, subtotal: 0 };
      annualMap[item.name].subtotal += item.subtotal;
    });
  });
  const annualData = Object.values(annualMap).map((item) => {
    const subtotal = item.subtotal;
    const iva = Number((subtotal * 0.21).toFixed(2));
    const total = Number((subtotal + iva).toFixed(2));
    return { name: item.name, subtotal, iva, total };
  });
  // compute header totals: subtotal sum, IVA 21%, and total
  const annualSubtotal = annualData.reduce((acc, cur) => acc + cur.subtotal, 0);
  const annualIva = Number((annualSubtotal * 0.21).toFixed(2));
  const annualTotal = Number((annualSubtotal + annualIva).toFixed(2));
  const annualTotals = { subtotal: annualSubtotal, iva: annualIva, total: annualTotal };

  // compute client names and bar chart data
  const clientNames = annualData.map(item => item.name);
  // obtener trimestres con datos sin invertir para BarChart
  const filteredQuarters = quarterData.filter(q => q.data.length > 0);
  // invertir solo para las tarjetas
  const visibleQuarters = [...filteredQuarters].reverse();
  // datos de barras mantienen el orden cronológico
  const barData = filteredQuarters.map(q => {
    const row = { label: q.label };
    clientNames.forEach(name => {
      const entry = q.data.find(item => item.name === name);
      row[name] = entry ? entry.subtotal : 0;
    });
    return row;
  });

  return (
    <>
      {/* Loading screen with logo and spinner */}
      <div className="loading-screen" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: '#fff',
        opacity: loading ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: loading ? 'auto' : 'none', zIndex: 1000
      }}>
        <img src="/favicon.webp" alt="Logo" style={{ width: 100, marginBottom: 16 }} />
        <CircularProgress />
      </div>
      {/* Main dashboard content */}
      <div className="dashboard-wrapper" style={{
        opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease', pointerEvents: loading ? 'none' : 'auto'
      }}>
        <Box className="dashboard-container">

          {/* Annual summary with pie and bar charts */}
          <Paper elevation={2} className="dashboard-annual-card">
            <Typography variant="h6" align="center">Facturación Anual {year}</Typography>
            <Typography variant="subtitle1" align="center">Subtotal: {annualTotals.subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</Typography>
            <Typography variant="subtitle1" align="center">IVA: {annualTotals.iva.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</Typography>
            <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>Total: {annualTotals.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</Typography>
            <div className="dashboard-charts-container">
              <div className="dashboard-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={annualData} dataKey="subtotal" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={renderPieLabel}>
                      {annualData.map((entry, index) => (<Cell key={`cell-annual-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="dashboard-chart dashboard-chart-bar">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="label" />
                    <YAxis
                      tickFormatter={value => {
                        const isWhole = value % 1 === 0;
                        return value.toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: isWhole ? 0 : 2,
                          maximumFractionDigits: isWhole ? 0 : 2,
                        });
                      }}
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip content={<BarTooltip />} />
                    {clientNames.map((name, index) => (
                      <Bar key={name} dataKey={name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Paper>

          {/* Quarter details cards */}
          <div className="dashboard-quarter-container">
            {visibleQuarters.map((q, idx) => (
              <Paper key={idx} elevation={2} className="dashboard-quarter-card">
                <Typography variant="h6" align="center">{q.label}</Typography>
                <Typography variant="subtitle1" align="center">
                  Subtotal: {q.totals.subtotal.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </Typography>
                <Typography variant="subtitle1" align="center">
                  IVA: {q.totals.iva.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </Typography>
                <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
                  Total: {q.totals.total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={q.data}
                      dataKey="subtotal"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label={renderPieLabel}
                    >
                      {q.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            ))}
          </div>
        </Box>
      </div>
    </>
  );
}
