import { createContext, useContext, useEffect, useState } from 'react';
import { initialProducts, initialOrders, initialChats, initialActivity } from './demoData';

const StoreContext = createContext();
const KEY = 'tuntas-dashboard-v1';
const defaults = () => ({ products: initialProducts, orders: initialOrders, chats: initialChats, activity: initialActivity, settings: { name: 'Ruang Rupa', owner: 'Rina', phone: '0812-3456-7890', address: 'Jl. Cempaka No. 21, Jakarta Selatan', assistant: true, notifications: true } });
function readState() {
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved?.products && saved?.orders && saved?.chats && saved?.settings && saved?.activity) return saved; } catch (_) { /* Use demo defaults for unavailable storage. */ }
  return defaults();
}
export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(readState);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* Session remains functional. */ } }, [state]);
  const addActivity = (s, text, detail, kind = 'done') => [{ id: crypto.randomUUID(), text, detail, time: 'Baru saja', kind }, ...s.activity].slice(0, 20);
  const updateOrder = (id, status) => setState(s => {
    const order = s.orders.find(o => o.id === id);
    if (!order || order.status === status) return s;
    const approving = order.status === 'Menunggu persetujuan' && status === 'Diproses';
    const product = s.products.find(p => p.id === order.product);
    if (approving && (!product || product.stock < order.qty)) return s;
    return { ...s, products: approving ? s.products.map(p => p.id === order.product ? { ...p, stock: p.stock - order.qty } : p) : s.products, orders: s.orders.map(o => o.id === id ? { ...o, status } : o), chats: s.chats.map(c => c.order === id ? { ...c, status: status === 'Ditolak' || status === 'Selesai' ? 'Selesai' : 'Ditangani asisten' } : c), activity: addActivity(s, `Pesanan ${order.name} ${status.toLowerCase()}`, `Pesanan #${id} · Keputusan pemilik toko`) };
  });
  const sendMessage = (id, text) => setState(s => ({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, preview: text, time: 'Baru saja', status: 'Ditangani pemilik', messages: [...c.messages, { from: 'owner', text, time: 'Baru saja' }] } : c) }));
  const readChat = id => setState(s => ({ ...s, chats: s.chats.map(c => c.id === id && c.unread ? { ...c, unread: false } : c) }));
  const finishChat = id => setState(s => ({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, status: c.status === 'Selesai' ? (s.orders.find(o => o.id === c.order)?.status === 'Menunggu persetujuan' ? 'Perlu persetujuan' : 'Ditangani pemilik') : 'Selesai' } : c) }));
  const saveProduct = product => setState(s => ({ ...s, products: s.products.some(p => p.id === product.id) ? s.products.map(p => p.id === product.id ? product : p) : [...s.products, product] }));
  const addOrder = order => setState(s => ({ ...s, orders: [order, ...s.orders], activity: addActivity(s, `Draft pesanan ${order.name} dibuat`, `Pesanan #${order.id}`, 'order') }));
  const saveSettings = settings => setState(s => ({ ...s, settings: { ...s.settings, ...settings } }));
  const reset = () => setState(defaults());
  return <StoreContext.Provider value={{ ...state, updateOrder, sendMessage, readChat, finishChat, saveProduct, addOrder, saveSettings, reset }}>{children}</StoreContext.Provider>;
};
export const useStore = () => useContext(StoreContext);