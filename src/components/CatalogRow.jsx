import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';

const CatalogRow = ({ title, fetcher, onSelect, onRemove }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetcher()
      .then((data) => {
        if (!cancelled) {
          const list = data.results || [];
          setItems(list.slice(0, 20));
        }
      })
      .catch((error) => {
        console.error(`Erro ao carregar a linha "${title}":`, error);
      })
      .finally(() => { 
        if (!cancelled) setLoading(false); 
      });
      
    return () => { cancelled = true; };
  }, [fetcher, title]);

  const scroll = (offset) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e) => {
    setIsDown(true);
    isDragging.current = false;
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    isDragging.current = true;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleCardClick = (item) => {
    if (isDragging.current) return;
    onSelect(item);
  };

  return (
    <section className="mb-8 relative group/row">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3 px-6">
        {title}
      </h2>

      {/* Seta Esquerda */}
      {!loading && items.length > 0 && (
        <button 
          onClick={() => scroll(-400)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-2 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80 rounded-r-xl h-24 flex items-center justify-center backdrop-blur-sm"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}

      {loading ? (
        <div className="flex gap-3 px-6 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 md:w-44 aspect-[2/3] rounded-xl bg-pg-surface bg-[length:400px_100%] bg-gradient-to-r from-pg-surface via-white/5 to-pg-surface animate-shimmer border border-white/5"
            />
          ))}
        </div>
      ) : (
        <div 
          ref={sliderRef}
          className="flex gap-3 px-6 overflow-x-auto pb-2 scrollbar-hide select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {items.map((item, idx) => (
            <MediaCard 
              key={item.id} 
              item={{
                ...item,
                // Preserva o type existente (ex: itens do histórico), ou calcula do media_type
                type: item.type ? item.type : (item.media_type === 'movie' ? 'filme' : 'serie'),
              }} 
              onClick={handleCardClick}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}

      {/* Seta Direita */}
      {!loading && items.length > 0 && (
        <button 
          onClick={() => scroll(400)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-2 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/80 rounded-l-xl h-24 flex items-center justify-center backdrop-blur-sm"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}
    </section>
  );
};

export default CatalogRow;
