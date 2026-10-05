import path from 'node:path';
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL('/Users/yihang/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js').href);
const chromium = m.chromium || (m.default||{}).chromium;
const ROOT='/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const b=await chromium.launch({executablePath:'/Users/yihang/Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',headless:true,args:['--no-sandbox']});
const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file://'+path.join(ROOT,'index.html'),{waitUntil:'load'});
await p.waitForTimeout(800);
const allIds=await p.$$eval('[data-viz]',e=>e.map(x=>x.dataset.viz));
for(const vid of allIds){
  await p.evaluate(id=>{const e=document.querySelector(`[data-viz="${id}"]`);window.scrollTo({top:e.getBoundingClientRect().top+scrollY-300,behavior:'instant'})},vid);
  await p.waitForTimeout(240);
}
await p.waitForTimeout(600);
const ids=allIds;
const report=[];
for(const id of ids){
  const box=p.locator(`[data-viz="${id}"]`).first();
  const n=await box.locator('.viz__step').count();
  for(let i=0;i<n;i++){
    await box.locator('.viz__step').nth(i).click();
    await p.waitForTimeout(160);
    const r = await p.evaluate(([id, si]) => {
      const el = document.querySelector(`[data-viz="${id}"]`);
      const svg = el.querySelector('svg');
      const vb = svg.viewBox.baseVal;
      const out = [];
      svg.querySelectorAll('text').forEach(t => {
        let bb; try { bb = t.getBBox(); } catch (e) { return; }
        if (bb.width === 0 && !t.textContent) return;
        const anc = t.getAttribute('text-anchor') || 'start';
        const x = parseFloat(t.getAttribute('x') || 0);
        const x0 = anc === 'middle' ? x - bb.width / 2 : anc === 'end' ? x - bb.width : x;
        const x1 = x0 + bb.width;
        if (x0 < -2 || x1 > vb.width + 2 || bb.y + bb.height > vb.height + 2 || bb.y < -2) {
          out.push({ txt: t.textContent.slice(0, 46), x0: Math.round(x0), x1: Math.round(x1), y: Math.round(bb.y), h: Math.round(bb.height) });
        }
      });
      return { id, step: si + 1, vbW: vb.width, vbH: vb.height, over: out };
    }, [id, i]);
    if(r.over.length) report.push(r);
  }
}
if(!report.length) console.log('✅ 无文字越界');
else report.forEach(r=>{
  console.log(`\n❌ ${r.id} step${r.step} (vb ${r.vbW}x${r.vbH}) — ${r.over.length} 处越界`);
  r.over.forEach(o=>console.log(`   "${o.txt}"  x:[${o.x0},${o.x1}] y:${o.y}`));
});
await b.close();
