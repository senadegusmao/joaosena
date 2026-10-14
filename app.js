/* João Sena — arquivo */
window.__IMGS = [[4788,2695,[["m",1600],["l",2800],["x",4788]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[4788,2695,[["m",1600],["l",2800],["x",4788]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[4788,2695,[["m",1600],["l",2800],["x",4788]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[4788,2695,[["m",1600],["l",2800],["x",4788]]],[4788,2695,[["m",1600],["l",2800],["x",4788]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[4788,2695,[["m",1600],["l",2800],["x",4788]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[2500,2860,[["m",1600],["x",2860]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[3348,3806,[["m",1600],["l",2800],["x",3806]]],[3348,3806,[["m",1600],["l",2800],["x",3806]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[3348,3806,[["m",1600],["l",2800],["x",3806]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[3348,3806,[["m",1600],["l",2800],["x",3806]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[4794,2696,[["m",1600],["l",2800],["x",4794]]],[3348,3806,[["m",1600],["l",2800],["x",3806]]],[3348,3806,[["m",1600],["l",2800],["x",3806]]]];
(() => {
  const stage = document.getElementById('stage');
  const lb = document.getElementById('lb');
  const lbImg = document.getElementById('lb-img');
  const menu = document.getElementById('menu');
  const hint = document.getElementById('hint');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- imagens do portfólio (joaosena.com) ---------- */
  /* imagens em arquivos WebP separados (antes iam embutidas no HTML) */
  /* imagens do Figma: miniatura de 640px na grade; na ampliação, a menor versão que cobre o tamanho na tela × densidade (até a original, ~4800px) */
  let images = (window.__IMGS || []).map(([w, h, tiers], i) => {
    const n = 'img/' + String(i).padStart(2, '0');
    return { src: n + '-t.webp', ratio: h / w, tiers: tiers.map(([k, long]) => ({ src: n + '-' + k + '.webp', long })) };
  });
  function bestTier(im, cssW, cssH) {
    const need = Math.max(cssW, cssH) * Math.min(window.devicePixelRatio || 1, 3);
    return (im.tiers.find(t => t.long >= need) || im.tiers[im.tiers.length - 1]).src;
  }

  /* ---------- grade infinita ---------- */
  let vw, vh, cw, px, py, cols, rows, pool = [];
  const requested = new Set(), held = new Set();
  let holdOffscreen = true;
  function releaseHeld() {
    holdOffscreen = false;
    held.forEach(el => { el.img.fetchPriority = 'low'; el.img.src = el._src; requested.add(el._src); });
    held.clear();
  }
  let ox = 0, oy = 0, vx = 0, vy = 0;

  const mod = (a, n) => ((a % n) + n) % n;
  const idxAt = (c, r) => mod(c * 5 + r * 3, images.length);

  function measure() {
    vw = innerWidth; vh = innerHeight;
    cw = Math.round(Math.min(280, Math.max(140, vw * .16)));
    px = Math.round(cw * 4 / 3);
    py = Math.round(cw * 1.5);
    cols = Math.ceil(vw / px) + 2;
    rows = Math.ceil(vh / py) + 2;
    const need = cols * rows;
    while (pool.length < need) {
      const el = document.createElement('div');
      el.className = 'tile';
      const im = document.createElement('img');
      im.alt = 'Work by João Sena'; im.draggable = false; im.decoding = 'async';
      el.appendChild(im); el.img = im;
      stage.appendChild(el); pool.push(el);
    }
    while (pool.length > need) pool.pop().remove();
    pool.forEach(el => { el._key = null; });
  }

  function render() {
    const sc = Math.floor(-ox / px) - 1, sr = Math.floor(-oy / py) - 1;
    let k = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const col = sc + i, row = sr + j, el = pool[k++];
        const key = col + ',' + row;
        if (el._key !== key) {
          const idx = idxAt(col, row), im = images[idx];
          el._key = key; el._col = col; el._row = row; el._idx = idx;
          el._h = Math.round(cw * im.ratio);
          if (el._src !== im.src) {
            /* o que está na tela baixa primeiro; o resto só depois que a abertura começa */
            const tx = col * px + ox, ty = row * py + oy;
            const vis = tx + px > 0 && tx < vw && ty + py > 0 && ty < vh;
            el._src = im.src;
            if (vis || !holdOffscreen) { el.img.fetchPriority = vis ? 'high' : 'low'; el.img.src = im.src; requested.add(im.src); }
            else held.add(el);
          }
          el.style.width = cw + 'px';
          el.style.height = el._h + 'px';
          el.style.visibility = '';
        }
        const x = col * px + ox + (px - cw) / 2;
        const y = row * py + oy + (py - el._h) / 2;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
      }
    }
  }

  let raf = 0;
  const requestRender = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };

  function center() { ox = vw / 2 - px / 2; oy = Math.round(py * .12); }

  /* e-mail montado em tempo de execução: não fica legível no HTML para robôs de spam */
  { const u = ['senadegusmao', 'gmail.com'].join('@'), m = document.getElementById('mail');
    if (m) { m.href = 'mailto:' + u; document.getElementById('mail-text').textContent = u; } }

  /* ---------- arrastar, inércia, roda ---------- */
  let samples = [], dragging = false, moved = 0, lastX = 0, lastY = 0, lastT = 0, downTile = null, inertia = false;

  stage.addEventListener('pointerdown', e => {
    if (lbOpen || e.button !== 0) return;
    closePanels();
    dragging = true; moved = 0; vx = vy = 0; inertiaId++; inertia = false;
    lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
    samples = [{ t: lastT, x: lastX, y: lastY }];
    downTile = e.target.closest('.tile');
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const now = performance.now(), dt = Math.max(now - lastT, 1);
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    ox += dx; oy += dy; moved += Math.abs(dx) + Math.abs(dy);
    vx = vx * .7 + (dx * 16 / dt) * .3;
    vy = vy * .7 + (dy * 16 / dt) * .3;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    samples.push({ t: now, x: lastX, y: lastY });
    while (samples.length > 2 && now - samples[0].t > 160) samples.shift();
    if (moved > 6) hint.classList.add('gone');
    requestRender();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    if (moved < 6 && downTile) { openTile(downTile); return; }
    /* velocidade medida nos últimos ~100ms até o instante de soltar: no mouse, uma pausa curta
       antes de soltar só reduz o deslize em vez de zerá-lo (antes o quique sumia no desktop) */
    const now = performance.now();
    const s0 = samples.find(p => now - p.t <= 140);
    if (s0 && now - s0.t > 8) { const k = 16 / (now - s0.t); vx = (lastX - s0.x) * k; vy = (lastY - s0.y) * k; }
    else if (!s0) { vx = vy = 0; }
    startInertia();
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* mola amortecida única: ao soltar o arrasto a grade desliza até onde a inércia levaria e assenta
     com um leve quique; a roda/trackpad do desktop move o alvo e a grade segue pela mesma mola */
  let inertiaId = 0, springId = 0, tgtX = 0, tgtY = 0, velX = 0, velY = 0, kS = 70, cS = 11;
  function runSpring() {
    if (inertia && springId === inertiaId) return;
    const id = springId = ++inertiaId;
    inertia = true;
    let last = performance.now();
    const step = now => {
      if (id !== inertiaId || dragging || lbOpen) { if (id === springId) inertia = false; return; }
      let dt = Math.min(0.05, (now - last) / 1000); last = now;
      let px_ = ox, py_ = oy;
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240); dt -= h;
        velX += (-kS * (px_ - tgtX) - cS * velX) * h; velY += (-kS * (py_ - tgtY) - cS * velY) * h;
        px_ += velX * h; py_ += velY * h;
      }
      ox = px_; oy = py_; render();
      if (Math.abs(px_ - tgtX) < 0.15 && Math.abs(py_ - tgtY) < 0.15 && Math.abs(velX) < 3 && Math.abs(velY) < 3) {
        ox = tgtX; oy = tgtY; render(); vx = vy = velX = velY = 0; inertia = false; return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function startInertia() {
    if (reduce) return;
    inertiaId++; inertia = false;
    /* velocidade em px/quadro (60 fps) → destino projetado igual ao deslize antigo */
    tgtX = ox + vx / (1 - 0.94); tgtY = oy + vy / (1 - 0.94);
    velX = vx * 60; velY = vy * 60;
    kS = 70; cS = 11;                                       /* ~6% de ultrapassagem */
    runSpring();
  }

  addEventListener('wheel', e => {
    if (e.target.closest('.nav-inner')) return;
    e.preventDefault();
    if (lbOpen) return;
    hint.classList.add('gone');
    let dx = e.deltaX, dy = e.deltaY;
    if (e.deltaMode === 1) { dx *= 16; dy *= 16; } else if (e.deltaMode === 2) { dx *= vw; dy *= vh; }
    if (e.shiftKey && !dx) { dx = dy; dy = 0; }
    if (reduce) { ox -= dx; oy -= dy; requestRender(); return; }
    if (!inertia || springId !== inertiaId) { tgtX = ox; tgtY = oy; velX = velY = 0; }
    tgtX -= dx; tgtY -= dy;
    kS = 160; cS = 15;                                      /* segue o dedo de perto e assenta com quique leve */
    runSpring();
  }, { passive: false });

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (lbOpen) closeLb(); else closePanels(); return; }
    if (lbOpen || e.target.closest('.nav-body, input')) return;
    const m = { ArrowLeft: [14, 0], ArrowRight: [-14, 0], ArrowUp: [0, 14], ArrowDown: [0, -14] }[e.key];
    if (m) { e.preventDefault(); vx = m[0]; vy = m[1]; if (reduce) { ox += m[0] * 10; oy += m[1] * 10; render(); } else startInertia(); }
  });

  /* ---------- ampliação ---------- */
  let lbOpen = false, lbTile = null, lbAnim = null, lbToken = null;

  function targetRect(ratio) {
    const top = menu.getBoundingClientRect().bottom + 16;
    const bottomPad = 16 + (parseFloat(getComputedStyle(document.documentElement).paddingBottom) || 0);
    const gut = 16;
    const aw = vw - gut * 2, ah = vh - top - bottomPad - 8;
    const w = Math.min(aw, ah / ratio), h = w * ratio;
    return { left: (vw - w) / 2, top: top + (ah - h) / 2, width: w, height: h };
  }
  function fromTransform(r, t, f) {
    const sx = r.width / t.width, sy = r.height / t.height;
    const dx = (r.left - t.left) * f, dy = (r.top - t.top) * f;
    return `translate(${dx}px,${dy}px) scale(${sx + (1 - sx) * (1 - f)},${sy + (1 - sy) * (1 - f)})`;
  }

  function openTile(el) {
    const im = images[el._idx];
    const r = el.getBoundingClientRect();
    const t = targetRect(im.ratio);
    lbImg.src = im.src;
    /* troca pela versão em alta assim que estiver decodificada */
    const hi = bestTier(im, t.width, t.height), token = (lbToken = {});
    const big = new Image(); big.decoding = 'async'; big.src = hi;
    big.decode().then(() => { if (lbOpen && lbToken === token) lbImg.src = hi; }).catch(() => {});
    Object.assign(lb.style, { left: t.left + 'px', top: t.top + 'px', width: t.width + 'px', height: t.height + 'px' });
    lb.hidden = false;
    lbOpen = true; lbTile = el;
    el.style.visibility = 'hidden';
    stage.classList.add('dim');
    hint.classList.add('gone');
    if (lbAnim) lbAnim.cancel();
    if (reduce) return;
    lbAnim = lb.animate([
      { transform: fromTransform(r, t, 1) },
      { transform: fromTransform(r, t, .32) + ' skewY(-3deg)', offset: .55 },
      { transform: 'none' }
    ], { duration: 820, easing: 'cubic-bezier(.65,0,.25,1)' });
    lbImg.animate([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 820, easing: 'cubic-bezier(.65,0,.25,1)' });
  }

  function closeLb(instant) {
    if (!lbOpen) return;
    const el = lbTile;
    const finish = () => {
      lb.hidden = true; lbOpen = false; lbTile = null; lbAnim = null;
      if (el) el.style.visibility = '';
    };
    stage.classList.remove('dim');
    if (reduce || instant || !el) { finish(); return; }
    const r = el.getBoundingClientRect(), t = lb.getBoundingClientRect();
    if (lbAnim) lbAnim.cancel();
    lbAnim = lb.animate([
      { transform: 'none' },
      { transform: fromTransform(r, t, .32) + ' skewY(3deg)', offset: .45 },
      { transform: fromTransform(r, t, 1) }
    ], { duration: 700, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });
    lbAnim.onfinish = () => { finish(); lb.getAnimations().forEach(a => a.cancel()); };
  }
  lb.addEventListener('click', () => closeLb());

  /* ---------- menu: o painel cresce (curva de newlayer.cc) e as seções sobem em sequência ---------- */
  const nav = document.getElementById('nav');
  const navBtn = document.getElementById('btn-info');
  const navBody = document.getElementById('nav-body');
  const navInner = navBody.firstElementChild;
  const EASE_BOX = 'cubic-bezier(0.76, 0, 0.24, 1)';
  const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
  let navOpen = false, navAnims = [];
  function stopNav() { navAnims.forEach(a => a.cancel()); navAnims = []; }
  const navGlass = navBody.querySelector('.nav-glass');
  const navClip = navBody.querySelector('.nav-clip');
  function shownHeight() { return navBody.hidden ? 0 : navGlass.getBoundingClientRect().height; }
  function setNav(open) {
    if (open === navOpen) return;
    const h0 = shownHeight();
    stopNav();
    navOpen = open;
    nav.classList.toggle('open', open);
    navBtn.setAttribute('aria-expanded', open);
    const blocks = [...navInner.children];
    navBody.hidden = false;
    const H = navInner.offsetHeight;
    if (reduce) { navBody.hidden = !open; return; }
    const box = (to, opt) => [navGlass, navClip].map(el => el.animate([{ height: h0 + 'px' }, { height: to + 'px' }], opt));
    if (open) {
      navAnims.push(...box(H, { duration: 650, easing: EASE_BOX }));
      blocks.forEach((b, i) => navAnims.push(b.animate(
        [{ opacity: 0, transform: 'translateY(15px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 550, delay: 220 + i * 110, easing: EASE_OUT, fill: 'backwards' })));
    } else {
      blocks.slice().reverse().forEach((b, i) => navAnims.push(b.animate(
        [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(15px)' }],
        { duration: 250, delay: i * 50, easing: 'ease-in', fill: 'forwards' })));
      const [g, c] = box(0, { duration: 550, delay: 120, easing: EASE_BOX, fill: 'both' });
      navAnims.push(g, c);
      g.onfinish = () => { if (!navOpen) { navBody.hidden = true; stopNav(); } };
    }
  }
  function closePanels() { setNav(false); }
  navBtn.addEventListener('click', () => { if (lbOpen) closeLb(); setNav(!navOpen); });
  document.getElementById('home').addEventListener('click', e => {
    e.preventDefault(); closePanels(); closeLb(true); vx = vy = 0; inertiaId++; center(); render();
  });

  /* ---------- início ---------- */
  let resizeRaf = 0;
  addEventListener('resize', () => { if (!resizeRaf) resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; onResize(); }); });
  function onResize() {
    const fx = (ox - vw / 2) / px, fy = (oy - vh / 2) / py;
    closeLb(true);
    measure();
    ox = vw / 2 + fx * px; oy = vh / 2 + fy * py;
    render();
  }
  measure(); center(); render();

  /* ---------- introdução ---------- */
  (function intro() {
    const name = document.getElementById('home');
    const text = name.textContent;
    name.setAttribute('aria-label', text);
    name.textContent = '';
    [...text].forEach((c, i) => {
      const sp = document.createElement('span');
      sp.className = 'ch'; sp.setAttribute('aria-hidden', 'true');
      sp.textContent = c;
      sp.style.setProperty('--d', i * 35);
      name.appendChild(sp);
    });
    const root = document.documentElement;
    const prefetchRest = () => {
      const idle = window.requestIdleCallback || (f => setTimeout(f, 200));
      idle(() => images.forEach(im => {
        if (requested.has(im.src)) return;
        requested.add(im.src);
        const i = new Image(); i.decoding = 'async'; i.fetchPriority = 'low'; i.src = im.src;
        i.decode().catch(() => {});
      }));
    };
    const onScreen = el => { const r = el.getBoundingClientRect(); return r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh; };
    const ready = Promise.race([
      Promise.all(pool.filter(onScreen).map(el => el.img.decode().catch(() => {}))),
      new Promise(r => setTimeout(r, 2500))
    ]);
    if (reduce) { ready.then(() => { releaseHeld(); prefetchRest(); }); return; }
    root.classList.add('intro', 'intro-wait');
    ready.then(() => { root.classList.remove('intro-wait'); performance.mark('intro-start'); start(); releaseHeld(); prefetchRest(); });
    function start() {

    /* quadros: surgem do centro para fora, cada um se abrindo de dentro */
    const cx = vw / 2, cy = vh / 2;
    const visible = pool.filter(el => {
      const r = el.getBoundingClientRect();
      return r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh;
    });
    const maxD = Math.hypot(cx, cy) || 1;
    let last = 0;
    visible.forEach(el => {
      const r = el.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) / maxD;
      const delay = 120 + d * 900 + Math.random() * 140;
      last = Math.max(last, delay);
      el.animate([
        { clipPath: 'inset(50% 0 50% 0)', opacity: 0 },
        { clipPath: 'inset(0% 0 0% 0)', opacity: 1 }
      ], { duration: 900, delay, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'backwards' });
      el.img.animate([
        { transform: 'scale(1.25)', filter: 'blur(8px)' },
        { transform: 'scale(1)', filter: 'blur(0px)' }
      ], { duration: 1300, delay, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards' });
    });
    pool.filter(el => !visible.includes(el)).forEach(el => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: last, fill: 'backwards' });
    });

    /* leve deslize da grade enquanto monta */
    const sy = oy, t0 = performance.now(), dur = 1800;
    oy = sy + 60; render();
    const glide = now => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      oy = sy + 60 * (1 - e); render();
      if (p < 1 && !dragging) requestAnimationFrame(glide);
    };
    requestAnimationFrame(glide);

    /* depois os quadros, o nome letra a letra e o menu */
    setTimeout(() => {
      root.classList.add('intro-on');
      root.classList.remove('intro');
    }, last + 500);
    setTimeout(() => {
      root.classList.remove('intro-on');
      /* troca as letras por cópias limpas para não deixar camadas de desfoque para trás */
      name.replaceChildren(...[...name.children].map(c => c.cloneNode(true)));
    }, last + 2000);
    }
  })();

  /* ---------- saída: a introdução ao contrário ---------- */
  window.portfolioOutro = function outro() {
    closePanels(); closeLb(true); vx = vy = 0; inertiaId++;
    const chars = [...document.querySelectorAll('.wordmark .ch')].reverse();
    const ease = 'cubic-bezier(0.7, 0, 0.8, 0.2)';
    hint.animate([{ opacity: getComputedStyle(hint).opacity }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
    document.querySelector('.nav').animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 450, easing: ease, fill: 'forwards' });
    chars.forEach((c, i) => c.animate([
      { opacity: 1, transform: 'none', filter: 'blur(0px)' },
      { opacity: 0, transform: 'translateY(60%)', filter: 'blur(4px)' }
    ], { duration: 450, delay: 150 + i * 35, easing: ease, fill: 'forwards' }));
    const start = 150 + chars.length * 35 + 250;
    const cx = vw / 2, cy = vh / 2, maxD = Math.hypot(cx, cy) || 1;
    let end = 0;
    pool.forEach(el => {
      const r = el.getBoundingClientRect();
      const onScreen = r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh;
      if (!onScreen) { el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: start, fill: 'forwards' }); return; }
      const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) / maxD;
      const delay = start + (1 - d) * 900 + Math.random() * 140;
      end = Math.max(end, delay + 900);
      el.animate([
        { clipPath: 'inset(0% 0 0% 0)', opacity: 1 },
        { clipPath: 'inset(50% 0 50% 0)', opacity: 0 }
      ], { duration: 900, delay, easing: 'cubic-bezier(0.8, 0, 0.3, 1)', fill: 'forwards' });
      el.img.animate([
        { transform: 'scale(1)', filter: 'blur(0px)' },
        { transform: 'scale(1.25)', filter: 'blur(8px)' }
      ], { duration: 1100, delay, easing: 'cubic-bezier(0.8, 0, 0.8, 0.2)', fill: 'forwards' });
    });
    const sy = oy;
    setTimeout(() => {
      const t0 = performance.now(), dur = end - start + 200;
      const glide = now => {
        const p = Math.min(1, (now - t0) / dur);
        oy = sy + 60 * Math.pow(p, 3); render();
        if (p < 1) requestAnimationFrame(glide);
      };
      requestAnimationFrame(glide);
    }, start);
    return new Promise(res => setTimeout(res, end + 200));
  };
})();
