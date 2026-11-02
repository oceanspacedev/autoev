# Hasil Scraping autoev.co.id

Diambil pada 2 November 2026 dari https://autoev.co.id (WordPress + Astra + Elementor Pro + WooCommerce).
robots.txt mengizinkan scraping. Semua request diberi jeda ±1 detik.

## Isi folder `scraper/output/`

| File / folder | Isi |
|---|---|
| `site.json` | Logo, favicon, menu navigasi, header, footer, kontak, sosial media, slide hero, 8 testimoni Google |
| `pages.json` | 185 URL: teks per blok (judul/paragraf/tombol), gambar, link, iframe, meta SEO, JSON-LD |
| `products.json` | 122 produk bersih: merek, harga, spesifikasi, deskripsi, gambar, link WhatsApp |
| `images/` + `images.json` | 650 gambar resolusi asli (910 MB: 459 png, 99 webp, 92 jpg). 426 dipakai di halaman, 224 hanya ada di media library. Manifest mencatat alt, ukuran, dan halaman pemakainya. |
| `screenshots/` | Screenshot full-page 11 halaman, desktop (1440px) dan mobile (390px) |
| `design-tokens.json` | Warna, font, type scale, dan gaya tombol, diukur dari halaman yang sudah ter-render |
| `api/` | Dump mentah WordPress REST API dan WooCommerce Store API |

## Identitas visual (dipertahankan di desain baru)

### Warna
| Peran | Hex | Variabel asli | Dipakai untuk |
|---|---|---|---|
| Primary | `#EF4D48` | `ast-global-color-0` | Tombol utama, aksen judul, link, garis |
| Primary dark | `#D90700` | `ast-global-color-1` | Menu aktif/hover, bar copyright footer |
| Heading | `#2B161B` | `ast-global-color-2` | Judul (coklat-hitam) |
| Body text | `#453E3E` | `ast-global-color-3` | Teks paragraf |
| Background soft | `#F7F3F5` | `ast-global-color-4` | Latar section terang |
| White | `#FFFFFF` | `ast-global-color-5` | Latar utama |
| Black | `#000000` | `ast-global-color-6` | Header dan footer |
| Gray | `#4B4F58` | `ast-global-color-7` | Teks sekunder |
| Gray light | `#F6F7F8` | `ast-global-color-8` | Latar alternatif |
| WhatsApp | `#128C7E` | — | Tombol "Hubungi via WhatsApp" di halaman produk |

### Font (Google Fonts)
| Font | Weight | Dipakai untuk |
|---|---|---|
| **Racing Sans One** | 400 | Judul / display, umumnya UPPERCASE |
| **Montserrat** | 400, 500, 700 | Teks utama (body 16px/500), tombol |
| **Inter** | 400, 600, 700 | Menu navigasi (16px/600 uppercase), sebagian paragraf |

Roboto dan Roboto Slab ikut termuat karena bawaan Elementor, tapi hampir tidak dipakai. Tidak perlu dibawa ke desain baru.

### Tombol
Latar `#EF4D48`, teks putih, sudut 0 (kotak), padding 17px 38px, Montserrat 500 16px UPPERCASE.

## Struktur situs saat ini
- **Menu:** Home · Koleksi · Showroom · Tentang Kami · Kontak Kami
- **Beranda:** slider hero (8 banner promo) → "Apa kelebihan kendaraan listrik?" (4 poin) → "Apa kelebihan Auto EV?" (Showroom, Sales, Sparepart, Service) → feed Instagram → Testimoni (Google Review via Trustindex) → Koleksi Artikel → footer
- **Koleksi:** 13 merek, masing-masing punya halaman `/koleksi/<merek>/`
- **Produk:** 122 produk. 62 punya harga (Rp 3,7–15 juta), 60 tanpa harga (beli lewat WhatsApp). 68 punya spesifikasi lengkap: Kapasitas Baterai, Jarak Tempuh, Kecepatan Max, Beban Max, Durasi Charger.
- **Auto EVers:** halaman komunitas (foto kegiatan, artikel)
- **Artikel:** 14 post (Feb–Sep 2023)
- **Kontak:** telepon/WA +62 877-3841-7771, autoev.id@gmail.com, marketingautoev@gmail.com, Rukan Golf Island Blok I No 27-28, PIK 14460, Google Maps
- **Sosial:** Instagram @autoev.indonesia, TikTok @auto_ev

### Merek & jumlah produk
| Merek | Produk | Ada harga | Rentang harga |
|---|---|---|---|
| EXOTIC | 28 | 6 | Rp 4,8–9,8 jt |
| UWINFLY | 18 | 9 | Rp 4,1–9,5 jt |
| GODA | 18 | 14 | Rp 4,3–9,0 jt |
| GENIO | 13 | 5 | Rp 4,6–5,8 jt |
| OFERO | 9 | 4 | Rp 5,0–7,4 jt |
| PACIFIC | 8 | 6 | Rp 6,4–10,9 jt |
| SELIS | 7 | 4 | Rp 5,4–15,0 jt |
| UOU | 6 | 6 | Rp 4,0–11,0 jt |
| MEVI | 5 | 2 | Rp 3,7–5,3 jt |
| UNITED | 4 | 4 | Rp 6,5–7,1 jt |
| VIAR | 2 | 2 | Rp 5,3–7,5 jt |
| SEVENBOT | 2 | 0 | — |
| RUBICK | 2 | 0 | — |

## Catatan untuk perencanaan desain
1. **Jam operasional tidak konsisten.** Footer dan halaman Kontak menulis Senin–Sabtu 08:00–17:00, sedangkan deskripsi produk menulis Senin–Jumat 09:00–20:00.
2. **Halaman Showroom** hanya berisi iframe dari pihak ketiga (locatestore.com). Daftar lokasi showroom tidak ada di situs, jadi perlu data dari tim.
3. **Halaman Compare** kosong. Fitur perbandingan berasal dari plugin dan hanya berisi data setelah pengunjung memilih produk.
4. **60 produk tanpa harga dan 54 produk tanpa deskripsi.** Perlu diputuskan: tetap pakai alur "tanya via WhatsApp", atau harga dilengkapi.
5. **Tag produk** isinya sama dengan merek, dan beberapa salah (UOU US3 diberi tag "VIAR").
6. **Banner hero** berupa gambar dengan teks di dalamnya (webp). Di desain baru sebaiknya teksnya dijadikan HTML supaya responsif dan terbaca mesin pencari.
7. **Logo** yang ada di media library hanya versi putih (`2023/08/AUTOEV-LOGO-PUTIH-TAG*.png`, ±9000px, untuk latar gelap) dan ikon persegi 512px (`2023/07/Logo-Auto-EV.png`, `2023/08/Tumbnail-Auto-EV.png`). Kalau desain baru butuh logo di latar terang, perlu file versi gelap, idealnya SVG, dari tim.
8. Copyright footer masih "2022–2024", dan artikel terakhir dari September 2023.

## Menjalankan ulang
```bash
node scraper/1-api.js      # dump API
node scraper/2-crawl.js    # crawl HTML + products.json + site.json
node scraper/3-images.js   # unduh gambar
node scraper/4-design.js   # screenshot + design tokens
```
HTML mentah tersimpan di `scraper/cache/`, jadi menjalankan ulang langkah 2 tidak mengunduh ulang halaman.
