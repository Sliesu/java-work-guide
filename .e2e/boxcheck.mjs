import path from 'node:path';
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL('/Users/yihang/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js').href);
const chromium = m.chromium || (m.default||{}).chromium;
const ROOT='/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const b=await chromium.launch({executablePath:'/Users/yihang/Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',headless:true,args:['--no-sandbox']});
const p=await (await b.newContext({viewport:{width:1440,height:1000}})).newPage();
await p.goto('file://'+path.join(ROOT,'index.html'),{waitUntil:'load'});
await p.waitForTimeout(800);
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(1800);
const ids=await p.$$eval('[data-viz]',e=>e.map(x=>x.dataset.viz));
for(const id of ids){
  const box=p.locator(`[data-viz="${id}"]`).first();
  const n=await box.locator('.viz__step').count();
  for(let i=0;i<n;i++){
    await box.locator('.viz__step').nth(i).click();
    await p.waitForTimeout(140);
    const r=await p.evaluate(([id,si])=>{
      const el=document.querySelector(`[data-viz="${id}"]`);
      const svg=el.querySelector('svg');
      const rects=[...svg.querySelectorAll('rect')].map(r=>({
        x:+r.getAttribute('x'),y:+r.getAttribute('y'),
        w:+r.getAttribute('width'),h:+r.getAttribute('height')
      })).filter(r=>r.w>90&&r.h>26);   // 只看"容器型"方框
      const bad=[];
      svg.querySelectorAll('text').forEach(t=>{
        const bb=t.getBBox();
        if(bb.width===0)return;
        const tx=+t.getAttribute('x'), ty=+t.getAttribute('y');
        const anc=t.getAttribute('text-anchor')||'start';
        const x0=anc==='middle'?tx-bb.width/2:anc==='end'?tx-bb.width:tx;
        const x1=x0+bb.width;
        // 找所有"包含文字起点且垂直居中"的框
        rects.forEach(r=>{
          const insideX = x0 >= r.x-1 && x0 <= r.x+r.w;
          const insideY = bb.y >= r.y-1 && bb.y+bb.height <= r.y+r.h+1;
          if(insideX && insideY && x1 > r.x+r.w+2){
            bad.push({txt:t.textContent.slice(0,40), over:Math.round(x1-(r.x+r.w)), boxW:r.w, boxX:r.x, boxY:r.y});
          }
        });
      });
      // 去重
      const seen=new Set();
      return {id, step:si+1, bad:bad.filter(x=>{const k=x.txt+x.boxX+x.boxY;if(seen.has(k))return false;seen.add(k);return true;})};
    },[id,i]);
    if(r.bad.length){
      console.log(`\n❌ ${r.id} step${r.step}`);
      r.bad.forEach(x=>console.log(`   "${x.txt}" 超出 ${x.over}px (框 x=${x.boxX} w=${x.boxW})`));
    }
  }
}
console.log('\n检查完成');
await b.close();
