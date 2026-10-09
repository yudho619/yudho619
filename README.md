# Rancangan Perjalanan

<!-- BAGIAN: RINGKASAN PROJECT | README menjadi petunjuk awal untuk memahami teknologi, batasan, halaman, dan fitur website. -->
Website front-end Explore Sumba Timur berdasarkan panduan project:

- HTML, Bootstrap, CSS, dan JavaScript
- Tanpa backend dan tanpa database
- Data produk memakai JavaScript array di `js/data.js`
- Keranjang, login simulasi, dan checkout memakai LocalStorage
- Halaman: `login.html`, `index.html`, `explore.html`, `detail.html`,
  `planner.html`, `my-trip.html`, `about.html`, dan `contact.html`

## Cara Menjalankan

<!-- BAGIAN: MENJALANKAN PROJECT | Server lokal diperlukan agar path aset dan perpindahan halaman diuji dalam kondisi seperti website. -->
Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
python -m http.server 4173
```

Lalu buka:

```text
http://127.0.0.1:4173/index.html
```

## Fitur

<!-- BAGIAN: DAFTAR FITUR | Ringkasan kemampuan utama yang harus didemonstrasikan dan dipahami anggota kelompok. -->
- Login dan daftar simulasi
- Katalog paket perjalanan
- Search produk
- Filter kategori
- Sort harga/popularitas
- Detail produk
- Detail dinamis untuk beberapa destinasi melalui parameter URL
- Tambah destinasi ke Trip Planner
- Pengaturan jumlah traveler
- Tanggal perjalanan konsisten: 12-15 Juni 2026
- Perhitungan aktivitas, transportasi, akomodasi, makan, dan layanan 5%
- Simpan draft, konfirmasi rencana, dan booking simulasi
- My Trip menggunakan data LocalStorage yang sama dengan Trip Planner
- Catatan perjalanan dan pilihan metode pembayaran
- Form kontak dengan validasi
- Tampilan responsive desktop dan mobile
