import { useState, useEffect } from 'react';
import { Search, PlayCircle, Settings, X, GraduationCap } from 'lucide-react';

const HelpModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('polyglotte_help_seen');
    if (!hasSeenHelp) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('polyglotte_help_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="glass max-w-lg w-full rounded-3xl p-8 relative animate-fade-up shadow-2xl border border-white/10">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
          title="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 border border-orange-500/30">
            <GraduationCap className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Bem-vindo ao Polyglotte!</h2>
          <p className="text-white/60 text-sm">Sua nova forma de aprender idiomas assistindo seus filmes e séries favoritos.</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/10 text-orange-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">Como pesquisar</h3>
              <p className="text-sm text-white/60 leading-relaxed">Use a barra de pesquisa no topo da tela para encontrar o conteúdo desejado, ou navegue pelas nossas categorias.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/10 text-orange-400">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">Assistindo</h3>
              <p className="text-sm text-white/60 leading-relaxed">Clique em qualquer capa de filme ou série para abrir os detalhes. Escolha o episódio (se for série) e clique em "Assistir Agora".</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/10 text-orange-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">Players e Legendas</h3>
              <p className="text-sm text-white/60 leading-relaxed">Dentro do player, clique no ícone de <b>engrenagem ⚙️</b> no canto superior direito para trocar o servidor de vídeo, sincronizar legendas ou ativá-las/desativá-las individualmente.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleClose}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          Entendi, vamos começar!
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
