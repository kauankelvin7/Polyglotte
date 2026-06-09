import { useState, useEffect } from 'react';
import Logo from './Logo';
import SearchBar from './SearchBar';
import CatalogRow from './CatalogRow';
import HeroCarousel from './HeroCarousel';
import Footer from './Footer';
import HelpModal from './HelpModal';
import { tmdbService } from '../config/tmdb';
import { getHistory, removeProgress } from '../config/storage';

const ROWS = [
  { title: 'Filmes em Destaque',  fetcher: () => tmdbService.getTrending(1) },
  { title: 'Séries Populares',    fetcher: () => tmdbService.getPopularSeries(1) },
  { title: 'Animes Populares',    fetcher: () => tmdbService.discoverSeriesByGenre(16, 1) },
  { title: 'Filmes de Ação',      fetcher: () => tmdbService.discoverContent({ type: 'movie', with_genres: 28, page: 1 }) },
  { title: 'Comédias',            fetcher: () => tmdbService.discoverContent({ type: 'movie', with_genres: 35, page: 1 }) },
  { title: 'Séries de Drama',     fetcher: () => tmdbService.discoverSeriesByGenre(18, 1) },
];

const HomePage = ({ onSelect }) => {
  const [history, setHistory] = useState([]);
  const [heroItems, setHeroItems] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
    
    // Fetch top trending items for the HeroCarousel
    tmdbService.getTrending(1).then(data => {
      // Pick top 5 items that have a backdrop_path
      const validItems = data.results.filter(i => i.backdrop_path).slice(0, 5);
      setHeroItems(validItems);
    }).catch(err => console.error(err));
  }, []);

  const handleRemoveHistory = (item) => {
    removeProgress(item.id, item.type);
    setHistory(getHistory()); // Atualiza o estado lendo o localStorage modificado
  };

  return (
    <div className="w-screen h-screen overflow-y-auto overflow-x-hidden bg-transparent flex flex-col relative scrollbar-hide">
      <HelpModal />
      {/* Navbar Superior Glassmorphism */}
      <div className="absolute top-0 left-0 w-full z-50 px-6 sm:px-12 py-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="pointer-events-auto scale-90 sm:scale-100 origin-left">
          <Logo />
        </div>
        <div className="w-full max-w-sm pointer-events-auto ml-4 hidden md:block">
          <SearchBar onSelect={onSelect} />
        </div>
      </div>
      
      {/* Searchbar flutuante para Mobile (Se escondida na navbar superior) */}
      <div className="md:hidden absolute top-20 w-full px-6 z-40 pointer-events-none">
        <div className="w-full pointer-events-auto opacity-90 focus-within:opacity-100 transition-opacity">
          <SearchBar onSelect={onSelect} />
        </div>
      </div>

      {/* Hero Carousel */}
      {heroItems.length > 0 ? (
         <HeroCarousel items={heroItems} onSelect={onSelect} />
      ) : (
         <div className="w-full h-[65vh] bg-pg-surface animate-pulse" />
      )}

      {/* Catálogo de Trilhos (Rows) */}
      <div className="flex-1 pb-16 relative z-20 pt-4 sm:pt-8 bg-transparent">
        {history.length > 0 && (
          <CatalogRow
            title="Continuar Assistindo"
            fetcher={async () => ({ results: history })}
            onSelect={onSelect}
            onRemove={handleRemoveHistory}
          />
        )}
        {ROWS.map((row, idx) => (
          <CatalogRow
            key={idx}
            title={row.title}
            fetcher={row.fetcher}
            onSelect={onSelect}
          />
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
