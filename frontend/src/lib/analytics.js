import { monthlyData, salesData } from './demoData';
import { orderTotal } from './workflowRules';

export const historicalSummary = period => {
  const data = period === '7' ? salesData : monthlyData;
  return { data, chats: period === '7' ? 486 : 1820, interest: period === '7' ? 294 : 1046, orders: data.reduce((sum, d) => sum + d.orders, 0), revenue: data.reduce((sum, d) => sum + d.revenue, 0), response: 3.2 };
};
export function sessionSummary(state) {
  const flows = Object.values(state.flows); const approved = state.orders.filter(o => o.approvedAt);
  const created = state.orders.filter(o => o.origin === 'simulation');
  const checks = state.activity.filter(e => e.origin === 'simulation' && e.action === 'check');
  const processing = approved.map(o => o.processingMs).filter(v => Number.isFinite(v) && v >= 0);
  const average = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  const converted = new Set(approved.filter(o => o.flowId).map(o => o.flowId)).size;
  return { chats: flows.length, drafts: created.length, approved: approved.length, completed: state.orders.filter(o => o.completedAt).length, revenue: approved.reduce((sum, o) => sum + orderTotal(o), 0), checks: checks.length, blocked: checks.filter(c => c.blocked).length, duplicates: state.activity.filter(e => e.origin === 'simulation' && e.action === 'duplicate').length, responseMs: average(flows.map(f => f.responseMs)), responseSamples: flows.length, processingMs: average(processing), processingSamples: processing.length, conversion: flows.length ? converted / flows.length * 100 : null, converted };
}
export const formatDuration = value => value === null ? 'Belum ada sampel' : value < 100 ? '< 0,1 detik' : `${(value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} detik`;
export function kpiRows(summary) {
  return [
    { id: 'response', name: 'Kecepatan respons', baseline: '15–45 menit', target: '< 5 detik', observed: formatDuration(summary.responseMs), note: `${summary.responseSamples} respons skrip. Durasi pembuatan teks lokal, bukan kecepatan AI atau WhatsApp.` },
    { id: 'processing', name: 'Pemrosesan pesanan', baseline: '5–10 menit / transaksi', target: '< 10 detik; target hemat waktu 70%', observed: formatDuration(summary.processingMs), note: `${summary.processingSamples} draft disetujui. Waktu draft → persetujuan, termasuk waktu peninjauan pemilik. Bukan hasil penghematan operasional.` },
    { id: 'validation', name: 'Kesalahan varian / stok', baseline: '8–12% pesanan', target: '0% melalui validasi (target, bukan jaminan)', observed: `${summary.blocked} kendala ditahan / ${summary.checks} pemeriksaan`, note: 'Pemeriksaan yang ditahan, bukan tingkat kesalahan pesanan nyata. Termasuk informasi, stok, ongkir, dan kegagalan simulasi.' },
    { id: 'conversion', name: 'Konversi percakapan', baseline: '12–15%', target: '25–30%', observed: summary.conversion === null ? 'Belum ada sampel' : `${summary.conversion.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`, note: `${summary.converted} percakapan skenario dengan pesanan disetujui / ${summary.chats} percakapan skenario. Draft manual dan contoh awal dikecualikan.` },
  ];
}
export function reportRows(state, period) {
  const h = historicalSummary(period); const s = sessionSummary(state);
  return [
    ['Sumber', 'Indikator / tanggal', 'Nilai', 'Satuan / keterangan'],
    ['Historis contoh', 'Periode', period === '7' ? '15–21 September 2026' : '23 Agustus–21 September 2026', 'Bukan hasil sesi atau bisnis nyata'],
    ...h.data.flatMap(d => [['Historis contoh', d.day, d.revenue, 'Penjualan Rp'], ['Historis contoh', d.day, d.orders, 'Pesanan']]),
    ['Historis contoh', 'Total penjualan', h.revenue, 'Rp'], ['Historis contoh', 'Total pesanan', h.orders, 'pesanan'], ['Historis contoh', 'Total percakapan', h.chats, 'percakapan'], ['Historis contoh', 'Rata-rata respons', h.response, 'detik'],
    ['Sesi lokal', 'Mulai / reset terakhir', state.simulationStartedAt, 'Tidak dipengaruhi filter historis'],
    ...[['Percakapan skenario', s.chats], ['Draft baru', s.drafts], ['Persetujuan', s.approved], ['Pesanan dituntaskan', s.completed], ['Nilai pesanan disetujui Rp', s.revenue], ['Pemeriksaan', s.checks], ['Kendala ditahan', s.blocked], ['Duplikasi dicegah', s.duplicates]].map(([label, value]) => ['Sesi lokal', label, value, 'Hasil interaksi browser']),
    ...kpiRows(s).flatMap(row => [['Baseline manual PRD', row.name, row.baseline, 'Kondisi acuan, bukan pengukuran toko ini'], ['Target PRD', row.name, row.target, 'Target, bukan hasil terverifikasi'], ['Hasil simulasi', row.name, row.observed, row.note]]),
  ];
}