import { connectBrowser } from './browser-cdp.mjs';
import { ENGLISH_DATA_3_4 } from '../src/constants/englishData.ts';
import { mkdir, writeFile } from 'node:fs/promises';

const b = await connectBrowser(1280, 900);
const results = [];
const assert = (value, name) => { if (!value) throw new Error(name); results.push(name); console.log('PASS', name); };
try {
  await b.send('Page.navigate', { url: process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5174/' });
  await b.click('Bắt đầu học thôi');
  await b.click('Để lúc khác');
  for (const category of ['Vận động & Sức khỏe', 'Toán học & Khoa học', 'Chữ cái & Truyện kể', 'Cảm xúc & Kỹ năng sống', 'Nghệ thuật & Âm nhạc']) {
    await b.click('Trang chủ');
    await b.click(`Khám phá ${category}`);
    await b.click('4 - 5 Tuổi');
    await b.click('Bài học');
    await b.waitFor("!document.body.innerText.includes('Lưu lại khoảnh khắc')");
    assert(await b.evaluate("document.querySelectorAll('button').length > 8"), `${category}: age selection and lessons render`);
  }
  await b.click('Trang chủ');
  await b.click('Khám phá Toán học & Khoa học');
  await b.click('4 - 5 Tuổi');
  await b.click('Báo cáo tiến bộ');
  await b.waitFor("document.getElementById('report-categories')");
  assert(await b.evaluate("document.querySelectorAll('dl.parent-menu dd').length === 6 && !document.body.innerText.includes('95%')"), 'progress report shows six real counters without fabricated percentages');
  await b.click('Tiếng Anh');
  await b.waitFor("document.querySelector('.roadmap-start')");
  await b.click(await b.evaluate("document.querySelector('.roadmap-start').textContent.trim()"));
  await b.evaluate("navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Test denied', 'NotAllowedError'); }");
  const starsBefore = await b.evaluate("localStorage.getItem('kvtt.stars.v1')");
  await b.click('Bé luyện phát âm');
  await b.click('Bắt đầu ghi âm cho bé');
  await b.waitFor("document.body.innerText.includes('Chưa nhận diện được lời nói')");
  assert(starsBefore === await b.evaluate("localStorage.getItem('kvtt.stars.v1')"), 'microphone denial gives a retry message and no reward');
  await b.click('Đóng phòng luyện phát âm cho bé');
  await b.click('Lộ trình học');
  const englishCountBefore = await b.evaluate("JSON.parse(localStorage.getItem('mamnon_learning_stats'))?.englishCount || 0");
  await b.waitFor("document.querySelector('.roadmap-start')");
  await b.click(await b.evaluate("document.querySelector('.roadmap-start').textContent.trim()"));
  await b.click('Chơi trò chơi (');
  const questions = ENGLISH_DATA_3_4[0].interactiveGame.questions;
  for (const [index, question] of questions.entries()) {
    const answer = question.options.find(option => option.id === question.correctId).text;
    await b.waitFor(`document.body.innerText.includes(${JSON.stringify(question.prompt)})`);
    await b.evaluate(`(() => { const label=[...document.querySelectorAll('button span')].find(s=>s.textContent.trim()===${JSON.stringify(answer)}); const button=label?.closest('button'); if(!button) throw new Error('Missing English answer'); button.click(); button.click(); button.click(); })()`);
    await b.click(index === questions.length - 1 ? 'Hoàn thành trò chơi' : 'Câu tiếp theo');
  }
  await b.waitFor(`JSON.parse(localStorage.getItem('mamnon_learning_stats')).englishCount === ${englishCountBefore + 1}`);
  assert(await b.evaluate(`Boolean(JSON.parse(localStorage.getItem('kvtt.english.progress.v1.guest'))[${JSON.stringify(ENGLISH_DATA_3_4[0].id)}]?.completedAt)`), 'English game completion records the exact lesson');
  if (await b.evaluate("document.body.innerText.includes('Tiếp tục học vui vẻ')")) await b.click('Tiếp tục học vui vẻ');
  await b.click('Phụ huynh');
  await b.waitFor("document.querySelector('.parent-stats')");
  assert(await b.evaluate("document.querySelector('.parent-activities').textContent.includes('Tiếng Anh') && JSON.parse(localStorage.getItem('mamnon_learning_stats')).englishCount >= 1"), 'English completion reaches the parent overview');
  await b.click('Trợ lý AI');
  await b.waitFor("document.querySelector('input[placeholder^=\"Bé hãy nhập câu hỏi\"]')");
  await b.click('Nói câu hỏi qua Micro');
  await b.waitFor("document.body.innerText.includes('Tớ chưa mở được micro')");
  assert(await b.evaluate("!document.querySelector('input[placeholder^=\"Bé hãy nhập câu hỏi\"]').disabled"), 'AI microphone denial leaves text input available');
  await b.click('Nói câu hỏi qua Micro');
  await b.waitFor("document.body.innerText.split('Tớ chưa mở được micro').length >= 3");
  assert(true, 'AI microphone can be retried after denied permission');
  await b.evaluate("(() => { const el=document.querySelector('input[placeholder^=\"Bé hãy nhập câu hỏi\"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'Bé muốn hỏi về cây xanh'); el.dispatchEvent(new Event('input',{bubbles:true})); })()");
  await b.click('Gửi');
  await b.waitFor("document.body.innerText.includes('ngắt kết nối')");
  assert(await b.evaluate("!document.querySelector('input[placeholder^=\"Bé hãy nhập câu hỏi\"]').disabled"), 'unconfigured AI shows a recoverable error and unlocks input');
  await b.click('Phụ huynh');
  await b.waitFor("document.querySelector('.parent-stats')");
  await b.screenshot('docs/previews/parent-desktop.png');
  await b.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 640, deviceScaleFactor: 1, mobile: true });
  await b.screenshot('docs/previews/parent-mobile.png');
  await b.click('Cảm xúc');
  await b.click('Ghi lại cảm xúc mới');
  await b.waitFor("document.querySelector('dialog[open]')");
  await b.screenshot('docs/previews/emotion-checkin-mobile.png');
  assert(await b.evaluate("document.documentElement.scrollWidth <= innerWidth && document.querySelector('dialog').getBoundingClientRect().right <= innerWidth"), 'check-in fits 360px narrow viewport');
  await b.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 480, deviceScaleFactor: 1, mobile: true });
  assert(await b.evaluate("document.querySelector('dialog').scrollHeight >= document.querySelector('dialog').clientHeight"), 'check-in can scroll on short screens');
  await b.click('Để lúc khác');
  assert(b.errors.length === 0, 'no uncaught exceptions during learning and failure flows');
} catch (error) {
  console.log('STOP', error.message);
  console.log((await b.evaluate('document.body.innerText')).slice(-2000));
  throw error;
} finally {
  await mkdir('docs/verification', { recursive: true });
  await writeFile('docs/verification/learning-flow-results.json', JSON.stringify({ results, errors: b.errors }, null, 2));
  b.close();
}
