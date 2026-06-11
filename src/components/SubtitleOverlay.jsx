import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Cache em memória para evitar refetch da mesma palavra ────────────────────
const wordCache = {};

/**
 * Traduz um texto EN→PT usando o endpoint informal do Google Translate.
 * Muito mais preciso que MyMemory para palavras isoladas e expressões curtas.
 */
async function googleTranslate(text, targetLang = 'pt') {
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const json = await res.json();
    // Estrutura: [[["translated","original",...]], ...]
    // Concatena todos os segmentos traduzidos (frases longas podem ser quebradas)
    const translated = json?.[0]
      ?.map((seg) => seg?.[0] ?? '')
      .join('')
      .trim();
    return translated && translated.toLowerCase() !== text.toLowerCase()
      ? translated
      : '';
  } catch (_) {
    return '';
  }
}

/**
 * Busca dados reais de uma palavra:
 * 1. Free Dictionary API    → fonética, classe gramatical, exemplos em inglês
 * 2. Google Translate (gtx) → tradução EN→PT precisa (palavra + exemplos)
 */
async function fetchWordData(word) {
  const key = word.toLowerCase();

  if (wordCache[key]) return wordCache[key];

  // Busca paralela: dicionário EN + tradução da palavra
  const [dictRes, wordTranslation] = await Promise.allSettled([
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`),
    googleTranslate(key),
  ]);

  // ── Tradução PT-BR ──────────────────────────────────────────────────────────
  let translation =
    wordTranslation.status === 'fulfilled' && wordTranslation.value
      ? wordTranslation.value
      : '(tradução indisponível)';

  // ── Dicionário EN ───────────────────────────────────────────────────────────
  let phonetic = '';
  let partOfSpeech = '—';
  let examples = [];

  if (dictRes.status === 'fulfilled' && dictRes.value.ok) {
    try {
      const dictJson = await dictRes.value.json();
      const entry = dictJson[0];

      // Fonética
      phonetic =
        entry?.phonetic ||
        entry?.phonetics?.find((p) => p.text)?.text ||
        `/${key}/`;

      // Primeira classe gramatical encontrada
      const meaning = entry?.meanings?.[0];
      partOfSpeech = meaning?.partOfSpeech || '—';

      // Até 2 exemplos em inglês — prefere exemplos com frase, senão usa definição
      const defs = meaning?.definitions || [];
      const withExample = defs.filter((d) => d.example).slice(0, 2);
      examples =
        withExample.length > 0
          ? withExample.map((d) => ({ en: d.example, pt: '' }))
          : defs.slice(0, 2).map((d) => ({ en: d.definition, pt: '' }));
    } catch (_) { /* silencioso */ }
  }

  // Traduz exemplos EN→PT com Google Translate (paralelo, best-effort)
  if (examples.length > 0) {
    const translated = await Promise.allSettled(
      examples.map((ex) => googleTranslate(ex.en))
    );
    examples = examples.map((ex, i) => ({
      en: ex.en,
      pt: translated[i].status === 'fulfilled' ? translated[i].value : '',
    }));
  }

  // Fallback de exemplos se a API não retornou nada
  if (examples.length === 0) {
    examples = [
      { en: `The word "${key}" is commonly used in English.`, pt: '' },
    ];
  }

  const result = { word: key, translation, phonetic, partOfSpeech, examples };
  wordCache[key] = result;
  return result;
}

// ─── Componente WordMiningCard (Tooltip Glassmorphism) ────────────────────────
const WordMiningCard = ({ data, loading, position, onClose }) => {
  const cardRef = useRef(null);
  const [cardStyle, setCardStyle] = useState({ opacity: 0 });

  // Fecha ao clicar fora do card
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Posicionamento inteligente: centraliza acima da palavra clicada
  useEffect(() => {
    if (!cardRef.current || !position) return;

    const card = cardRef.current;
    const cardRect = card.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let left = position.x - cardRect.width / 2;
    let top = position.y - cardRect.height - 16;

    if (left < 12) left = 12;
    if (left + cardRect.width > viewportW - 12) left = viewportW - cardRect.width - 12;
    if (top < 12) top = position.y + 30;
    if (top + cardRect.height > viewportH - 12) top = viewportH - cardRect.height - 12;

    setCardStyle({
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      opacity: 1,
      transform: 'translateY(0)',
    });
  }, [position, loading]);

  return (
    <div
      ref={cardRef}
      className="z-[9999] w-[340px] md:w-[380px] transition-all duration-300 ease-out"
      style={{ ...cardStyle, position: 'fixed' }}
    >
      <div
        className="
          relative overflow-hidden rounded-2xl
          bg-[rgba(12,12,16,0.88)] backdrop-blur-[40px]
          border border-[rgba(255,255,255,0.08)]
          shadow-[0_8px_48px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)]
          p-5
        "
      >
        {/* Faixa superior gradiente decorativa */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pg-accent to-pg-purple opacity-60" />

        {/* Brilho interno decorativo */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-pg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Header: Palavra + Fechar */}
        <div className="flex items-start justify-between mb-4 relative">
          <div className="flex-1">
            {/* Palavra com gradiente */}
            <h3
              className="text-2xl md:text-3xl font-display font-bold leading-tight"
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {data?.word || '…'}
            </h3>
            {/* Fonética + Classe gramatical */}
            {!loading && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {data?.phonetic && (
                  <span className="text-sm text-white/40 font-mono">{data.phonetic}</span>
                )}
                {data?.partOfSpeech && data.partOfSpeech !== '—' && (
                  <span className="text-[10px] uppercase tracking-widest text-pg-accent/70 font-medium bg-pg-accent/10 px-2 py-0.5 rounded-full">
                    {data.partOfSpeech}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Botão Fechar */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="
              ml-3 mt-0.5 w-7 h-7 flex items-center justify-center rounded-full
              bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/70
              transition-all duration-200 flex-shrink-0
            "
            aria-label="Fechar"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Estado de carregamento */}
        {loading ? (
          <div className="flex flex-col gap-3 py-2">
            {/* Skeleton tradução */}
            <div className="py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="h-2.5 w-20 bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
            </div>
            {/* Skeleton exemplos */}
            <div className="flex flex-col gap-3">
              <div className="h-2.5 w-24 bg-white/10 rounded animate-pulse" />
              {[1, 2].map((i) => (
                <div key={i} className="pl-3 border-l-2 border-white/10 flex flex-col gap-1.5">
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Tradução */}
            <div className="mb-4 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 font-medium">Tradução</p>
              <p className="text-base md:text-lg text-white font-medium leading-snug">{data?.translation}</p>
            </div>

            {/* Exemplos de uso */}
            {data?.examples?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-3 font-medium">Exemplos de uso</p>
                <div className="flex flex-col gap-3">
                  {data.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="pl-3 border-l-2 border-pg-accent/20 hover:border-pg-accent/50 transition-colors duration-200"
                    >
                      <p className="text-sm text-white/90 leading-relaxed font-medium">{ex.en}</p>
                      {ex.pt && (
                        <p className="text-xs text-white/40 mt-0.5 leading-relaxed italic">{ex.pt}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Rodapé */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-1.5">
          <span className="text-[10px] text-white/20 font-medium tracking-wide">⛏ Sentence Mining</span>
          <span className="flex-1" />
          {loading
            ? <span className="text-[9px] text-pg-accent/30 animate-pulse">buscando…</span>
            : <span className="text-[9px] text-white/15 font-mono">Free Dictionary + Google Translate</span>
          }
        </div>
      </div>
    </div>
  );
};

// ─── Componente InteractiveWord ────────────────────────────────────────────────
const InteractiveWord = ({ token, onWordClick, isActive }) => {
  // Tokens que são só espaço/pontuação pura — não são clicáveis
  const cleanedLetter = token.replace(/[^a-zA-Z'-]/g, '');
  if (!cleanedLetter) return <>{token}</>;

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onWordClick(token, { x: rect.left + rect.width / 2, y: rect.top });
      }}
      className={`
        cursor-pointer select-none
        transition-all duration-200 ease-out
        rounded-sm
        ${isActive
          ? 'text-pg-accent'
          : 'hover:text-pg-accent/90 hover:bg-pg-accent/10 px-[1px]'
        }
      `}
      style={{
        textShadow: isActive ? '0 0 14px rgba(34,211,238,0.45)' : 'none',
      }}
    >
      {token}
    </span>
  );
};

// ─── Componente Principal: SubtitleOverlay ─────────────────────────────────────
const SubtitleOverlay = ({ subtitleData, visibility = { en: true, pt: true } }) => {
  const [visible, setVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);   // chave limpa (lowercase)
  const [cardWord, setCardWord]       = useState(null);   // display word para o header imediato
  const [wordData, setWordData]       = useState(null);
  const [cardPosition, setCardPosition] = useState(null);
  const [loading, setLoading]         = useState(false);

  // Animação de entrada da legenda
  useEffect(() => {
    if (subtitleData?.en || subtitleData?.pt) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [subtitleData?.en, subtitleData?.pt]);

  // Fecha o card quando a linha da legenda muda
  useEffect(() => {
    setSelectedKey(null);
    setWordData(null);
    setCardPosition(null);
    setCardWord(null);
  }, [subtitleData?.en]);

  // Limpa tags HTML comuns em arquivos SRT (<i>, <b>, <font>, etc.)
  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '');
  };

  const handleWordClick = useCallback(async (token, position) => {
    const key = token.toLowerCase().replace(/[^a-z'-]/g, '');
    if (!key) return;

    // Toggle: clique na mesma palavra fecha o card
    if (selectedKey === key) {
      setSelectedKey(null);
      setWordData(null);
      setCardPosition(null);
      setCardWord(null);
      return;
    }

    // Abre o card imediatamente com skeleton, depois popula com dados reais
    setSelectedKey(key);
    setCardWord(key);
    setWordData(null);
    setCardPosition(position);
    setLoading(true);

    try {
      const data = await fetchWordData(key);
      setWordData(data);
    } catch (_) {
      setWordData({
        word: key,
        translation: '(erro ao buscar tradução)',
        phonetic: `/${key}/`,
        partOfSpeech: '—',
        examples: [],
      });
    } finally {
      setLoading(false);
    }
  }, [selectedKey]);

  const handleCloseCard = useCallback(() => {
    setSelectedKey(null);
    setWordData(null);
    setCardPosition(null);
    setCardWord(null);
  }, []);

  /**
   * Renderiza a string EN como spans inline interativos.
   * Usa split com regex que preserva espaços como tokens separados,
   * garantindo que as palavras ficam separadas visualmente sem usar flex gap.
   */
  const renderInteractiveWords = (text) => {
    const cleaned = cleanText(text);
    if (!cleaned) return null;

    // Divide em: [palavra+pontuação] e [espaços]
    // O regex captura grupos de não-espaços OU espaços
    const tokens = cleaned.match(/\S+|\s+/g) || [];

    return tokens.map((token, idx) => {
      // Espaços: renderiza literalmente para preservar o espaçamento natural
      if (/^\s+$/.test(token)) {
        return <span key={`sp-${idx}`}>{token}</span>;
      }

      const key = token.toLowerCase().replace(/[^a-z'-]/g, '');

      return (
        <InteractiveWord
          key={`w-${idx}-${token}`}
          token={token}
          onWordClick={handleWordClick}
          isActive={!!key && selectedKey === key}
        />
      );
    });
  };

  if (!subtitleData?.en && !subtitleData?.pt) return null;

  return (
    <>
      <div
        className={`
          w-full max-w-5xl px-4 flex flex-col items-center justify-center text-center
          transition-all duration-300
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}
      >
        {/* Linha primária — EN (Sentence Mining interativo) */}
        {visibility.en && subtitleData?.en && (
          <p className="text-xl md:text-3xl font-display font-bold text-white mb-1 md:mb-2 leading-snug drop-shadow-md">
            {renderInteractiveWords(subtitleData.en)}
          </p>
        )}

        {/* Linha secundária — PT */}
        {visibility.pt && subtitleData?.pt && (
          <p className="text-sm md:text-lg font-sans font-normal text-slate-400 tracking-wide drop-shadow-md">
            {cleanText(subtitleData.pt)}
          </p>
        )}
      </div>

      {/* Card flutuante de Sentence Mining */}
      {(cardWord || loading) && cardPosition && (
        <WordMiningCard
          data={wordData ? wordData : { word: cardWord }}
          loading={loading}
          position={cardPosition}
          onClose={handleCloseCard}
        />
      )}
    </>
  );
};

export default SubtitleOverlay;
