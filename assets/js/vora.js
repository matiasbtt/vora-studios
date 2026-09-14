/* VORA STUDIOS
 * El herbario de la izquierda corre solo, como una proyección: cada clip se ve
 * entero (unos diez segundos), se disuelve y entra el siguiente, las 28 en
 * orden y en bucle. El scroll no lo toca — la flor se queda mientras bajas.
 * El orden lo define assets/js/flores.js.
 */
(function () {
  'use strict';

  var FLORES = window.VORA_FLORES || [];
  var I18N = window.VORA_I18N || {};
  var VIDEO_DIR = 'assets/video/flores/';
  var POSTER_DIR = 'assets/video/posters/';

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var REDUCE = reduceQuery.matches;
  reduceQuery.addEventListener('change', function (e) { REDUCE = e.matches; });

  var stage = document.querySelector('.stage');
  var layers = Array.prototype.slice.call(document.querySelectorAll('.stage__layer'));
  var rail = document.querySelector('.rail');
  var slots = {
    latin: document.querySelector('[data-slot="latin"]'),
    common: document.querySelector('[data-slot="common"]'),
    tag: document.querySelector('[data-slot="tag"]'),
    index: document.querySelector('[data-slot="index"]'),
    phase: document.querySelector('[data-slot="phase"]')
  };
  var blocks = Array.prototype.slice.call(document.querySelectorAll('.block'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

  var lang = 'es';
  var current = 0;          // índice de la flor en pantalla
  var token = 0;            // invalida transiciones que quedaron a medias

  /* ── Ficha del espécimen ───────────────────────────────── */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function paintSpecimen(i) {
    var f = FLORES[i];
    if (!f) return;
    slots.latin.textContent = f.latin || '';
    slots.common.textContent = f[lang] || f.es;
    slots.index.textContent = pad(i + 1);
    slots.phase.textContent = (I18N.phases && I18N.phases[lang][f.phase]) || '';
    if (f.registered) {
      slots.tag.hidden = true;
    } else {
      slots.tag.hidden = false;
      slots.tag.textContent = (I18N.unrecorded && I18N.unrecorded[lang]) || '';
    }
  }

  /* ── Riel ──────────────────────────────────────────────── */

  function buildRail() {
    if (!rail) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < FLORES.length; i++) frag.appendChild(document.createElement('li'));
    rail.appendChild(frag);
  }

  function paintRail(i) {
    if (!rail) return;
    var ticks = rail.children;
    for (var n = 0; n < ticks.length; n++) {
      ticks[n].className = n === i ? 'is-on' : (n < i ? 'is-seen' : '');
    }
  }

  /* ── Motor de video ────────────────────────────────────── */

  function live() { return layers[0].classList.contains('is-live') ? layers[0] : layers[1]; }
  function idle() { return layers[0].classList.contains('is-live') ? layers[1] : layers[0]; }

  function srcFor(i) { return VIDEO_DIR + FLORES[i].file + '.mp4'; }

  function attempt(video) {
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* autoplay bloqueado: queda el póster */ });
  }

  function preload(i) {
    var next = idle();
    var want = srcFor(i);
    if (next.getAttribute('src') !== want) {
      next.poster = POSTER_DIR + FLORES[i].file + '.jpg';
      next.setAttribute('src', want);
      next.load();
    }
  }

  /* El índice se mueve al instante; el video llega cuando puede.
     Antes `current` solo avanzaba dentro del swap, y el swap se cancelaba
     a sí mismo: cada `show()` nuevo incrementa `token`, y un clip tarda más
     en cargar que los 450 ms de espera entre cambios. Bajando la página
     seguido, ningún swap alcanzaba a terminar, `current` se quedaba en 0
     y se veía una sola flor todo el recorrido. */
  function show(i) {
    if (i === current) return;
    current = i;
    paintSpecimen(i);
    paintRail(i);
    pedirVideo(i);
  }

  function pedirVideo(i) {
    var mine = ++token;
    var incoming = idle();
    var outgoing = live();
    var want = srcFor(i);

    var swap = function () {
      if (mine !== token) return;
      incoming.currentTime = 0;
      if (!REDUCE) attempt(incoming);
      incoming.classList.add('is-live');
      outgoing.classList.remove('is-live');
      programarRelevo(incoming, i);
      window.setTimeout(function () {
        if (mine !== token) return;
        outgoing.pause();
        preload(nextIn(i));
      }, 1200);
    };

    if (incoming.getAttribute('src') === want) {
      // Ya lo estaba precargando: si está listo se cruza ya.
      if (incoming.readyState >= 3) { swap(); return; }
    } else {
      incoming.poster = POSTER_DIR + FLORES[i].file + '.jpg';
      incoming.setAttribute('src', want);
      incoming.load();
    }
    incoming.addEventListener('canplay', swap, { once: true });
    // Si la red se demora, no dejamos el herbario congelado.
    window.setTimeout(function () { if (mine === token && incoming.readyState >= 2) swap(); }, 1400);
  }

  function nextIn(i) {
    var n = i + 1;
    return n >= FLORES.length ? 0 : n;
  }

  /* El clip manda, no el scroll. La flor se queda mientras bajas y recién
     cambia cuando termina de abrirse: diez segundos por espécimen, disolución
     de un segundo, y sigue la que toca. Es lo que le da el aire de película.
     Atar la flor a la posición del scroll la hacía saltar cada medio segundo. */
  layers.forEach(function (v) {
    v.addEventListener('ended', function () {
      if (!v.classList.contains('is-live')) return;
      show(nextIn(current));
    });
  });

  /* Red de seguridad: si `ended` no llega —autoplay bloqueado, clip que no
     carga, movimiento reducido— el herbario igual avanza y no se congela. */
  var relevo = null;
  function programarRelevo(v, i) {
    window.clearTimeout(relevo);
    var dur = (v.duration && isFinite(v.duration) && v.duration > 0) ? v.duration * 1000 : 10000;
    relevo = window.setTimeout(function () {
      if (current === i) show(nextIn(i));
    }, dur + 2000);
  }

  // La pestaña oculta no gasta batería reproduciendo flores que nadie ve.
  document.addEventListener('visibilitychange', function () {
    var v = live();
    if (document.hidden) v.pause();
    else if (!REDUCE) attempt(v);
  });

  /* ── Bloques: quién manda sobre el herbario ────────────── */

  function activate(block) {
    var id = block.id;
    navLinks.forEach(function (a) {
      a.classList.toggle('is-current', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window) {
    // El bloque que cruza la banda central del viewport es el que manda.
    var center = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) activate(e.target); });
    }, { rootMargin: '-46% 0px -46% 0px', threshold: 0 });
    blocks.forEach(function (b) { center.observe(b); });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        reveal.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    blocks.forEach(function (b) { reveal.observe(b); });
  } else {
    blocks.forEach(function (b) { b.classList.add('is-in'); });
  }

  /* ── Barra superior ────────────────────────────────────── */

  var topbar = document.querySelector('.topbar');
  if (topbar && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;';
    topbar.parentNode.insertBefore(sentinel, topbar);
    new IntersectionObserver(function (e) {
      topbar.classList.toggle('is-stuck', !e[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ── Idioma ────────────────────────────────────────────── */

  var langBtn = document.querySelector('.lang');
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var original = {};
  nodes.forEach(function (n) { original[n.getAttribute('data-i18n')] = n.textContent; });

  function setLang(next) {
    lang = next;
    document.documentElement.lang = next;
    var dict = next === 'en' ? I18N.en : original;
    nodes.forEach(function (n) {
      var key = n.getAttribute('data-i18n');
      if (dict[key]) n.textContent = dict[key];
    });
    if (langBtn) {
      langBtn.querySelector('.lang__on').textContent = next.toUpperCase();
      langBtn.querySelector('.lang__off').textContent = next === 'es' ? 'EN' : 'ES';
      langBtn.setAttribute('aria-label', I18N.langButtonLabel[next]);
    }
    paintSpecimen(current);
    try { localStorage.setItem('vora.lang', next); } catch (err) { /* modo privado */ }
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () { setLang(lang === 'es' ? 'en' : 'es'); });
  }

  /* ── Arranque ──────────────────────────────────────────── */

  var yearSlot = document.querySelector('[data-slot="year"]');
  if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());

  buildRail();
  paintSpecimen(0);
  paintRail(0);
  preload(1);

  var saved = null;
  try { saved = localStorage.getItem('vora.lang'); } catch (err) { /* modo privado */ }
  if (saved === 'en') setLang('en');

  if (!REDUCE) attempt(layers[0]);
  if (stage) stage.classList.add('is-ready');


  /* ══════════════════════════════════════════════════════
     CONTACTO
     ══════════════════════════════════════════════════════ */

  var WA_NUMERO = '59171777847';

  // Partido en dos para que no se levante de una sola pasada del HTML.
  var MAIL_USUARIO = 'matias.bellott';
  var MAIL_DOMINIO = 'gmail.com';

  // Pegar aquí la URL /exec del Apps Script cuando el CRM esté listo.
  // Mientras esté vacío, el formulario arma el mensaje y lo abre en WhatsApp,
  // así que funciona desde el primer día sin backend.
  var CRM_ENDPOINT = '';

  var TEXTOS = {
    es: {
      saludo: 'Hola, vengo del sitio de Vora Studios. Quiero consultar por un proyecto.',
      asuntoMail: 'Consulta desde el sitio de Vora Studios',
      cabecera: 'Hola, vengo del sitio de Vora Studios.',
      req: 'Falta completar este campo.',
      mail: 'Revisa el correo, parece incompleto.',
      tel: 'El número parece corto. Incluye el código de país.',
      enviando: 'Enviando…',
      enviar: 'Enviar',
      ok: 'Recibido. Te escribimos en menos de 24 horas.',
      okWa: 'Te abrimos WhatsApp con tus datos ya escritos. Solo tienes que enviarlo.',
      err: 'No se pudo enviar. Escríbenos por WhatsApp y lo resolvemos ahí:'
    },
    en: {
      saludo: 'Hi, I came from the Vora Studios site. I would like to ask about a project.',
      asuntoMail: 'Enquiry from the Vora Studios site',
      cabecera: 'Hi, I came from the Vora Studios site.',
      req: 'This field is required.',
      mail: 'Check the email, it looks incomplete.',
      tel: 'That number looks short. Include the country code.',
      enviando: 'Sending…',
      enviar: 'Send',
      ok: 'Got it. We will write back within 24 hours.',
      okWa: 'We opened WhatsApp with your details already typed. Just hit send.',
      err: 'Could not send. Write to us on WhatsApp and we will sort it out there:'
    }
  };
  function t(k) { return (TEXTOS[lang] || TEXTOS.es)[k]; }

  function waLink(texto) {
    return 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(texto);
  }

  // Los enlaces se arman en JS: el número no queda escrito tal cual en el HTML
  // y el saludo cambia con el idioma.
  function pintarWa() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-wa]'), function (a) {
      a.href = waLink(t('saludo'));
    });
  }
  pintarWa();

  function pintarMail() {
    var dir = MAIL_USUARIO + '@' + MAIL_DOMINIO;
    Array.prototype.forEach.call(document.querySelectorAll('[data-mail]'), function (a) {
      a.href = 'mailto:' + dir + '?subject=' + encodeURIComponent(t('asuntoMail'));
      if (a.textContent.trim() === '—' || !a.textContent.trim()) a.textContent = dir;
    });
  }
  pintarMail();

  /* ── Botón flotante ────────────────────────────────────── */

  var fab = document.querySelector('.fab');
  var hero = document.getElementById('inicio');
  var contacto = document.getElementById('contacto');

  if (fab && 'IntersectionObserver' in window) {
    // Sale pasado el hero y se retira en contacto, donde ya hay un botón grande
    // de WhatsApp: si se quedara, taparía el formulario y repetiría la misma acción.
    var enHero = true, enContacto = false;
    var revisar = function () { fab.classList.toggle('is-out', !enHero && !enContacto); };

    var mirar = function (el, set) {
      if (!el) return;
      new IntersectionObserver(function (e) { set(e[0].isIntersecting); revisar(); },
        { threshold: 0.3 }).observe(el);
    };
    mirar(hero, function (v) { enHero = v; });
    mirar(contacto, function (v) { enContacto = v; });
  } else if (fab) {
    fab.classList.add('is-out');
  }

  /* ── Formulario ────────────────────────────────────────── */

  var form = document.querySelector('.form');
  if (form) {
    var msg = form.querySelector('.form__msg');
    var send = form.querySelector('.form__send');
    var sendLabel = send.querySelector('span');

    function limpiar(campo) {
      campo.removeAttribute('data-bad');
      var e = campo.querySelector('.field__err');
      if (e) e.remove();
    }

    function marcar(campo, texto) {
      limpiar(campo);
      campo.setAttribute('data-bad', '');
      var e = document.createElement('span');
      e.className = 'field__err';
      e.textContent = texto;
      campo.appendChild(e);
    }

    function validar() {
      var malo = null;
      Array.prototype.forEach.call(form.querySelectorAll('.field'), function (campo) {
        var input = campo.querySelector('.field__input');
        if (!input || !input.required) { limpiar(campo); return; }
        var v = (input.value || '').trim();
        var error = '';
        if (!v) error = t('req');
        else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) error = t('mail');
        else if (input.type === 'tel' && (v.replace(/\D/g, '').length < 8)) error = t('tel');

        if (error) { marcar(campo, error); if (!malo) malo = input; }
        else limpiar(campo);
      });
      if (malo) malo.focus();
      return !malo;
    }

    function datos() {
      var d = {};
      Array.prototype.forEach.call(form.querySelectorAll('[name]'), function (i) {
        d[i.name] = (i.value || '').trim();
      });
      d.idioma = lang;
      d.origen = 'sitio-vora';
      d.fecha = new Date().toISOString();
      return d;
    }

    function comoMensaje(d) {
      return t('cabecera') + '\n\n' +
        'Nombre: ' + d.nombre + '\n' +
        'WhatsApp: ' + d.whatsapp + '\n' +
        'Correo: ' + d.correo + '\n' +
        'Ciudad: ' + d.lugar + '\n' +
        'Necesito: ' + d.tipo +
        (d.detalle ? '\n\n' + d.detalle : '');
    }

    function decir(texto, tono, conWa) {
      msg.hidden = false;
      msg.setAttribute('data-tone', tono);
      msg.textContent = texto;
      if (conWa) {
        msg.appendChild(document.createTextNode(' '));
        var a = document.createElement('a');
        a.href = waLink(conWa);
        a.rel = 'noopener';
        a.textContent = '+591 7 177 7847';
        msg.appendChild(a);
      }
    }

    function ocupado(si) {
      send.disabled = si;
      sendLabel.textContent = si ? t('enviando') : t('enviar');
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!validar()) return;

      var d = datos();

      // Sin CRM todavía: el formulario se convierte en un mensaje de WhatsApp.
      if (!CRM_ENDPOINT) {
        window.open(waLink(comoMensaje(d)), '_blank', 'noopener');
        decir(t('okWa'), 'ok');
        return;
      }

      ocupado(true);
      var corta = new AbortController();
      var reloj = window.setTimeout(function () { corta.abort(); }, 12000);

      // text/plain evita el preflight de CORS, que Apps Script no sabe responder.
      fetch(CRM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(d),
        signal: corta.signal
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function () {
          window.clearTimeout(reloj);
          form.querySelector('.form__grid').remove();
          Array.prototype.forEach.call(form.querySelectorAll('.field, .form__foot'), function (n) { n.remove(); });
          decir(t('ok'), 'ok');
        })
        .catch(function () {
          window.clearTimeout(reloj);
          ocupado(false);
          decir(t('err'), 'bad', comoMensaje(d));
        });
    });

    // Al corregir, el error se va solo: no hay que reenviar para saber si ya está bien.
    form.addEventListener('input', function (ev) {
      var campo = ev.target.closest ? ev.target.closest('.field') : null;
      if (campo && campo.hasAttribute('data-bad')) limpiar(campo);
    });

    // El botón de idioma ya llama a setLang; solo se le cuelga lo del formulario.
    // (El listener original apunta a la variable, así que recibe esta versión.)
    var setLangBase = setLang;
    setLang = function (next) {
      setLangBase(next);
      pintarWa();
      pintarMail();
      if (!send.disabled) sendLabel.textContent = t('enviar');
      Array.prototype.forEach.call(form.querySelectorAll('.field[data-bad]'), limpiar);
    };
  }
})();
