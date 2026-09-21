# Rencana Pelengkap Frontend TuntasUMKM

## Tujuan

Melengkapi dashboard yang sudah ada menjadi demonstrasi alur operasional dari percakapan sampai pesanan dituntaskan, dengan persetujuan pemilik dan indikator dampak yang sesuai dengan PRD.

Kesesuaian dibedakan menjadi dua hal:
- **Kesesuaian frontend:** seluruh layar, keputusan, status, dan skenario yang dipersyaratkan dapat ditunjukkan melalui interaksi.
- **Kesesuaian produk sesungguhnya:** asisten benar-benar memahami pesan, memeriksa informasi bisnis, mengirim pesan, dan menjalankan tindakan operasional. Hal ini tidak dapat dipenuhi oleh frontend statis saja dan bukan cakupan rencana ini.

## Batas kepastian terhadap PRD

Dokumen Markdown yang terlampir memuat beberapa judul bagian tanpa rincian isinya. Bagian yang tidak lengkap antara lain matriks akar masalah, empat lapisan kendala, rincian tujuh tahap pipeline, dan skenario operasional.

Karena itu, belum ada dasar untuk menyatakan persentase kesesuaian atau menjamin kesesuaian 100%. Rencana ini membedakan kebutuhan yang disebutkan dalam bagian PRD yang terbaca dari pelengkap frontend yang diusulkan. Nama dan urutan tujuh tahap tidak akan diklaim sebagai urutan resmi tanpa rincian PRD yang lengkap.

## Keputusan yang tetap berlaku

- Tetap berupa dashboard statis interaktif untuk menghemat biaya.
- Tidak menggunakan API bisnis, AI sungguhan, pengiriman WhatsApp, layanan kurir, autentikasi, atau pembayaran.
- Interaksi dan perubahan hanya berlaku pada ruang demo di browser.
- Identitas visual TuntasUMKM tetap mengikuti logo dan warna yang diberikan.
- Enam halaman yang sudah ada tetap dipakai: Ringkasan, Percakapan, Pesanan, Produk & Stok, Analitik, dan Pengaturan.
- Tindakan penting tetap memerlukan keputusan pemilik. Asisten tidak boleh terlihat sudah menjalankan tindakan yang belum disetujui.

## Fitur yang sudah tersedia

- Ringkasan bisnis, grafik, pilihan periode, dan unduh laporan.
- Daftar serta detail percakapan, balasan lokal, dan penandaan selesai.
- Pembuatan draft manual, persetujuan, penolakan, penyelesaian pesanan, dan pengurangan stok ketika pesanan disetujui.
- Penambahan serta pengubahan produk, harga, varian, dan stok.
- Analitik contoh, pengaturan toko, status asisten, notifikasi, dan reset demo.
- Tampilan desktop dan ponsel.

## P0 — Pelengkap utama yang direkomendasikan

### 1. Percakapan menghasilkan draft pesanan

**Dasar PRD yang terbaca:** TuntasUMKM harus membantu mengeksekusi tindakan, bukan hanya menjawab teks; tindakan yang disebutkan meliputi pemeriksaan atau pembaruan stok, pembuatan draft, dan penghitungan ongkir.

**Kesenjangan saat ini:** percakapan contoh sudah memiliki pesanan terkait, tetapi proses dari kebutuhan pelanggan menuju draft belum dapat dijalankan sebagai satu alur lengkap.

**Tambahan frontend:**
- Panel kebutuhan pelanggan: produk, varian, jumlah, penerima, dan alamat.
- Penanda informasi lengkap, kurang lengkap, atau perlu dikonfirmasi.
- Hasil pemeriksaan varian dan stok yang terlihat sebelum draft diajukan.
- Pilihan pengiriman serta perhitungan ongkir simulasi yang dijelaskan sebagai simulasi.
- Draft yang dapat diubah; subtotal, ongkir, dan total mengikuti perubahan.
- Skenario percakapan terpandu untuk menjalankan alur ini tanpa AI sungguhan. Pesan bebas tidak akan diklaim dipahami otomatis oleh AI.

**Hasil yang diharapkan:** satu kebutuhan pelanggan dapat ditelusuri sampai menjadi draft dengan rincian dan nominal yang konsisten.

### 2. Visualisasi proses tujuh tahap

**Dasar PRD yang terbaca:** terdapat deterministic agent pipeline dengan tujuh tahap. Rincian tahap tidak tersedia pada lampiran yang terbaca.

**Tambahan frontend:**
- Jejak proses per percakapan dan pesanan, bukan hanya daftar aktivitas umum.
- Tampilan tahap yang sedang berlangsung, sudah selesai, menunggu informasi, menunggu keputusan, atau gagal.
- Rincian hasil dan alasan pada tahap yang memerlukan perhatian.
- Pembedaan antara pekerjaan asisten dan tindakan pemilik.

**Batas keputusan:** visualisasi proses termasuk cakupan; penamaan dan urutan resmi tujuh tahap memerlukan bagian PRD yang lengkap. Jika belum tersedia, alur demonstrasi harus dinyatakan sebagai usulan, bukan kutipan PRD.

### 3. Kontrol pemilik yang lebih lengkap

**Dasar PRD yang terbaca:** pemilik tetap memegang kendali dan memberikan persetujuan sebelum tindakan penting dijalankan.

**Kesenjangan saat ini:** keputusan dasar tersedia, tetapi koreksi sebelum persetujuan dan alasan penolakan belum lengkap.

**Tambahan frontend:**
- Tinjau dan ubah draft sebelum menyetujui.
- Catat alasan penolakan atau permintaan revisi.
- Tampilkan status dan perubahan setelah keputusan diambil.
- Tombol ambil alih percakapan serta pengembalian ke asisten dalam simulasi.
- Tampilkan identitas pengambil keputusan, waktu keputusan, dan tindakan yang dijalankan.
- Pencegahan tindakan ganda agar persetujuan berulang tidak menggandakan pesanan atau pengurangan stok.

**Hasil yang diharapkan:** pemilik memahami apa yang akan dilakukan, dapat mengoreksi atau menghentikannya, dan dapat menelusuri hasilnya.

### 4. Skenario kendala dan pemulihan

**Dasar PRD:** penanganan friksi operasional disebutkan, tetapi daftar skenario rinci tidak terbaca. Skenario berikut merupakan pelengkap yang diusulkan, bukan daftar resmi PRD.

**Tambahan frontend:**
- Produk atau varian tidak ditemukan.
- Stok tidak mencukupi, dengan kesempatan mengubah jumlah atau memilih varian lain.
- Alamat atau informasi pesanan belum lengkap.
- Ongkir belum tersedia sehingga draft belum siap disetujui.
- Pesanan ditolak atau diminta direvisi.
- Pesan berulang yang berisiko menghasilkan pesanan ganda.
- Pemeriksaan gagal, dengan pilihan mencoba kembali atau ditangani pemilik.

**Hasil yang diharapkan:** setiap kendala memiliki status yang jelas dan tindakan lanjutan yang dapat dilakukan, bukan sekadar notifikasi tanpa penyelesaian.

### 5. KPI yang mengikuti matriks PRD

**Dasar PRD yang terbaca:** empat indikator utama adalah kecepatan respons, waktu pemrosesan pesanan, kesalahan varian atau stok, serta konversi percakapan menjadi pesanan.

**Tambahan frontend:**
- Bandingkan kondisi manual, target PRD, dan hasil simulasi secara terpisah.
- Waktu respons: baseline 15–45 menit; target kurang dari 5 detik.
- Waktu pemrosesan pesanan: baseline 5–10 menit; target kurang dari 10 detik melalui persetujuan pemilik. Target penghematan waktu operasional 70% ditampilkan sebagai target, bukan hasil nyata.
- Kesalahan varian atau stok: baseline 8–12%; target 0% melalui validasi. Angka 0% tidak ditampilkan sebagai jaminan tanpa kesalahan.
- Konversi percakapan menjadi pesanan: baseline 12–15%; target 25–30%.
- Angka ringkasan, rincian, aktivitas, dan laporan harus selaras. Angka historis contoh harus dibedakan dari hasil tindakan simulasi yang baru dijalankan.

**Hasil yang diharapkan:** manfaat produk dapat ditunjukkan tanpa mencampurkan target, angka contoh, dan hasil bisnis yang sungguhan.

## P1 — Pelengkap yang berguna, tetapi belum terbukti wajib dari PRD

### Aturan bisnis dan pengetahuan toko

- Pengaturan informasi produk dan jawaban toko yang digunakan dalam skenario.
- Aturan simulasi pengiriman, jam operasional, dan kondisi yang memerlukan pemilik.
- Pratinjau dampak aturan pada percakapan atau draft.

Bagian ini direkomendasikan untuk membuat demonstrasi lebih masuk akal, tetapi tidak boleh disebut persyaratan eksplisit PRD sebelum rincian dokumen tersedia.

### Riwayat keputusan yang dapat ditelusuri

- Penyaringan aktivitas menurut pesanan, pelanggan, tindakan, dan hasil.
- Tampilan alasan kegagalan, koreksi draft, dan keputusan pemilik.

Jejak dasar keputusan termasuk P0. Penyaringan dan tampilan riwayat khusus merupakan penyempurnaan P1.

## Tidak termasuk

- Landing page tambahan, CRM lengkap, manajemen tim, akuntansi, atau fitur lain yang tidak dibutuhkan alur PRD.
- Integrasi AI, WhatsApp, kurir, pembayaran, atau layanan eksternal.
- Klaim hasil bisnis nyata dari angka simulasi.
- Klaim kepatuhan 100% terhadap bagian PRD yang belum tersedia secara lengkap.

## Ruang lingkup yang diajukan

Paket yang direkomendasikan adalah lima pelengkap P0 pada halaman yang sudah ada. P1 tetap opsional. Seluruhnya tetap statis interaktif dan menggunakan identitas visual saat ini.

Keputusan yang dapat disesuaikan adalah: apakah hanya P0 yang diambil, apakah P1 juga diperlukan, dan apakah penamaan tujuh tahap menunggu PRD lengkap atau memakai alur demonstrasi yang diberi label sebagai usulan.