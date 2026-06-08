import { useState, useEffect, useRef } from 'react';
import { tmdbService } from '../config/tmdb';
import { X, Play, Loader2, Volume2, VolumeX } from 'lucide-react';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

const MediaModal = ({ media, onClose, onPlay }) => {
  const [details, setDetails] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState(false);

  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const isMovie = media.type === 'filme';

  // Drag logic para o seletor de temporadas
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
  const handleSeasonClick = (seasonNumber) => {
    if (isDragging.current) return;
    setSelectedSeason(seasonNumber);
  };

  useEffect(() => {
    setLoading(true);
    const fetchDetails = isMovie
      ? tmdbService.getMovieDetails(media.id)
      : tmdbService.getTVDetails(media.id);

    const fetchVideos = tmdbService.getVideos(media.id, isMovie ? 'movie' : 'tv');

    Promise.all([fetchDetails, fetchVideos])
      .then(([data, videoData]) => {
        setDetails(data);
        
        // Trailer
        const trailer = videoData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) setTrailerKey(trailer.key);

        if (!isMovie) {
          const validSeasons = data.seasons.filter(s => s.season_number > 0);
          setSeasons(validSeasons);
          if (validSeasons.length > 0) {
            setSelectedSeason(validSeasons[0].season_number);
          }
        }
      })
      .catch(err => console.error("Erro ao carregar detalhes:", err))
      .finally(() => setLoading(false));
  }, [media.id, isMovie]);

  useEffect(() => {
    if (isMovie || !selectedSeason) return;
    setLoadingEpisodes(true);
    tmdbService.getTVSeason(media.id, selectedSeason)
      .then(data => setEpisodes(data.episodes || []))
      .catch(err => console.error("Erro ao carregar episódios:", err))
      .finally(() => setLoadingEpisodes(false));
  }, [media.id, selectedSeason, isMovie]);

  if (loading || !details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  const title = isMovie ? details.title : details.name;
  const releaseYear = isMovie
    ? details.release_date?.slice(0, 4)
    : details.first_air_date?.slice(0, 4);
  const backdrop = details.backdrop_path ? `${TMDB_BACKDROP}${details.backdrop_path}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 animate-fade-in">
      <div className={`relative w-full max-w-5xl ${isMovie ? 'h-auto' : 'h-[90vh] sm:h-[85vh]'} bg-pg-surface border border-pg-border rounded-3xl overflow-hidden flex flex-col shadow-2xl`}>
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 glass p-2 rounded-full text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Section */}
        <div className={`relative ${isMovie ? 'aspect-[4/5] sm:aspect-video rounded-3xl' : 'h-[40%] sm:h-[50%] rounded-t-3xl'} shrink-0 group overflow-hidden bg-black`}>
          {isPlayingTrailer && trailerKey ? (
            <div className="w-full h-full relative bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0`}
                title="Trailer"
                className="w-full h-full scale-[1.35] pointer-events-none"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`absolute bottom-6 right-6 z-30 glass p-3 rounded-full text-white hover:text-orange-500 transition-opacity duration-700 pointer-events-auto ${isPlayingTrailer ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <>
              {backdrop ? (
                <img src={backdrop} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-pg-bg" />
              )}
            </>
          )}
          
          <div className={`absolute inset-0 bg-gradient-to-t from-pg-surface via-pg-surface/60 to-transparent pointer-events-none transition-opacity duration-700 ${isPlayingTrailer ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`} />
          
          <div className={`absolute bottom-0 left-0 p-6 sm:p-8 w-full transition-opacity duration-700 ${isPlayingTrailer ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-2">{title}</h2>
            <div className="flex items-center gap-3 text-sm text-white/60 mb-4">
              {releaseYear && <span>{releaseYear}</span>}
              <span>•</span>
              {!isMovie && (
                <>
                  <span>{details.number_of_seasons} Temporada(s)</span>
                  <span>•</span>
                </>
              )}
              {isMovie && details.runtime > 0 && (
                <>
                  <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>
                  <span>•</span>
                </>
              )}
              <span className="text-orange-500">★ {details.vote_average?.toFixed(1)}</span>
            </div>
            
            <div className="max-w-3xl mb-6">
              <p className={`text-white/70 text-sm sm:text-base ${expandedDesc ? '' : 'line-clamp-2'}`}>
                {details.overview || "Nenhuma sinopse disponível."}
              </p>
              {details.overview && details.overview.length > 150 && (
                <button 
                  onClick={() => setExpandedDesc(!expandedDesc)}
                  className="text-orange-500 hover:text-orange-400 text-xs font-bold uppercase mt-2 transition-colors focus:outline-none"
                >
                  {expandedDesc ? 'Mostrar Menos' : 'Ler Mais'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isMovie && (
                <button
                  onClick={() => onPlay({
                    ...media,
                    id: media.id,
                    type: 'filme',
                    title: title,
                    poster_path: media.poster_path || (details.poster_path ? `${TMDB_IMG}${details.poster_path}` : null),
                    backdrop_path: media.backdrop_path || (details.backdrop_path ? `${TMDB_BACKDROP}${details.backdrop_path}` : null)
                  })}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-full transition-colors"
                >
                  <Play className="w-5 h-5 fill-black" />
                  Assistir Filme
                </button>
              )}

              {trailerKey && !isPlayingTrailer && (
                <button
                  onClick={() => setIsPlayingTrailer(true)}
                  className="flex items-center gap-2 px-6 py-3 glass hover:bg-white/10 text-white font-medium rounded-full transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Ver Trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Seleção de Temporada e Lista de Episódios (Apenas para Séries) */}
        {!isMovie && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Seletor de Temporadas */}
            <div 
              ref={sliderRef}
              className="flex items-center gap-4 overflow-x-auto px-6 py-5 border-b border-white/5 scrollbar-hide shrink-0 select-none cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {seasons.map(season => (
                <button
                  key={season.season_number}
                  onClick={() => handleSeasonClick(season.season_number)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSeason === season.season_number
                      ? 'bg-orange-600/20 text-orange-500 border border-orange-600/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  Temporada {season.season_number}
                </button>
              ))}
            </div>

            {/* Grade de Episódios */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {loadingEpisodes ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {episodes.map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => onPlay({
                        ...media,
                        id: media.id,
                        type: 'serie',
                        season: selectedSeason,
                        episode: ep.episode_number,
                        title: `${title} - S${String(selectedSeason).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`,
                        poster_path: media.poster_path || (details.poster_path ? `${TMDB_IMG}${details.poster_path}` : null),
                        backdrop_path: media.backdrop_path || (details.backdrop_path ? `${TMDB_BACKDROP}${details.backdrop_path}` : null)
                      })}
                      className="group flex flex-col text-left rounded-xl overflow-hidden glass hover:bg-white/10 transition-all border border-transparent hover:border-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <div className="relative aspect-video w-full bg-black/50 shrink-0">
                        {ep.still_path ? (
                          <img src={`${TMDB_IMG}${ep.still_path}`} alt={ep.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">Sem Imagem</div>
                        )}
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="bg-orange-600 text-black p-3 rounded-full transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="w-5 h-5 fill-black" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-orange-500 font-mono text-xs font-bold">E{ep.episode_number}</span>
                          <h4 className="text-sm font-medium text-white truncate">{ep.name}</h4>
                        </div>
                        <p className="text-xs text-white/40 line-clamp-2">
                          {ep.overview || "Nenhuma sinopse disponível."}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModal;
