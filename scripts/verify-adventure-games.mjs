import {connectBrowser} from './browser-cdp.mjs';
import {BASKET_MISSIONS,ODD_MISSIONS,TRAIN_MISSIONS} from '../src/lib/englishAdventureGames.ts';
import {writeFile} from 'node:fs/promises';
const b=await connectBrowser(1280,900),checks=[];
const assert=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);console.log('PASS',label)};
const click=async(selector,times=1)=>b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Unavailable button: '+${JSON.stringify(selector)});for(let i=0;i<${times};i++)e.click();return true})()`);
const doc=key=>b.evaluate(`fetch('/api/device/documents/'+${JSON.stringify(key)}).then(r=>r.json())`);
const selectAge=age=>b.evaluate(`(()=>{const e=document.querySelector('.adventure-games select');e.value=${JSON.stringify(age)};e.dispatchEvent(new Event('change',{bubbles:true}));return true})()`);
const dismissBadge=()=>b.evaluate(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('Tiếp tục học vui vẻ'));e?.click();return true})()`);
const savedRun=(key,previous)=>b.waitFor(`fetch('/api/device/documents/english-garden-progress').then(r=>r.json()).then(d=>d.value?.[${JSON.stringify(key)}]?.runs===${previous+1})`);
async function enter(){await b.waitFor(`[...document.querySelectorAll('button')].some(e=>e.textContent.includes('Bắt đầu học thôi')&&!e.disabled)`);await b.click('Bắt đầu học thôi');await b.evaluate(`(()=>{[...document.querySelectorAll('button')].find(e=>e.textContent.includes('Để lúc khác'))?.click();return true})()`);await b.click('Tiếng Anh');await b.click('Trò chơi Tiếng Anh');await b.waitFor(`document.querySelector('.ag-entry-card--basket:not(:disabled)')`);}
async function finishNext(){await b.waitFor(`document.querySelector('.ag-next')`);await click('.ag-next',2);}
try{
 await b.send('Page.navigate',{url:process.env.AUDIT_BASE_URL||'http://127.0.0.1:3008'});await enter();
 const initialStars=(await doc('game-stars')).value||0,progress=(await doc('english-garden-progress')).value||{},englishBefore=(await doc('learning-stats')).value.englishCount;
 assert(await b.evaluate(`document.querySelectorAll('.gg-entry-card').length===6`),'six garden game entries coexist with original games');
 await b.screenshot('docs/verification/adventure-menu-desktop.png');
 await b.click('Giỏ hàng của bé');await selectAge('5-6');await b.click('Bắt đầu chơi');
 let rounds=0;
 while(!await b.evaluate(`!!document.querySelector('.adventure-games .gg-result')`)){
  const request=await b.evaluate(`document.querySelector('.ag-request').textContent`),mission=BASKET_MISSIONS.find(m=>m.request===request);
  if(!mission)throw Error('Unknown basket request');
  if(rounds===0){const wrong=mission.optionIds.find(id=>!mission.items.some(item=>item.wordId===id));await click(`.ag-basket-option[data-word-id="${wrong}"]`);assert(await b.evaluate(`document.querySelector('.ag-feedback').textContent.includes('chưa có')`),'basket rejects an unrequested item and allows retry');await b.screenshot('docs/verification/adventure-basket-desktop.png');}
  for(let i=0;i<mission.items.length;i++){
   const item=mission.items[i];await click(`.ag-basket-option[data-word-id="${item.wordId}"]`,item.quantity+2);
   const full=await b.evaluate(`[...document.querySelectorAll('.ag-quantity')].map(e=>e.textContent)`);
   assert(full[i].includes(`${item.quantity}/${item.quantity}`),'basket rapid taps cannot overfill requested quantity');
   if(rounds===0&&i===0)assert((await doc('game-stars')).value===initialStars,'partial shopping task earns no stars');
  }
  await finishNext();rounds++;
 }
 assert(rounds===6,'basket completes six unique missions');await savedRun('basket:all:5-6',progress['basket:all:5-6']?.runs||0);await dismissBadge();
 const basketSummary=(await doc('english-garden-progress')).value['basket:all:5-6'];assert(basketSummary.bestAccuracy>80,'basket accuracy counts correct item actions rather than mission ratio');
 assert((await doc('game-stars')).value===initialStars+5,'basket rewards once despite rapid Next');
 await b.click('Về trò chơi tiếng Anh');assert(await b.evaluate(`document.activeElement?.classList.contains('ag-entry-card--basket')`),'Back restores focus to new entry card');
 await b.click('Tìm bạn khác nhóm');await b.click('Bắt đầu chơi');rounds=0;
 while(!await b.evaluate(`!!document.querySelector('.adventure-games .gg-result')`)){
  const category=await b.evaluate(`document.querySelector('.ag-category').textContent.replace('Nhóm: ','')`),mission=ODD_MISSIONS.find(m=>m.age==='3-4'&&m.categoryVi===category);
  if(!mission)throw Error('Unknown category');
  if(rounds===0){await click(`.ag-odd-option[data-word-id="${mission.optionIds.find(id=>id!==mission.outlierId)}"]`);assert(await b.evaluate(`document.querySelector('.ag-feedback').textContent.includes('vẫn thuộc nhóm')`),'odd-group explains an incorrect choice');await b.screenshot('docs/verification/adventure-odd-desktop.png');}
  await click(`.ag-odd-option[data-word-id="${mission.outlierId}"]`,2);await finishNext();rounds++;
 }
 await savedRun('odd:all:3-4',progress['odd:all:3-4']?.runs||0);await dismissBadge();assert(rounds===6,'odd-group completes six missions');
 await b.click('Về trò chơi tiếng Anh');await b.click('Đoàn tàu câu ngắn');await selectAge('5-6');
 await b.evaluate(`window.__adventureRandom=Math.random;Math.random=()=>0.999999;void 0`);await b.click('Bắt đầu chơi');await b.evaluate(`Math.random=window.__adventureRandom;void 0`);
 rounds=0;let repeated=false;
 while(!await b.evaluate(`!!document.querySelector('.adventure-games .gg-result')`)){
  const translation=await b.evaluate(`document.querySelector('.ag-translation').textContent`),mission=TRAIN_MISSIONS.find(m=>m.vietnamese===translation);
  if(!mission)throw Error('Unknown sentence');
  if(new Set(mission.tokens).size<mission.tokens.length)repeated=true;
  if(rounds===0){for(let i=mission.tokens.length-1;i>=0;i--)await click(`.ag-train-word[data-choice-id="token-${i}"]`);await b.click('Kiểm tra');assert(await b.evaluate(`document.querySelector('.ag-feedback').textContent.includes('chưa đúng thứ tự')`),'train wrong order retains sentence and allows reset');await b.click('Xếp lại');assert(await b.evaluate(`document.activeElement?.classList.contains('ag-train-word')&&!document.activeElement.disabled`),'train reset restores usable keyboard focus');}
  for(let i=0;i<mission.tokens.length;i++)await click(`.ag-train-word[data-choice-id="token-${i}"]`,2);
  assert(await b.evaluate(`document.querySelectorAll('.ag-slot.is-filled').length===${mission.tokens.length}`),'train indexed tokens fill exactly one carriage each');
  await b.click('Kiểm tra');await b.waitFor(`document.querySelector('.ag-next')`);
  if(rounds===0){await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await b.screenshot('docs/verification/adventure-train-mobile.png');assert(await b.evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'mobile train does not overflow horizontally');assert(await b.evaluate(`[...document.querySelectorAll('.adventure-games button:not(:disabled)')].every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44})`),'new game controls meet 44px touch targets');}
  await finishNext();rounds++;
 }
 await savedRun('train:all:5-6',progress['train:all:5-6']?.runs||0);await dismissBadge();assert(rounds===6&&repeated,'six train sentences include independently usable repeated words');
 assert((await doc('game-stars')).value===initialStars+15,'three new games award exactly fifteen stars');assert((await doc('learning-stats')).value.englishCount===englishBefore+3,'new completions update canonical English activities');
 await b.click('Chơi lượt mới');assert(await b.evaluate(`!!document.querySelector('.ag-train-word')`),'replay creates a playable new train run');await b.click('Về trò chơi tiếng Anh');assert((await doc('game-stars')).value===initialStars+15,'abandoning a replay awards nothing');
 await b.send('Page.reload');await enter();assert((await doc('game-stars')).value===initialStars+15,'new game stars survive reload');
 await b.click('Giỏ hàng của bé');await b.click('Bắt đầu chơi');await b.evaluate(`window.__adventureSpeechDescriptor=Object.getOwnPropertyDescriptor(window,'speechSynthesis');Object.defineProperty(window,'speechSynthesis',{configurable:true,value:undefined});void 0`);await b.click('Nghe danh sách');await b.waitFor(`document.querySelector('.gg-audio-error')`);assert(await b.evaluate(`!!document.querySelector('.ag-basket-option:not(:disabled)')`),'unavailable audio gives recoverable feedback and leaves game playable');await b.evaluate(`if(window.__adventureSpeechDescriptor)Object.defineProperty(window,'speechSynthesis',window.__adventureSpeechDescriptor);else delete window.speechSynthesis;void 0`);
 assert(b.errors.length===0,'no browser runtime exceptions');await writeFile('docs/verification/adventure-games-browser.json',JSON.stringify({passed:true,checks,consoleErrors:b.errors},null,2));
}finally{b.close()}
