import path from 'node:path';
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL('/Users/yihang/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js').href);
const chromium = m.chromium || (m.default||{}).chromium;
const ROOT='/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const OUT=path.join(ROOT,'.shots');
const b=await chromium.launch({executablePath:'/Users/yihang/Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',headless:true,args:['--no-sandbox']});
const mob=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'zh-CN'})).newPage();
const errs=[]; mob.on('pageerror',e=>errs.push(e.message));
await mob.goto('file://'+path.join(ROOT,'index.html'),{waitUntil:'load'});
await mob.waitForTimeout(1000);
await mob.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await mob.waitForTimeout(2200);
// 检查每个 svg 的渲染尺寸
const sizes=await mob.$$eval('[data-viz] svg',els=>els.map(s=>{
  const r=s.getBoundingClientRect(); const vb=s.viewBox.baseVal;
  const vw=vb.width|| (+s.getAttribute('width')||900); const vh=vb.height||(+s.getAttribute('height')||400);
  return {id:s.closest('[data-viz]').dataset.viz, w:Math.round(r.width), h:Math.round(r.height), want:Math.round(vw/vh*r.width), vbH:vh};
}));
sizes.forEach(s=>{
  const okk = Math.abs(s.h - s.want) <= 4;
  console.log((okk?'✅':'❌'), s.id, `rendered ${s.w}x${s.h}, 期望高 ${s.want} (vb ${s.vbH})`);
});
const ovf=await mob.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
console.log('横向溢出:', ovf.sw, '>', ovf.cw, ovf.sw<=ovf.cw+2?'✅':'❌');
const box=mob.locator('[data-viz="hashmap"]').first();
await box.evaluate(e=>e.scrollIntoView({block:'center'}));
await mob.waitForTimeout(400);
await box.locator('.viz__step').nth(1).click();
await mob.waitForTimeout(300);
await mob.screenshot({path:path.join(OUT,'M2-viz.png')});
console.log('errors:',errs.length?errs:'none');
await b.close();
