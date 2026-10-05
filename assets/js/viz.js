/* ============================================================
   VIZ ENGINE — 步进式 SVG 图解
   Swiss 动效原则：状态切换硬切，物理过程线性插值
   ============================================================ */
(function (global) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const VIZ = {};          // registry: id -> spec
  const C = {};            // brand colors (read live from CSS vars)

  function readColors() {
    const s = getComputedStyle(document.documentElement);
    ['--red', '--red-2', '--red-tint', '--code-red', '--ink', '--gray-1', '--gray-2', '--gray-3', '--paper', '--paper-2', '--paper-3']
      .forEach(k => { C[k.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = s.getPropertyValue(k).trim(); });
  }

  /* ---------- tiny svg builder ---------- */
  function e(tag, attrs, kids) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      n.setAttribute(k, attrs[k]);
    }
    if (kids !== null && kids !== undefined && kids !== false) {
      (Array.isArray(kids) ? kids : [kids]).forEach(c => {
        if (c === null || c === undefined || c === false) return;
        n.appendChild((typeof c === 'object' && c.nodeType) ? c : document.createTextNode(String(c)));
      });
    }
    return n;
  }
  const TXT = (x, y, s, o = {}) => e('text', {
    x, y, fill: o.fill || C.ink, 'font-size': o.size || 11,
    'font-family': o.mono ? 'var(--ff-mono)' : 'var(--ff)',
    'font-weight': o.weight || 400,
    'text-anchor': o.anchor || 'start',
    'letter-spacing': o.ls || 0,
    opacity: o.opacity
  }, s);

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;
  // 输入必须先 clamp：easeOut(1.998) 会算出 0.004 而不是 1，导致跳转步进后整图透明
  const easeOut = t => 1 - Math.pow(1 - clamp01(t), 2);
  const easeIn = t => { t = clamp01(t); return t * t; };

  /* ---------- player ---------- */
  function mount(host, spec) {
    readColors();
    host.innerHTML = '';
    host.classList.add('viz');

    const W = spec.w || 900;
    const steps = spec.steps;

    /* header */
    const hd = document.createElement('div');
    hd.className = 'viz__hd';
    hd.innerHTML = `<span class="n">图 ${String(spec.no).padStart(2, '0')}</span><span class="t">${spec.title}</span>`;
    const sp = document.createElement('div');
    sp.className = 'sp';

    const mk = (label, path, fn) => {
      const b = document.createElement('button');
      b.className = 'viz__btn';
      b.title = label;
      b.setAttribute('aria-label', label);
      b.innerHTML = `<svg viewBox="0 0 12 12" fill="currentColor">${path}</svg>`;
      b.onclick = fn;
      return b;
    };
    const P_PREV = '<path d="M11 1 4 6l7 5z"/><rect x="2" y="1" width="1.6" height="10"/>';
    const P_NEXT = '<path d="M1 1l7 5-7 5z"/><rect x="9.4" y="1" width="1.6" height="10"/>';
    const P_PLAY = '<path d="M2 1l9 5-9 5z"/>';
    const P_PAUSE = '<rect x="2" y="1" width="3" height="10"/><rect x="7" y="1" width="3" height="10"/>';
    const P_RE = '<path d="M2 1l7 5-7 5z"/><rect x="9.4" y="1" width="1.6" height="10"/>';

    const bPrev = mk('上一步', P_PREV, () => go(i - 1));
    const bPlay = mk('播放 / 暂停', P_PLAY, toggle);
    const bNext = mk('下一步', P_NEXT, () => go(i + 1));
    const bRe = mk('回到开头', P_RE, () => { pause(); go(0, true); });
    sp.append(bRe, bPrev, bPlay, bNext);
    hd.appendChild(sp);

    /* stage */
    const stage = document.createElement('div');
    stage.className = 'viz__stage';
    // width/height 属性不能省：SVG 只有 viewBox 时，移动端浏览器算不出固有宽高比，
    // 配 CSS 的 height:auto 会把整张图压成一条线
    const svg = e('svg', {
      viewBox: `0 0 ${W} ${spec.h || 380}`,
      width: W, height: spec.h || 380,
      preserveAspectRatio: 'xMidYMid meet'
    });
    stage.appendChild(svg);

    /* scrub */
    const scrub = document.createElement('div');
    scrub.className = 'viz__scrub';
    scrub.innerHTML = '<i class="fill"></i><i class="knob"></i>';
    const fill = scrub.querySelector('.fill'), knob = scrub.querySelector('.knob');

    /* step buttons */
    const stepsEl = document.createElement('div');
    stepsEl.className = 'viz__steps';
    steps.forEach((s, k) => {
      const b = document.createElement('button');
      b.className = 'viz__step';
      b.textContent = `${k + 1}. ${s.label}`;
      b.onclick = () => { pause(); go(k, true); };
      stepsEl.appendChild(b);
    });

    const cap = document.createElement('div');
    cap.className = 'viz__cap';

    host.append(hd, stage, scrub, stepsEl, cap);

    let i = 0, t = 0, playing = false, raf = 0, last = 0;
    const stepBtns = [...stepsEl.children];

    function paint() {
      const s = steps[i];
      svg.innerHTML = '';
      s.draw(svg, { t: clamp01(t), i, n: steps.length, W, H: spec.h || 380, e: TXT, lerp, clamp01, easeOut, easeIn });
      cap.innerHTML = s.cap || '';
      stepBtns.forEach((b, k) => b.classList.toggle('is-on', k === i));
      const p = (i + t) / steps.length;
      fill.style.width = (p * 100) + '%';
      knob.style.left = `calc(${p * 100}% - 1px)`;
      bPlay.innerHTML = `<svg viewBox="0 0 12 12" fill="currentColor">${playing ? P_PAUSE : P_PLAY}</svg>`;
    }

    function go(k, hard) {
      i = Math.max(0, Math.min(steps.length - 1, k));
      t = 0;
      if (hard) t = 0.999;
      paint();
    }

    function tick(ts) {
      if (!playing) return;
      if (!last) last = ts;
      const dt = Math.min(64, ts - last); last = ts;
      t += dt / (spec.dur || 1500);
      if (t >= 1) {
        if (i < steps.length - 1) { i++; t = 0; } else { t = 1; pause(); paint(); return; }
      }
      paint();
      raf = requestAnimationFrame(tick);
    }
    function play() {
      if (i === steps.length - 1 && t >= 1) { i = 0; t = 0; }
      playing = true; last = 0; raf = requestAnimationFrame(tick); paint();
    }
    function pause() { playing = false; cancelAnimationFrame(raf); paint(); }
    function toggle() { playing ? pause() : play(); }

    /* scrub drag */
    let drag = false;
    const fromX = ev => {
      const r = scrub.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const f = p * steps.length;
      const k = Math.min(steps.length - 1, Math.floor(f));
      return { k, t: f - k };
    };
    scrub.addEventListener('pointerdown', ev => {
      drag = true; pause(); scrub.setPointerCapture(ev.pointerId);
      const { k, t: tt } = fromX(ev); i = k; t = tt; paint();
    });
    scrub.addEventListener('pointermove', ev => { if (drag) { const { k, t: tt } = fromX(ev); i = k; t = tt; paint(); } });
    scrub.addEventListener('pointerup', ev => { drag = false; scrub.releasePointerCapture(ev.pointerId); });

    /* keyboard */
    const onKey = ev => {
      if (!host.isConnected || !host.closest('.vizwrap')?.matches(':hover')) return;
      if (ev.key === 'ArrowRight') { pause(); go(i + 1); }
      if (ev.key === 'ArrowLeft') { pause(); go(i - 1); }
      if (ev.key === ' ') { ev.preventDefault(); toggle(); }
    };
    document.addEventListener('keydown', onKey);
    const mo = new MutationObserver(() => { if (!host.isConnected) document.removeEventListener('keydown', onKey); mo.disconnect(); });
    mo.observe(host, { childList: true });

    paint();
  }

  /* ---------- helpers used inside draw() ---------- */
  const H = {
    box: (x, y, w, h, o = {}) => e('rect', {
      x, y, width: w, height: h,
      fill: o.fill || 'none',
      stroke: o.stroke || C.ink,
      'stroke-width': o.sw === undefined ? 1 : o.sw,
      'stroke-dasharray': o.dash || null,
      opacity: o.opacity
    }),
    line: (x1, y1, x2, y2, o = {}) => e('line', {
      x1, y1, x2, y2, stroke: o.stroke || C.ink,
      'stroke-width': o.sw === undefined ? 1 : o.sw,
      'stroke-dasharray': o.dash || null,
      opacity: o.opacity, 'marker-end': o.arrow ? 'url(#ar)' : null
    }),
    path: (d, o = {}) => e('path', {
      d, fill: o.fill || 'none', stroke: o.stroke || C.ink,
      'stroke-width': o.sw === undefined ? 1 : o.sw,
      'stroke-linecap': o.cap || 'butt', opacity: o.opacity
    }),
    circ: (cx, cy, r, o = {}) => e('circle', {
      cx, cy, r, fill: o.fill || 'none', stroke: o.stroke || C.ink,
      'stroke-width': o.sw === undefined ? 1 : o.sw, opacity: o.opacity
    }),
    txt: TXT,
    arrowhead: () => e('marker', {
      id: 'ar', viewBox: '0 0 8 8', refX: 6, refY: 4,
      markerWidth: 6, markerHeight: 6, orient: 'auto'
    }, e('path', { d: 'M0 0.5 L7 4 L0 7.5 z', fill: C.ink })),
    arrowheadRed: () => e('marker', {
      id: 'arr', viewBox: '0 0 8 8', refX: 6, refY: 4,
      markerWidth: 6, markerHeight: 6, orient: 'auto'
    }, e('path', { d: 'M0 0.5 L7 4 L0 7.5 z', fill: C.red })),
    /* draw a chip: index + label */
    chip: (x, y, label, o = {}) => {
      const g = e('g', { opacity: o.opacity === undefined ? 1 : o.opacity });
      g.appendChild(H.box(x, y, o.w || 84, o.h || 24, {
        fill: o.fill || 'none', stroke: o.stroke || C.ink, sw: o.sw === undefined ? 1 : o.sw
      }));
      g.appendChild(TXT(x + (o.w || 84) / 2, y + (o.h || 24) / 2 + 3.5, label, {
        anchor: 'middle', size: o.size || 10, fill: o.tc || C.ink, weight: o.weight || 500, mono: o.mono
      }));
      return g;
    },
    /* 12-col grid helper: x position of column */
    col: (n, total = 12, w = 900, m = 20) => {
      const cw = (w - m * (total + 1)) / total;
      return m + (n - 1) * (cw + m);
    },
    gridlines: (W, Hh, cols = 12, m = 20, col = null) => {
      const g = e('g');
      const cw = (W - m * (cols + 1)) / cols;
      for (let k = 0; k <= cols; k++) {
        g.appendChild(H.line(m + k * (cw + m) - m / 2, 0, m + k * (cw + m) - m / 2, Hh, { stroke: C.gray3, sw: 0.5, opacity: 0.7 }));
      }
      return g;
    },
    lbl: (x, y, s, o = {}) => TXT(x, y, s, o)
  };

  VIZ.mount = mount;
  VIZ.register = (id, spec) => { VIZ[id] = spec; };
  VIZ.H = H;
  VIZ.e = e;
  VIZ.C = C;
  VIZ.lerp = lerp;
  VIZ.clamp01 = clamp01;
  VIZ.easeOut = easeOut;
  VIZ.easeIn = easeIn;
  VIZ.readColors = readColors;
  VIZ.refreshAll = function () { document.querySelectorAll('[data-viz]').forEach(el => mount(el, VIZ[el.dataset.viz])); };
  global.VIZ = VIZ;
})(window);
