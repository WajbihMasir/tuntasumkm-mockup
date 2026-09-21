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
- Shared React context + localStorage `tuntas-dashboard-v1` untuk perubahan demo.
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
- P0: Tidak ada masalah terbuka setelah pengujian dan verifikasi perbaikan.
- P1 opsional: Pencarian lintas pesanan/produk/pelanggan; riwayat keputusan dengan alasan.
- P2 opsional: Target penjualan harian, template balasan favorit, tur demo terpandu untuk presentasi.
- Tidak termasuk: Integrasi AI/WhatsApp/API, autentikasi, pembayaran, data langsung, backend baru.

## Langkah berikutnya
1. Pilihan berikutnya: template balasan favorit, target harian, atau tur presentasi.
2. Tetap pertahankan ruang lingkup statis tanpa layanan eksternal kecuali pengguna meminta.

## Hasil verifikasi — 21 September 2026
- Build produksi awal berhasil (`yarn build`).
- Agen pengujian memverifikasi seluruh alur utama, localStorage, dan reset data pada desktop 1920×800 serta ponsel 390×844 dan 360×844; tidak ditemukan overflow global atau masalah tata letak.
- Persetujuan mengurangi stok tepat satu kali; persetujuan dengan stok tidak mencukupi dicegah.
- Tiga temuan konsol dituntaskan: pola validasi nomor telepon, pembungkus span di option produk, dimensi awal Recharts.
- Verifikasi browser ulang: nomor tidak valid ditolak, nomor awal valid tersimpan, dropdown produk berisi teks saja, grafik dan konversi bulanan benar. Daftar error/warning browser kosong.
- Laporan awal `/app/test_reports/iteration_1.json`; tindak lanjut `/app/test_reports/final_verification.md`.
- URL preview: https://tuntasumkm-dash.preview.emergentagent.com