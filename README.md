# Spotify Clone

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

A full-featured Spotify clone web application with a modern, responsive UI that replicates core Spotify functionality. Features include music streaming, playlist management, search functionality, and intelligent caching for optimal performance.

---

## 🎯 Key Features

- **🎵 Music Playback**: Stream songs with full playback controls (play, pause, next, previous)
- **📁 Playlist Management**: Browse and play songs from multiple playlists
- **🔍 Real-time Search**: Search across all songs and playlists instantly (debounced - 500ms)
- **🔀 Global Shuffle**: Shuffle and play songs from all playlists
- **⚡ Smart Caching**: localStorage caching with versioning for instant load times (background cache updates)
- **🎨 Modern UI**: Clean, Spotify-inspired interface with smooth animations, active song highlighting, and play/pause state indicators
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **⌨️ Keyboard Shortcuts**: Control playback with keyboard (`Space`, Arrow keys)
- **🎚️ Volume Control**: Adjustable volume with visual feedback
- **⏱️ Progress Tracking**: Visual seekbar with time display
- **🚀 Optimized Loading**: Lazy loading of playlist metadata and optimized image loading with fallbacks

---

## 🏗️ Technical Architecture

1. **Frontend:** HTML5, CSS3, Vanilla JavaScript, progressive enhancement.
2. **Backend:** Node.js, Express.js. RESTful API architecture.
3. **Security:** HTTPS, CORS, SSL/TLS.
4. **Storage:** Client-side local storage caching with version-based cache invalidation.
5. **Server:** Ready for Nginx reverse proxy configurations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SSL certificates (for HTTPS)
- Nginx (optional, for reverse proxy)

### 1. Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sasukeuchiha14/spotify-clone
   cd spotify-clone/backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   SERVER_IP=your-domain.com
   PORT=5000
   SSL_KEY_PATH=/path/to/privkey.pem
   ```

### 2. Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```
2. **Configure the frontend:**
   ```bash
   cp config.example.js config.js
   ```
   Edit `config.js`:
   ```javascript
   const config = {
       PORT: 0,
       SONGS_CACHE_VERSION: "1.0"
   };
   ```
3. **Deploy:**
   - **For local development**: Open `index.html` in a browser.
   - **For production**: Deploy to Netlify, Vercel, or any static hosting service.

### 3. Nginx Configuration (Optional)

If using nginx as a reverse proxy:
```nginx
location /app1/ {
    rewrite ^/app1(/.*)$ $1 break;
    proxy_pass https://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_ssl_verify off;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 📁 Folder Structure

```text
spotify-clone/
├── backend/
│   ├── songs/                    # Music library
│   │   ├── playlist-1/
│   │   │   ├── song-1.mp3       # Audio files
│   │   │   ├── cover.jpg        # Album artwork
│   │   │   └── info.json        # Playlist metadata
│   ├── .env                     # Environment variables (not in git)
│   ├── .env.example             # Environment template
│   ├── .gitignore
│   ├── server.js                # Express server
│   ├── package.json
│   └── SETUP_README.md          # Backend setup guide
├── frontend/
│   ├── assets/
│   │   └── images/             # UI icons and graphics
│   ├── css/
│   │   ├── style.css           # Main styles
│   │   └── utility.css         # Utility classes
│   ├── config.js                # Frontend config (not in git)
│   ├── config.example.js        # Config template
│   ├── index.html              # Main HTML
│   ├── script.js               # Main JavaScript
│   └── CONFIG_README.md        # Frontend setup guide
├── LICENSE.txt
└── README.md
```

---

## 🔌 API Endpoints

- `GET /api/playlists` - List all available playlists
- `GET /api/songs/:playlist` - Get all songs from a specific playlist
- `GET /api/songs/:playlist/shuffle` - Get shuffled songs from a playlist
- `GET /api/songs/global/shuffle` - Get all songs from all playlists (shuffled)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play / Pause |
| `Arrow Right` | Skip forward 5 seconds |
| `Arrow Left` | Skip backward 5 seconds |
| `Arrow Up` | Increase volume |
| `Arrow Down` | Decrease volume |
| `Escape` | Close sidebar (mobile) |

---

## 🌐 Live Demo

Experience the Spotify Clone in action by visiting the **[Live Demo](https://spotify.hardikgarg.me/)**.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the terms specified in [LICENSE.txt](LICENSE.txt).

---

## 👨‍💻 Author

**Hardik Garg**
- Website: [hardikgarg.me](https://hardikgarg.me)
- GitHub: [@sasukeuchiha14](https://github.com/sasukeuchiha14)

## 🙏 Acknowledgments

- Inspired by Spotify's design and functionality
- Built with modern web technologies
- Uses Nginx for reverse proxy capabilities

---

**Note**: This is a clone project for educational purposes. Spotify is a registered trademark of Spotify AB.