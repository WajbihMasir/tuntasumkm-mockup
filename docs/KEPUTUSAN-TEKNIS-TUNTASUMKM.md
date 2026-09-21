# TuntasUMKM — Keputusan Teknis T01–T05

Versi: **1.0** · Status: **DITETAPKAN UNTUK PERENCANAAN — BELUM DIIMPLEMENTASIKAN**

## 1. Mandat dan otoritas

Pengguna meminta: “tetapkan database, autentikasi, dan penyedia WhatsApp/AI/ongkir”, memilih BYNARA melalui `https://router.bynara.id/v1/chat/completions` dengan model persis **`agnes-2.5-flash`**, lalu mengizinkan penetapan pilihan, alasan, kebutuhan kredensial, dan batasan integrasi dalam dokumen.

- Pilihan AI berasal langsung dari pengguna. Pilihan lainnya adalah keputusan teknis yang ditetapkan berdasarkan mandat tersebut, bukan klaim bahwa pengguna menyebut setiap vendor/metode secara terpisah.
- Dokumen ini menutup **pemilihan** T01–T05. Aktivasi akun, akses, evaluasi, dan uji integrasi belum selesai. T06 (beban, biaya, privacy/retensi, recovery) dan T07 (pilot, baseline, sumber daya) tetap terbuka.
- [PRD v1.1](PRD-TUNTASUMKM-v1.1.md) dan [aturan operasional](ATURAN-OPERASIONAL-TUNTASUMKM-v1.1.md) tetap berwenang atas D01–D05. Keputusan teknis tidak memperluas kewenangan AI atau mengubah scope produk.
- **Bukan izin coding, migrasi, pemasangan dependency, provisioning, pembelian paket, atau pengiriman data pelanggan.** Frontend tetap **MOCKED** memakai localStorage; backend FastAPI/MongoDB hanya template. PostgreSQL belum dipasang atau digunakan; MongoDB bukan database bisnis pilot yang sudah siap.
- Rencana target PostgreSQL terpisah dari lingkungan template sekarang. Kesiapan lingkungan target harus dipastikan sebelum implementasi; jangan mengganti konfigurasi database sandbox secara diam-diam.

## 2. Ringkasan keputusan final perencanaan

| ID | Pilihan | Alasan | Batas / ketergantungan |
|---|---|---|---|
| T01 | **PostgreSQL**, SQLAlchemy dan Alembic; FastAPI modular monolith + worker/outbox | Relasi tenant–order–stok–approval, constraint, row lock, ledger dan transaksi multi-entitas cocok untuk aturan D03–D04 | Tidak ada migrasi sekarang; hosting/region/backup target mengikuti T06. MongoDB bukan alternatif aktif dalam rencana baru |
| T02 | **Autentikasi kustom email/password + opaque server-side session**, password Argon2id | Dashboard first-party owner-only; pencabutan sesi langsung dan kendali tenant tanpa ketergantungan login sosial | Cookie aman, CSRF, rate limit, invite-only pilot; bukan JWT di localStorage. **Resend** hanya pengantar undangan/reset email |
| T03 | **Meta WhatsApp Cloud API langsung** | Kanal resmi dan receipt/webhook asli; tidak menambah lapisan BSP untuk scope awal | Onboarding, izin aset/aplikasi, nomor, token, template, kebijakan dan biaya Meta tetap diperlukan; bukan WhatsApp Web tidak resmi |
| T04 | **BYNARA/NaraRouter — `agnes-2.5-flash`** | Sesuai pilihan pengguna; antarmuka Chat Completions terdokumentasi | Key BYNARA sendiri; non-streaming pada P0; JSON mode/tool calling khusus model belum terverifikasi; tidak mengganti model otomatis |
| T05 | **RajaOngkir API V2 melalui Komerce** | Pencarian tujuan Indonesia dan perbandingan tarif domestik cocok untuk tahap ongkir | Produk disebut V2 tetapi URL terdokumentasi memakai `/api/v1`; hanya quote, bukan booking/pickup/tracking/COD |

Hosting database belum dipilih karena menyangkut lokasi data, backup, kapasitas dan biaya T06; keputusan engine PostgreSQL sudah final untuk rencana. Redis, vector database, OAuth sosial dan BSP tidak menjadi dependency P0. React yang sudah ada dipertahankan, tidak dibuat ulang dengan framework/build tool berbeda.

## 3. T01 — Database dan transaksi

- PostgreSQL menjadi sumber kebenaran bisnis: `users`, `sessions`, `tenants`, `memberships`, katalog, inventory, movement, order/version, approval, cancellation/stock recovery, inbox/outbox, jobs, audit, dan metric events.
- `tenant_id` wajib dalam akses serta relasi bisnis. Gunakan constraint unik per tenant dan composite foreign key bila perlu agar relasi lintas toko tidak mungkin terbentuk. Identitas owner/tenant tidak dipercaya dari payload frontend atau AI.
- Harga/ongkir integer IDR; jumlah integer positif; saldo stok nonnegatif. Snapshot order dan versi historis tidak ditimpa oleh perubahan katalog.
- Approval: lock order dan inventory dengan urutan konsisten, cek versi/status/harga/quote/stok, lalu commit **approval + order PROCESSING + pengurangan stok + movement + audit + outbox + hasil idempotensi** dalam satu transaksi. Row lock juga harus dipatuhi saat mengubah harga/SKU agar revalidasi tidak berlomba dengan perubahan katalog.
- Dua permintaan atas stok terakhir hanya meloloskan jumlah tersedia. Kunci sama/payload sama mengembalikan hasil lama; payload berbeda ditolak. Draft tidak reservasi stok.
- Cancel tidak otomatis restock. Pemulihan stok sesuai kondisi fisik dilakukan owner sekali, dengan settlement–movement–saldo–audit atomik dan batas jumlah menurut D04. Qty 0 sah tanpa movement positif.
- Provider AI/WA/ongkir tidak dipanggil sambil memegang transaksi stok. Worker/outbox persisten mengurus efek eksternal setelah commit; kegagalan pesan bukan alasan mengulang transaksi stok.
- Migration schema, backup/restore dan konektivitas diuji pada lingkungan PostgreSQL target setelah izin implementasi. Tidak mengimpor data demo localStorage sebagai order nyata.

## 4. T02 — Identitas, sesi dan pemulihan akun

### Pilihan alur

1. Pilot **invite-only**, satu owner per toko; pelanggan WhatsApp tidak memerlukan akun dashboard. Undangan hanya melalui proses provisioning operator tepercaya, tanpa endpoint admin publik atau password default.
2. Email terverifikasi melalui tautan undangan sekali pakai; owner membuat password sendiri. Simpan hash Argon2id, bukan password. Baseline OWASP 19 MiB, iterasi 2, paralelisme 1; benchmark sebelum menaikkan biaya hash.
3. Login membuat token opaque acak kriptografis minimal 256 bit. Database menyimpan **hash token**, user/tenant, waktu pembuatan/aktivitas/kedaluwarsa/pencabutan; bukan token mentah.
4. Cookie `__Host-tuntas_session`: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, **tanpa Domain**. Host API yang sama menerima cookie; frontend memakai URL lingkungan dan credentials. Tidak menyimpan token login di localStorage, query URL atau log. Produksi wajib HTTPS.
5. Default sesi perencanaan: idle 12 jam, batas absolut 7 hari; server memeriksa keduanya walau cleanup belum berjalan. Login merotasi ID sesi; logout mencabut sesi aktif; reset/perubahan password mencabut seluruh sesi lama. Sesi baru hanya setelah login ulang. Default ini aturan internal yang dapat direvisi berversi, bukan karakteristik provider.
6. Semua mutasi memakai token CSRF yang terikat sesi, validasi Origin dan CORS allowlist eksplisit. SameSite saja tidak cukup. Login/undangan/reset juga dilindungi dari penyalahgunaan; webhook memakai verifikasi signature, bukan cookie/CSRF dashboard.
7. Session bukan bukti izin permanen: server memeriksa membership owner aktif pada setiap akses sensitif dan tidak menerima `approved_by` bebas. Pencabutan membership memutus akses walau cookie belum kedaluwarsa.

### Reset dan email pendukung

- **Resend dipilih khusus pengiriman email undangan dan reset**, bukan penyedia identitas atau OTP WhatsApp. Perlu domain pengirim milik pengelola, verifikasi DNS dan key terbatas pengiriman/domain.
- Respons permintaan reset generik agar tidak membocorkan email terdaftar; rate limit login/reset per akun dan sumber, backoff terkontrol tanpa lockout permanen yang mudah disalahgunakan.
- Reset token random, hash tersimpan, berlaku **30 menit**, sekali pakai secara atomik. Undangan default **24 jam**; penerbitan ulang membatalkan token undangan lama. Password berubah hanya setelah token valid dan digunakan atomik bersama revokasi sesi.
- Link dibuat dari origin konfigurasi tepercaya, bukan Host header request. Token tidak masuk analytics/log dan halaman reset memakai no-referrer. Tidak login otomatis setelah reset.
- Jika email gagal, tampilkan jalur coba lagi yang aman; tidak mengirim password sementara atau link reset ke chat publik. Reset tidak dianggap tersedia sampai pengiriman email nyata diuji.
- Staff, self-signup publik, login sosial dan MFA tidak ditambahkan pada P0; kebutuhan tambahan harus melalui change request. Keamanan sesi dan isolasi tenant tetap wajib.

## 5. T03 — WhatsApp resmi melalui Meta

- Gunakan Meta Business Portfolio, Meta app, WhatsApp Business Account (WABA) dan nomor yang dikuasai/diotorisasi toko. Uji awal memakai test number; nomor live memerlukan kelayakan, onboarding dan pengaturan tagihan sesuai akun.
- Simpan mapping unik `phone_number_id`/WABA ke tenant dan referensi kredensial kanal. Nomor pengirim/pesan pelanggan bukan identitas owner dashboard.
- Token system user dengan permission minimum sesuai operasi: `whatsapp_business_messaging`, `whatsapp_business_management`; `business_management` hanya bila operasi pengelolaan aset memerlukan. Pin versi Graph API yang masih didukung saat implementasi, jangan menganggap token bersifat permanen/tidak bisa dicabut.
- Rencana endpoint aplikasi: `GET/POST /api/v1/webhooks/whatsapp`. GET memeriksa verify token dan mengembalikan challenge. POST memverifikasi `X-Hub-Signature-256` atas **raw request body** dengan app secret, perbandingan constant-time, lalu menyimpan event/inbox secara durable sebelum ACK cepat. Verify token GET bukan pengganti signature POST.
- Dedupe pesan berdasarkan identitas kanal + message ID. Dedupe status harus memasukkan jenis status/event agar `sent`, `delivered`, `read`, `failed` untuk message ID sama tidak saling dibuang. Handler tahan status terlambat/tidak berurutan.
- Worker menjalankan balasan informasi/klarifikasi tervalidasi dalam batas D02, tanpa approval tambahan untuk setiap balasan aman. Order, stok, cancel/restock tetap owner-only. Cek ulang pause/takeover dan versi handler sebelum draft/send.
- Free-form mengikuti jendela layanan **24 jam sejak pesan masuk pelanggan terakhir yang sah**. Setelah window habis, hanya template yang disetujui dan memenuhi ketentuan consent/kategori. Approval order yang terlambat tidak membuka window otomatis. Jika template belum tersedia, status pengiriman ditahan/perlu perhatian, bukan free-form paksa.
- Respons accepted dari send bukan delivered. Timeout yang mungkin sudah diterima provider ditandai `unknown`; tidak blind retry. Status pesan terpisah dari order/serah-terima dan transaksi stok.
- Pilot aset sendiri dan onboarding WABA pihak ketiga berbeda. Untuk toko lain, izin akses aset dan kebutuhan Business Verification/App Review/Advanced Access harus diperiksa **sebelum** memproses nomor mereka; pilot bukan pengecualian otomatis. Embedded Signup self-service ditunda, bukan jalan pintas membagikan satu token antar toko.
- Asisten terbatas pelayanan toko/e-commerce, bukan chatbot AI serbaguna. Kelayakan use case, kebijakan AI/perdagangan terkini, opt-in, template dan harga Meta wajib diverifikasi sebelum live; pemilihan Cloud API bukan jaminan persetujuan akun.

## 6. T04 — BYNARA `agnes-2.5-flash`

### Kontrak yang ditetapkan

- Base URL: `https://router.bynara.id/v1`; metode/path: `POST /chat/completions`.
- Auth: `Authorization: Bearer $BYNARA_API_KEY`; body JSON `model: "agnes-2.5-flash"` dan `messages` sesuai contoh pengguna. Key dibuat pada [halaman API keys BYNARA](https://router.bynara.id/keys).
- Adapter HTTP server-side memakai antarmuka Chat Completions, **bukan Responses API**, dan tidak memerlukan pergantian provider. Base URL/model/key berasal dari konfigurasi lingkungan saat implementasi; API key tidak pernah dikirim ke React atau prompt.
- P0 non-streaming: baca `choices[].message.content`, `finish_reason`, ID respons dan `usage` bila tersedia. Keluaran kosong, terpotong, format salah atau usage hilang tidak boleh dianggap keberhasilan lengkap/biaya nol.
- Context disimpan sendiri per `tenant_id + conversation_id + intent_episode_id`; setiap run mempunyai ID dan versi konteks/handler. Jangan menganggap `/chat/completions` menyimpan sesi secara otomatis atau menggabungkan histori pelanggan/toko berbeda.

### Bukti dan batas verifikasi

| Hal | Status bukti |
|---|---|
| Base URL, Bearer auth, request messages/model, format response Chat Completions | Terdokumentasi di [BYNARA docs](https://router.bynara.id/docs), sesuai contoh pengguna |
| Agnes 2.5 Flash | Nama model tampil di katalog publik; alias `agnes-2.5-flash` berasal dari pengguna dan tetap dipakai. Entitlement/hasil inference akun belum diuji |
| Streaming dan `/v1/models` | Terdokumentasi untuk gateway; `/v1/models` memerlukan auth dan menunjukkan akses akun. Tidak membuktikan semua kemampuan tersedia pada Agnes |
| JSON mode/JSON Schema strict/function calling pada model ini | **Belum terverifikasi**; tidak menjadi prasyarat rancangan P0 |
| Tarif, kuota, context window, batas output, SLA | Halaman provider memuat tarif/plan dinamis; paket, penagihan dan batas model/akun harus diverifikasi sebelum aktivasi. Tidak menetapkan estimasi biaya dari asumsi |
| Retensi, pemakaian data untuk training, lokasi/subprocessor, penghapusan data | **Belum terverifikasi** dari dokumentasi yang diperiksa; menjadi gerbang T06 sebelum data pelanggan nyata |

Pembacaan publik endpoint tanpa key menghasilkan respons unauthorized; itu bukan uji inference dan bukan bukti model bekerja. Tidak ada request berbayar atau data pelanggan yang dikirim.

### Pipeline terkendali

1. Model mengekstrak niat dan kandidat data menjadi JSON teks sesuai schema aplikasi. Parsing/Pydantic menolak field tidak sah, input berlebih dan tipe/jumlah tidak valid. Keberhasilan JSON bukan bukti fakta benar; angka confidence bukan otorisasi.
2. Server melakukan lookup SKU/harga/stok, validasi alamat/tujuan, kalkulasi dan quote. Alur tool/lookup ditentukan aplikasi, tidak bergantung pada native function calling yang belum terbukti didukung.
3. AI boleh mengusulkan draft/revisi dan membalas info/klarifikasi tervalidasi sesuai D02. Harga/stok/ongkir yang disampaikan berasal dari hasil server; jawaban tidak boleh menciptakan diskon, kebijakan atau janji stok sendiri.
4. **Tidak ada kredensial database, session owner, tool approve/cancel/restock/adjust-inventory atau SQL bebas pada model.** Instruksi chat dan keluaran model tidak pernah menjadi approval. Hasil tetap melewati tenant policy dan fencing takeover.
5. Output invalid/ambigu: klarifikasi aman atau perhatian owner; tidak memaksa draft. Timeout/5xx/429 sementara boleh maksimal satu retry dalam deadline job; kuota habis, 401/403 dan model tidak tersedia tidak diulang buta. Retry bisa tetap berbiaya; simpan attempt terpisah dan jangan menggandakan draft/pesan.
6. Tidak ada fallback otomatis ke model/provider lain atau combo. Jika BYNARA gagal, workflow manual tetap berjalan; perubahan model memerlukan keputusan baru dan evaluasi ulang.
7. Target respons awal p95 <5 detik tetap target D05: balasan penerimaan deterministik boleh mendahului inference, jujur dan mengikuti aturan kanal. Catat latensi jawaban substantif secara terpisah; jangan mengklaim Agnes sudah memenuhi target.
8. Sebelum data nyata: minimalkan/redaksi telepon, alamat dan data yang tidak diperlukan untuk intent; gunakan referensi internal dan katalog terbatas tenant. Batas token, timeout, kuota/biaya per toko dan retensi wajib dikonfigurasi serta disepakati pada T06; AI tetap nonaktif untuk live jika gerbang ini belum lolos.

## 7. T05 — RajaOngkir melalui Komerce

- Pakai keluarga produk **RajaOngkir API V2** dengan base URL terdokumentasi `https://rajaongkir.komerce.id/api/v1`. Jangan mengganti URL menjadi `/v2` hanya karena nama produk, atau memakai endpoint Starter/Basic/Pro lama.
- Auth header **`key`**, bukan Bearer. API key dari dashboard RajaOngkir/Komerce setelah registrasi/pemilihan paket. Coverage, kurir dan kuota tergantung akses akun, bukan seluruh layanan pasti tersedia.
- Default tujuan: direct search `GET /destination/domestic-destination`, simpan **subdistrict ID** serta label lengkap dari hasil. Asal toko dan tujuan harus sama level ID dengan endpoint biaya; jangan mencampur ID kota/district lama. Alamat ambigu memerlukan konfirmasi pelanggan/owner, bukan tebakan AI.
- Quote: `POST /calculate/domestic-cost`, body **application/x-www-form-urlencoded**, `origin`, `destination`, `weight` integer **gram**, `courier` kode layanan terpilih (daftar kode dipisah `:`); optional `price` hanya pengurutan, bukan harga kiriman klien.
- Berat kirim mencakup qty × berat SKU + kemasan terverifikasi. Barang volumetrik/besar/khusus tidak diberi tarif presisi palsu jika kontrak API/paket tidak mencakup kebutuhannya: arahkan ke owner/manual. Tidak menganggap ETA/ETD sebagai janji tanggal tiba atau rate mencakup semua surcharge/asuransi.
- Aplikasi membuat **ID quote internal**, menyimpan provider, fingerprint asal/tujuan/berat/kurir/service, nilai IDR, ETD bila tersedia, waktu ambil, masa berlaku dan sumber. `provider_quote_id` optional: jangan mengharuskan provider mengembalikan quote ID/expiry yang tidak dijanjikan dokumentasi.
- Masa berlaku provider dipakai bila tersedia; jika tidak, freshness internal **15 menit** sesuai PRD. Tidak mengklaim provider mengunci tarif selama itu. Quote kedaluwarsa/perubahan fingerprint menahan approval; refresh membuat versi draft baru untuk review.
- Gagal/coverage kosong tidak berarti ongkir nol. Fallback hanya tarif manual owner beralasan, berlaku 15 menit, termasuk penyerahan langsung Rp0 yang dicatat owner. AI tidak boleh mengisi tarif manual.
- Tidak ada booking, pickup, nomor resi otomatis, tracking, COD, pembayaran/refund atau pemilihan layanan pengiriman tanpa konfirmasi. Hasil quote tidak mengubah stok.

## 8. Checklist konfigurasi dan kredensial — belum diisi

**Tidak meminta/membuat kredensial pada tahap dokumen.** Diperoleh secara aman hanya setelah instruksi implementasi, sebelum integrasi terkait. Semua secret server-side; tidak dimasukkan ke dokumen, repository, browser atau public docs.

| Komponen | Konfigurasi/kredensial yang direncanakan | Sumber / prasyarat |
|---|---|---|
| PostgreSQL target | `DATABASE_URL` TLS, role runtime terbatas; credential migrasi terpisah | Infrastruktur target yang disetujui T06; bukan mengganti `MONGO_URL`/`DB_NAME` template sekarang |
| Session/auth | `APP_ORIGIN`, allowlist CORS, TTL sesi/reset/invite; token sesi/CSRF dibuat acak oleh server | Konfigurasi runtime tepercaya; bukan API key identitas eksternal, tanpa JWT signing secret yang tidak dipakai |
| Resend | `RESEND_API_KEY`, `RESEND_FROM`, trusted reset/invite origin | [Resend API keys](https://resend.com/api-keys), [verifikasi domain](https://resend.com/docs/dashboard/domains/introduction); hak DNS domain pengirim |
| WhatsApp | `META_APP_ID`, `META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_GRAPH_API_BASE_URL`, `META_GRAPH_API_VERSION`, `META_WABA_ID`, `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN` | [Meta Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started); nomor/Business Portfolio dan izin aset yang sah |
| BYNARA | `BYNARA_BASE_URL`, `BYNARA_MODEL=agnes-2.5-flash`, **`BYNARA_API_KEY`**, batas biaya/token/deadline | [BYNARA keys](https://router.bynara.id/keys), akses model dan saldo/plan akun; tidak menerima key vendor lain |
| RajaOngkir/Komerce | `KOMERCE_BASE_URL`, **`KOMERCE_API_KEY`**, origin subdistrict, kurir/layanan diizinkan | [RajaOngkir](https://rajaongkir.com/), dashboard sesuai onboarding di [dokumentasi Komerce](https://komerceapi.readme.io/reference/rajaongkir-api) |

Variabel ini kontrak rencana, **belum ditambahkan ke `.env`**. `REACT_APP_BACKEND_URL`, `MONGO_URL`, dan `DB_NAME` existing dipertahankan. Untuk multi-toko, referensi secret per kanal harus terisolasi dalam penyimpanan secret terenkripsi/secret manager; daftar env Meta di atas hanya menjelaskan satu akun uji, bukan desain satu token global bagi semua tenant.

## 9. Urutan implementasi dan pengujian minimal — setelah instruksi baru

| Langkah | Hasil kecil yang dapat diuji | Uji minimal / gerbang |
|---|---|---|
| 0. Izin dan lingkungan target | Izin implementasi eksplisit, koneksi PostgreSQL tersedia, keputusan T06 relevan dicatat | Buktikan konektivitas/migrasi pada DB uji terpisah; tidak mengubah lingkungan template tanpa rencana |
| 1. Fondasi schema/tenant | Tenant, owner, inventory, constraint dan migrasi | Terapkan pada DB kosong; constraint nonnegatif/unik dan relasi lintas tenant ditolak |
| 2. Auth dan pemulihan | Invite, login/logout, sesi, CSRF dan reset via Resend | Dua toko terisolasi; cookie aman; sesi dicabut/expired ditolak; reset sekali pakai/expired/retry paralel dan delivery email nyata diuji |
| 3. Draft manual | Katalog, adjustment owner, draft berversi | Draft tidak mutasi stok; field/qty/tenant invalid ditolak; revisi mempertahankan histori |
| 4. Approval atomik | Order–stock–audit–outbox–idempotensi | Dua owner request berebut unit terakhir; retry dan crash rollback; versi/harga/quote berubah ditahan (AC05–AC12) |
| 5. Cancel/restock | Cancel, handover dan settlement fisik | Cancel tidak otomatis restock; qty 0/sebagian layak jual, double submit, koreksi tertaut (AC13–AC18) |
| 6. Ongkir | Lookup tujuan dan quote asli + manual owner | Uji gram/kemasan, origin/destination ID, cakupan kosong, timeout, expiry/requote dan larangan booking |
| 7. WhatsApp | Verified webhook, durable inbox/outbox, pesan manual/receipt | Signature palsu, retry, status berurutan/tidak berurutan, window 24 jam, template, crash dan unknown delivery |
| 8. BYNARA terkendali | Model exact, ekstraksi tervalidasi dan konteks terpisah | `/v1/models` + inference sintetis tanpa PII, multi-turn/multi-tenant, malformed/truncated JSON, 401/403/429/5xx, biaya dan prompt injection; stok tetap tidak berubah |
| 9. Komposisi UI/pipeline | localStorage bisnis diganti API, takeover dan antrean owner | Chat → quote → draft → owner approve → stok sekali → handover; pause/handoff saat AI berjalan; reload/dua perangkat konsisten |
| 10. Pilot | T06–T07 lengkap, evaluasi dan observabilitas | AC01–AC25 nyata, backup restore, beban, retensi, cost cap, baseline admin dan cohort matang 7 hari |

Fixture provider harus diberi label **MOCKED** dan dipisahkan dari bukti live. Semua uji integrasi di atas **belum dijalankan**; pemeriksaan dokumen bukan pengujian backend. T06/T07 tidak menghalangi penyusunan schema, tetapi menahan aktivasi/pilot data nyata. Harga paket/vendor bukan komitmen biaya sampai diperiksa pada akun yang akan digunakan.

## 10. Referensi dan pengendalian perubahan

Dokumentasi publik diperiksa pada sesi penetapan; isinya dapat berubah. Catatan provider bukan jaminan hasil akun pengguna.

- [BYNARA API docs](https://router.bynara.id/docs) dan [pricing](https://router.bynara.id/pricing): kontrak gateway, katalog dan batas paket; capabilities model spesifik perlu uji.
- [Meta Get Started](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started), [webhook](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks/), [pengiriman/window](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages/).
- [RajaOngkir V2 introduction](https://komerceapi.readme.io/reference/rajaongkir-api) dan [domestic cost](https://komerceapi.readme.io/reference/calculate-domestic-cost): header, area, gram, form body dan endpoint.
- [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [forgot password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
- [Resend API key](https://resend.com/docs/api-reference/api-keys/create-api-key), [send email](https://resend.com/docs/api-reference/emails/send-email), [domain](https://resend.com/docs/dashboard/domains/introduction).

Perubahan engine DB, auth, provider/model atau kewenangan wajib dicatat dengan alasan, dampak data/biaya/operasional, persetujuan baru dan versi dokumen. **Persetujuan keputusan teknis tetap bukan izin implementasi.**
