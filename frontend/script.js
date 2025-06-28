const SERVER_IP = "www.example.com"; // Change this to your server IP
const PORT = 0; // No port needed for external access

let SERVER_ADDRESS;
if (PORT !== 0) {
    SERVER_ADDRESS = `https://${SERVER_IP}:${PORT}`;
} else {
    SERVER_ADDRESS = `https://${SERVER_IP}`;
}

let currentSong = new Audio();
currentSong.volume = 1;
var songs = [];
var originalSongs = [];
var globalSongsCache = [];
var currFolder = "";
let currentSongIndex = 0;
let isShuffleMode = false;
let isGlobalShuffle = false;
let isGlobalCacheLoaded = false;

// Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
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

// Update song list display
function updateSongListDisplay() {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (let song of songs) {
        const playlistName = song.playlist || currFolder;
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="assets/images/music.svg" alt="">
                <div class="info">
                    <div>${song.title.replaceAll("%20", " ")}</div>
                    <div id="artist">${playlistName.replaceAll("%20", " ")}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="assets/images/play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach event listeners to play songs
    document.querySelectorAll(".songList li").forEach((element, index) => {
        element.addEventListener("click", () => playMusic(songs[index].url));
    });
}

// Fetch and display playlists
async function displayAlbums() {
    console.log("Fetching playlists...");
    let response = await fetch(`${SERVER_ADDRESS}/api/playlists`);
    let playlists = await response.json();
    let cardContainer = document.querySelector(".cardContainer");

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

        cardContainer.innerHTML += `
            <div data-folder="${playlist}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <img src="${metadata.cover || 'assets/images/music.svg'}" alt="">
                <h2>${playlist.replaceAll("%20", " ")}</h2>
                <p>${description}</p>
            </div>`;
    }

    // Attach event listener to load songs when playlist is clicked
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async (event) => {
            let folder = event.currentTarget.dataset.folder;
            console.log(`Fetching songs from ${folder}...`);
            
            // Disable global shuffle when selecting a specific playlist
            if (isGlobalShuffle) {
                isGlobalShuffle = false;
                const globalShuffleBtn = document.getElementById("globalShuffle");
                if (globalShuffleBtn) {
                    globalShuffleBtn.classList.remove("active");
                    globalShuffleBtn.innerHTML = `
                        <img src="assets/images/shuffle.svg" alt="Global Shuffle">
                        Shuffle All
                    `;
                }
            }
            
            // Load songs respecting current shuffle mode
            await getSongs(folder, isShuffleMode);
            if (songs.length > 0) playMusic(songs[0].url);
        });
    });
}

// Fetch and display songs from selected playlist
async function getSongs(folder, shuffle = false) {
    currFolder = folder;
    let endpoint = `/api/songs/${folder}`;
    let response = await fetch(`${SERVER_ADDRESS}${endpoint}`);
    let data = await response.json();

    originalSongs = data.songs;
    
    // Apply shuffle if needed
    if (shuffle) {
        songs = shuffleArray(originalSongs);
    } else {
        songs = [...originalSongs];
    }

    updateSongListDisplay();
    return songs;
}

// Fetch and display songs from all playlists (global shuffle)
async function getGlobalShuffledSongs() {
    try {
        console.log(`Fetching global shuffle from: ${SERVER_ADDRESS}/api/songs/global/shuffle`);
        let response = await fetch(`${SERVER_ADDRESS}/api/songs/global/shuffle`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        console.log("Global shuffle response:", data);

        if (!data.songs || !Array.isArray(data.songs)) {
            console.error("Invalid songs data received:", data);
            songs = [];
            originalSongs = [];
            return [];
        }

        originalSongs = [...data.songs];
        songs = [...data.songs];
        currFolder = "All Songs";

        updateSongListDisplay();
        return songs;
    } catch (error) {
        console.error("Error fetching global shuffled songs:", error);
        songs = [];
        originalSongs = [];
        return [];
    }
}

function playMusic(songUrl) {
    currentSong.src = songUrl;
    currentSong.play();
    play.src = "assets/images/pause.svg";
    currentSongIndex = songs.findIndex(song => song.url === songUrl);
    
    // Extract song name and show playlist info for global shuffle
    const songName = decodeURI(songUrl.split("/").pop());
    let displayText = songName;
    
    if (isGlobalShuffle && songs[currentSongIndex] && songs[currentSongIndex].playlist) {
        const playlistName = songs[currentSongIndex].playlist.replaceAll("%20", " ");
        displayText = `${songName} • ${playlistName}`;
    }
    
    document.querySelector(".songinfo").innerHTML = displayText;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


// Play the next song automatically when the current song ends
function playNextSong() {
    let nextIndex = (currentSongIndex + 1) % songs.length;
    playMusic(songs[nextIndex].url);
}

// Function to play the previous song
function playPreviousSong() {
    let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playMusic(songs[prevIndex].url);
}

// Initialize UI
async function main() {
    await displayAlbums();
    await getSongs("Aashiqui");

    if (songs.length > 0) playMusic(songs[0].url);

    const play = document.getElementById("play");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");
    const shuffleBtn = document.getElementById("shuffle");
    const globalShuffleBtn = document.getElementById("globalShuffle");
    
    fetchAllSongsInBackground();

    // Global shuffle functionality
    globalShuffleBtn.addEventListener("click", async () => {
        isGlobalShuffle = !isGlobalShuffle;
        globalShuffleBtn.classList.toggle("active", isGlobalShuffle);
        
        if (isGlobalShuffle) {
            console.log("Enabling global shuffle mode...");
            globalShuffleBtn.innerHTML = `
                <img src="assets/images/shuffle.svg" alt="Global Shuffle">
                Stop Global Shuffle
            `;
            
            // Disable regular shuffle when global shuffle is active
            isShuffleMode = false;
            shuffleBtn.classList.remove("active");
            
            try {
                if (activateGlobalShuffleInstant()) {
                    if (songs.length > 0) {
                        playMusic(songs[0].url);
                    }
                } else {
                    console.log("Cache not ready, fetching from API...");
                    await getGlobalShuffledSongs();
                    if (songs.length > 0) {
                        playMusic(songs[0].url);
                    } else {
                        console.log("No songs found in global shuffle");
                    }
                }
            } catch (error) {
                console.error("Failed to enable global shuffle:", error);
                // Reset button state on error
                isGlobalShuffle = false;
                globalShuffleBtn.classList.remove("active");
                globalShuffleBtn.innerHTML = `
                    <img src="assets/images/shuffle.svg" alt="Global Shuffle">
                    Shuffle All
                `;
            }
        } else {
            console.log("Disabling global shuffle mode...");
            globalShuffleBtn.innerHTML = `
                <img src="assets/images/shuffle.svg" alt="Global Shuffle">
                Shuffle All
            `;
            
            // Return to default playlist
            await getSongs("Aashiqui", false);
            if (songs.length > 0) playMusic(songs[0].url);
        }
    });

    // Shuffle functionality
    shuffleBtn.addEventListener("click", async () => {
        // Don't allow regular shuffle when global shuffle is active
        if (isGlobalShuffle) {
            console.log("Global shuffle is active. Disable global shuffle first.");
            return;
        }
        
        isShuffleMode = !isShuffleMode;
        shuffleBtn.classList.toggle("active", isShuffleMode);
        
        // Provide user feedback
        const mode = isShuffleMode ? 'ON' : 'OFF';
        console.log(`Shuffle mode: ${mode}`);
        
        if (currFolder && currFolder !== "All Songs" && originalSongs.length > 0) {
            console.log(`${isShuffleMode ? 'Enabling' : 'Disabling'} shuffle mode for ${currFolder}...`);
            
            // Get current playing song URL for tracking
            const currentlyPlaying = !currentSong.paused && currentSong.src ? currentSong.src : null;
            
            // Apply shuffle or restore original order instantly
            if (isShuffleMode) {
                songs = shuffleArray(originalSongs);
            } else {
                songs = [...originalSongs]; // Restore original order
            }
            
            // Update display instantly
            updateSongListDisplay();
            
            // Update current song index if a song is playing
            if (currentlyPlaying) {
                currentSongIndex = songs.findIndex(song => song.url === currentlyPlaying);
                if (currentSongIndex === -1) {
                    currentSongIndex = 0;
                }
            }
        } else if (currFolder && currFolder !== "All Songs") {
            // If no cached songs, fetch them first
            console.log(`Loading ${currFolder} for shuffle...`);
            await getSongs(currFolder, isShuffleMode);
        }
    });

    // Play/pause functionality
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "assets/images/play.svg";
        }
    });

    // Previous button
    previous.addEventListener("click", () => {
        console.log("Previous clicked");
        playPreviousSong();
    });

    // Next button
    next.addEventListener("click", () => {
        console.log("Next clicked");
        playNextSong();
    });

    // Auto-play next song when current song ends
    currentSong.addEventListener("ended", () => {
        playNextSong();
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration) && isFinite(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Keyboard Controls
    addEventListener("keydown", e => {
        if (e.key === " ") {
            e.preventDefault();
            play.click();
        }

        if (e.key === "ArrowRight") {
            currentSong.currentTime = Math.min(currentSong.currentTime + 5, currentSong.duration);
        }

        if (e.key === "ArrowLeft") {
            currentSong.currentTime = Math.max(currentSong.currentTime - 5, 0);
        }

        if (e.key === "ArrowUp") {
            currentSong.volume = Math.min(currentSong.volume + 0.1, 1);
        }

        if (e.key === "ArrowDown") {
            currentSong.volume = Math.max(currentSong.volume - 0.1, 0);
        }

        if (e.key === "MediaTrackPrevious") {
            playPreviousSong();
        }

        if (e.key === "MediaTrackNext") {
            playNextSong();
        }

        if (e.key === "s" || e.key === "S") {
            shuffleBtn.click();
        }
        
        if (e.key === "g" || e.key === "G") {
            globalShuffleBtn.click();
        }
    });

    // Background fetch all songs from all playlists
    async function fetchAllSongsInBackground() {
        try {
            console.log("🔄 Background: Fetching all songs for global shuffle...");
            // Update button tooltip to show loading
            globalShuffleBtn.title = "Loading songs for instant shuffle...";
            
            let response = await fetch(`${SERVER_ADDRESS}/api/songs/global/shuffle`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let data = await response.json();
            
            if (data.songs && Array.isArray(data.songs)) {
                globalSongsCache = [...data.songs];
                isGlobalCacheLoaded = true;
                console.log(`✅ Background: Cached ${globalSongsCache.length} songs for instant global shuffle`);
                // Update button tooltip to show ready state
                globalShuffleBtn.title = `⚡ Instant Shuffle All (${globalSongsCache.length} songs ready)`;
            } else {
                console.warn("⚠️ Background: Invalid songs data received");
                globalShuffleBtn.title = "Shuffle All Playlists";
            }
        } catch (error) {
            console.error("❌ Background: Failed to cache global songs:", error);
            isGlobalCacheLoaded = false;
            globalShuffleBtn.title = "Shuffle All Playlists";
        }
    }

    // Instant global shuffle using cached data
    function activateGlobalShuffleInstant() {
        if (!isGlobalCacheLoaded || globalSongsCache.length === 0) {
            console.warn("⚠️ Global cache not ready, falling back to API fetch");
            return false;
        }
        
        // Shuffle the cached songs
        const shuffledGlobalSongs = shuffleArray(globalSongsCache);
        
        // Update current state
        originalSongs = [...shuffledGlobalSongs];
        songs = [...shuffledGlobalSongs];
        currFolder = "All Songs";
        
        // Update display
        updateSongListDisplay();
        
        console.log(`⚡ Instant global shuffle activated with ${songs.length} songs from cache`);
        return true;
    }
}

// Start
main();
