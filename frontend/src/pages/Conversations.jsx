import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, CheckCheck, MessageSquare, Sparkles, ChevronRight, ArrowLeft, Play, UserRound, ListChecks } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/sonner';
import { useStore } from '../lib/store';
import { PageTitle, Avatar, Badge, OrderDialog, EmptyState } from '../components/dashboard/Shared';
import { ScenarioPicker } from '../components/workflow/ScenarioPicker';
import { FlowPanel } from '../components/workflow/FlowPanel';

export default function Conversations() {
  const { chats, sendMessage, readChat, finishChat, toggleHandler, settings } = useStore();
  const [params, setParams] = useSearchParams(); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('Semua');
  const [message, setMessage] = useState(''); const [order, setOrder] = useState(null); const [picker, setPicker] = useState(false); const [view, setView] = useState('chat');
  const selected = chats.find(c => c.id === params.get('chat'));
  useEffect(() => { if (selected?.unread) readChat(selected.id); }, [selected?.id, selected?.unread, readChat]);
  const filtered = chats.filter(c => `${c.name} ${c.preview}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'Semua' || (filter === 'Belum dibaca' ? c.unread : c.status === 'Perlu persetujuan')));
  const send = e => { e.preventDefault(); if (!message.trim() || !selected) return; sendMessage(selected.id, message.trim()); setMessage(''); toast.success('Balasan lokal disimpan. Tidak diproses otomatis oleh AI.'); };
  const select = id => { setParams({ chat: id }); setMessage(''); setView('chat'); };
  const handler = () => { const r = toggleHandler(selected.id); (r.ok ? toast.success : toast.error)(r.message); };
  return <>
    <PageTitle title="Percakapan" subtitle="Dari kebutuhan pelanggan sampai keputusan pemilik."><Button className="primary-button" data-testid="open-scenarios-button" onClick={() => setPicker(true)}><Play size={15} />Jalankan skenario</Button></PageTitle>
    <div className={`chat-workspace enhanced-chat ${selected ? 'chat-selected' : ''}`}>
      <aside className="chat-list">
        <label className="search-field"><Search size={17} /><input data-testid="chat-search" aria-label="Cari percakapan" placeholder="Cari pelanggan atau pesan..." value={search} onChange={e => setSearch(e.target.value)} /></label>
        <div className="small-tabs">{['Semua', 'Belum dibaca', 'Persetujuan'].map((f, i) => <button key={f} className={filter === f ? 'selected' : ''} data-testid={`chat-filter-${i}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
        <div className="chat-list-items">{filtered.length ? filtered.map(c => <button className={`chat-list-item ${selected?.id === c.id ? 'selected' : ''}`} data-testid={`chat-item-${c.id}`} key={c.id} onClick={() => select(c.id)}><Avatar name={c.name} color={c.color} /><div><div className="chat-list-title"><strong>{c.name}</strong><small>{c.time}</small></div><p>{c.preview}</p><span className="chat-list-status">{c.status} · {c.origin === 'simulation' ? 'Sesi lokal' : 'Contoh awal'}</span></div>{c.unread && <i className="unread-dot" />}</button>) : <EmptyState text="Percakapan tidak ditemukan." />}</div>
      </aside>
      <section className="chat-detail">{selected ? <>
        <div className="chat-detail-header"><button className="icon-button chat-back" data-testid="chat-back-button" aria-label="Kembali ke daftar" onClick={() => setParams({})}><ArrowLeft size={19} /></button><Avatar name={selected.name} color={selected.color} small /><div><strong data-testid="chat-customer-name">{selected.name}</strong><small data-testid="chat-handler-label">{selected.handler === 'owner' ? 'Ditangani pemilik' : settings.assistant ? 'Asisten simulasi' : 'Asisten dijeda'}</small></div><Button variant="outline" className="resolve-button" data-testid="resolve-chat-button" aria-label={selected.status === 'Selesai' ? 'Buka kembali percakapan' : 'Tandai percakapan selesai'} onClick={() => { finishChat(selected.id); toast.success('Status percakapan diperbarui'); }}><CheckCheck size={15} />{selected.status === 'Selesai' ? 'Buka kembali' : 'Tandai selesai'}</Button></div>
        <div className="chat-workflow-toolbar"><div className="workflow-tabs"><button className={view === 'chat' ? 'selected' : ''} data-testid="conversation-view-chat" onClick={() => setView('chat')}><MessageSquare size={14} />Pesan</button><button className={view === 'flow' ? 'selected' : ''} data-testid="conversation-view-flow" onClick={() => setView('flow')}><ListChecks size={14} />Kebutuhan & proses</button></div><button className="handler-button" data-testid="toggle-handler-button" onClick={handler}><UserRound size={14} />{selected.handler === 'owner' ? 'Kembalikan ke asisten' : 'Ambil alih'}</button></div>
        {view === 'flow' ? <div className="flow-scroll"><FlowPanel key={selected.id} chat={selected} onOrder={setOrder} /></div> : <>
          <div className="chat-messages" data-testid="chat-messages"><span className="chat-date" data-testid="chat-data-source">{selected.origin === 'simulation' ? 'Percakapan skenario lokal' : '21 September 2026 · Contoh awal'}</span>{selected.messages.map((m, i) => <div className={`message ${m.from}`} data-testid={`message-${selected.id}-${i}`} key={`${selected.id}-${i}`}>{m.from === 'assistant' && <span className="message-sender"><Sparkles size={12} />Asisten simulasi</span>}{m.from === 'owner' && <span className="message-sender">Anda · lokal</span>}<p>{m.text}</p><small>{m.time}{m.from !== 'customer' && <CheckCheck size={13} />}</small></div>)}</div>
          <div className="chat-order-strip"><div><ListChecks size={16} /><span>{selected.order ? `Pesanan #${selected.order}` : 'Kebutuhan belum menjadi pesanan'}</span></div><button data-testid="chat-view-order-button" onClick={() => selected.order ? setOrder(selected.order) : setView('flow')}>{selected.order ? 'Lihat pesanan' : 'Periksa kebutuhan'}<ChevronRight size={15} /></button></div>
          <form className="reply-form" onSubmit={send}><input data-testid="chat-reply-input" aria-label="Tulis balasan lokal" placeholder="Balasan lokal · tanpa pemahaman AI" maxLength={2000} value={message} onChange={e => setMessage(e.target.value)} /><Button className="primary-button" data-testid="send-reply-button" type="submit" disabled={!message.trim()} aria-label="Simpan balasan lokal"><Send size={18} /></Button></form><div className="chat-status-footer"><Badge status={selected.status} id="chat-current-status" /></div>
        </>}
      </> : <div className="chat-empty"><MessageSquare size={44} /><h2 data-testid="chat-empty-title">Satu kebutuhan. Sampai tuntas.</h2><p data-testid="chat-empty-description">Percakapan contoh dan skenario operasional.</p><Button className="primary-button" data-testid="empty-start-scenario-button" onClick={() => setPicker(true)}><Play size={15} />Pilih skenario</Button></div>}</section>
    </div>
    <ScenarioPicker open={picker} onClose={() => setPicker(false)} onStart={id => { setFilter('Semua'); setSearch(''); select(id); setView('flow'); }} />
    <OrderDialog id={order} onClose={() => setOrder(null)} />
  </>;
}