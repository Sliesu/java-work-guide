import path from 'node:path';
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL('/Users/yihang/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js').href);
const chromium = m.chromium || (m.default || {}).chromium;
const ROOT = '/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const SHOTS = path.join(ROOT, '.shots');
const F = [];
const ok = (c, m) => (c ? true : (F.push(m), false));

const browser = await chromium.launch({
  executablePath: '/Users/yihang/Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
  headless: true, args: ['--no-sandbox']
});
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, locale: 'zh-CN' });
  const page = await ctx.newPage();
  page.on('pageerror', e => F.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') F.push('CONSOLE: ' + m.text()); });
  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(900);

  // 1. 旧结构已移除
  ok(await page.locator('#navmid').count() === 0, '顶部章节链 navmid 仍存在');
  ok(await page.locator('.navjump').count() === 0, 'navjump 仍存在');
  ok(await page.locator('.rail__ft').count() === 0, '侧栏底部掌握条仍存在');
  ok(await page.locator('#doneCount').count() === 0, 'doneCount 仍存在');

  // 2. 侧栏延伸到视口底
  const rail = await page.locator('.rail').boundingBox();
  ok(Math.abs(rail.height - (900 - 52)) < 2, `侧栏未延伸到视口底: h=${rail.height}, 应=${900 - 52}`);
  const railBg = await page.evaluate(() => getComputedStyle(document.querySelector('.rail')).backgroundColor);
  ok(railBg !== 'rgba(0, 0, 0, 0)', '侧栏背景透明，底部会透出主内容');

  // 3. 顶栏不溢出 + 元素不重叠
  const bar = await page.evaluate(() => {
    const h = document.querySelector('.masthead').getBoundingClientRect().height;
    const els = [...document.querySelectorAll('.masthead__brand,.masthead__now,.searchbox,.prog,.iconbtn')];
    return {
      h,
      overflow: document.querySelector('.masthead').scrollWidth > document.querySelector('.masthead').clientWidth + 1,
      boxes: els.map(e => { const r = e.getBoundingClientRect(); return { c: e.className.split(' ')[0], l: Math.round(r.left), r: Math.round(r.right) }; }),
      clipped: els.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.className.split(' ')[0])
    };
  });
  ok(!bar.overflow, '顶栏横向溢出');
  ok(bar.clipped.length === 0, '顶栏元素内容被裁切: ' + bar.clipped.join(','));
  // 相邻元素不得重叠
  const bs = bar.boxes.slice().sort((a, b) => a.l - b.l);
  for (let i = 1; i < bs.length; i++) {
    ok(bs[i].l >= bs[i - 1].r - 1, `顶栏元素重叠: ${bs[i - 1].c} 与 ${bs[i].c} (${bs[i - 1].r} > ${bs[i].l})`);
  }

  // 4. Tweaks / toTop 不重叠（收起态 + 展开态）
  const overlapCheck = async label => {
    const r = await page.evaluate(() => {
      const tw = document.querySelector('.tweaks').getBoundingClientRect();
      const tt = document.querySelector('.toTop').getBoundingClientRect();
      const inter = !(tt.right <= tw.left || tt.left >= tw.right || tt.bottom <= tw.top || tt.top >= tw.bottom);
      return { inter, tw: { t: Math.round(tw.top), l: Math.round(tw.left) }, tt: { t: Math.round(tt.top), r: Math.round(tt.right) } };
    });
    ok(!r.inter, `[${label}] 回顶按钮与 Tweaks 重叠: tw.top=${r.tw.t} toTop.top=${r.tt.t}`);
    return r;
  };
  await page.evaluate(() => window.scrollTo({top:3000,behavior:'instant'}));
  await page.waitForTimeout(400);
  const c1 = await overlapCheck('收起');
  ok(await page.locator('.toTop.on').count() === 1, '滚动后回顶按钮未出现');

  // 展开 tweaks
  await page.click('#tweaksHd');

  await page.waitForTimeout(450);
  const c2 = await overlapCheck('展开');
  ok(c2.tt.t < c1.tt.t, `展开后回顶按钮未上移 (${c1.tt.t} → ${c2.tt.t})`);
  await page.click('#tweaksHd');
  await page.waitForTimeout(400);
  await overlapCheck('收起复原');

  // 5. 章节指示器跟随滚动
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(500);
  const at0 = await page.textContent('#nowT');
  const idx0 = await page.textContent('#nowIdx');
  await page.evaluate(() => { const t = document.getElementById('c4'); window.scrollTo({top:t.getBoundingClientRect().top+scrollY-52,behavior:'instant'}); });
  await page.waitForTimeout(600);
  const at4 = await page.textContent('#nowT');
  const idx4 = await page.textContent('#nowIdx');
  ok(at0 !== at4, `章节指示器未跟随滚动: "${at0}" → "${at4}"`);
  ok(at4.includes('JVM'), `章节指示器内容错误: ${at4}`);
  ok(idx0 !== idx4, `章节序号未更新: ${idx0} → ${idx4}`);
  // 侧栏高亮同步
  const railOn = await page.textContent('#railnav a.is-on');
  ok(railOn.includes('JVM'), `侧栏高亮未同步: ${railOn}`);

  // 6. 阅读进度线
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(500);
  const w0 = await page.evaluate(() => document.getElementById('readbar').style.width);
  await page.evaluate(() => window.scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
  await page.waitForTimeout(600);
  const w1 = await page.evaluate(() => document.getElementById('readbar').style.width);
  ok(parseFloat(w0) < 1, `顶部未滚动时进度线应为 0，实际 ${w0}`);
  ok(parseFloat(w1) > 95, `滚到底部进度线应接近 100，实际 ${w1}`);

  // 7. Hero 排版
  await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(500);
  const hero = await page.evaluate(() => {
    const t = document.querySelector('.hero__t').getBoundingClientRect();
    const m = document.querySelector('.hero__meta').getBoundingClientRect();
    const i = document.querySelector('.hero__intro').getBoundingClientRect();
    const c = document.querySelector('.hero__cta').getBoundingClientRect();
    return { tBottom: Math.round(t.bottom), mTop: Math.round(m.top), tRight: Math.round(t.right), mLeft: Math.round(m.left), iRight: Math.round(i.right), cLeft: Math.round(c.left) };
  });
  ok(hero.tRight <= hero.mLeft, `Hero 标题与 meta 重叠: ${hero.tRight} > ${hero.mLeft}`);
  ok(hero.iRight <= hero.cLeft, `Hero 简介与按钮重叠: ${hero.iRight} > ${hero.cLeft}`);
  await page.screenshot({ path: path.join(SHOTS, 'N1-hero.png') });

  // 8. 标记已掌握仍可用
  await page.locator('#railnav a').first().locator('.tick').click({ force: true });
  await page.waitForTimeout(250);
  const pnum = await page.textContent('#pnum');
  const totalCh2 = await page.evaluate(() => window.DATA.length);
  ok(pnum.trim() === '1/' + totalCh2, `掌握计数显示异常: "${pnum}"，应为 1/${totalCh2}`);
  const ls = await page.evaluate(() => JSON.parse(localStorage.getItem('jod.done') || '[]'));
  ok(ls.length === 1, 'localStorage 未写入: ' + JSON.stringify(ls));
  await page.locator('#railnav a').first().locator('.tick').click({ force: true });
  await page.waitForTimeout(200);

  // 9. 全文无横向溢出
  const ovf = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(ovf.sw <= ovf.cw + 2, `桌面端横向溢出 ${ovf.sw} > ${ovf.cw}`);

  await page.evaluate(() => { const t = document.getElementById('c2'); window.scrollTo({top:t.getBoundingClientRect().top+scrollY-52,behavior:'instant'}); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, 'N2-ch2.png') });

  // 10. 移动端
  const mob = await ctx.newPage();
  mob.on('pageerror', e => F.push('MOBILE: ' + e.message));
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await mob.waitForTimeout(900);
  const mOvf = await mob.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(mOvf.sw <= mOvf.cw + 2, `移动端横向溢出 ${mOvf.sw} > ${mOvf.cw}`);
  ok(await mob.locator('.rail').isVisible() === false, '移动端侧栏应隐藏');
  ok(await mob.locator('.masthead__now').isVisible() === false, '移动端章节指示器应隐藏');
  const mBar = await mob.evaluate(() => {
    const m = document.querySelector('.masthead');
    return { ovf: m.scrollWidth > m.clientWidth + 1, clipped: [...m.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.className) };
  });
  ok(!mBar.ovf, '移动端顶栏溢出');
  ok(mBar.clipped.length === 0, '移动端顶栏元素被裁切: ' + mBar.clipped.join(','));
  await mob.screenshot({ path: path.join(SHOTS, 'N3-mobile.png') });
  await mob.evaluate(() => { const t = document.getElementById('c3'); window.scrollTo({top:t.getBoundingClientRect().top+scrollY-48,behavior:'instant'}); });
  await mob.waitForTimeout(400);
  await mob.screenshot({ path: path.join(SHOTS, 'N4-mobile-ch3.png') });
  await mob.close();

  // 11. 平板
  const tab = await ctx.newPage();
  await tab.setViewportSize({ width: 900, height: 800 });
  await tab.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await tab.waitForTimeout(800);
  const tOvf = await tab.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(tOvf.sw <= tOvf.cw + 2, `900px 横向溢出 ${tOvf.sw} > ${tOvf.cw}`);
  await tab.screenshot({ path: path.join(SHOTS, 'N5-tablet.png') });
  await tab.close();

} catch (e) {
  F.push('FATAL: ' + e.message + '\n' + e.stack);
} finally {
  await browser.close().catch(() => {});
}

console.log('\n===== FAILURES (' + F.length + ') =====');
F.forEach(f => console.log(' ✗', f));
process.exit(F.length ? 1 : 0);
