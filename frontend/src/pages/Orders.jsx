import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, Download, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from '../components/ui/sonner';
import { useStore } from '../lib/store';
import { money, downloadCSV } from '../lib/demoData';
import { PageTitle, Badge, Avatar, OrderDialog, EmptyState } from '../components/dashboard/Shared';

const STATUSES = ['Menunggu persetujuan', 'Perlu revisi', 'Diproses', 'Selesai', 'Ditolak'];
export default function Orders() {
  const { orders, products } = useStore(); const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(''); const [filter, setFilter] = useState('Semua'); const [source, setSource] = useState('all'); const [newOrder, setNewOrder] = useState(false);
  const filtered = orders.filter(o => (filter === 'Semua' || o.status === filter) && (source === 'all' || o.origin === source) && `${o.id} ${o.name}`.toLowerCase().includes(search.toLowerCase()));
  const exportOrders = () => { downloadCSV('pesanan-tuntas.csv', [['No. Pesanan', 'Pelanggan', 'Produk', 'Jumlah', 'Total', 'Status', 'Sumber', 'Versi', 'Pengambil keputusan', 'Waktu keputusan', 'Alasan'], ...filtered.map(o => [o.id, o.name, products.find(p => p.id === o.product)?.name, o.qty, o.qty * o.price + o.shipping, o.status, o.origin === 'simulation' ? 'Sesi lokal' : 'Contoh awal', o.version, o.decisionBy, o.decisionAt, o.reason])]); toast.success('Daftar pesanan dan keputusan diunduh'); };
  return <>
    <PageTitle title="Pesanan" subtitle="Periksa draft, koreksi kebutuhan, lalu putuskan dengan kendali penuh."><Button variant="outline" className="export-button" data-testid="export-orders-button" onClick={exportOrders}><Download size={16} />Ekspor</Button><Button className="primary-button" data-testid="new-order-button" onClick={() => setNewOrder(true)}><Plus size={16} />Draft manual</Button></PageTitle>
    <div className="order-summary extended-summary">{STATUSES.map((status, i) => <button key={status} data-testid={`order-summary-${i}`} className={`order-summary-item ${filter === status ? 'selected' : ''}`} onClick={() => setFilter(filter === status ? 'Semua' : status)}><span className={`summary-dot status-${i}`} /><span>{status}</span><strong data-testid={`order-status-count-${i}`}>{orders.filter(o => o.status === status).length}</strong></button>)}</div>
    <section className="panel orders-panel">
      <div className="table-toolbar"><div className="small-tabs order-tabs">{['Semua', ...STATUSES].map((f, i) => <button key={f} data-testid={`order-filter-${i}`} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f === 'Menunggu persetujuan' ? 'Persetujuan' : f}</button>)}</div><label className="search-field"><Search size={16} /><input data-testid="order-search" aria-label="Cari pesanan" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pesanan atau pelanggan..." /></label></div>
      <div className="order-source-filter"><label>Sumber data<select data-testid="order-source-filter" value={source} onChange={e => setSource(e.target.value)}><option value="all">Semua sumber</option><option value="historical">Contoh awal</option><option value="simulation">Hasil sesi lokal</option></select></label><span>Contoh awal terpisah dari tindakan sesi pada laporan analitik.</span></div>
      <div className="table-scroll"><table className="data-table"><thead><tr><th>Pesanan</th><th>Pelanggan</th><th>Produk</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>{filtered.map(o => <tr key={o.id} data-testid={`order-row-${o.id}`}><td><button className="order-id-link" data-testid={`open-order-${o.id}`} onClick={() => setParams({ order: o.id })}>#{o.id}</button><small>{o.origin === 'simulation' ? 'Sesi lokal' : 'Contoh awal'} · v{o.version || 1}</small></td><td><div className="table-customer"><Avatar name={o.name} small color="blue" /><span>{o.name}</span></div></td><td>{products.find(p => p.id === o.product)?.name}<small>{o.qty} pcs · {products.find(p => p.id === o.product)?.variant}</small></td><td className="amount-cell">{money(o.qty * o.price + o.shipping)}</td><td><Badge status={o.status} id={`order-status-${o.id}`} /></td><td><button className="icon-button" data-testid={`order-detail-${o.id}`} aria-label={`Detail pesanan ${o.id}`} onClick={() => setParams({ order: o.id })}><ChevronRight size={17} /></button></td></tr>)}</tbody></table></div>
      {!filtered.length && <EmptyState text="Pesanan tidak ditemukan." />}<div className="table-footer" data-testid="orders-result-count">Menampilkan {filtered.length} dari {orders.length} pesanan</div>
    </section>
    <OrderDialog id={params.get('order')} onClose={() => setParams({})} /><NewOrderDialog open={newOrder} onClose={() => setNewOrder(false)} />
  </>;
}
const NewOrderDialog = ({ open, onClose }) => {
  const { products, addOrder } = useStore(); const [product, setProduct] = useState('p1'); const [qty, setQty] = useState(1);
  const selected = products.find(p => p.id === product);
  const submit = e => {
    e.preventDefault(); const form = new FormData(e.target); const name = form.get('name').trim(); const address = form.get('address').trim();
    const result = addOrder({ name, address, city: form.get('city').trim(), product, qty: Number(qty), price: selected.price, shipping: Number(form.get('shipping')), service: 'manual', shippingNote: 'Tarif manual pemilik pada pembuatan draft', status: 'Menunggu persetujuan', time: 'Baru saja' });
    if (!result.ok) return toast.error(result.message);
    toast.success(`Draft #${result.id} dibuat. Belum ada pengurangan stok.`); onClose();
  };
  return <Dialog open={open} onOpenChange={v => !v && onClose()}><DialogContent className="app-modal" data-testid="new-order-dialog"><DialogTitle data-testid="new-order-title">Buat draft manual</DialogTitle><DialogDescription data-testid="new-order-description">Dicatat pemilik. Ongkir merupakan tarif simulasi manual.</DialogDescription><form className="form-stack" onSubmit={submit}>
    <label>Nama pelanggan<input data-testid="new-order-customer" name="name" required maxLength={80} placeholder="Nama lengkap" /></label>
    <label>Produk<select data-testid="new-order-product" value={product} onChange={e => setProduct(e.target.value)}>{products.map(p => <option key={p.id} value={p.id}>{`${p.name} · ${p.variant}`}</option>)}</select></label>
    <div className="form-grid"><label>Jumlah<input data-testid="new-order-quantity" type="number" value={qty} onChange={e => setQty(e.target.value)} min="1" max={selected?.stock || 1} required /></label><label>Ongkir simulasi (Rp)<input data-testid="new-order-shipping" name="shipping" type="number" min="0" max="1000000" required defaultValue="18000" /></label></div>
    <label>Alamat pengiriman<input data-testid="new-order-address" name="address" required minLength={8} maxLength={200} placeholder="Jalan dan nomor rumah" /></label><label>Kota<input data-testid="new-order-city" name="city" required maxLength={60} placeholder="Kota tujuan" /></label>
    <div className="form-hint" data-testid="new-order-subtotal">Subtotal produk: {money((Number(qty) || 0) * (selected?.price || 0))}</div><Button className="primary-button" type="submit" data-testid="save-new-order-button"><ShoppingBag size={16} />Simpan draft pesanan</Button>
  </form></DialogContent></Dialog>;
};