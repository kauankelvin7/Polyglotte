export const PROVIDERS = {
  SUPERFLIX: 'SuperFlix',
  VIDSRC_RU: 'Vidsrc RU',
  VIDSRC_SU: 'Vidsrc SU',
  VIDSRC_ME: 'Vidsrc ME',
  EMBEDSU: 'Embed.su'
};

export const buildPlayerUrl = ({ type, id, season, episode, provider = PROVIDERS.SUPERFLIX }) => {
  const isMovie = type === 'filme' || type === 'movie';

  switch(provider) {
    case PROVIDERS.VIDSRC_RU:
      return isMovie 
        ? `https://vidsrc-embed.ru/embed/movie?tmdb=${id}`
        : `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
    
    case PROVIDERS.VIDSRC_SU:
      return isMovie 
        ? `https://vidsrc-embed.su/embed/movie?tmdb=${id}`
        : `https://vidsrc-embed.su/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;

    case PROVIDERS.VIDSRC_ME:
      return isMovie 
        ? `https://vidsrcme.su/embed/movie?tmdb=${id}`
        : `https://vidsrcme.su/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
    
    case PROVIDERS.EMBEDSU:
      return isMovie
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${season}/${episode}`;
    
    case PROVIDERS.SUPERFLIX:
    default:
      const sType = isMovie ? 'filme' : 'serie';
      const base = `https://superflixapi.fit/${sType}/${id}`;
      return isMovie 
        ? `${base}#transparent#noLink`
        : `${base}/${season}/${episode}#transparent#noLink#noEpList`;
  }
};
