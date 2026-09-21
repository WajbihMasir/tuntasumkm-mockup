import { buildScenario } from './scenarios';
import { validateRequirements, requirementsFromOrder, nextOrderId, now, draftChanges } from './workflowRules';

const ok = (state, message, extra = {}) => ({ state, result: { ok: true, message, ...extra } });
const fail = (state, message) => ({ state, result: { ok: false, message } });
export function record(s, { chatId, orderId, action, text, detail = '', actor, changes, blocked = false }) {
  const at = now(); const event = { id: crypto.randomUUID(), at, chatId, orderId, action, text, detail, actor: actor || s.settings.owner, changes, blocked, origin: 'simulation', time: new Date(at).toLocaleTimeString('id-ID'), kind: action === 'check' ? 'stock' : action === 'reply' ? 'chat' : 'order' };
  return { ...s, activity: [event, ...s.activity], flows: chatId && s.flows[chatId] ? { ...s.flows, [chatId]: { ...s.flows[chatId], events: [...s.flows[chatId].events, event] } } : s.flows, orders: orderId ? s.orders.map(o => o.id === orderId ? { ...o, events: [...(o.events || []), event] } : o) : s.orders };
}
export function startScenario(s, key) {
  if (!s.settings.assistant) return fail(s, 'Aktifkan asisten di Pengaturan sebelum memulai skenario.');
  const { chat, flow } = buildScenario(key, s.chats.filter(c => c.origin === 'simulation').length + 1, s.products);
  const next = record({ ...s, chats: [chat, ...s.chats], flows: { ...s.flows, [chat.id]: flow } }, { chatId: chat.id, action: 'start', text: 'Percakapan skenario dimulai', detail: chat.preview, actor: 'Asisten simulasi' });
  return ok(next, 'Skenario siap diperiksa', { id: chat.id });
}
export function checkFlow(s, id, requirements) {
  const flow = s.flows[id]; const chat = s.chats.find(c => c.id === id);
  if (!flow || flow.orderId) return fail(s, 'Draft sudah terhubung. Koreksi melalui detail pesanan.');
  if (!s.settings.assistant && chat.handler !== 'owner') return fail(s, 'Asisten dijeda. Ambil alih sebagai pemilik untuk melanjutkan.');
  const check = validateRequirements(requirements, s.products, { owner: chat.handler === 'owner', fault: flow.faultPending && chat.handler !== 'owner' });
  let next = { ...s, flows: { ...s.flows, [id]: { ...flow, requirements, check, faultPending: false } }, chats: s.chats.map(c => c.id === id ? { ...c, status: check.ok ? 'Siap dibuat draft' : 'Perlu perhatian' } : c) };
  next = record(next, { chatId: id, action: 'check', text: check.ok ? 'Kebutuhan dan ongkir tervalidasi' : 'Pemeriksaan perlu perhatian', detail: check.ok ? `${check.productName} / ${check.variant} · ${requirements.qty} pcs · Ongkir simulasi Rp${check.shipping}` : check.issues.join(' '), actor: chat.handler === 'owner' ? s.settings.owner : 'Asisten simulasi', blocked: !check.ok });
  return { state: next, result: { ok: check.ok, message: check.ok ? 'Pemeriksaan selesai. Draft siap diajukan.' : check.issues[0] } };
}
export function createFlowDraft(s, id) {
  const flow = s.flows[id]; const chat = s.chats.find(c => c.id === id);
  if (!flow) return fail(s, 'Skenario tidak ditemukan.');
  if (flow.orderId) {
    const duplicateState = { ...s, flows: { ...s.flows, [id]: { ...flow, duplicateSubmissions: (flow.duplicateSubmissions || 0) + 1 } } };
    return ok(record(duplicateState, { chatId: id, orderId: flow.orderId, action: 'duplicate', text: 'Pengajuan berulang dicegah', detail: `Tetap menggunakan #${flow.orderId}. Tidak ada draft baru.` }), 'Draft sudah ada; pengajuan ganda dicegah.', { id: flow.orderId, duplicate: true });
  }
  if (!s.settings.assistant && chat.handler !== 'owner') return fail(s, 'Ambil alih percakapan untuk melanjutkan.');
  if (!flow.check?.ok) return fail(s, 'Selesaikan pemeriksaan kebutuhan terlebih dahulu.');
  const check = validateRequirements(flow.requirements, s.products, { owner: chat.handler === 'owner' });
  if (!check.ok) return checkFlow(s, id, flow.requirements);
  const r = flow.requirements; const at = now(); const orderId = nextOrderId(s.orders);
  const order = { ...r, id: orderId, name: r.name.trim(), address: r.address.trim(), qty: Number(r.qty), price: check.price, shipping: check.shipping, status: 'Menunggu persetujuan', origin: 'simulation', flowId: id, events: [...flow.events], version: 1, createdAt: at, date: at.slice(0, 10), time: 'Baru saja' };
  let next = { ...s, orders: [order, ...s.orders], flows: { ...s.flows, [id]: { ...flow, orderId, check } }, chats: s.chats.map(c => c.id === id ? { ...c, order: orderId, status: 'Perlu persetujuan' } : c) };
  next = record(next, { chatId: id, orderId, action: 'draft', text: `Draft #${orderId} diajukan`, detail: 'Menunggu keputusan pemilik. Stok belum dikurangi.', actor: chat.handler === 'owner' ? s.settings.owner : 'Asisten simulasi' });
  return ok(next, 'Draft siap ditinjau pemilik', { id: orderId });
}
export function editOrder(s, id, r) {
  const order = s.orders.find(o => o.id === id);
  if (!order || !['Menunggu persetujuan', 'Perlu revisi'].includes(order.status)) return fail(s, 'Draft ini tidak dapat diubah pada status sekarang.');
  const check = validateRequirements(r, s.products, { owner: true });
  if (!check.ok) return fail(record(s, { orderId: id, chatId: order.flowId, action: 'check', text: 'Koreksi draft belum valid', detail: check.issues.join(' '), blocked: true }), check.issues.join(' '));
  const updated = { ...order, ...r, name: r.name.trim(), address: r.address.trim(), qty: Number(r.qty), shipping: check.shipping, price: check.price, validation: check, status: 'Menunggu persetujuan', version: (order.version || 1) + 1, reason: '', updatedAt: now() };
  const changes = draftChanges(order, updated, s.products);
  let next = { ...s, orders: s.orders.map(o => o.id === id ? updated : o), chats: s.chats.map(c => c.order === id ? { ...c, status: 'Perlu persetujuan' } : c), flows: order.flowId ? { ...s.flows, [order.flowId]: { ...s.flows[order.flowId], requirements: r, check } } : s.flows };
  next = record(next, { orderId: id, chatId: order.flowId, action: 'edit', text: `Draft dikoreksi ke versi ${updated.version}`, detail: changes.length ? changes.join(' · ') : 'Kebutuhan diperiksa ulang dan diajukan kembali.', changes });
  return ok(next, 'Koreksi tersimpan. Persetujuan baru diperlukan.');
}
export function decideOrder(s, id, status, reason = '') {
  const order = s.orders.find(o => o.id === id);
  if (!order) return fail(s, 'Pesanan tidak ditemukan.');
  if (order.status === status) return ok(s, 'Tindakan sudah tercatat. Tidak dijalankan ulang.', { unchanged: true });
  const valid = { 'Menunggu persetujuan': ['Diproses', 'Ditolak', 'Perlu revisi'], 'Perlu revisi': ['Ditolak'], Ditolak: ['Perlu revisi'], Diproses: ['Selesai'] };
  if (!valid[order.status]?.includes(status)) return fail(s, 'Perubahan status tidak diizinkan. Tinjau status terbaru.');
  if (['Ditolak', 'Perlu revisi'].includes(status) && !reason.trim()) return fail(s, 'Alasan keputusan wajib diisi.');
  let approvalCheck;
  if (status === 'Diproses') {
    approvalCheck = validateRequirements(requirementsFromOrder(order), s.products, { owner: true });
    if (approvalCheck.price !== order.price) {
      approvalCheck.ok = false;
      approvalCheck.stock.push('Harga katalog berubah. Koreksi draft sebelum persetujuan.');
      approvalCheck.issues.push('Harga katalog berubah. Koreksi draft sebelum persetujuan.');
    }
    if (!approvalCheck.ok) {
      const blockedState = { ...s, orders: s.orders.map(o => o.id === id ? { ...o, validation: approvalCheck } : o), flows: order.flowId ? { ...s.flows, [order.flowId]: { ...s.flows[order.flowId], check: approvalCheck } } : s.flows };
      return fail(record(blockedState, { orderId: id, chatId: order.flowId, action: 'check', text: 'Persetujuan ditahan', detail: approvalCheck.issues.join(' '), blocked: true }), approvalCheck.issues.join(' '));
    }
  }
  const at = now(); const updated = { ...order, status, reason: reason.trim(), decisionBy: s.settings.owner, decisionAt: at, ...(status === 'Diproses' ? { approvedAt: at, approvedBy: s.settings.owner, validation: approvalCheck, stockApplied: true, processingMs: order.createdAt ? new Date(at) - new Date(order.createdAt) : null } : {}), ...(status === 'Selesai' ? { completedAt: at } : {}) };
  const action = { Diproses: 'approve', Selesai: 'complete', Ditolak: 'reject', 'Perlu revisi': 'revision' }[status];
  let next = { ...s, orders: s.orders.map(o => o.id === id ? updated : o), products: status === 'Diproses' ? s.products.map(p => p.id === order.product ? { ...p, stock: p.stock - order.qty } : p) : s.products, chats: s.chats.map(c => c.order === id ? { ...c, status: status === 'Ditolak' ? 'Pesanan ditolak' : status === 'Perlu revisi' ? 'Perlu revisi' : status === 'Selesai' ? 'Selesai' : 'Pesanan diproses' } : c) };
  next = record(next, { orderId: id, chatId: order.flowId, action, text: `Pesanan #${id}: ${status}`, detail: reason.trim() || (status === 'Diproses' ? `Stok lokal dikurangi ${order.qty} pcs tepat satu kali. Belum dikirim.` : 'Ditandai tuntas oleh pemilik; tanpa pengiriman sungguhan.') });
  return ok(next, status === 'Diproses' ? 'Pesanan disetujui. Stok lokal diperbarui satu kali.' : `Keputusan ${status.toLowerCase()} tersimpan.`);
}
export function toggleHandler(s, id) {
  const chat = s.chats.find(c => c.id === id); if (!chat) return fail(s, 'Percakapan tidak ditemukan.');
  const handler = chat.handler === 'owner' ? 'assistant' : 'owner';
  if (handler === 'assistant' && !s.settings.assistant) return fail(s, 'Asisten dijeda di Pengaturan. Penanganan tetap pada pemilik.');
  const next = record({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, handler } : c) }, { chatId: id, orderId: chat.order, action: 'handoff', text: handler === 'owner' ? 'Pemilik mengambil alih percakapan' : 'Percakapan dikembalikan ke asisten simulasi', detail: 'Tidak ada pesan dikirim ke layanan eksternal.' });
  return ok(next, handler === 'owner' ? 'Percakapan ditangani pemilik' : 'Percakapan kembali ke asisten simulasi');
}
export function repeatMessage(s, id) {
  const flow = s.flows[id]; if (!flow) return fail(s, 'Skenario tidak ditemukan.');
  const next = record({ ...s, flows: { ...s.flows, [id]: { ...flow, duplicateCount: flow.duplicateCount + 1 } } }, { chatId: id, orderId: flow.orderId, action: 'duplicate', text: 'Pesan berulang dikenali dan diabaikan', detail: 'Identitas kebutuhan sama. Tidak membuat percakapan, draft, atau pengurangan stok baru.', actor: 'Penjaga duplikasi simulasi' });
  return ok(next, 'Pesan berulang diabaikan. Kebutuhan tetap satu.');
}