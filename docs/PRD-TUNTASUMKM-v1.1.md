# PRD TuntasUMKM v1.1 — Baseline Produk & Operasional

Versi: **1.1.0** · Tanggal: **21 September 2026**

Status: **BASELINE PRODUK DIKUNCI** berdasarkan persetujuan pengguna atas lima kelompok keputusan D01–D05. Dokumen ini mengunci perilaku produk, bukan menyatakan backend sudah dibuat atau semua target telah tercapai.

## 0. Otoritas dokumen dan batas persetujuan

- Acuan implementasi produk: dokumen ini dan [aturan operasional serta kriteria penerimaan](ATURAN-OPERASIONAL-TUNTASUMKM-v1.1.md).
- Jika bertentangan dengan rencana backend/register gap terdahulu, v1.1 ini yang berlaku untuk **kebijakan produk**. Lampiran asli tetap disimpan apa adanya sebagai sumber historis.
- **[DISETUJUI]** berarti keputusan eksplisit pengguna. **[TURUNAN]** berarti detail/default operasional yang disusun untuk membuat keputusan tersebut dapat dilaksanakan; bukan kutipan persetujuan terpisah atau isi yang diklaim terbaca dari lampiran.
- **[TERBUKA]** berarti pilihan teknis, parameter provider, atau bukti penelitian yang belum diputuskan. Tidak mengubah lima keputusan produk yang telah dikunci.
- Tidak ada izin baru untuk mengimplementasikan backend/integrasi. Repo tetap pada kondisi sebelumnya.
- Nomor/nama tujuh tahap kini sah sebagai baseline **v1.1 melalui keputusan pengguna**, bukan sebagai rekonstruksi isi lampiran v1.0 yang hilang.

## 1. Masalah, tujuan, dan pengguna

**Masalah:** pemilik toko tidak mampu menangani semua chat dan pekerjaan berulang secara konsisten. Detail pembelian tersebar di percakapan; validasi produk/stok/ongkir serta pencatatan pesanan memakan waktu dan rentan keliru.

**Tujuan:** mengubah percakapan niat beli menjadi pesanan yang rinci, tervalidasi, mendapat persetujuan pemilik, dan dapat dituntaskan dengan jejak tindakan yang jelas.

Persona:
1. **Pemilik toko:** satu-satunya aktor bisnis dashboard yang dapat menyetujui, mengubah stok, membatalkan, dan menandai selesai pada MVP.
2. **Pelanggan:** mengirim kebutuhan lewat WhatsApp; tidak harus membuat akun dashboard.
3. **Asisten AI:** membantu memahami dan menyiapkan; bukan pengambil keputusan finansial/stok.

Pemetaan masalah kerja [TURUNAN], bukan empat lapisan resmi yang berhasil dibaca dari lampiran:

| Kendala | Intervensi produk | Bukti yang perlu dikumpulkan |
|---|---|---|
| Respons pelanggan terlambat | Respons awal dan klarifikasi otomatis yang aman | Waktu respons aktual dan kegagalan pengiriman |
| Produk/varian/stok tidak pasti | Lookup katalog dan validasi ulang sebelum eksekusi | Error terverifikasi dan pemeriksaan yang ditahan |
| Detail order tercecer dan pekerjaan berulang | Draft terstruktur, satu alur persetujuan–eksekusi | Waktu kerja admin, jumlah koreksi dan order diproses |
| Sulit menjaga kendali dan menelusuri kesalahan | Hak pemilik, takeover, audit dan indikator operasional | Persetujuan sah, waktu tunggu, insiden serta pemulihan |

Baseline numerik pada lampiran bukan hasil penelitian toko pilot. Frekuensi/dampak tiap masalah masih harus divalidasi melalui pilot; tidak dibuat-buat dalam PRD ini.

## 2. Decision log yang dikunci

| ID | Keputusan [DISETUJUI] |
|---|---|
| D01 — Scope | Toko barang ready-stock; WhatsApp teks Bahasa Indonesia; satu pemilik dan satu lokasi stok per toko; satu SKU per pesanan. Pembayaran dan pemesanan kurir otomatis tidak termasuk MVP. |
| D02 — Alur & kewenangan | Terima pesan → lengkapi kebutuhan → validasi produk/stok → hitung ongkir → siapkan draft → keputusan pemilik → eksekusi. AI boleh membalas informasi tervalidasi dan meminta klarifikasi. Persetujuan pesanan serta perubahan stok tetap memerlukan pemilik. |
| D03 — Stok & draft | TuntasUMKM menjadi sumber stok. Draft tidak menahan stok. Stok berkurang sekali saat persetujuan berhasil. Harga berubah, stok tidak cukup, atau ongkir kedaluwarsa menahan persetujuan sampai draft diperiksa ulang. Koreksi stok manual wajib alasan dan audit. |
| D04 — Selesai & batal | Pemilik menandai selesai sesudah barang diserahkan kepada kurir/pembeli, dengan waktu dan catatan. Bukan bukti pembayaran atau penerimaan pelanggan. Penolakan sebelum persetujuan tidak mengubah stok. Pembatalan sesudah persetujuan owner-only, wajib alasan; stok kembali hanya setelah konfirmasi kondisi barang dan dicatat sekali. Refund di luar sistem. |
| D05 — KPI | Target respons awal <5 detik dan eksekusi setelah persetujuan <10 detik pada p95; waktu tunggu pemilik terpisah. Konversi: percakapan niat beli yang menghasilkan order disetujui dalam 7 hari. Target konversi 25–30%, hemat waktu admin 70%, error varian/stok 0% adalah target pilot, bukan jaminan. |

## 3. Scope fitur

### Termasuk P0
- Identitas pemilik dan pemisahan data per toko; satu owner dan lokasi stok per toko, bukan satu database global tanpa tenant.
- Inbox WhatsApp teks, balasan informasi/klarifikasi, pesan manual pemilik, takeover dan pause asisten.
- Katalog SKU ready-stock, harga, stok tersedia dan riwayat mutasi beralasan.
- Validasi kebutuhan, perhitungan ongkir, draft satu SKU dengan jumlah unit positif, revisi dan penolakan.
- Persetujuan versi terkini dan eksekusi order–stok–audit secara atomik.
- Penandaan selesai oleh pemilik sesudah serah-terima fisik, disertai waktu dan catatan.
- **Pembatalan sesudah persetujuan serta rekonsiliasi stok terkait adalah P0**, bukan lagi backlog opsional.
- Riwayat tindakan, notifikasi persetujuan/kegagalan, dashboard dan KPI dari event nyata.

### Tidak termasuk P0
- Multi-item/SKU per pesanan, pre-order, jasa, produk tanpa stok fisik, multi-gudang dan akun staff/delegasi.
- Reservasi stok saat draft, persetujuan otomatis oleh AI, diskon/negosiasi harga otomatis.
- Payment gateway, validasi pembayaran, refund, billing langganan.
- Booking/pickup kurir otomatis, tracking otomatis, bukti penerimaan pelanggan otomatis.
- Sinkronisasi POS/marketplace, kanal selain WhatsApp, pemahaman voice/image/OCR.
- Workflow retur/penukaran lengkap. Konfirmasi stok kembali untuk order yang dibatalkan tetap termasuk P0.

Satu SKU dapat dipesan dalam beberapa unit. Permintaan beberapa SKU tidak boleh diam-diam dibuang atau digabung; asisten menjelaskan batas dan meminta pemilik menangani/pelanggan menyetujui pemisahan pesanan [TURUNAN].

## 4. Pipeline resmi v1.1

| Tahap | Hasil wajib | Jika tidak dapat dilanjutkan |
|---|---|---|
| S1 — Terima pesan | Pesan terverifikasi tersimpan sekali, terkait toko/pelanggan/percakapan | Signature salah ditolak; duplikat tidak memicu aksi baru |
| S2 — Lengkapi kebutuhan | SKU kandidat, jumlah, penerima, cara/tujuan penyerahan dan informasi wajib jelas | Tanya klarifikasi; AI tidak menebak detail. Media di luar scope dialihkan |
| S3 — Validasi produk/stok | SKU aktif, harga benar, jumlah valid, snapshot ketersediaan | Varian ambigu/tidak ada atau stok kurang ditahan dan dijelaskan |
| S4 — Hitung ongkir | Tarif, layanan, asal/tujuan, sumber dan masa berlaku quote | Retry baca terkontrol atau tarif manual owner beralasan; tidak membuat angka fiktif |
| S5 — Siapkan draft | Versi draft berisi rincian dan total yang dapat ditinjau pemilik | Data belum lengkap tidak dapat diajukan |
| S6 — Keputusan pemilik | Persetujuan, penolakan atau permintaan revisi oleh owner yang sah | Menunggu tanpa mengurangi/mereservasi stok; tidak ada auto-approve |
| S7 — Eksekusi | Order diproses + stok berkurang + audit/outbox tersimpan atomik | Gagal validasi/transaksi tidak membuat persetujuan efektif atau mutasi parsial |

**S7 tidak otomatis membuat status pesanan Selesai.** Eksekusi transaksi menghasilkan status Diproses; proses fisik dilanjutkan pemilik sampai serah-terima dan penandaan selesai.

Respons awal dan klarifikasi boleh terjadi sebelum S6. Respons itu tidak boleh menyatakan order sudah disetujui atau stok sudah dijamin. Konflik penomoran auto-reply stage 6 pada lampiran lama digantikan keputusan D02 untuk v1.1.

## 5. Kewenangan tindakan

Matriks berikut merupakan penjabaran D02–D04 [TURUNAN]. Server tetap melakukan pemeriksaan; instruksi dalam chat bukan otorisasi.

| Tindakan | AI | Pemilik | Syarat |
|---|---|---|---|
| Membaca informasi toko/katalog/stok | Boleh melalui data/tool tervalidasi | Boleh | Hanya tenant yang sesuai; ketersediaan belum reservasi |
| Membalas informasi dan meminta klarifikasi | Boleh | Boleh | Tidak mengarang harga/ongkir/kebijakan; obey takeover/pause dan aturan kanal |
| Menghitung/memperbarui quote | Boleh memakai tool | Boleh | Bukan booking kurir; hasil bersumber dan berjangka |
| Menyiapkan draft | Boleh | Boleh | Tidak ada mutasi stok |
| Mengoreksi draft belum disetujui | Boleh mengusulkan revisi dari kebutuhan pelanggan | Boleh mengoreksi | Setiap perubahan tersimpan sebagai versi baru dan perlu peninjauan owner |
| Menyetujui / menolak / meminta revisi | Tidak | Boleh | Identitas owner + versi terkini; reject/revisi wajib alasan |
| Mengurangi stok akibat order | Tidak secara mandiri | Memberi persetujuan | Sistem mengeksekusi transaksi atomik sesudah otorisasi sah |
| Mengubah katalog/harga/stok manual | Tidak | Boleh | Perubahan terlacak; koreksi stok wajib alasan |
| Menandai selesai | Tidak | Boleh | Sudah serah-terima, waktu dan catatan wajib |
| Membatalkan atau mengonfirmasi stok kembali | Tidak | Boleh | Alasan/kondisi barang, kontrol duplikasi, riwayat dipertahankan |
| Mengambil alih / mengembalikan ke AI | Tidak memutuskan sendiri | Boleh | Job AI lama tidak boleh membalas setelah takeover; resume tidak meniadakan global pause |
| Memproses pembayaran/refund/booking kurir | Tidak | Di luar sistem MVP | Tidak menampilkan keberhasilan palsu |

## 6. Aturan order, stok, quote dan penyelesaian

- SKU unik per toko; jumlah integer positif; stok tidak negatif; harga dan ongkir IDR tersimpan dengan presisi integer [TURUNAN].
- Draft menyimpan snapshot SKU/nama/varian/harga/jumlah/penerima/alamat/ongkir/total dan versi. Data dari frontend/AI harus divalidasi ulang oleh server.
- Tidak ada stok yang dicadangkan pada draft. Stok yang terlihat hanya ketersediaan pada saat pemeriksaan; dua draft dapat bersaing atas unit terakhir.
- Approval sah terikat owner, tenant, ID order dan versi. **Efek approval baru sah saat transaksi berhasil commit.** Klik tombol atau pesan pelanggan bukan approval efektif.
- Saat approve, periksa lagi SKU aktif, harga, jumlah, stok, kelengkapan, quote dan versi. Bila berubah/tidak valid, tampilkan alasan, tanpa stok negatif atau total yang diam-diam diganti.
- Refresh quote/perubahan data menghasilkan versi draft baru yang ditinjau owner. Bila SKU, jumlah atau total yang telah dikonfirmasi pelanggan berubah, minta konfirmasi pelanggan lagi [TURUNAN].
- Panggilan provider tidak dijalankan sambil menahan transaksi stok. Quote diperoleh sebelumnya; freshness dan fingerprint diperiksa saat commit [TURUNAN].
- Default quote [TURUNAN]: masa berlaku provider dipakai bila tersedia; bila tidak tersedia, 15 menit sejak quote diterima. Quote manual owner berlaku 15 menit sejak dicatat. Ini aturan freshness internal, bukan jaminan tarif provider. Tidak ada refresh otomatis yang sekaligus menyetujui order.
- Draft tidak otomatis dibatalkan karena umur pada P0 [TURUNAN]; tetap wajib validasi ulang. Tidak perlu expiry reservasi karena reservasi tidak ada.
- Gagal mengirim konfirmasi WhatsApp setelah commit tidak mengurangi stok lagi, tidak membatalkan order otomatis, dan tidak menghalangi pencatatan serah-terima fisik yang benar.
- Selesai wajib memuat `handover_at`, `handover_to` (kurir/pembeli), catatan, actor dan waktu pencatatan server. Waktu serah-terima tidak boleh di masa depan atau sebelum persetujuan efektif [TURUNAN]. Resi boleh dicatat, tidak diwajibkan untuk penyerahan langsung.
- Selesai berarti penyerahan oleh toko, bukan pembayaran lunas/delivery pelanggan. Jika diserahkan langsung, catatan harus menyatakan penyerahan langsung; tidak menciptakan status tracking otomatis.

### Pembatalan dan pemulihan stok [D04 + TURUNAN]

1. Sebelum approval efektif: pemilik menolak/menghentikan draft dengan alasan; tidak ada stok yang perlu dikembalikan.
2. Sesudah approval: owner dapat membatalkan order secara utuh dengan alasan. Tidak ada edit bebas SKU/jumlah order yang sudah diproses; perubahan transaksi ditangani lewat pembatalan dan draft pengganti yang terhubung.
3. Pembatalan tidak otomatis menambah stok. Stok bisa masih berada di kurir/pelanggan, rusak, atau belum diverifikasi.
4. Jika kondisi belum diketahui, status rekonsiliasi `PENDING_REVIEW`; order tetap tercatat dibatalkan. Pemilik menindaklanjuti di antrean perhatian.
5. Setelah kondisi pasti, owner mengonfirmasi jumlah yang **secara fisik tersedia dan layak dijual**: integer 0 sampai jumlah order. Jumlah bisa kurang dari jumlah order karena sebagian rusak/tidak kembali; ini bukan fitur pembatalan sebagian.
6. Satu keputusan pemulihan final per pembatalan, dicatat sekali secara idempoten. Keputusan dengan jumlah 0 tetap diaudit tetapi tidak membuat movement stok bernilai positif. Stok kembali + settlement + audit harus atomik.
7. `COMPLETED` boleh dibatalkan owner sebagai koreksi/kejadian lanjutan setelah serah-terima; fakta serta timestamp serah-terima sebelumnya tidak dihapus. Barang hanya dapat masuk stok setelah benar-benar kembali dan layak jual.
8. Koreksi sesudah settlement final tidak mengulang operasi pemulihan; gunakan penyesuaian stok owner yang mencatat kaitan ke order/movement sebelumnya dan alasan. Validasi jumlah pemulihan bersih terkait pembatalan agar tidak melebihi pengurangan awal. Tidak ada restock ganda yang disamarkan sebagai retry.
9. Pembatalan tidak mengirim refund atau menyatakan refund berhasil. Pembayaran/kompensasi uang ditangani di luar sistem.

## 7. Status dan transisi

Nama teknis berikut adalah pemetaan implementasi [TURUNAN]. Status bisnis tidak boleh disamakan dengan status pesan atau pembayaran.

| Dari | Aksi | Ke | Pengaruh stok |
|---|---|---|---|
| DRAFT | Ajukan draft valid | AWAITING_APPROVAL | Tidak ada |
| DRAFT / AWAITING_APPROVAL | Owner menolak, alasan wajib | REJECTED | Tidak ada |
| AWAITING_APPROVAL | Owner meminta revisi | NEEDS_REVISION | Tidak ada |
| AWAITING_APPROVAL / NEEDS_REVISION | Koreksi versi baru dan ajukan | AWAITING_APPROVAL | Tidak ada; versi lama tidak dapat disetujui |
| REJECTED | Owner membuka revisi | NEEDS_REVISION | Tidak ada |
| AWAITING_APPROVAL | Owner approve + transaksi berhasil | PROCESSING | Kurang sekali sesuai qty |
| PROCESSING | Owner mencatat serah-terima | COMPLETED | Tidak berkurang lagi |
| PROCESSING / COMPLETED | Owner membatalkan dengan alasan | CANCELLED | Tidak otomatis kembali |
| CANCELLED + PENDING_REVIEW | Owner menyelesaikan pemeriksaan barang | CANCELLED + RESOLVED | Tambah qty layak jual sekali, atau 0 |

Status `CANCELLED` tidak dibuka kembali menjadi order aktif pada P0; kebutuhan baru memakai draft baru dengan referensi order lama. Permintaan ulang yang identik mengembalikan hasil sebelumnya; payload berbeda pada kunci idempotensi yang sama harus ditolak.

## 8. Keandalan dan perlindungan minimum [TURUNAN]

- Isolasi tenant dan pemeriksaan owner dilakukan pada server, termasuk export, timeline, quote dan notifikasi.
- Mutasi order/stok/approval/audit/outbox tidak boleh separuh berhasil. Dua approval berebut stok terakhir hanya dapat meloloskan jumlah yang tersedia.
- Inbox dedupe berdasarkan identitas event/message provider, bukan teks. Pesan identik dengan ID baru bisa merupakan kebutuhan baru yang sah.
- Order/draft tidak digandakan oleh retry untuk kebutuhan yang sama. Bedakan request duplikat dari pesanan ulang pelanggan.
- Antrean persisten dapat dilanjutkan setelah restart. Side effect eksternal yang hasilnya tidak pasti diberi status `unknown` untuk rekonsiliasi; jangan blind retry atau menjanjikan exactly-once lintas provider.
- AI tidak boleh mengeksekusi instruksi dalam pesan untuk melewati approval, mengambil data toko lain, atau menjalankan tool di luar izin.
- Pause/takeover mempertahankan inbox dan akses pemilik. Cek versi handler lagi sebelum aksi otomatis; pesan yang sudah benar-benar diterima provider sebelum takeover tidak dapat dianggap bisa ditarik kembali.
- Secret tidak disimpan di client/log; minimalkan alamat/nomor/chat yang dikirim ke model; akses log dan data sensitif dibatasi. Kebijakan retensi numerik, kebutuhan legal dan vendor belum dikunci (bagian 11).

## 9. Kamus KPI dan aturan hitung

Target D05 disetujui; instrumentasi/aturan statistik di bawah adalah detail [TURUNAN]. Semua timestamp pengukuran memakai event server UTC; tanggal laporan tampil menurut zona waktu toko. Data test/demo dipisahkan dari pilot.

### K01 — Respons awal, target p95 <5 detik
- Unit: giliran pelanggan pada percakapan aktif yang memerlukan respons. Pesan identik dari retry provider tidak menjadi sampel baru.
- Awal: `inbound_received_at` pada server; akhir: `first_reply_provider_accepted_at` yang berkaitan dengan giliran itu. Beberapa pesan beruntun yang dijawab bersama memakai pesan paling awal yang belum dibalas sebagai awal; semua relasi pesan tetap dicatat.
- Balasan penerimaan/klarifikasi yang jujur boleh menjadi respons awal; ACK HTTP webhook **bukan** respons pelanggan. Latensi jawaban substantif dan receipt delivered dicatat terpisah.
- Laporan dipisah antara mode asisten dan mode pemilik/pause; tidak mengklaim waktu kerja pemilik sebagai kecepatan AI.
- Pesan yang memerlukan respons tetapi gagal/tidak mendapat balasan adalah miss, tidak diam-diam dikeluarkan. Jika mode berubah di tengah proses, catat takeover dan laporkan kohort awalnya; jangan memindahkan kegagalan untuk mempercantik angka.

### K02 — Eksekusi sesudah persetujuan, target p95 <10 detik
- Awal: `approval_request_received_at`, sebelum validasi server. Akhir: `order_transaction_committed_at` (stok, order, audit dan outbox sudah durable).
- Permintaan owner untuk versi/status yang valid dan lolos syarat bisnis menjadi kohort eksekusi; retry identik bukan sampel baru. Internal error/timeout sesudah penerimaan sah dihitung sebagai kegagalan, bukan disaring dari kohort.
- Permintaan tanpa izin/versi usang atau yang ditahan karena harga, quote, stok/input tidak sah dilaporkan tersendiri sebagai **approval ditahan**, dengan alasan, jumlah dan waktu hasilnya; bukan eksekusi berhasil.
- `approval_request_received_at - draft_ready_at` adalah waktu tunggu pemilik, tidak masuk target eksekusi. Pengiriman pesan/provider dan serah-terima fisik bukan akhir waktu mesin ini.

### Aturan p95 dan sampel
- Gunakan nearest-rank: urutkan durasi dan ambil urutan `ceil(0,95 × N)`.
- Sampel yang gagal/tidak selesai setelah batas target diperlakukan sebagai miss/tak hingga untuk evaluasi target; tidak menyimpan nilai infinity dalam data transaksi. Laporkan p95, N, jumlah miss/failure dan jumlah sampel masih berjalan.
- p95 sukses-saja boleh menjadi diagnostik, bukan pengganti KPI utama. Bila kegagalan menempati rank p95, tampilkan “target tidak tercapai / p95 tidak terhingga”, bukan menghapus sampelnya.
- Tampilkan 0 sampel sebagai “belum ada data”; N<100 diberi label “sampel terbatas” [default pelaporan, bukan bukti signifikansi statistik]. Beban uji dan batas kapasitas masih harus disepakati sebelum klaim SLO umum.

### K03 — Konversi percakapan niat beli, target 25–30%
- `conversion = jumlah episode niat beli unik dengan ≥1 order approved dalam 168 jam / jumlah episode niat beli eligible unik pada cohort matang × 100%`.
- Episode niat beli mulai pada pesan pertama yang menyatakan ingin membeli/memesan barang tertentu; kebutuhan masih boleh belum lengkap. FAQ umum, spam, test dan dukungan order lama bukan episode niat beli baru. Simpan bukti pesan dan versi klasifikasi; koreksi owner harus diaudit.
- Satu thread WhatsApp dapat berisi beberapa episode. Pertanyaan/koreksi kebutuhan yang sama tetap satu episode. Hanya niat pesanan baru yang eksplisit atau konfirmasi owner memulai episode baru; tidak dipecah per pesan/per hari untuk mengubah denominator.
- Jendela `[intent_started_at, intent_started_at + 168 jam)`; setiap order mempunyai paling banyak satu episode atribusi utama. Order manual tanpa episode tertaut tidak masuk numerator ini.
- Pada tanggal evaluasi, hanya episode yang telah melewati penuh 168 jam masuk cohort matang. Cohort lebih muda dilaporkan provisional, bukan dicampur sebagai hasil final.
- Beberapa order dalam satu episode tetap dihitung satu konversi. Approval setelah 168 jam tidak masuk konversi 7 hari. Episode tanpa order tetap masuk denominator.
- Primary metric mengikuti keputusan pengguna: mencapai **approved**, bukan paid. Order dibatalkan kemudian tidak menghapus fakta konversi awal; tampilkan companion metric pembatalan/net conversion agar dampak buruk terlihat. Tidak mengklaim konversi sebagai pendapatan diterima.

### K04 — Error varian/stok, target 0%
- `jumlah order approved dengan ≥1 error varian/stok terverifikasi / jumlah order approved pada cohort pelaporan × 100%`; satu order dihitung sekali meski beberapa insiden.
- Error meliputi varian salah atau ketidaktersediaan stok aktual pada order yang telah lolos; harus ada bukti/kategori insiden. Pemeriksaan yang ditahan sebelum approve bukan error order.
- Insiden yang ditemukan belakangan dikaitkan kembali ke cohort approval-nya; riwayat pembaruan laporan dipertahankan. Pembatalan tanpa error varian/stok bukan otomatis error.
- Tampilkan jumlah approved, error, blocked validation dan koreksi manual. Nol sampel tidak boleh dilabeli 0% berhasil. Kualitas data stok fisik tetap perlu pemeriksaan pemilik.

### K05 — Penghematan waktu admin, target 70%
- `(rata-rata waktu kerja admin baseline − rata-rata waktu kerja admin sesudah) / rata-rata baseline × 100%`.
- Bandingkan pekerjaan/kompleksitas order sebanding; catat waktu kerja aktif, termasuk koreksi, pembatalan dan pengecekan ulang, bukan hanya jeda timestamp draft–approval.
- Tanpa baseline yang valid dan positif, tampilkan “belum dapat dihitung”. Jumlah sampel, periode, metode pencatatan dan keterbatasan wajib ditampilkan. Pilot tidak otomatis membuktikan efek kausal.

## 10. Gerbang penerimaan

Seluruh kasus AC01–AC25 dalam dokumen [aturan operasional](ATURAN-OPERASIONAL-TUNTASUMKM-v1.1.md) menjadi kontrak pengujian masa depan. **Belum dinyatakan lulus sebagai backend bisnis.**

- Gate A: domain manual (auth, tenant, draft, versi, approval, stok, cancel/restock, audit) benar sebelum AI diberi tool usulan.
- Gate B: provider terpilih, kanal nyata, quote dan pengiriman dapat diverifikasi; kebijakan data serta error recovery jelas.
- Gate C: model/evaluasi Bahasa Indonesia, takeover, workflow dan migrasi frontend ke server.
- Gate D: concurrency/failure/privacy/restore tests, instrumentasi KPI dan UAT pilot.

Target dampak bisnis tidak menjadi janji selesai dalam 20 hari. Konversi membutuhkan cohort 7 hari yang matang; penghematan waktu memerlukan baseline pembanding.

## 11. Keputusan yang masih terbuka

| ID | Keputusan | Status / batas |
|---|---|---|
| T01 | Database dan rancangan teknis final | FastAPI + PostgreSQL masih rekomendasi; MongoDB transaction-capable alternatif. Persetujuan D01–D05 bukan persetujuan migrasi database |
| T02 | Metode login/session dan pemulihan akun | Owner-only sudah dikunci, penyedia/metode auth belum dipilih |
| T03 | Provider WhatsApp, akun/nomor, template dan akses | Kanal WhatsApp disetujui; vendor/credential belum dipilih atau dipasang |
| T04 | Provider/model AI, evaluasi bahasa, token/biaya dan pengolahan data | Batas kewenangan terkunci; model/anggaran belum ditetapkan |
| T05 | Provider ongkir, layanan, coverage dan kontrak quote | Kalkulasi saja, tanpa booking; default freshness internal tersedia, perilaku provider perlu verifikasi |
| T06 | Profil beban, uptime, recovery, retensi dan legal/privacy | Invariant keamanan berlaku; angka kapasitas/RPO/RTO/retensi belum ditetapkan, wajib sebelum pilot data nyata |
| T07 | Toko pilot, baseline, staffing dan kalender eksekusi | Scope produk terkunci; peserta/riset/jadwal 20 hari belum menjadi komitmen |

T01–T07 tidak menghalangi penguncian kebijakan produk, tetapi menahan keputusan teknis/pilot terkait. Memperoleh lampiran sumber lengkap tetap berguna untuk bukti masalah; tidak diperlukan untuk menebak kembali tujuh tahap v1.1 yang sudah disetujui.

## 12. Pengendalian perubahan

- Perubahan D01–D05 harus dicatat sebagai change request: alasan, dampak scope/data/KPI, persetujuan pemilik produk dan versi baru.
- Detail turunan yang perlu disesuaikan setelah provider dipilih juga harus di-versioning; tidak boleh diam-diam mengubah makna persetujuan atau periode KPI.
- Kebijakan, versi draft, keputusan owner dan event historis tidak ditulis ulang agar tampak sesuai versi baru. Simpan `policy_version` untuk penelusuran.
- Setiap implementasi berikutnya mengacu baseline 1.1.0 ini; persetujuan dokumen bukan perintah memulai coding.