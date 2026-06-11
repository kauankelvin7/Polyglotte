import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Mock Dictionary ──────────────────────────────────────────────────────────
// Simula uma API de dicionário EN→PT. Retorna tradução + 2 exemplos de uso.
const MOCK_DICTIONARY = {
  // Verbos comuns
  the:     { translation: 'o / a / os / as', phonetic: '/ðə/', partOfSpeech: 'artigo', examples: [{ en: 'The cat is on the table.', pt: 'O gato está na mesa.' }, { en: 'She is the best teacher.', pt: 'Ela é a melhor professora.' }] },
  is:      { translation: 'é / está', phonetic: '/ɪz/', partOfSpeech: 'verbo', examples: [{ en: 'She is a doctor.', pt: 'Ela é uma médica.' }, { en: 'It is raining outside.', pt: 'Está chovendo lá fora.' }] },
  are:     { translation: 'são / estão', phonetic: '/ɑːr/', partOfSpeech: 'verbo', examples: [{ en: 'They are my friends.', pt: 'Eles são meus amigos.' }, { en: 'We are going home.', pt: 'Nós estamos indo para casa.' }] },
  was:     { translation: 'foi / estava', phonetic: '/wɒz/', partOfSpeech: 'verbo', examples: [{ en: 'He was tired yesterday.', pt: 'Ele estava cansado ontem.' }, { en: 'It was a great movie.', pt: 'Foi um ótimo filme.' }] },
  have:    { translation: 'ter / possuir', phonetic: '/hæv/', partOfSpeech: 'verbo', examples: [{ en: 'I have two brothers.', pt: 'Eu tenho dois irmãos.' }, { en: 'We have to leave now.', pt: 'Nós temos que sair agora.' }] },
  do:      { translation: 'fazer', phonetic: '/duː/', partOfSpeech: 'verbo', examples: [{ en: 'What do you want?', pt: 'O que você quer?' }, { en: 'I do my homework every day.', pt: 'Eu faço minha lição todos os dias.' }] },
  go:      { translation: 'ir', phonetic: '/ɡoʊ/', partOfSpeech: 'verbo', examples: [{ en: 'Let\'s go to the park.', pt: 'Vamos ao parque.' }, { en: 'I go to school by bus.', pt: 'Eu vou à escola de ônibus.' }] },
  know:    { translation: 'saber / conhecer', phonetic: '/noʊ/', partOfSpeech: 'verbo', examples: [{ en: 'I know the answer.', pt: 'Eu sei a resposta.' }, { en: 'Do you know her?', pt: 'Você a conhece?' }] },
  think:   { translation: 'pensar / achar', phonetic: '/θɪŋk/', partOfSpeech: 'verbo', examples: [{ en: 'I think you\'re right.', pt: 'Eu acho que você está certo.' }, { en: 'Think before you speak.', pt: 'Pense antes de falar.' }] },
  want:    { translation: 'querer', phonetic: '/wɒnt/', partOfSpeech: 'verbo', examples: [{ en: 'I want some water.', pt: 'Eu quero um pouco de água.' }, { en: 'What do you want to eat?', pt: 'O que você quer comer?' }] },
  need:    { translation: 'precisar', phonetic: '/niːd/', partOfSpeech: 'verbo', examples: [{ en: 'I need your help.', pt: 'Eu preciso da sua ajuda.' }, { en: 'You need to study more.', pt: 'Você precisa estudar mais.' }] },
  come:    { translation: 'vir', phonetic: '/kʌm/', partOfSpeech: 'verbo', examples: [{ en: 'Come here, please.', pt: 'Venha aqui, por favor.' }, { en: 'She will come tomorrow.', pt: 'Ela virá amanhã.' }] },
  make:    { translation: 'fazer / criar', phonetic: '/meɪk/', partOfSpeech: 'verbo', examples: [{ en: 'Let\'s make a cake.', pt: 'Vamos fazer um bolo.' }, { en: 'This makes me happy.', pt: 'Isso me faz feliz.' }] },
  take:    { translation: 'pegar / levar', phonetic: '/teɪk/', partOfSpeech: 'verbo', examples: [{ en: 'Take your umbrella.', pt: 'Leve seu guarda-chuva.' }, { en: 'I\'ll take the bus.', pt: 'Eu vou pegar o ônibus.' }] },
  see:     { translation: 'ver', phonetic: '/siː/', partOfSpeech: 'verbo', examples: [{ en: 'I can see the mountains.', pt: 'Eu consigo ver as montanhas.' }, { en: 'See you tomorrow!', pt: 'Te vejo amanhã!' }] },
  look:    { translation: 'olhar', phonetic: '/lʊk/', partOfSpeech: 'verbo', examples: [{ en: 'Look at that sunset!', pt: 'Olhe aquele pôr do sol!' }, { en: 'You look great today.', pt: 'Você está ótimo(a) hoje.' }] },
  tell:    { translation: 'contar / dizer', phonetic: '/tɛl/', partOfSpeech: 'verbo', examples: [{ en: 'Tell me the truth.', pt: 'Me diga a verdade.' }, { en: 'She told a funny story.', pt: 'Ela contou uma história engraçada.' }] },
  say:     { translation: 'dizer', phonetic: '/seɪ/', partOfSpeech: 'verbo', examples: [{ en: 'What did you say?', pt: 'O que você disse?' }, { en: 'They say it\'s going to rain.', pt: 'Dizem que vai chover.' }] },
  get:     { translation: 'conseguir / obter', phonetic: '/ɡɛt/', partOfSpeech: 'verbo', examples: [{ en: 'I need to get some milk.', pt: 'Preciso comprar leite.' }, { en: 'Did you get my message?', pt: 'Você recebeu minha mensagem?' }] },
  give:    { translation: 'dar', phonetic: '/ɡɪv/', partOfSpeech: 'verbo', examples: [{ en: 'Give me a chance.', pt: 'Me dê uma chance.' }, { en: 'She gave him a gift.', pt: 'Ela deu um presente a ele.' }] },
  like:    { translation: 'gostar', phonetic: '/laɪk/', partOfSpeech: 'verbo', examples: [{ en: 'I like this song.', pt: 'Eu gosto dessa música.' }, { en: 'Do you like pizza?', pt: 'Você gosta de pizza?' }] },
  love:    { translation: 'amar', phonetic: '/lʌv/', partOfSpeech: 'verbo', examples: [{ en: 'I love my family.', pt: 'Eu amo minha família.' }, { en: 'She loves reading books.', pt: 'Ela ama ler livros.' }] },
  feel:    { translation: 'sentir', phonetic: '/fiːl/', partOfSpeech: 'verbo', examples: [{ en: 'I feel tired today.', pt: 'Eu me sinto cansado hoje.' }, { en: 'How do you feel about it?', pt: 'Como você se sente sobre isso?' }] },
  try:     { translation: 'tentar', phonetic: '/traɪ/', partOfSpeech: 'verbo', examples: [{ en: 'Try again later.', pt: 'Tente novamente mais tarde.' }, { en: 'I\'ll try my best.', pt: 'Vou dar o meu melhor.' }] },
  leave:   { translation: 'sair / deixar', phonetic: '/liːv/', partOfSpeech: 'verbo', examples: [{ en: 'I have to leave now.', pt: 'Eu tenho que sair agora.' }, { en: 'Don\'t leave me alone.', pt: 'Não me deixe sozinho.' }] },
  call:    { translation: 'ligar / chamar', phonetic: '/kɔːl/', partOfSpeech: 'verbo', examples: [{ en: 'Call me tonight.', pt: 'Me ligue hoje à noite.' }, { en: 'They call him "Doc".', pt: 'Eles o chamam de "Doc".' }] },
  find:    { translation: 'encontrar', phonetic: '/faɪnd/', partOfSpeech: 'verbo', examples: [{ en: 'I can\'t find my keys.', pt: 'Não consigo encontrar minhas chaves.' }, { en: 'She found a new job.', pt: 'Ela encontrou um novo emprego.' }] },
  keep:    { translation: 'manter / guardar', phonetic: '/kiːp/', partOfSpeech: 'verbo', examples: [{ en: 'Keep it a secret.', pt: 'Guarde segredo.' }, { en: 'Keep going, don\'t stop.', pt: 'Continue, não pare.' }] },
  run:     { translation: 'correr', phonetic: '/rʌn/', partOfSpeech: 'verbo', examples: [{ en: 'He can run very fast.', pt: 'Ele pode correr muito rápido.' }, { en: 'Run while you can!', pt: 'Corra enquanto pode!' }] },
  stop:    { translation: 'parar', phonetic: '/stɒp/', partOfSpeech: 'verbo', examples: [{ en: 'Stop talking, please.', pt: 'Pare de falar, por favor.' }, { en: 'The bus stopped here.', pt: 'O ônibus parou aqui.' }] },
  wait:    { translation: 'esperar', phonetic: '/weɪt/', partOfSpeech: 'verbo', examples: [{ en: 'Wait for me!', pt: 'Espere por mim!' }, { en: 'I can\'t wait any longer.', pt: 'Não posso esperar mais.' }] },
  help:    { translation: 'ajudar', phonetic: '/hɛlp/', partOfSpeech: 'verbo', examples: [{ en: 'Can you help me?', pt: 'Você pode me ajudar?' }, { en: 'He helped me with my homework.', pt: 'Ele me ajudou com a lição.' }] },
  talk:    { translation: 'conversar / falar', phonetic: '/tɔːk/', partOfSpeech: 'verbo', examples: [{ en: 'We need to talk.', pt: 'Precisamos conversar.' }, { en: 'She talks a lot.', pt: 'Ela fala muito.' }] },
  live:    { translation: 'viver / morar', phonetic: '/lɪv/', partOfSpeech: 'verbo', examples: [{ en: 'I live in Brazil.', pt: 'Eu moro no Brasil.' }, { en: 'Live your life fully.', pt: 'Viva sua vida plenamente.' }] },
  die:     { translation: 'morrer', phonetic: '/daɪ/', partOfSpeech: 'verbo', examples: [{ en: 'Flowers die in winter.', pt: 'Flores morrem no inverno.' }, { en: 'He didn\'t want to die.', pt: 'Ele não queria morrer.' }] },
  kill:    { translation: 'matar', phonetic: '/kɪl/', partOfSpeech: 'verbo', examples: [{ en: 'Don\'t kill the vibe.', pt: 'Não estrague o clima.' }, { en: 'Time kills everything.', pt: 'O tempo mata tudo.' }] },
  // Pronomes e artigos
  i:       { translation: 'eu', phonetic: '/aɪ/', partOfSpeech: 'pronome', examples: [{ en: 'I am a student.', pt: 'Eu sou um estudante.' }, { en: 'I love music.', pt: 'Eu amo música.' }] },
  you:     { translation: 'você / tu', phonetic: '/juː/', partOfSpeech: 'pronome', examples: [{ en: 'You are my best friend.', pt: 'Você é meu melhor amigo.' }, { en: 'I believe in you.', pt: 'Eu acredito em você.' }] },
  he:      { translation: 'ele', phonetic: '/hiː/', partOfSpeech: 'pronome', examples: [{ en: 'He is very tall.', pt: 'Ele é muito alto.' }, { en: 'He works at Google.', pt: 'Ele trabalha no Google.' }] },
  she:     { translation: 'ela', phonetic: '/ʃiː/', partOfSpeech: 'pronome', examples: [{ en: 'She loves painting.', pt: 'Ela ama pintar.' }, { en: 'She is coming later.', pt: 'Ela vem mais tarde.' }] },
  it:      { translation: 'isso / ele(a)', phonetic: '/ɪt/', partOfSpeech: 'pronome', examples: [{ en: 'It is what it is.', pt: 'É o que é.' }, { en: 'I like it a lot.', pt: 'Eu gosto muito disso.' }] },
  we:      { translation: 'nós', phonetic: '/wiː/', partOfSpeech: 'pronome', examples: [{ en: 'We are a team.', pt: 'Nós somos um time.' }, { en: 'Can we go now?', pt: 'Podemos ir agora?' }] },
  they:    { translation: 'eles / elas', phonetic: '/ðeɪ/', partOfSpeech: 'pronome', examples: [{ en: 'They live in New York.', pt: 'Eles moram em Nova York.' }, { en: 'They don\'t know yet.', pt: 'Eles ainda não sabem.' }] },
  my:      { translation: 'meu / minha', phonetic: '/maɪ/', partOfSpeech: 'pronome possessivo', examples: [{ en: 'This is my house.', pt: 'Esta é minha casa.' }, { en: 'My name is John.', pt: 'Meu nome é John.' }] },
  your:    { translation: 'seu / sua', phonetic: '/jʊr/', partOfSpeech: 'pronome possessivo', examples: [{ en: 'What is your name?', pt: 'Qual é o seu nome?' }, { en: 'Your idea is brilliant.', pt: 'Sua ideia é brilhante.' }] },
  his:     { translation: 'dele', phonetic: '/hɪz/', partOfSpeech: 'pronome possessivo', examples: [{ en: 'His car is very fast.', pt: 'O carro dele é muito rápido.' }, { en: 'That\'s his problem.', pt: 'Esse é o problema dele.' }] },
  her:     { translation: 'dela / ela', phonetic: '/hɜːr/', partOfSpeech: 'pronome', examples: [{ en: 'Her smile is beautiful.', pt: 'O sorriso dela é lindo.' }, { en: 'I gave her a flower.', pt: 'Eu dei uma flor a ela.' }] },
  // Substantivos comuns
  time:    { translation: 'tempo / hora', phonetic: '/taɪm/', partOfSpeech: 'substantivo', examples: [{ en: 'What time is it?', pt: 'Que horas são?' }, { en: 'Time flies when you\'re having fun.', pt: 'O tempo voa quando você está se divertindo.' }] },
  day:     { translation: 'dia', phonetic: '/deɪ/', partOfSpeech: 'substantivo', examples: [{ en: 'Have a great day!', pt: 'Tenha um ótimo dia!' }, { en: 'One day I\'ll travel the world.', pt: 'Um dia vou viajar pelo mundo.' }] },
  night:   { translation: 'noite', phonetic: '/naɪt/', partOfSpeech: 'substantivo', examples: [{ en: 'Good night, sleep well.', pt: 'Boa noite, durma bem.' }, { en: 'The night was beautiful.', pt: 'A noite estava linda.' }] },
  world:   { translation: 'mundo', phonetic: '/wɜːrld/', partOfSpeech: 'substantivo', examples: [{ en: 'The world is beautiful.', pt: 'O mundo é lindo.' }, { en: 'She traveled around the world.', pt: 'Ela viajou pelo mundo.' }] },
  life:    { translation: 'vida', phonetic: '/laɪf/', partOfSpeech: 'substantivo', examples: [{ en: 'Life is short.', pt: 'A vida é curta.' }, { en: 'He saved my life.', pt: 'Ele salvou minha vida.' }] },
  man:     { translation: 'homem', phonetic: '/mæn/', partOfSpeech: 'substantivo', examples: [{ en: 'He is a good man.', pt: 'Ele é um bom homem.' }, { en: 'The old man smiled.', pt: 'O velho senhor sorriu.' }] },
  woman:   { translation: 'mulher', phonetic: '/ˈwʊmən/', partOfSpeech: 'substantivo', examples: [{ en: 'She is a strong woman.', pt: 'Ela é uma mulher forte.' }, { en: 'The woman spoke loudly.', pt: 'A mulher falou alto.' }] },
  people:  { translation: 'pessoas', phonetic: '/ˈpiːpl/', partOfSpeech: 'substantivo', examples: [{ en: 'People are amazing.', pt: 'As pessoas são incríveis.' }, { en: 'Many people came to the event.', pt: 'Muitas pessoas vieram ao evento.' }] },
  home:    { translation: 'casa / lar', phonetic: '/hoʊm/', partOfSpeech: 'substantivo', examples: [{ en: 'I\'m going home.', pt: 'Estou indo para casa.' }, { en: 'Home is where the heart is.', pt: 'Lar é onde o coração está.' }] },
  water:   { translation: 'água', phonetic: '/ˈwɔːtər/', partOfSpeech: 'substantivo', examples: [{ en: 'Can I have some water?', pt: 'Posso ter um pouco de água?' }, { en: 'The water is very cold.', pt: 'A água está muito fria.' }] },
  money:   { translation: 'dinheiro', phonetic: '/ˈmʌni/', partOfSpeech: 'substantivo', examples: [{ en: 'Money can\'t buy happiness.', pt: 'Dinheiro não compra felicidade.' }, { en: 'He needs more money.', pt: 'Ele precisa de mais dinheiro.' }] },
  family:  { translation: 'família', phonetic: '/ˈfæməli/', partOfSpeech: 'substantivo', examples: [{ en: 'Family comes first.', pt: 'Família vem em primeiro lugar.' }, { en: 'She has a big family.', pt: 'Ela tem uma família grande.' }] },
  friend:  { translation: 'amigo(a)', phonetic: '/frɛnd/', partOfSpeech: 'substantivo', examples: [{ en: 'He is my best friend.', pt: 'Ele é meu melhor amigo.' }, { en: 'A friend in need is a friend indeed.', pt: 'Amigo na necessidade é amigo de verdade.' }] },
  // Adjetivos
  good:    { translation: 'bom / boa', phonetic: '/ɡʊd/', partOfSpeech: 'adjetivo', examples: [{ en: 'That\'s a good idea.', pt: 'Essa é uma boa ideia.' }, { en: 'She is a good person.', pt: 'Ela é uma boa pessoa.' }] },
  bad:     { translation: 'ruim / mau', phonetic: '/bæd/', partOfSpeech: 'adjetivo', examples: [{ en: 'It\'s not that bad.', pt: 'Não é tão ruim assim.' }, { en: 'I feel bad about it.', pt: 'Me sinto mal sobre isso.' }] },
  big:     { translation: 'grande', phonetic: '/bɪɡ/', partOfSpeech: 'adjetivo', examples: [{ en: 'That is a big house.', pt: 'Aquela é uma casa grande.' }, { en: 'He has big dreams.', pt: 'Ele tem grandes sonhos.' }] },
  little:  { translation: 'pequeno(a) / pouco(a)', phonetic: '/ˈlɪtl/', partOfSpeech: 'adjetivo', examples: [{ en: 'A little bird told me.', pt: 'Um passarinho me contou.' }, { en: 'Wait a little bit.', pt: 'Espere um pouquinho.' }] },
  new:     { translation: 'novo(a)', phonetic: '/njuː/', partOfSpeech: 'adjetivo', examples: [{ en: 'I bought a new phone.', pt: 'Eu comprei um celular novo.' }, { en: 'Happy new year!', pt: 'Feliz ano novo!' }] },
  old:     { translation: 'velho(a) / antigo(a)', phonetic: '/oʊld/', partOfSpeech: 'adjetivo', examples: [{ en: 'How old are you?', pt: 'Quantos anos você tem?' }, { en: 'This is an old building.', pt: 'Este é um prédio antigo.' }] },
  right:   { translation: 'certo / direito', phonetic: '/raɪt/', partOfSpeech: 'adjetivo', examples: [{ en: 'You\'re right about that.', pt: 'Você está certo sobre isso.' }, { en: 'Turn right at the corner.', pt: 'Vire à direita na esquina.' }] },
  wrong:   { translation: 'errado', phonetic: '/rɒŋ/', partOfSpeech: 'adjetivo', examples: [{ en: 'That answer is wrong.', pt: 'Essa resposta está errada.' }, { en: 'What\'s wrong with you?', pt: 'O que há de errado com você?' }] },
  happy:   { translation: 'feliz', phonetic: '/ˈhæpi/', partOfSpeech: 'adjetivo', examples: [{ en: 'I\'m so happy today!', pt: 'Estou tão feliz hoje!' }, { en: 'Happy birthday!', pt: 'Feliz aniversário!' }] },
  sorry:   { translation: 'desculpe', phonetic: '/ˈsɒri/', partOfSpeech: 'adjetivo', examples: [{ en: 'I\'m sorry for the delay.', pt: 'Desculpe pelo atraso.' }, { en: 'Sorry, I didn\'t mean it.', pt: 'Desculpe, não foi minha intenção.' }] },
  // Advérbios e preposições
  not:     { translation: 'não', phonetic: '/nɒt/', partOfSpeech: 'advérbio', examples: [{ en: 'I\'m not ready yet.', pt: 'Ainda não estou pronto.' }, { en: 'That\'s not true.', pt: 'Isso não é verdade.' }] },
  here:    { translation: 'aqui', phonetic: '/hɪr/', partOfSpeech: 'advérbio', examples: [{ en: 'Come here quickly.', pt: 'Venha aqui rápido.' }, { en: 'I\'ve been here before.', pt: 'Eu já estive aqui antes.' }] },
  there:   { translation: 'lá / ali', phonetic: '/ðɛr/', partOfSpeech: 'advérbio', examples: [{ en: 'She lives over there.', pt: 'Ela mora ali.' }, { en: 'There is no problem.', pt: 'Não há problema.' }] },
  now:     { translation: 'agora', phonetic: '/naʊ/', partOfSpeech: 'advérbio', examples: [{ en: 'Do it now!', pt: 'Faça isso agora!' }, { en: 'Now I understand.', pt: 'Agora eu entendo.' }] },
  never:   { translation: 'nunca', phonetic: '/ˈnɛvər/', partOfSpeech: 'advérbio', examples: [{ en: 'Never give up!', pt: 'Nunca desista!' }, { en: 'I\'ve never been there.', pt: 'Eu nunca estive lá.' }] },
  always:  { translation: 'sempre', phonetic: '/ˈɔːlweɪz/', partOfSpeech: 'advérbio', examples: [{ en: 'I always wake up early.', pt: 'Eu sempre acordo cedo.' }, { en: 'She always smiles.', pt: 'Ela sempre sorri.' }] },
  just:    { translation: 'apenas / só', phonetic: '/dʒʌst/', partOfSpeech: 'advérbio', examples: [{ en: 'I just got here.', pt: 'Acabei de chegar.' }, { en: 'Just do it.', pt: 'Apenas faça.' }] },
  very:    { translation: 'muito', phonetic: '/ˈvɛri/', partOfSpeech: 'advérbio', examples: [{ en: 'She is very smart.', pt: 'Ela é muito inteligente.' }, { en: 'Thank you very much.', pt: 'Muito obrigado.' }] },
  really:  { translation: 'realmente / de verdade', phonetic: '/ˈrɪəli/', partOfSpeech: 'advérbio', examples: [{ en: 'I really like you.', pt: 'Eu realmente gosto de você.' }, { en: 'Is that really true?', pt: 'Isso é realmente verdade?' }] },
  about:   { translation: 'sobre / a respeito de', phonetic: '/əˈbaʊt/', partOfSpeech: 'preposição', examples: [{ en: 'Tell me about yourself.', pt: 'Me fale sobre você.' }, { en: 'What is this movie about?', pt: 'Sobre o que é esse filme?' }] },
  with:    { translation: 'com', phonetic: '/wɪð/', partOfSpeech: 'preposição', examples: [{ en: 'Come with me.', pt: 'Venha comigo.' }, { en: 'I agree with you.', pt: 'Eu concordo com você.' }] },
  // Conjunções e extras
  and:     { translation: 'e', phonetic: '/ænd/', partOfSpeech: 'conjunção', examples: [{ en: 'You and I are friends.', pt: 'Você e eu somos amigos.' }, { en: 'Come and see.', pt: 'Venha e veja.' }] },
  but:     { translation: 'mas / porém', phonetic: '/bʌt/', partOfSpeech: 'conjunção', examples: [{ en: 'I tried, but I failed.', pt: 'Eu tentei, mas falhei.' }, { en: 'Small but powerful.', pt: 'Pequeno mas poderoso.' }] },
  or:      { translation: 'ou', phonetic: '/ɔːr/', partOfSpeech: 'conjunção', examples: [{ en: 'Coffee or tea?', pt: 'Café ou chá?' }, { en: 'Now or never.', pt: 'Agora ou nunca.' }] },
  if:      { translation: 'se', phonetic: '/ɪf/', partOfSpeech: 'conjunção', examples: [{ en: 'If you want, I\'ll go.', pt: 'Se você quiser, eu vou.' }, { en: 'What if it rains?', pt: 'E se chover?' }] },
  because: { translation: 'porque', phonetic: '/bɪˈkɒz/', partOfSpeech: 'conjunção', examples: [{ en: 'I stayed because of you.', pt: 'Fiquei por sua causa.' }, { en: 'I can\'t go because I\'m busy.', pt: 'Não posso ir porque estou ocupado.' }] },
  so:      { translation: 'então / tão', phonetic: '/soʊ/', partOfSpeech: 'conjunção', examples: [{ en: 'So, what now?', pt: 'Então, e agora?' }, { en: 'She was so tired.', pt: 'Ela estava tão cansada.' }] },
  no:      { translation: 'não / nenhum', phonetic: '/noʊ/', partOfSpeech: 'advérbio', examples: [{ en: 'No way!', pt: 'De jeito nenhum!' }, { en: 'I have no idea.', pt: 'Eu não faço ideia.' }] },
  yes:     { translation: 'sim', phonetic: '/jɛs/', partOfSpeech: 'advérbio', examples: [{ en: 'Yes, I agree.', pt: 'Sim, eu concordo.' }, { en: 'Yes, please!', pt: 'Sim, por favor!' }] },
  what:    { translation: 'o que / qual', phonetic: '/wɒt/', partOfSpeech: 'pronome interrogativo', examples: [{ en: 'What is your name?', pt: 'Qual é o seu nome?' }, { en: 'What happened?', pt: 'O que aconteceu?' }] },
  why:     { translation: 'por que', phonetic: '/waɪ/', partOfSpeech: 'advérbio interrogativo', examples: [{ en: 'Why are you crying?', pt: 'Por que você está chorando?' }, { en: 'Why not?', pt: 'Por que não?' }] },
  how:     { translation: 'como', phonetic: '/haʊ/', partOfSpeech: 'advérbio interrogativo', examples: [{ en: 'How are you?', pt: 'Como vai você?' }, { en: 'How does it work?', pt: 'Como funciona?' }] },
  where:   { translation: 'onde', phonetic: '/wɛr/', partOfSpeech: 'advérbio interrogativo', examples: [{ en: 'Where do you live?', pt: 'Onde você mora?' }, { en: 'Where is the station?', pt: 'Onde fica a estação?' }] },
  when:    { translation: 'quando', phonetic: '/wɛn/', partOfSpeech: 'advérbio interrogativo', examples: [{ en: 'When does the movie start?', pt: 'Quando o filme começa?' }, { en: 'When I was young...', pt: 'Quando eu era jovem...' }] },
  who:     { translation: 'quem', phonetic: '/huː/', partOfSpeech: 'pronome interrogativo', examples: [{ en: 'Who are you?', pt: 'Quem é você?' }, { en: 'Who said that?', pt: 'Quem disse isso?' }] },
  this:    { translation: 'este / esta / isto', phonetic: '/ðɪs/', partOfSpeech: 'pronome', examples: [{ en: 'This is amazing!', pt: 'Isto é incrível!' }, { en: 'I need this.', pt: 'Eu preciso disto.' }] },
  that:    { translation: 'esse / aquele / que', phonetic: '/ðæt/', partOfSpeech: 'pronome', examples: [{ en: 'That was incredible.', pt: 'Aquilo foi incrível.' }, { en: 'I know that you\'re right.', pt: 'Eu sei que você está certo.' }] },
  don:     { translation: '(contração de "do not")', phonetic: '/doʊnt/', partOfSpeech: 'contração', examples: [{ en: 'Don\'t worry about it.', pt: 'Não se preocupe com isso.' }, { en: 'I don\'t know.', pt: 'Eu não sei.' }] },
  can:     { translation: 'poder / conseguir', phonetic: '/kæn/', partOfSpeech: 'verbo modal', examples: [{ en: 'I can help you.', pt: 'Eu posso te ajudar.' }, { en: 'Can you hear me?', pt: 'Você pode me ouvir?' }] },
  will:    { translation: 'vai / irá (futuro)', phonetic: '/wɪl/', partOfSpeech: 'verbo modal', examples: [{ en: 'I will be there.', pt: 'Eu estarei lá.' }, { en: 'Everything will be fine.', pt: 'Tudo ficará bem.' }] },
  would:   { translation: 'iria / gostaria', phonetic: '/wʊd/', partOfSpeech: 'verbo modal', examples: [{ en: 'I would love to go.', pt: 'Eu adoraria ir.' }, { en: 'What would you do?', pt: 'O que você faria?' }] },
  should:  { translation: 'deveria', phonetic: '/ʃʊd/', partOfSpeech: 'verbo modal', examples: [{ en: 'You should rest now.', pt: 'Você deveria descansar agora.' }, { en: 'Should I call him?', pt: 'Eu deveria ligar para ele?' }] },
  could:   { translation: 'poderia / conseguia', phonetic: '/kʊd/', partOfSpeech: 'verbo modal', examples: [{ en: 'Could you help me?', pt: 'Você poderia me ajudar?' }, { en: 'I could see the stars.', pt: 'Eu conseguia ver as estrelas.' }] },
  must:    { translation: 'deve / precisa', phonetic: '/mʌst/', partOfSpeech: 'verbo modal', examples: [{ en: 'You must be careful.', pt: 'Você deve ter cuidado.' }, { en: 'I must go now.', pt: 'Eu preciso ir agora.' }] },
  been:    { translation: 'sido / estado', phonetic: '/biːn/', partOfSpeech: 'verbo (particípio)', examples: [{ en: 'I\'ve been waiting.', pt: 'Eu tenho esperado.' }, { en: 'Have you ever been to Paris?', pt: 'Você já esteve em Paris?' }] },
  all:     { translation: 'todo(a) / todos', phonetic: '/ɔːl/', partOfSpeech: 'pronome', examples: [{ en: 'All you need is love.', pt: 'Tudo que você precisa é amor.' }, { en: 'We are all together.', pt: 'Estamos todos juntos.' }] },
  back:    { translation: 'de volta / costas', phonetic: '/bæk/', partOfSpeech: 'advérbio', examples: [{ en: 'I\'ll be right back.', pt: 'Já volto.' }, { en: 'Step back, please.', pt: 'Afaste-se, por favor.' }] },
  still:   { translation: 'ainda', phonetic: '/stɪl/', partOfSpeech: 'advérbio', examples: [{ en: 'I still love her.', pt: 'Eu ainda a amo.' }, { en: 'Are you still there?', pt: 'Você ainda está aí?' }] },
  well:    { translation: 'bem', phonetic: '/wɛl/', partOfSpeech: 'advérbio', examples: [{ en: 'She sings very well.', pt: 'Ela canta muito bem.' }, { en: 'Well, let me think.', pt: 'Bem, deixe-me pensar.' }] },
  up:      { translation: 'para cima / acima', phonetic: '/ʌp/', partOfSpeech: 'advérbio', examples: [{ en: 'Look up at the sky.', pt: 'Olhe para o céu.' }, { en: 'Wake up early.', pt: 'Acorde cedo.' }] },
  down:    { translation: 'para baixo / abaixo', phonetic: '/daʊn/', partOfSpeech: 'advérbio', examples: [{ en: 'Sit down, please.', pt: 'Sente-se, por favor.' }, { en: 'The sun went down.', pt: 'O sol se pôs.' }] },
  out:     { translation: 'fora', phonetic: '/aʊt/', partOfSpeech: 'advérbio', examples: [{ en: 'Get out of here!', pt: 'Saia daqui!' }, { en: 'Let\'s go out tonight.', pt: 'Vamos sair hoje à noite.' }] },
  away:    { translation: 'longe / embora', phonetic: '/əˈweɪ/', partOfSpeech: 'advérbio', examples: [{ en: 'Go away!', pt: 'Vá embora!' }, { en: 'He lives far away.', pt: 'Ele mora longe.' }] },
  only:    { translation: 'apenas / somente', phonetic: '/ˈoʊnli/', partOfSpeech: 'advérbio', examples: [{ en: 'I only have one chance.', pt: 'Eu só tenho uma chance.' }, { en: 'She is the only one.', pt: 'Ela é a única.' }] },
  thing:   { translation: 'coisa', phonetic: '/θɪŋ/', partOfSpeech: 'substantivo', examples: [{ en: 'The best thing in life.', pt: 'A melhor coisa da vida.' }, { en: 'One more thing...', pt: 'Mais uma coisa...' }] },
  way:     { translation: 'caminho / jeito', phonetic: '/weɪ/', partOfSpeech: 'substantivo', examples: [{ en: 'This is the best way.', pt: 'Este é o melhor caminho.' }, { en: 'No way!', pt: 'De jeito nenhum!' }] },
  much:    { translation: 'muito', phonetic: '/mʌtʃ/', partOfSpeech: 'advérbio', examples: [{ en: 'Thank you so much!', pt: 'Muito obrigado!' }, { en: 'I don\'t have much time.', pt: 'Eu não tenho muito tempo.' }] },
  let:     { translation: 'deixar / permitir', phonetic: '/lɛt/', partOfSpeech: 'verbo', examples: [{ en: 'Let me help you.', pt: 'Deixe-me ajudá-lo.' }, { en: 'Let\'s go!', pt: 'Vamos!' }] },
  more:    { translation: 'mais', phonetic: '/mɔːr/', partOfSpeech: 'advérbio', examples: [{ en: 'I need more time.', pt: 'Eu preciso de mais tempo.' }, { en: 'Tell me more about it.', pt: 'Me conte mais sobre isso.' }] },
  too:     { translation: 'também / demais', phonetic: '/tuː/', partOfSpeech: 'advérbio', examples: [{ en: 'I love you too.', pt: 'Eu te amo também.' }, { en: 'It\'s too late.', pt: 'É tarde demais.' }] },
  than:    { translation: 'do que', phonetic: '/ðæn/', partOfSpeech: 'conjunção', examples: [{ en: 'She is taller than me.', pt: 'Ela é mais alta do que eu.' }, { en: 'Better late than never.', pt: 'Antes tarde do que nunca.' }] },
  into:    { translation: 'para dentro de / em', phonetic: '/ˈɪntuː/', partOfSpeech: 'preposição', examples: [{ en: 'She walked into the room.', pt: 'Ela entrou na sala.' }, { en: 'Turn water into wine.', pt: 'Transformar água em vinho.' }] },
  over:    { translation: 'sobre / acima / acabado', phonetic: '/ˈoʊvər/', partOfSpeech: 'preposição', examples: [{ en: 'The game is over.', pt: 'O jogo acabou.' }, { en: 'Come over to my house.', pt: 'Venha à minha casa.' }] },
  after:   { translation: 'depois / após', phonetic: '/ˈæftər/', partOfSpeech: 'preposição', examples: [{ en: 'See you after class.', pt: 'Vejo você depois da aula.' }, { en: 'After all, he was right.', pt: 'Afinal, ele estava certo.' }] },
  before:  { translation: 'antes', phonetic: '/bɪˈfɔːr/', partOfSpeech: 'preposição', examples: [{ en: 'I\'ll finish before noon.', pt: 'Vou terminar antes do meio-dia.' }, { en: 'Think before you act.', pt: 'Pense antes de agir.' }] },
  some:    { translation: 'algum / alguns / um pouco', phonetic: '/sʌm/', partOfSpeech: 'pronome', examples: [{ en: 'I need some help.', pt: 'Eu preciso de ajuda.' }, { en: 'Some people like jazz.', pt: 'Algumas pessoas gostam de jazz.' }] },
  every:   { translation: 'cada / todo(a)', phonetic: '/ˈɛvri/', partOfSpeech: 'adjetivo', examples: [{ en: 'Every day is a new chance.', pt: 'Cada dia é uma nova chance.' }, { en: 'I think about you every night.', pt: 'Penso em você toda noite.' }] },
  them:    { translation: 'eles / elas / os / as', phonetic: '/ðɛm/', partOfSpeech: 'pronome', examples: [{ en: 'Tell them the truth.', pt: 'Diga a verdade a eles.' }, { en: 'I know them very well.', pt: 'Eu os conheço muito bem.' }] },
  us:      { translation: 'nós', phonetic: '/ʌs/', partOfSpeech: 'pronome', examples: [{ en: 'Come with us.', pt: 'Venha conosco.' }, { en: 'Let us be happy.', pt: 'Vamos ser felizes.' }] },
  had:     { translation: 'tinha / teve', phonetic: '/hæd/', partOfSpeech: 'verbo (passado)', examples: [{ en: 'I had a dream.', pt: 'Eu tive um sonho.' }, { en: 'She had left already.', pt: 'Ela já tinha ido embora.' }] },
  did:     { translation: 'fez (passado de "do")', phonetic: '/dɪd/', partOfSpeech: 'verbo (passado)', examples: [{ en: 'What did you do?', pt: 'O que você fez?' }, { en: 'She did a great job.', pt: 'Ela fez um ótimo trabalho.' }] },
  got:     { translation: 'conseguiu / obteve', phonetic: '/ɡɒt/', partOfSpeech: 'verbo (passado)', examples: [{ en: 'I got a new job.', pt: 'Consegui um novo emprego.' }, { en: 'She got married last year.', pt: 'Ela se casou ano passado.' }] },
  our:     { translation: 'nosso(a)', phonetic: '/aʊr/', partOfSpeech: 'pronome possessivo', examples: [{ en: 'This is our house.', pt: 'Esta é a nossa casa.' }, { en: 'Our team won the game.', pt: 'Nosso time ganhou o jogo.' }] },
  their:   { translation: 'deles / delas / seu(s)', phonetic: '/ðɛr/', partOfSpeech: 'pronome possessivo', examples: [{ en: 'Their house is big.', pt: 'A casa deles é grande.' }, { en: 'They lost their keys.', pt: 'Eles perderam suas chaves.' }] },
  at:      { translation: 'em / no(a)', phonetic: '/æt/', partOfSpeech: 'preposição', examples: [{ en: 'I\'m at home.', pt: 'Estou em casa.' }, { en: 'Look at this!', pt: 'Olhe para isso!' }] },
  for:     { translation: 'para / por', phonetic: '/fɔːr/', partOfSpeech: 'preposição', examples: [{ en: 'This gift is for you.', pt: 'Este presente é para você.' }, { en: 'Thank you for coming.', pt: 'Obrigado por vir.' }] },
  from:    { translation: 'de / a partir de', phonetic: '/frɒm/', partOfSpeech: 'preposição', examples: [{ en: 'I\'m from Brazil.', pt: 'Eu sou do Brasil.' }, { en: 'We learn from mistakes.', pt: 'Aprendemos com os erros.' }] },
  on:      { translation: 'em / sobre / ligado', phonetic: '/ɒn/', partOfSpeech: 'preposição', examples: [{ en: 'The book is on the table.', pt: 'O livro está sobre a mesa.' }, { en: 'Turn on the lights.', pt: 'Acenda as luzes.' }] },
  in:      { translation: 'em / dentro de', phonetic: '/ɪn/', partOfSpeech: 'preposição', examples: [{ en: 'I live in São Paulo.', pt: 'Eu moro em São Paulo.' }, { en: 'She\'s in the kitchen.', pt: 'Ela está na cozinha.' }] },
  to:      { translation: 'para / a', phonetic: '/tuː/', partOfSpeech: 'preposição', examples: [{ en: 'I want to go home.', pt: 'Eu quero ir para casa.' }, { en: 'Nice to meet you.', pt: 'Prazer em conhecê-lo.' }] },
  of:      { translation: 'de', phonetic: '/ɒv/', partOfSpeech: 'preposição', examples: [{ en: 'A cup of coffee.', pt: 'Uma xícara de café.' }, { en: 'The end of the movie.', pt: 'O final do filme.' }] },
  a:       { translation: 'um / uma', phonetic: '/ə/', partOfSpeech: 'artigo', examples: [{ en: 'I have a question.', pt: 'Eu tenho uma pergunta.' }, { en: 'She is a teacher.', pt: 'Ela é uma professora.' }] },
  an:      { translation: 'um / uma', phonetic: '/æn/', partOfSpeech: 'artigo', examples: [{ en: 'I ate an apple.', pt: 'Eu comi uma maçã.' }, { en: 'She is an artist.', pt: 'Ela é uma artista.' }] },
};

/**
 * Busca dados de uma palavra no dicionário mock.
 * Se a palavra não existir no dicionário, gera um resultado genérico.
 */
function getMockTranslation(word) {
  const cleanWord = word.toLowerCase().replace(/[^a-z'-]/g, '');
  
  if (MOCK_DICTIONARY[cleanWord]) {
    return {
      word: cleanWord,
      ...MOCK_DICTIONARY[cleanWord],
    };
  }

  // Fallback genérico para palavras fora do dicionário mock
  return {
    word: cleanWord,
    translation: '(tradução indisponível)',
    phonetic: `/${cleanWord}/`,
    partOfSpeech: '—',
    examples: [
      { en: `The word "${cleanWord}" is used in many contexts.`, pt: `A palavra "${cleanWord}" é usada em muitos contextos.` },
      { en: `Can you use "${cleanWord}" in a sentence?`, pt: `Você pode usar "${cleanWord}" em uma frase?` },
    ],
  };
}

// ─── Componente WordMiningCard (Tooltip Glassmorphism) ────────────────────────
const WordMiningCard = ({ data, position, onClose }) => {
  const cardRef = useRef(null);
  const [cardStyle, setCardStyle] = useState({ opacity: 0 });

  // Fecha ao clicar fora do card
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Atraso mínimo para não capturar o click que abriu o card
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

    // Posiciona o card acima da palavra, centralizado horizontalmente
    let left = position.x - cardRect.width / 2;
    let top = position.y - cardRect.height - 16;

    // Ajuste horizontal para não sair da tela
    if (left < 12) left = 12;
    if (left + cardRect.width > viewportW - 12) left = viewportW - cardRect.width - 12;

    // Se não couber acima, coloca abaixo
    if (top < 12) top = position.y + 30;

    // Segurança vertical
    if (top + cardRect.height > viewportH - 12) top = viewportH - cardRect.height - 12;

    setCardStyle({
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      opacity: 1,
      transform: 'translateY(0)',
    });
  }, [position]);

  if (!data) return null;

  return (
    <div
      ref={cardRef}
      className="z-[9999] w-[340px] md:w-[380px] transition-all duration-300 ease-out"
      style={{
        ...cardStyle,
        position: 'fixed',
      }}
    >
      <div
        className="
          relative overflow-hidden rounded-2xl
          bg-[rgba(12,12,16,0.82)] backdrop-blur-[40px]
          border border-[rgba(255,255,255,0.08)]
          shadow-[0_8px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]
          p-5
        "
      >
        {/* Faixa superior gradiente decorativa */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pg-accent to-pg-purple opacity-60" />

        {/* Leve brilho interno no canto */}
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
              {data.word}
            </h3>
            {/* Fonética + Classe gramatical */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-white/40 font-mono">{data.phonetic}</span>
              <span className="text-[10px] uppercase tracking-widest text-pg-accent/70 font-medium bg-pg-accent/10 px-2 py-0.5 rounded-full">
                {data.partOfSpeech}
              </span>
            </div>
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

        {/* Tradução */}
        <div className="mb-4 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 font-medium">Tradução</p>
          <p className="text-base md:text-lg text-white font-medium leading-snug">{data.translation}</p>
        </div>

        {/* Exemplos de uso */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-3 font-medium">Exemplos de uso</p>
          <div className="flex flex-col gap-3">
            {data.examples.map((ex, i) => (
              <div
                key={i}
                className="pl-3 border-l-2 border-pg-accent/20 hover:border-pg-accent/50 transition-colors duration-200"
              >
                <p className="text-sm text-white/90 leading-relaxed font-medium">{ex.en}</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed italic">{ex.pt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador sutil de "Sentence Mining" */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-1.5">
          <span className="text-[10px] text-white/20 font-medium tracking-wide">⛏ Sentence Mining</span>
          <span className="flex-1" />
          <span className="text-[9px] text-white/15 font-mono">Mock Data</span>
        </div>
      </div>
    </div>
  );
};

// ─── Componente InteractiveWord ──────────────────────────────────────────────
const InteractiveWord = ({ word, onWordClick, isActive }) => {
  // Preserva a pontuação para o display mas limpa para a busca
  const displayWord = word;
  const hasContent = word.trim().length > 0;

  if (!hasContent) return <span>{word}</span>;

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onWordClick(word, {
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }}
      className={`
        relative cursor-pointer select-none
        transition-all duration-200 ease-out
        rounded-sm px-[1px] -mx-[1px]
        ${isActive
          ? 'text-pg-accent scale-105'
          : 'hover:text-pg-accent/90 hover:bg-pg-accent/10'
        }
      `}
      style={{
        textShadow: isActive ? '0 0 12px rgba(34,211,238,0.4)' : 'none',
      }}
    >
      {displayWord}
    </span>
  );
};

// ─── Componente Principal: SubtitleOverlay ────────────────────────────────────
const SubtitleOverlay = ({ subtitleData, visibility = { en: true, pt: true } }) => {
  const [visible, setVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordData, setWordData] = useState(null);
  const [cardPosition, setCardPosition] = useState(null);

  useEffect(() => {
    if (subtitleData?.en || subtitleData?.pt) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [subtitleData?.en, subtitleData?.pt]);

  // Fecha o card quando a legenda muda (nova frase)
  useEffect(() => {
    setSelectedWord(null);
    setWordData(null);
    setCardPosition(null);
  }, [subtitleData?.en]);

  // Função para limpar tags HTML comuns em arquivos SRT (<i>, <b>, <font>, etc.)
  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '');
  };

  const handleWordClick = useCallback((word, position) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z'-]/g, '');
    
    // Toggle: se clicar na mesma palavra, fecha
    if (selectedWord === cleanWord) {
      setSelectedWord(null);
      setWordData(null);
      setCardPosition(null);
      return;
    }

    const data = getMockTranslation(cleanWord);
    setSelectedWord(cleanWord);
    setWordData(data);
    setCardPosition(position);
  }, [selectedWord]);

  const handleCloseCard = useCallback(() => {
    setSelectedWord(null);
    setWordData(null);
    setCardPosition(null);
  }, []);

  // Quebra a string EN em palavras mantendo espaços
  const renderInteractiveWords = (text) => {
    const cleaned = cleanText(text);
    if (!cleaned) return null;

    // Divide preservando espaços entre palavras
    const tokens = cleaned.split(/(\s+)/);
    
    return tokens.map((token, idx) => {
      // Se for apenas espaço, renderiza o espaço
      if (/^\s+$/.test(token)) {
        return <span key={`space-${idx}`}>{token}</span>;
      }

      const cleanWord = token.toLowerCase().replace(/[^a-z'-]/g, '');

      return (
        <InteractiveWord
          key={`word-${idx}-${token}`}
          word={token}
          onWordClick={handleWordClick}
          isActive={selectedWord === cleanWord}
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
        {/* Linha primária — EN (Interativa / Sentence Mining) */}
        {visibility.en && subtitleData?.en && (
          <p className="text-xl md:text-3xl font-display font-bold text-white mb-1 md:mb-2 leading-snug drop-shadow-md flex flex-wrap items-center justify-center gap-y-0.5">
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
      {wordData && cardPosition && (
        <WordMiningCard
          data={wordData}
          position={cardPosition}
          onClose={handleCloseCard}
        />
      )}
    </>
  );
};

export default SubtitleOverlay;
