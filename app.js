/* ============================================================
   ECHOLABS — SHARED APP JS
   Every feature is guarded so each page only runs what it has.
   ============================================================ */
(() => {
  'use strict';

  const CFG = window.ECHO_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- loaded class (hero reveal) ---------- */
  window.addEventListener('load', () => requestAnimationFrame(() => document.body.classList.add('loaded')));
  setTimeout(() => document.body.classList.add('loaded'), 1200);

  /* ============================================================
     CONFIG WIRING
     ============================================================ */
  // Book-a-call links -> Calendly popup (opens over the site; no new tab)
  if (CFG.CALENDLY_URL) {
    const bookLinks = $$('[data-book]');
    // Defer the Calendly widget (CSS+JS) until a visitor shows booking intent,
    // so it never competes with first paint for the majority who never book.
    let calendlyRequested = false;
    const loadCalendly = () => {
      if (calendlyRequested) return; calendlyRequested = true;
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(css);
      const s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true;
      document.body.appendChild(s);
    };
    bookLinks.forEach(a => {
      a.setAttribute('href', CFG.CALENDLY_URL);   // same-tab fallback if the widget hasn't loaded
      a.removeAttribute('target');
      a.removeAttribute('rel');
      a.addEventListener('mouseenter', loadCalendly, { once: true }); // warm on hover/focus intent
      a.addEventListener('focus', loadCalendly, { once: true });
      a.addEventListener('click', (e) => {
        loadCalendly();
        if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
          e.preventDefault();
          window.Calendly.initPopupWidget({ url: CFG.CALENDLY_URL });
        }
        // otherwise the same-tab href fallback opens Calendly directly
      });
    });
  }
  // Email links -> Gmail web compose (reliable redirect; opens over the site in a new tab).
  // mailto alone silently fails when no desktop mail client is configured.
  if (CFG.EMAIL) {
    $$('[data-email]').forEach(a => {
      const subj = a.getAttribute('data-email-subject') || 'Project inquiry — EchoLabs';
      const to = encodeURIComponent(CFG.EMAIL);
      const su = encodeURIComponent(subj);
      a.setAttribute('href', `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}`);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      const slot = a.querySelector('[data-email-text]');
      if (slot) slot.textContent = CFG.EMAIL;
    });
  }
  // Social links
  if (CFG.SOCIAL) {
    $$('[data-social]').forEach(a => {
      const key = a.getAttribute('data-social');
      const url = CFG.SOCIAL[key];
      if (url && url !== '#' && url !== '') { a.setAttribute('href', url); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
      else { a.setAttribute('aria-disabled', 'true'); a.removeAttribute('href'); a.setAttribute('tabindex', '-1'); }
    });
  }
  // WhatsApp links + floating button
  const waHref = (CFG.WHATSAPP && CFG.WHATSAPP.number)
    ? `https://wa.me/${String(CFG.WHATSAPP.number).replace(/\D/g, '')}?text=${encodeURIComponent(CFG.WHATSAPP.message || '')}`
    : '';
  if (waHref) {
    $$('[data-whatsapp]').forEach(a => { a.setAttribute('href', waHref); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); });
    // Inject a site-wide floating WhatsApp button
    const fab = document.createElement('a');
    fab.className = 'wa-fab';
    fab.href = waHref; fab.target = '_blank'; fab.rel = 'noopener';
    fab.setAttribute('aria-label', 'Chat with EchoLabs on WhatsApp');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>';
    (document.body || document.documentElement).appendChild(fab);
  }

  /* ============================================================
     NAV — scroll state + mobile menu
     ============================================================ */
  const nav = $('.nav');
  if (nav) {
    const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });
  }
  const toggle = $('.nav__toggle');
  const menu = $('.menu');
  if (toggle && menu) {
    const menuFocusables = () => $$('a, button', menu).filter(el => el.offsetParent !== null);
    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      if (open) { const f = menuFocusables(); if (f[0]) f[0].focus(); }
      else { toggle.focus(); }
    };
    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('keydown', (e) => {
      if (!document.body.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { setMenu(false); return; }
      if (e.key === 'Tab') {
        const f = menuFocusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ============================================================
     MARQUEE — duplicate group for seamless loop
     ============================================================ */
  $$('[data-marquee]').forEach(track => {
    const group = track.firstElementChild;
    if (group) { const clone = group.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone); }
  });

  /* ============================================================
     CONTENT FLYWHEEL — rotated polygon spiral
     ============================================================ */
  const fwSpin = $('.fw-spin');
  if (fwSpin) {
    const pts = '200,55 345,200 200,345 55,200';
    let poly = '';
    for (let r = 0; r <= 88; r += 4) poly += `<polygon points="${pts}" transform="rotate(${r} 200 200)"/>`;
    fwSpin.innerHTML = poly;
  }

  /* ============================================================
     GENERIC SCROLL REVEAL
     ============================================================ */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, [data-stats], [data-echoes]').forEach(el => io.observe(el));

  /* ============================================================
     BELIEF — word-by-word reveal
     ============================================================ */
  const belief = $('[data-words]');
  if (belief) {
    const nodes = Array.from(belief.childNodes);
    belief.innerHTML = '';
    let i = 0;
    nodes.forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (tok.trim() === '') { belief.appendChild(document.createTextNode(tok)); return; }
          const w = document.createElement('span');
          w.className = 'kw'; w.textContent = tok;
          w.style.transitionDelay = (i++ * 0.07) + 's';
          belief.appendChild(w);
        });
      } else {
        node.classList.add('kw');
        node.style.transitionDelay = (i++ * 0.07) + 's';
        belief.appendChild(node);
      }
    });
    const bo = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { belief.classList.add('in'); bo.unobserve(belief); } });
    }, { threshold: 0.5 });
    bo.observe(belief);
  }

  /* ============================================================
     COLLAPSE KINETIC LINE
     ============================================================ */
  const collapse = $('[data-collapse]');
  if (collapse) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { collapse.classList.add('in'); co.unobserve(collapse); } });
    }, { threshold: 0.6 });
    co.observe(collapse);
  }

  /* ============================================================
     COUNT-UP STATS
     ============================================================ */
  const statsGrids = $$('[data-stats]');
  if (statsGrids.length) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        so.unobserve(e.target);
        $$('[data-count]', e.target).forEach(el => {
          const target = parseFloat(el.dataset.count);
          const dec = parseInt(el.dataset.dec || '0', 10);
          const fmt = (v) => Number(v.toFixed(dec)).toLocaleString('en-US');
          if (reduceMotion) { el.textContent = fmt(target); return; }
          const dur = 1500; let start = null;
          const tick = (t) => {
            if (start === null) start = t;
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * eased);
            if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(target);
          };
          requestAnimationFrame(tick);
        });
      });
    }, { threshold: 0.4 });
    statsGrids.forEach(g => so.observe(g));
  }

  /* ============================================================
     PROCESS — fill line on scroll
     ============================================================ */
  const pGrid = $('[data-process]');
  const pFill = $('[data-process-fill]');
  const pSteps = $$('[data-step]');
  if (pGrid && pFill) {
    const vertical = () => window.matchMedia('(max-width:760px)').matches;
    const update = () => {
      const rect = pGrid.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh * 0.4;
      const progressed = (vh * 0.75) - rect.top;
      const p = Math.max(0, Math.min(progressed / total, 1));
      if (vertical()) pFill.style.height = (p * 100) + '%';
      else pFill.style.width = (p * 100) + '%';
      pSteps.forEach((s, idx) => {
        const threshold = (idx + 0.5) / pSteps.length;
        s.classList.toggle('active', p >= threshold - 0.12);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ============================================================
     HERO EYEBROW — scramble / signal-lock
     ============================================================ */
  const scrambleEl = $('[data-scramble]');
  if (scrambleEl && !reduceMotion) {
    const finalText = scrambleEl.textContent;
    const glyphs = '!<>-_\\/[]{}—=+*^?#01';
    let frame = 0;
    const queue = finalText.split('').map((ch, idx) => ({ ch, start: idx * 2, end: idx * 2 + 14 + idx }));
    const run = () => {
      let out = '', done = 0;
      queue.forEach(q => {
        if (frame >= q.end) { out += q.ch; done++; }
        else if (frame >= q.start) { out += `<span style="opacity:.6">${glyphs[(frame + q.ch.charCodeAt(0)) % glyphs.length]}</span>`; }
        else { out += ' '; }
      });
      scrambleEl.innerHTML = out;
      if (done < queue.length) { frame++; requestAnimationFrame(run); }
      else scrambleEl.textContent = finalText;
    };
    setTimeout(run, 450);
  }

  /* ============================================================
     MAGNETIC BUTTONS
     ============================================================ */
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach(btn => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ============================================================
     ECHO CURSOR (desktop pointer only — never runs on touch/mobile)
     ============================================================ */
  if (!reduceMotion && finePointer) {
    const cursor = $('.cursor');
    if (cursor) {
      const dot = $('.cursor__dot', cursor);
      const rings = [
        { el: $('.cursor__r1', cursor), x:0, y:0, ease:0.35, base:16, hover:22 },
        { el: $('.cursor__r2', cursor), x:0, y:0, ease:0.20, base:24, hover:32 },
      ];
      let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, hovering = false, active = false;
      let running = false, lastMove = -1e9;
      const kick = () => { if (!running) { running = true; requestAnimationFrame(render); } };
      const point = (x, y) => { mx = x; my = y; lastMove = performance.now(); if (!active) { active = true; document.body.classList.add('cursor-on'); } kick(); };
      window.addEventListener('mousemove', (e) => point(e.clientX, e.clientY));
      window.addEventListener('mouseout', (e) => { if (!e.relatedTarget) document.body.classList.remove('cursor-on'); });
      window.addEventListener('mouseover', () => { if (active) document.body.classList.add('cursor-on'); });
      const interactive = 'a, button, .srow, .tier, .roster__cell, input, select, textarea, summary, [tabindex]';
      document.addEventListener('mouseover', (e) => { if (e.target.closest(interactive)) { hovering = true; kick(); } });
      document.addEventListener('mouseout',  (e) => { if (e.target.closest(interactive)) { hovering = false; kick(); } });
      const lerp = (a, b, n) => a + (b - a) * n;
      const near = (a, b) => Math.abs(a - b) < 0.4;
      const IDLE_MS = 600;
      function render() {
        dx = lerp(dx, mx, 0.7); dy = lerp(dy, my, 0.7);
        dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
        let settled = near(dx, mx) && near(dy, my);
        rings.forEach(r => {
          r.x = lerp(r.x, mx, r.ease); r.y = lerp(r.y, my, r.ease);
          const target = hovering ? r.hover : r.base;
          const cur = parseFloat(r.el.dataset.size || r.base);
          const ns = lerp(cur, target, 0.15);
          r.el.dataset.size = ns;
          r.el.style.width = ns + 'px'; r.el.style.height = ns + 'px';
          r.el.style.transform = `translate(${r.x}px, ${r.y}px) translate(-50%,-50%)`;
          if (!near(r.x, mx) || !near(r.y, my) || !near(ns, target)) settled = false;
        });
        // Sleep the loop once everything has settled and there's been no recent movement.
        if (settled && (performance.now() - lastMove) > IDLE_MS) { running = false; return; }
        requestAnimationFrame(render);
      }
    }
  }

  /* ============================================================
     EMBEDS (Instagram reels + LinkedIn) — robust lazy load.
     IntersectionObserver can fail to fire on horizontal rails / some mobile
     browsers, leaving embeds blank. Use viewport geometry checked on real
     page + rail scroll instead, with a buffer so they load just before view.
     ============================================================ */
  (() => {
    const reveal = f => {
      if (f.src || !f.dataset.src) return;
      const box = f.closest('.reelcard__embed, .li-card__embed');
      f.addEventListener('load', () => { if (box) box.classList.add('is-loaded'); }, { once: true });
      f.src = f.dataset.src;
    };
    // When a group's container nears the viewport, load ALL of its embeds (staggered)
    // so every preview renders. Per-iframe lazy-load (IO / loading=lazy) is unreliable
    // for horizontally-scrolled rails and some mobile browsers, which left reels blank.
    const watch = (container, frames, step) => {
      if (!container || !frames.length) return;
      let done = false;
      const trigger = () => {
        if (done) return;
        const r = container.getBoundingClientRect();
        if (r.top < window.innerHeight + 400 && r.bottom > -300) {
          done = true;
          frames.forEach((f, i) => setTimeout(() => reveal(f), i * step));
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
        }
      };
      const onScroll = () => requestAnimationFrame(trigger);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      trigger();
    };
    $$('[data-reelrail]').forEach(rail => watch(rail, $$('.reelcard__embed iframe[data-src]', rail), 130));
    watch(document.querySelector('.li-rail'), $$('.li-card__embed iframe[data-src]'), 200);
  })();

  /* ============================================================
     TOUCH: the LinkedIn text embeds are pointer-events:none on touch so the page
     can scroll; a tap opens the post via its CTA link. (Reels stay interactive
     so they play in place — handled by Instagram's own player.)
     ============================================================ */
  if (window.matchMedia('(hover:none),(pointer:coarse)').matches) {
    $$('.li-card__embed').forEach(box => {
      box.addEventListener('click', () => {
        const card = box.closest('.li-card');
        const cta = card && card.querySelector('a[href]');
        if (cta && cta.href) window.open(cta.href, '_blank', 'noopener');
      });
    });
  }

  /* ============================================================
     WORK PAGE — optional video case studies
     (hidden entirely unless VIDEOS are configured)
     ============================================================ */
  const videoMount = $('[data-videos]');
  if (videoMount) {
    const vids = Array.isArray(CFG.VIDEOS) ? CFG.VIDEOS : [];
    if (vids.length) {
      videoMount.innerHTML = vids.map(v => {
        const isFile = /\.(mp4|webm|mov)(\?|$)/i.test(v.embed);
        const media = isFile
          ? `<video controls preload="metadata" src="${v.embed}"></video>`
          : `<iframe src="${v.embed}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" title="${v.title || 'Video example'}"></iframe>`;
        return `<div class="vcard"><div class="vcard__embed">${media}</div><p class="vcard__title">${v.title || ''}</p></div>`;
      }).join('');
    } else {
      const sec = videoMount.closest('section');
      if (sec) sec.hidden = true;
    }
  }

  /* ============================================================
     WORK PAGE — "Our Work" deck mockup carousel
     ============================================================ */
  $$('[data-deck-carousel]').forEach(deck => {
    const track   = $('[data-deck-track]', deck);
    const slides  = $$('.deck__slide', deck);
    const prevBtn = $('[data-deck-prev]', deck);
    const nextBtn = $('[data-deck-next]', deck);
    const dotsWrap= $('[data-deck-dots]', deck);
    const counter = $('[data-deck-counter]', deck);
    if (!track || !slides.length) return;
    let i = 0;
    const pad = n => String(n).padStart(2, '0');

    if (dotsWrap) {
      slides.forEach((_, idx) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'deck__dot';
        b.setAttribute('aria-label', `Go to slide ${idx + 1} of ${slides.length}`);
        b.addEventListener('click', () => go(idx));
        dotsWrap.appendChild(b);
      });
    }
    const dots = dotsWrap ? $$('.deck__dot', dotsWrap) : [];

    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-i * 100}%)`;
      dots.forEach((d, idx) => d.setAttribute('aria-current', idx === i ? 'true' : 'false'));
      slides.forEach((s, idx) => {
        const hidden = idx !== i;
        s.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        // keep interactive content in hidden slides out of the tab order
        $$('a, button, input, select, textarea', s).forEach(el => { el.tabIndex = hidden ? -1 : 0; });
      });
      if (counter) counter.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
    }
    prevBtn && prevBtn.addEventListener('click', () => go(i - 1));
    nextBtn && nextBtn.addEventListener('click', () => go(i + 1));
    deck.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { go(i - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
    });
    // Touch swipe + click/tap-to-advance
    let sx = 0, sdx = 0, swiping = false, suppressClick = false;
    const vp = $('.deck__viewport', deck) || deck;
    vp.style.cursor = 'pointer';
    vp.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sdx = 0; swiping = true; }, { passive: true });
    vp.addEventListener('touchmove',  (e) => { if (swiping) sdx = e.touches[0].clientX - sx; }, { passive: true });
    vp.addEventListener('touchend',   () => {
      if (Math.abs(sdx) > 40) { go(i + (sdx < 0 ? 1 : -1)); suppressClick = true; setTimeout(() => { suppressClick = false; }, 400); }
      swiping = false;
    });
    // Clicking/tapping the slide itself advances — but never swallow real links/buttons (e.g. the CTA)
    vp.addEventListener('click', (e) => {
      if (suppressClick) return;
      if (e.target.closest('a, button')) return;
      go(i + 1);
    });
    go(0);
  });

  /* ============================================================
     WORK PAGE — Reels coverflow carousel
     Centred reel is in focus & interactive; neighbours angle back in 3D.
     Move with the bottom controls, arrow keys, swipe, or by tapping a side card.
     ============================================================ */
  $$('[data-reelcarousel]').forEach(car => {
    const viewport = $('.reelviewport', car);
    const rail     = $('.reelrail', car);
    const cards    = $$('.reelcard', car);
    const prevBtns = $$('[data-reel-prev]', car);
    const nextBtns = $$('[data-reel-next]', car);
    const brandEl  = $('[data-reel-brand]', car);
    if (!viewport || !rail || cards.length === 0) return;

    let idx = 0;
    const last = cards.length - 1;

    function layout() {
      const vpW = viewport.clientWidth;
      const active = cards[idx];
      const center = active.offsetLeft + active.offsetWidth / 2;
      rail.style.transform = `translateX(${Math.round(vpW / 2 - center)}px)`;

      cards.forEach((c, i) => {
        const off = i - idx;
        const a = Math.abs(off);
        let scale = 1, rot = 0, op = 1, tz = 0, px = 0;
        if (a >= 1) {
          scale = a === 1 ? 0.86 : 0.74;
          op    = a === 1 ? 0.72 : 0.4;
          rot   = (off < 0 ? 1 : -1) * (a === 1 ? 20 : 26);
          tz    = -(a * 70);
          px    = -off * (a === 1 ? 30 : 50);
        }
        if (reduceMotion) { rot = 0; tz = 0; px = 0; scale = a >= 1 ? 0.9 : 1; }
        c.style.transform = `translateX(${px}px) translateZ(${tz}px) rotateY(${rot}deg) scale(${scale})`;
        c.style.opacity = op;
        c.style.zIndex = String(100 - a);
        const isActive = off === 0;
        c.toggleAttribute('data-active', isActive);
        c.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        $$('a, button', c).forEach(el => { el.tabIndex = isActive ? 0 : -1; });
      });

      if (brandEl && active) {
        const name = active.querySelector('.reelcard__name');
        if (name) brandEl.textContent = name.textContent;
      }
      prevBtns.forEach(b => { b.disabled = idx === 0; });
      nextBtns.forEach(b => { b.disabled = idx === last; });
    }

    function go(n) { idx = Math.max(0, Math.min(last, n)); layout(); }

    prevBtns.forEach(b => b.addEventListener('click', () => go(idx - 1)));
    nextBtns.forEach(b => b.addEventListener('click', () => go(idx + 1)));

    // Tap a side card to bring it to the centre
    cards.forEach((c, i) => {
      c.addEventListener('click', (e) => {
        if (i === idx) return;                 // active card: let the reel/CTA handle it
        if (e.target.closest('a')) return;
        go(i);
      });
    });

    // Keyboard
    car.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { go(idx - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(idx + 1); e.preventDefault(); }
    });

    // Swipe
    let sx = 0, sdx = 0, swiping = false;
    viewport.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sdx = 0; swiping = true; }, { passive: true });
    viewport.addEventListener('touchmove',  (e) => { if (swiping) sdx = e.touches[0].clientX - sx; }, { passive: true });
    viewport.addEventListener('touchend',   () => { if (Math.abs(sdx) > 40) go(idx + (sdx < 0 ? 1 : -1)); swiping = false; });

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); }, { passive: true });
    window.addEventListener('load', layout);
    layout();
  });

  /* ============================================================
     FORMS — validate + submit to Google Apps Script
     ============================================================ */
  $$('[data-lead-form]').forEach(form => {
    const status = $('.form__status', form);
    const submitBtn = $('[type="submit"]', form);

    const setFieldError = (field, on) => field.classList.toggle('field--invalid', on);

    let errSeq = 0;
    const validate = () => {
      let ok = true;
      $$('.field', form).forEach(field => {
        const ctrl = field.querySelector('input, select, textarea');
        const errEl = field.querySelector('.field__err');
        if (errEl && !errEl.id && ctrl) errEl.id = `err-${ctrl.name || 'f'}-${errSeq++}`;
        if (!ctrl || !ctrl.required) {
          setFieldError(field, false);
          if (ctrl) { ctrl.removeAttribute('aria-invalid'); ctrl.removeAttribute('aria-describedby'); }
          return;
        }
        let bad = !ctrl.value.trim();
        if (!bad && ctrl.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(ctrl.value.trim());
        if (!bad && ctrl.type === 'tel') bad = !/[0-9]{6,}/.test(ctrl.value.replace(/\D/g, ''));
        setFieldError(field, bad);
        if (bad) {
          ctrl.setAttribute('aria-invalid', 'true');
          if (errEl && errEl.id) ctrl.setAttribute('aria-describedby', errEl.id);
          ok = false;
        } else {
          ctrl.setAttribute('aria-invalid', 'false');
          ctrl.removeAttribute('aria-describedby');
        }
      });
      return ok;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // honeypot
      const hp = form.querySelector('[name="company_website"]');
      if (hp && hp.value) return; // bot

      if (!validate()) {
        if (status) { status.dataset.state = 'error'; status.textContent = 'Please complete the highlighted fields.'; }
        const firstBad = form.querySelector('.field--invalid input, .field--invalid select, .field--invalid textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      delete data.company_website;
      data.source = data.source || document.title;

      if (status) { status.dataset.state = 'loading'; status.textContent = 'Sending…'; }
      if (submitBtn) submitBtn.setAttribute('aria-busy', 'true');

      const endpoint = CFG.FORM_ENDPOINT;

      try {
        if (!endpoint) throw new Error('no-endpoint');
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          body: new URLSearchParams(data),
        });
        // no-cors response is opaque; treat reaching here as success
        form.reset();
        if (status) {
          status.dataset.state = 'success';
          status.textContent = (data.type && /creator/i.test(data.type))
            ? 'You’re in the queue. We review every creator application — expect to hear back soon.'
            : 'Thanks — your inquiry landed. We’ll be in touch within one business day.';
        }
      } catch (err) {
        // Fallback to email so a lead is never lost
        if (status) {
          status.dataset.state = 'error';
          status.textContent = 'Couldn’t submit automatically. Opening email as a backup…';
        }
        const subj = encodeURIComponent(`${data.type || 'New'} inquiry — ${data.name || ''}`);
        const body = encodeURIComponent(
          Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')
        );
        const to = CFG.EMAIL || 'office@echolabs.net.in';
        window.location.href = `mailto:${to}?subject=${subj}&body=${body}`;
      } finally {
        if (submitBtn) submitBtn.removeAttribute('aria-busy');
      }
    });
  });

})();
