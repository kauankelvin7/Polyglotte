import axios from 'axios';
import Parser from 'srt-parser-2';

const SUBDL_API_KEY = 'subdl_kzzm7NSfwdoIoDSmccRy3ElmXd-GgTnFXnJWYZtucX4';
const parser = new Parser();

class SubtitleService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.subdl.com/api/v1',
      params: {
        api_key: SUBDL_API_KEY,
      }
    });
  }

  /**
   * Busca e formata as legendas para um filme ou episódio específico
   * @param {Object} media - { id: tmdb_id, type: 'filme' | 'serie', season, episode }
   * @returns {Promise<{ en: Array, pt: Array }>}
   */
  async getDualSubtitles(media) {
    try {
      const type = media.type === 'filme' ? 'movie' : 'tv';
      
      const params = {
        tmdb_id: media.id,
        type: type,
        languages: 'EN,PT',
        unpack: 1
      };

      if (type === 'tv') {
        params.season_number = media.season || 1;
        params.episode_number = media.episode || 1;
      }

      console.log('Pesquisando legendas na SubDL...', params);
      const response = await this.api.get('/subtitles', { params });
      
      if (!response.data.status || !response.data.subtitles) {
        throw new Error('Nenhuma legenda encontrada.');
      }

      const subtitlesList = response.data.subtitles;
      
      // Coleta todas as URLs possíveis de EN e PT
      const enUrls = [];
      const ptUrls = [];

      for (const sub of subtitlesList) {
        if (!sub.unpack_files) continue;

        // Se for série, ignorar pacotes de temporadas diferentes (se for especificado)
        if (type === 'tv' && sub.season_number > 0 && sub.season_number !== media.season) {
          continue;
        }
        
        // Se for série e tiver episódio específico que não bate
        if (type === 'tv' && sub.episode_number > 0 && sub.episode_number !== media.episode) {
          continue;
        }

        for (const file of sub.unpack_files) {
          if (file.format !== 'srt') continue;
          
          // Se for Season Pack (sem episódio específico no root), buscar pelo nome do arquivo
          if (type === 'tv' && (!sub.episode_number || sub.episode_number === 0)) {
            const fileName = (file.name || file.file_name || '').toUpperCase();
            const epStr1 = `E${String(media.episode).padStart(2, '0')}`; // Ex: E05
            const epStr2 = `${media.season}X${String(media.episode).padStart(2, '0')}`; // Ex: 1x05
            const epStr3 = `EP${String(media.episode).padStart(2, '0')}`; // Ex: EP05
            const epStr4 = `EPISODE ${media.episode}`;
            
            if (!fileName.includes(epStr1) && !fileName.includes(epStr2) && !fileName.includes(epStr3) && !fileName.includes(epStr4)) {
              continue; // Arquivo não é do episódio desejado
            }
          }

          if (file.language === 'EN') {
            enUrls.push(file.url);
          }
          const lang = file.language.toUpperCase();
          if (lang === 'PT' || lang === 'BR' || lang === 'PT-BR' || lang === 'PTBR' || lang === 'PB' || lang.includes('PORTUGUES')) {
            ptUrls.push(file.url);
          }
        }
      }

      const downloadSequential = async (urls) => {
        for (const url of urls) {
          const content = await this.downloadRawSrt(url);
          // Verifica se o conteúdo é realmente um SRT válido e não uma página HTML de erro (ex: 404 fake)
          if (content && typeof content === 'string' && content.includes('-->')) {
            return content;
          }
        }
        return null;
      };

      const [enSrtText, ptSrtText] = await Promise.all([
        downloadSequential(enUrls),
        downloadSequential(ptUrls),
      ]);

      return {
        en: enSrtText ? parser.fromSrt(enSrtText) : [],
        pt: ptSrtText ? parser.fromSrt(ptSrtText) : [],
      };

    } catch (error) {
      console.error('Erro ao processar legendas:', error);
      return { en: [], pt: [] };
    }
  }

  async downloadRawSrt(path) {
    try {
      // SubDL retorna o path tipo "/subtitle/123/456"
      const downloadUrl = `https://dl.subdl.com${path}`;
      const res = await axios.get(downloadUrl, { responseType: 'text' });
      return res.data;
    } catch (e) {
      console.error('Falha ao baixar arquivo srt:', path, e);
      return null;
    }
  }

  /**
   * Encontra a linha de legenda correta baseada no tempo atual do vídeo
   */
  findSubtitleForTime(subsArray, timeInSeconds) {
    if (!subsArray || subsArray.length === 0) return '';
    
    // Opcional: usar busca binária para otimizar, mas para a maioria dos filmes
    // um array simple.find ou filter é rápido o suficiente
    const match = subsArray.find(sub => {
      return timeInSeconds >= sub.startSeconds && timeInSeconds <= sub.endSeconds;
    });

    return match ? match.text : '';
  }
}

export const subtitleService = new SubtitleService();
