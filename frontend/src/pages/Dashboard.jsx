import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Download, ChevronDown, Sparkles, ArrowRight, Sun, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/sonner';
import { useStore } from '../lib/store';
import { downloadCSV, salesData, monthlyData } from '../lib/demoData';
import { PageTitle } from '../components/dashboard/Shared';
import { SalesChart } from '../components/dashboard/SalesChart';
import { Metrics, Approvals, RecentChats, Activity } from '../components/dashboard/OverviewWidgets';

export const PeriodSelect = ({ period, setPeriod }) => <label className="period-select"><CalendarDays size={15} /><select data-testid="period-select" aria-label="Periode laporan" value={period} onChange={e => setPeriod(e.target.value)}><option value="7">7 hari terakhir</option><option value="30">30 hari terakhir</option></select><ChevronDown size={14} /></label>;
export const ExportButton = ({ period }) => <Button variant="outline" className="export-button" data-testid="export-report-button" onClick={() => { downloadCSV(`laporan-tuntas-${period}-hari.csv`, [['Tanggal', 'Penjualan (Rp)', 'Pesanan'], ...(period === '7' ? salesData : monthlyData).map(d => [d.day, d.revenue, d.orders])]); toast.success('Laporan berhasil diunduh'); }}><Download size={15} />Unduh laporan</Button>;
export default function Dashboard() {
  const [period, setPeriod] = useState('7'); const { settings } = useStore();
  return <><PageTitle eyebrow={<><span className="greeting-sun"><Sun size={15} /></span>SENIN, 21 SEPTEMBER 2026</>} title={`Selamat pagi, Bu ${settings.owner}.`} subtitle="Hari baru, peluang baru. Yuk, lihat perkembangan bisnis Anda."><PeriodSelect period={period} setPeriod={setPeriod} /><ExportButton period={period} /></PageTitle>
    <div className="assistant-banner"><span className="banner-icon"><Sparkles size={22} /></span><div><strong data-testid="assistant-banner-title">{settings.assistant ? 'Bisnis tetap jalan. Anda bisa lebih tenang.' : 'Istirahat sebentar. Kendali tetap di tangan Anda.'}</strong><p data-testid="assistant-banner-description">{settings.assistant ? <>Asisten Tuntas sudah membantu <b>124 percakapan</b> hari ini. Ada lebih banyak waktu untuk hal penting.</> : 'Asisten sedang dijeda. Anda tetap dapat mengelola pesanan dan membalas percakapan.'}</p></div><Link to={settings.assistant ? '/analitik' : '/pengaturan'} data-testid="assistant-banner-link">{settings.assistant ? 'Lihat kinerja asisten' : 'Kelola asisten'}<ArrowRight size={16} /></Link></div>
    <Metrics period={period} /><div className="dashboard-grid"><div className="dashboard-main"><SalesChart period={period} /><RecentChats /></div><div className="dashboard-aside"><Approvals /><Activity /></div></div><div className="control-footnote" data-testid="control-footnote"><ShieldCheck size={14} />Asisten mengerjakan. Anda memutuskan.<span>Semua tindakan penting menunggu persetujuan Anda.</span></div>
  </>;
}