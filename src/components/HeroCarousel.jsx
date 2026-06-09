import { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000); // 8 segundos por banner
    return () => clearInterval(timer);
  }, [items]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="relative w-full h-[85vh] min-h-[700px] flex-shrink-0 group bg-transparent">
      {/* Background Images with Ken Burns effect */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          {item.backdrop_path ? (
            <img 
              src={item.backdrop_path} 
              alt={item.title || item.name} 
              className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${index === currentIndex ? 'scale-105' : 'scale-100'}`} 
            />
          ) : (
             <div className="w-full h-full bg-black/50" />
          )}
          {/* Gradients to blend with the background */}
          <div className="absolute inset-0 bg-gradient-to-t from-pg-bg via-pg-bg/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-pg-bg via-pg-bg/50 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 pb-28 md:p-16 md:pb-32 z-10">
        <div className="max-w-3xl animate-fade-up">
          {/* Proposta de Valor do Sistema */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 shadow-lg">
            <span className="text-orange-500 font-bold text-xs tracking-widest uppercase drop-shadow-md">Polyglotte</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="text-white text-xs font-medium drop-shadow-md">Aprenda idiomas com legendas duplas simultâneas</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-[1.1] line-clamp-3">
            {currentItem.title || currentItem.name}
          </h2>
          
          <div className="flex items-center gap-3 text-sm font-medium text-orange-500 mb-6 drop-shadow-md">
            <span className="bg-orange-500/20 px-2 py-1 rounded border border-orange-500/30 font-bold uppercase tracking-wider text-[10px] text-white">Lançamento</span>
            <span>{currentItem.release_date?.slice(0, 4)}</span>
            <span className="text-white/50">•</span>
            <span className="text-white/80">
              {currentItem.media_type === 'movie' ? 'Filme' : 'Série'}
            </span>
          </div>

          <p className="text-white/80 text-sm md:text-lg line-clamp-5 md:line-clamp-none mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-2xl leading-relaxed">
            {currentItem.overview || 'Uma jornada incrível aguarda por você no Polyglotte.'}
          </p>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onSelect({
                ...currentItem,
                type: currentItem.media_type === 'movie' ? 'filme' : 'serie'
              })}
              className="bg-white text-black font-bold px-8 py-3.5 rounded-full hover:bg-orange-500 transition-colors shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              Assistir Agora
            </button>
            <button 
               onClick={() => onSelect({
                ...currentItem,
                type: currentItem.media_type === 'movie' ? 'filme' : 'serie'
              })}
              className="glass px-8 py-3.5 rounded-full text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Info className="w-5 h-5" />
              Mais Detalhes
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center gap-2 z-10">
        {items.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${idx === currentIndex ? 'w-8 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
