import { connectBrowser } from './browser-cdp.mjs';
import { writeFile } from 'node:fs/promises';
const b=await connectBrowser(1280,900);
const base=process.env.AUDIT_BASE_URL || 'https://khuvuontrithuc.vercel.app/';
try {
  await b.send('Network.enable');
  await b.send('Network.setCacheDisabled',{cacheDisabled:true});
  await b.send('Page.navigate',{url:base});
  await b.click('Bắt đầu học thôi');
  await b.click('Để lúc khác');
  await b.waitFor("document.querySelectorAll('img').length>=7");
  await b.evaluate("Promise.all([...document.images].map(img=>img.decode().catch(()=>{})))");
  const images=await b.evaluate("[...document.images].map(img=>({src:img.currentSrc||img.src,alt:img.alt,width:img.naturalWidth,height:img.naturalHeight}))");
  const broken=images.filter(img=>!img.width||!img.height);
  console.log(JSON.stringify({base,total:images.length,broken},null,2));
  if(broken.length)throw Error(`${broken.length} home/card images failed to decode`);
  const responses=await b.evaluate("Promise.all([...new Set([...document.images].map(img=>img.currentSrc||img.src))].map(async url=>{const r=await fetch(url);return{url,status:r.status,type:r.headers.get('content-type')};}))");
  if(responses.some(r=>r.status!==200||!r.type?.startsWith('image/')))throw Error('An image URL returned a non-image response');
  const extra=await b.evaluate("Promise.all(['/assets/preschool/art_english.png','/assets/preschool/art_teacher.png'].map(async path=>{const img=new Image();img.src=path;await img.decode();return{path,width:img.naturalWidth,height:img.naturalHeight};}))");
  if(extra.some(img=>!img.width||!img.height))throw Error('English or teacher artwork failed to decode');
  await b.screenshot('docs/verification/card-images-desktop.png');
  await b.evaluate("document.querySelector('img[alt^=\"Phát triển thể chất\"]').scrollIntoView({block:'center',behavior:'instant'})");
  await b.screenshot('docs/verification/card-thumbnails-desktop.png');
  await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await b.waitFor("[...document.images].every(img=>img.complete&&img.naturalWidth>0)");
  await b.screenshot('docs/verification/card-images-mobile.png');
  await writeFile('docs/verification/card-images.json',JSON.stringify({base,images,responses,extra,mobilePassed:true},null,2));
  console.log('PASS all home/card images decode and return image content on desktop and mobile');
}finally{await b.send('Network.setCacheDisabled',{cacheDisabled:false});b.close();}
