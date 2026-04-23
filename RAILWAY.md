# Deploy Jeysenn ke Railway

## 1. Push project ke GitHub
- Pastikan folder `jeysenn-laravel-realtime` sudah di repository GitHub.

## 2. Buat service di Railway
1. Login ke Railway.
2. Klik `New Project` -> `Deploy from GitHub repo`.
3. Pilih repository kamu.

## 3. Tambah database MySQL
1. Di project Railway, klik `New` -> `Database` -> `MySQL`.
2. Railway akan otomatis kasih variabel `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`.

## 4. Set environment variables (service Laravel)
Isi variable ini di service web:

```env
APP_NAME=Jeysenn
APP_ENV=production
APP_DEBUG=false
APP_URL=https://<domain-kamu>.up.railway.app
APP_KEY=base64:...

DB_CONNECTION=mysql
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_DATABASE=${{MYSQLDATABASE}}
DB_USERNAME=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=public
SESSION_SECURE_COOKIE=true
```

Catatan:
- Untuk `APP_KEY`, generate lokal pakai `php artisan key:generate --show`, lalu paste hasilnya ke Railway.
- `FILESYSTEM_DISK=public` supaya upload file gallery / playlist tersimpan di disk app.

## 5. Deploy command
Project ini sudah disiapkan dengan:
- `Procfile`
- `railway-start.sh`

Railway akan menjalankan:
- migrate otomatis
- cache config/route/view
- start app di `0.0.0.0:$PORT`

## 6. Setelah deploy
1. Buka app URL Railway.
2. Test CRUD message/gallery/playlist.
3. Buka di 2 browser (normal + incognito) untuk cek realtime sync.

## 7. Penting soal upload file
Railway filesystem bersifat ephemeral. Artinya file upload bisa hilang saat redeploy/restart.

Supaya permanen, langkah berikutnya:
1. Pakai object storage (Cloudflare R2 / S3).
2. Set `FILESYSTEM_DISK=s3`.
3. Isi env AWS/S3 credentials.

Jika belum setup S3, app tetap jalan, tapi file upload tidak tahan lama.
