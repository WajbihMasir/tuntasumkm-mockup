import { ArrowUpRight, Check, Package, ShieldCheck, X, MapPin, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from '../ui/sonner';
import { money } from '../../lib/demoData';
import { useStore } from '../../lib/store';

export const Avatar = ({ name, color = 'blue', small = false }) => <span className={`avatar ${color} ${small ? 'small' : ''}`} aria-hidden="true">{name.split(' ').map(s => s[0]).slice(0, 2).join('')}</span>;
export const Badge = ({ status, id }) => <span data-testid={id} className={`status-badge ${status.includes('persetujuan') ? 'amber' : status === 'Selesai' ? 'green' : status === 'Ditolak' ? 'red' : 'blue'}`}><i />{status}</span>;
export const PageTitle = ({ eyebrow, title, subtitle, children }) => <div className="page-title"><div>{eyebrow && <div className="eyebrow" data-testid="page-eyebrow">{eyebrow}</div>}<h1 data-testid="page-title">{title}</h1>{subtitle && <p data-testid="page-subtitle">{subtitle}</p>}</div><div className="page-actions">{children}</div></div>;
export const EmptyState = ({ text = 'Belum ada data yang sesuai.' }) => <div className="empty-state" data-testid="empty-state"><Package size={32} /><p>{text}</p></div>;
export const Trend = ({ children }) => <span className="trend"><ArrowUpRight size={13} />{children}</span>;
export const OrderDialog = ({ id, onClose }) => {
  const { orders, products, updateOrder } = useStore();
  const order = orders.find(o => o.id === id);
  const product = products.find(p => p.id === order?.product);
  const decide = status => { if (status === 'Diproses' && (!product || product.stock < order.qty)) { toast.error('Stok tidak mencukupi. Perbarui stok sebelum menyetujui pesanan.'); return; } updateOrder(id, status); toast.success(status === 'Diproses' ? 'Pesanan disetujui dan siap diproses' : status === 'Selesai' ? 'Pesanan berhasil dituntaskan' : 'Pesanan ditolak'); onClose(); };
  return <Dialog open={!!order} onOpenChange={open => !open && onClose()}><DialogContent className="app-modal" data-testid="order-detail-dialog">
    <div className="modal-icon blue"><Package size={23} /></div><DialogTitle data-testid="order-detail-title">Detail pesanan #{order?.id}</DialogTitle><DialogDescription data-testid="order-detail-description">{order?.name} · {order?.date}</DialogDescription>
    {order && <><Badge status={order.status} id="order-detail-status" /><div className="order-product" data-testid="order-detail-product"><span className="product-mini" style={{ background: product?.color }}><Package size={24} /></span><div><strong>{product?.name}</strong><p>{product?.variant} · {order.qty} pcs</p></div><strong>{money(order.qty * order.price)}</strong></div>
    <div className="address" data-testid="order-detail-address"><MapPin size={17} /><div><strong>Alamat pengiriman</strong><p>{order.address}</p></div></div>
    <div className="total-row"><span><Truck size={16} />Ongkos kirim</span><strong data-testid="order-shipping">{money(order.shipping)}</strong></div><div className="total-row grand"><span>Total pesanan</span><strong data-testid="order-total">{money(order.qty * order.price + order.shipping)}</strong></div>
    {order.status === 'Menunggu persetujuan' && <><div className="safe-note" data-testid="approval-safety-note"><ShieldCheck size={16} />Keputusan akhir tetap di tangan Anda.</div><div className="modal-actions"><Button variant="outline" data-testid="reject-order-button" onClick={() => decide('Ditolak')}><X size={16} />Tolak</Button><Button className="primary-button" data-testid="approve-order-button" onClick={() => decide('Diproses')}><Check size={16} />Setujui pesanan</Button></div></>}
    {order.status === 'Diproses' && <Button className="primary-button" data-testid="complete-order-button" onClick={() => decide('Selesai')}><Check size={16} />Tandai selesai</Button>}</>}
  </DialogContent></Dialog>;
};