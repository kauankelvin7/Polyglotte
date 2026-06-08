// Escuta mudanças em qualquer tag <video> na página atual (ou iframe)
function initVideoListener() {
  const videos = document.querySelectorAll('video');
  
  videos.forEach(video => {
    // Evitar adicionar múltiplos listeners no mesmo vídeo
    if (video.dataset.polyglotteInjected) return;
    video.dataset.polyglotteInjected = 'true';

    // Envia o tempo a cada atualização (geralmente a cada 250ms durante a reprodução)
    video.addEventListener('timeupdate', () => {
      try {
        window.top.postMessage({
          type: 'POLYGLOTTE_TIMEUPDATE',
          payload: {
            currentTime: video.currentTime,
            duration: video.duration,
            paused: video.paused
          }
        }, '*');
      } catch (e) {
        // Falha silenciosa caso o window.top não esteja acessível (ex: sandbox muito estrito)
      }
    });

    video.addEventListener('play', () => {
      try {
        window.top.postMessage({ type: 'POLYGLOTTE_PLAY' }, '*');
      } catch (e) {}
    });

    video.addEventListener('pause', () => {
      try {
        window.top.postMessage({ type: 'POLYGLOTTE_PAUSE' }, '*');
      } catch (e) {}
    });
  });
}

// Configura um MutationObserver para pegar vídeos criados dinamicamente (comum em players web)
const observer = new MutationObserver(() => {
  initVideoListener();
});

// Inicia assim que o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  initVideoListener();
  observer.observe(document.body, { childList: true, subtree: true });
});

// Em caso do script rodar após o DOMContentLoaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initVideoListener();
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
}
