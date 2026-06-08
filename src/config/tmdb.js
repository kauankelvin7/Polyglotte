import axios from 'axios';

// URL base para imagens do TMDB
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const CACHE_DURATION = 60 * 60 * 1000; // 60 minutos (1 hora)

/**
 * TMDB API Service - Rate-limited with exponential backoff retry on 429
 */
class TMDBService {
  constructor() {
    // Usar a chave do import.meta.env no Vite
    this.apiKey = import.meta.env?.VITE_TMDB_KEY || '';
    
    this.cache = new Map();
    this.lastRequestTime = 0;
    this.MIN_REQUEST_INTERVAL = 300; // 300ms entre requisições
    this.activeRequests = 0;
    this.MAX_CONCURRENT = 3; // Máximo de requisições simultâneas
    this.requestQueue = [];

    this.initialized = this.initializeApiKey();

    this.api = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      params: {
        api_key: this.apiKey,
        language: 'pt-BR',
        region: 'BR',
      },
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          const config = error.config;
          const retryCount = config?.__retryCount || 0;
          const maxRetries = 3;

          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
            console.warn(`⚠️ Rate limit 429 (tentativa ${retryCount + 1}/${maxRetries}), aguardando ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (config) {
              config.__retryCount = retryCount + 1;
              return this.api.request(config);
            }
          }

          if (config?.url) {
            const cacheKey = `fallback_${config.url}_${JSON.stringify(config.params)}`;
            const cached = this.cache.get(cacheKey);
            if (cached) {
              console.log(`📦 Usando cache fallback para ${cacheKey}`);
              return { data: cached.data };
            }
          }
        }
        console.error('TMDB API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  async initializeApiKey() {
    if (!this.apiKey) {
      try {
        console.log('🔑 Tentando obter chave gratuita via freekeys...');
        // Tentativa de import dinâmico para evitar quebras de build caso o freekeys use APIs nativas do Node
        const freekeysModule = await import('freekeys');
        const getKeys = freekeysModule.default || freekeysModule;
        const keys = await getKeys();
        this.apiKey = keys.tmdb_key;
        
        this.api.defaults.params = {
          ...this.api.defaults.params,
          api_key: this.apiKey,
        };
        console.log('✅ Chave TMDb obtida com sucesso via freekeys!');
      } catch (error) {
        console.warn('⚠️  Não foi possível carregar a chave automaticamente. Configure VITE_TMDB_KEY no arquivo .env.');
        console.error(error);
      }
    } else {
      console.log('✅ Usando VITE_TMDB_KEY do arquivo .env');
    }
  }

  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  transformMovie(movie, mediaType = 'movie') {
    return {
      ...movie,
      media_type: mediaType,
      poster_path: this.getImageUrl(movie.poster_path),
      backdrop_path: this.getImageUrl(movie.backdrop_path, 'w1280'),
    };
  }

  transformResponse(response, mediaType = 'movie') {
    return {
      ...response,
      results: response.results.map(movie => this.transformMovie(movie, mediaType)),
    };
  }

  transformSeriesResponse(response) {
    return {
      ...response,
      results: response.results.map((serie) => ({
        ...serie,
        media_type: 'tv',
        title: serie.title || serie.name || 'Sem título',
        release_date: serie.release_date || serie.first_air_date || '',
        poster_path: this.getImageUrl(serie.poster_path),
        backdrop_path: this.getImageUrl(serie.backdrop_path, 'w1280'),
      })),
    };
  }

  async ensureInitialized() {
    await this.initialized;
  }

  async waitForRateLimit() {
    while (this.activeRequests >= this.MAX_CONCURRENT) {
      await new Promise(resolve => {
        this.requestQueue.push(resolve);
      });
    }
    this.activeRequests++;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  releaseRequest() {
    this.activeRequests--;
    if (this.requestQueue.length > 0) {
      const next = this.requestQueue.shift();
      if (next) next();
    }
  }

  async getCached(cacheKey, fetcher) {
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    await this.waitForRateLimit();
    try {
      const data = await fetcher();
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } finally {
      this.releaseRequest();
    }
  }

  async getTrending(page = 1) {
    await this.ensureInitialized();
    return this.getCached(`trending_${page}`, async () => {
      const response = await this.api.get('/trending/movie/week', { params: { page } });
      return this.transformResponse(response.data);
    });
  }

  async getPopularSeries(page = 1) {
    await this.ensureInitialized();
    return this.getCached(`popular_series_${page}`, async () => {
      const response = await this.api.get('/tv/popular', { params: { page } });
      return this.transformSeriesResponse(response.data);
    });
  }

  async discoverSeriesByGenre(genreId, page = 1, sortBy = 'popularity.desc') {
    await this.ensureInitialized();
    return this.getCached(`discover_series_${genreId}_${page}_${sortBy}`, async () => {
      const response = await this.api.get('/discover/tv', {
        params: { with_genres: genreId, page, sort_by: sortBy },
      });
      return this.transformSeriesResponse(response.data);
    });
  }

  async discoverContent(params = {}) {
    await this.ensureInitialized();
    const { type = 'movie', ...rest } = params;
    const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';
    const cacheKey = `discover_${type}_${JSON.stringify(rest)}`;
    return this.getCached(cacheKey, async () => {
      const response = await this.api.get(endpoint, {
        params: { 'vote_count.gte': 50, ...rest },
      });
      const data = response.data;
      const results = (data.results || []).map(item => ({
        ...item,
        media_type: type,
        title: item.title || item.name || 'Sem título',
        release_date: item.release_date || item.first_air_date || '',
        poster_path: this.getImageUrl(item.poster_path),
        backdrop_path: this.getImageUrl(item.backdrop_path, 'w1280'),
      }));
      return { results, total_pages: data.total_pages || 1, page: data.page || 1 };
    });
  }

  async searchMulti(query, page = 1) {
    await this.ensureInitialized();
    return this.getCached(`search_multi_${query}_${page}`, async () => {
      const response = await this.api.get('/search/multi', { params: { query, page } });
      const data = response.data;
      const filtered = (data.results || []).filter(
        item => item.media_type === 'movie' || item.media_type === 'tv'
      );
      const normalized = filtered.map(item => ({
        id: item.id,
        media_type: item.media_type,
        title: item.title || item.name || 'Sem título',
        original_title: item.original_title || item.original_name,
        overview: item.overview || '',
        poster_path: this.getImageUrl(item.poster_path),
        backdrop_path: this.getImageUrl(item.backdrop_path, 'w1280'),
        release_date: item.release_date || item.first_air_date || '',
        vote_average: item.vote_average || 0,
        type: item.media_type === 'movie' ? 'filme' : 'serie',
      }));
      return {
        results: normalized,
        total_results: data.total_results,
        total_pages: data.total_pages,
        page: data.page,
      };
    });
  }
  async getTVDetails(id) {
    await this.ensureInitialized();
    return this.getCached(`tv_details_${id}`, async () => {
      const response = await this.api.get(`/tv/${id}`, { params: { language: 'pt-BR' } });
      return response.data;
    });
  }

  async getTVSeason(id, seasonNumber) {
    await this.ensureInitialized();
    return this.getCached(`tv_season_${id}_${seasonNumber}`, async () => {
      const response = await this.api.get(`/tv/${id}/season/${seasonNumber}`, { params: { language: 'pt-BR' } });
      return response.data;
    });
  }

  async getMovieDetails(id) {
    await this.ensureInitialized();
    return this.getCached(`movie_details_${id}`, async () => {
      const response = await this.api.get(`/movie/${id}`, { params: { language: 'pt-BR' } });
      return response.data;
    });
  }

  async getVideos(id, type = 'movie') {
    await this.ensureInitialized();
    return this.getCached(`${type}_videos_${id}`, async () => {
      // Buscar trailers, forçando inglês caso o PT-BR não tenha trailer disponível
      let res = await this.api.get(`/${type}/${id}/videos`, { params: { language: 'pt-BR' } });
      if (res.data.results.length === 0) {
        res = await this.api.get(`/${type}/${id}/videos`, { params: { language: 'en-US' } });
      }
      return res.data;
    });
  }
}

export const tmdbService = new TMDBService();
