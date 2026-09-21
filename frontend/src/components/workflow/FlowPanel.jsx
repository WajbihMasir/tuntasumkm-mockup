import { useState } from 'react';
import { ClipboardCheck, Repeat2, ArrowRight, RefreshCw, UserRound } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from '../ui/sonner';
import { useStore } from '../../lib/store';
import { money } from '../../lib/demoData';
import { RequirementsForm } from './RequirementsForm';
import { ProcessTrail, DecisionHistory } from './ProcessTrail';
import { SCENARIOS } from '../../lib/scenarios';

export const FlowPanel = ({ chat, onOrder }) => {
  const { flows, products, orders, checkFlow, createFlowDraft, repeatMessage, toggleHandler } = useStore();
  const flow = flows[chat.id]; const order = orders.find(o => o.id === chat.order);
  const [tab, setTab] = useState('needs'); const [value, setValue] = useState(flow?.requirements); const [notice, setNotice] = useState(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(flow?.requirements);
  const report = result => { setNotice(result); (result.ok ? toast.success : toast.error)(result.message); };
  if (!flow) return <div className="flow-content"><ProcessTrail order={order} products={products} prefix="chat-process" /><DecisionHistory events={order?.events} prefix="chat-history" /></div>;
  const check = () => report(checkFlow(chat.id, value));
  const create = () => { const result = createFlowDraft(chat.id); report(result); if (result.ok && !result.duplicate) onOrder(result.id); };
  return <div className="flow-content">
    <div className="workflow-heading"><strong data-testid="flow-scenario-name">{SCENARIOS.find(s => s.id === flow.scenario)?.title}</strong><span className="source-label">Skenario terpandu</span></div>
    <div className="workflow-tabs">{[['needs', 'Kebutuhan'], ['process', '7 tahap'], ['history', 'Riwayat']].map(([id, label]) => <button key={id} data-testid={`flow-tab-${id}`} className={tab === id ? 'selected' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>
    {tab === 'needs' && <>
      {order ? <div className="linked-draft" data-testid="flow-linked-draft"><ClipboardCheck size={23} /><strong>Draft #{order.id}</strong><span>{order.status} · versi {order.version}</span><b>{money(order.qty * order.price + order.shipping)}</b><p>Perubahan dilanjutkan melalui detail pesanan. Stok hanya berubah setelah persetujuan.</p><Button className="primary-button" data-testid="flow-open-order" onClick={() => onOrder(order.id)}>Tinjau draft<ArrowRight size={15} /></Button><Button variant="outline" data-testid="repeat-draft-button" onClick={create}>Ulangi pengajuan (uji duplikasi)</Button></div> : <>
        <div className={`requirements-status ${flow.check?.ok && !dirty ? 'valid' : ''}`} data-testid="requirements-status">{dirty ? 'Perubahan belum diperiksa' : flow.check?.ok ? 'Informasi lengkap · pemeriksaan lulus' : flow.check ? 'Perlu perhatian sebelum pengajuan' : 'Menunggu pemeriksaan kebutuhan'}</div>
        <RequirementsForm value={value} onChange={setValue} prefix="flow" owner={chat.handler === 'owner'} />
        {flow.check && <div className={`validation-results ${flow.check.ok ? 'valid' : ''}`} data-testid="flow-validation"><strong>{flow.check.ok ? 'Hasil pemeriksaan terakhir' : 'Kendala yang perlu dituntaskan'}</strong>{flow.check.ok ? <p>{flow.check.productName} · {flow.check.variant} ditemukan, stok {flow.check.available} pcs. Ongkir simulasi {money(flow.check.shipping)}.</p> : <ul>{flow.check.issues.map((issue, i) => <li key={issue} data-testid={`flow-issue-${i}`}>{issue}</li>)}</ul>}{dirty && <p>Hasil ini belum mencakup perubahan formulir terbaru.</p>}</div>}
        <div className="workflow-actions"><Button variant="outline" data-testid="check-requirements-button" onClick={check}>{flow.check?.technical?.length ? <RefreshCw size={15} /> : <ClipboardCheck size={15} />}{flow.check?.technical?.length ? 'Coba pemeriksaan lagi' : 'Periksa & hitung ongkir'}</Button><Button className="primary-button" data-testid="create-flow-draft-button" disabled={!flow.check?.ok || dirty} onClick={create}>Ajukan draft<ArrowRight size={15} /></Button></div>
        {flow.check && !flow.check.ok && chat.handler !== 'owner' && <button className="workflow-text-button" data-testid="recovery-takeover-button" onClick={() => report(toggleHandler(chat.id))}><UserRound size={14} />Tangani kendala sebagai pemilik</button>}
      </>}
      <button className="workflow-text-button" data-testid="repeat-message-button" onClick={() => report(repeatMessage(chat.id))}><Repeat2 size={14} />Simulasikan pesan berulang</button>
      <p className="simulation-footnote" role="status" aria-live="polite" data-testid="duplicate-message-count">{flow.duplicateCount || 0} pesan berulang · {flow.duplicateSubmissions || 0} pengajuan ulang dicegah. Kebutuhan tetap satu.</p>
      {notice && <div className={`workflow-notice ${notice.ok ? 'valid' : ''}`} role="status" data-testid="flow-action-notice">{notice.message}</div>}
    </>}
    {tab === 'process' && <ProcessTrail flow={flow} order={order} products={products} prefix="chat-process" />}
    {tab === 'history' && <DecisionHistory events={flow.events} prefix="chat-history" />}
  </div>;
};