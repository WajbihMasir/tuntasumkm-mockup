# TuntasUMKM — Rencana Backend & Kesesuaian PRD

Tanggal: 21 September 2026 · Status: **PLAN teknis; baseline produk v1.1 telah dikunci, backend belum diimplementasikan**

**Pembaruan keputusan:** pengguna menyetujui D01–D05. [PRD v1.1](PRD-TUNTASUMKM-v1.1.md) dan [aturan operasional](ATURAN-OPERASIONAL-TUNTASUMKM-v1.1.md) menjadi acuan kebijakan. Arsitektur, vendor, kontrak teknis dan estimasi di sini tetap usulan; tidak otomatis ikut disetujui. Pembatalan sesudah approval dan rekonsiliasi stok kini termasuk P0.

## 1. Ringkasan keputusan

TuntasUMKM perlu dibangun sebagai **sistem operasional berbantuan AI dengan persetujuan pemilik**, bukan sekadar chatbot yang diberi akses database. AI membantu memahami percakapan; keputusan stok, harga, ongkir, hak akses, dan eksekusi harus diperiksa oleh aturan server.

Rekomendasi target: **FastAPI + PostgreSQL + worker terpisah + transactional outbox**, dalam satu codebase modular. Redis/queue khusus dapat ditambahkan saat kebutuhan antrean meningkat. Pertahankan React yang sudah ada. Rekomendasi PostgreSQL belum diterapkan; MongoDB sandbox tetap utuh. Alternatif tetap menggunakan MongoDB dibahas di bagian 5.

Tiga hal harus dipisahkan:
1. **Tertulis pada lampiran:** operasi stok/draft/ongkir, kendali pemilik, pipeline tujuh tahap, dan target dampak.
2. **Sudah terlihat di repo:** simulasi frontend yang cukup lengkap, tetapi bukan backend bisnis.
3. **Usulan teknis dalam dokumen ini:** kontrak API, model data, pilihan teknologi dan jadwal. Batas MVP serta kebijakan inti telah disetujui melalui PRD v1.1; pilihan teknis dan izin implementasi tetap terpisah.

**Batas kepastian:** lampiran hanya 2.314 byte, 190 baris, banyak bagian berupa judul tanpa isi. Tidak mungkin menyatakan kesesuaian 100%, nama resmi tujuh tahap, atau empat pain-point resmi dari dokumen tersebut. Bisa jadi tabel/diagram hilang saat konversi; ini temuan pada artefak yang diterima, bukan kesimpulan tentang dokumen sumber yang tidak tersedia.

## 2. Apa yang sudah dijalankan

- Repo: https://github.com/WajbihMasir/tuntasumkm-mockup
- Commit yang benar-benar diklon: `1fbf4f71018c2c405f0945d75347575e1b57fdbb`.
- Salinan utuh: `/app/source/tuntasumkm-mockup`; frontend aktif: `/app/frontend`.
- Preview: https://tuntasumkm-mockup.preview.emergentagent.com/dashboard
- Halaman: landing, Ringkasan, Percakapan, Pesanan, Produk & Stok, Analitik, Pengaturan.
- Kode produk frontend tidak diubah dari commit sumber. Dependensi Lenis ditambahkan agar landing dapat berjalan. Backend `server.py` identik dengan sumber; konfigurasi URL/database dipertahankan.
- Pengujian baru: seluruh halaman terbuka; alur skenario normal → validasi → draft → persetujuan → selesai berhasil; stok 42 → 40 sekali; reload mempertahankan data lokal; data demo dikembalikan ke awal.
- Tiga unit test idempotensi, tiga tes API template, dan build produksi berhasil. Desktop 1920×800 serta mobile 390×844 diverifikasi. Laporan: `/app/test_reports/iteration_1.json`.
- Tes API membuat satu catatan `status_checks` dengan penanda `TEST_tuntasumkm_mock_scope`; ini data tes template, bukan data bisnis.

Yang berjalan saat ini adalah **simulasi lokal**: tidak ada WhatsApp, AI, kurir, atau pembayaran nyata. Hasil uji tersebut membuktikan mockup berjalan, bukan membuktikan kesiapan backend bisnis atau target KPI PRD.

## 3. Bukti dan pemetaan kebutuhan

Referensi `frontend/...` dan `backend/...` di bawah relatif terhadap repo pada commit tersebut. Referensi PRD menunjuk `/app/docs/PRD-TuntasUMKM-original.md`.

| Area | Bukti yang tersedia | Kondisi aktual | Backend yang dibutuhkan | Prioritas |
|---|---|---|---|---|
| Penyimpanan bisnis | `frontend/src/lib/store.js:7–35` | React context + localStorage `tuntas-dashboard-v1`; seluruh perubahan di browser | Database bisnis, API, validasi server, sinkronisasi antarsesi | P0 |
| Akun dan toko | `Settings.jsx:28–44`, `store.js:8` | Nama pemilik/toko dapat diubah; bukan identitas terautentikasi | Login, session, membership toko, owner authorization, isolasi tenant | P0 turunan operasional |
| Percakapan | `Conversations.jsx:18,30–35` | Pesan lokal; tanda terkirim dibentuk UI | WhatsApp webhook, inbox/outbox, identitas pelanggan, histori dan receipt asli | P0 |
| Pemahaman chat | `scenarios.js:12–20` | Sembilan skenario berisi kebutuhan yang sudah diisi kode | Ekstraksi intent/entity terstruktur, konteks, klarifikasi, fallback ke pemilik | P0 |
| Produk/varian | `Products.jsx:13–14` | Satu objek produk merangkap varian; stok editable langsung | Product + SKU/variant, harga versi, kategori, sumber data yang berwenang | P0 |
| Validasi stok | `workflowRules.js:14–27`; `workflowOperations.js:61–75` | Cek dan pengurangan stok lokal saat persetujuan | Mutasi stok atomik, ledger, penguncian/conditional update, cegah overselling | P0 |
| Ongkir | `workflowRules.js:2–12` | Tarif empat kota + rumus jumlah barang; bukan tarif kurir | Adapter quote kurir, asal/tujuan valid, berat, snapshot, kedaluwarsa quote | P0 |
| Draft & koreksi | `workflowOperations.js:25–51` | Draft lokal, versi, alasan/perubahan | Draft API, snapshot harga/SKU/alamat, optimistic concurrency, versi immutable | P0 |
| Persetujuan | `workflowOperations.js:53–77` | Guard lokal dan nama pemilik string | Approval terikat user, toko, versi dan payload; idempotensi persisten | P0 |
| Takeover/pause | `workflowOperations.js:79–84` | Flag handler lokal | Mode handler per percakapan, version fence terhadap job AI yang sedang berjalan | P0 |
| Pipeline | `workflowRules.js:1,37–64` | Tujuh tahap usulan diturunkan dari state; bukan engine persisten | State machine, run/step log, timeout, retry terkontrol, resume | P0 |
| Audit | `workflowOperations.js:6–8` | Event di browser, dapat dihapus/reset | Audit server dengan actor, correlation ID, before/after, version, result | P0 |
| Analitik | `analytics.js:4–35` | Historis tetap + sesi lokal; label sudah membedakan sumber | Event bisnis server, definisi KPI, filter waktu, agregasi, ekspor terotorisasi | P0 dasar / P1 lanjutan |
| Backend existing | `backend/server.py:41–67` | Hanya GET `/api/`, GET/POST `/api/status` | Seluruh API domain di atas belum ada | P0 |

**Tidak boleh dipindahkan mentah-mentah:** `nextOrderId` berbasis max array, guard `useRef`, `stockApplied` lokal, tarif kota, timestamp browser, nama pemilik string, dan counter duplicate demonstrasi. Ini membantu UX demo tetapi tidak menyelesaikan concurrency dan identitas di server.

### Fakta PRD yang dapat ditelusuri

- Baris 4–7: fokus kegagalan eksekusi operasional akibat kapasitas manusia.
- Baris 48–50: tindakan update stok, buat draft order, hitung ongkir.
- Baris 62–67: pipeline tujuh tahap dan tetap menjaga kendali pemilik; daftar tahap tidak tersedia.
- Baris 158–163: tabel KPI terpotong, tetapi target respons <5 detik, proses <10 detik, penghematan 70%, error 0%, konversi 25–30% masih terbaca. Interpretasi metrik perlu dikonfirmasi, bukan dijadikan kontrak kinerja tanpa definisi.
- Baris 167: judul eksekusi 20 hari; rincian jadwal tidak tersedia.

## 4. Batas MVP — mengikuti keputusan v1.1

**Scope/kebijakan D01–D05 sudah disetujui; rincian teknis turunan dirujuk ke PRD v1.1:**
- Kanal WhatsApp teks Bahasa Indonesia, barang ready-stock, satu pemilik dan satu lokasi stok per toko. Semua data memiliki `tenant_id`; peserta toko pilot belum dipilih.
- TuntasUMKM menjadi sumber stok. Sinkronisasi POS/marketplace bukan scope P0; koreksi stok fisik oleh pemilik wajib alasan dan audit.
- Katalog barang fisik dengan SKU, harga rupiah, stok integer nonnegatif, satu lokasi asal pengiriman.
- Satu SKU per pesanan adalah batas MVP yang dikunci; boleh beberapa unit SKU tersebut. Kontrak `items[]` masih usulan teknis, server harus menegakkan satu item.
- Semua order perlu persetujuan pemilik. AI boleh membaca katalog, meminta klarifikasi, menghitung quote, dan menyiapkan draft; tidak boleh memutuskan persetujuan sendiri.
- Satu penyedia ongkir nyata; fallback tarif manual oleh pemilik dengan alasan. Menghitung tarif tidak berarti memesan kurir.
- Selesai dicatat pemilik sesudah barang diserahkan kepada kurir/pembeli, dengan waktu dan catatan; bukan bukti pembayaran/penerimaan pelanggan. Pembatalan sesudah approval owner-only, alasan wajib; pemulihan stok dikonfirmasi berdasarkan kondisi fisik dan dicatat sekali. **Cancel/restock masuk P0; refund tetap di luar sistem.**
- FAQ/aturan toko minimum berupa data terstruktur berversi. Tidak perlu vector database atau RAG kompleks untuk katalog kecil.

**Tidak masuk P0:** payment gateway, refund otomatis, booking kurir, multi-gudang, marketplace sync, Instagram/kanal lain, voice/OCR, loyalty, subscription billing, auto-approve, multi-agent bebas, dan microservices.

## 5. Rekomendasi arsitektur

```text
React yang sudah ada ── API terautentikasi ──────────────┐
                                                       v
WhatsApp ── verifikasi webhook ── durable inbox ──> FastAPI modular monolith
                                                       |
                       ┌───────────────────────────────┤
                       v                               v
                 PostgreSQL                       Worker proses
          order, inventory, audit,                percakapan/LLM/ongkir
          inbox, outbox, jobs                          |
                       ^                               v
                       └──── policy + domain services ─┘
                       |
                 Outbox dispatcher ──> WhatsApp / notifikasi
                       |
                 receipt/status webhook ──> rekonsiliasi
```

### Pilihan teknologi dan alasan

| Komponen | Rekomendasi | Alasan / alternatif |
|---|---|---|
| API/domain | FastAPI + Pydantic | Sesuai repo; kontrak bertipe, mudah menghubungkan layanan AI; satu codebase dengan modul jelas |
| Database target | PostgreSQL, SQLAlchemy + Alembic | Relasi order–item–stok–approval, unique constraint, transaksi multi-entitas, penguncian row, dan laporan cocok. JSONB dapat menyimpan payload provider/hasil ekstraksi |
| Background processing | Worker + job/outbox persisten dalam DB untuk pilot | Tidak menahan request webhook selama panggilan AI. Redis + Celery/queue khusus menjadi opsi saat throughput membutuhkannya; Redis bukan sumber kebenaran stok |
| Frontend | Pertahankan React; gunakan satu pola query server | React Query sudah tersedia. Hindari dua sumber state bisnis antara API dan localStorage |
| Update layar | Polling terkontrol pada P0; SSE bila diperlukan | Lebih ringan daripada memulai dengan WebSocket untuk semua fitur; real-time terotorisasi per toko |
| AI | Satu adapter provider, structured output tervalidasi | Model belum dipilih. Pilih lewat evaluasi chat UMKM Indonesia, akurasi ekstraksi, latensi, dan biaya; bukan nama model saja |
| Penyimpanan file | Belum dibutuhkan untuk teks-only P0 | Object storage dibutuhkan ketika media/upload katalog ditambahkan; jangan menyimpan file besar di dokumen database |

**Mengapa PostgreSQL walau template menggunakan MongoDB?** Saat ini tidak ada model/data bisnis persisten yang harus dimigrasikan. Karena itu memilih fondasi transaksi order–stok sebelum bisnis diimplementasikan lebih murah daripada menggantinya setelah sistem berkembang. Ini rekomendasi target, bukan perubahan yang dilakukan pada sandbox.

**Alternatif paling dekat dengan template:** FastAPI + MongoDB + **PyMongo Async**. Ini tetap layak jika tim lebih menguasai MongoDB, dengan syarat compound unique index, schema validation, versioning, transaksi lintas dokumen, dan desain ledger/outbox yang benar. MongoDB bukan otomatis tidak aman untuk transaksi.

**Gap lingkungan nyata:** pemeriksaan `hello` pada database sandbox tidak menemukan replica set dan bukan mongos. Jangan mengklaim transaksi lintas dokumen tersedia pada konfigurasi standalone ini. Jika memilih MongoDB untuk target, dibutuhkan topologi transaksi yang didukung. Tidak ada perubahan konfigurasi database pada tugas ini.

**Gap dependensi:** repo memakai Motor. Dokumentasi resmi menyebut Motor deprecated sejak 14 Mei 2025, akhir dukungan perbaikan umum 14 Mei 2026, perbaikan kritis sampai 14 Mei 2027. Backend baru berbasis MongoDB sebaiknya memakai PyMongo Async; jangan menyalin dependensi lama tanpa evaluasi kompatibilitas.

## 6. Tujuh tahap resmi baseline v1.1 — disetujui pengguna

Alur berikut telah disetujui untuk v1.1, bukan hasil rekonstruksi isi lampiran yang hilang. Tahap dapat berhenti menunggu data/keputusan. Tahap 7 menghasilkan order Diproses, bukan otomatis Selesai; penyelesaian fisik tetap dicatat owner.

| Tahap | Masukan → keluaran | Kontrol backend / penanganan gagal |
|---|---|---|
| 1. Percakapan diterima | Webhook → message tersimpan + job | Verifikasi signature, mapping kanal→tenant, dedupe provider message ID, ACK setelah durable write |
| 2. Kebutuhan dilengkapi | Pesan + konteks → intent, kandidat SKU, qty, penerima, alamat | Structured extraction; field tidak jelas ditanyakan, bukan ditebak. Unsupported intent/media dialihkan |
| 3. Produk & stok diperiksa | Kandidat → SKU sah, harga/stock snapshot | Katalog server menjadi acuan. SKU tidak ditemukan/ambigu/stok kurang menahan draft |
| 4. Pengiriman dihitung | Asal/tujuan + berat → quote ID, tarif, layanan, expiry | Provider timeout/tujuan tidak terlayani → retry baca terbatas atau tarif manual pemilik |
| 5. Draft disiapkan | Kebutuhan + validasi + quote → draft versi N | Snapshot lengkap; data wajib dan konfirmasi pelanggan; notifikasi persetujuan |
| 6. Keputusan pemilik | User berwenang + versi N → approve/reject/revise | Revisi membatalkan persetujuan versi lama. Tidak ada stock decrement hanya karena tombol diklik |
| 7. Tindakan dituntaskan | Approval valid → commit order + stok + audit + outbox | Server mengeksekusi transaksi atomik, lalu worker mengirim pesan. Failure/unknown external status ditampilkan, bukan ditutupi |

Penerimaan keputusan tahap 6 baru **efektif** setelah transaksi tahap 7 berhasil. Jangan menyimpan order “disetujui” secara permanen lalu mencoba mengurangi stok tanpa jaminan atomik.

**Konflik penomoran ditutup untuk v1.1:** keputusan D02 menetapkan tahap 6 sebagai keputusan pemilik. Respons awal/klarifikasi boleh sebelum approval dan tidak menjamin stok/order. Lampiran lama tetap tidak lengkap; keputusan v1.1 tidak diklaim sebagai isi lampiran v1.0 yang berhasil dipulihkan.

**Makna deterministic:** alur, validasi, otorisasi, dan mutasi mengikuti aturan eksplisit; teks hasil model tetap probabilistik. Mengatur temperature rendah tidak menjadikan model sumber kebenaran stok atau harga.

## 7. Modul backend minimum

1. **Identity & tenancy:** user/session/membership; role owner dahulu, staff dapat ditambahkan. Tenant berasal dari session atau mapping kanal terverifikasi, bukan dipercaya dari request body.
2. **Store & policy:** profil toko, zona waktu, asal pengiriman, pause asisten, batas tindakan, aturan toko, versi kebijakan, pengaturan notifikasi. Pause tidak mematikan inbox atau kemampuan pemilik.
3. **Channel & inbox:** channel account, credential server-side, verifikasi webhook, dedupe, customer mapping, cursor pagination histori, read state terpisah dari status bisnis.
4. **Conversation orchestration:** konteks per percakapan, intent/entity, klarifikasi, status proses, takeover; job lama tidak boleh mengirim setelah pemilik mengambil alih.
5. **Catalog & inventory:** SKU unik per toko; harga dan stok sah; ledger adjustment dengan alasan; transaksi persetujuan tidak bergantung pada data kiriman frontend.
6. **Shipping:** validasi tujuan dan berat, provider adapter, quote immutable berjangka, re-quote, manual override berotorisasi dan diaudit.
7. **Orders & revisions:** create/read/search, submit, edit versi, reject/revise/approve/complete/cancel dan settlement stok kembali; immutable snapshots. Pembatalan tidak otomatis restock; settlement berulang tidak boleh menambah stok lagi.
8. **Approval & executor:** owner-only, expected version, payload hash, idempotency key, transaksi stok–order–audit–outbox.
9. **Outbound & notifications:** pengiriman pesan nyata, receipt, retry aman, antrean persetujuan pemilik, batas window/template provider, status gagal/tidak pasti.
10. **Audit & metrics:** timeline server, pengukuran KPI, ekspor, pemisahan data produksi dan data uji.
11. **Reliability & privacy:** worker lease, backoff/jitter, dead-letter/reconciliation, pembatasan laju/biaya, backup/restore, redaksi PII, retensi/penghapusan, access log.

## 8. Model data yang disarankan

Nama berikut model konseptual, bukan schema yang telah dibuat. `tenant_id`, ID stabil, dan timestamp UTC diperlukan untuk setiap entitas bisnis. Waktu ditampilkan memakai zona waktu toko.

| Kelompok | Entitas & field penting |
|---|---|
| Identitas | `users`, `sessions`, `tenants`, `memberships(user_id, tenant_id, role)` |
| Konfigurasi | `store_settings`, `policy_versions`, `channel_accounts(provider, external_account_id, credential_ref)` |
| Pelanggan | `customers`, `customer_identities(provider, business_scope, external_user_id, phone_optional)`, alamat snapshot; nomor telepon tidak menjadi primary key tunggal |
| Percakapan | `conversations(customer_id, channel_id, handler_mode, handler_version, status)`; `messages(provider_message_id, direction, content, received_at, sent_at, delivered_at, status)` |
| Katalog | `products`, `variants(sku, attributes, price_idr, weight_grams, active, version)`, `inventory(variant_id, location_id, available, version)` |
| Riwayat stok | `inventory_movements(variant_id, order_id, delta, reason, actor_id, operation_key)`; tidak dihapus saat order selesai |
| Ongkir | `shipping_quotes(provider_quote_id, destination_ref, service, cost_idr, weight, expires_at, source, override_reason)` |
| Order | `orders(customer_id, conversation_id, status, version, totals, quote_id)`; `order_versions`; `order_items(variant_id, sku/name/variant_snapshot, qty, unit_price_idr)` |
| Persetujuan | `approval_decisions(order_id, order_version, payload_hash, actor_id, decision, reason, decided_at)` |
| Penyelesaian/pembatalan | `handover_records(order_id, handover_at, handover_to, note, actor_id)`; `order_cancellations(order_id, reason, previous_status, actor_id)`; `stock_recoveries(cancellation_id, status, saleable_qty, condition_note, inspected_at, actor_id, operation_key)` |
| Pipeline | `workflow_runs`, `workflow_steps(stage, attempt, status, input_ref, output_ref, error_code, model/prompt_version)` |
| Keandalan | `inbox_events`, `outbox_events`, `jobs`, `idempotency_records`, `delivery_attempts` |
| Audit/metrik | `audit_events`, `metric_events`; agregat dihitung dari fakta, bukan counter browser |

Invariant minimum:
- Uang menggunakan integer rupiah untuk scope IDR, tidak memakai float; qty integer positif; stok tidak boleh negatif.
- Unique `(tenant_id, sku)`, `(channel_id, provider_message_id)`, `(tenant_id, order_number)`, `(tenant_id, operation, idempotency_key)`.
- Unique kunci efek stok per order/aksi mencegah pengurangan atau pengembalian dua kali.
- Relasi tidak boleh menghubungkan objek dari tenant berbeda. Foreign key ke ID saja tidak cukup bila tenant tidak ikut diperiksa.
- Histori order menyimpan snapshot nama/SKU/harga/ongkir; perubahan katalog tidak mengubah order terdahulu.
- Index utama: percakapan berdasarkan toko+updated_at; pesan berdasarkan conversation_id+created_at; order berdasarkan toko+status+created_at; audit berdasarkan toko+entity+timestamp.
- Payload mentah dan log memiliki retensi; jangan menyimpan salinan data pribadi tanpa batas di semua tabel.

## 9. Kontrak API awal

Semua path berikut **rencana** berprefix `/api/v1`; belum tersedia. Login/session bergantung metode auth yang dipilih. Semua resource tenant-scoped, berpaginasi dan terotorisasi.

| Modul | Endpoint representatif |
|---|---|
| Akun | `POST /auth/login`, `POST /auth/logout`, `GET /me`; reset/invite bila auth kustom dipilih |
| Toko | `GET/PATCH /store`, `GET/PATCH /store/policies`, `GET /channels`, proses koneksi kanal sesuai provider |
| Webhook | `GET/POST /webhooks/whatsapp` — challenge/verification dan ingestion, bukan endpoint user biasa |
| Percakapan | `GET /conversations`, `GET /conversations/{id}`, `GET /conversations/{id}/messages` |
| Aksi chat | `POST /conversations/{id}/messages`, `POST /conversations/{id}/handoff`, `POST /conversations/{id}/resume`, `POST /conversations/{id}/close` |
| Katalog | `GET/POST /products`, `GET/PATCH /products/{id}`, `POST/PATCH /products/{id}/variants`; arsip alih-alih menghapus histori |
| Stok | `GET /inventory`, `POST /inventory/adjustments`, `GET /inventory/movements` |
| Ongkir | `POST /shipping/quotes`, `POST /shipping/manual-quotes` owner-only |
| Draft | `GET/POST /orders`, `GET /orders/{id}`, `PATCH /orders/{id}/draft`, `POST /orders/{id}/submit` |
| Keputusan | `POST /orders/{id}/approve`, `/reject`, `/request-revision`, `/reopen-revision`, `/complete`, `/cancel`, `/resolve-stock-return` |
| Jejak | `GET /orders/{id}/timeline`, `GET /conversations/{id}/workflow`, `GET /audit-events` |
| Ringkasan | `GET /dashboard/summary`, `GET /analytics/kpis`, `GET /exports/orders`, `GET /notifications` |

Aturan kontrak:
- Aksi mutasi kritis menerima `Idempotency-Key`, `expected_version`, dan bila relevan `reason`; actor dan harga efektif ditentukan server.
- Key yang sama + payload sama mengembalikan hasil sebelumnya; key sama + payload berbeda menghasilkan konflik, bukan aksi baru.
- Contoh approval body: `{ "expected_version": 3 }`. Jangan menerima `approved_by` bebas dari client.
- Error terstruktur: `code`, `message`, `field_errors`, `retryable`, `correlation_id`. Bedakan `INSUFFICIENT_STOCK`, `PRICE_CHANGED`, `QUOTE_EXPIRED`, `ORDER_VERSION_CONFLICT`, `HANDLER_CHANGED`.
- Gunakan 401/403 untuk akses, 409 untuk konflik state/versi, 422 untuk input, 429 untuk batas laju; kegagalan provider tidak boleh dikonversi menjadi success palsu.
- Respons accepted/queued bukan delivered. API harus membedakan keduanya untuk UI.
- Endpoint testing/reset demo tidak masuk API bisnis publik. Client localStorage bukan bukti sah persetujuan atau stok.

## 10. State machine dan transaksi kritis

### Status order yang diusulkan

```text
DRAFT -> AWAITING_APPROVAL -> PROCESSING -> COMPLETED
                    |              
                    +-> NEEDS_REVISION -> AWAITING_APPROVAL (versi baru)
                    +-> REJECTED -> NEEDS_REVISION (owner membuka kembali)
PROCESSING / COMPLETED -> CANCELLED (owner, alasan wajib)
CANCELLED: stock_recovery PENDING_REVIEW -> RESOLVED (qty layak jual, satu settlement)
```

Status pembayaran, pengiriman dan pesan **terpisah**. `PROCESSING` bukan paid/shipped. `COMPLETED` wajib serah-terima ke kurir/pembeli, waktu dan catatan. Cancel setelah approval merupakan P0: owner-only, tidak otomatis restock, kondisi barang diperiksa, qty kembali 0..qty order dan settlement sekali. Histori serah-terima dipertahankan bila order Selesai dibatalkan. Refund tetap di luar sistem. Tidak ada auto-expiry draft atau pembatalan sebagian pada P0. State/transisi lengkap: PRD v1.1 §7.

### Transaksi persetujuan — pusat kebenaran

1. Validasi session, role owner, dan tenant; ambil/cek idempotency record dalam mekanisme atomik.
2. Lock order dan inventory terkait secara konsisten; cek status `AWAITING_APPROVAL` dan `expected_version`.
3. Validasi ulang SKU aktif, qty, stok, harga, quote belum kedaluwarsa, konfirmasi pelanggan, dan policy version relevan.
4. Jika harga/quote berubah, tahan aksi dan minta revisi/konfirmasi; jangan diam-diam mengganti total setelah owner meninjau.
5. Dalam **satu transaksi**, tulis approval, kurangi stok secara conditional, simpan movement, ubah order ke `PROCESSING`, audit, outbox, dan hasil idempotensi.
6. Commit; baru beri hasil berhasil ke UI. Bila salah satu bagian gagal, rollback seluruh mutasi.
7. Worker mengirim konfirmasi dari outbox; message failure tidak mengulangi pengurangan stok atau membatalkan order otomatis.

MVP mengikuti repo: **tidak mereservasi stok pada draft**. Draft bukan janji ketersediaan. Dua draft boleh mengacu stok sama, tetapi transaksi persetujuan hanya meloloskan yang masih cukup. Reservasi + TTL dapat ditambahkan P1 setelah aturan pembatalan/expiry jelas.

### Transaksi pembatalan dan pemulihan stok — P0

- Cancel: otorisasi owner, expected version, alasan dan idempotency; simpan status CANCELLED, status sebelumnya, cancellation record, audit dan outbox. Jangan otomatis menambah stok.
- Settlement: lock cancellation/order dan inventory; cek belum resolved, qty integer 0..qty order serta kondisi saleable; tulis settlement, movement positif jika qty>0, saldo dan audit atomik. Unique operation key mencegah restock dua kali.
- Kondisi belum pasti tetap PENDING_REVIEW; qty 0 setelah pemeriksaan merupakan RESOLVED tanpa movement positif. Refund tidak diimplementasikan.
- Koreksi setelah resolved memakai adjustment tertaut beralasan dan validasi batas pemulihan bersih; tidak mengulang settlement.

### Gangguan yang harus direncanakan

- Webhook duplikat: dedupe ID provider; teks sama dengan ID berbeda tidak otomatis dibuang karena bisa merupakan pesanan ulang yang sah.
- Pesan berturut-turut: serialisasi/version check per percakapan; respons job lama tidak menimpa konteks terbaru.
- Approval ganda dari dua perangkat: server memeriksa state/versi dan unique operation key; guard tombol frontend tidak cukup.
- Owner takeover saat AI berjalan: naikan `handler_version`; cek lagi sebelum membuat draft atau mengirim respons otomatis.
- AI menghasilkan SKU/harga palsu: schema + lookup katalog + policy gate menolak; tidak ada kredensial database/tool mutasi bebas pada model.
- Provider timeout setelah mungkin menerima request: tandai `unknown`, gunakan ID provider dan rekonsiliasi; jangan menjanjikan exactly-once delivery lintas layanan atau blind retry.
- Worker crash setelah commit: outbox dapat dilanjutkan; gunakan lease dan pemrosesan idempoten. Status permanen gagal masuk antrean penanganan pemilik.
- Signature webhook tidak valid: tolak sebelum pemrosesan. Timestamp/provider ID disimpan untuk investigasi, log sensitif disamarkan.

## 11. Integrasi yang perlu diputuskan, bukan langsung dipasang

| Integrasi | Usulan awal | Keputusan/ketergantungan |
|---|---|---|
| WhatsApp | Kanal resmi: Meta Cloud API langsung atau BSP resmi | Kepemilikan akun/nomor, onboarding, credential server-side, webhook, template, opt-in yang relevan, biaya dan pembatasan. Tidak menggunakan otomatisasi WhatsApp Web tak resmi |
| LLM | Satu provider di balik adapter; keluaran JSON tervalidasi | Model, biaya maksimum/chat, kebijakan data provider, latensi, evaluasi Bahasa Indonesia; kredensial baru diperlukan saat implementasi |
| Ongkir | Satu agregator/penyedia yang mendukung kebutuhan Indonesia | Coverage, origin/destination ID, berat/dimensi, layanan, tarif/expiry, timeout dan akses akun; contoh kandidat bukan pilihan final |
| Auth | Session aman, pilihan managed identity atau custom | Metode login dan pemulihan akun, owner/staff, session expiry. Bukan menganggap nomor WA pada Settings sebagai login |
| Monitoring | Structured logs + error/latency/cost metrics | Redaksi alamat/nomor/token, alarm backlog, kegagalan provider, retensi |

WhatsApp memiliki window layanan pelanggan dan aturan template; approval yang tertunda dapat melewati window. Rencana pengiriman perlu memeriksa waktu pesan masuk terakhir dan memakai template disetujui saat diwajibkan. Pemilihan BSP juga mengubah format signature/payload; detail implementasi harus mengikuti dokumentasi provider terpilih. Referensi Twilio tidak berarti Twilio telah dipilih.

## 12. KPI: definisi utama dikunci melalui D05

| KPI | Definisi berlaku | Batas pengukuran |
|---|---|---|
| Respons awal p95 <5 detik | `first_reply_provider_accepted_at - inbound_received_at`; N, miss/failure dan mode handler dilaporkan | ACK webhook bukan balasan pelanggan; failure tidak disaring. Jawaban substantif/delivered terpisah |
| Eksekusi p95 <10 detik | `transaction_committed_at - approval_request_received_at`; sebelum validasi sampai commit | Waktu tunggu owner terpisah. Business-blocked dan unauthorized dilaporkan tersendiri; internal failure tidak disaring |
| Error varian/stok 0% | Pesanan dengan error terverifikasi / pesanan diproses, termasuk sumber data/insiden | Blocked validation bukan order error rate. 0% target, bukan garansi; data stok sumber yang salah tetap mungkin terjadi |
| Konversi 25–30% | Episode niat beli unik dengan ≥1 order approved dalam 168 jam / episode eligible cohort matang | Bukan per pesan atau paid. Manual tanpa episode dikecualikan; cancellation/net conversion terpisah; cohort muda provisional |
| Hemat waktu 70% | `(waktu admin baseline - waktu admin sesudah) / baseline` pada pekerjaan sebanding | Butuh studi waktu kerja aktual sebelum/sesudah, bukan selisih timestamp draft dan approval |
| Nilai order | Total order approved, subtotal barang, ongkir terpisah | Jangan melabeli approved order value sebagai uang diterima atau revenue terverifikasi tanpa data pembayaran |

Simpan sumber event, tenant, conversation/episode/order ID, occurred_at server, provider timestamp terpisah, policy/pipeline version dan mode test/live. Definisi rinci, nearest-rank p95, failure handling, eligibility dan batas klaim: **PRD v1.1 §9**. Volume beban dan baseline penelitian belum diputuskan. Pilot kecil tidak membuktikan efek kausal.

## 13. Rencana implementasi 20 hari — estimasi bersyarat

Ini usulan untuk **MVP pilot sempit**, bukan jadwal resmi yang berhasil dibaca dari PRD. Asumsi: satu pengembang backend berpengalaman, satu pengembang frontend/integrasi, pemilik produk tersedia untuk keputusan dan UAT, akses WhatsApp/ongkir/LLM siap pada awal periode. Waktu persetujuan vendor di luar kendali tim. Bila hanya satu pengembang atau akses tertunda, perlu mengurangi scope atau menambah waktu.

| Hari | Deliverable | Gerbang selesai |
|---|---|---|
| 1–2 | PRD v1.1, batas scope, policy matrix, database ADR, kontrak API dan KPI | Owner menyetujui stage, definisi tuntas, sumber stok, approval, provider |
| 3–5 | Tenant/auth, schema/index, katalog, ledger, order/manual draft, transaksi approval dasar | Akses lintas toko ditolak; approval berulang tidak mengurangi stok lagi |
| 6–8 | WhatsApp inbox/outbox, worker, receipt, percakapan dan balasan manual | Pesan nyata masuk/keluar; duplikat tidak membuat message/order ganda; restart aman |
| 9–11 | Structured extraction, konteks/klarifikasi, validasi SKU, quote ongkir, workflow persisten | Chat nyata menghasilkan draft sah; input ambigu ditahan; provider failure tertangani |
| 12–14 | Revisi/reject, **cancel/settlement stok P0**, takeover/pause, quote expiry, outbox reconciliation; integrasi frontend | Versi lama ditolak; restock sekali dan sesuai kondisi; job usang tidak membalas setelah takeover |
| 15–16 | Dashboard/metric events, timeline, CSV, status loading/error/pagination | Semua angka berasal dari server; data contoh terpisah |
| 17–18 | Concurrency/fault tests, evaluasi bahasa/prompt injection, privacy & backup restore | Kasus stok terakhir, retry, gangguan provider dan isolasi tenant lulus |
| 19–20 | UAT pilot, perbaikan, pengukuran awal, dokumentasi operasional | Batas produk jelas dan kasus penerimaan disetujui; bukan klaim semua target bisnis tercapai |

Urutan kritis: **aturan & data → transaksi manual yang benar → messaging nyata → AI yang dibatasi → pengukuran**. Jangan memulai dari chatbot canggih sementara order/stok belum aman. Bila akses vendor belum siap, gunakan contract fixtures yang jelas di lingkungan pengujian; itu bukan bukti integrasi nyata selesai.

Dampak penguncian v1.1: cancel/restock kini P0, sehingga estimasi 20 hari harus dihitung ulang terhadap kapasitas tim sebelum dijadikan jadwal kerja. Keputusan pengguna bukan persetujuan staffing, provider atau komitmen tanggal.

## 14. Kriteria penerimaan backend masa depan

Checklist ini **belum diuji sebagai backend bisnis**; merupakan definition of done implementasi berikutnya.

1. Pesan WhatsApp nyata tercatat sekali; signature invalid ditolak; event retry tidak menggandakan draft.
2. Chat tanpa SKU/alamat/jumlah yang pasti meminta klarifikasi; model tidak menebak harga/ongkir/stok.
3. Tidak ada mutasi stok/order committed sebelum approval pemilik yang sah dan versi terkini.
4. Dua approval paralel untuk stok terakhir: hanya satu berhasil, lainnya konflik; stok tidak negatif.
5. Approval berulang setelah timeout/restart mengembalikan hasil yang sama tanpa movement baru.
6. Harga berubah, stok tidak cukup atau quote kedaluwarsa: persetujuan ditahan; versi lama invalid. Stok berubah tetapi masih cukup dapat lanjut sesudah revalidasi.
7. Revisi/reject memerlukan alasan, aktor dan before/after tercatat; penolakan tidak mengurangi stok.
8. AI timeout, output invalid, prompt injection, ongkir down, dan tujuan unsupported masuk jalur pemulihan yang jelas.
9. Takeover memblokir respons otomatis dari job yang sudah berjalan; pemilik tetap bisa bekerja saat asisten pause.
10. Worker mati setelah commit: order/stok konsisten; outbox dilanjutkan; external status unknown direkonsiliasi.
11. Data toko A tidak dapat diakses/mutasi oleh toko B, termasuk pesan, quote, audit, ekspor dan notifikasi.
12. Approval lama melewati window pesan tidak mengirim free-form melanggar kebijakan provider.
13. Receipt accepted/sent/delivered/read/failed tidak disamakan; penyelesaian order bukan proxy pembayaran.
14. KPI dihitung dari event server dengan cohort/sampel yang jelas; baseline/target/contoh tidak dicampur hasil nyata.
15. Backup/restore diuji; token dan PII tidak muncul di log bebas; retensi/penghapusan dapat dijalankan sesuai kebijakan.

Tambahan wajib v1.1: serah-terima fisik, cancel dari PROCESSING/COMPLETED, kondisi barang, pending vs zero-return, partial saleable quantity, retry settlement dan batas pemulihan stok. Kontrak penerimaan berlaku lengkap pada **AC01–AC25** di `ATURAN-OPERASIONAL-TUNTASUMKM-v1.1.md`.

## 15. Perubahan frontend yang nanti diperlukan

- Ganti domain state `store.js` dengan API/query layer; simpan localStorage hanya untuk preferensi non-sensitif/demo terpisah.
- Pertahankan enam halaman, tetapi tambahkan login/onboarding kanal jika disetujui; Pengaturan perlu status koneksi, kebijakan toko dan pause yang benar.
- Pindahkan `workflowRules.js`/`workflowOperations.js` sebagai spesifikasi perilaku referensi, bukan sebagai otoritas transaksi client.
- Tambahkan loading, error, retry, stale-version conflict, pagination, real receipt, dan status provider failure.
- Hapus reset-demo dari mode bisnis nyata; jangan mengimpor aktivitas demo sebagai order produksi.
- Ganti angka tetap `analytics.js` dengan agregat server, snapshot data historis order dan identitas actor terautentikasi.

## 16. Prioritas keputusan berikutnya

1. **Selesai:** baseline PRD v1.1, scope, pipeline, kewenangan, stok, selesai/cancel dan KPI dikunci. Bukti masalah asli belum dipulihkan dan masih memerlukan validasi pilot.
2. Putuskan T01–T07: database, auth, provider, profil beban/privacy/recovery, toko pilot, baseline dan staffing.
3. Hitung ulang estimasi dengan cancel/restock P0; jangan menganggap 20 hari sebagai komitmen tanpa resource dan akses vendor.
4. Setelah instruksi implementasi eksplisit, bangun **draft manual → approval → stok → audit → cancel/restock** sebelum AI.

Daftar gap terperinci, dampak, pemilik keputusan, dan usulan penutup ada pada **GAP-PRD-TUNTASUMKM.md**.

## Referensi

- Lampiran pengguna: `PRD-TuntasUMKM-original.md` (salinan apa adanya, tidak direkonstruksi).
- Source code dan nomor baris pada bagian 3; SHA menjadi acuan jika branch berubah.
- Dokumentasi Motor resmi: https://www.mongodb.com/docs/drivers/motor/
- Migrasi PyMongo Async: https://www.mongodb.com/docs/languages/python/pymongo-driver/current/reference/migration/
- MongoDB transactions: https://www.mongodb.com/docs/manual/core/transactions/
- Konsep window/template WhatsApp, dokumentasi BSP resmi: https://www.twilio.com/docs/whatsapp/key-concepts
- Detail provider/model/kapasitas dan ketentuan data harus diverifikasi ulang saat integrasi dipilih. Tugas ini bukan audit keamanan menyeluruh, bukan implementasi integrasi, dan bukan sertifikasi kepatuhan.