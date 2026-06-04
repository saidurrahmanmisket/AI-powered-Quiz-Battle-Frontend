# 🎨 Quiz Battle - Interactive React Frontend

The client-side interface for **Quiz Battle**, an AI-powered live multiplayer trivia game. Built with **React**, **Vite**, **TailwindCSS**, and **STOMP WebSockets**, it features a sleek, premium dark-mode interface with rich animations, game recovery, power-ups, and live communication.

---

## ✨ Features & UI Details

### 🌌 Aesthetic & Design
* **Glassmorphism Theme**: Uses semi-transparent dark layers, gradient borders, and blurred backdrops (`backdrop-filter`) for a premium modern aesthetic.
* **Animated Particles**: Floating ambient particles in the background create a dynamic, living interface that keeps the user engaged.
* **Responsive Layouts**: Fully responsive layouts optimized for desktops, tablets, and phones.

### 🎮 Multiplayer Arena & Lobby
* **Live Stats Badging**: Flame badge displays the live count of globally online users.
* **Flicker-Free Room Polling**: Background threads query open lobbies and online users silently, preventing UI jittering or spinner flickering.
* **Custom Code Joining**: Fast alphanumeric code lookup form bypasses standard matching queues for private events.
* **Early Battle Trigger**: Hosts see a dedicated "Start Battle Now" button inside active lobbies to bypass the 30-second matchmaking timer.

### ⚡ Game Mechanics & Lifelines
* **Progress Countdown Bar**: Sleek violet-to-amber progress bar indicator tracks question timer smoothly via requestAnimationFrame.
* **Power-up Buttons (Casual Mode)**: Interactive panel elements to trigger lifelines:
  * **50:50**: Blurs/hides two incorrect options in the UI.
  * **Freeze**: Halts countdown decrementers visually and changes progress bar to cyan.
  * **Double Points (2x)**: Highlights active multiplier indicators.
* **Emotes Broadcast**: Overlay bubble pops up animated reactions (`🤯`, `😎`, `👏`) next to active players.
* **State Recovery**: If connection drops or a user refreshes mid-question, bootstrapping queries retrieve server states, synchronize timers, and resume active rounds seamlessly.

---

## 🛠️ Technology Stack

* **Core**: React 19 + Vite
* **Styling**: TailwindCSS 4 (via `@tailwindcss/vite` plugin) + Vanilla CSS Variables
* **Icons**: Lucide React
* **Real-time Protocol**: StompJS + SockJS Client
* **HTTP Client**: Axios (configured with token interceptors)
* **Feedback**: React Hot Toast

---

## 🚦 Getting Started

### 📋 Prerequisites
* **Runtime**: Node.js v18 or higher
* **Package Manager**: npm or yarn

### ⚙️ Installation
Navigate to the frontend folder and install standard dependencies:
```bash
npm install
```

### 🚀 Running the Client
To spin up the development server locally:
```bash
npm run dev
```
The server will bind to local ports (usually `http://localhost:5173`). Configure authorization tokens inside browser local storage automatically on user registration or guest creation.

### 📦 Production Build
To create an optimized production bundle:
```bash
npm run build
```
This outputs assets to the `/dist` folder.

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js        # Axios instance & REST endpoints wrapper
│   ├── components/
│   │   ├── ActiveLobby.jsx  # Active room host/guest interface
│   │   └── AnimatedBackground.jsx # Floating particles backdrop
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication, Login/Guest management
│   ├── hooks/
│   │   └── useGameSocket.js # WebSocket client connection state wrapper
│   ├── pages/
│   │   ├── LobbyPage.jsx    # Room browsing & matchmaking dashboard
│   │   ├── GamePage.jsx     # Live quiz game loop arena & scoreboard
│   │   └── LeaderboardPage.jsx # Top player rankings & clan leaderboard
│   ├── App.jsx              # Main routing & application layout
│   └── index.css            # Design system, CSS variables & animations
├── package.json
└── vite.config.js
```
