import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

export const Reveal = ({ children, className = '', delay = 0, ...props }) => {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }} {...props}>{children}</motion.div>;
};

export const Brand = ({ light = false, suffix = 'main' }) => (
  <a href="#" aria-label="TuntasUMKM, kembali ke atas" className={`brand ${light ? 'brand-light' : ''}`} data-testid={`brand-${suffix}`}>
    <img src="/images/brand-mark.png" alt="" width="43" height="40" />
    <span>Tuntas<span className="brand-green">UMKM</span><small>Dari Percakapan, Jadi Penjualan.</small></span>
  </a>
);

export const ActionButton = ({ children, className = '', testId }) => (
  <Button asChild className={`action-button ${className}`}>
    <Link to="/dashboard" data-testid={testId}>{children}<span className="button-arrow"><ArrowUpRight size={18} /></span></Link>
  </Button>
);

export const Chapter = ({ number, children, light = false }) => <div className={`chapter ${light ? 'chapter-light' : ''}`} data-testid={`chapter-${number}`}><span>{number}</span>{children}</div>;