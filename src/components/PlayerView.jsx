import { useState, useEffect, useRef } from 'react';
import { buildPlayerUrl, PROVIDERS } from '../config/api';
import { subtitleService } from '../config/subtitles';
import { saveProgress } from '../config/storage';
import SubtitleOverlay from './SubtitleOverlay';
import { X, Loader2, Settings, Upload, Target } from 'lucide-react';
import Parser from 'srt-parser-2';

const parser = new Parser();

const PlayerView = ({ media, onClose, onPlay }) => {
  const [subs, setSubs] = useState({ en: [], pt: [] });
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [syncOffset, setSyncOffset] = useState(0); // em segundos
  const [showSettings, setShowSettings] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [provider, setProvider] = useState(PROVIDERS.SUPERFLIX);
  
  const [subtitleData, setSubtitleData] = useState({
    en: "Carregando legendas inteligentes...",
    pt: "Buscando no banco de dados...",
  });

  const lastTimeRef = useRef(0);
  const lastSavedTimeRef = useRef(0);

  // 1. Carregar as legendas na inicialização do Player
  useEffect(() => {
    let cancelled = false;
    setLoadingSubs(true);
    setSyncOffset(0);
    
    subtitleService.getDualSubtitles(media)
      .then((parsedSubs) => {
        if (cancelled) return;
        setSubs(parsedSubs);
        
        if (parsedSubs.en.length === 0 && parsedSubs.pt.length === 0) {
          setSubtitleData({
            en: "Subtitles not found for this media.",
            pt: "Legendas não encontradas. Tente fazer upload manual na engrenagem.",
          });
        } else {
          setSubtitleData({
            en: "Subtitles loaded! Waiting for video to start...",
            pt: "Legendas carregadas! Aguardando o vídeo iniciar...",
          });
        }
      })
      .catch((e) => {
        if (!cancelled) setSubtitleData({ en: "Error loading subtitles.", pt: "Erro ao carregar legendas." });
      })
      .finally(() => {
        if (!cancelled) setLoadingSubs(false);
      });

    return () => { cancelled = true; };
  }, [media.id, media.season, media.episode]);

  // 2. Escutar os tempos do vídeo via extensão do Chrome (postMessage)
  useEffect(() => {
    const handler = (event) => {
      const processTime = (rawTime) => {
        lastTimeRef.current = rawTime;
        
        // Salvar progresso a cada 10 segundos para "Continuar Assistindo"
        if (rawTime > 5 && rawTime - lastSavedTimeRef.current > 10) {
          lastSavedTimeRef.current = rawTime;
          saveProgress({
            ...media,
            timestamp: rawTime
          });
        }

        // Binge-Watching (Detectar fim do episódio)
        if (media.type === 'serie' && subs.en.length > 0) {
          const lastSubTime = subs.en[subs.en.length - 1].endSeconds;
          // Mostra o botão nos últimos 40 segundos do episódio real (segundo as legendas)
          if (rawTime > lastSubTime - 40 && rawTime < lastSubTime + 30) {
            setShowNextEpisode(true);
          } else {
            setShowNextEpisode(false);
          }
        }

        // Aplica o offset global (searchTime = videoTime - offset)
        const searchTime = rawTime - syncOffset;
        
        const currentEn = subtitleService.findSubtitleForTime(subs.en, searchTime);
        const currentPt = subtitleService.findSubtitleForTime(subs.pt, searchTime);

        setSubtitleData(prev => {
          if (prev.en !== currentEn || prev.pt !== currentPt) {
            return { en: currentEn, pt: currentPt };
          }
          return prev;
        });
      };

      // Extensão Chrome do Superflix
      if (event.data?.type === 'POLYGLOTTE_TIMEUPDATE') {
        processTime(event.data.payload.currentTime);
      }
      
      // Evento Nativo do VidLink (Vidlink envia timeupdates automaticamente)
      if (event.origin === 'https://vidlink.pro' && event.data?.type === 'PLAYER_EVENT') {
        if (event.data.data.event === 'timeupdate') {
          processTime(event.data.data.currentTime);
        }
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [subs, syncOffset]);

  // Auto-Sync Workflow
  const handleAutoSync = () => {
    const time = lastTimeRef.current;
    const refSubs = subs.en.length > 0 ? subs.en : subs.pt;
    
    if (refSubs.length === 0) {
      alert('Nenhuma legenda carregada para sincronizar.');
      return;
    }

    // Achar a legenda mais próxima do tempo atual
    let closestSub = refSubs[0];
    let minDiff = Infinity;
    
    for (const s of refSubs) {
      // Ignora o offset antigo para achar a fala original mais próxima do tempo do vídeo
      // A lógica é: O usuário clicou AGORA. Esse AGORA deve bater com o startSeconds de alguma legenda.
      const diff = Math.abs(s.startSeconds - time);
      if (diff < minDiff) {
        minDiff = diff;
        closestSub = s;
      }
    }

    if (closestSub) {
      const newOffset = time - closestSub.startSeconds;
      setSyncOffset(newOffset);
      setShowSettings(false);
      // Feedback visual rápido no overlay
      setSubtitleData({
        en: "SYNC ANCHORED",
        pt: `Sincronizado! Offset: ${(newOffset).toFixed(2)}s`
      });
    }
  };

  const handleFileUpload = (e, lang) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = parser.fromSrt(event.target.result);
      setSubs(prev => ({ ...prev, [lang]: parsed }));
      setSubtitleData({
        en: lang === 'en' ? "Local EN subtitle loaded!" : subtitleData.en,
        pt: lang === 'pt' ? "Legenda PT local carregada!" : subtitleData.pt,
      });
    };
    reader.readAsText(file);
  };

  const url = buildPlayerUrl({
    type:    media.type,
    id:      media.id,
    season:  media.season  || '1',
    episode: media.episode || '1',
    provider: provider,
  });

  return (
    <div className="flex flex-col w-screen h-screen bg-pg-bg relative">
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute top-20 right-4 z-50 glass p-6 rounded-2xl w-80 shadow-2xl flex flex-col gap-6 animate-fade-up max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-lg">⚙ Configurações</h3>
            <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5"/></button>
          </div>

          {/* Servidor Section */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-pg-muted">Servidor de Vídeo</p>
            <div className="flex bg-black/40 rounded-xl overflow-hidden p-1">
              {Object.values(PROVIDERS).map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${provider === p ? 'bg-orange-600 text-black' : 'text-white/50 hover:text-white'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Sync Section */}
          <div className="flex flex-col gap-3">
            <p className="text-sm text-pg-muted">Sincronia Automática</p>
            <button 
              onClick={handleAutoSync}
              className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/50 text-orange-500 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors w-full"
            >
              <Target className="w-5 h-5" />
              <span>🎯 Clique ao ouvir a fala</span>
            </button>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-white/40">Offset atual:</span>
              <span className="text-xs font-mono text-orange-500">{(syncOffset * 1000).toFixed(0)}ms</span>
            </div>
            {/* Fine Tuning Visual */}
            <div className="flex flex-col gap-2 mt-2">
              <input 
                type="range" 
                min="-3" max="3" step="0.1" 
                value={syncOffset} 
                onChange={(e) => setSyncOffset(parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/30 px-1">
                <span>-3s</span>
                <span>0</span>
                <span>+3s</span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-pg-muted">Upload Manual (.srt)</p>
            </div>
            
            {!loadingSubs && subs.pt.length === 0 && (
              <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl mb-1">
                <p className="text-xs text-red-200 leading-tight">
                  <strong className="text-red-400 block mb-1">Legenda PT Órfã</strong>
                  Não encontramos o idioma no servidor. Arraste um arquivo <b>.srt</b> abaixo.
                </p>
              </div>
            )}
            
            <label className="cursor-pointer glass py-2.5 px-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
              <span className="text-sm text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Inglês (EN)</span>
              <input type="file" accept=".srt" className="hidden" onChange={(e) => handleFileUpload(e, 'en')} />
            </label>
            <label className="cursor-pointer glass py-2.5 px-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
              <span className="text-sm text-white font-medium flex items-center gap-2"><Upload className="w-4 h-4"/> Português (PT)</span>
              <input type="file" accept=".srt" className="hidden" onChange={(e) => handleFileUpload(e, 'pt')} />
            </label>
          </div>
        </div>
      )}

      {/* Player iframe Container */}
      <div className="relative flex-1 w-full bg-black">
        <iframe
          src={url}
          title={media.title || 'Player'}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        />

        {/* Toolbar Superior Direita */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`glass p-2.5 rounded-full transition-all shadow-lg ${showSettings ? 'text-orange-500 bg-white/10 border-orange-500/50' : 'text-white/60 hover:text-white'}`}
            title="Configurações de Legenda"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClose}
            className="glass p-2.5 rounded-full text-white/60 hover:text-white transition-colors shadow-lg"
            title="Fechar player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de carregamento */}
        {loadingSubs && (
          <div className="absolute top-4 left-4 z-20 glass px-4 py-2 rounded-full flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
            <span className="text-xs font-medium text-white/80">Baixando Legendas...</span>
          </div>
        )}

        {/* Botão Próximo Episódio (Binge-Watching) */}
        {showNextEpisode && (
          <div className="absolute bottom-6 right-6 z-40 animate-fade-up">
            <button 
              onClick={() => onPlay({ ...media, episode: media.episode + 1 })}
              className="bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-orange-500 transition-colors shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center gap-2"
            >
              Próximo Episódio <Play className="w-4 h-4 fill-black" />
            </button>
          </div>
        )}
      </div>

      {/* Barra Inferior de Legendas Bilíngues */}
      <div className="h-24 md:h-32 bg-pg-surface border-t border-pg-border flex flex-col items-center justify-center px-4 flex-shrink-0 relative">
        <SubtitleOverlay subtitleData={subtitleData} />
        
        {/* Floating Auto-Sync Quick Action Button */}
        <button 
          onClick={handleAutoSync}
          className="absolute right-6 top-1/2 -translate-y-1/2 glass p-3 rounded-full hover:bg-orange-600/20 hover:border-orange-600/50 hover:text-orange-500 text-white/40 transition-all group"
          title="Sincronizar fala atual (Auto-Sync)"
        >
          <Target className="w-5 h-5" />
          <span className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Auto-Sync (Clique na fala)
          </span>
        </button>
      </div>
    </div>
  );
};

export default PlayerView;
