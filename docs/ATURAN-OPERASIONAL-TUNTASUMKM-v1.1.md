# TuntasUMKM v1.1 — Aturan Operasional & Kriteria Penerimaan

Tanggal: 21 September 2026 · Acuan normatif: [PRD v1.1](PRD-TUNTASUMKM-v1.1.md).

Dokumen ini menjabarkan D01–D05 yang disetujui. Detail proses, nama status dan kontrol teknis adalah aturan turunan baseline, bukan klaim fitur sudah tersedia. Jika ada perbedaan, definisi kebijakan dan KPI pada PRD v1.1 menjadi acuan.

## A. SOP pesanan normal

1. **Terima:** sistem memverifikasi kanal/toko dan menyimpan pesan unik. Balasan penerimaan boleh dikirim; jangan menyatakan stok terpesan.
2. **Lengkapi:** asisten memastikan satu SKU, varian, qty, penerima serta informasi penyerahan. Konfirmasi kebutuhan; tanyakan yang ambigu, jangan menebak.
3. **Periksa:** gunakan katalog/stok TuntasUMKM. Jika tidak cocok, jelaskan opsi yang tersedia; pelanggan memilih, bukan asisten mengganti sepihak.
4. **Hitung ongkir:** ambil quote dengan asal/tujuan/berat/layanan. Jika gagal, beri status perlu perhatian. Hanya owner boleh menetapkan tarif manual beralasan. Untuk penyerahan langsung, owner dapat menetapkan ongkir 0 dengan alasan yang dicatat; bukan booking kurir.
5. **Draft:** simpan rincian, total, quote/freshness dan versi; notify pemilik. Stok tidak berkurang dan tidak dicadangkan.
6. **Putuskan:** owner meninjau versi terkini. Revisi/penolakan wajib alasan. AI tidak boleh menganggap “OK” pelanggan sebagai approval owner.
7. **Eksekusi:** server revalidasi dan meng-commit approval–order–stok–audit–outbox bersama. Baru tampilkan Diproses. Pesan konfirmasi dikirim terpisah; kegagalannya terlihat dan ditangani tanpa transaksi stok ulang.
8. **Serah-terima:** sesudah barang diserahkan, owner mencatat penerima serah-terima (kurir/pembeli), waktu dan catatan, lalu menandai Selesai. Tidak ada klaim sudah dibayar atau diterima pelanggan dari status ini.

## B. SOP revisi atau approval ditahan

- Revisi sebelum approve menghasilkan versi baru. Versi lama tetap ada untuk audit dan tidak lagi dapat disetujui.
- Bila stok berkurang tetapi masih cukup, approval dapat lanjut sesudah revalidasi; **tidak setiap perubahan angka stok otomatis memerlukan perubahan qty**.
- Bila stok tidak cukup, harga berubah, SKU tidak aktif, quote kedaluwarsa atau data wajib belum valid, tahan approval tanpa efek stok.
- Owner/asisten melengkapi informasi atau menyiapkan revisi; owner meninjau ulang. Perubahan SKU/qty/total yang telah dikonfirmasi pelanggan memerlukan konfirmasi pelanggan kembali.
- Refresh quote memakai ID/snapshot dan versi baru walaupun tarif sama; jangan menyetujui otomatis sebagai kelanjutan klik approval sebelumnya.
- Order Diproses/Selesai tidak boleh diedit bebas; batalkan sesuai SOP C lalu buat draft pengganti bila perlu. Histori tetap terhubung.

## C. SOP penolakan, pembatalan dan stok kembali

### Sebelum approval efektif
- Owner menolak dengan alasan. Tidak ada stock return karena draft belum mengurangi stok.
- Pelanggan yang meminta batal memicu perhatian pemilik; AI tidak boleh membatalkan order aktif secara mandiri.

### Sesudah approval efektif
- Owner mencatat alasan pembatalan; order menjadi `CANCELLED`.
- Jika barang belum diperiksa: `stock_recovery=PENDING_REVIEW`; jangan menambah stok atas dugaan.
- Jika sudah diperiksa: owner mencatat kondisi, qty layak dijual, waktu pemeriksaan dan catatan. Qty integer `0 ≤ qty_kembali ≤ qty_order`.
- Barang masih di kurir/pelanggan atau rusak tidak boleh dianggap stok tersedia. Qty 0 adalah keputusan sah setelah pemeriksaan; berbeda dari “belum diketahui”.
- Simpan penyelesaian pemeriksaan dan movement positif (bila qty>0) dalam satu transaksi dengan audit. Status menjadi `RESOLVED`.
- Bila order sebelumnya Selesai, simpan fakta serah-terima lama. Pembatalan tidak berarti barang otomatis kembali.
- Restock final hanya sekali per pembatalan. Retry identik mengembalikan hasil terdahulu. Konflik payload/key atau settlement kedua ditolak.
- Koreksi setelah final melalui penyesuaian stok owner beralasan dan referensi movement/order sebelumnya, bukan mengulang settlement. Jaga batas pemulihan bersih agar tidak melebihi qty yang pernah dikurangi.
- Tidak ada refund/validasi uang oleh sistem. Permintaan pesanan baru membuat draft baru, bukan membuka ulang order Cancelled.

## D. SOP pengambilalihan dan gangguan

| Kondisi | Tindakan sistem/pemilik |
|---|---|
| Owner ambil alih | Simpan mode/versi handler; hentikan pengiriman otomatis yang belum dieksekusi. Pesan sudah diterima provider tidak dapat dibatalkan secara retrospektif |
| Asisten dijeda | Inbox dan balasan manual tetap berjalan; tidak memproses/mengirim aksi AI baru |
| Kembali ke AI | Perintah owner; hanya jika asisten toko aktif. Gunakan state terbaru, bukan hasil job lama |
| AI gagal/ambigu/keluar schema | Tidak membuat klaim atau side effect; minta klarifikasi bila aman atau tandai perlu perhatian owner |
| Ongkir gagal | Retry baca terbatas; gunakan quote sah atau manual owner. Angka contoh tidak boleh dipakai sebagai tarif nyata |
| Worker mati sesudah commit | Resume dari outbox/job persisten; order/stok tidak diulang |
| Provider timeout dengan hasil belum pasti | Status `unknown`, rekonsiliasi memakai ID provider; tidak blind retry |
| Pesan duplikat dari provider | Simpan/dedupe satu identitas; jangan membuat draft/stock movement baru |
| Pesan identik dengan ID baru | Nilai sebagai pesan sah dalam konteks; bisa pesanan ulang, tidak dibuang hanya karena teks sama |
| Notifikasi approval gagal | Order tetap dalam antrean dashboard; status notifikasi terpisah dari keputusan owner |
| Window WhatsApp habis | Ikuti template/kebijakan provider; jangan kirim free-form yang tidak diizinkan |

## E. Data audit minimum

Semua aksi penting menyimpan ID event, tenant, actor/jenis actor, waktu server, entity ID, jenis tindakan, versi, hasil dan correlation/operation key. Catat alasan dan before→after bila relevan, tanpa mengumbar credential atau data pribadi dalam log umum.

- **Approval:** order/version, payload yang ditinjau, owner, validasi, waktu request dan commit, referensi mutasi stok.
- **Revisi/reject:** alasan, versi lama/baru dan perubahan.
- **Selesai:** waktu serah-terima, kurir/pembeli, catatan, waktu dicatat dan owner.
- **Cancel:** alasan, status sebelumnya, waktu, owner, referensi order pengganti bila ada.
- **Pemulihan stok:** kondisi barang, qty tersedia kembali, waktu pemeriksaan, owner, movement dan settlement key; catat keputusan 0.
- **Koreksi stok:** saldo sebelum/sesudah, delta, alasan, actor dan referensi penyebab; bukan edit angka tanpa jejak.
- **Takeover/pause:** actor, waktu dan handler/policy version.
- **KPI:** fakta server dan relasi pesan/episode/order. Koreksi klasifikasi/insiden tetap diaudit; histori tidak dihapus untuk memperbaiki angka.

## F. Kriteria penerimaan — kontrak tes masa depan

**Status seluruh AC: belum diuji/diimplementasikan sebagai backend bisnis.** Lulusnya tes mockup sebelumnya tidak mengubah status ini.

| ID | Given / When | Then yang wajib dibuktikan | Acuan |
|---|---|---|---|
| AC01 | Owner toko A meminta data/mutasi toko B | Ditolak, tidak ada kebocoran atau perubahan, termasuk export/audit/quote | D01, aturan akses |
| AC02 | Pelanggan meminta dua SKU dalam satu order | Sistem tidak membuat order multi-SKU atau membuang salah satunya; klarifikasi/pemilik | D01 |
| AC03 | Data SKU/alamat/jumlah ambigu atau pesan menyuruh AI melewati owner | Klarifikasi/handoff; tidak menebak atau mengeksekusi approval/stock | D02 |
| AC04 | Draft valid dibuat dan diajukan | Snapshot/versi tercatat, notifikasi/antrean ada; stok tidak berubah/tidak terreservasi | D03 |
| AC05 | Dua approval paralel berebut stok terakhir | Hanya qty yang tersedia lolos, lainnya ditahan; saldo tidak negatif | D03 |
| AC06 | Approval diulang karena double-click/timeout/restart | Hasil lama dikembalikan; satu approval efektif, satu pengurangan stok | D03 |
| AC07 | Owner menyetujui versi lama setelah koreksi | Konflik versi; tidak ada eksekusi/stock movement baru | D03 |
| AC08 | Harga berubah, stok tidak cukup, SKU nonaktif atau quote kedaluwarsa | Approval ditahan; alasan terlihat; koreksi/re-quote dan review ulang, tidak mengganti total diam-diam | D03 |
| AC09 | Stok berubah tetapi masih cukup, harga/quote/versi tetap valid | Validasi stok terbaru digunakan; approval tidak ditahan hanya karena stock version berubah tanpa kekurangan | D03 |
| AC10 | Owner menolak sebelum approval | Alasan tersimpan; stok tidak berubah; bila dibuka revisi harus diajukan ulang | D04 |
| AC11 | Transaksi approval gagal di tengah operasi | Tidak ada order diproses dengan stok/audit setengah tersimpan; rollback atau rekonsiliasi state aman | D03 |
| AC12 | Konfirmasi WhatsApp gagal sesudah commit | Order tetap Diproses, stok tidak diulang; status pesan gagal/unknown terlihat | D02, keandalan |
| AC13 | Owner menandai selesai tanpa serah-terima/waktu/catatan atau waktu tak valid | Ditolak. Input sah menghasilkan COMPLETED dan audit; tidak ada stock decrement kedua atau klaim paid/delivered | D04 |
| AC14 | Owner membatalkan order PROCESSING/COMPLETED | Alasan wajib; CANCELLED; histori approval/serah-terima tetap ada; stok tidak otomatis bertambah | D04 |
| AC15 | Kondisi barang belum pasti vs sudah diperiksa qty 0 | Belum pasti tetap PENDING_REVIEW; qty 0 sah menjadi RESOLVED ber-audit tanpa movement positif | D04 |
| AC16 | Order qty 3 dibatalkan, 2 unit kembali layak jual, 1 rusak | Owner dapat mengonfirmasi +2 sekali; tidak otomatis +3 dan tidak dianggap pembatalan sebagian | D04 |
| AC17 | Restock dikirim ulang, paralel, melebihi qty order, atau key sama payload berbeda | Hasil identik tidak mengulang stok; konflik/qty tidak sah ditolak; saldo dan audit konsisten | D04 |
| AC18 | Koreksi setelah settlement / permintaan pesanan pengganti | Bukan restock ulang/edit order committed; adjustment beralasan tertaut dan tervalidasi, atau draft baru tertaut | D03–D04 |
| AC19 | Webhook berulang vs teks sama dengan ID berbeda | Event sama idempoten; teks sama tidak otomatis dianggap duplikasi/diabaikan | D02, keandalan |
| AC20 | Owner takeover/pause sementara job AI sedang berjalan | Job lama tidak membuat aksi otomatis setelah batas takeover; inbox/manual tetap aktif; resume saat global pause ditolak | D02 |
| AC21 | Signature webhook palsu, worker crash, provider timeout atau window pesan habis | Tidak bypass verifikasi; durable resume, rekonsiliasi unknown dan kepatuhan template; tidak ada success palsu | Keandalan |
| AC22 | 100 sampel respons: 94 <5 detik, 6 gagal | p95 utama tidak dinyatakan <5 detik dengan menyaring failure; N/miss/failure terlihat. Waktu tunggu owner tidak masuk eksekusi | D05, K01–K02 |
| AC23 | 10 episode matang, 3 punya approval dalam 168 jam; salah satu punya 2 order; ada cohort muda/order manual | Konversi 30%, bukan 40%; cohort muda provisional, manual tanpa episode dikecualikan. Cancellation ditampilkan terpisah | D05, K03 |
| AC24 | Insiden stok ditemukan setelah laporan; atau tidak ada baseline/sampel | Insiden dikaitkan ke cohort approval dan riwayat diperbarui; tanpa sampel/baseline tidak mengklaim error 0%/hemat 70% | D05, K04–K05 |
| AC25 | Ada data contoh/test dan order disetujui yang belum dibayar | Data demo tidak masuk KPI live; approved order value/ongkir terpisah, tidak disebut uang diterima | D05 |

## G. Checklist handoff ke implementasi

- [x] D01–D05 disetujui pengguna; pipeline resmi v1.1 ditetapkan.
- [x] Policy AI/owner, versi draft, persetujuan, stok dan penyelesaian dituangkan.
- [x] Pembatalan/restock dipindahkan ke P0; idempotensi, kondisi barang dan audit didefinisikan.
- [x] KPI p95, window 7 hari dan batas klaim dampak didefinisikan.
- [ ] T01–T07 diputuskan pada tahap teknis/persiapan pilot yang relevan.
- [ ] Pengguna memberikan instruksi eksplisit untuk implementasi.
- [ ] Backend nyata dibuat dan AC01–AC25 diverifikasi; checklist ini bukan hasil pengujian produk.