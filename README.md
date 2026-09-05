# POS UMKM PWA

Folder ini adalah aplikasi PWA yang membungkus Web App Google Apps Script.

1. Buka `index.html` dan ganti `APPS_SCRIPT_URL` dengan URL deployment Apps Script terbaru.
2. Upload seluruh isi folder `pwa` ke hosting HTTPS seperti GitHub Pages, Vercel, atau Cloudflare Pages.
3. Buka URL hosting tersebut lewat Chrome Android.
4. Pilih **Install app** atau **Tambahkan ke layar utama**.

PWA membutuhkan HTTPS. Jangan membuka `index.html` langsung dari file manager karena service worker tidak aktif pada `file://`.

## Update aplikasi

Setelah mengubah aplikasi, upload ulang file ke URL hosting yang sama. Service worker akan mengecek versi baru saat aplikasi dibuka kembali, saat jendela mendapat fokus, dan setiap 5 menit. Jika versi baru ditemukan, aplikasi akan memuat ulang otomatis; pengguna tidak perlu menerima link baru atau mengunduh ulang aplikasi.

Saat online, dokumen aplikasi Google Apps Script yang terakhir dibuka juga disimpan sebagai cadangan. Saat offline, tampilan terakhir tersebut dapat dibuka kembali dari cache. Fitur yang membaca atau menyimpan data ke Google tetap membutuhkan internet dan belum dapat disinkronkan secara offline.

## Tombol Back dan swipe

PWA sudah mengirim pesan `APP_BACK` ketika pengguna menekan tombol Back atau melakukan swipe kembali. Agar menu di dalam Google Apps Script ikut kembali ke halaman sebelumnya, tambahkan listener berikut pada HTML Apps Script:

```javascript
window.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'APP_BACK') {
		window.history.back();
	}
});
```

Listener ini harus dipasang pada halaman HTML yang berjalan di dalam iframe. Tanpa perubahan tersebut, halaman pembungkus tidak dapat mengakses history Google Apps Script karena berbeda domain.

Jangan mengganti URL hosting saat melakukan update. Untuk perubahan besar pada file statis, naikkan `CACHE_NAME` di `sw.js` agar cache lama ikut dibersihkan.
