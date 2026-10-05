/* ============================================================
   RENDERER — block types → DOM
   ============================================================ */
(function (D) {
  'use strict';

  const esc = s => String(s)
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------- 极简 Java 高亮 ---------- */
  const KW = new Set(('abstract assert boolean break byte case catch char class const continue default do double else enum extends ' +
    'final finally float for goto if implements import instanceof int interface long native new package private protected public ' +
    'return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null ' +
    'var record yield sealed permits').split(' '));
  const LIT = new Set(['true', 'false', 'null']);

  function hl(code) {
    const lines = code.split('\n');
    return lines.map(line => {
      // 保护字符串和注释片段
      const toks = [];
      let rest = line;
      // 抽取行注释
      let comment = '';
      const ci = findCommentIndex(rest);
      if (ci >= 0) { comment = rest.slice(ci); rest = rest.slice(0, ci); }
      // 抽取字符串
      const strs = [];
      rest = rest.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, m => { strs.push(m); return '\u0001' + (strs.length - 1) + '\u0001'; });
      let html = esc(rest)
        .replace(/([A-Za-z_$][A-Za-z0-9_$]*)/g, (m, p1, off) => {
          const prev = rest[off - 1] || '';
          if (prev === '.') return p1;
          if (KW.has(m)) return '<span class="k">' + m + '</span>';
          if (LIT.has(m)) return '<span class="k">' + m + '</span>';
          if (/^[A-Z]/.test(m) && rest[off + m.length] === '(') return '<span class="f">' + m + '</span>';
          if (/^[A-Z]/.test(m)) return '<span class="n">' + m + '</span>';
          return p1;
        })
        .replace(/([A-Za-z_$][A-Za-z0-9_$]*)(?=\s*\()/g, '<span class="f">$1</span>');
      // 还原字符串
      html = html.replace(/\u0001(\d+)\u0001/g, (m, i) => '<span class="s">' + esc(strs[i]) + '</span>');
      // 数字
      html = html.replace(/\b(\d+\.?\d*[fFdDlL]?)\b/g, '<span class="n">$1</span>');
      if (comment) html += '<span class="c">' + esc(comment) + '</span>';
      return html || '&nbsp;';
    }).join('\n');
  }
  function findCommentIndex(s) {
    let inS = -1;
    for (let i = 0; i < s.length - 1; i++) {
      if (s[i] === '"' || s[i] === "'") { if (i !== inS) inS = i; else inS = -1; }
      if (inS === -1 && s[i] === '/' && s[i + 1] === '/') return i;
    }
    return -1;
  }

  /* ---------- block renderers ---------- */
  const R = {};

  R.lead = b => `<div class="block"><p class="lead">${b.html}</p></div>`;

  R.p = b => `<div class="block"><p class="txt">${b.html}</p></div>`;

  R.list = b => `<div class="block"><ul class="list">${b.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`;

  R.steps = b => `<div class="block"><ol class="steps">${b.items.map(i => `<li>${i}</li>`).join('')}</ol></div>`;

  R.sub = b => `<div class="block">
      <div class="block__hd">
        <span class="block__tag ${/HOT|★★★★★/.test(b.tag) ? 'block__tag--red' : ''}">${esc(b.tag || '')}</span>
        <span class="block__h">${b.h}</span>
      </div>
    </div>`;

  R.table = b => `<div class="block">
      <div class="tblwrap">
        <table class="tbl">
          ${b.caption ? `<caption>${b.caption}</caption>` : ''}
          <thead><tr>${b.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;

  R.code = b => `<div class="block code">
      <div class="code__hd">
        <span class="fn">${esc(b.fn || 'code')}</span>
        <button type="button" data-copy>COPY</button>
      </div>
      <pre><code>${hl(b.code)}</code></pre>
    </div>`;

  R.note = b => `<div class="block">
      <div class="note ${b.k === '高频坑' || b.k === '机试策略' ? 'note--warn' : 'note--ok'}">
        <div class="note__k">${esc(b.k || 'NOTE')}</div>
        <div class="note__b">${b.html}</div>
      </div>
    </div>`;

  R.case = b => `<div class="block">
      <div class="case">
        <div class="case__hd"><span class="lb">${esc(b.lb || 'CASE')}</span><span class="tt">${b.title}</span></div>
        <div class="case__bd">
          ${b.html ? `<p>${b.html}</p>` : ''}
          ${(b.rows || []).map(r => `<div class="case__row"><div class="k">${r[0]}</div><div class="v">${r[1]}</div></div>`).join('')}
        </div>
      </div>
    </div>`;

  R.flips = b => `<div class="block">
      <div class="flips">
        ${b.items.map(f => `<div class="flip" tabindex="0" role="button" aria-label="点击翻面">
          <div class="flip__in">
            <div class="flip__f"><span class="qi">问</span><span class="qt">${f.q}</span></div>
            <div class="flip__b"><span class="ai">答</span><span class="at">${f.a}</span></div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;

  R.qa = b => `<div class="block qa-list">
      ${b.items.map((it, i) => `<div class="qa">
        <button class="qa__q" type="button">
          <span class="qa__n">${String(i + 1).padStart(2, '0')}</span>
          <span class="qa__t">${it.q}</span>
          <span class="qa__x">+</span>
        </button>
        <div class="qa__a">${it.a}</div>
      </div>`).join('')}
    </div>`;

  R.split = b => `<div class="block split ${b.n === 3 ? 'split--3' : ''}">${b.cols.map(c => `<div>${c.map(x => R[x.t] ? R[x.t](x) : '').join('')}</div>`).join('')}</div>`;

  R.viz = b => `<div class="block vizwrap" data-viz="${b.id}"></div>`;

  R.div = b => `<div class="block">${b.html}</div>`;

  /* ---------- chapter ---------- */
  function chapter(ch) {
    const meta = (ch.meta || []).map(m => `<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join('');
    return `
    <section class="chapter" id="${ch.id}">
      <div class="chapter__rule"></div>
      <div class="chapter__hd">
        <div class="chapter__no">${ch.no}</div>
        <div>
          <h2 class="chapter__t">${ch.title}</h2>
          <p class="chapter__sub">${ch.sub}</p>
          <dl class="chapter__meta">${meta}</dl>
        </div>
      </div>
      ${ch.blocks.map(b => R[b.t] ? R[b.t](b) : '').join('')}
    </section>`;
  }

  window.renderChapters = function (data) {
    document.getElementById('content').innerHTML = data.map(chapter).join('');
  };
  window.RENDERERS = R;
})(window.DATA);
