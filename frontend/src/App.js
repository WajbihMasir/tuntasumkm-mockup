import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { AppShell } from './components/dashboard/AppShell';
import { Toaster } from './components/ui/sonner';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  return <BrowserRouter><StoreProvider><AppShell><Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/percakapan" element={<Conversations />} />
    <Route path="/pesanan" element={<Orders />} />
    <Route path="/produk" element={<Products />} />
    <Route path="/analitik" element={<Analytics />} />
    <Route path="/pengaturan" element={<Settings />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AppShell><Toaster position="bottom-right" richColors /></StoreProvider></BrowserRouter>;
}