import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = '/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const SHOTS = path.join(ROOT, '.shots');
mkdirSync(SHOTS, { recursive: true });

async function loadPlaywright() {
  const cands = [
    path.join(process.env.HOME || '', '.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js'),
    path.join(process.cwd(), 'node_modules/playwright-core/index.js'),
  ].filter(existsSync);
  for (const c of cands) {
    const m = await import(pathToFileURL(c).href);
    return m.chromium ? m : (m.default || {});
  }
  const m = await import('playwright-core');
  return m.chromium ? m : (m.default || {});
}
function resolveChromium() {
  for (const cache of [`${process.env.HOME}/Library/Caches/ms-playwright`, `${process.env.HOME}/.cache/ms-playwright`]) {
    if (!existsSync(cache)) continue;
    for (const d of readdirSync(cache).filter(x => x.startsWith('chromium-')).sort().reverse()) {
      const p = path.join(cache, d, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium');
      if (existsSync(p)) return p;
    }
  }
  return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

const { chromium } = await loadPlaywright();
const failures = [], warnings = [], shots = [];
const ok = (c, m) => (c ? true : (failures.push(m), false));

let browser;
try {
  browser = await chromium.launch({ executablePath: resolveChromium(), headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, locale: 'zh-CN' });
  const page = await ctx.newPage();
  page.on('pageerror', e => failures.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') failures.push('CONSOLE: ' + m.text()); });
  page.on('requestfailed', r => failures.push('REQFAIL: ' + r.url() + ' ' + r.failure()?.errorText));

  await page.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await page.waitForTimeout(900);

  // --- 1. 结构 ---
  // 章节数从 DATA 动态读取，后续所有断言都基于它，避免再写死数字
  const totalCh = await page.evaluate(() => window.DATA.length);
  const chapters = await page.$$eval('.chapter', els => els.map(e => e.id));
  ok(chapters.length === totalCh, `章节数应为 ${totalCh}，实际 ${chapters.length}: ${chapters}`);
  const railCount = await page.$$eval('#railnav a', e => e.length);
  ok(railCount === totalCh, `侧栏目录应 ${totalCh} 条，实际 ${railCount}`);
  const ids = chapters;
  ok(new Set(ids).size === ids.length, '章节 id 重复: ' + ids.join(','));
  // 顶栏章节链已移除，改为「当前章节指示器」单点显示
  const nowNo = await page.textContent('#nowNo');
  const firstCh = await page.evaluate(() => window.DATA[0]);
  ok(nowNo.trim() === firstCh.no, `顶栏章节指示器初始序号应为 ${firstCh.no}，实际 ${nowNo}`);
  const nowT = await page.textContent('#nowT');
  ok(nowT.trim() === firstCh.title, `顶栏章节标题异常: ${nowT}`);
  // 「01 / NN」的 NN 必须等于章节数，且不能是硬编码
  const nowTotal = (await page.textContent('#nowTotal')).trim();
  ok(nowTotal === String(totalCh).padStart(2, '0'),
     `顶栏章节总数应为 ${totalCh}，实际 ${nowTotal}`);
  // 滚到中间章节时，序号与总数都要正确
  await page.evaluate(() => { const t = document.getElementById('c5'); window.scrollTo({top: t.getBoundingClientRect().top + scrollY - 60, behavior: 'instant'}); });
  await page.waitForTimeout(500);
  const idxMid = (await page.textContent('#nowIdx')).trim();
  const totMid = (await page.textContent('#nowTotal')).trim();
  ok(idxMid === '05', `滚动到第 5 章时序号应为 05，实际 ${idxMid}`);
  ok(totMid === String(totalCh).padStart(2, '0'), `滚动后总数变了: ${totMid}`);
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS,'01-hero.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // --- 2. 图解全部挂载 ---
  const vizCount = await page.$$eval('[data-viz]', e => e.length);
  ok(vizCount >= 9, `图解容器应 >=9，实际 ${vizCount}`);
  // 逐个滚过每个图解，确保 IntersectionObserver 全部触发
  const vizIds = await page.$$eval('[data-viz]', els => els.map(e => e.dataset.viz));
  for (const vid of vizIds) {
    await page.evaluate(id => {
      const el = document.querySelector(`[data-viz="${id}"]`);
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 300, behavior: 'instant' });
    }, vid);
    await page.waitForTimeout(260);
  }
  await page.waitForTimeout(600);
  const mounted = await page.$$eval('[data-viz]', els => els.map(e => ({
    id: e.dataset.viz,
    mounted: e.dataset.mounted === '1',
    hasSvg: !!e.querySelector('svg'),
    nodes: e.querySelectorAll('svg *').length,
    steps: e.querySelectorAll('.viz__step').length,
  })));
  const badMount = mounted.filter(m => !m.mounted || !m.hasSvg || m.nodes < 8);
  ok(badMount.length === 0, '未正确渲染的图解: ' + JSON.stringify(badMount));
  const noSteps = mounted.filter(m => m.steps < 2);
  ok(noSteps.length === 0, '步进按钮不足的图解: ' + JSON.stringify(noSteps.map(s => s.id)));
  console.log('VIZ:', JSON.stringify(mounted, null, 1));

  // --- 3. 逐个图解走一遍所有步进，抓运行时错误 ---
  for (const m of mounted) {
    const box = page.locator(`[data-viz="${m.id}"]`).first();
    await box.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(120);
    const steps = await box.locator('.viz__step').count();
    for (let i = 0; i < steps; i++) {
      await box.locator('.viz__step').nth(i).click();
      await page.waitForTimeout(70);
    }
    // 播放按钮
    await box.locator('.viz__btn').nth(1).click();
    await page.waitForTimeout(500);
    await box.locator('.viz__btn').nth(1).click();
    const nodesAfter = await box.locator('svg *').count();
    ok(nodesAfter >= 8, `${m.id} 播放后节点数异常: ${nodesAfter}`);
  }
  await page.screenshot({ path: path.join(SHOTS,'02-viz.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // --- 4. 关键图解截图 ---
  const keyViz = await page.$$eval('[data-viz]', els => els.map(e => e.dataset.viz));
  for (const id of keyViz) {
    const box = page.locator(`[data-viz="${id}"]`).first();
    if (!(await box.count())) { failures.push('缺少图解: ' + id); continue; }
    await box.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(180);
    await box.locator('.viz__step').nth(Math.min(1, (await box.locator('.viz__step').count()) - 1)).click();
    await page.waitForTimeout(160);
    await box.screenshot({ path: path.join(SHOTS, `viz-${id}.png`) });
    shots.push([`viz-${id}`, path.join(SHOTS, `viz-${id}.png`)]);
  }

  // --- 5. 交互：QA / flip / copy ---
  const qaN = await page.$$eval('.qa', e => e.length);
  ok(qaN >= 40, `问答题应 >=40，实际 ${qaN}`);
  const firstQa = page.locator('.qa__q').first();
  await firstQa.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await firstQa.click();
  await page.waitForTimeout(160);
  const qaOpen = await page.$$eval('.qa.is-open .qa__a', els => els.filter(e => getComputedStyle(e).display !== 'none').length);
  ok(qaOpen > 0, '问答展开无效');

  const flipN = await page.$$eval('.flip', e => e.length);
  ok(flipN >= 5, `闪卡应 >=5，实际 ${flipN}`);
  const fl = page.locator('.flip').first();
  await fl.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await fl.click();
  await page.waitForTimeout(420);
  const flipOpen = await page.$$eval('.flip.is-open', e => e.length);
  ok(flipOpen > 0, '闪卡翻面无效');
  await page.screenshot({ path: path.join(SHOTS,'03-flip.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // --- 6. 搜索 ---
  await page.fill('#q', '线程池');
  await page.waitForTimeout(300);
  const resN = await page.$$eval('.results a[data-i]', e => e.length);
  ok(resN > 0, '搜索「线程池」无结果');
  await page.screenshot({ path: path.join(SHOTS,'04-search.png'), clip: { x: 700, y: 0, width: 740, height: 620 } });
  await page.fill('#q', 'HashMap');
  await page.waitForTimeout(250);
  const resN2 = await page.$$eval('.results a[data-i]', e => e.length);
  ok(resN2 > 0, '搜索「HashMap」无结果');
  const idxSize = await page.evaluate(() => window.DATA ? 'ok' : 'no');
  ok(idxSize === 'ok', 'DATA 未挂载');
  await page.fill('#q', '');
  await page.keyboard.press('Escape');

  // --- 7. 标记已掌握 + localStorage ---
  const tick = page.locator('#railnav a').first().locator('.tick');
  await tick.click({ force: true });
  await page.waitForTimeout(200);
  const doneLS = await page.evaluate(() => JSON.parse(localStorage.getItem('jod.done') || '[]'));
  ok(doneLS.length === 1, '标记掌握未写入 localStorage: ' + JSON.stringify(doneLS));
  const pnum = await page.textContent('#pnum');
  ok(pnum.trim() === '1/' + totalCh, '进度显示异常: ' + pnum);

  // --- 8. 主题切换 ---
  await page.click('#themeBtn');
  await page.waitForTimeout(500);
  const th = await page.evaluate(() => document.documentElement.dataset.theme);
  ok(th === 'night', '主题切换失败: ' + th);
  const vizAlive = await page.$$eval('[data-viz] svg', e => e.length);
  ok(vizAlive >= 9, '切主题后图解丢失');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS,'05-night.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  // 图解在暗色下仍有内容
  const box = page.locator('[data-viz="hashmap"]').first();
  await box.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  const darkNodes = await box.locator('svg *').count();
  ok(darkNodes >= 8, '暗色主题下图解节点数: ' + darkNodes);
  await box.screenshot({ path: path.join(SHOTS, 'viz-hashmap-night.png') });
  await page.click('#themeBtn');
  await page.waitForTimeout(400);

  // --- 9. 栅格 ---
  await page.evaluate(() => document.getElementById('tweaks').classList.add('on'));
  await page.waitForTimeout(320);
  await page.click('#gridBtn');
  await page.waitForTimeout(200);
  const g = await page.evaluate(() => document.body.dataset.grid);
  ok(g === 'on', '栅格开关失败');
  await page.screenshot({ path: path.join(SHOTS,'06-grid.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.click('#gridBtn');

  // --- 10. 溢出 & 代码高亮 ---
  const ovf = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth
  }));
  ok(ovf.sw <= ovf.cw + 2, `桌面端横向溢出: ${ovf.sw} > ${ovf.cw}`);
  const hlN = await page.$$eval('.code pre .k', e => e.length);
  ok(hlN > 20, '代码高亮关键字数异常: ' + hlN);
  const codeN = await page.$$eval('.code', e => e.length);
  const tableN = await page.$$eval('.tbl', e => e.length);
  const noteN = await page.$$eval('.note', e => e.length);
  console.log('COUNTS', { codeN, tableN, noteN, qaN, flipN, viz: vizCount });

  // --- 11. 每章截图 ---
  for (const id of chapters) {
    await page.evaluate(cid => {
      const t = document.getElementById(cid);
      window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 52 });
    }, id);
    await page.waitForTimeout(320);
    await page.screenshot({ path: path.join(SHOTS, `ch-${id}.png`), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  }

  // --- 11b. 关键区块特写 ---
  const closeups = [
    ['cu-hero', null, 0],
    ['cu-chapter', '#c2', null],
    ['cu-viz', '[data-viz="hashmap"]', null],
    ['cu-qa', '.qa-list', null],
    ['cu-code', '.code', null],
    ['cu-table', '.tblwrap', null],
    ['cu-flip', '.flips', null],
  ];
  for (const [name, sel] of closeups) {
    if (sel) {
      const el = page.locator(sel).first();
      await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(260);
      await el.screenshot({ path: path.join(SHOTS, name + '.png') }).catch(() => warnings.push('特写失败: ' + name));
    } else {
      await page.screenshot({ path: path.join(SHOTS, name + '.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
    }
  }

  // --- 12. 响应式 ---
  const mob = await ctx.newPage();
  mob.on('pageerror', e => failures.push('MOBILE PAGEERROR: ' + e.message));
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto('file://' + path.join(ROOT, 'index.html'), { waitUntil: 'load' });
  await mob.waitForTimeout(800);
  const mOvf = await mob.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  ok(mOvf.sw <= mOvf.cw + 2, `移动端横向溢出: ${mOvf.sw} > ${mOvf.cw}`);
  const railVisible = await mob.locator('.rail').isVisible();
  ok(!railVisible, '移动端侧栏应隐藏');
  await mob.screenshot({ path: path.join(SHOTS, '07-mobile.png') });
  await mob.evaluate(() => { const t = document.getElementById('c2'); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 48 }); });
  await mob.waitForTimeout(500);
  await mob.screenshot({ path: path.join(SHOTS, '08-mobile-ch2.png') });
  // 移动端图解
  const mv = await mob.$$eval('[data-viz] svg', e => e.length);
  ok(mv >= 1, '移动端无图解');
  shots.push(['07-mobile', path.join(SHOTS, '07-mobile.png')]);
  await mob.close();

} catch (err) {
  failures.push('FATAL: ' + err.message + '\n' + err.stack);
} finally {
  if (browser) await browser.close().catch(() => {});
}

console.log('\n===== SHOTS =====');
shots.forEach(([n, p]) => console.log(' ', n, p));
console.log('\n===== WARNINGS ====='); warnings.forEach(w => console.log(' ⚠', w));
console.log('\n===== FAILURES (' + failures.length + ') ====='); failures.forEach(f => console.log(' ✗', f));
process.exit(failures.length ? 1 : 0);
