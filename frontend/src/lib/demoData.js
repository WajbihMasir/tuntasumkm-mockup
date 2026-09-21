export const money = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
export const initialProducts = [
  { id: 'p1', name: 'Tote Bag Everyday', variant: 'Sage', price: 75000, stock: 42, color: '#a2b49e', category: 'Tas' },
  { id: 'p2', name: 'Tote Bag Everyday', variant: 'Natural', price: 75000, stock: 28, color: '#d8cfb9', category: 'Tas' },
  { id: 'p3', name: 'Canvas Sling Bag', variant: 'Midnight', price: 110000, stock: 8, color: '#35465e', category: 'Tas' },
  { id: 'p4', name: 'Everyday Pouch', variant: 'Terracotta', price: 55000, stock: 35, color: '#c6816f', category: 'Aksesori' },
];
export const initialOrders = [
  { id: 'T-1048', name: 'Dina Permata', product: 'p1', qty: 2, shipping: 18000, city: 'Bandung', address: 'Jl. Sukajadi No. 18, Bandung', status: 'Menunggu persetujuan', time: '2 menit lalu', date: '2026-09-21', price: 75000 },
  { id: 'T-1047', name: 'Rizky Pratama', product: 'p3', qty: 2, shipping: 15000, city: 'Jakarta', address: 'Jl. Melati No. 12, Jakarta Selatan', status: 'Menunggu persetujuan', time: '5 menit lalu', date: '2026-09-21', price: 110000 },
  { id: 'T-1046', name: 'Maya Sari', product: 'p4', qty: 3, shipping: 20000, city: 'Surabaya', address: 'Jl. Darmo No. 8, Surabaya', status: 'Menunggu persetujuan', time: '12 menit lalu', date: '2026-09-21', price: 55000 },
  { id: 'T-1045', name: 'Andi Wijaya', product: 'p2', qty: 1, shipping: 15000, city: 'Jakarta', address: 'Jl. Anggrek No. 24, Jakarta', status: 'Diproses', time: '25 menit lalu', date: '2026-09-21', price: 75000 },
  { id: 'T-1044', name: 'Siti Nurhaliza', product: 'p1', qty: 3, shipping: 22000, city: 'Yogyakarta', address: 'Jl. Kaliurang No. 5, Yogyakarta', status: 'Selesai', time: '1 jam lalu', date: '2026-09-20', price: 75000 },
  { id: 'T-1043', name: 'Budi Santoso', product: 'p3', qty: 1, shipping: 18000, city: 'Bandung', address: 'Jl. Riau No. 7, Bandung', status: 'Selesai', time: '2 jam lalu', date: '2026-09-20', price: 110000 },
];
export const initialChats = [
  { id: 'c1', name: 'Dina Permata', initials: 'DP', color: 'peach', preview: 'Oke kak, saya ambil 2 yang sage ya 😊', time: '10.42', status: 'Perlu persetujuan', unread: true, order: 'T-1048', messages: [{ from: 'customer', text: 'Halo kak, Tote Bag Everyday warna sage masih ada?', time: '10.40' }, { from: 'assistant', text: 'Halo Kak Dina! Warna Sage tersedia, harganya Rp75.000 per pcs. Mau pesan berapa kak?', time: '10.40' }, { from: 'customer', text: 'Oke kak, saya ambil 2 yang sage ya 😊 Kirim ke Jl. Sukajadi No. 18, Bandung.', time: '10.42' }, { from: 'assistant', text: 'Siap kak! Total 2 tote bag Rp150.000 + ongkir Rp18.000. Pesanan sedang menunggu konfirmasi pemilik toko, ya.', time: '10.42' }] },
  { id: 'c2', name: 'Rizky Pratama', initials: 'RP', color: 'blue', preview: 'Kirim ke Jakarta Selatan bisa, kan?', time: '10.38', status: 'Perlu persetujuan', unread: true, order: 'T-1047', messages: [{ from: 'customer', text: 'Kak, mau Canvas Sling Bag Midnight 2. Kirim ke Jakarta Selatan bisa, kan?', time: '10.38' }, { from: 'assistant', text: 'Bisa kak. 2 tas Rp220.000 dan ongkir Rp15.000. Draft pesanan sudah disiapkan untuk dikonfirmasi.', time: '10.38' }] },
  { id: 'c3', name: 'Maya Sari', initials: 'MS', color: 'pink', preview: 'Terima kasih, ditunggu pesanannya!', time: '10.31', status: 'Perlu persetujuan', unread: false, order: 'T-1046', messages: [{ from: 'customer', text: 'Mau pesan Everyday Pouch Terracotta 3 pcs ke Surabaya.', time: '10.30' }, { from: 'assistant', text: 'Total pesanan beserta ongkir Rp185.000, Kak. Sedang kami konfirmasi ya.', time: '10.30' }, { from: 'customer', text: 'Terima kasih, ditunggu pesanannya!', time: '10.31' }] },
  { id: 'c4', name: 'Andi Wijaya', initials: 'AW', color: 'mint', preview: 'Ada warna lain selain natural kak?', time: '10.24', status: 'Ditangani asisten', unread: false, order: 'T-1045', messages: [{ from: 'customer', text: 'Ada warna lain selain natural kak?', time: '10.24' }, { from: 'assistant', text: 'Ada warna Sage juga, Kak. Untuk pesanan Natural sebelumnya sudah sedang diproses ya.', time: '10.24' }] },
  { id: 'c5', name: 'Siti Nurhaliza', initials: 'SN', color: 'lavender', preview: 'Paketnya sudah sampai, bagus banget 🤍', time: '09.56', status: 'Selesai', unread: false, order: 'T-1044', messages: [{ from: 'customer', text: 'Paketnya sudah sampai, bagus banget 🤍', time: '09.56' }, { from: 'assistant', text: 'Terima kasih sudah belanja, Kak Siti! Semoga suka dan sampai jumpa lagi 💚', time: '09.56' }] },
];
export const initialActivity = [
  { id: 'a1', text: 'Draft pesanan Dina siap ditinjau', detail: '2 Tote Bag Everyday · Stok terverifikasi', time: '2 menit lalu', kind: 'order' },
  { id: 'a2', text: 'Pertanyaan Andi sudah terjawab', detail: 'Informasi varian dan ketersediaan produk', time: '8 menit lalu', kind: 'chat' },
  { id: 'a3', text: 'Stok produk berhasil diperiksa', detail: 'Canvas Sling Bag · Midnight tersedia', time: '12 menit lalu', kind: 'stock' },
  { id: 'a4', text: 'Pesanan Siti telah dituntaskan', detail: 'Pesanan #T-1044 · Rp247.000', time: '1 jam lalu', kind: 'done' },
];
export const salesData = [
  { day: '15 Sep', revenue: 850000, orders: 12 }, { day: '16 Sep', revenue: 1420000, orders: 19 },
  { day: '17 Sep', revenue: 1150000, orders: 16 }, { day: '18 Sep', revenue: 2080000, orders: 28 },
  { day: '19 Sep', revenue: 1790000, orders: 24 }, { day: '20 Sep', revenue: 2410000, orders: 33 }, { day: '21 Sep', revenue: 2750000, orders: 36 },
];
export const monthlyData = [
  { day: '23 Agt', revenue: 5350000, orders: 72 }, { day: '30 Agt', revenue: 7230000, orders: 96 },
  { day: '6 Sep', revenue: 6780000, orders: 90 }, { day: '13 Sep', revenue: 9870000, orders: 132 }, { day: '21 Sep', revenue: 12450000, orders: 168 },
];
export function downloadCSV(name, rows) {
  const safe = value => '"' + String(value ?? '').replace(/^[=+@\-]/, "'$&").replace(/"/g, '""') + '"';
  const blob = new Blob(['\uFEFF' + rows.map(row => row.map(safe).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}