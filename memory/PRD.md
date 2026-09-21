# TuntasUMKM — Dashboard Statis Interaktif

## Permintaan asli
clone repo ini ke sandbox kamu "https://github.com/WajbihMasir/tuntasumkm-mockup.git"
Buatkan aku mockup statis dashboard projek/repo terlampir/diatas! (MODE HEMAT CREDIT EMERGENT)

Pilihan pengguna: Dashboard statis interaktif, data contoh, navigasi dan tombol utama berfungsi, tanpa API/AI agar hemat kredit. Referensi: identitas visual TuntasUMKM terlampir serta PRD Problem Focused Strategy.

## Persona dan persyaratan inti
- Pemilik UMKM Indonesia yang melayani pembeli lewat percakapan.
- Melihat ringkasan usaha, meninjau draft, memberi persetujuan, membalas percakapan, mengelola produk dan stok.
- Semua berjalan lokal dengan data contoh; tanpa autentikasi, panggilan API bisnis, AI, WhatsApp sungguhan, dan pembayaran.
- Keputusan penting tetap memerlukan persetujuan pemilik.

## Arsitektur
- Repository asli berhasil diklon ke `/app/reference-repo` sebagai referensi yang tetap utuh.
- React dan React Router untuk enam halaman, komponen Shadcn, Recharts, Lucide.
- Shared React context + localStorage `tuntas-dashboard-v1` (schema 2) untuk perubahan demo; migrasi mempertahankan data versi sebelumnya.
- Backend FastAPI bawaan tidak digunakan atau diubah. Variabel lingkungan tetap utuh.
- Logo asli disalin dari repository; warna #0F2D6B, #2563EB, #10B981 sesuai panduan pengguna.
- Data awal toko Ruang Rupa, pemilik Rina, 5 percakapan, 6 pesanan, 4 produk. Angka analitik adalah contoh periode September 2026.

## Implementasi — 21 September 2026
- Dashboard: filter periode 7/30 hari, empat KPI, grafik penjualan/pesanan, unduh CSV, antrean persetujuan, percakapan terbaru, aktivitas.
- Pesanan: pencarian, filter status, detail, setujui/tolak/tandai selesai, buat draft baru, ekspor CSV.
- Percakapan: pencarian dan filter, detail pesan, balasan lokal, tandai selesai/buka kembali, tautan detail pesanan.
- Produk: pencarian, filter stok rendah, tambah/edit nama, varian, kategori, harga dan stok.
- Analitik: grafik periode dan funnel konversi serta dampak asisten.
- Pengaturan: profil toko, status asisten, notifikasi, simpan perubahan dan reset demo dengan konfirmasi.
- Notifikasi dan bantuan; navigasi responsif desktop/mobile; state demo disimpan lokal.

## Backlog terprioritas
- P0: Lima pelengkap operasional selesai dan teruji; tidak ada masalah terbuka dari pengujian terakhir.
- P1 ditunda sesuai pilihan pengguna: aturan bisnis/pengetahuan toko serta penyaringan riwayat keputusan menurut pelanggan, tindakan, dan hasil.
- P2 opsional: Mode presentasi, target penjualan harian, template balasan favorit.
- Tidak termasuk: Integrasi AI/WhatsApp/API, autentikasi, pembayaran, data langsung, backend baru.

## Langkah berikutnya
1. P1 hanya dilanjutkan setelah diminta: aturan toko dan penyaringan riwayat. Mode presentasi tetap opsional.
2. Tetap pertahankan ruang lingkup statis tanpa layanan eksternal kecuali pengguna meminta.

## Hasil verifikasi — 21 September 2026
- Build produksi awal berhasil (`yarn build`).
- Agen pengujian memverifikasi seluruh alur utama, localStorage, dan reset data pada desktop 1920×800 serta ponsel 390×844 dan 360×844; tidak ditemukan overflow global atau masalah tata letak.
- Persetujuan mengurangi stok tepat satu kali; persetujuan dengan stok tidak mencukupi dicegah.
- Tiga temuan konsol dituntaskan: pola validasi nomor telepon, pembungkus span di option produk, dimensi awal Recharts.
- Verifikasi browser ulang: nomor tidak valid ditolak, nomor awal valid tersimpan, dropdown produk berisi teks saja, grafik dan konversi bulanan benar. Daftar error/warning browser kosong.
- Laporan awal `/app/test_reports/iteration_1.json`; tindak lanjut `/app/test_reports/final_verification.md`.
- URL preview: https://tuntasumkm-dash.preview.emergentagent.com

## Rencana pelengkap yang disetujui — 21 September 2026
Pengguna menyetujui: **Jalankan P0 sesuai rencana: P1 ditunda, tanpa API/AI, tetap pada enam halaman yang ada**.

Tujuan: demonstrasi frontend percakapan hingga pesanan selesai, bukan implementasi produk AI/WhatsApp sesungguhnya. PRD Markdown tidak memuat isi lengkap matriks akar masalah, empat lapisan kendala, tujuh tahap pipeline, dan skenario operasional. Tidak ada persentase kesesuaian atau klaim 100%. Nama/urutan tahap harus berlabel **usulan alur demonstrasi**, bukan urutan resmi PRD.

### P0 yang telah diimplementasikan
1. **Percakapan → draft:** sembilan skenario terpandu; kebutuhan produk/varian, jumlah, penerima, alamat, konfirmasi; validasi katalog/stok; tarif reguler/ekspres lokal, tarif manual pemilik beserta alasan. Draft hanya dapat diajukan setelah pemeriksaan lulus. Pesan bebas hanya disimpan, tidak diklaim dipahami AI.
2. **Tujuh tahap:** jejak per percakapan dan pesanan dengan status belum mulai, berlangsung, lengkap, perlu informasi/koreksi, gagal, menunggu keputusan, ditolak, dan tuntas. Label usulan dan ketidaklengkapan PRD selalu tersedia. Aktor asisten simulasi vs pemilik dibedakan.
3. **Kontrol pemilik:** koreksi draft versi baru, alasan wajib untuk penolakan/revisi, ajukan ulang setelah koreksi, buka revisi dari penolakan, ambil alih/kembalikan penanganan, pencatatan nama/waktu/hasil dan perubahan sebelum→sesudah. Status valid dan transaksi state sinkron mencegah persetujuan/penyelesaian berulang mengurangi stok lagi.
4. **Kendala/pemulihan:** varian tidak ada, stok kurang, alamat/konfirmasi kurang, ongkir tak tersedia, penolakan/revisi, pesan/pengajuan ganda, pemeriksaan gagal dengan retry/pemilik. Perubahan stok/harga setelah draft menahan persetujuan sampai dikoreksi. Pause asisten tidak menghilangkan kemampuan pemilik; pengembalian ke asisten dijeda ditolak.
5. **KPI terpisah:** baseline manual, target PRD, hasil sesi browser, dan historis contoh berlabel terpisah. Respons hasil lokal diberi batasan bukan latensi AI; waktu draft→persetujuan termasuk waktu peninjauan; kendala ditahan bukan tingkat error nyata; konversi hanya pesanan disetujui dari percakapan skenario. Target 70% penghematan dan target 0% error tidak disebut hasil/garansi.

### Keputusan arsitektur tambahan
- `workflowRules.js`: validasi dan ongkir deterministik, urutan tahap usulan.
- `workflowOperations.js`: operasi state murni, pemeriksaan ulang persetujuan, idempotensi, jejak per entitas.
- `store.js`: commit sinkron memakai ref supaya dua perintah cepat tidak menggunakan state usang; schema migration dan reset lengkap.
- `analytics.js`: satu sumber perhitungan untuk ringkasan sesi, KPI, dan CSV; historis tetap terpisah.
- Komponen workflow modular dalam `src/components/workflow`; style tambahan mengikuti visual lama, tanpa rute baru atau integrasi.
- Riwayat per pesanan/percakapan disimpan tanpa pemangkasan; sumber contoh awal vs aksi lokal ditandai. Snapshot validasi dan identitas persetujuan dipertahankan.
- Pengajuan ganda tidak membuka modal lagi; jumlah pesan/pengajuan yang dicegah selalu terlihat dan diumumkan melalui aria-live.

### Verifikasi pelengkap P0
- Build produksi berhasil.
- `/app/test_reports/iteration_2.json`: alur lengkap, revisi/penolakan, pemulihan seluruh skenario, KPI, migrasi, mobile 390/360, reset lulus. Indikator duplikasi dilaporkan bermasalah; pemeriksaan terfokus menunjukkan efek klik sebelum overlay selesai. UI juga diperkuat dengan indikator selalu tampil dan pengajuan ulang tidak membuka modal.
- `/app/test_reports/iteration_3.json`: kasus duplikasi, asisten dijeda, drift stok/harga dan pemulihannya, persistensi analitik, serta reset berhasil. Tidak ada temuan fungsi/desain/integrasi yang terbuka.
- Tiga unit test `src/__tests__/workflowOperations.idempotence.test.js` lulus: persetujuan berulang, penyelesaian berulang, penahanan persetujuan karena harga berubah. File test ditinjau; tidak mengubah kode produk.
- Data demo dikembalikan ke kondisi awal setelah pengujian. Tidak ada API/layanan eksternal bisnis yang ditambahkan.