# Spotify Clone
This Spotify Clone is a web application that replicates the core features of the Spotify music streaming service. Users can view albums, play music, and navigate through a playlist. The application is built using simple HTML, CSS, and JavaScript, and it uses a Node.js backend to serve music data.

## Features

- **View Albums**: Browse through a collection of albums.
- **Play Music**: Play songs from the selected album.
- **Navigate Playlist**: Move between songs in the playlist.
- **Responsive Design**: Optimized for various screen sizes.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/sasukeuchiha14/spotify-clone
    ```

2. Open the project directory:
    ```bash
    cd spotify-clone
    ```

3. Install the backend dependencies:
    ```bash
    cd backend
    npm install
    ```

4. Start the backend server:
    ```bash
    node server.js
    ```

5. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
    ```

6. Open `index.html` in your preferred web browser.

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