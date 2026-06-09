# 🍿 Polyglotte

*[Ler versão em Português](#-polyglotte---português)*

Polyglotte is a modern web application designed to transform the way you watch movies and series into an immersive language-learning experience. Featuring a stunning, cinematic UI inspired by premium streaming platforms, Polyglotte allows you to watch your favorite content with **dual simultaneous subtitles**.

## ✨ Features

- **Dual Subtitles**: Display two subtitles simultaneously (e.g., English and Portuguese) to easily cross-reference vocabulary and context.
- **Cinematic User Interface**: A highly polished, dark-themed UI with glassmorphism effects, dynamic gradients, and smooth micro-animations.
- **Dynamic Catalog**: Automatically fetches trending movies, popular series, anime, and categorized content directly from the TMDB API.
- **Smart History Tracker**: The "Continuar Assistindo" (Continue Watching) row remembers exactly where you left off, including the specific season, episode, and timestamp.
- **Binge-Watching Mode**: Seamlessly jump to the next episode with the built-in next-episode feature.
- **Smart Auto-Sync**: Easily synchronize external subtitles by clicking a single button exactly when you hear the dialogue being spoken.
- **Alternative Video Servers**: Built-in support for multiple robust video providers ensuring your content is always available.
- **Custom Subtitle Uploads**: Didn't find the subtitle automatically? Simply drag and drop your `.srt` files directly into the player.
- **Toggle Languages**: Easily disable one of the subtitles if you just want to focus on a single language.

## 🧩 Chrome Extension (Required for Superflix)

To sync subtitles correctly when using the **SuperFlix** server, you need to install the companion Chrome extension.

**How to install and use the extension:**
1. Open Google Chrome.
2. Type `chrome://extensions/` in your address bar and press Enter.
3. Turn on **Developer mode** (toggle in the top right corner).
4. Click on **Load unpacked**.
5. Select the `polyglotte-extension` folder located inside this project directory.
6. The extension is now active! It will work automatically in the background to sync the video time with Polyglotte's dual subtitles.

## 🛠️ Technologies & Stack

- **Frontend**: React (via Vite)
- **Styling**: Tailwind CSS
- **Data**: TMDB API
- **Video Players**: Third-party iframe embeds
- **Subtitle Parsing**: `srt-parser-2`

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kauankelvin7/Polyglotte.git
   cd Polyglotte
   npm install
   ```
2. **Environment Variables:**
   Create a `.env` file in the root directory and add your TMDB API Key:
   ```env
   VITE_TMDB_KEY=your_tmdb_api_key_here
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```

---

# 🍿 Polyglotte - Português

Polyglotte é uma aplicação web moderna projetada para transformar a maneira como você assiste filmes e séries em uma experiência imersiva de aprendizado de idiomas. Com uma interface de usuário cinematográfica inspirada em plataformas de streaming premium, o Polyglotte permite que você assista seu conteúdo favorito com **legendas duplas simultâneas**.

## ✨ Funcionalidades

- **Legendas Duplas**: Exiba duas legendas simultaneamente (ex: Inglês e Português) para cruzar referências de vocabulário e contexto facilmente.
- **Interface Cinematográfica**: Interface escura altamente polida com efeitos de "glassmorphism", gradientes dinâmicos e microanimações suaves.
- **Catálogo Dinâmico**: Busca automaticamente filmes em alta, séries populares, animes e conteúdo categorizado diretamente da API do TMDB.
- **Histórico Inteligente**: A fileira "Continuar Assistindo" lembra exatamente de onde você parou (temporada, episódio e tempo exato).
- **Modo Maratona (Binge-Watching)**: Pule para o próximo episódio facilmente.
- **Sincronia Automática (Auto-Sync)**: Sincronize legendas externas facilmente clicando em um botão exatamente no momento em que a fala acontece.
- **Servidores Alternativos de Vídeo**: Suporte embutido para múltiplos provedores de vídeo robustos.
- **Upload de Legendas**: Não encontrou a legenda automaticamente? Arraste e solte seus arquivos `.srt` diretamente no player.
- **Controle de Exibição**: Ative ou desative idiomas individuais pelo menu de configurações se quiser focar apenas em uma língua.

## 🧩 Extensão do Chrome (Necessária para o Superflix)

Para sincronizar as legendas corretamente ao usar o servidor **SuperFlix**, você precisa instalar a extensão do Chrome que acompanha o projeto.

**Como instalar e usar a extensão:**
1. Abra o Google Chrome.
2. Digite `chrome://extensions/` na barra de endereços e aperte Enter.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** (Load unpacked).
5. Selecione a pasta `polyglotte-extension` que fica dentro do diretório deste projeto.
6. A extensão agora está ativa! Ela funcionará automaticamente em segundo plano para sincronizar o tempo do vídeo com as legendas duplas do Polyglotte.

## 🛠️ Tecnologias

- **Frontend**: React (via Vite)
- **Estilização**: Tailwind CSS
- **Dados**: TMDB API
- **Players de Vídeo**: Iframes de terceiros
- **Leitura de Legendas**: `srt-parser-2`

## 🚀 Como Rodar

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/kauankelvin7/Polyglotte.git
   cd Polyglotte
   npm install
   ```
2. **Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto e adicione sua chave da API do TMDB:
   ```env
   VITE_TMDB_KEY=sua_chave_da_api_tmdb_aqui
   ```
3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🤝 Contribuições

Contribuições, problemas e solicitações de recursos são bem-vindos! Sinta-se à vontade para verificar a [página de issues](https://github.com/kauankelvin7/Polyglotte/issues).

## 👨‍💻 Autor

Desenvolvido por [Kauan Kelvin](https://github.com/kauankelvin7).
