import {connectBrowser} from './browser-cdp.mjs';
import {GARDEN_WORDS} from '../src/lib/englishGardenGames.ts';
import {writeFile} from 'node:fs/promises';
const b=await connectBrowser(1280,900),checks=[];
const assert=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);console.log('PASS',label)};
const click=async selector=>b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable button');e.click();return true})()`);
const doc=key=>b.evaluate(`fetch('/api/device/documents/'+${JSON.stringify(key)}).then(r=>r.json())`);
const select=async (suffix,value)=>b.evaluate(`(()=>{const e=document.querySelector('.gg-setup select[id$="-${suffix}"]');e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
const wordFor=emoji=>GARDEN_WORDS.find(word=>word.emoji===emoji);
const savedRun=async(key,previous)=>b.waitFor(`fetch('/api/device/documents/english-garden-progress').then(r=>r.json()).then(d=>d.value?.[${JSON.stringify(key)}]?.runs===${previous+1})`);
const dismissBadge=()=>b.evaluate(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('Tiếp tục học vui vẻ'));e?.click();return true})()`);
async function enter(){await b.waitFor(`[...document.querySelectorAll('button')].some(e=>e.textContent.includes('Bắt đầu học thôi')&&!e.disabled)`);await b.click('Bắt đầu học thôi');await b.evaluate(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('Để lúc khác'));e?.click();return true})()`);await b.click('Tiếng Anh');await b.click('Trò chơi Tiếng Anh');await b.waitFor(`document.querySelector('.gg-entry-card:not(:disabled)')`);}
try{
 await b.send('Page.navigate',{url:process.env.AUDIT_BASE_URL||'http://127.0.0.1:3007'});await enter();
 const initialStars=(await doc('game-stars')).value||0;
 const initialProgress=(await doc('english-garden-progress')).value||{};
 const initialCount=(await doc('learning-stats')).value.englishCount;
 await b.screenshot('docs/verification/garden-games-menu-desktop.png');
 await b.click('Nối hình với từ');await b.click('Bắt đầu chơi');
 await b.waitFor(`document.querySelector('.gg-picture')`);
 await b.screenshot('docs/verification/garden-match-desktop.png');
 assert(await b.evaluate(`!window.speechSynthesis?.speaking`),'games do not automatically narrate');
 const pictures=await b.evaluate(`[...document.querySelectorAll('.gg-picture')].map(e=>e.getAttribute('aria-label').replace('Chọn hình ',''))`);
 for(let i=0;i<pictures.length;i++){
  const word=GARDEN_WORDS.find(w=>w.meaning===pictures[i]);
  await b.evaluate(`document.querySelectorAll('.gg-picture')[${i}].click();void 0`);
  if(i===0){await b.evaluate(`(()=>{const e=[...document.querySelectorAll('.gg-word')].find(e=>e.textContent!==${JSON.stringify(word.word)});e.click();return true})()`);assert(await b.evaluate(`document.querySelector('.gg-status').textContent.includes('chưa cùng cặp')`),'match wrong answer keeps board available');}
  await b.evaluate(`(()=>{const e=[...document.querySelectorAll('.gg-word')].find(e=>e.textContent===${JSON.stringify(word.word)});e.click();e.click();return true})()`);
 }
 await b.waitFor(`document.querySelector('.gg-result')`);await savedRun('match:all:3-4',initialProgress['match:all:3-4']?.runs||0);
 assert((await doc('game-stars')).value===initialStars+5,'match awards once despite rapid repeat click');
 await dismissBadge();
 await b.click('Về trò chơi tiếng Anh');assert(await b.evaluate(`document.activeElement?.classList.contains('gg-entry-card--match')`),'back restores keyboard focus to matching entry card');await b.click('Bức tranh bí mật');await select('topic','family');await b.click('Bắt đầu chơi');
 let revealRounds=0;
 while(!await b.evaluate(`!!document.querySelector('.gg-result')`)){
  const emoji=await b.evaluate(`document.querySelector('.gg-secret-picture').textContent`),target=wordFor(emoji);
  assert(await b.evaluate(`!!document.querySelector('.gg-clue')?.textContent`),'reveal has relationship clue');
  await click('.gg-secret-tiles button:not(:disabled)');
  if(revealRounds===0){await b.screenshot('docs/verification/garden-reveal-desktop.png');await b.evaluate(`(()=>{const e=[...document.querySelectorAll('.gg-answers button')].find(e=>e.textContent!==${JSON.stringify(target.word)});e.click();return true})()`);assert(await b.evaluate(`document.querySelector('.gg-status').textContent.includes('Chưa đúng')`),'reveal wrong answer can retry');}
  await b.evaluate(`(()=>{const e=[...document.querySelectorAll('.gg-answers button')].find(e=>e.textContent===${JSON.stringify(target.word)});e.click();e.click();return true})()`);
  await click('.gg-word-learned button');revealRounds++;
 }
 await savedRun('reveal:family:3-4',initialProgress['reveal:family:3-4']?.runs||0);assert(revealRounds===4,'small topic caps rounds to unique available vocabulary');
 await dismissBadge();
 await b.click('Về trò chơi tiếng Anh');await b.click('Ong chăm chỉ đánh vần');await select('age','5-6');await select('topic','fruit');
 await b.evaluate(`window.__gardenRandom=Math.random;Math.random=()=>0;void 0`);await b.click('Bắt đầu chơi');await b.evaluate(`Math.random=window.__gardenRandom;void 0`);
 let beeRounds=0,sawRepeated=false;
 while(!await b.evaluate(`!!document.querySelector('.gg-result')`)){
  const emoji=await b.evaluate(`document.querySelector('.gg-bee-picture [role=img]').textContent`),target=wordFor(emoji);
  const slots=await b.evaluate(`[...document.querySelectorAll('.gg-honey-slot')].map(e=>e.classList.contains('gg-honey-slot--blank'))`);
  const missing=slots.flatMap((hidden,i)=>hidden?[target.word.toUpperCase()[i]]:[]);
  if(new Set(missing).size<missing.length)sawRepeated=true;
  if(beeRounds===0){const wrong=await b.evaluate(`[...document.querySelectorAll('.gg-letter-bank button')].map(e=>e.textContent)`);const decoy=wrong.find(c=>!missing.includes(c));await b.evaluate(`(()=>{const e=[...document.querySelectorAll('.gg-letter-bank button')].find(e=>e.textContent===${JSON.stringify(decoy)});e.click();return true})()`);for(let i=1;i<missing.length;i++)await click('.gg-letter-bank button:not(:disabled)');await b.click('Kiểm tra');assert(await b.evaluate(`document.querySelector('.gg-status').textContent.includes('chưa đúng')`),'bee wrong spelling gives retry');await b.click('Ghép lại');}
  for(const letter of missing)await b.evaluate(`(()=>{const e=[...document.querySelectorAll('.gg-letter-bank button')].find(e=>!e.disabled&&e.textContent===${JSON.stringify(letter)});if(!e)throw Error('Missing letter');e.click();return true})()`);
  await b.click('Kiểm tra');await b.waitFor(`document.querySelector('.gg-word-learned')`);
  if(beeRounds===0){await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await b.screenshot('docs/verification/garden-bee-mobile.png');assert(await b.evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'mobile has no horizontal overflow');const small=await b.evaluate(`[...document.querySelectorAll('.gg-game button:not(:disabled)')].filter(e=>{const r=e.getBoundingClientRect();return r.width<44||r.height<44}).map(e=>e.textContent)`);assert(small.length===0,'game touch targets are at least 44px');}
  await click('.gg-word-learned button');beeRounds++;
 }
 assert(sawRepeated&&beeRounds===6,'bee repeated letters work across full six-word round');await savedRun('bee:fruit:5-6',initialProgress['bee:fruit:5-6']?.runs||0);
 assert((await doc('game-stars')).value===initialStars+15,'three game completions award fifteen playground stars');
 assert((await doc('learning-stats')).value.englishCount===initialCount+3,'completed games reach real English learning counters');
 await dismissBadge();
 await b.click('Chơi lượt mới');assert(await b.evaluate(`!!document.querySelector('.gg-play')&&!document.querySelector('.gg-result')`),'replay starts a fresh playable run');
 await b.click('Về trò chơi tiếng Anh');assert((await doc('game-stars')).value===initialStars+15,'abandoned replay does not award');
 await b.send('Page.reload');await enter();assert(await b.evaluate(`document.querySelector('.garden-games-entry')!==null`),'menu survives reload');
 await b.click('Nối hình với từ');await select('topic','family');await b.click('Bắt đầu chơi');
 assert(await b.evaluate(`document.querySelectorAll('.gg-family-label').length===3&&[...document.querySelectorAll('.gg-family-label')].every(e=>e.textContent.trim())`),'family matching shows explicit relationship labels');
 await b.evaluate(`window.__gardenSpeechDescriptor=Object.getOwnPropertyDescriptor(window,'speechSynthesis');Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});void 0`);
 await click('.gg-listen-small');await b.waitFor(`document.querySelector('.gg-audio-error')`);
 assert(await b.evaluate(`!!document.querySelector('.gg-picture:not(:disabled)')`),'unavailable audio shows error without blocking play');
 await b.evaluate(`if(window.__gardenSpeechDescriptor)Object.defineProperty(window,'speechSynthesis',window.__gardenSpeechDescriptor);else delete window.speechSynthesis;void 0`);
 assert((await doc('game-stars')).value===initialStars+15,'earned stars persist after reload');
 assert(b.errors.length===0,'no browser runtime exceptions');
 await writeFile('docs/verification/garden-games-browser.json',JSON.stringify({passed:true,checks,consoleErrors:b.errors},null,2));
}finally{b.close()}
