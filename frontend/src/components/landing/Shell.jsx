import { useState } from 'react';
import { Menu, X, ArrowUpRight, ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brand, ActionButton } from './Common';

const links = [['Solusi', 'solusi'], ['Cara kerja', 'cara-kerja'], ['Dampak', 'dampak'], ['FAQ', 'faq']];
export const Navigation = ({ onDemo }) => {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="nav-inner">
      <Brand suffix="header" />
      <nav className="desktop-nav" aria-label="Navigasi utama">{links.map(([label, target]) => <a key={target} href={`#${target}`} data-testid={`nav-${target}`}>{label}</a>)}</nav>
      <ActionButton onClick={onDemo} testId="nav-demo" className="nav-cta">Coba Demo</ActionButton>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-nav" data-testid="mobile-menu-toggle">{open ? <X /> : <Menu />}</button>
    </div>
    <AnimatePresence>{open && <motion.nav id="mobile-nav" className="mobile-nav" aria-label="Navigasi seluler" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{links.map(([label, target]) => <a key={target} onClick={() => setOpen(false)} href={`#${target}`} data-testid={`mobile-nav-${target}`}>{label}<ArrowUpRight size={18} /></a>)}<button data-testid="mobile-nav-demo" onClick={() => { setOpen(false); onDemo(); }}>Coba Demo<ArrowUpRight size={18} /></button></motion.nav>}</AnimatePresence>
  </header>;
};

export const Footer = () => <footer className="footer wrap">
  <div className="footer-top"><Brand suffix="footer" /><p data-testid="footer-tagline">Operasional lebih ringan.<br />Bisnis lebih tuntas.</p><a href="#" className="back-top" data-testid="back-to-top" aria-label="Kembali ke atas"><ArrowUp size={20} /></a></div>
  <div className="footer-bottom"><span data-testid="copyright">© {new Date().getFullYear()} TuntasUMKM</span><span data-testid="footer-origin">Dibuat untuk semangat usaha Indonesia. <span className="indonesia-flag" aria-label="Indonesia" /></span><span data-testid="footer-project">IDWEBHOST AI HACKFEST 2026 <ArrowUpRight size={12} /></span></div>
</footer>;