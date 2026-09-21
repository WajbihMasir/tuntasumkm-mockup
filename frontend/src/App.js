import { useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { AppShell } from './components/dashboard/AppShell';
import { Toaster } from './components/ui/sonner';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import './App.css';
import './workflow.css';

export default function App() {
  return <BrowserRouter><StoreProvider><RouteEffects /><Routes>
    <Route path="/" element={<Landing />} />
    <Route element={<AppShell />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/percakapan" element={<Conversations />} />
      <Route path="/pesanan" element={<Orders />} />
      <Route path="/produk" element={<Products />} />
      <Route path="/analitik" element={<Analytics />} />
      <Route path="/pengaturan" element={<Settings />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes><Toaster position="bottom-right" richColors /></StoreProvider></BrowserRouter>;
}

const RouteEffects = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    document.title = pathname === '/' ? 'TuntasUMKM — Dari Percakapan, Jadi Penjualan.' : 'TuntasUMKM — Ruang Kerja';
    const frame = requestAnimationFrame(() => {
      const target = pathname === '/' && window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
      else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
};