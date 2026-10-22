import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function connectBrowser(width = 1280, height = 900) {
  const pages = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const page = pages.find(p => p.type === 'page');
  if (!page) throw new Error('No Chrome page is available');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (request) { clearTimeout(request.timer); pending.delete(message.id); message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result); }
    } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timed out: ${method}`)); }, 15000);
    pending.set(requestId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async expression => {
    const start = Date.now();
    while (Date.now() - start < 12000) {
      if (await evaluate(`(async () => Boolean(await (${expression})))()`)) return;
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    throw new Error(`Condition not met: ${expression}`);
  };
  const click = async text => {
    await waitFor(`[...document.querySelectorAll('button')].some(e => !e.disabled && (e.getAttribute('aria-label') === ${JSON.stringify(text)} || e.textContent.trim().includes(${JSON.stringify(text)})))`);
    await waitFor(`(() => { const buttons=[...document.querySelectorAll('button')].filter(e=>!e.disabled); const el=buttons.find(e=>e.getAttribute('aria-label')===${JSON.stringify(text)}) ?? buttons.find(e=>e.textContent.trim()===${JSON.stringify(text)}) ?? buttons.find(e=>e.textContent.trim().includes(${JSON.stringify(text)})); if(!el) return false; el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}); const r=el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)); })()`);
    const position = await evaluate(`(() => { const buttons = [...document.querySelectorAll('button')].filter(e => !e.disabled); const el = buttons.find(e => e.getAttribute('aria-label') === ${JSON.stringify(text)}) ?? buttons.find(e => e.textContent.trim() === ${JSON.stringify(text)}) ?? buttons.find(e => e.textContent.trim().includes(${JSON.stringify(text)})); if(!el) return null; el.scrollIntoView({block:'center',inline:'center',behavior:'instant'}); const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()`);
    if (!position) throw new Error(`Button missing: ${text}`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...position });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...position });
    await new Promise(resolve => setTimeout(resolve, 380));
  };
  const screenshot = async path => {
    await mkdir(dirname(path), { recursive: true });
    const data = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(path, Buffer.from(data.data, 'base64'));
  };
  return { send, evaluate, waitFor, click, screenshot, errors, close: () => ws.close() };
}
