import path from 'node:path';
import { pathToFileURL } from 'node:url';
const m = await import(pathToFileURL('/Users/yihang/.workbuddy/binaries/node/workspace/node_modules/playwright-core/index.js').href);
const chromium = m.chromium || (m.default||{}).chromium;
const ROOT='/Users/yihang/WorkBuddy/2026-10-05-10-45-15/java-od-guide';
const OUT=path.join(ROOT,'.shots');
const b=await chromium.launch({executablePath:'/Users/yihang/Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium',headless:true,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1.4,locale:'zh-CN'});
const F=[];
const WIDTHS=[1600,1440,1280,1180,1080,980,900,820,768,600,414,390,360];
for(const w of WIDTHS){
  const p=await ctx.newPage();
  p.on('pageerror',e=>F.push(w+'px: '+e.message));
  await p.setViewportSize({width:w,height:900});
  await p.goto('file://'+path.join(ROOT,'index.html'),{waitUntil:'load'});
  await p.waitForTimeout(700);
  const r=await p.evaluate(()=>{
    const mh=document.querySelector('.masthead');
    const vis=[...mh.querySelectorAll('.masthead__brand,.masthead__now,.searchbox,.prog,.iconbtn')]
      .filter(e=>e.offsetParent!==null)
      .map(e=>({c:e.className.split(' ')[0], l:Math.round(e.getBoundingClientRect().left), r:Math.round(e.getBoundingClientRect().right), clip:e.scrollWidth>e.clientWidth+1}));
    const gapBad=[];
    const s=vis.slice().sort((a,b)=>a.l-b.l);
    for(let i=1;i<s.length;i++) if(s[i].l < s[i-1].r-1) gapBad.push(s[i-1].c+'|'+s[i].c);
    // 注意：父级 display:none 时子元素自身 computed display 仍是 block，
    // 所以要用 offsetParent === null 判断整块是否真的可见
    const nt=document.querySelector('.masthead__now');
    const pg=document.querySelector('.prog');
    return {
      barOvf: mh.scrollWidth>mh.clientWidth+1,
      clip: vis.filter(v=>v.clip).map(v=>v.c),
      gapBad,
      docOvf: document.documentElement.scrollWidth>document.documentElement.clientWidth+2,
      nowVisible: !!nt && getComputedStyle(nt).display!=='none',
      progVisible: !!pg && getComputedStyle(pg).display!=='none'
    };
  });
  const bad = r.barOvf||r.clip.length||r.gapBad.length||r.docOvf;
  const detail = JSON.stringify(r);
  if(bad) F.push(w+'px: '+detail);
  console.log(String(w).padStart(4)+'px  bar='+(r.barOvf?'OVF':'ok')+'  clip['+r.clip+']  overlap['+r.gapBad+']  doc='+(r.docOvf?'OVF':'ok')+'  now='+(r.nowVisible?'y':'n')+'  prog='+(r.progVisible?'y':'n'));
  if([1600,1180,980,820,390].includes(w)) await p.screenshot({path:path.join(OUT,'B-'+w+'.png'),clip:{x:0,y:0,width:Math.min(w,1600),height:120}});
  await p.close();
}
console.log('\nFAILURES ('+F.length+')');
F.forEach(f=>console.log(' x',f));
await b.close();
process.exit(F.length?1:0);
