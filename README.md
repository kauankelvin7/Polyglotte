# 🍿 Polyglotte

Polyglotte is a modern web application designed to transform the way you watch movies and series into an immersive language-learning experience. Featuring a stunning, cinematic UI inspired by premium streaming platforms, Polyglotte allows you to watch your favorite content with **dual simultaneous subtitles**.

## ✨ Features

- **Dual Subtitles**: Display two subtitles simultaneously (e.g., English and Portuguese) to easily cross-reference vocabulary and context.
- **Cinematic User Interface**: A highly polished, dark-themed UI with glassmorphism effects, dynamic gradients, and smooth micro-animations.
- **Dynamic Catalog**: Automatically fetches trending movies, popular series, anime, and categorized content directly from the TMDB API.
- **Smart History Tracker**: The "Continuar Assistindo" (Continue Watching) row remembers exactly where you left off, including the specific season, episode, and timestamp.
- **Binge-Watching Mode**: Seamlessly jump to the next episode with the built-in next-episode feature.
- **Smart Auto-Sync**: Easily synchronize external subtitles by clicking a single button exactly when you hear the dialogue being spoken.
- **Alternative Video Servers**: Built-in support for multiple robust video providers (SuperFlix, Vidsrc RU/SU/ME, Embed.su) ensuring your content is always available.
- **Custom Subtitle Uploads**: Didn't find the subtitle automatically? Simply drag and drop your `.srt` files directly into the player.

## 🛠️ Technologies & Stack

- **Frontend**: React (via Vite)
- **Styling**: Tailwind CSS (with custom design system & animations)
- **Data & Metadata**: TMDB API (The Movie Database)
- **Video Players**: Third-party iframe embeds
- **Subtitle Parsing**: `srt-parser-2`
- **Icons**: Lucide React

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kauankelvin7/Polyglotte.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd Polyglotte
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your TMDB API Key:
   ```env
   VITE_TMDB_KEY=your_tmdb_api_key_here
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/kauankelvin7/Polyglotte/issues).

## 👨‍💻 Author

Developed by [Kauan Kelvin](https://github.com/kauankelvin7).
