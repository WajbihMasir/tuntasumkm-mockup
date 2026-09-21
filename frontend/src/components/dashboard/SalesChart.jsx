import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { money, salesData, monthlyData } from '../../lib/demoData';
import { Trend } from './Shared';

export const SalesChart = ({ period = '7', analytics = false }) => {
  const [metric, setMetric] = useState('revenue');
  const data = period === '7' ? salesData : monthlyData;
  const total = data.reduce((sum, d) => sum + d[metric], 0);
  return <section className={`panel sales-panel ${analytics ? 'analytics-chart' : ''}`} data-testid="sales-chart-panel"><div className="panel-heading"><div><h2 data-testid="sales-chart-heading">Performa penjualan</h2><p data-testid="sales-chart-caption">Setiap percakapan, peluang baru.</p></div><label className="chart-select"><select data-testid="sales-metric-select" aria-label="Metrik grafik" value={metric} onChange={e => setMetric(e.target.value)}><option value="revenue">Penjualan</option><option value="orders">Pesanan</option></select><ChevronDown size={13} /></label></div>
    <div className="chart-summary"><strong data-testid="chart-total">{metric === 'revenue' ? money(total) : `${total} pesanan`}</strong><Trend>{metric === 'revenue' ? '24,8%' : '12,5%'}</Trend><span className="chart-comparison">perbandingan historis contoh</span></div>
    <div className="chart-canvas" data-testid="sales-chart">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 600, height: 190 }}>
        <AreaChart data={data} margin={{ top: 16, right: 14, left: -10, bottom: 0 }}>
          <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.015} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e9edf3" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b94a3' }} axisLine={false} tickLine={false} tickMargin={14} minTickGap={20} />
          <YAxis tickFormatter={v => metric === 'revenue' ? `${v / 1000000} jt` : v} tick={{ fontSize: 11, fill: '#8b94a3' }} tickLine={false} axisLine={false} tickMargin={10} tickCount={4} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e6eaf0', fontSize: 12 }} formatter={v => [metric === 'revenue' ? money(v) : `${v} pesanan`, metric === 'revenue' ? 'Penjualan' : 'Pesanan']} />
          <Area type="monotone" dataKey={metric} stroke="#2563eb" strokeWidth={2.5} fill="url(#salesFill)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 3 }} animationDuration={650} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="chart-legend"><span /><span data-testid="chart-legend-label">{metric === 'revenue' ? 'Total penjualan' : 'Jumlah pesanan'}</span><span className="chart-date" data-testid="chart-date">{period === '7' ? '15 – 21 September 2026' : '23 Agustus – 21 September 2026'}</span></div>
  </section>;
};