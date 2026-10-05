import path from 'node:path';
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL('/Users/yihang/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js').href);
const chromium = m.chromium || (m.default||{}).chromium;
const ROOT='/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const OUT=path.join(ROOT,'.shots');
const b=await chromium.launch({executablePath:'/Users/yihang/Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',headless:true,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1440,height:1200},deviceScaleFactor:1.6,locale:'zh-CN'});
const p=await ctx.newPage();
await p.goto('file://'+path.join(ROOT,'index.html'),{waitUntil:'load'});
await p.waitForTimeout(900);
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(1800);
const ids=await p.$$eval('[data-viz]',e=>e.map(x=>x.dataset.viz));
for(const id of ids){
  const box=p.locator(`[data-viz="${id}"]`).first();
  await box.evaluate(e=>e.scrollIntoView({block:'center'}));
  await p.waitForFunction(id => {
    const el = document.querySelector(`[data-viz="${id}"]`);
    return el && el.dataset.mounted === '1' && el.querySelectorAll('.viz__step').length > 0;
  }, id, { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(280);
  // 逐步截图每一步
  const n=await box.locator('.viz__step').count();
  for(let i=0;i<n;i++){
    await box.locator('.viz__step').nth(i).click();
    await p.waitForTimeout(200);
    await box.locator('.viz__stage').screenshot({path:path.join(OUT,`V-${id}-s${i+1}.png`)});
  }
  console.log('done',id,n,'steps');
}
await b.close();
