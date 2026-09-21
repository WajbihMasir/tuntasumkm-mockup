export const STAGES = ['Percakapan diterima', 'Kebutuhan dilengkapi', 'Produk & stok diperiksa', 'Pengiriman dihitung', 'Draft disiapkan', 'Keputusan pemilik', 'Tindakan dituntaskan'];
export const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Luar jangkauan'];
const RATES = { Jakarta: 15000, Bandung: 18000, Surabaya: 20000, Yogyakarta: 22000 };
export const now = () => new Date().toISOString();
export const timeLabel = value => value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }) : 'Data contoh awal';
export const nextOrderId = orders => `T-${Math.max(1048, ...orders.map(o => Number(o.id.replace('T-', '')) || 0)) + 1}`;
export const requirementsFromOrder = o => ({ product: o.product, qty: o.qty, name: o.name, address: o.address, city: o.city, confirmed: true, service: o.service || 'manual', manualShipping: o.shipping, shippingNote: o.shippingNote || 'Tarif pada draft contoh awal' });
export function quoteShipping(r) {
  if (r.service === 'manual') return r.manualShipping !== '' && Number.isFinite(Number(r.manualShipping)) && Number(r.manualShipping) >= 0 && Number(r.manualShipping) <= 1000000 && r.shippingNote?.trim() ? Number(r.manualShipping) : null;
  const base = RATES[r.city];
  if (!base || !['reguler', 'ekspres'].includes(r.service)) return null;
  return base + (r.service === 'ekspres' ? 12000 : 0) + Math.max(0, Math.ceil(Number(r.qty) / 2) - 1) * 4000;
}
export function validateRequirements(r, products, { owner = false, fault = false } = {}) {
  const product = products.find(p => p.id === r.product);
  const information = [];
  if (!r.name?.trim()) information.push('Nama penerima belum diisi.');
  if (!r.address?.trim() || r.address.trim().length < 8) information.push('Alamat belum lengkap (minimal 8 karakter).');
  if (!r.city?.trim()) information.push('Kota tujuan belum dipilih.');
  if (!Number.isInteger(Number(r.qty)) || Number(r.qty) < 1 || Number(r.qty) > 99999) information.push('Jumlah harus berupa bilangan bulat positif.');
  if (!r.confirmed) information.push('Kebutuhan pelanggan belum dikonfirmasi.');
  const stock = !product ? ['Produk atau varian tidak ditemukan. Pilih varian katalog.'] : Number(r.qty) > product.stock ? [`Stok ${product.variant} hanya ${product.stock} pcs. Ubah jumlah atau varian.`] : [];
  const shipping = quoteShipping(r);
  const delivery = shipping === null ? ['Ongkir belum tersedia. Pilih kota terlayani atau minta pemilik menetapkan tarif manual.'] : r.service === 'manual' && !owner ? ['Tarif manual memerlukan penanganan pemilik.'] : [];
  const technical = fault ? ['Pemeriksaan simulasi gagal. Coba lagi atau ambil alih sebagai pemilik.'] : [];
  const issues = [...information, ...stock, ...delivery, ...technical];
  return { ok: !issues.length, information, stock, delivery, technical, issues, shipping, productName: product?.name, variant: product?.variant, price: product?.price, available: product?.stock, at: now() };
}
export const orderTotal = o => Number(o.qty) * Number(o.price) + Number(o.shipping);
export function draftChanges(before, after, products) {
  const names = { product: 'Produk/varian', qty: 'Jumlah', name: 'Penerima', address: 'Alamat', city: 'Kota', service: 'Pengiriman', shipping: 'Ongkir', price: 'Harga satuan' };
  return Object.keys(names).filter(k => String(before[k]) !== String(after[k])).map(k => {
    const value = v => k === 'product' ? products.find(p => p.id === v)?.name + ' / ' + products.find(p => p.id === v)?.variant : String(v ?? '—');
    return `${names[k]}: ${value(before[k])} → ${value(after[k])}`;
  });
}
export function getStages(flow, order, products) {
  const stages = STAGES.map((title, i) => ({ title, status: 'Belum dimulai', detail: '', role: i === 5 ? 'Pemilik' : 'Asisten simulasi' }));
  const set = (i, status, detail) => { stages[i] = { ...stages[i], status, detail }; };
  const events = [...(flow?.events || order?.events || [])].reverse();
  const examiner = events.find(e => ['check', 'edit'].includes(e.action))?.actor;
  const drafter = events.find(e => e.action === 'draft')?.actor;
  if (examiner) [1, 2, 3].forEach(i => { stages[i].role = examiner; });
  if (drafter) stages[4].role = drafter;
  stages[6].role = 'Pemilik → tindakan lokal';
  set(0, 'Selesai', flow ? 'Pesan dari skenario terpandu, bukan hasil pemahaman AI.' : 'Percakapan atau draft contoh awal.');
  const r = flow?.requirements || (order && requirementsFromOrder(order));
  const check = order?.validation || flow?.check || (order && validateRequirements(r, products, { owner: true }));
  if (!r) return stages;
  set(1, check?.information?.length ? 'Menunggu informasi' : r.confirmed ? 'Selesai' : 'Perlu konfirmasi', check?.information?.join(' ') || 'Produk, penerima, jumlah, dan alamat pada skenario.');
  if (check) {
    set(2, check.technical?.length ? 'Gagal' : check.stock?.length ? 'Perlu koreksi' : 'Selesai', [...(check.technical || []), ...(check.stock || [])].join(' ') || `${check.productName} / ${check.variant} · Stok saat diperiksa: ${check.available} pcs`);
    set(3, check.delivery?.length ? 'Menunggu informasi' : 'Selesai', check.delivery?.join(' ') || `Ongkir simulasi Rp${Number(check.shipping).toLocaleString('id-ID')}. Tidak ada pemesanan kurir.`);
  } else if (r.confirmed) set(2, 'Berlangsung', 'Pemeriksaan belum dijalankan.');
  if (!order) {
    if (check?.ok) set(4, 'Berlangsung', 'Siap diajukan. Stok belum dikurangi.');
    return stages;
  }
  set(4, order.status === 'Perlu revisi' ? 'Perlu revisi' : 'Selesai', `Draft #${order.id} · versi ${order.version || 1}${flow?.duplicateCount || flow?.duplicateSubmissions ? ` · ${(flow.duplicateCount || 0) + (flow.duplicateSubmissions || 0)} duplikasi dicegah` : ''}`);
  if (order.status === 'Ditolak') { set(5, 'Ditolak', order.reason); set(6, 'Dihentikan', 'Tidak ada pengurangan stok atau tindakan pengiriman.'); }
  else if (order.status === 'Perlu revisi') { set(5, 'Menunggu revisi', order.reason); set(6, 'Belum dimulai', 'Koreksi draft harus diajukan kembali sebelum persetujuan.'); }
  else if (order.status === 'Menunggu persetujuan') { set(5, 'Menunggu keputusan', 'Pemilik meninjau sebelum stok dikurangi.'); set(6, 'Belum dimulai', 'Belum ada tindakan operasional.'); }
  else { set(5, 'Selesai', order.approvedAt ? `Disetujui ${order.approvedBy || order.decisionBy} · ${timeLabel(order.approvedAt)}` : 'Persetujuan pada data contoh awal.'); set(6, order.status === 'Selesai' ? 'Selesai' : 'Berlangsung', order.status === 'Selesai' ? 'Pemilik menandai pesanan tuntas. Tidak ada pengiriman sungguhan.' : 'Stok lokal sudah dikurangi satu kali. Menunggu penyelesaian pemilik.'); }
  return stages;
}