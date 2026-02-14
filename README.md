# Spotify Clone

A full-featured Spotify clone web application with a modern, responsive UI that replicates core Spotify functionality. Features include music streaming, playlist management, search functionality, and intelligent caching for optimal performance.

## ✨ Features

### Core Functionality
- **🎵 Music Playback**: Stream songs with full playback controls (play, pause, next, previous)
- **📁 Playlist Management**: Browse and play songs from multiple playlists
- **🔍 Real-time Search**: Search across all songs and playlists instantly
- **🔀 Global Shuffle**: Shuffle and play songs from all playlists
- **⚡ Smart Caching**: localStorage caching with versioning for instant load times
- **🎨 Modern UI**: Clean, Spotify-inspired interface with smooth animations
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **⌨️ Keyboard Shortcuts**: Control playback with keyboard (Space, Arrow keys)
- **🎚️ Volume Control**: Adjustable volume with visual feedback
- **⏱️ Progress Tracking**: Visual seekbar with time display

### Technical Features
- RESTful API architecture
- Environment-based configuration
- HTTPS with SSL/TLS support
- Nginx reverse proxy ready
- Client-side song caching
- Debounced search functionality

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Security**: HTTPS, CORS, SSL/TLS
- **Storage**: localStorage for caching
- **Server**: Nginx (reverse proxy)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SSL certificates (for HTTPS)
- Nginx (optional, for reverse proxy)

### Backend Setup

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
   📁 Project Structure

```
spotify-clone/
├── backend/
│   ├── songs/                    # Music library
│   │   ├── playlist-1/
│   │   │   ├── song-1.mp3       # Audio files
│   │   │   ├── song-2.mp3
│   │   │   ├── cover.jpg        # Album artwork
│   │   │   └── info.json        # Playlist metadata
│   │   ├── playlist-2/
│   │   └── playlist-3/
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
│   ├── .gitignore
│   ├── index.html              # Main HTML
│   ├── script.js               # Main JavaScript
│   └── CONFIG_README.md        # Frontend setup guide
├── LICENSE.txt
└── README.md
```

## 🔌 API Endpoints

### Playlists
- `GET /api/playlists` - List all available playlists

### Songs
- `GET /api/songs/:playlist` - Get all songs from a specific playlist
- `GET /api/songs/:playlist/shuffle` - Get shuffled songs from a playlist
- `GET /api/songs/global/shuffle` - Get all songs from all playlists (shuffled)

### Search
- `GET /api/search?q=query` - Search for songs across all playlists

## ⌨️ Keyboard Shortcuts

- `Space` - Play/Pause
- `Arrow Right` - Skip forward 5 seconds
- `Arrow Left` - Skip backward 5 seconds
- `Arrow Up` - Increase volume
- `Arrow Down` - Decrease volume
- `Escape` - Close sidebar (mobile)

## 🎨 UI Features

- **Top Navigation**: Logo, home button, search bar, and user profile
- **Left Sidebar**: Your Library with current playlist (collapsible on mobile)
- **Main Content**: Scrollable playlist cards with hover animations
- **Bottom Player**: Album art, song info, playback controls, seekbar, and volume
- **Visual Feedback**: Active song highlighting, play/pause state indicators
- **Smooth Animations**: Transitions and hover effects throughout

## 💾 Caching System

The app uses intelligent localStorage caching:
- All songs are cached on first load
- Version-based cache invalidation
- Instant search and shuffle using cached data
- Background cache updates
- Configurable cache version in `config.js`

To force a cache update, increment `SONGS_CACHE_VERSION` in [config.js](frontend/config.js#L5)

## 🚀 Performance Features

- Debounced search (500ms)
- Lazy loading of playlist metadata
- Client-side caching with versioning
- Optimized image loading with fallbacks
- Progressive enhancement
### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Configure the frontend:**
   ```bash
   cp config.example.js config.js
   ```
   
   Edit `config.js`:
   🌐 Live Demo

Experience the Spotify Clone in action: **[https://spotify.hardikgarg.me/](https://spotify.hardikgarg.me/)**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the terms specified in [LICENSE.txt](LICENSE.txt)

## 👨‍💻 Author

**Hardik Garg**
- Website: [hardikgarg.me](https://hardikgarg.me)
- GitHub: [@sasukeuchiha14](https://github.com/sasukeuchiha14)

## 🙏 Acknowledgments

- Inspired by Spotify's design and functionality
- Built with modern web technologies
- Uses Nginx for reverse proxy capabilities

---

**Note**: This is a clone project for educational purposes. Spotify is a registered trademark of Spotify AB
       PORT: 0,
       SONGS_CACHE_VERSION: "1.0"
   };
   ```

3. **Deploy:**
   - **For local development**: Open `index.html` in a browser
   - **For production**: Deploy to Netlify, Vercel, or any static hosting service

### Nginx Configuration (Optional)

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

## Folder Structure

```
/Spotify/
├── backend/
│   ├── songs/
│   │   ├── playlist-1/
│   │   │   ├── song-1.mp3
│   │   │   ├── song-2.mp3
│   │   │   ├── song-3.mp3
│   │   │   ├── cover.jpg
│   │   │   ├── info.json
│   │   ├── playlist-2/
│   │   ├── playlist-3/
│   ├── server.js
│   ├── package.json
├── frontend/
│   ├── assets/
│   │   ├── images/
│   ├── css/
│   │   ├── style.css
│   │   ├── utility.css
│   ├── index.html
│   ├── script.js
├── LICENSE.txt
├── README.md
```

## Live Preview

Experience the Spotify Clone application in action by visiting the [live demo](https://spotify.hardikgarg.me/).