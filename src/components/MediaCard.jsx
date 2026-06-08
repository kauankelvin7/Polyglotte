import { useState, useRef } from 'react';
import { Play, Minus } from 'lucide-react';

const MediaCard = ({ item, onClick, onRemove }) => {
  const [showRemove, setShowRemove] = useState(false);
  const timerRef = useRef(null);
  const pressTimeRef = useRef(0);

  const startPress = () => {
    if (item.timestamp && onRemove) {
      pressTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => setShowRemove(true), 600); // 600ms para ativar
    }
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleCardClick = (e) => {
    if (showRemove) {
      const timePressed = Date.now() - pressTimeRef.current;
      // Se acabou de soltar um long-press, ignora esse clique (ele foi o gatilho da abertura)
      if (timePressed > 500) return;
      setShowRemove(false);
    } else {
      onClick(item);
    }
  };

  let poster = item.poster_path || null;
  if (poster && poster.startsWith('/')) {
    poster = `https://image.tmdb.org/t/p/w500${poster}`;
  }

  return (
    <button
      onClick={handleCardClick}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      className="group relative flex-shrink-0 w-36 md:w-44 rounded-xl overflow-hidden
                 border border-pg-border hover:border-orange-500/40
                 transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]
                 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-left select-none"
    >
      {/* Poster */}
      <div className="aspect-[2/3] bg-pg-surface">
        {poster ? (
          <img
            src={poster}
            alt={item.title || item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs px-2 text-center">
            {item.title || item.name}
          </div>
        )}
      </div>

      {/* Hover overlay (Padrão) */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition-all duration-500
                      flex items-center justify-center ${showRemove ? 'hidden' : ''}`}>
        <div className="bg-orange-500/90 shadow-[0_0_20px_rgba(249,115,22,0.5)] backdrop-blur-sm p-4 rounded-full transform scale-75 group-hover:scale-100 transition-transform duration-500">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>

      {/* Remove Overlay (Long Press) */}
      {showRemove && (
        <div 
          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in"
          onClick={(e) => {
            e.stopPropagation(); // Impede que o click no overlay propague e clique no card inteiro
            setShowRemove(false);
          }}
        >
          <button 
             onClick={(e) => {
               e.stopPropagation();
               if (onRemove) onRemove(item);
             }}
             className="bg-red-500/90 p-4 rounded-full hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.5)] mb-3"
          >
            <Minus className="w-8 h-8 text-white" />
          </button>
          <span className="text-white font-medium tracking-wide text-xs uppercase bg-black/50 px-3 py-1 rounded-full">Remover</span>
        </div>
      )}

      {/* Informações */}
      <div className="p-3 bg-gradient-to-t from-pg-bg/80 to-transparent">
        <p className="text-sm text-white/90 truncate font-display font-bold tracking-tight">
          {item.title || item.name}
        </p>
        {item.timestamp ? (
          <p className="text-[10px] text-orange-500 mt-1 font-bold font-mono tracking-widest uppercase">
            {item.type === 'serie' ? `T${String(item.season).padStart(2,'0')} E${String(item.episode).padStart(2,'0')}` : 'Continuar Filme'}
          </p>
        ) : item.release_date && (
          <p className="text-xs text-white/40 mt-0.5 font-medium">
            {item.release_date.slice(0, 4)}
          </p>
        )}
      </div>
    </button>
  );
};

export default MediaCard;
