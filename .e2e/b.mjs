import path from 'node:path';
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL('/Users/yihang/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js').href);
const chromium = m.chromium || (m.default||{}).chromium;
const ROOT='/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const OUT=path.join(ROOT,'.shots');
const b=await chromium.launch({executablePath:'/Users/yihang/Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',headless:true,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1440,height:600},deviceScaleFactor:3,locale:'zh-CN'});
const p=await ctx.newPage();
await p.goto('file://'+path.join(ROOT,'index.html'),{waitUntil:'load'});
await p.waitForTimeout(900);
await p.locator('.masthead__brand').first().screenshot({path:path.join(OUT,'M1.png')});
await p.screenshot({path:path.join(OUT,'M2-bar.png'),clip:{x:0,y:0,width:1440,height:54}});
// 暗色
await p.click('#themeBtn'); await p.waitForTimeout(500);
await p.locator('.masthead__brand').first().screenshot({path:path.join(OUT,'M3-night.png')});
await p.click('#themeBtn'); await p.waitForTimeout(400);
// favicon 放大预览
await p.setViewportSize({width:390,height:300});
await p.waitForTimeout(300);
await p.locator('.masthead__brand').first().screenshot({path:path.join(OUT,'M4-mob.png')});
console.log('done');
await b.close();
