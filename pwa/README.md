# POS UMKM PWA

Folder ini adalah aplikasi PWA yang membungkus Web App Google Apps Script.

1. Buka `index.html` dan ganti `APPS_SCRIPT_URL` dengan URL deployment Apps Script terbaru.
2. Upload seluruh isi folder `pwa` ke hosting HTTPS seperti GitHub Pages, Vercel, atau Cloudflare Pages.
3. Buka URL hosting tersebut lewat Chrome Android.
4. Pilih **Install app** atau **Tambahkan ke layar utama**.

PWA membutuhkan HTTPS. Jangan membuka `index.html` langsung dari file manager karena service worker tidak aktif pada `file://`.
