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
  // Book-a-call links -> Calendly
  if (CFG.CALENDLY_URL) {
    $$('[data-book]').forEach(a => {
      a.setAttribute('href', CFG.CALENDLY_URL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }
  // Email links
  if (CFG.EMAIL) {
    $$('[data-email]').forEach(a => {
      const subj = a.getAttribute('data-email-subject') || 'Project inquiry — EchoLabs';
      a.setAttribute('href', `mailto:${CFG.EMAIL}?subject=${encodeURIComponent(subj)}`);
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
    const setMenu = (open) => {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
    };
    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ============================================================
     MARQUEE — duplicate group for seamless loop
     ============================================================ */
  $$('[data-marquee]').forEach(track => {
    const group = track.firstElementChild;
    if (group) { const clone = group.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone); }
  });

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
  const statsGrid = $('[data-stats]');
  if (statsGrid) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        so.unobserve(e.target);
        $$('[data-count]', e.target).forEach(el => {
          const target = parseFloat(el.dataset.count);
          const dec = parseInt(el.dataset.dec || '0', 10);
          if (reduceMotion) { el.textContent = target.toFixed(dec); return; }
          const dur = 1500; let start = null;
          const tick = (t) => {
            if (start === null) start = t;
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(dec);
            if (p < 1) requestAnimationFrame(tick); else el.textContent = target.toFixed(dec);
          };
          requestAnimationFrame(tick);
        });
      });
    }, { threshold: 0.4 });
    so.observe(statsGrid);
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
     ECHO CURSOR
     ============================================================ */
  if (finePointer && !reduceMotion) {
    const cursor = $('.cursor');
    if (cursor) {
      const dot = $('.cursor__dot', cursor);
      const rings = [
        { el: $('.cursor__r1', cursor), x:0, y:0, ease:0.30, base:26, hover:54 },
        { el: $('.cursor__r2', cursor), x:0, y:0, ease:0.18, base:40, hover:78 },
        { el: $('.cursor__r3', cursor), x:0, y:0, ease:0.10, base:56, hover:104 },
      ];
      let mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, hovering = false, active = false;
      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!active) { active = true; document.body.classList.add('cursor-on'); }
      });
      window.addEventListener('mouseout', (e) => { if (!e.relatedTarget) document.body.classList.remove('cursor-on'); });
      window.addEventListener('mouseover', () => { if (active) document.body.classList.add('cursor-on'); });
      const interactive = 'a, button, .srow, .tier, .roster__cell, input, select, textarea, summary, [tabindex]';
      document.addEventListener('mouseover', (e) => { if (e.target.closest(interactive)) hovering = true; });
      document.addEventListener('mouseout',  (e) => { if (e.target.closest(interactive)) hovering = false; });
      const lerp = (a, b, n) => a + (b - a) * n;
      const render = () => {
        dx = lerp(dx, mx, 0.55); dy = lerp(dy, my, 0.55);
        dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%,-50%)`;
        rings.forEach(r => {
          r.x = lerp(r.x, mx, r.ease); r.y = lerp(r.y, my, r.ease);
          const target = hovering ? r.hover : r.base;
          const cur = parseFloat(r.el.dataset.size || r.base);
          const ns = lerp(cur, target, 0.15);
          r.el.dataset.size = ns;
          r.el.style.width = ns + 'px'; r.el.style.height = ns + 'px';
          r.el.style.transform = `translate(${r.x}px, ${r.y}px) translate(-50%,-50%)`;
        });
        requestAnimationFrame(render);
      };
      render();
    }
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
    // Touch swipe
    let sx = 0, sdx = 0, swiping = false;
    const vp = $('.deck__viewport', deck) || deck;
    vp.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sdx = 0; swiping = true; }, { passive: true });
    vp.addEventListener('touchmove',  (e) => { if (swiping) sdx = e.touches[0].clientX - sx; }, { passive: true });
    vp.addEventListener('touchend',   () => { if (Math.abs(sdx) > 40) go(i + (sdx < 0 ? 1 : -1)); swiping = false; });
    go(0);
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
