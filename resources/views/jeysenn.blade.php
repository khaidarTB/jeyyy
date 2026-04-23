<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kedarr & Seena</title>
    <meta name="description"
        content="Website lucu dan interaktif bertema pink — pesan, galeri kenangan, dan playlist lagu favorit 💕">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('jeysenn/style.css') }}">

    <!-- PWA Support -->
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="theme-color" content="#ec4899">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Kedarr & Seena">
    <link rel="apple-touch-icon" href="{{ asset('jeysenn/icons/icon-192.png') }}">
    <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('jeysenn/icons/icon-192.png') }}">
    <link rel="icon" type="image/png" sizes="512x512" href="{{ asset('jeysenn/icons/icon-512.png') }}">
</head>

<body>
    <!-- Connection Status Indicator -->
    <div id="connectionStatus" class="connection-status">🟢 Online</div>

    <!-- Floating Hearts Background -->
    <div class="floating-hearts" id="floatingHearts"></div>

    <!-- ==================== PAGE: HOME (Landing) ==================== -->
    <div class="page active" id="pageLanding">
        <div class="home-container">
            <div class="home-emoji-float">🧸</div>
            <h1 class="home-title">
                <span class="sparkle">✨</span>
                Halo Sayang!
                <span class="sparkle">✨</span>
            </h1>
            <p class="home-subtitle">Selamat datang di dunia kecil kita. Aku buat ini khusus buat kamu 💕</p>
            <div class="home-buttons">
                <button class="home-btn" onclick="showSection('messages')">
                    <div class="home-btn-icon">💌</div>
                    <div class="home-btn-text">
                        <h3>Pesan Rahasia</h3>
                        <p>Kirim pesan lucu & anonymous!</p>
                    </div>
                    <span class="home-btn-arrow">→</span>
                </button>
                <button class="home-btn" onclick="showSection('gallery')">
                    <div class="home-btn-icon">📸</div>
                    <div class="home-btn-text">
                        <h3>Galeri Kenangan</h3>
                        <p>Simpan momen terindah kita!</p>
                    </div>
                    <span class="home-btn-arrow">→</span>
                </button>
                <button class="home-btn" onclick="showSection('playlist')">
                    <div class="home-btn-icon">🎵</div>
                    <div class="home-btn-text">
                        <h3>Playlist Kita</h3>
                        <p>Lagu-lagu favorit bersama!</p>
                    </div>
                    <span class="home-btn-arrow">→</span>
                </button>
            </div>
            <p class="home-footer-text">Made with 💕 for my special one — © 2026 🧸</p>
        </div>
    </div>

    <!-- ==================== PAGE: MESSAGES ==================== -->
    <div class="page" id="pageMessages">
        <div class="page-inner">
            <button class="back-btn" onclick="showSection('landing')">
                <span>←</span> Kembali
            </button>
            <div class="section-header">
                <h2 class="section-title">💌 Pesan Rahasia</h2>
                <p class="section-desc">Kirim pesan anonymous kayak NGL! Tulis apa aja, kita baca bareng~ 🥰</p>
                <button class="btn-primary btn-cute" id="btnAddMessage">
                    <span>✏️</span> Tulis Pesan Baru
                </button>
            </div>
            <div class="messages-grid" id="msgGrid"></div>
            <div class="empty-state" id="messagesEmpty">
                <div class="empty-emoji">💌</div>
                <p>Belum ada surat cinta. Mulai tulis dong! 💌</p>
            </div>
        </div>
    </div>

    <!-- ==================== PAGE: GALLERY ==================== -->
    <div class="page" id="pageGallery">
        <div class="page-inner">
            <button class="back-btn" onclick="showSection('landing')">
                <span>←</span> Kembali
            </button>
            <div class="section-header">
                <h2 class="section-title">📸 Galeri Kenangan</h2>
                <p class="section-desc">Kumpulan foto & video momen terindah kita berdua 🥰</p>
                <button class="btn-primary btn-cute" id="btnAddGallery">
                    <span>➕</span> Tambah Kenangan
                </button>
            </div>
            <div class="gallery-grid" id="galleryGrid"></div>
            <div class="empty-state" id="galleryEmpty">
                <div class="empty-emoji">📷</div>
                <p>Belum ada kenangan. Share foto atau video mu dong! 📸</p>
            </div>
        </div>
    </div>

    <!-- ==================== PAGE: PLAYLIST ==================== -->
    <div class="page" id="pagePlaylist">
        <div class="page-inner">
            <button class="back-btn" onclick="showSection('landing')">
                <span>←</span> Kembali
            </button>
            <div class="section-header">
                <h2 class="section-title">🎵 Playlist Kita</h2>
                <p class="section-desc">Lagu-lagu yang nemenin hari-hari kita~ 🎶</p>
                <button class="btn-primary btn-cute" id="btnAddSong">
                    <span>🎧</span> Tambah Lagu
                </button>
            </div>

            <!-- Music Player -->
            <div class="music-player" id="musicPlayer" style="display:none;">
                <div class="player-vinyl">
                    <div class="vinyl-disc" id="vinylDisc">
                        <div class="vinyl-center">🎵</div>
                    </div>
                </div>
                <div class="player-info">
                    <h3 class="player-title" id="playerTitle">No Song Playing</h3>
                    <p class="player-artist" id="playerArtist">—</p>
                </div>
                <div class="player-progress">
                    <input type="range" class="progress-bar" id="progressBar" min="0" max="100" value="0" step="0.1">
                    <div class="player-time">
                        <span id="currentTime">0:00</span>
                        <span id="totalTime">0:00</span>
                    </div>
                </div>
                <div class="player-controls">
                    <button class="player-btn" id="btnPrev" title="Previous">⏮️</button>
                    <button class="player-btn player-btn-play" id="btnPlay" title="Play/Pause">▶️</button>
                    <button class="player-btn" id="btnNext" title="Next">⏭️</button>
                </div>
            </div>

            <div class="playlist-list" id="playlistGrid"></div>
            <div class="empty-state" id="playlistEmpty">
                <div class="empty-emoji">🎧</div>
                <p>Belum ada lagu. Tambahin dong!</p>
            </div>
        </div>
    </div>

    <!-- ==================== MODALS ==================== -->

    <!-- Add Message Modal -->
    <div class="modal-overlay" id="modalAddMessage">
        <div class="modal cute-modal">
            <div class="modal-stickers modal-stickers-top">💕 🌸 ✨ 🦋 🧸</div>
            <button class="modal-close" onclick="closeModal('modalAddMessage')">✕</button>
            <h3 class="modal-title">💌 Tulis Pesan Rahasia</h3>
            <form id="formAddMessage" onsubmit="return false;">
                <div class="form-group">
                    <label class="form-label">Pesannya apa nih? 💭</label>
                    <textarea class="form-input form-textarea" id="msgInput"
                        placeholder="Tulis pesan rahasia buat aku di sini..." required></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Pilih stiker buat modalnya! (Bisa banyak) 🎨</label>
                    <div class="sticker-picker" id="stickerPicker">
                        <button type="button" class="sticker-option selected" data-sticker="💕">💕</button>
                        <button type="button" class="sticker-option" data-sticker="🧸">🧸</button>
                        <button type="button" class="sticker-option" data-sticker="🌸">🌸</button>
                        <button type="button" class="sticker-option" data-sticker="🦋">🦋</button>
                        <button type="button" class="sticker-option" data-sticker="🐻">🐻</button>
                        <button type="button" class="sticker-option" data-sticker="🎀">🎀</button>
                        <button type="button" class="sticker-option" data-sticker="🍓">🍓</button>
                        <button type="button" class="sticker-option" data-sticker="🌈">🌈</button>
                        <button type="button" class="sticker-option" data-sticker="⭐">⭐</button>
                        <button type="button" class="sticker-option" data-sticker="🎪">🎪</button>
                        <button type="button" class="sticker-option" data-sticker="🍰">🍰</button>
                        <button type="button" class="sticker-option" data-sticker="🐱">🐱</button>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Pilih warna latar modal 🎨</label>
                    <div class="color-picker" id="colorPicker">
                        <button type="button" class="color-option selected" data-color="pink"
                            style="background: linear-gradient(135deg, #ff9a9e, #fad0c4)"></button>
                        <button type="button" class="color-option" data-color="purple"
                            style="background: linear-gradient(135deg, #a18cd1, #fbc2eb)"></button>
                        <button type="button" class="color-option" data-color="blue"
                            style="background: linear-gradient(135deg, #89f7fe, #66a6ff)"></button>
                        <button type="button" class="color-option" data-color="green"
                            style="background: linear-gradient(135deg, #96fbc4, #f9f586)"></button>
                        <button type="button" class="color-option" data-color="orange"
                            style="background: linear-gradient(135deg, #ffecd2, #fcb69f)"></button>
                        <button type="button" class="color-option" data-color="rainbow"
                            style="background: linear-gradient(135deg, #f093fb, #f5576c, #ffd86f, #4facfe)"></button>
                    </div>
                </div>
                <button type="button" class="btn-primary btn-cute btn-full" onclick="addMessage()">💌 Kirim
                    Pesan!</button>
            </form>
            <div class="modal-stickers modal-stickers-bottom">🌺 💖 🎀 🐱 🍰</div>
        </div>
    </div>

    <!-- View Message Modal -->
    <div class="modal-overlay" id="modalViewMessage">
        <div class="modal cute-modal modal-view-message">
            <div id="modalStickerParticles" class="modal-sticker-particles"></div>
            <button class="modal-close" onclick="closeModal('modalViewMessage')">✕</button>
            <div class="modal-letter-header">
                <span class="letter-icon">💌</span>
                <div>
                    <h3 class="modal-title" style="text-align:left;margin-bottom:0;">Pesan untukmu 💕</h3>
                </div>
            </div>
            <div class="modal-letter-body" id="viewMsgBody">
                <p id="modalMsgText"></p>
            </div>
            <div class="modal-letter-sticker" id="viewMsgBigSticker">💕</div>
            <div class="modal-actions">
                <button class="btn-danger btn-small" id="btnDeleteMsgFromModal">🗑️ Hapus Pesan</button>
            </div>
        </div>
    </div>

    <!-- Add Gallery Modal -->
    <div class="modal-overlay" id="modalAddGallery">
        <div class="modal cute-modal">
            <div class="modal-stickers modal-stickers-top">📸 🌸 ✨ 🦋 💕</div>
            <button class="modal-close" onclick="closeModal('modalAddGallery')">✕</button>
            <h3 class="modal-title">📸 Tambah Kenangan Baru</h3>
            <form id="formAddGallery" onsubmit="return false;">
                <div class="form-group">
                    <label class="form-label">Upload foto atau video 📁</label>
                    <div class="file-upload">
                        <input type="file" id="mediaInput" accept="image/*, video/*">
                        <div class="file-upload-area" id="galleryUploadArea">
                            <span class="file-upload-icon">📁</span>
                            <p>Klik untuk pilih file!</p>
                            <small>Format: JPG, PNG, GIF, MP4, WEBM</small>
                        </div>
                        <div class="file-preview" id="galleryPreview" style="display:none;">
                            <img id="galleryPreviewImg" src="" alt="Preview" style="display:none;">
                            <video id="galleryPreviewVid" src="" style="display:none;" controls></video>
                            <button type="button" class="btn-small btn-danger" id="galleryPreviewRemove">🗑️ Hapus
                                File</button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Caption lucu 💬</label>
                    <input type="text" class="form-input" id="mediaCaption" placeholder="Caption singkat~"
                        maxlength="100">
                </div>
                <input type="hidden" id="galleryEditIndex" value="">
                <button type="button" class="btn-primary btn-cute btn-full" onclick="addMedia()">📸 Simpan
                    Kenangan!</button>
            </form>
            <div class="modal-stickers modal-stickers-bottom">🌺 💖 🎀 📷 ✨</div>
        </div>
    </div>

    <!-- View Gallery Modal (Lightbox) -->
    <div class="modal-overlay" id="modalViewGallery">
        <div class="modal cute-modal modal-lightbox">
            <button class="modal-close" onclick="closeModal('modalViewGallery')">✕</button>
            <div class="lightbox-media" id="modalMediaContainer"></div>
            <div class="lightbox-info">
                <h3 id="modalMediaCaption"></h3>
                <span class="lightbox-timestamp" id="modalMediaTime"></span>
            </div>
            <div class="modal-actions">
                <button class="btn-primary btn-small" id="btnEditGallery">✏️ Edit</button>
                <button class="btn-danger btn-small" id="btnDeleteGallery">🗑️ Hapus</button>
            </div>
        </div>
    </div>

    <!-- Add Song Modal -->
    <div class="modal-overlay" id="modalAddSong">
        <div class="modal cute-modal">
            <div class="modal-stickers modal-stickers-top">🎵 🎶 🎧 🎤 💕</div>
            <button class="modal-close" onclick="closeModal('modalAddSong')">✕</button>
            <h3 class="modal-title">🎵 Tambah Lagu Baru</h3>
            <form id="formAddSong" onsubmit="return false;">
                <div class="form-group">
                    <label class="form-label">Upload file MP3 🎧</label>
                    <div class="file-upload">
                        <input type="file" id="audioInput" accept="audio/mp3, audio/wav, audio/*">
                        <div class="file-upload-area" id="songUploadArea">
                            <span class="file-upload-icon">🎵</span>
                            <p>Klik untuk pilih file MP3!</p>
                            <small>Format: MP3, WAV, OGG</small>
                        </div>
                        <div class="file-selected" id="songFileSelected" style="display:none;">
                            <span>🎵</span>
                            <span id="songFileName">file.mp3</span>
                            <button type="button" class="btn-small btn-danger" id="songFileRemove">✕</button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Judul Lagu 🎤</label>
                    <input type="text" class="form-input" id="songName" placeholder="Judul lagunya apa?" required
                        maxlength="100">
                </div>
                <button type="button" class="btn-primary btn-cute btn-full" onclick="addSong()">🎵 Tambah ke
                    Playlist!</button>
            </form>
            <div class="modal-stickers modal-stickers-bottom">🎶 💖 🎀 🎧 ✨</div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- Audio Element -->
    <audio id="mainAudio"></audio>

    <!-- Upload Loading Overlay -->
    <div class="upload-overlay" id="uploadOverlay" style="display:none;">
        <div class="upload-overlay-content">
            <div class="upload-spinner"></div>
            <p class="upload-text" id="uploadText">Mengupload... 💕</p>
            <div class="upload-progress-bar">
                <div class="upload-progress-fill" id="uploadProgressFill"></div>
            </div>
            <span class="upload-percent" id="uploadPercent">0%</span>
        </div>
    </div>

    <script src="{{ asset('jeysenn/app.js') }}"></script>

    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('💕 Service Worker registered!', reg.scope))
                    .catch(err => console.log('Service Worker registration failed:', err));
            });
        }
    </script>

</body>

</html>
