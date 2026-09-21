import { Link } from 'react-router-dom';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import { useStore } from '../../lib/store';
import { money } from '../../lib/demoData';
import { sessionSummary, kpiRows } from '../../lib/analytics';

export const SimulationStats = () => {
  const state = useStore(); const summary = sessionSummary(state);
  const items = [['chats', 'Percakapan skenario', summary.chats], ['drafts', 'Draft baru', summary.drafts], ['approved', 'Disetujui', summary.approved], ['completed', 'Dituntaskan', summary.completed], ['blocked', 'Kendala ditahan', summary.blocked], ['revenue', 'Nilai disetujui', money(summary.revenue)]];
  return <section className="simulation-stats" data-testid="simulation-summary"><div className="source-heading"><div><FlaskConical size={17} /><h2>Sesi simulasi Anda</h2><span className="source-label">Lokal · sejak reset</span></div><Link data-testid="start-simulation-link" to="/percakapan">Jalankan skenario<ArrowUpRight size={14} /></Link></div><div className="session-metrics">{items.map(([id, label, value]) => <div key={id}><span data-testid={`session-${id}-label`}>{label}</span><strong data-testid={`session-${id}`}>{value}</strong></div>)}</div><p className="simulation-footnote" data-testid="session-data-note">Hasil tindakan browser; tidak ditambahkan ke historis contoh. Nilai disetujui termasuk ongkir, bukan pembayaran diterima. Duplikasi dicegah: <b data-testid="session-duplicates">{summary.duplicates}</b>.</p></section>;
};
export const PrdKpiMatrix = () => {
  const rows = kpiRows(sessionSummary(useStore()));
  return <section className="prd-kpi-section"><div className="source-heading"><div><h2 data-testid="prd-kpi-title">Indikator dampak menurut PRD</h2></div><span className="source-label">Target ≠ hasil nyata</span></div><div className="kpi-matrix"><div className="kpi-matrix-head"><span>Indikator</span><span>Kondisi manual</span><span>Target PRD</span><span>Hasil sesi simulasi</span></div>{rows.map(row => <article className="kpi-row" key={row.id} data-testid={`prd-kpi-${row.id}`}><h3>{row.name}</h3><div><small>Baseline manual</small><span data-testid={`kpi-baseline-${row.id}`}>{row.baseline}</span></div><div><small>Target PRD</small><span className="kpi-target" data-testid={`kpi-target-${row.id}`}>{row.target}</span></div><div><small>Hasil sesi lokal</small><strong data-testid={`kpi-observed-${row.id}`}>{row.observed}</strong><p data-testid={`kpi-note-${row.id}`}>{row.note}</p></div></article>)}</div><p className="simulation-footnote" data-testid="prd-certainty-note">Matriks mengikuti bagian PRD yang terbaca. Angka simulasi bukan bukti performa produk, jaminan tanpa kesalahan, atau klaim kesesuaian 100%. Rincian beberapa bagian PRD masih belum tersedia.</p></section>;
};