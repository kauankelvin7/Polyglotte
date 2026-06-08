import { useState } from 'react';
import HomePage   from './components/HomePage';
import PlayerView from './components/PlayerView';
import MediaModal from './components/MediaModal';

export default function App() {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handleSelect = (media) => {
    setSelectedMedia(media);
  };

  const handlePlayMedia = (media) => {
    setSelectedMedia(null); // Fecha o modal de detalhes
    setNowPlaying(media);   // Abre o player
  };

  const handleClose = () => {
    setNowPlaying(null);
  };

  return (
    <main className="w-full h-screen overflow-hidden relative bg-pg-bg text-white">
      {nowPlaying ? (
        <PlayerView media={nowPlaying} onClose={handleClose} onPlay={handlePlayMedia} />
      ) : (
        <HomePage onSelect={handleSelect} />
      )}
      
      {/* Modal Universal para Filmes e Séries */}
      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onPlay={handlePlayMedia}
        />
      )}
    </main>
  );
}
