// Configuration loaded from config.js
const SERVER_ADDRESS = CONFIG.SERVER_ADDRESS;
const SONGS_CACHE_VERSION = CONFIG.SONGS_CACHE_VERSION;

let currentTrack = new Audio();
currentTrack.volume = 1;
let currentPlayingElement = null; // Track which playlist item is currently playing
let songs = [];
let originalSongs = [];
let globalSongsCache = [];
let currFolder = "";
let currentSongIndex = 0;
let isShuffleMode = false;
let isGlobalShuffle = false;
let isGlobalCacheLoaded = false;
let allSongsCache = []; // For search functionality

// ========== UTILITY FUNCTIONS ==========

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${mins}:${secs}`;
}

// Client-side Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ========== LOCALSTORAGE FUNCTIONS ==========

function saveSongsToCache(songsData) {
    try {
        const cacheData = {
            version: SONGS_CACHE_VERSION,
            timestamp: Date.now(),
            songs: songsData
        };
        localStorage.setItem('spotifySongsCache', JSON.stringify(cacheData));
        console.log(`✅ Saved ${songsData.length} songs to localStorage`);
        return true;
    } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
        return false;
    }
}

function loadSongsFromCache() {
    try {
        const cached = localStorage.getItem('spotifySongsCache');
        if (!cached) return null;
        
        const cacheData = JSON.parse(cached);
        
        // Check version
        if (cacheData.version !== SONGS_CACHE_VERSION) {
            console.log('⚠️ Cache version mismatch, will refresh');
            localStorage.removeItem('spotifySongsCache');
            return null;
        }
        
        console.log(`✅ Loaded ${cacheData.songs.length} songs from localStorage cache`);
        return cacheData.songs;
    } catch (error) {
        console.error('❌ Failed to load from localStorage:', error);
        return null;
    }
}

// ========== PLAYLIST ICON MANAGEMENT ==========

function resetAllPlaylistIcons() {
    Array.from(document.querySelectorAll(".playlist ul li")).forEach(item => {
        const playIcon = item.getElementsByTagName("img")[1];
        if (playIcon) {
            playIcon.src = "assets/images/play.svg";
        }
        item.classList.remove("playing");
    });
}

function updatePlaylistIcon(element, isPlaying) {
    const playIcon = element.getElementsByTagName("img")[1];
    if (playIcon) {
        playIcon.src = isPlaying ? "assets/images/pause.svg" : "assets/images/play.svg";
    }
    
    if (isPlaying) {
        element.classList.add("playing");
    } else {
        element.classList.remove("playing");
    }
}

// ========== PLAYBACK FUNCTIONS ==========

function playMusic(track, playlistElement) {
    console.log("playMusic called with track:", track);
    
    resetAllPlaylistIcons();
    currentPlayingElement = playlistElement;
    
    if (currentPlayingElement) {
        updatePlaylistIcon(currentPlayingElement, true);
    }

    currentTrack.src = track;
    
    // Don't autoplay - just load the track
    // User must click play button to start playback
    currentTrack.load();
    
    // Update Now Playing UI (cover, title, artist)
    const leftInfo = document.querySelector(".controls .left-info");
    const coverImg = leftInfo.querySelector(".sng-img");
    const titleEl = leftInfo.querySelector(".song-info .song-name");
    const artistEl = leftInfo.querySelector(".song-info .artist-name");

    // Derive playlist folder and cover path
    let songPath = track.split("/songs/")[1];
    let displayName = "Unknown Track";
    let playlistFolder = "Unknown Artist";
    let coverUrl = "assets/images/music.svg";
    
    if (songPath) {
        let decodedSongPath = decodeURIComponent(songPath);
        let pathParts = decodedSongPath.split("/");
        let fileName = pathParts.pop();
        playlistFolder = pathParts.join("/");
        displayName = fileName.replace(/\.mp3$/i, "");

        // Set cover image from playlist folder
        if (playlistFolder) {
            coverUrl = `${SERVER_ADDRESS}/songs/${encodeURIComponent(playlistFolder)}/cover.jpg`;
            
            coverImg.onerror = function(){
                coverImg.onerror = null;
                coverImg.src = "assets/images/music.svg";
            };
            coverImg.src = coverUrl;
        }

        titleEl.textContent = displayName.replaceAll("%20", " ");
        artistEl.textContent = playlistFolder.replaceAll("%20", " ") || "Unknown Artist";
    }

    // Keep play button as play icon (user must click to start)
    const play = document.getElementById("play");
    if (play) {
        play.src = "assets/images/play.svg";
    }

    // Update current song index
    currentSongIndex = songs.findIndex(song => song.url === track);
    if (currentSongIndex === -1) currentSongIndex = 0;
    
    // Update Media Session metadata for notification controls
    updateMediaSession(displayName, playlistFolder, coverUrl);
}

// Update Media Session API for mobile notification controls
function updateMediaSession(title, artist, artwork) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || 'Unknown Track',
            artist: artist || 'Unknown Artist',
            artwork: [
                { src: artwork || 'assets/images/music.svg', sizes: '512x512', type: 'image/jpg' }
            ]
        });
    }
}

function handleSongEnd() {
    console.log("Song ended, playing next...");
    if (songs && songs.length > 0) {
        let nextIndex = (currentSongIndex + 1) % songs.length;
        
        // Find corresponding playlist element
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = null;
        
        let songPath = songs[nextIndex].url.split("/songs/")[1];
        let targetSongName;
        if (songPath && songPath.includes("/")) {
            targetSongName = songPath.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        } else if (songPath) {
            targetSongName = songPath.replaceAll("%20", " ").replaceAll(".mp3", "");
        } else {
            targetSongName = songs[nextIndex].url.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        }
        
        playlistElements.forEach(el => {
            let songName = el.querySelector("span").innerHTML;
            if (songName === targetSongName) {
                targetElement = el;
            }
        });
        
        playMusic(songs[nextIndex].url, targetElement);
    }
}

// ========== PLAYLIST & SONGS DISPLAY ==========

function updatePlaylistDisplay() {
    let songUL = document.querySelector(".playlist ul");
    songUL.innerHTML = "";

    for (let song of songs) {
        const songName = song.title.replaceAll("%20", " ").replaceAll(".mp3", "");
        songUL.innerHTML += `
            <li>
                <img src="assets/images/music.svg" alt="Music">
                <span>${songName}</span>
                <img src="assets/images/play.svg" alt="Play">
            </li>`;
    }

    // Attach event listeners to play songs
    document.querySelectorAll(".playlist ul li").forEach((element, index) => {
        element.addEventListener("click", () => {
            playMusic(songs[index].url, element);
        });
    });
}

async function displayPlaylists() {
    console.log("Fetching playlists...");
    let response = await fetch(`${SERVER_ADDRESS}/api/playlists`);
    let playlists = await response.json();
    let cardContainer = document.getElementById("playlists");

    cardContainer.innerHTML = "";

    for (let playlist of playlists) {
        let metadataResponse = await fetch(`${SERVER_ADDRESS}/api/songs/${playlist}`);
        let metadata = await metadataResponse.json();

        let description = 'No metadata found';

        if (metadata.metadata) {
            try {
                const metaResponse = await fetch(metadata.metadata);
                const metaDataJson = await metaResponse.json();
                description = metaDataJson.description || description;
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        }

        const card = document.createElement("div");
        card.classList.add("plistcard");
        card.innerHTML = `
            <img src="${metadata.cover || 'assets/images/music.svg'}" 
                 alt="${playlist}" 
                 onerror="this.src='assets/images/music.svg'">
            <p>${playlist.replaceAll("%20", " ")}</p>
            <span class="play-btn"><img src="assets/images/play.svg" alt="Play"></span>
        `;

        cardContainer.appendChild(card);
        
        card.addEventListener("click", async () => {
            console.log("Loading playlist:", playlist);
            
            // Disable global shuffle when selecting specific playlist
            if (isGlobalShuffle) {
                isGlobalShuffle = false;
                const globalShuffleBtn = document.getElementById("globalShuffle");
                if (globalShuffleBtn) {
                    globalShuffleBtn.classList.remove("active");
                    globalShuffleBtn.innerHTML = `
                        <img src="assets/images/shuffle.svg" class="invert" alt="Shuffle All">
                        Shuffle All
                    `;
                }
            }
            
            await getSongs(playlist);
            if (songs.length > 0) playMusic(songs[0].url);
        });
    }
    
    // Initialize scroll indicators after content loaded
    initScrollIndicators();
}

async function getSongs(folder) {
    currFolder = folder;
    let response = await fetch(`${SERVER_ADDRESS}/api/songs/${folder}`);
    let data = await response.json();

    originalSongs = data.songs;
    songs = [...originalSongs];

    updatePlaylistDisplay();
    return songs;
}

// ========== GLOBAL SHUFFLE & CACHE ==========

async function fetchAllSongsForCache() {
    try {
        console.log("🔄 Fetching all songs for cache...");
        
        let response = await fetch(`${SERVER_ADDRESS}/api/songs/global/shuffle`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        
        if (data.songs && Array.isArray(data.songs)) {
            allSongsCache = [...data.songs];
            globalSongsCache = [...data.songs];
            isGlobalCacheLoaded = true;
            
            // Save to localStorage
            saveSongsToCache(data.songs);
            
            console.log(`✅ Cached ${allSongsCache.length} songs for search and shuffle`);
            
            // Update global shuffle button tooltip
            const globalShuffleBtn = document.getElementById("globalShuffle");
            if (globalShuffleBtn) {
                globalShuffleBtn.title = `⚡ Instant Shuffle All (${allSongsCache.length} songs ready)`;
            }
            
            return true;
        } else {
            console.warn("⚠️ Invalid songs data received");
            return false;
        }
    } catch (error) {
        console.error("❌ Failed to fetch all songs:", error);
        isGlobalCacheLoaded = false;
        return false;
    }
}

function activateGlobalShuffle() {
    if (!isGlobalCacheLoaded || globalSongsCache.length === 0) {
        console.warn("⚠️ Global cache not ready");
        return false;
    }
    
    const shuffledGlobalSongs = shuffleArray(globalSongsCache);
    
    originalSongs = [...shuffledGlobalSongs];
    songs = [...shuffledGlobalSongs];
    currFolder = "All Songs (Shuffled)";
    
    updatePlaylistDisplay();
    
    console.log(`⚡ Global shuffle activated with ${songs.length} songs`);
    return true;
}

// ========== SEARCH FUNCTIONALITY ==========

function performSearch(query) {
    if (!query || query.trim() === "") {
        // If search is empty, return to default state
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    // Search through cached songs
    const searchResults = allSongsCache.filter(song => {
        const songTitle = song.title.toLowerCase().replaceAll("%20", " ");
        const playlistName = (song.playlist || "").toLowerCase().replaceAll("%20", " ");
        return songTitle.includes(searchTerm) || playlistName.includes(searchTerm);
    });
    
    if (searchResults.length > 0) {
        // Update current songs with search results
        originalSongs = [...searchResults];
        songs = [...searchResults];
        currFolder = `Search: "${query}"`;
        
        updatePlaylistDisplay();
        
        console.log(`🔍 Found ${searchResults.length} results for "${query}"`);
    } else {
        console.log(`🔍 No results found for "${query}"`);
        // Could show a "no results" message here
    }
}

// ========== UI CONTROLS ==========

function initScrollIndicators() {
    const cardsContainers = document.querySelectorAll('.cards-container');
    
    cardsContainers.forEach(cardsContainer => {
        const plistcards = cardsContainer.querySelector('.plistcards');
        const leftIndicator = cardsContainer.querySelector('.left-indicator');
        const rightIndicator = cardsContainer.querySelector('.right-indicator');
        
        if (!plistcards || !leftIndicator || !rightIndicator) return;
        
        // Remove existing listeners
        const newLeftIndicator = leftIndicator.cloneNode(true);
        const newRightIndicator = rightIndicator.cloneNode(true);
        leftIndicator.parentNode.replaceChild(newLeftIndicator, leftIndicator);
        rightIndicator.parentNode.replaceChild(newRightIndicator, rightIndicator);
        
        function updateIndicators() {
            const scrollLeft = plistcards.scrollLeft;
            const maxScroll = plistcards.scrollWidth - plistcards.clientWidth;
            
            if (scrollLeft <= 10) {
                newLeftIndicator.classList.add('hidden');
            } else {
                newLeftIndicator.classList.remove('hidden');
            }
            
            if (scrollLeft >= maxScroll - 10) {
                newRightIndicator.classList.add('hidden');
            } else {
                newRightIndicator.classList.remove('hidden');
            }
        }
        
        function scrollLeftFunc() {
            const cardWidth = 160;
            plistcards.scrollBy({
                left: -cardWidth * 2,
                behavior: 'smooth'
            });
        }
        
        function scrollRightFunc() {
            const cardWidth = 160;
            plistcards.scrollBy({
                left: cardWidth * 2,
                behavior: 'smooth'
            });
        }
        
        newLeftIndicator.addEventListener('click', scrollLeftFunc);
        newRightIndicator.addEventListener('click', scrollRightFunc);
        plistcards.addEventListener('scroll', updateIndicators);
        
        updateIndicators();
    });
}

// ========== MAIN INITIALIZATION ==========

async function main() {
    // Try to load from cache first
    const cachedSongs = loadSongsFromCache();
    if (cachedSongs && cachedSongs.length > 0) {
        allSongsCache = cachedSongs;
        globalSongsCache = cachedSongs;
        isGlobalCacheLoaded = true;
        console.log(`⚡ Using cached songs (${cachedSongs.length} songs)`);
        
        const globalShuffleBtn = document.getElementById("globalShuffle");
        if (globalShuffleBtn) {
            globalShuffleBtn.title = `⚡ Instant Shuffle All (${cachedSongs.length} songs ready)`;
        }
    }
    
    // Display playlists
    await displayPlaylists();
    
    // Load default playlist
    const playlists = await (await fetch(`${SERVER_ADDRESS}/api/playlists`)).json();
    if (playlists.length > 0) {
        await getSongs(playlists[0]);
        if (songs.length > 0) playMusic(songs[0].url);
    }
    
    // Fetch all songs in background (update cache if needed)
    if (!cachedSongs) {
        fetchAllSongsForCache();
    } else {
        // Refresh cache in background
        setTimeout(() => {
            fetchAllSongsForCache();
        }, 5000);
    }

    // UI  Elements
    const play = document.getElementById("play");
    const playBtn = document.getElementById("play-btn");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const globalShuffleBtn = document.getElementById("globalShuffle");
    const searchInput = document.getElementById("searchInput");

    // Search functionality
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 500); // Debounce search by 500ms
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch(e.target.value);
        }
    });

    // Global Shuffle
    globalShuffleBtn.addEventListener("click", async () => {
        isGlobalShuffle = !isGlobalShuffle;
        globalShuffleBtn.classList.toggle("active", isGlobalShuffle);
        
        if (isGlobalShuffle) {
            console.log("Enabling global shuffle...");
            globalShuffleBtn.innerHTML = `
                <img src="assets/images/shuffle.svg" class="invert" alt="Stop Shuffle">
                Stop Shuffle
            `;
            
            if (activateGlobalShuffle()) {
                if (songs.length > 0) {
                    playMusic(songs[0].url);
                }
            } else {
                console.log("Cache not ready, fetching...");
                await fetchAllSongsForCache();
                if (activateGlobalShuffle() && songs.length > 0) {
                    playMusic(songs[0].url);
                }
            }
        } else {
            console.log("Disabling global shuffle...");
            globalShuffleBtn.innerHTML = `
                <img src="assets/images/shuffle.svg" class="invert" alt="Shuffle All">
                Shuffle All
            `;
            
            // Return to first playlist
            const playlists = await (await fetch(`${SERVER_ADDRESS}/api/playlists`)).json();
            if (playlists.length > 0) {
                await getSongs(playlists[0]);
                if (songs.length > 0) playMusic(songs[0].url);
            }
        }
    });

    // Play/Pause
    playBtn.addEventListener("click", () => {
        if (currentTrack.paused) {
            currentTrack.play();
            play.src = "assets/images/pause.svg";
            if (currentPlayingElement) {
                updatePlaylistIcon(currentPlayingElement, true);
            }
        } else {
            currentTrack.pause();
            play.src = "assets/images/play.svg";
            if (currentPlayingElement) {
                updatePlaylistIcon(currentPlayingElement, false);
            }
        }
    });

    // Previous
    const prevTrack = () => {
        if (!songs || songs.length === 0) return;
        
        let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = playlistElements[prevIndex] || null;
        
        playMusic(songs[prevIndex].url, targetElement);
        // Auto-play when using next/prev buttons
        if (currentTrack.paused) {
            currentTrack.play().then(() => {
                document.getElementById("play").src = "assets/images/pause.svg";
            });
        }
    };
    
    prev.addEventListener("click", prevTrack);

    // Next
    const nextTrack = () => {
        if (!songs || songs.length === 0) return;
        
        let nextIndex = (currentSongIndex + 1) % songs.length;
        
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = playlistElements[nextIndex] || null;
        
        playMusic(songs[nextIndex].url, targetElement);
        // Auto-play when using next/prev buttons
        if (currentTrack.paused) {
            currentTrack.play().then(() => {
                document.getElementById("play").src = "assets/images/pause.svg";
            });
        }
    };
    
    next.addEventListener("click", nextTrack);

    // Auto-play next song
    currentTrack.removeEventListener('ended', handleSongEnd);
    currentTrack.addEventListener('ended', handleSongEnd);
    
    // Setup Media Session action handlers for mobile notifications
    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', () => {
            currentTrack.play();
            document.getElementById("play").src = "assets/images/pause.svg";
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            currentTrack.pause();
            document.getElementById("play").src = "assets/images/play.svg";
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
        
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            currentTrack.currentTime = Math.max(currentTrack.currentTime - (details.seekOffset || 10), 0);
        });
        
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            currentTrack.currentTime = Math.min(currentTrack.currentTime + (details.seekOffset || 10), currentTrack.duration);
        });
    }

    // Time update
    currentTrack.addEventListener('timeupdate', () => {
        const times = document.querySelectorAll(".seekbar .time");
        if (times.length >= 2) {
            times[0].innerHTML = formatTime(currentTrack.currentTime);
            times[1].innerHTML = formatTime(currentTrack.duration);
        }
        
        // Update progress bar
        if (!isNaN(currentTrack.duration) && isFinite(currentTrack.duration)) {
            const pct = (currentTrack.currentTime / currentTrack.duration) * 100;
            const progressBar = document.querySelector(".progress-bar");
            const progressContainer = document.querySelector(".progress-container");
            
            if (progressBar && (!progressContainer || !progressContainer.classList.contains("dragging"))) {
                progressBar.style.width = `${pct}%`;
            }
        }
    });

    // Seekbar: click and drag support
    const progressContainer = document.querySelector(".progress-container");
    const progressBar = document.querySelector(".progress-bar");
    let isSeeking = false;

    function updateSeekFromClientX(clientX) {
        const rect = progressContainer.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.min(Math.max(percent, 0), 1);
        
        progressBar.style.width = `${percent * 100}%`;
        if (!isNaN(currentTrack.duration) && isFinite(currentTrack.duration)) {
            currentTrack.currentTime = percent * currentTrack.duration;
        }
    }

    progressContainer.addEventListener("click", (e) => {
        updateSeekFromClientX(e.clientX);
    });

    progressContainer.addEventListener("mousedown", (e) => {
        isSeeking = true;
        progressContainer.classList.add("dragging");
        updateSeekFromClientX(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
        if (!isSeeking) return;
        updateSeekFromClientX(e.clientX);
    });

    window.addEventListener("mouseup", () => {
        if (!isSeeking) return;
        isSeeking = false;
        progressContainer.classList.remove("dragging");
    });

    // Volume control
    const volumeContainer = document.querySelector(".volume-container");
    const volumeBar = document.querySelector(".volume");
    volumeBar.style.width = "100%";
    let isAdjustingVolume = false;

    function updateVolumeFromClientX(clientX) {
        const rect = volumeContainer.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.min(Math.max(percent, 0), 1);
        
        volumeBar.style.width = `${percent * 100}%`;
        currentTrack.volume = percent;
    }

    volumeContainer.addEventListener("click", (e) => {
        updateVolumeFromClientX(e.clientX);
    });

    volumeContainer.addEventListener("mousedown", (e) => {
        isAdjustingVolume = true;
        volumeContainer.classList.add("dragging");
        updateVolumeFromClientX(e.clientX);
    });

    window.addEventListener("mousemove", (e) => {
        if (!isAdjustingVolume) return;
        updateVolumeFromClientX(e.clientX);
    });

    window.addEventListener("mouseup", () => {
        if (!isAdjustingVolume) return;
        isAdjustingVolume = false;
        volumeContainer.classList.remove("dragging");
    });

    // Hamburger menu
    const hamburgerBtn = document.querySelector(".plist .right .sec span:first-child");
    const library = document.querySelector(".plist .left");
    const plistContainer = document.querySelector(".plist");
    const cancelBtn = document.querySelector(".plist .left h4 img");
    
    function toggleLibrary() {
        library.classList.toggle("show");
        plistContainer.classList.toggle("library-open");
    }
    
    function closeLibrary() {
        library.classList.remove("show");
        plistContainer.classList.remove("library-open");
    }
    
    hamburgerBtn.addEventListener("click", toggleLibrary);
    
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeLibrary);
    }
    
    plistContainer.addEventListener("click", (e) => {
        if (e.target === plistContainer && library.classList.contains("show")) {
            closeLibrary();
        }
    });
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && library.classList.contains("show")) {
            closeLibrary();
        }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        // Don't trigger if typing in search
        if (e.target === searchInput) return;
        
        if (e.key === " ") {
            e.preventDefault();
            playBtn.click();
        }
        
        if (e.key === "ArrowRight") {
            currentTrack.currentTime = Math.min(currentTrack.currentTime + 5, currentTrack.duration);
        }
        
        if (e.key === "ArrowLeft") {
            currentTrack.currentTime = Math.max(currentTrack.currentTime - 5, 0);
        }
        
        if (e.key === "ArrowUp") {
            currentTrack.volume = Math.min(currentTrack.volume + 0.1, 1);
            volumeBar.style.width = `${currentTrack.volume * 100}%`;
        }
        
        if (e.key === "ArrowDown") {
            currentTrack.volume = Math.max(currentTrack.volume - 0.1, 0);
            volumeBar.style.width = `${currentTrack.volume * 100}%`;
        }
    });
}

// Start the application
main();
