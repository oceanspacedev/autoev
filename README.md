# Auto EV — website baru

React + Vite + Tailwind CSS v4. Website statis: tidak ada database atau panel admin, semua data ada di `src/data/`.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil di dist/
npm run lint
```

## Halaman

| URL | Isi |
|---|---|
| `/` | Beranda: hero motor unggulan, motor pilihan per merek, layanan, testimoni, artikel |
| `/koleksi` | Semua motor + cari, filter merek/harga, urutkan (`?merek=goda&harga=5-7&urut=murah`) |
| `/koleksi/:slug` | Detail motor: foto per warna, spesifikasi, tombol WhatsApp |
| `/bandingkan` | Bandingkan hingga 3 motor, nilai terbaik ditandai |
| `/artikel`, `/artikel/:slug` | Artikel + komunitas Auto EVers |
| `/tentang-kami` | Profil, layanan, galeri pelanggan |
| `/kontak` | Kontak, head office, 16 showroom dengan filter provinsi |

## Mengubah data

- **Showroom:** edit `scraper/output/showrooms.json`, lalu jalankan `node scraper/5-build-data.js`.
- **Produk / harga:** edit `src/data/products.json` langsung (harga dalam rupiah, `null` = "Tanya harga").
  Foto baru: simpan sebagai WebP di `public/img/produk/` dan tulis path-nya di `images`.
- **Kontak, jam buka, promo:** `src/data/site.json`.

`scraper/` berisi skrip yang mengambil data dari autoev.co.id lama (lihat `scraper/output/RINGKASAN.md`).
Menjalankan ulang `5-build-data.js` akan **menimpa** `src/data/products.json`, jadi edit produk manual
sebaiknya dilakukan setelah tidak ada lagi scraping ulang.

## Warna & font (sama dengan website lama)

Merah `#EF4D48` / `#D90700`, judul `#2B161B`, teks `#453E3E`, latar `#F7F3F5`.
Font: Racing Sans One (judul), Montserrat (teks), Inter (menu). Token ada di `src/index.css` (`@theme`).

## Deploy

Hasil `npm run build` adalah situs statis di `dist/`. Karena pakai client-side routing, server/hosting
perlu mengarahkan semua URL yang tidak dikenal ke `index.html` (SPA fallback).
