import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { tmdbService } from '../config/tmdb';

const SearchBar = ({ onSelect }) => {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const timerRef = useRef(null);
  const wrapRef  = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query.trim());
        const list = data.results || [];
        setResults(list.slice(0, 10));
        setOpen(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onSelect({
      id: item.id,
      title: item.title,
      type: item.type, // 'filme' ou 'serie' (mapeado no tmdb.js)
    });
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">
      {/* Input */}
      <div className="glass flex items-center gap-2 rounded-full px-4 py-2 transition-all focus-within:border-orange-500/40">
        {loading
          ? <Loader2 className="w-4 h-4 text-white/40 animate-spin flex-shrink-0" />
          : <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar filmes, séries..."
          className="bg-transparent text-sm text-white placeholder-white/30 outline-none flex-1 min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }}>
            <X className="w-3.5 h-3.5 text-white/30 hover:text-white/60 transition-colors" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-pg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto scrollbar-hide">
          {results.map((item, i) => (
            <button
              key={item.id || i}
              onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
            >
              {/* Mini poster na pesquisa para visual melhor */}
              {item.poster_path ? (
                <img src={item.poster_path} alt="" className="w-8 h-12 object-cover rounded shadow" />
              ) : (
                <div className="w-8 h-12 bg-white/10 rounded flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 truncate">
                  {item.title}
                </div>
                {item.release_date && (
                  <div className="text-xs text-white/40">
                    {item.release_date.substring(0, 4)}
                  </div>
                )}
              </div>
              
              <span className="text-xs text-white/30 flex-shrink-0 ml-auto capitalize px-2 py-1 bg-white/5 rounded-full">
                {item.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
// Forcing Vite HMR reload
