import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Download, ChevronDown, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/sonner';
import { useStore } from '../lib/store';
import { downloadCSV } from '../lib/demoData';
import { reportRows } from '../lib/analytics';
import { PageTitle } from '../components/dashboard/Shared';
import { SalesChart } from '../components/dashboard/SalesChart';
import { Metrics, Approvals, RecentChats, Activity } from '../components/dashboard/OverviewWidgets';
import { SimulationStats } from '../components/workflow/SimulationStats';

export const PeriodSelect = ({ period, setPeriod }) => <label className="period-select"><CalendarDays size={15} /><select data-testid="period-select" aria-label="Periode historis contoh" value={period} onChange={e => setPeriod(e.target.value)}><option value="7">7 hari contoh</option><option value="30">30 hari contoh</option></select><ChevronDown size={14} /></label>;
export const ExportButton = ({ period }) => {
  const state = useStore();
  return <Button variant="outline" className="export-button" data-testid="export-report-button" onClick={() => { downloadCSV(`laporan-tuntas-${period}-hari.csv`, reportRows(state, period)); toast.success('Laporan historis, KPI, dan sesi lokal diunduh'); }}><Download size={15} />Unduh laporan</Button>;
};
export default function Dashboard() {
  const [period, setPeriod] = useState('7'); const { settings } = useStore();
  return <><PageTitle eyebrow="RUANG KERJA · DEMONSTRASI OPERASIONAL" title={`Selamat datang, Bu ${settings.owner}.`} subtitle="Asisten menyiapkan. Pemilik memeriksa dan memutuskan."><PeriodSelect period={period} setPeriod={setPeriod} /><ExportButton period={period} /></PageTitle>
    <div className="assistant-banner"><span className="banner-icon"><Sparkles size={22} /></span><div><strong data-testid="assistant-banner-title">{settings.assistant ? 'Satu percakapan, sampai pesanan dituntaskan.' : 'Asisten dijeda. Kendali tetap di tangan Anda.'}</strong><p data-testid="assistant-banner-description">{settings.assistant ? 'Skenario terpandu, pemeriksaan kebutuhan, dan keputusan pemilik di ruang demo lokal.' : 'Pemilik tetap dapat mengambil alih percakapan dan mengelola draft.'}</p></div><Link to={settings.assistant ? '/percakapan' : '/pengaturan'} data-testid="assistant-banner-link">{settings.assistant ? 'Mulai skenario' : 'Kelola asisten'}<ArrowRight size={16} /></Link></div>
    <SimulationStats /><div className="historical-caption" data-testid="dashboard-historical-note">Historis contoh · {period === '7' ? '15–21 September 2026' : '23 Agustus–21 September 2026'} · bukan hasil sesi lokal</div><Metrics period={period} />
    <div className="dashboard-grid"><div className="dashboard-main"><SalesChart period={period} /><RecentChats /></div><div className="dashboard-aside"><Approvals /><Activity /></div></div><div className="control-footnote" data-testid="control-footnote"><ShieldCheck size={14} />Keputusan penting menunggu pemilik.<span>Tanpa pesan, transaksi, atau pengiriman sungguhan.</span></div>
  </>;
}