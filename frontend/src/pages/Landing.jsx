import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { Navigation, Footer } from '../components/landing/Shell';
import { Hero } from '../components/landing/Hero';
import { Manifesto, Workflow, Impact, FAQ, Closing } from '../components/landing/Sections';
import '../components/landing/landing.css';

export default function Landing() {
  const navigate = useNavigate(); const reducedMotion = useReducedMotion();
  useLayoutEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -90 }, duration: 1.1, smoothWheel: true });
    return () => lenis.destroy();
  }, [reducedMotion]);
  const openDemo = () => navigate('/dashboard');
  return <div className="landing-page" data-testid="landing-page">
    <a href="#main" className="skip-link" data-testid="skip-to-content">Langsung ke konten</a>
    <Navigation onDemo={openDemo} />
    <main id="main" tabIndex={-1}>
      <Hero onDemo={openDemo} />
      <Manifesto />
      <Workflow onDemo={openDemo} />
      <Impact />
      <FAQ />
      <Closing onDemo={openDemo} />
    </main>
    <Footer />
  </div>;
}