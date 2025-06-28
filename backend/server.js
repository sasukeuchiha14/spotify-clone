const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const https = require('https');

const app = express();
const PORT = 5000;
const SERVER_IP = "www.example.com"; // Change this to your server IP
const EXTERNAL_URL = `https://${SERVER_IP}`; // No port for external access

// Enable CORS
app.use(cors());

// Define the main songs directory
const songsFolder = path.join(__dirname, "songs");

// Serve static files (MP3, JSON, JPG)
app.use("/songs", express.static(songsFolder));

// API: Fetch all playlists
app.get("/api/playlists", (req, res) => {
    fs.readdir(songsFolder, (err, folders) => {
        if (err) return res.status(500).json({ error: "Unable to access songs folder" });

        let playlists = folders.filter(folder => fs.lstatSync(path.join(songsFolder, folder)).isDirectory());
        res.json(playlists);
    });
});

// API: Fetch all songs & metadata in a playlist
app.get("/api/songs/:playlist", (req, res) => {
    const playlist = req.params.playlist;
    const playlistPath = path.join(songsFolder, playlist);

    if (!fs.existsSync(playlistPath)) {
        return res.status(404).json({ error: "Playlist not found" });
    }

    let songList = [];
    let metadataFile = null;
    let coverImage = null;

    fs.readdir(playlistPath, (err, files) => {
        if (err) return res.status(500).json({ error: "Unable to read playlist files" });

        // Define supported image extensions for cover
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

        files.forEach(file => {
            const fileExtension = path.extname(file).toLowerCase();
            const fileName = path.basename(file, fileExtension).toLowerCase();
            
            if (file.endsWith(".mp3")) {
                songList.push({
                    title: file,
                    url: `${EXTERNAL_URL}/songs/${playlist}/${file}`
                });
            }
            if (file === "info.json") {
                metadataFile = `${EXTERNAL_URL}/songs/${playlist}/info.json`;
            }
            if (fileName === "cover" && imageExtensions.includes(fileExtension)) {
                coverImage = `${EXTERNAL_URL}/songs/${playlist}/${file}`;
            }
        });

        res.json({
            playlist: playlist,
            songs: songList,
            metadata: metadataFile,
            cover: coverImage
        });
    });
});

// API: Fetch songs from all playlists in shuffled order (MUST come before :playlist/shuffle)
app.get("/api/songs/global/shuffle", (req, res) => {
    fs.readdir(songsFolder, (err, folders) => {
        if (err) return res.status(500).json({ error: "Unable to access songs folder" });

        let allSongs = [];
        let processedFolders = 0;
        const playlists = folders.filter(folder => fs.lstatSync(path.join(songsFolder, folder)).isDirectory());
        
        if (playlists.length === 0) {
            return res.json({
                playlist: "All Songs",
                songs: [],
                metadata: null,
                cover: null,
                shuffled: true,
                global: true
            });
        }

        playlists.forEach(playlist => {
            const playlistPath = path.join(songsFolder, playlist);
            
            fs.readdir(playlistPath, (err, files) => {
                if (!err) {
                    files.forEach(file => {
                        if (file.endsWith(".mp3")) {
                            allSongs.push({
                                title: file,
                                url: `${EXTERNAL_URL}/songs/${playlist}/${file}`,
                                playlist: playlist
                            });
                        }
                    });
                }
                
                processedFolders++;
                
                // When all folders are processed, shuffle and return
                if (processedFolders === playlists.length) {
                    // Shuffle using Fisher-Yates algorithm
                    for (let i = allSongs.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
                    }

                    res.json({
                        playlist: "All Songs (Shuffled)",
                        songs: allSongs,
                        metadata: null,
                        cover: null,
                        shuffled: true,
                        global: true
                    });
                }
            });
        });
    });
});

// API: Fetch songs in shuffled order
app.get("/api/songs/:playlist/shuffle", (req, res) => {
    const playlist = req.params.playlist;
    const playlistPath = path.join(songsFolder, playlist);

    if (!fs.existsSync(playlistPath)) {
        return res.status(404).json({ error: "Playlist not found" });
    }

    let songList = [];
    let metadataFile = null;
    let coverImage = null;

    fs.readdir(playlistPath, (err, files) => {
        if (err) return res.status(500).json({ error: "Unable to read playlist files" });

        // Define supported image extensions for cover
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];

        files.forEach(file => {
            const fileExtension = path.extname(file).toLowerCase();
            const fileName = path.basename(file, fileExtension).toLowerCase();
            
            if (file.endsWith(".mp3")) {
                songList.push({
                    title: file,
                    url: `${EXTERNAL_URL}/songs/${playlist}/${file}`
                });
            }
            if (file === "info.json") {
                metadataFile = `${EXTERNAL_URL}/songs/${playlist}/info.json`;
            }
            if (fileName === "cover" && imageExtensions.includes(fileExtension)) {
                coverImage = `${EXTERNAL_URL}/songs/${playlist}/${file}`;
            }
        });

        // Shuffle the song list using Fisher-Yates algorithm
        for (let i = songList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [songList[i], songList[j]] = [songList[j], songList[i]];
        }

        res.json({
            playlist: playlist,
            songs: songList,
            metadata: metadataFile,
            cover: coverImage,
            shuffled: true
        });
    });
});

// Get keys and certificate for HTTPS
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/www.example.com/privkey.pem'), // Change this to your private key
    cert: fs.readFileSync('/etc/letsencrypt/live/www.example.com/fullchain.pem') // Change this to your certificate
};

// Start the server
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server running internally on port ${PORT}`);
    console.log(`External access: ${EXTERNAL_URL}`);
    console.log(`API available at: ${EXTERNAL_URL}/api/playlists`);
});
