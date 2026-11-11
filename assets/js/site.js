/* Doce Sertão — menu do celular e botão fixo do WhatsApp. Sem dependências, sem rastreamento. */
(function () {
  var raiz = document.documentElement;
  raiz.classList.add('js');

  /* Botão fixo do WhatsApp (só no celular): aparece depois que a abertura da página sai da tela,
     porque a abertura já tem o seu próprio botão de WhatsApp. */
  var abertura = document.querySelector('main .heroi, main .abertura');
  if (abertura && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      raiz.classList.toggle('whats-visivel', !entradas[0].isIntersecting);
    }).observe(abertura);
  } else {
    raiz.classList.add('whats-visivel');
  }

  /* Na página inicial, o WhatsApp do topo e o botão fixo levam a mensagem do assunto que a pessoa está vendo
     (camping, fazenda, residencial ou construtora). Fora desses blocos, volta a mensagem da página. */
  var assuntos = document.querySelectorAll('[data-whats-texto]');
  var botoesWhats = document.querySelectorAll('.topo__whats, .whats-fixo');
  if (assuntos.length && botoesWhats.length && 'IntersectionObserver' in window) {
    var padrao = [];
    for (var b = 0; b < botoesWhats.length; b++) padrao.push(botoesWhats[b].getAttribute('href'));
    var noMeio = [];
    var aplicar = function () {
      var atual = noMeio.length ? noMeio[noMeio.length - 1] : null;
      for (var k = 0; k < botoesWhats.length; k++) {
        var href = padrao[k];
        if (atual) href = href.split('?')[0] + '?text=' + encodeURIComponent(atual.getAttribute('data-whats-texto')).replace(/!/g, '%21');
        botoesWhats[k].setAttribute('href', href);
      }
    };
    var observador = new IntersectionObserver(function (entradas) {
      for (var e = 0; e < entradas.length; e++) {
        var alvo = entradas[e].target;
        var pos = noMeio.indexOf(alvo);
        if (entradas[e].isIntersecting) { if (pos < 0) noMeio.push(alvo); }
        else if (pos >= 0) noMeio.splice(pos, 1);
      }
      aplicar();
    }, { rootMargin: '-45% 0px -45% 0px' });
    for (var s = 0; s < assuntos.length; s++) observador.observe(assuntos[s]);
  }

  var botao = document.querySelector('.topo__menu');
  var menu = document.getElementById('menu-principal');
  if (!botao || !menu) return;
  var topo = botao.closest ? botao.closest('.topo') : null;

  function aberto() { return botao.getAttribute('aria-expanded') === 'true'; }
  var toqueFora = false; // ponteiro apertado fora do menu aberto
  function definir(abrir) {
    if (!abrir) toqueFora = false;
    botao.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    raiz.classList.toggle('menu-aberto', abrir);
  }

  botao.addEventListener('click', function () {
    var abrir = !aberto();
    definir(abrir);
    if (abrir) {
      var primeiro = menu.querySelector('a');
      if (primeiro) primeiro.focus();
    }
  });

  document.addEventListener('keydown', function (e) {
    toqueFora = false;
    if (e.key === 'Escape' && aberto()) {
      definir(false);
      botao.focus();
    }
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) definir(false);
  });

  function fora(alvo) { return !(alvo && alvo.closest && alvo.closest('.topo')); }

  /* Toque fora do menu aberto só fecha o menu: não ativa o link ou botão que está embaixo. */
  document.addEventListener('pointerdown', function (e) {
    toqueFora = aberto() && fora(e.target);
  }, true);
  document.addEventListener('click', function (e) {
    if (!aberto() || !fora(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    definir(false);
  }, true);

  /* Quem sai do menu com Tab segue para a página: o menu fecha.
     (Se o foco saiu por um toque fora, quem fecha é o clique acima, sem ativar o que está embaixo.) */
  if (topo) {
    topo.addEventListener('focusout', function (e) {
      if (!aberto() || toqueFora) return;
      var destino = e.relatedTarget;
      if (destino && !topo.contains(destino)) definir(false);
    });
  }

  var largo = window.matchMedia('(min-width: 60em)');
  var aoMudar = function (m) { if (m.matches) definir(false); };
  if (largo.addEventListener) largo.addEventListener('change', aoMudar);
  else if (largo.addListener) largo.addListener(aoMudar);
})();
