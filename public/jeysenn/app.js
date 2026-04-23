const API_BASE = "/api";
const FILE_LIMITS = { image: 5, video: 20, audio: 10 };
const COLOR_GRADIENTS = {
    pink: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
    purple: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    blue: "linear-gradient(135deg, #89f7fe, #66a6ff)",
    green: "linear-gradient(135deg, #96fbc4, #f9f586)",
    orange: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    rainbow: "linear-gradient(135deg, #f093fb, #f5576c, #ffd86f, #4facfe)",
};

let isOnline = navigator.onLine;
let streamConnected = false;
let syncVersion = "";
let syncStream = null;
let fallbackInterval = null;
let reconnectTimer = null;
let activeRequests = 0;

let messagesData = [];
let selectedStickers = ["💕"];
let selectedColor = "pink";
let currentViewMsgIndex = null;

let galleryData = [];
let currentGalleryFile = null;
let currentGalleryIndex = null;

let playlistData = [];
let audioPlayer = null;
let currentSongIndex = -1;
let isPlaying = false;
let currentSongFile = null;

function updateConnectionStatus() {
    const statusEl = document.getElementById("connectionStatus");
    if (!statusEl) return;

    if (isOnline && streamConnected && activeRequests === 0) {
        statusEl.innerHTML = "🟢 Online";
        statusEl.classList.remove("offline", "syncing");
    } else if (isOnline) {
        statusEl.innerHTML = "🟡 Sync...";
        statusEl.classList.add("syncing");
        statusEl.classList.remove("offline");
    } else {
        statusEl.innerHTML = "🔴 Offline";
        statusEl.classList.add("offline");
        statusEl.classList.remove("syncing");
    }
}

window.addEventListener("online", () => {
    isOnline = true;
    updateConnectionStatus();
    showToast("Koneksi kembali!", "🔌");
    refreshAll();
});

window.addEventListener("offline", () => {
    isOnline = false;
    updateConnectionStatus();
    showToast("Kamu offline sementara", "🔌");
});

function apiFetch(path, options = {}) {
    activeRequests += 1;
    updateConnectionStatus();
    return fetch(`${API_BASE}${path}`, options)
        .then(async (response) => {
            if (!response.ok) {
                let message = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        message = errorData.message;
                    }
                    if (errorData.errors) {
                        const firstKey = Object.keys(errorData.errors)[0];
                        if (firstKey && errorData.errors[firstKey][0]) {
                            message = errorData.errors[firstKey][0];
                        }
                    }
                } catch (_e) {
                    // keep default message
                }
                throw new Error(message);
            }

            if (response.status === 204) return null;
            return response.json();
        })
        .finally(() => {
            activeRequests = Math.max(0, activeRequests - 1);
            updateConnectionStatus();
        });
}

function escapeHtml(unsafe) {
    return (unsafe || "")
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>");
}

function getTimeStamp(dateString) {
    if (!dateString) return "Baru saja";
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function showToast(message, icon = "✅") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("toast-out");
        setTimeout(() => toast.remove(), 300);
    }, 2600);
}

function initFloatingHearts() {
    const container = document.getElementById("floatingHearts");
    if (!container) return;

    const emojis = ["💕", "💖", "💗", "💓", "💝", "🌸", "✨", "🦋", "💌", "🧸"];
    function spawnHeart() {
        const heart = document.createElement("span");
        heart.className = "heart-particle";
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.fontSize = `${14 + Math.random() * 18}px`;
        heart.style.animationDuration = `${8 + Math.random() * 12}s`;
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 22000);
    }
    for (let i = 0; i < 8; i += 1) setTimeout(spawnHeart, i * 500);
    setInterval(spawnHeart, 2500);
}

function showSection(sectionId) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    let pageElementId = "pageLanding";
    if (sectionId === "messages") pageElementId = "pageMessages";
    if (sectionId === "gallery") pageElementId = "pageGallery";
    if (sectionId === "playlist") pageElementId = "pagePlaylist";
    const targetPage = document.getElementById(pageElementId);
    if (targetPage) {
        targetPage.classList.add("active");
        window.scrollTo(0, 0);
    }
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (id === "modalViewGallery") {
        const container = document.getElementById("modalMediaContainer");
        container.innerHTML = "";
    }
}

function initModals() {
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closeModal(overlay.id);
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal-overlay.active").forEach((modal) => closeModal(modal.id));
        }
    });
}

function showUploadOverlay(text = "Mengupload... 💕") {
    document.getElementById("uploadText").textContent = text;
    document.getElementById("uploadPercent").textContent = "Sedang diproses...";
    document.getElementById("uploadProgressFill").style.width = "65%";
    document.getElementById("uploadOverlay").style.display = "flex";
}

function hideUploadOverlay() {
    document.getElementById("uploadOverlay").style.display = "none";
}

function validateFileSize(file, type) {
    const maxSizeMB = FILE_LIMITS[type] || 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        showToast(`File terlalu besar! Max ${maxSizeMB}MB`, "❌");
        return false;
    }
    return true;
}

function setButtonLoading(button, isLoading, loadingText = "Memproses...") {
    if (!button) return;
    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = loadingText;
        button.disabled = true;
        button.style.opacity = "0.7";
        button.style.pointerEvents = "none";
        return;
    }
    button.innerHTML = button.dataset.originalText || button.innerHTML;
    button.disabled = false;
    button.style.opacity = "";
    button.style.pointerEvents = "";
}

function renderMessages() {
    const grid = document.getElementById("msgGrid");
    const empty = document.getElementById("messagesEmpty");
    if (messagesData.length === 0) {
        grid.innerHTML = "";
        empty.classList.add("show");
        return;
    }
    empty.classList.remove("show");
    grid.innerHTML = "";

    messagesData.forEach((msg, index) => {
        const card = document.createElement("div");
        card.className = "envelope-card";
        card.style.background = COLOR_GRADIENTS[msg.color] || COLOR_GRADIENTS.pink;
        card.style.animationDelay = `${(index % 10) * 0.1}s`;

        const stickers = Array.isArray(msg.stickers) && msg.stickers.length ? msg.stickers : ["💌"];
        card.innerHTML = `
            <button class="del-btn" onclick="deleteMessage(${msg.id}, event)" title="Hapus">✕</button>
            <div class="envelope-icon">${stickers[0]}</div>
            <div class="envelope-label">Buka Surat 💕</div>
        `;
        card.onclick = (event) => {
            if (!event.target.classList.contains("del-btn")) openMsgModal(index);
        };
        grid.appendChild(card);
    });
}

async function loadMessages() {
    messagesData = await apiFetch("/messages");
    renderMessages();
}

function openMsgModal(index) {
    const msg = messagesData[index];
    currentViewMsgIndex = index;
    const bg = COLOR_GRADIENTS[msg.color] || COLOR_GRADIENTS.pink;
    const stickersArr = Array.isArray(msg.stickers) && msg.stickers.length ? msg.stickers : ["💕"];
    document.getElementById("modalMsgText").innerHTML = escapeHtml(msg.text);
    document.querySelector("#modalViewMessage .modal-view-message").style.background = bg;
    document.getElementById("viewMsgBigSticker").textContent = stickersArr[Math.floor(Math.random() * stickersArr.length)];
    openModal("modalViewMessage");
}

async function addMessage() {
    const input = document.getElementById("msgInput");
    const text = input.value.trim();
    const submitBtn = document.querySelector('button[onclick="addMessage()"]');
    if (!text) {
        showToast("Isi pesannya dulu...", "❌");
        return;
    }
    if (text.length > 1000) {
        showToast("Pesan maksimal 1000 karakter", "❌");
        return;
    }
    if (selectedStickers.length === 0) {
        showToast("Pilih minimal 1 stiker", "⚠️");
        return;
    }

    setButtonLoading(submitBtn, true, "Mengirim...");
    try {
        const created = await apiFetch("/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, stickers: selectedStickers, color: selectedColor }),
        });
        messagesData.unshift(created);
        renderMessages();
        showToast("Pesan berhasil dikirim!", "💌");
        input.value = "";
        closeModal("modalAddMessage");
    } catch (error) {
        showToast(error.message || "Gagal kirim pesan", "❌");
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

async function deleteMessage(id, event) {
    if (event) event.stopPropagation();
    if (!confirm("Hapus surat ini?")) return;
    try {
        await apiFetch(`/messages/${id}`, { method: "DELETE" });
        messagesData = messagesData.filter((message) => message.id !== id);
        renderMessages();
        showToast("Pesan dihapus", "🗑️");
        closeModal("modalViewMessage");
    } catch (error) {
        showToast(error.message || "Gagal hapus pesan", "❌");
    }
}

function initMessages() {
    document.getElementById("btnAddMessage").addEventListener("click", () => {
        document.getElementById("msgInput").value = "";
        selectedStickers = ["💕"];
        selectedColor = "pink";
        document.querySelectorAll("#stickerPicker .sticker-option").forEach((b) => {
            b.classList.toggle("selected", b.getAttribute("data-sticker") === "💕");
        });
        document.querySelectorAll("#colorPicker .color-option").forEach((b) => {
            b.classList.toggle("selected", b.getAttribute("data-color") === "pink");
        });
        openModal("modalAddMessage");
    });

    document.querySelectorAll("#stickerPicker .sticker-option").forEach((btn) => {
        btn.addEventListener("click", () => {
            const sticker = btn.getAttribute("data-sticker");
            if (btn.classList.contains("selected")) {
                if (selectedStickers.length > 1) {
                    selectedStickers = selectedStickers.filter((s) => s !== sticker);
                    btn.classList.remove("selected");
                }
            } else {
                selectedStickers.push(sticker);
                btn.classList.add("selected");
            }
        });
    });

    document.querySelectorAll("#colorPicker .color-option").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#colorPicker .color-option").forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedColor = btn.getAttribute("data-color");
        });
    });

    document.getElementById("btnDeleteMsgFromModal").addEventListener("click", async () => {
        if (currentViewMsgIndex === null) return;
        await deleteMessage(messagesData[currentViewMsgIndex].id, null);
    });
}

function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    const empty = document.getElementById("galleryEmpty");
    if (galleryData.length === 0) {
        grid.innerHTML = "";
        empty.classList.add("show");
        return;
    }
    empty.classList.remove("show");
    grid.innerHTML = galleryData.map((item, index) => {
        const isVideo = item.type.startsWith("video");
        return `
            <div class="gallery-card" style="animation-delay:${(index % 10) * 0.1}s" onclick="openGalleryModal(${index})">
                <div class="gallery-card-media-container">
                    ${isVideo
                        ? `<video class="gallery-card-media" src="${item.url}" muted preload="metadata"></video>
                           <span class="video-badge">🎬 Video</span>
                           <div class="play-overlay">▶️</div>`
                        : `<img class="gallery-card-media" src="${item.url}" alt="Memory" loading="lazy">`
                    }
                </div>
                <div class="gallery-card-info">
                    <div class="gallery-card-caption">${escapeHtml(item.caption || "✨ Kenangan Indah ✨")}</div>
                    <div class="gallery-card-timestamp">📅 Abadi pada: ${getTimeStamp(item.created_at)}</div>
                </div>
                <button class="gallery-del-btn" onclick="deleteGallery(${item.id}, event)" title="Hapus">✕</button>
            </div>
        `;
    }).join("");
}

async function loadGallery() {
    galleryData = await apiFetch("/galleries");
    renderGallery();
}

function resetGalleryPreview() {
    currentGalleryFile = null;
    document.getElementById("mediaInput").value = "";
    document.getElementById("galleryUploadArea").style.display = "block";
    document.getElementById("galleryPreview").style.display = "none";
    document.getElementById("galleryPreviewImg").src = "";
    document.getElementById("galleryPreviewVid").src = "";
}

async function addMedia() {
    const submitBtn = document.querySelector('button[onclick="addMedia()"]');
    const captionInput = document.getElementById("mediaCaption");
    const caption = captionInput.value.trim();
    if (!currentGalleryFile) {
        showToast("Pilih foto atau video dulu", "⚠️");
        return;
    }
    if (caption.length > 500) {
        showToast("Caption maksimal 500 karakter", "❌");
        return;
    }

    showUploadOverlay("Mengupload Kenangan... 📸");
    setButtonLoading(submitBtn, true, "Menyimpan...");
    try {
        const formData = new FormData();
        formData.append("file", currentGalleryFile);
        formData.append("caption", caption);
        const created = await apiFetch("/galleries", { method: "POST", body: formData });
        galleryData.unshift(created);
        renderGallery();
        showToast("Kenangan baru ditambahkan!", "📸");
        resetGalleryPreview();
        closeModal("modalAddGallery");
    } catch (error) {
        showToast(error.message || "Gagal upload kenangan", "❌");
    } finally {
        hideUploadOverlay();
        setButtonLoading(submitBtn, false);
    }
}

async function deleteGallery(id, event) {
    if (event) event.stopPropagation();
    if (!confirm("Hapus kenangan ini?")) return;
    try {
        await apiFetch(`/galleries/${id}`, { method: "DELETE" });
        galleryData = galleryData.filter((item) => item.id !== id);
        renderGallery();
        showToast("Kenangan dihapus", "🗑️");
        closeModal("modalViewGallery");
    } catch (error) {
        showToast(error.message || "Gagal hapus kenangan", "❌");
    }
}

function openGalleryModal(index) {
    const item = galleryData[index];
    currentGalleryIndex = index;
    const container = document.getElementById("modalMediaContainer");
    container.innerHTML = item.type.startsWith("video")
        ? `<video src="${item.url}" controls autoplay></video>`
        : `<img src="${item.url}" alt="full">`;

    document.getElementById("modalMediaCaption").innerText = item.caption || "✨ Kenangan Indah ✨";
    document.getElementById("modalMediaTime").innerText = `Abadi pada: ${getTimeStamp(item.created_at)}`;
    document.getElementById("btnDeleteGallery").onclick = (event) => deleteGallery(item.id, event);
    document.getElementById("btnEditGallery").onclick = async () => {
        const newCaption = prompt("Edit caption:", item.caption || "");
        if (newCaption === null) return;
        if (newCaption.trim().length > 500) {
            showToast("Caption maksimal 500 karakter", "❌");
            return;
        }
        try {
            await apiFetch(`/galleries/${item.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ caption: newCaption.trim() }),
            });
            showToast("Caption diperbarui", "✏️");
            await loadGallery();
            const newIndex = galleryData.findIndex((g) => g.id === item.id);
            if (newIndex >= 0) openGalleryModal(newIndex);
        } catch (error) {
            showToast(error.message || "Gagal update caption", "❌");
        }
    };
    openModal("modalViewGallery");
}

function initGallery() {
    const btnAdd = document.getElementById("btnAddGallery");
    const fileInput = document.getElementById("mediaInput");
    const uploadArea = document.getElementById("galleryUploadArea");
    const preview = document.getElementById("galleryPreview");
    const previewImg = document.getElementById("galleryPreviewImg");
    const previewVid = document.getElementById("galleryPreviewVid");

    btnAdd.addEventListener("click", () => {
        document.getElementById("mediaCaption").value = "";
        resetGalleryPreview();
        openModal("modalAddGallery");
    });

    uploadArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        const isImage = file.type.startsWith("image");
        const isVideo = file.type.startsWith("video");
        if (!isImage && !isVideo) {
            showToast("Hanya foto/video yang didukung", "❌");
            fileInput.value = "";
            return;
        }
        if (!validateFileSize(file, isImage ? "image" : "video")) {
            fileInput.value = "";
            return;
        }

        currentGalleryFile = file;
        const url = URL.createObjectURL(file);
        uploadArea.style.display = "none";
        preview.style.display = "block";

        if (isVideo) {
            previewImg.style.display = "none";
            previewVid.style.display = "block";
            previewVid.src = url;
        } else {
            previewVid.style.display = "none";
            previewImg.style.display = "block";
            previewImg.src = url;
        }
    });

    document.getElementById("galleryPreviewRemove").addEventListener("click", resetGalleryPreview);
}

function renderPlaylist() {
    const list = document.getElementById("playlistGrid");
    const empty = document.getElementById("playlistEmpty");
    const playerUI = document.getElementById("musicPlayer");

    if (playlistData.length === 0) {
        list.innerHTML = "";
        empty.classList.add("show");
        playerUI.style.display = "none";
        return;
    }

    empty.classList.remove("show");
    playerUI.style.display = "block";
    list.innerHTML = playlistData.map((song, i) => `
        <div class="playlist-item ${i === currentSongIndex ? "active" : ""}" onclick="playSong(${i})" style="animation-delay:${(i % 10) * 0.08}s">
            <span class="playlist-item-num">${i === currentSongIndex && isPlaying ? "🎵" : i + 1}</span>
            <div class="playlist-item-icon">${i === currentSongIndex && isPlaying ? "🎶" : "🎵"}</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${escapeHtml(song.name)}</div>
                <div class="playlist-item-artist">Our special playlist</div>
            </div>
            <div class="playlist-item-actions">
                <button class="playlist-item-btn" onclick="deleteSong(${song.id}, event)" title="Hapus">🗑️</button>
            </div>
        </div>
    `).join("");
}

async function loadPlaylist() {
    const keepSongId = currentSongIndex >= 0 ? playlistData[currentSongIndex]?.id : null;
    playlistData = await apiFetch("/playlists");
    if (keepSongId) {
        const newIndex = playlistData.findIndex((song) => song.id === keepSongId);
        if (newIndex >= 0) currentSongIndex = newIndex;
        else currentSongIndex = -1;
    }
    renderPlaylist();
}

async function addSong() {
    const nameInput = document.getElementById("songName");
    const submitBtn = document.querySelector('button[onclick="addSong()"]');
    const songName = nameInput.value.trim();
    if (!currentSongFile || !nameInput.value.trim()) {
        showToast("Pilih file lagu dan isi judul", "⚠️");
        return;
    }
    if (songName.length > 100) {
        showToast("Judul lagu maksimal 100 karakter", "❌");
        return;
    }

    showUploadOverlay("Mengupload Lagu... 🎵");
    setButtonLoading(submitBtn, true, "Menambah...");
    try {
        const formData = new FormData();
        formData.append("file", currentSongFile);
        formData.append("name", songName);
        const created = await apiFetch("/playlists", { method: "POST", body: formData });
        playlistData.push(created);
        renderPlaylist();
        showToast("Lagu ditambahkan!", "🎵");
        document.getElementById("songName").value = "";
        resetSongPreview();
        closeModal("modalAddSong");
    } catch (error) {
        showToast(error.message || "Gagal tambah lagu", "❌");
    } finally {
        hideUploadOverlay();
        setButtonLoading(submitBtn, false);
    }
}

async function deleteSong(id, event) {
    if (event) event.stopPropagation();
    if (!confirm("Hapus lagu ini dari playlist?")) return;

    const index = playlistData.findIndex((song) => song.id === id);
    if (index === currentSongIndex) {
        audioPlayer.pause();
        audioPlayer.src = "";
        isPlaying = false;
        currentSongIndex = -1;
        document.getElementById("playerTitle").textContent = "No Song Playing";
        document.getElementById("btnPlay").textContent = "▶️";
        document.getElementById("vinylDisc").classList.remove("spinning");
    } else if (index < currentSongIndex) {
        currentSongIndex -= 1;
    }

    try {
        await apiFetch(`/playlists/${id}`, { method: "DELETE" });
        playlistData = playlistData.filter((song) => song.id !== id);
        renderPlaylist();
        showToast("Lagu dihapus", "🗑️");
    } catch (error) {
        showToast(error.message || "Gagal hapus lagu", "❌");
    }
}

function playSong(index) {
    const song = playlistData[index];
    if (!song) return;
    currentSongIndex = index;
    audioPlayer.src = song.url;
    audioPlayer.play().catch(() => {});
    isPlaying = true;
    document.getElementById("playerTitle").textContent = song.name;
    document.getElementById("btnPlay").textContent = "⏸️";
    document.getElementById("vinylDisc").classList.add("spinning");
    renderPlaylist();
}

function togglePlay() {
    if (!audioPlayer.src) return;
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        document.getElementById("btnPlay").textContent = "▶️";
        document.getElementById("vinylDisc").classList.remove("spinning");
    } else {
        audioPlayer.play().catch(() => {});
        isPlaying = true;
        document.getElementById("btnPlay").textContent = "⏸️";
        document.getElementById("vinylDisc").classList.add("spinning");
    }
    renderPlaylist();
}

function formatTime(seconds) {
    if (Number.isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function resetSongPreview() {
    currentSongFile = null;
    document.getElementById("audioInput").value = "";
    document.getElementById("songUploadArea").style.display = "block";
    document.getElementById("songFileSelected").style.display = "none";
}

function initPlaylist() {
    audioPlayer = document.getElementById("mainAudio");
    const fileInput = document.getElementById("audioInput");
    const uploadArea = document.getElementById("songUploadArea");
    const fileSelected = document.getElementById("songFileSelected");
    const fileName = document.getElementById("songFileName");

    document.getElementById("btnAddSong").addEventListener("click", () => {
        document.getElementById("songName").value = "";
        resetSongPreview();
        openModal("modalAddSong");
    });

    uploadArea.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (!file.type.startsWith("audio")) {
            showToast("Hanya file audio", "❌");
            fileInput.value = "";
            return;
        }
        if (!validateFileSize(file, "audio")) {
            fileInput.value = "";
            return;
        }
        currentSongFile = file;
        fileName.textContent = file.name;
        uploadArea.style.display = "none";
        fileSelected.style.display = "flex";
        if (!document.getElementById("songName").value) {
            document.getElementById("songName").value = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        }
    });

    document.getElementById("songFileRemove").addEventListener("click", resetSongPreview);
    document.getElementById("btnPlay").addEventListener("click", () => {
        if (currentSongIndex === -1 && playlistData.length > 0) playSong(0);
        else togglePlay();
    });
    document.getElementById("btnNext").addEventListener("click", () => {
        if (!playlistData.length) return;
        playSong((currentSongIndex + 1) % playlistData.length);
    });
    document.getElementById("btnPrev").addEventListener("click", () => {
        if (!playlistData.length) return;
        playSong((currentSongIndex - 1 + playlistData.length) % playlistData.length);
    });
    document.getElementById("progressBar").addEventListener("input", (event) => {
        if (!Number.isNaN(audioPlayer.duration)) {
            audioPlayer.currentTime = (event.target.value / 100) * audioPlayer.duration;
        }
    });

    audioPlayer.addEventListener("timeupdate", () => {
        if (!Number.isNaN(audioPlayer.duration)) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            document.getElementById("progressBar").value = progress;
            document.getElementById("currentTime").textContent = formatTime(audioPlayer.currentTime);
            document.getElementById("totalTime").textContent = formatTime(audioPlayer.duration);
        }
    });
    audioPlayer.addEventListener("ended", () => {
        if (playlistData.length) playSong((currentSongIndex + 1) % playlistData.length);
    });
}

async function refreshAll() {
    try {
        await Promise.all([loadMessages(), loadGallery(), loadPlaylist()]);
        streamConnected = true;
        updateConnectionStatus();
    } catch (error) {
        streamConnected = false;
        updateConnectionStatus();
        console.error(error);
    }
}

function startFallbackPolling() {
    if (fallbackInterval) return;
    fallbackInterval = setInterval(refreshAll, 2000);
}

function stopFallbackPolling() {
    if (!fallbackInterval) return;
    clearInterval(fallbackInterval);
    fallbackInterval = null;
}

function connectRealtimeStream() {
    if (!window.EventSource) {
        startFallbackPolling();
        return;
    }

    const streamUrl = syncVersion ? `/realtime/changes?since=${encodeURIComponent(syncVersion)}` : "/realtime/changes";
    syncStream = new EventSource(streamUrl);

    syncStream.addEventListener("sync", async (event) => {
        const payload = JSON.parse(event.data);
        syncVersion = payload.version || syncVersion;
        await refreshAll();
    });

    syncStream.addEventListener("ping", () => {
        streamConnected = true;
        updateConnectionStatus();
    });

    syncStream.onerror = () => {
        streamConnected = false;
        updateConnectionStatus();
        if (syncStream) syncStream.close();
        startFallbackPolling();
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            stopFallbackPolling();
            connectRealtimeStream();
        }, 2500);
    };
}

window.addEventListener("load", async () => {
    initFloatingHearts();
    initModals();
    initMessages();
    initGallery();
    initPlaylist();
    showSection("landing");
    updateConnectionStatus();
    await refreshAll();
    connectRealtimeStream();
});
