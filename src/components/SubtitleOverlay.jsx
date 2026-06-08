import { useState, useEffect } from 'react';

const SubtitleOverlay = ({ subtitleData }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (subtitleData?.en) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [subtitleData?.en]);

  if (!subtitleData?.en) return null;

  // Função para limpar tags HTML comuns em arquivos SRT (<i>, <b>, <font>, etc.)
  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div
      className={`
        w-full max-w-5xl px-4 flex flex-col items-center justify-center text-center
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {/* Linha primária — EN */}
      <p className="text-xl md:text-3xl font-display font-bold text-white mb-1 md:mb-2 leading-snug drop-shadow-md">
        {cleanText(subtitleData.en)}
      </p>

      {/* Linha secundária — PT */}
      <p className="text-sm md:text-lg font-sans font-normal text-slate-400 tracking-wide drop-shadow-md">
        {cleanText(subtitleData.pt)}
      </p>
    </div>
  );
};

export default SubtitleOverlay;
