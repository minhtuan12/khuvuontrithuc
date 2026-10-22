import { connectBrowser } from './browser-cdp.mjs';
import { writeFile } from 'node:fs/promises';
const b = await connectBrowser(1280, 900);
try {
  await b.click('Tổng quan');
  await b.evaluate('window.scrollTo(0,0)');
  await b.screenshot('docs/previews/parent-desktop.png');
  await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await b.evaluate('window.scrollTo(0,0)');
  await b.screenshot('docs/previews/parent-mobile.png');
  await b.click('Cảm xúc');
  await b.click('Ghi lại cảm xúc mới');
  await b.send('Page.bringToFront');
  for (let i=0; i<9; i++) {
    await b.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
    if (!await b.evaluate("Boolean(document.activeElement.closest('dialog[open]'))")) throw new Error('Focus escaped the modal');
  }
  await b.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  if (!await b.evaluate("getComputedStyle(document.querySelector('.emotion-choice')).transitionDuration === '0s'")) throw new Error('Reduced motion rule failed');
  await b.screenshot('docs/previews/emotion-checkin-mobile.png');
  await writeFile('docs/verification/keyboard-results.json', JSON.stringify({ results: ['Tab remains within check-in for nine focus moves', 'check-in respects reduced-motion preference'], errors: b.errors }, null, 2));
  console.log('PASS modal keyboard containment and reduced-motion preference');
  await b.click('Để lúc khác');
} finally { b.close(); }
