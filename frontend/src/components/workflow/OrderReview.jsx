import { useState } from 'react';
import { Check, Pencil, Undo2, X, Package, MapPin, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from '../ui/sonner';
import { useStore } from '../../lib/store';
import { money } from '../../lib/demoData';
import { requirementsFromOrder, timeLabel } from '../../lib/workflowRules';
import { RequirementsForm } from './RequirementsForm';
import { ProcessTrail, DecisionHistory } from './ProcessTrail';

export const OrderReview = ({ id, onClose }) => {
  const { orders } = useStore(); const order = orders.find(o => o.id === id);
  return <Dialog open={!!order} onOpenChange={open => !open && onClose()}><DialogContent className="app-modal order-review-modal" data-testid="order-detail-dialog"><DialogTitle data-testid="order-detail-title">Detail pesanan #{order?.id}</DialogTitle><DialogDescription data-testid="order-detail-description">{order?.name} · {order?.origin === 'simulation' ? 'Hasil tindakan lokal' : 'Data contoh awal'}</DialogDescription>{order && <ReviewBody key={order.id} order={order} onClose={onClose} />}</DialogContent></Dialog>;
};
const ReviewBody = ({ order, onClose }) => {
  const { products, flows, decideOrder, editOrder } = useStore();
  const [tab, setTab] = useState('detail'); const [editing, setEditing] = useState(false); const [form, setForm] = useState(null);
  const [decision, setDecision] = useState(null); const [reason, setReason] = useState(''); const [notice, setNotice] = useState(null);
  const product = products.find(p => p.id === order.product); const pending = ['Menunggu persetujuan', 'Perlu revisi'].includes(order.status);
  const report = result => { setNotice(result); (result.ok ? toast.success : toast.error)(result.message); return result.ok; };
  const decide = status => { const result = decideOrder(order.id, status, reason); if (report(result)) { setDecision(null); setReason(''); } };
  const edit = () => { setForm(requirementsFromOrder(order)); setEditing(true); setDecision(null); setNotice(null); };
  const save = () => { if (report(editOrder(order.id, form))) setEditing(false); };
  return <>
    <div className="review-status-row"><span className={`status-badge ${pending ? 'amber' : order.status === 'Ditolak' ? 'red' : 'green'}`} data-testid="order-detail-status"><i />{order.status}</span><span data-testid="order-version">Versi {order.version || 1}</span></div>
    <div className="workflow-tabs">{[['detail', 'Rincian'], ['process', '7 tahap'], ['history', 'Riwayat keputusan']].map(([id, label]) => <button key={id} data-testid={`order-tab-${id}`} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>
    {tab === 'detail' && <>
      {editing ? <><RequirementsForm value={form} onChange={setForm} prefix="edit-order" owner /><div className="modal-actions"><Button variant="outline" data-testid="cancel-edit-order-button" onClick={() => setEditing(false)}>Batal</Button><Button className="primary-button" data-testid="save-edit-order-button" onClick={save}>Simpan & ajukan ulang</Button></div></> : <>
        <div className="order-product" data-testid="order-detail-product"><span className="product-mini" style={{ background: product?.color }}><Package size={24} /></span><div><strong>{product?.name}</strong><p>{product?.variant} · {order.qty} pcs</p></div><strong>{money(order.qty * order.price)}</strong></div>
        <div className="address" data-testid="order-detail-address"><MapPin size={17} /><div><strong>{order.name} · {order.city}</strong><p>{order.address}</p></div></div>
        <div className="total-row"><span>Ongkir simulasi · {order.service || 'manual'}</span><strong data-testid="order-shipping">{money(order.shipping)}</strong></div><div className="total-row grand"><span>Total pesanan</span><strong data-testid="order-total">{money(order.qty * order.price + order.shipping)}</strong></div>
        {order.reason && <div className="validation-results" data-testid="order-decision-reason"><strong>Alasan {order.status.toLowerCase()}</strong><p>{order.reason}</p></div>}
        {order.decisionAt && <div className="decision-receipt" data-testid="order-decision-receipt"><ShieldCheck size={17} /><div><strong>{order.decisionBy} · Pemilik</strong><span>{timeLabel(order.decisionAt)}</span><p>{order.stockApplied ? `Stok telah dikurangi ${order.qty} pcs satu kali.` : 'Stok belum dikurangi.'}</p></div></div>}
        {pending && !decision && <><div className="safe-note" data-testid="approval-safety-note"><ShieldCheck size={16} />Persetujuan mengurangi stok lokal. Tidak mengirim pesan atau memesan kurir.</div><div className="review-action-grid"><Button variant="outline" data-testid="edit-order-button" onClick={edit}><Pencil size={14} />Ubah draft</Button><Button variant="outline" data-testid="request-revision-button" disabled={order.status === 'Perlu revisi'} onClick={() => { setDecision('Perlu revisi'); setNotice(null); }}><Undo2 size={14} />Minta revisi</Button><Button variant="outline" data-testid="reject-order-button" onClick={() => { setDecision('Ditolak'); setNotice(null); }}><X size={14} />Tolak</Button><Button className="primary-button" data-testid="approve-order-button" disabled={order.status !== 'Menunggu persetujuan'} onClick={() => decide('Diproses')}><Check size={14} />Setujui pesanan</Button></div></>}
        {order.status === 'Ditolak' && !decision && <Button variant="outline" data-testid="reopen-revision-button" onClick={() => setDecision('Perlu revisi')}><Undo2 size={14} />Buka kembali untuk revisi</Button>}
        {decision && <div className="decision-form"><label>Alasan {decision.toLowerCase()}<textarea data-testid="decision-reason-input" value={reason} onChange={e => setReason(e.target.value)} maxLength={500} rows="3" placeholder="Jelaskan koreksi atau alasan keputusan..." /></label><div className="modal-actions"><Button variant="outline" data-testid="cancel-decision-button" onClick={() => { setDecision(null); setReason(''); }}>Batal</Button><Button className="primary-button" data-testid="confirm-decision-button" disabled={!reason.trim()} onClick={() => decide(decision)}>Simpan keputusan</Button></div></div>}
        {order.status === 'Diproses' && <Button className="primary-button" data-testid="complete-order-button" onClick={() => decide('Selesai')}><Check size={16} />Tandai selesai</Button>}
        {order.status === 'Selesai' && <div className="safe-note" data-testid="order-complete-receipt"><Check size={16} />Pesanan dituntaskan. Stok tidak dikurangi ulang.</div>}
      </>}
      {notice && <div className={`workflow-notice ${notice.ok ? 'valid' : ''}`} role="status" data-testid="order-action-notice">{notice.message}</div>}
    </>}
    {tab === 'process' && <ProcessTrail flow={flows[order.flowId]} order={order} products={products} prefix="order-process" />}
    {tab === 'history' && <DecisionHistory events={order.events} prefix="order-history" />}
  </>;
};