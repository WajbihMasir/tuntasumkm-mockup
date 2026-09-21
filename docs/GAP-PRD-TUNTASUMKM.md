# TuntasUMKM — Register GAP PRD

Tanggal: 21 September 2026 · Status: **Diperbarui setelah penguncian baseline PRD v1.1**

Pengguna menyetujui D01–D05. Acuan aktif: [PRD v1.1](PRD-TUNTASUMKM-v1.1.md) dan [aturan operasional/AC](ATURAN-OPERASIONAL-TUNTASUMKM-v1.1.md). **Penutupan gap spesifikasi tidak berarti backend sudah diimplementasikan atau target sudah tercapai.** Bagian 1–5 mempertahankan temuan awal sebagai riwayat; status terbaru pada tabel berikut dan decision log bagian 6 mengesampingkan rekomendasi historis yang sudah digantikan.

## Status gap setelah keputusan pengguna

| GAP | Status terbaru | Rujukan / sisa pekerjaan |
|---|---|---|
| G01 | Bukti masalah asli masih terbuka | Pemetaan kerja turunan ada pada PRD §1, bukan klaim isi empat lapisan asli atau riset yang terbukti |
| G02–G03 | Ditutup untuk baseline produk v1.1 | D02 dan PRD §4: tujuh tahap disetujui; stage 6 keputusan owner, respons awal boleh sebelumnya |
| G04–G05 | Ditutup pada scope/kewenangan | D01–D02 dan PRD §3–5; pilih toko pilot aktual masih T07 |
| G06 | Owner-only/isolation dan metode auth ditetapkan | T02: email/password + opaque session cookie, Argon2id, Resend untuk recovery; akses belum diimplementasikan |
| G07–G10 | Kebijakan inti ditutup | D03–D04, PRD §6–7: TuntasUMKM sumber stok, no reservation, version checks, selesai sesudah handover, cancel/restock P0 |
| G11–G12 | Provider ditetapkan; aktivasi/coverage belum diverifikasi | T03 Meta Cloud API, T05 RajaOngkir/Komerce; quote saja tanpa booking, freshness internal 15 menit bila provider tidak memberi expiry |
| G13 | Batas AI dan provider/model ditetapkan; evaluasi belum dilakukan | T04 BYNARA `agnes-2.5-flash`; schema/policy server wajib; JSON/tool capabilities dan privacy model belum terverifikasi |
| G14–G15 | Invariant/failure/handoff dispesifikasikan; belum diimplementasikan | PRD §8, SOP D dan AC05–AC21 |
| G16 | KPI operasional didefinisikan | D05, PRD §9; p95, failure, cohort matang 168 jam. Bukti/sampel pilot belum tersedia |
| G17–G19 | Parameter NFR, privacy/retensi dan resource masih terbuka | T06–T07; estimasi perlu memasukkan cancel/restock P0, bukan janji 20 hari |
| G20 | Multi-SKU/pre-order di luar P0 | D01; model teknis items masih usulan, bukan izin fitur multi-item |
| G21 | **Cancel/restock pindah ke P0**; refund tetap di luar sistem | D04, SOP C; retur/penukaran lengkap bukan P0 |
| G22–G23 | Owner-only dan kebijakan minimum ditentukan | Staff/eskalasi lanjutan/knowledge management tetap backlog |
| G24 | Penelitian dampak masih terbuka | T07; kamus pengukuran tersedia, hasil/baseline belum ada |
| G25 | Tetap di luar P0 | Integrasi lanjutan hanya melalui change request |

## Cara membaca

- **A — Artefak:** isi tidak tersedia/rusak pada Markdown yang diterima; mungkin hilang saat ekspor.
- **S — Spesifikasi:** keputusan produk/operasional belum tertulis pada artefak.
- **R — Repo:** perbedaan antara simulasi saat ini dan sistem nyata; bukan otomatis bug mockup.
- **P0:** harus ditutup untuk fondasi/pilot nyata yang aman. **P1:** sebelum memperluas pilot. **P2:** perluasan opsional.

Repo dan PRD tidak boleh saling menggantikan sebagai sumber kebenaran tanpa persetujuan. Kelengkapan simulasi frontend tidak membuktikan kecukupan spesifikasi backend.

## 1. Bagian lampiran yang benar-benar tersedia

Lampiran berukuran **2.314 byte, 190 baris**. File `user-prd.md` dalam repo juga berisi versi tidak lengkap yang sama secara isi; bukan sumber tambahan yang menyelesaikan kekosongan.

| Bagian | Lokasi baris | Temuan |
|---|---|---|
| 1. Akar masalah | 1–20 | Narasi inti ada; problem matrix tidak terlihat |
| 2. Empat lapangan kendala | 21–40 | Judul saja; empat lapisan tidak dijelaskan |
| 3. Chatbot vs operational agent | 41–60 | Satu baris capability terbaca; tabel terpotong |
| 4. Pipeline tujuh tahap | 62–100 | Pengantar ada; daftar tahap/input/output tidak terlihat |
| 5. Friksi per stage | 101–110 | Judul saja |
| 6. Arsitektur teknis | 111–126 | Judul saja |
| 7. Skenario operasional | 128–137 | Judul saja |
| 8. KPI | 138–165 | Beberapa target terbaca, struktur tabel/kalimat rusak |
| 9. Eksekusi 20 hari | 167–190 | Judul saja; tidak ada rincian milestone |

**Tindakan yang disarankan:** kirim ulang versi sumber yang memuat tabel/diagram atau isi tiap bagian sebagai teks; selama itu gunakan usulan eksplisit, bukan mengklaim telah membaca konten yang hilang.

## 2. Temuan awal GAP kritis — riwayat analisis, lihat status terbaru di atas

| ID / tipe | GAP dan bukti | Dampak bila tidak ditutup | Usulan penutup / pemilik keputusan |
|---|---|---|---|
| G01 / A | Problem matrix dan empat lapisan pain kosong, PRD §1–2 | Solusi sulit ditelusuri ke masalah yang benar; lingkup mudah melebar | Product owner: tetapkan aktor, pekerjaan, frekuensi, dampak dan bukti tiap pain; jangan mengarang empat kategori resmi |
| G02 / A,S | Nama/urutan/input/output tujuh stage tidak tersedia, PRD §4–5 | Tim dapat membangun pipeline berbeda sambil sama-sama mengklaim sesuai | Product + engineering: stage table berversi, transition map, exception path, retry/handoff dan exit criteria |
| G03 / A,R | Tabel KPI tampaknya menyebut auto-reply stage 6, mockup tahap 6 adalah keputusan pemilik | Respons cepat dapat salah ditempatkan setelah menunggu owner | Konfirmasi PRD sumber; bedakan response ACK/clarification dari approval dan eksekusi; jangan mengunci numbering sekarang |
| G04 / S | Persona, vertikal dan scope pilot tidak dibatasi; “UMKM” sangat luas | Barang ready-stock, pre-order, makanan dan jasa membutuhkan workflow berbeda | Owner: pilih satu tipe toko dan tipe pesanan dahulu; usulan pilot barang ready-stock ber-SKU |
| G05 / S | Batas otomatisasi dan “kendali pemilik” tidak dirinci | AI berpotensi melakukan tindakan tanpa persetujuan yang tepat | Product: action policy matrix; read/clarify/draft diperbolehkan, commit stok/order owner-only; nominal/discount/refund tidak otomatis |
| G06 / S,R | Tidak ada definisi identitas/role/tenant; repo hanya nama pemilik di Settings | Orang yang mengubah nama dapat terlihat sebagai pemberi persetujuan; data lintas toko berisiko bercampur | Engineering + owner: auth, membership, owner authorization, tenant isolation; role staff ditambahkan sesuai kebutuhan |
| G07 / S,R | Sumber stok, SKU, varian, unit, stok opname dan sinkronisasi tidak jelas | Validasi benar terhadap data yang salah tetap menghasilkan stok meleset | Owner: pilih source of truth; tentukan SKU unik dan stock adjustment; ledger dan rekonsiliasi; POS integration bukan diasumsikan |
| G08 / S,R | Kapan stok direservasi/dikurangi/dikembalikan tidak tertulis | Overselling atau stok terkunci; persetujuan ganda dari dua perangkat | Usulan MVP: no reservation pada draft, revalidate + decrement atomik saat approve; return/cancel policy disepakati sebelum otomasi |
| G09 / S,R | Kontrak order/approval: versi, expiry, perubahan harga, qty, alamat, quote belum ditetapkan | Pemilik menyetujui versi berbeda dari yang dieksekusi | Product + engineering: immutable snapshots, expected version, quote TTL, stale approval ditolak; satu approval hanya untuk satu payload |
| G10 / S,R | “Tuntas”, “diproses”, pembayaran dan pengiriman tidak didefinisikan | Order ditandai selesai padahal belum dibayar/dikirim; KPI menyesatkan | Product: pisahkan order/payment/fulfillment/message status. P0 selesai manual ber-audit, bukan bukti delivery/payment |
| G11 / S | Batas WhatsApp: provider resmi, akun/nomor, window/template, consent dan biaya belum ada | Pesan tidak terkirim, approval tertunda melewati window, integrasi tertahan onboarding | Owner + integrator: pilih Cloud API/BSP, checklist akses, template dan policy; dokumentasi provider terpilih menjadi acuan |
| G12 / S,R | Ongkir hanya disebut capability; repo tarif empat kota berdasarkan qty | Tarif tidak relevan terhadap berat, origin, kode tujuan, dimensi/layanan | Product: quote contract, berat gram, origin/destination ID, layanan, expiry, manual override beralasan; quote tidak sama dengan booking |
| G13 / S | “Deterministic agent” tanpa batas model, output schema, confidence/evaluasi, budget | Output probabilistik dianggap benar; produk/ongkir dapat dihalusinasi | Engineering + product: LLM sebagai extractor/proposer; schema, tool allowlist, server lookup; evaluasi chat Indonesia; ambiguity → clarify/handoff |
| G14 / S,R | Error recovery, duplicate, race, timeout dan external unknown tidak terdefinisi | Efek terulang atau hilang setelah crash; retry buta menggandakan pesan | Engineering: inbox/outbox, idempotency, transaction, job lease, finite retry, DLQ/reconciliation; hindari klaim exactly-once lintas provider |
| G15 / S,R | Handoff/pause belum mendefinisikan job AI yang sedang berjalan | AI tetap membalas setelah pemilik mengambil alih | Engineering: handler_version/fencing; cek sebelum draft/send; inbox tetap berjalan saat pause |
| G16 / A,S,R | KPI tidak memiliki timestamp boundary, denominator, cohort, percentile, sample size | Angka demo atau waktu browser dianggap hasil bisnis; target sulit diuji | Product/analytics: kamus metrik; baseline/target/hasil dipisahkan; approved value bukan revenue diterima |
| G17 / S | NFR: volume chat, concurrent owner, latency/load, availability, retention, recovery belum ada | Target <5 detik tidak memiliki konteks beban; kapasitas/biaya tak dapat dihitung | Engineering + product: load profile pilot, timeout budget, provider cost cap, RPO/RTO dan alarm backlog; nilai ditetapkan setelah kebutuhan disepakati |
| G18 / S | Privasi dan tata kelola data pelanggan tidak tertulis | Alamat/telepon/chat disalin ke log/model tanpa kontrol; retensi tidak jelas | Owner data + engineering: tujuan pemrosesan, minimisasi, akses, kebijakan provider, retensi/penghapusan dan redaksi; review kewajiban UU PDP yang relevan tanpa mengklaim kepatuhan otomatis |
| G19 / A,S | Bagian 20 hari kosong; tidak ada resource/approval vendor/test gate | Estimasi dianggap komitmen walau dependensi eksternal belum siap | Product + engineering: milestone bersyarat, scope cut, dependency checklist, test/UAT gate; lihat rencana backend |

## 3. Temuan awal GAP tambahan — prioritas historis, G21 kini sebagian P0

| ID | Prioritas | GAP | Usulan |
|---|---|---|---|
| G20 | P1 | Multi-item, diskon/pajak, COD, pre-order dan unit non-pcs belum ditentukan | Gunakan model items sejak awal; aktifkan aturan tambahan hanya setelah spec. MVP boleh membatasi satu SKU |
| G21 | P0 cancel/restock; fitur lain ditunda | Cancel setelah approval, refund, retur, perubahan pesanan sudah diproses | D04 sudah mengunci cancel owner-only dan stock recovery berdasarkan kondisi sekali. Refund di luar sistem; retur lengkap ditunda. Acuan aktif PRD §6 |
| G22 | P1 | Staff/delegasi, eskalasi owner tidak merespons, jam operasional | Definisikan assignee, izin, SLA reminder, expiry draft, jam layanan; P0 tetap owner-only |
| G23 | P1 | Sumber pengetahuan toko dan tanggal berlakunya kebijakan | P0 data kebijakan minimum berversi; P1 knowledge management/search. Harga/stok tetap dari tool deterministik, bukan dokumen bebas |
| G24 | P1 | Evaluasi dampak bisnis dan representativitas pilot | Kumpulkan baseline toko nyata, ukuran sampel, cohort dan waktu kerja; jangan mengklaim lift kausal dari demo |
| G25 | P2 | Integrasi marketplace/POS, multi-channel/gudang, voice/OCR, billing | Pisahkan roadmap; bukan otomatis requirement lampiran yang terlihat |

## 4. Risiko PRD yang paling mudah terlewat

### a. Target kecepatan berpotensi bertentangan dengan human-in-the-loop
Waktu antre pemilik tidak dapat dijamin <10 detik oleh backend. Pisahkan waktu kerja mesin setelah approval dari waktu pelanggan menunggu keputusan. Respons awal <5 detik tidak boleh memberi kesan stok sudah dijamin sebelum transaksi berhasil.

### b. “0% error” tidak sama dengan semua permintaan lolos
Sistem yang menolak seluruh order dapat memiliki sedikit kesalahan eksekusi tetapi gagal membantu usaha. Ukur juga completion rate, clarification rate, false blocking, manual correction dan error terverifikasi. Stok sumber yang tidak akurat tetap membutuhkan rekonsiliasi.

### c. Conversion rate memerlukan unit analisis
Satu pelanggan dapat memiliki beberapa percakapan dan beberapa pesanan. Tentukan kapan percakapan baru dimulai, eligibility, atribusi waktu dan definisi order (approved/paid). Menghitung jumlah order dibagi seluruh pesan bukan chat-to-order conversion.

### d. Approval bukan satu tombol saja
Approval harus mengikat siapa, toko mana, versi/payload mana, kapan dan dalam kondisi harga/stok/ongkir apa. Koreksi setelah approval bukan edit bebas; perlu revision/compensation yang jelas.

### e. Simulasi dedupe bukan idempotensi terdistribusi
Counter duplicate dan `useRef` pada mockup tidak melindungi dua perangkat, restart worker atau webhook retry. Dedupe berdasarkan teks juga salah karena pelanggan boleh mengirim pesanan yang sama lagi.

### f. Satu state “Selesai” tidak memadai untuk semua layanan
Order dapat valid saat pesan konfirmasi gagal dikirim. Pembayaran dapat belum diterima ketika barang sedang disiapkan. Status order, pembayaran, kurir, dan pesan harus independen namun saling terkait melalui event.

### g. Landing page bukan spesifikasi pipeline
Landing merangkum empat langkah, dashboard menampilkan tujuh tahap usulan, lampiran menyebut tujuh tahap tanpa detail. Empat langkah marketing tidak otomatis berarti konflik fitur, tetapi perlu mapping ke tahap teknis resmi agar komunikasi konsisten.

## 5. Usulan template PRD v1.1

1. Target persona dan satu vertikal pilot; in-scope/out-of-scope.
2. Problem matrix lengkap: pekerjaan, kendala, dampak, frekuensi, bukti, indikator keberhasilan.
3. Empat lapisan kendala resmi beserta relasinya ke fitur.
4. Daftar tujuh tahap: trigger, input, output, state, izin, timeout, retry, handoff, audit.
5. Action policy matrix AI/pemilik/staff serta side-effect yang membutuhkan approval.
6. Domain model: tenant, customer, SKU, stok, quote, order, approval, message dan event.
7. Aturan harga, ongkir, stok, expiry, revisi, cancel, payment/fulfillment boundary.
8. Provider/API contract, credential ownership, onboarding dependency dan biaya.
9. Skenario normal + failure + concurrency dengan acceptance criteria.
10. Kamus KPI, baseline penelitian, target, denominator, window dan sample size.
11. NFR: security/privacy, beban, latensi, reliability, backup/restore dan biaya.
12. Milestone 20 hari, staffing, release gate pilot, risiko dan backlog.

## 6. Decision log terkini — baseline produk dikunci, pilihan teknis terpisah

| Keputusan | Default yang direkomendasikan | Status |
|---|---|---|
| Database target | PostgreSQL + SQLAlchemy/Alembic, worker/outbox | **DITETAPKAN T01** untuk rencana, belum dipasang/migrasi; alternatif MongoDB hanya historis |
| Autentikasi | Email/password kustom + Argon2id + opaque session cookie, Resend untuk undangan/reset | **DITETAPKAN T02**; owner-only/invite-only pilot; akun/credential/uji belum ada |
| Scope MVP | WhatsApp teks Indonesia, ready-stock, satu owner/lokasi per toko, satu SKU/order | **DIKUNCI D01**; peserta pilot masih terbuka |
| Mutasi stok | TuntasUMKM sumber stok; saat approve atomik; tidak reservasi draft | **DIKUNCI D03**, koreksi manual beralasan/audit |
| Definisi tuntas | Owner mencatat penyerahan ke kurir/pembeli, waktu dan catatan; bukan paid/delivered | **DIKUNCI D04** |
| Pembatalan/restock | Owner-only, alasan, kondisi fisik, restock sekali; refund di luar sistem | **DIKUNCI D04 — P0** |
| Pipeline resmi v1.1 | Terima → lengkapi → validasi → ongkir → draft → keputusan → eksekusi | **DIKUNCI D02 melalui keputusan baru**, bukan rekonstruksi lampiran |
| Auto-reply | Informasi tervalidasi/klarifikasi boleh sebelum approval; tidak menjamin stok/order | **DIKUNCI D02**, rincian kontrol PRD §5/8 |
| Provider WA/LLM/ongkir | Meta Cloud API / BYNARA `agnes-2.5-flash` / RajaOngkir via Komerce | **DITETAPKAN T03–T05**; akses, onboarding, evaluasi dan live test belum selesai; lihat [keputusan teknis](KEPUTUSAN-TEKNIS-TUNTASUMKM.md) |
| KPI | Respons p95 <5s, eksekusi p95 <10s; tunggu owner terpisah; konversi approval 7 hari | **DIKUNCI D05**; 25–30%, hemat 70%, error 0% tetap target pilot |

**Kesimpulan:** gap utamanya bukan kurang banyak endpoint, tetapi belum adanya kontrak operasional yang memastikan tindakan agent benar, sah, tahan gagal, dan terukur. Fondasi transaksi manual yang benar harus dibangun sebelum AI mendapat akses mengusulkan tindakan.