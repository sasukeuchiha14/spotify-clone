// Configuration file for Spotify Frontend
// Copy this file to config.js and update with your server details

const CONFIG = {
    SERVER_IP: "example.com/app1", // Your backend server domain/path (e.g., "example.com/app1" for nginx reverse proxy)
    PORT: 0, // No port in URL (set to 0 for nginx reverse proxy setup)
    SONGS_CACHE_VERSION: "1.0" // Increment this to force cache update
};

// Construct server address
CONFIG.SERVER_ADDRESS = CONFIG.PORT !== 0 
    ? `https://${CONFIG.SERVER_IP}:${CONFIG.PORT}` 
    : `https://${CONFIG.SERVER_IP}`;

// Example configurations:
// For nginx reverse proxy: SERVER_IP = "example.com/app1", PORT = 0
// For direct access with port: SERVER_IP = "example.com", PORT = 5000
// For localhost development: SERVER_IP = "localhost", PORT = 5000
