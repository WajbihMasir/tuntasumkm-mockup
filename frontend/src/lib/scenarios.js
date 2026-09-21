export const SCENARIOS = [
  { id: 'normal', title: 'Pesanan lengkap', description: 'Periksa kebutuhan, hitung ongkir, dan ajukan draft untuk pemilik.' },
  { id: 'variant', title: 'Varian tidak ditemukan', description: 'Pelanggan meminta varian di luar katalog. Pilih penggantinya.' },
  { id: 'stock', title: 'Stok tidak cukup', description: 'Jumlah melebihi stok. Kurangi jumlah atau pilih varian lain.' },
  { id: 'address', title: 'Informasi belum lengkap', description: 'Lengkapi penerima, alamat, dan konfirmasi kebutuhan.' },
  { id: 'shipping', title: 'Ongkir belum tersedia', description: 'Pilih tujuan terlayani atau ambil alih untuk menetapkan tarif manual.' },
  { id: 'duplicate', title: 'Pesan berulang', description: 'Ulangi pesan dan pengajuan: hanya satu draft untuk kebutuhan yang sama.' },
  { id: 'failure', title: 'Pemeriksaan gagal', description: 'Percobaan pertama gagal; ulangi atau tangani sebagai pemilik.' },
  { id: 'revision', title: 'Koreksi sebelum persetujuan', description: 'Minta revisi dengan alasan, koreksi draft, lalu setujui versi baru.' },
  { id: 'rejection', title: 'Pesanan ditolak', description: 'Tolak dengan alasan. Stok tidak berubah; revisi dapat dibuka pemilik.' },
];
export function buildScenario(key, index, products) {
  const start = performance.now(); const scenario = SCENARIOS.find(s => s.id === key) || SCENARIOS[0];
  const product = products.find(p => p.id === (key === 'stock' ? 'p3' : 'p1')) || products[0];
  const requirements = { product: key === 'variant' ? 'unknown' : product.id, qty: key === 'stock' ? product.stock + 2 : 2, name: key === 'address' ? '' : 'Nadia Putri', address: key === 'address' ? '' : 'Jl. Sukajadi No. 25, Bandung', city: key === 'shipping' ? 'Luar jangkauan' : 'Bandung', confirmed: key !== 'address', service: 'reguler', manualShipping: '', shippingNote: '' };
  const id = crypto.randomUUID(); const receivedAt = new Date().toISOString();
  const text = key === 'variant' ? 'Kak, mau Tote Bag Everyday warna Merah 2 pcs, kirim ke Bandung.' : key === 'address' ? 'Kak, saya mau 2 tote bag sage. Alamatnya menyusul ya.' : `Kak, mau ${requirements.qty} ${product.name} warna ${product.variant}. Kirim ke ${requirements.city}, atas nama Nadia Putri.`;
  const chat = { id, name: `Nadia Putri · ${index}`, color: 'mint', origin: 'simulation', scenario: scenario.id, status: 'Kebutuhan baru', handler: 'assistant', unread: true, order: null, preview: text, time: 'Baru saja', messages: [{ from: 'customer', text, time: 'Baru saja', at: receivedAt }, { from: 'assistant', text: 'Contoh respons skenario: kebutuhan dicatat untuk diperiksa. Belum ada pesanan disetujui atau stok yang dikurangi.', time: 'Baru saja', at: new Date().toISOString() }] };
  const flow = { chatId: id, scenario: scenario.id, requirements, check: null, events: [], duplicateCount: 0, faultPending: key === 'failure', receivedAt, responseMs: Math.max(0, performance.now() - start), responseSource: 'Durasi pembuatan respons skrip lokal, bukan latensi AI/WhatsApp' };
  return { chat, flow };
}