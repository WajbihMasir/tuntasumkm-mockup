import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Play, Check, CheckCheck, ShieldCheck, Package, MessageCircle, Sparkles, RotateCcw } from 'lucide-react';
import { ActionButton } from './Common';

export const Hero = ({ onDemo }) => {
  const [approved, setApproved] = useState(false);
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const parallax = useTransform(scrollYProgress, [0, 1], [0, 65]);
  const lines = ['Chat ramai.', 'Bisnis tetap', 'tuntas.'];
  return <>
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero-grid wrap">
        <div className="hero-copy">
          <motion.div className="eyebrow hero-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} data-testid="hero-eyebrow"><span className="live-dot" />ASISTEN BISNIS UNTUK UMKM INDONESIA</motion.div>
          <h1 id="hero-title" data-testid="hero-title">{lines.map((line, i) => <span className="line-mask" key={line}><motion.span initial={reduced ? false : { y: '112%', rotate: 3 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1, delay: 0.12 + i * 0.12, ease: [0.22, 1, 0.36, 1] }} className={i === 2 ? 'hero-last-line' : ''}>{line}{i === 2 && <span className="headline-check" aria-hidden="true"><Check strokeWidth={3} /></span>}</motion.span></span>)}</h1>
          <motion.div initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.8 }}>
            <p className="hero-description" data-testid="hero-description">Lebih dari chatbot. Asisten yang bantu cek stok, siapkan pesanan, dan bereskan operasional.<br /><strong>Anda tetap pegang kendali.</strong></p>
            <div className="hero-actions"><ActionButton onClick={onDemo} testId="hero-demo">Coba Demo</ActionButton><a className="text-button" href="#cara-kerja" data-testid="hero-how-it-works"><span className="play-circle"><Play size={12} fill="currentColor" /></span>Cara kerjanya</a></div>
            <div className="hero-assurance" data-testid="hero-assurance"><ShieldCheck size={15} /><span>Asisten bekerja. Keputusan tetap di tangan Anda.</span></div>
          </motion.div>
        </div>
        <motion.div className="hero-visual" style={{ y: reduced ? 0 : parallax }} initial={reduced ? false : { opacity: 0, y: 35 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 0.25 }}>
          <div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" />
          <div className="photo-frame"><img src="/images/merchant.webp" alt="Pelaku usaha menyiapkan paket pesanan di ruang usahanya" fetchPriority="high" /><div className="photo-shade" /><div className="photo-caption" data-testid="hero-photo-caption"><span>UNTUK ANDA YANG TERUS BERUSAHA.</span><p>Fokus ke usaha.<br />Bukan tumpukan chat.</p></div><span className="photo-index" aria-hidden="true">01 / SEHARI-HARI, LEBIH RINGAN</span></div>
          <div className="visual-top-note" data-testid="hero-visual-note"><span className="live-dot" />Bisnis jalan, tanpa kewalahan.</div>
          <motion.div className="chat-card" initial={reduced ? false : { opacity: 0, x: -25, rotate: -5 }} animate={{ opacity: 1, x: 0, rotate: -5 }} transition={{ delay: 0.9, duration: 0.7 }}>
            <div className="chat-card-top"><span className="whatsapp-icon"><MessageCircle size={18} /></span><span data-testid="sample-customer"><strong>Pelanggan</strong><small>Pesan baru</small></span><span className="chat-time">09.41</span></div><p data-testid="sample-chat">Kak, yang warna sage masih ready?<br />Mau 2 pcs, kirim ke Bandung ya 🙏</p><span className="chat-ticks"><CheckCheck size={14} /></span>
          </motion.div>
          <div className="assistant-orb" aria-hidden="true"><img src="/images/brand-mark.png" alt="" /><span><Sparkles size={12} /></span></div>
          <motion.div className={`order-card ${approved ? 'order-approved' : ''}`} initial={reduced ? false : { opacity: 0, y: 25, rotate: 3 }} animate={{ opacity: 1, y: 0, rotate: 3 }} transition={{ delay: 1.1, duration: 0.7 }}>
            <div className="order-card-top"><span className="order-icon">{approved ? <CheckCheck size={18} /> : <Package size={18} />}</span><div data-testid="hero-order-status"><strong>{approved ? 'Pesanan disetujui!' : 'Pesanan siap diproses'}</strong><small>{approved ? 'Simulasi selesai · tidak dikirim' : 'Tuntas sudah menyiapkannya'}</small></div><span className="tiny-spark"><Sparkles size={14} /></span></div>
            <div className="order-details" data-testid="hero-order-details"><span><Check size={12} /> Stok tersedia</span><span><Check size={12} /> Ongkir dihitung</span></div>
            <button className="approval-button" onClick={() => setApproved(!approved)} data-testid="hero-approve-order">{approved ? <><RotateCcw size={14} />Ulangi simulasi</> : <><Check size={15} />Setujui pesanan<ArrowUpRight size={15} /></>}</button>
            <span className="sample-label" data-testid="hero-simulation-label">ILUSTRASI ALUR PRODUK</span>
          </motion.div>
          <div className="handwritten" aria-hidden="true">Anda yang pegang kendali.<svg viewBox="0 0 100 42"><path d="M5 5Q35 43 88 18M75 15l15 2-8 12" /></svg></div>
        </motion.div>
      </div>
      <div className="hero-bottom wrap"><a href="#solusi" data-testid="discover-more"><ArrowDown size={14} />KENALI CARA KERJA BARU</a><span data-testid="hero-footer-message">DARI PERCAKAPAN, JADI PENJUALAN.<span className="mini-star">✳</span></span></div>
    </section>
    <div className="marquee" aria-label="Respon lebih cepat, proses lebih mudah, kontrol di tangan Anda, pertumbuhan lebih nyata" data-testid="brand-marquee"><div className="marquee-track">{[0, 1, 2].map(i => <div className="marquee-set" key={i} aria-hidden="true">{['Respon lebih cepat', 'Proses lebih mudah', 'Kontrol di tangan Anda', 'Pertumbuhan lebih nyata'].map(t => <span key={t}>{t}<span className="marquee-star">✳</span></span>)}</div>)}</div></div>
  </>;
};