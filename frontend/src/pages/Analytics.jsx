import { useState } from 'react';
import { PageTitle } from '../components/dashboard/Shared';
import { SalesChart } from '../components/dashboard/SalesChart';
import { Metrics } from '../components/dashboard/OverviewWidgets';
import { PeriodSelect, ExportButton } from './Dashboard';
import { SimulationStats, PrdKpiMatrix } from '../components/workflow/SimulationStats';
import { historicalSummary } from '../lib/analytics';

export default function Analytics() {
  const [period, setPeriod] = useState('7'); const [tab, setTab] = useState('kpi'); const history = historicalSummary(period);
  return <><PageTitle title="Analitik bisnis" subtitle="Kondisi manual, target PRD, dan hasil simulasi — terpisah dan dapat ditelusuri."><PeriodSelect period={period} setPeriod={setPeriod} /><ExportButton period={period} /></PageTitle>
    <div className="analytics-source-tabs workflow-tabs"><button data-testid="analytics-tab-kpi" className={tab === 'kpi' ? 'selected' : ''} onClick={() => setTab('kpi')}>KPI PRD & sesi lokal</button><button data-testid="analytics-tab-historical" className={tab === 'historical' ? 'selected' : ''} onClick={() => setTab('historical')}>Historis contoh</button></div>
    {tab === 'kpi' ? <><SimulationStats /><PrdKpiMatrix /><p className="simulation-footnote" data-testid="analytics-period-scope">Pilihan 7/30 hari berlaku untuk historis contoh di laporan. Sesi lokal dihitung sejak reset dan tidak berubah saat periode historis diganti.</p></> : <>
      <div className="historical-caption" data-testid="analytics-historical-note">Historis contoh · {period === '7' ? '15–21 September 2026' : '23 Agustus–21 September 2026'} · tidak berubah karena tindakan sesi</div>
      <Metrics period={period} /><SalesChart period={period} analytics />
      <section className="historical-conversion"><h2 data-testid="conversion-heading">Konversi historis contoh</h2><strong data-testid="historical-conversion-value">{(history.orders / history.chats * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%</strong><p data-testid="historical-conversion-formula">{history.orders} pesanan / {history.chats} percakapan</p></section>
    </>}
  </>;
}