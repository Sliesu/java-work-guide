/* ============================================================
   APP — nav / search / progress / theme / tweaks / interactions
   ============================================================ */
(function (D) {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const LS = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('jod.' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('jod.' + k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- search index ---------- */
  const INDEX = [];
  D.forEach(ch => ch.blocks.forEach(b => {
    const push = (text, kind) => INDEX.push({ t: text, k: kind, c: ch.id, cn: ch.no, ct: ch.title });
    if (b.html) push(b.html.replace(/<[^>]+>/g, ''), '要点');
    if (b.h) push(b.h, '小节');
    if (b.items && typeof b.items[0] === 'string') b.items.forEach(i => push(i.replace(/<[^>]+>/g, ''), '列表'));
    if (b.items && typeof b.items[0] === 'object' && b.items[0].q) b.items.forEach(i => { push(i.q, '问答'); push(i.a.replace(/<[^>]+>/g, ''), '答案'); });
    if (b.head) push(b.head.join(' '), '表格');
    if (b.rows) b.rows.forEach(r => push(r.join(' ').replace(/<[^>]+>/g, ''), '表格'));
    if (b.fn) push(b.fn, '代码');
    if (b.code) push(b.code.slice(0, 400), '代码');
    if (b.title) push(b.title, '案例');
    if (b.id) push(b.id, '图解');
  }));

  /* ---------- rail + 章节指示器 ---------- */
  function buildNav() {
    // 章节总数只从 DATA 读一次，杜绝再出现写死的数字
    $('#nowTotal').textContent = String(D.length).padStart(2, '0');

    $('#railnav').innerHTML = D.map(ch =>
      `<a href="#${ch.id}" data-ch="${ch.id}" data-no="${ch.no}" data-title="${ch.title}"><span class="no">${ch.no}</span><span>${ch.title}</span><span class="tick"></span></a>`
    ).join('');

    const done = LS.get('done', []);
    $$('#railnav a').forEach(a => {
      if (done.includes(a.dataset.ch)) a.dataset.done = '1';
    });
    updateProgress();
  }

  function updateProgress() {
    const done = LS.get('done', []);
    $('#pnum').textContent = `${done.length}/${D.length}`;
    $('#pbar').style.width = (done.length / D.length * 100) + '%';
  }

  /* 点击方框 = 标记已掌握（不跳转） */
  $('#railnav').addEventListener('click', e => {
    const tick = e.target.closest('.tick');
    if (!tick) return;
    e.preventDefault(); e.stopPropagation();
    const a = tick.closest('a');
    const done = LS.get('done', []);
    const i = done.indexOf(a.dataset.ch);
    if (i >= 0) { done.splice(i, 1); a.dataset.done = '0'; }
    else { done.push(a.dataset.ch); a.dataset.done = '1'; }
    LS.set('done', done);
    updateProgress();
    toast(i >= 0 ? '已取消标记' : '已标记掌握：' + a.dataset.title);
  });

  /* ---------- 滚动监听：侧栏高亮 + 顶栏章节指示 + 阅读进度线 ---------- */
  const readbar = $('#readbar');
  let cur = '';        // 当前章节 id
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    readbar.style.width = (max > 0 ? Math.min(100, Math.max(0, y / max * 100)) : 0) + '%';

    // 当前章节 = 判定线（顶栏底边下方 8px）之上、最靠近顶部的那个
    // 用实时 rect 而非 offsetTop：offsetTop 不含祖先变换，缓动滚动中也会失准
    const line = 52 + 8;
    let active = null;
    for (const ch of D) {
      const el = document.getElementById(ch.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= line) active = ch;
      else break;
    }
    if (!active) active = D[0];
    if (active.id !== cur) {
      cur = active.id;
      $$('#railnav a').forEach(n => n.classList.toggle('is-on', n.dataset.ch === cur));
      $('#nowNo').textContent = active.no;
      $('#nowT').textContent = active.title;
      $('#nowIdx').textContent = active.no;
    }
    ticking = false;
  }

  function bindScroll() {
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    }, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- search ---------- */
  const q = $('#q'), results = $('#results');
  let hits = [], sel = 0;

  function mark(str, kw) {
    const i = str.toLowerCase().indexOf(kw.toLowerCase());
    if (i < 0) return esc2(str.slice(0, 90));
    return esc2(str.slice(Math.max(0, i - 24), i)) +
      '<mark>' + esc2(str.substr(i, kw.length)) + '</mark>' +
      esc2(str.substr(i + kw.length, 70));
  }
  const esc2 = s => s.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  function search() {
    const kw = q.value.trim();
    if (kw.length < 1) { results.classList.remove('on'); results.innerHTML = ''; hits = []; return; }
    hits = INDEX.filter(x => x.t.toLowerCase().includes(kw.toLowerCase())).slice(0, 24);
    sel = 0;
    if (!hits.length) {
      results.innerHTML = `<a class="sel" href="#" onclick="return false"><span class="no">—</span><span class="ttl">没有匹配「${esc2(kw)}」</span><span class="crumb"></span></a>`;
    } else {
      results.innerHTML = hits.map((h, i) =>
        `<a href="#${h.c}" data-i="${i}"><span class="no">${h.cn}</span><span class="ttl">${mark(h.t, kw)}</span><span class="crumb">${h.ct} · ${h.k}</span></a>`
      ).join('');
      results.querySelectorAll('a')[0]?.classList.add('sel');
    }
    results.classList.add('on');
  }

  q.addEventListener('input', search);
  q.addEventListener('focus', search);
  q.addEventListener('keydown', e => {
    if (e.key === 'Escape') { q.value = ''; results.classList.remove('on'); q.blur(); return; }
    if (!hits.length) return;
    const links = results.querySelectorAll('a[data-i]');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length;
      links.forEach((l, i) => l.classList.toggle('sel', i === sel));
      links[sel]?.scrollIntoView?.({ block: 'nearest' });
    }
    if (e.key === 'Enter') { e.preventDefault(); links[sel]?.click(); }
  });
  results.addEventListener('click', e => {
    if (e.target.closest('a')) { results.classList.remove('on'); q.blur(); }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.searchbox') && !e.target.closest('.results')) results.classList.remove('on');
  });

  /* ---------- interactions: qa / flip / copy ---------- */
  document.addEventListener('click', e => {
    const qa = e.target.closest('.qa__q');
    if (qa) { qa.parentElement.classList.toggle('is-open'); qa.querySelector('.qa__x').textContent = qa.parentElement.classList.contains('is-open') ? '−' : '+'; return; }

    const flip = e.target.closest('.flip');
    if (flip) { flip.classList.toggle('is-open'); return; }

    const copy = e.target.closest('[data-copy]');
    if (copy) {
      const pre = copy.closest('.code').querySelector('pre');
      navigator.clipboard?.writeText(pre.innerText).then(() => {
        copy.textContent = 'OK';
        setTimeout(() => copy.textContent = 'COPY', 1200);
      }).catch(() => { copy.textContent = 'FAIL'; setTimeout(() => copy.textContent = 'COPY', 1200); });
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList?.contains('flip')) e.target.classList.toggle('is-open');
  });

  /* ---------- theme ---------- */
  const THEME = LS.get('theme', 'light');
  document.documentElement.dataset.theme = THEME;
  $$('[data-theme-set]').forEach(b => b.classList.toggle('is-on', b.dataset.themeSet === THEME));
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    LS.set('theme', t);
    $$('[data-theme-set]').forEach(b => b.classList.toggle('is-on', b.dataset.themeSet === t));
    window.VIZ.readColors();
    window.VIZ.refreshAll();
  }
  $('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'night' ? 'light' : 'night');
  $$('[data-theme-set]').forEach(b => b.onclick = () => setTheme(b.dataset.themeSet));

  /* ---------- tweaks ---------- */
  const tw = $('#tweaks');
  let twOpen = LS.get('tw', false);
  // body 上的 data-tw 驱动 CSS 里的 --tw-h，让回顶按钮自动避让面板高度
  const syncTw = () => {
    tw.classList.toggle('on', twOpen);
    document.body.dataset.tw = twOpen ? 'on' : 'off';
  };
  syncTw();
  $('#tweaksHd').onclick = () => { twOpen = !twOpen; syncTw(); LS.set('tw', twOpen); };

  const fsSaved = LS.get('fs', 16);
  $('#fs').value = fsSaved;
  document.documentElement.style.setProperty('--t-16', fsSaved / 16 * 1 + 'rem');
  $('#fs').oninput = e => { document.documentElement.style.setProperty('--t-16', (e.target.value / 16) + 'rem'); LS.set('fs', e.target.value); };

  const gridSaved = LS.get('grid', false);
  document.body.dataset.grid = gridSaved ? 'on' : 'off';
  $('#gridBtn').classList.toggle('is-on', gridSaved);
  $('#gridBtn').onclick = () => {
    const on = document.body.dataset.grid !== 'on';
    document.body.dataset.grid = on ? 'on' : 'off';
    $('#gridBtn').classList.toggle('is-on', on);
    LS.set('grid', on);
  };

  /* ---------- tooltip ---------- */
  const tip = $('#tip');
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a[href^="#"]');
    if (!el) return;
    const id = el.getAttribute('href').slice(1);
    const ch = D.find(c => c.id === id);
    if (!ch) return;
    tip.textContent = ch.no + ' · ' + ch.title;
    tip.classList.add('on');
  });
  document.addEventListener('mousemove', e => {
    if (!tip.classList.contains('on')) return;
    const r = tip.getBoundingClientRect();
    let x = e.clientX + 14, y = e.clientY + 16;
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 12;
    // 底部要给 Tweaks 面板（收起 34px / 展开约 252px）让位
    const floor = innerHeight - (twOpen ? 262 : 44);
    if (y + r.height > floor) y = e.clientY - r.height - 10;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  });
  document.addEventListener('mouseout', e => { if (e.target.closest('a[href^="#"]')) tip.classList.remove('on'); });

  /* ---------- toast ---------- */
  // 贴在顶栏下方居中：右下角已被 tweaks / 回顶按钮占用
  function toast(msg) {
    tip.textContent = msg;
    tip.classList.add('on');
    const x = Math.max(12, innerWidth / 2 - tip.offsetWidth / 2);
    tip.style.left = x + 'px';
    tip.style.top = '68px';
    clearTimeout(tip._t);
    tip._t = setTimeout(() => tip.classList.remove('on'), 1600);
  }

  /* ---------- to top ---------- */
  const toTop = $('#toTop');
  addEventListener('scroll', () => {
    toTop.classList.toggle('on', scrollY > 600);
  }, { passive: true });
  toTop.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* ---------- global keys ---------- */
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '/') { e.preventDefault(); q.focus(); q.select(); }
    if (e.key === 'g') { $('#gridBtn').click(); }
    if (e.key === 't') $('#themeBtn').click();
    if (e.key === '?') toast('/ 搜索 · g 栅格 · t 主题 · ←→ 步进图解');
  });

  /* ---------- boot ---------- */
  window.renderChapters(D);
  buildNav();
  bindScroll();

  // mount all vizzes lazily via IntersectionObserver for perf
  const vizIO = new IntersectionObserver(es => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.dataset.mounted) return;
      el.dataset.mounted = '1';
      vizIO.unobserve(el);
      const spec = window.VIZ[el.dataset.viz];
      if (spec) { spec.no = spec.no || (+(el.closest('.chapter').id.slice(1)) * 10 + 1); window.VIZ.mount(el, spec); }
    });
  }, { rootMargin: '400px 0px' });
  $$('[data-viz]').forEach(el => vizIO.observe(el));

  /* smooth in-page nav without scrollIntoView */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const t = document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + scrollY - 52;
    window.scrollTo({ top: y, behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);
  });

  window.addEventListener('hashchange', () => {
    const t = document.getElementById(location.hash.slice(1));
    if (t) window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 52 });
  });

  if (location.hash) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) setTimeout(() => window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 52 }), 60);
  }

  console.log('%c后端面试题库 / Java', 'font:700 18px system-ui;color:#C7000B',
    '· ' + D.length + ' 章 / ' + $$('.qa').length + ' 问答 / ' + $$('[data-viz]').length + ' 图解');
})(window.DATA);
