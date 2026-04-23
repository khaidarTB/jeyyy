# 🎉 Jeysenn Laravel 12 + MySQL Realtime Setup

Selamat! Jeysenn versi **Laravel 12 dengan MySQL** sudah selesai! Ini adalah upgrade dari Firebase ke MySQL realtime dengan polling realtime. 

## 📊 Struktur Project

```
jeysenn-laravel-realtime/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── MessageController.php      # API untuk messages
│   │   ├── GalleryController.php      # API untuk gallery
│   │   └── PlaylistController.php     # API untuk playlist
│   └── Models/
│       ├── Message.php
│       ├── Gallery.php
│       └── Playlist.php
├── database/
│   ├── migrations/
│   │   ├── create_messages_table.php
│   │   ├── create_galleries_table.php
│   │   └── create_playlists_table.php
│   └── seeders/
├── resources/views/
│   └── jeysenn.blade.php             # Main UI (all-in-one)
├── routes/
│   ├── api.php                       # API routes
│   └── web.php                       # Web routes
├── storage/app/public/               # File uploads (gallery, playlist)
└── .env                              # Environment config

```

## 🚀 Features

### 1. **Pesan Rahasia** 💌
- REST API untuk CRUD messages
- MySQL database storage
- Auto-refresh setiap 3 detik (polling)
- Color picker (pink, purple, blue, green)

### 2. **Galeri Kenangan** 📸
- File upload ke `storage/app/public/gallery`
- Support foto (jpg, png) dan video (mp4, webm)
- Max 20 MB per file
- Caption & timestamp otomatis

### 3. **Playlist Cinta** 🎵
- Audio file upload ke `storage/app/public/playlist`
- Support MP3, WAV, OGG, M4A
- Max 10 MB per file
- HTML5 audio player built-in

## 📋 API Endpoints

### Messages
```
GET    /api/messages              # List all messages
POST   /api/messages              # Create message
GET    /api/messages/{id}         # Get message detail
PUT    /api/messages/{id}         # Update message
DELETE /api/messages/{id}         # Delete message
```

**POST /api/messages** payload:
```json
{
  "text": "Pesan teks...",
  "color": "pink",
  "stickers": ["💕", "🌸"]
}
```

### Gallery
```
GET    /api/galleries             # List all gallery items
POST   /api/galleries             # Upload photo/video (multipart/form-data)
GET    /api/galleries/{id}        # Get gallery item
PUT    /api/galleries/{id}        # Update caption
DELETE /api/galleries/{id}        # Delete item
```

**POST /api/galleries** form data:
```
file:     <binary file>
caption:  "Deskripsi kenangan..." (optional)
```

### Playlist
```
GET    /api/playlists            # List all songs
POST   /api/playlists            # Upload audio (multipart/form-data)
GET    /api/playlists/{id}       # Get song detail
PUT    /api/playlists/{id}       # Update name
DELETE /api/playlists/{id}       # Delete song
```

**POST /api/playlists** form data:
```
file:  <binary audio file>
name:  "Nama Lagu"
```

## 🔄 Realtime Polling

Frontend menggunakan **auto-refresh setiap 3 detik** untuk fetch data terbaru:

```javascript
// Auto-refresh realtime (polling)
setInterval(() => {
    const activeTab = document.querySelector('.section.active').id.split('-')[0];
    loadData(activeTab);
}, 3000); // Reload setiap 3 detik
```

Ini adalah polling sederhana tapi effective untuk kasus penggunaan ini.

## ✨ Untuk Realtime Lebih Advanced (Opsional)

Jika ingin **true WebSocket realtime** tanpa polling, bisa upgrade ke:

### Option 1: **Laravel Reverb** (WebSocket)
```bash
php artisan install:broadcasting
composer require laravel/reverb
php artisan reverb:install
npm install
npm run dev
php artisan queue:work
```

### Option 2: **Redis Broadcast**
```bash
composer require predis/predis
# Edit .env: BROADCAST_DRIVER=redis
```

Tapi untuk sekarang, polling 3 detik sudah bagus-bagus saja untuk user experience.

## 🗄️ Database Schema

### messages table
```sql
CREATE TABLE messages (
    id BIGINT PRIMARY KEY,
    text TEXT NOT NULL,
    stickers JSON DEFAULT '[]',
    color VARCHAR(50) DEFAULT 'pink',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### galleries table
```sql
CREATE TABLE galleries (
    id BIGINT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    caption TEXT NULLABLE,
    filename VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### playlists table
```sql
CREATE TABLE playlists (
    id BIGINT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🎯 Quick Start

### 1. Setup done ✅
```bash
cd /home/kai/projects/jeysenn-laravel-realtime
php artisan migrate         # Already done! ✓
php artisan storage:link    # Already done! ✓
```

### 2. Start Server
```bash
php artisan serve --port=8001
# Akses: http://localhost:8001
```

### 3. Test Features
- Buka http://localhost:8001 di browser
- Buka 2 tab yang berbeda
- Kirim pesan di Tab 1 → lihat auto-update di Tab 2 dalam 3 detik! ✨

## 🛠️ Konfigurasi

### Database (.env)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jeysenn
DB_USERNAME=root
DB_PASSWORD=
```

### File Storage
Files disimpan di `storage/app/public/`:
- Gallery: `storage/app/public/gallery/`
- Playlist: `storage/app/public/playlist/`

Accessible via: `http://localhost:8001/storage/gallery/...`

## 📱 Frontend Architecture

### All-in-One Blade Template
File: `resources/views/jeysenn.blade.php`

- Single-page application dengan 3 tabs
- Vanilla JavaScript (no framework dependencies)
- Automatic polling setiap 3 detik
- Responsive design dengan CSS Grid
- Toast notifications

### JavaScript API Calls
```javascript
// Fetch dari API
const resp = await fetch(`/api/messages`);
const data = await resp.json();

// POST dengan JSON
fetch(`/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '...', color: 'pink' })
});

// POST dengan FormData (file upload)
const formData = new FormData();
formData.append('file', file);
formData.append('caption', 'text');
fetch(`/api/galleries`, {
    method: 'POST',
    body: formData
});
```

## 🚨 Troubleshooting

### Q: File upload tidak bisa?
**A:** 
- Check folder `storage/app/public/` exists
- Pastikan storage link sudah di-setup: `php artisan storage:link`
- Check file size (max 20MB untuk gallery, 10MB untuk playlist)

### Q: Data tidak appear?
**A:**
- Open DevTools (F12) → Network tab
- Check API response dari `/api/messages`, `/api/galleries`, `/api/playlists`
- Check Console untuk error messages

### Q: Auto-refresh tidak jalan?
**A:**
- Check browser console untuk JavaScript errors
- Verify API endpoints accessible (test di Postman)
- Check network tab untuk 3-second polling requests

### Q: Database error?
**A:**
- Run `php artisan migrate`
- Check `.env` database credentials
- Ensure MySQL server is running

## 📦 Dependencies

Sudah included di `composer.json`:
- Laravel 12.x
- Eloquent ORM
- Laravel migrations

Frontend:
- Vanilla JavaScript (no dependencies)
- Modern CSS Grid & Flexbox
- HTML5 Audio/Video

## ✅ Production Checklist

Sebelum deploy ke production:

- [ ] Set `APP_DEBUG=false` di .env
- [ ] Run `composer install --optimize-autoloader --no-dev`
- [ ] Generate new APP_KEY: `php artisan key:generate`
- [ ] Run migrations: `php artisan migrate`
- [ ] Setup storage link: `php artisan storage:link`
- [ ] Configure proper database (not SQLite)
- [ ] Setup file permissions (750 for storage/)
- [ ] Use HTTPS
- [ ] Configure CORS jika API call dari domain lain
- [ ] Setup proper error logging
- [ ] Enable caching: `php artisan config:cache`

## 🎯 Upgrade Path (Optional)

Kalau mau lebih advanced later:

1. **Add Authentication** → Login sistem
2. **WebSocket Realtime** → Laravel Reverb atau Redis
3. **API Rate Limiting** → Prevent spam
4. **File Processing** → Image resize, video compress
5. **Search & Filter** → Full-text search
6. **Sharing Feature** → Public links
7. **Analytics** → Track usage

## 🎉 Done!

**Jeysenn Laravel 12 version sudah ready to use** dengan:
- ✅ MySQL database
- ✅ REST API
- ✅ Auto-realtime polling setiap 3 detik
- ✅ File upload (gallery + playlist)
- ✅ Beautiful UI
- ✅ Production-ready code

### Akses:
🌐 **http://localhost:8001**

### Bandingkan dengan Firebase version:
| Feature | Firebase | Laravel |
|---------|----------|---------|
| Database | Firestore | MySQL |
| Realtime | WebSocket | Polling |
| File Storage | Google Cloud | Local filesystem |
| Scalability | Cloud auto-scale | Custom server |
| Cost | Pay-per-use | Fixed hosting |
| Control | Limited | Full control |

**Enjoy! 💕**
