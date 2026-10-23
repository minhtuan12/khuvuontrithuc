import assert from 'node:assert/strict';
import {connectBrowser} from './browser-cdp.mjs';

const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:5186';
const browser=await connectBrowser(390,844);
const setField=async(name,value)=>browser.evaluate(`(()=>{const element=document.querySelector('[name=${JSON.stringify(name)}], [id$="-${name}"]');if(!element)return false;const setter=Object.getOwnPropertyDescriptor(${name==='gender'||name==='role'?'HTMLSelectElement':'HTMLInputElement'}.prototype,'value').set;setter.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event('change',{bubbles:true}));element.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
try{
 await browser.send('Network.enable');await browser.send('Network.clearBrowserCookies');
 await browser.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__mediaPlayCount=0;Object.defineProperty(HTMLMediaElement.prototype,'play',{configurable:true,value:function(){window.__mediaPlayCount++;return Promise.resolve();}});`});
 await browser.send('Page.navigate',{url:base});
 await browser.click('Bắt đầu học thôi');
 assert.equal(await browser.evaluate('window.__mediaPlayCount'),0,'Start does not play automatic welcome audio');
 await browser.click('Để lúc khác');
 await browser.click('Đăng nhập hoặc đăng ký');
 await browser.evaluate("[...document.querySelectorAll('.account-modes button')].find(button=>button.textContent.includes('Tạo tài khoản')).click()");
 const username=`teacher.${Date.now().toString(36)}`;
 assert.ok(await setField('username',username));assert.ok(await setField('fullName','Cô Kiểm Thử'));assert.ok(await setField('password','teacher-test-password'));assert.ok(await setField('role','teacher'));
 await browser.evaluate("document.querySelector('.account-fields button[type=submit]').click()");
 await new Promise(resolve=>setTimeout(resolve,800));
 if(await browser.evaluate("document.querySelector('.account-modal[open]')!==null"))throw new Error('Registration stayed open: '+await browser.evaluate("document.querySelector('.account-feedback')?.textContent+' | '+[...document.querySelectorAll('.account-field-error')].map(e=>e.textContent).join(' | ')"));
 await browser.waitFor("location.pathname==='/' && document.querySelector('button[aria-label=\"Cô giáo\"]')");
 await browser.click('Cô giáo');
 await browser.waitFor("location.pathname==='/giao-vien' && document.body.textContent.includes('Khu vực cô giáo')");
 for(const label of ['Kho giáo án','Tài khoản học sinh','Hộp thư phụ huynh','Chuẩn bị bài'])assert.ok(await browser.evaluate(`document.body.textContent.includes(${JSON.stringify(label)})`));
 await browser.click('Kho giáo án');
 await browser.waitFor("location.pathname==='/giao-vien/giao-an' && document.body.textContent.includes('Kho giáo án của cô')");
 await browser.send('Page.navigate',{url:base+'/giao-vien/hoc-sinh'});
 await browser.waitFor("location.pathname==='/giao-vien/hoc-sinh' && document.body.textContent.includes('Tiến độ học tập')");
 await browser.screenshot('docs/previews/teacher-portal-mobile.png');
 assert.equal(browser.errors.length,0);
 console.log('PASS silent start, teacher registration, teacher tab, real routes and direct route reload');
}finally{await browser.close();}
