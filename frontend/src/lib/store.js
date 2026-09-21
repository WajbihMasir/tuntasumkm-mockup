import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initialProducts, initialOrders, initialChats, initialActivity } from './demoData';
import * as workflow from './workflowOperations';
import { now, nextOrderId, validateRequirements, requirementsFromOrder } from './workflowRules';

const StoreContext = createContext();
const KEY = 'tuntas-dashboard-v1';
const defaults = () => ({ schema: 2, simulationStartedAt: now(), flows: {}, products: initialProducts, orders: initialOrders.map(o => ({ ...o, origin: 'historical', events: [], version: 1 })), chats: initialChats.map(c => ({ ...c, origin: 'historical', handler: 'assistant' })), activity: initialActivity.map(a => ({ ...a, origin: 'historical' })), settings: { name: 'Ruang Rupa', owner: 'Rina', phone: '0812-3456-7890', address: 'Jl. Cempaka No. 21, Jakarta Selatan', assistant: true, notifications: true } });
function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.products && saved?.orders && saved?.chats && saved?.settings && saved?.activity) return { ...saved, schema: 2, simulationStartedAt: saved.simulationStartedAt || now(), flows: saved.flows || {}, orders: saved.orders.map(o => ({ origin: 'historical', events: [], version: 1, ...o })), chats: saved.chats.map(c => ({ origin: 'historical', handler: 'assistant', ...c })), activity: saved.activity.map(a => ({ origin: 'historical', ...a })) };
  } catch (_) { /* Restore a usable demo if local storage is unavailable. */ }
  return defaults();
}
export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(readState); const current = useRef(state);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* Keep the current browser session usable. */ } }, [state]);
  // The ref commits synchronously: two rapid commands cannot act on the same stale draft.
  const transact = operation => { const response = operation(current.current); current.current = response.state; setState(response.state); return response.result; };
  const update = transform => transact(s => ({ state: transform(s), result: { ok: true } }));
  const sendMessage = (id, text) => update(s => workflow.record({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, handler: 'owner', preview: text, time: 'Baru saja', messages: [...c.messages, { from: 'owner', text, time: 'Baru saja', at: now() }] } : c) }, { chatId: id, orderId: s.chats.find(c => c.id === id)?.order, action: 'reply', text: 'Balasan lokal pemilik disimpan', detail: text }));
  const readChat = id => update(s => ({ ...s, chats: s.chats.map(c => c.id === id && c.unread ? { ...c, unread: false } : c) }));
  const finishChat = id => update(s => ({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, status: c.status === 'Selesai' ? (s.orders.find(o => o.id === c.order)?.status === 'Menunggu persetujuan' ? 'Perlu persetujuan' : c.handler === 'owner' ? 'Ditangani pemilik' : 'Ditangani asisten') : 'Selesai' } : c) }));
  const saveProduct = product => update(s => ({ ...s, products: s.products.some(p => p.id === product.id) ? s.products.map(p => p.id === product.id ? product : p) : [...s.products, product] }));
  const addOrder = input => transact(s => {
    const check = validateRequirements(requirementsFromOrder(input), s.products, { owner: true });
    if (!check.ok) return { state: s, result: { ok: false, message: check.issues[0] } };
    const at = now(); const order = { ...input, validation: check, id: nextOrderId(s.orders), createdAt: at, date: at.slice(0, 10), origin: 'simulation', version: 1, events: [] };
    return { state: workflow.record({ ...s, orders: [order, ...s.orders] }, { orderId: order.id, action: 'draft', text: `Draft manual #${order.id} dibuat`, detail: 'Menunggu keputusan pemilik. Stok belum dikurangi.' }), result: { ok: true, id: order.id } };
  });
  const saveSettings = settings => update(s => ({ ...s, settings: { ...s.settings, ...settings } }));
  const reset = () => update(() => defaults());
  const actions = Object.fromEntries(['startScenario', 'checkFlow', 'createFlowDraft', 'editOrder', 'decideOrder', 'toggleHandler', 'repeatMessage'].map(name => [name, (...args) => transact(s => workflow[name](s, ...args))]));
  return <StoreContext.Provider value={{ ...state, ...actions, updateOrder: actions.decideOrder, sendMessage, readChat, finishChat, saveProduct, addOrder, saveSettings, reset }}>{children}</StoreContext.Provider>;
};
export const useStore = () => useContext(StoreContext);