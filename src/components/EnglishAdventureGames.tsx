import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, Flower2, RotateCcw, Volume2 } from 'lucide-react';
import { getAdventureMissions, makeAdventureRun, makeTrainChoices, type BasketMission, type OddMission, type TrainMission } from '../lib/englishAdventureGames';
import { GARDEN_WORDS, shuffle } from '../lib/englishGardenGames';
import { readAssistantMessage, stopAssistantSpeech } from '../lib/assistantSpeech';
import { getLearnerScope } from '../lib/learnerStorage';
import type { GardenCompletion } from '../lib/gardenProgress';
import './english-garden-games.css';
import './english-adventure-games.css';

export type AdventureGame = 'basket' | 'odd' | 'train';
type Age = '3-4' | '4-5' | '5-6';
type Mission = BasketMission | OddMission | TrainMission;
type TrainChoice = { id: string; word: string };
type Run = { missions: Mission[]; options: Record<string, string[]>; trains: Record<string, TrainChoice[]> };
const WORDS = new Map(GARDEN_WORDS.map(word => [word.id, word]));
const INFO = {
  basket: { title: 'Giỏ hàng của bé', english: 'Little Shopping Basket', emoji: '🧺', description: 'Xem danh sách và chọn đủ món cho giỏ hàng nhỏ.' },
  odd: { title: 'Tìm bạn khác nhóm', english: 'Odd One Out', emoji: '🧩', description: 'Nhìn tên nhóm, tìm một bạn thuộc nhóm khác.' },
  train: { title: 'Đoàn tàu câu ngắn', english: 'Sentence Train', emoji: '🚂', description: 'Xếp các toa từ thành một câu tiếng Anh ngắn.' },
};

export function AdventureGameCards({ onSelect, disabled = false }: { onSelect: (game: AdventureGame) => void; disabled?: boolean }) {
  const id = useId();
  return <section className="garden-games adventure-games garden-games-entry" aria-labelledby={`${id}-title`}>
    <div className="gg-entry-heading"><span aria-hidden="true">🧺</span><div><h2 id={`${id}-title`}>Cùng chơi, cùng khám phá</h2><p>Đi chợ nhỏ, tìm nhóm bạn và nối những câu vui.</p></div></div>
    <div className="gg-entry-grid">{(Object.keys(INFO) as AdventureGame[]).map(game => <button key={game} type="button" className={`gg-entry-card ag-entry-card--${game}`} disabled={disabled} onClick={() => onSelect(game)}>
      <span className="gg-entry-emoji" aria-hidden="true">{INFO[game].emoji}</span><strong>{INFO[game].title}</strong><span lang="en">{INFO[game].english}</span><p>{INFO[game].description}</p><span className="gg-entry-action">Cùng chơi <span aria-hidden="true">→</span></span>
    </button>)}</div>
  </section>;
}

export default function EnglishAdventureGames({ game, onBack, onComplete, disabled = false }: {
  game: AdventureGame; onBack: () => void; onComplete: (result: GardenCompletion) => void; disabled?: boolean;
}) {
  const id = useId();
  const [age, setAge] = useState<Age>('3-4');
  const [phase, setPhase] = useState<'setup' | 'play' | 'result'>('setup');
  const [run, setRun] = useState<Run | null>(null);
  const [round, setRound] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [carriages, setCarriages] = useState<TrainChoice[]>([]);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [result, setResult] = useState<GardenCompletion | null>(null);
  const [ownerScope] = useState(getLearnerScope);
  const surface = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const live = useRef(false);
  const activePhase = useRef<'setup' | 'play' | 'result'>('setup');
  const completed = useRef(false);
  const locked = useRef(false);
  const checked = useRef(false);
  const countRef = useRef<Record<string, number>>({});
  const carriageRef = useRef<TrainChoice[]>([]);
  const focusResetTrain = useRef(false);
  const counters = useRef({ correct: 0, attempts: 0 });
  const speechVersion = useRef(0);
  const info = INFO[game];
  const mission = run?.missions[round];
  const basket = game === 'basket' ? mission as BasketMission | undefined : undefined;
  const odd = game === 'odd' ? mission as OddMission | undefined : undefined;
  const train = game === 'train' ? mission as TrainMission | undefined : undefined;
  const currentOwner = () => live.current && getLearnerScope() === ownerScope;

  function stopSpeech() { speechVersion.current += 1; stopAssistantSpeech(); }
  useEffect(() => {
    live.current = true;
    return () => { live.current = false; stopSpeech(); };
  }, []);
  useEffect(() => { heading.current?.focus(); }, [phase, round]);
  useEffect(() => {
    if (solved) surface.current?.querySelector<HTMLButtonElement>('.ag-next')?.focus();
  }, [solved]);
  useEffect(() => {
    if (focusResetTrain.current && !carriages.length && phase === 'play' && !solved) {
      focusResetTrain.current = false;
      surface.current?.querySelector<HTMLButtonElement>('.ag-train-word:not(:disabled)')?.focus();
      return;
    }
    if (!carriages.length || solved || phase !== 'play' || !train) return;
    const selector = carriages.length === train.tokens.length ? '.ag-check' : '.ag-train-word:not(:disabled)';
    surface.current?.querySelector<HTMLButtonElement>(selector)?.focus();
  }, [carriages, solved, phase, train]);
  useEffect(() => {
    if (phase !== 'play' || solved || !Object.keys(counts).length) return;
    surface.current?.querySelector<HTMLButtonElement>('.ag-basket-option:not(:disabled)')?.focus();
  }, [counts, solved, phase]);

  function listen(text: string) {
    if (disabled || !currentOwner()) return;
    stopSpeech(); setSpeechError('');
    const version = speechVersion.current;
    void readAssistantMessage(text, true, 'en-US').catch(() => {
      if (currentOwner() && version === speechVersion.current) setSpeechError('Chưa nghe được tiếng Anh trên thiết bị này. Bé có thể nhìn hình, đọc gợi ý và tiếp tục chơi nhé!');
    });
  }

  function start() {
    if (disabled || !currentOwner() || activePhase.current === 'play') return;
    stopSpeech();
    const missions = makeAdventureRun<Mission>(getAdventureMissions(game, age), 6);
    if (!missions.length) { setFeedback('Chưa có lượt chơi phù hợp. Bé thử chọn độ tuổi khác nhé.'); return; }
    const options: Record<string, string[]> = {};
    const trains: Record<string, TrainChoice[]> = {};
    for (const item of missions) {
      if ('optionIds' in item) options[item.id] = shuffle(item.optionIds);
      if ('tokens' in item) trains[item.id] = makeTrainChoices(item);
    }
    setRun({ missions, options, trains });
    activePhase.current = 'play'; completed.current = false; locked.current = false; checked.current = false;
    countRef.current = {}; carriageRef.current = []; counters.current = { correct: 0, attempts: 0 };
    setCounts({}); setCarriages([]); setRound(0); setSolved(false); setFeedback(''); setSpeechError(''); setResult(null); setPhase('play');
  }

  function solve(message: string, countAnswer = true) {
    if (locked.current) return;
    locked.current = true;
    if (countAnswer) {
      counters.current.correct += 1;
      counters.current.attempts += 1;
    }
    setSolved(true); setFeedback(message);
  }

  function next() {
    if (!run || disabled || !currentOwner() || !locked.current || completed.current) return;
    locked.current = false;
    stopSpeech();
    if (round === run.missions.length - 1) {
      completed.current = true; activePhase.current = 'result';
      const summary: GardenCompletion = { game, topic: 'all', age, ...counters.current, words: run.missions.length };
      setResult(summary); setPhase('result'); setFeedback(''); onComplete(summary);
      return;
    }
    checked.current = false; countRef.current = {}; carriageRef.current = [];
    setRound(value => value + 1); setCounts({}); setCarriages([]); setSolved(false); setFeedback(''); setSpeechError('');
  }

  function chooseBasket(wordId: string) {
    if (!basket || disabled || locked.current || completed.current || !currentOwner()) return;
    const required = basket.items.find(item => item.wordId === wordId)?.quantity || 0;
    const count = countRef.current[wordId] || 0;
    if (required && count >= required) return;
    if (!required) { counters.current.attempts += 1; setFeedback('Món này chưa có trong danh sách. Bé nhìn lại giỏ hàng nhé!'); return; }
    countRef.current = { ...countRef.current, [wordId]: count + 1 };
    counters.current.correct += 1;
    counters.current.attempts += 1;
    setCounts(countRef.current);
    if (basket.items.every(item => (countRef.current[item.wordId] || 0) === item.quantity)) solve('Đủ món rồi! Giỏ hàng của bé đã sẵn sàng.', false);
    else setFeedback('Đúng món rồi! Bé chọn thêm cho đủ danh sách nhé.');
  }

  function chooseOdd(wordId: string) {
    if (!odd || disabled || locked.current || completed.current || !currentOwner()) return;
    if (wordId !== odd.outlierId) { counters.current.attempts += 1; setFeedback(`Bạn này vẫn thuộc nhóm ${odd.categoryVi.toLocaleLowerCase('vi')}. Bé thử chọn bạn khác nhé!`); return; }
    solve(`Đúng rồi! ${odd.explanation}`);
  }

  function chooseTrain(choice: TrainChoice) {
    if (!train || disabled || locked.current || checked.current || completed.current || !currentOwner() || carriageRef.current.length >= train.tokens.length || carriageRef.current.some(item => item.id === choice.id)) return;
    carriageRef.current = [...carriageRef.current, choice];
    setCarriages(carriageRef.current); setFeedback('');
  }

  function resetTrain() {
    if (disabled || locked.current || !currentOwner()) return;
    checked.current = false; carriageRef.current = []; focusResetTrain.current = true; setCarriages([]); setFeedback('Bé chọn lại các toa từ theo thứ tự nhé!');
  }

  function checkTrain() {
    if (!train || disabled || locked.current || checked.current || completed.current || !currentOwner() || carriageRef.current.length !== train.tokens.length) return;
    checked.current = true;
    if (!train.tokens.every((word, index) => carriageRef.current[index].word === word)) { counters.current.attempts += 1; setFeedback('Các toa chưa đúng thứ tự rồi. Bé bấm “Xếp lại” và thử nhé!'); return; }
    solve(`Đoàn tàu đã nối đúng rồi! ${train.vietnamese}`);
  }

  const listenText = basket?.request || (odd ? odd.category : '') || train?.english || '';
  const instruction = game === 'basket' ? 'Nhìn danh sách. Chạm vào từng món để cho vào giỏ.' : game === 'odd' ? 'Ba bạn cùng nhóm. Bé tìm một bạn thuộc nhóm khác nhé!' : 'Chạm từng toa từ theo thứ tự để tạo câu tiếng Anh.';

  return <section className={`garden-games adventure-games gg-game ag-game--${game}`} ref={surface} aria-labelledby={`${id}-title`}>
    <button type="button" className="gg-back" onClick={() => { completed.current = true; stopSpeech(); onBack(); }}><ArrowLeft size={20} aria-hidden="true" /> Về trò chơi tiếng Anh</button>
    <header className="gg-header"><div><span className="gg-eyebrow"><Flower2 size={17} aria-hidden="true" /> CHƠI TRONG VƯỜN TIẾNG ANH</span><h2 id={`${id}-title`} ref={heading} tabIndex={-1}>{phase === 'result' ? 'Thêm một chuyến chơi vui!' : info.title}</h2><p>{phase === 'setup' ? info.description : `${age} tuổi · Cả khu vườn`}</p></div><span className="gg-game-icon" aria-hidden="true">{info.emoji}</span></header>
    {phase === 'setup' && <div className="gg-setup"><div className="gg-setup-art"><img src="/illustrations/garden-story.jpg" alt="Khu vườn học tập với hoa và cây xanh" /></div><div className="gg-setup-form"><h3>Mình cùng khám phá nhé!</h3><label htmlFor={`${id}-age`}>Độ tuổi của bé</label><select id={`${id}-age`} value={age} disabled={disabled} onChange={event => setAge(event.target.value as Age)}><option value="3-4">3–4 tuổi</option><option value="4-5">4–5 tuổi</option><option value="5-6">5–6 tuổi</option></select><p className="gg-help">Mỗi lượt có 6 thử thách nhỏ. Bé cứ thong thả thử lại, không có đồng hồ đếm ngược. Bấm nút nghe khi bé muốn nghe tiếng Anh.</p><button type="button" className="gg-primary" disabled={disabled} onClick={start}>Bắt đầu chơi <span aria-hidden="true">🌱</span></button></div></div>}
    {phase === 'play' && run && mission && <div className="gg-play">
      <div className="gg-progress"><span>Thử thách {round + 1}/{run.missions.length}</span><progress max={run.missions.length} value={round + Number(solved)} aria-label="Số thử thách đã hoàn thành" /></div>
      <p className="gg-instruction">{instruction}</p>
      <div className="ag-mission-heading"><span aria-hidden="true">{basket?.emoji || train?.emoji || '🧺'}</span><h3 className={train ? 'ag-translation' : odd ? 'ag-category' : undefined}>{basket?.requestVi || (odd ? `Nhóm: ${odd.categoryVi}` : train?.vietnamese)}</h3>{basket && <p className="ag-request" lang="en">{basket.request}</p>}{odd && <p lang="en">{odd.category}</p>}</div>
      {basket && <div className="ag-basket-list" aria-label="Danh sách cần chọn">{basket.items.map(item => { const word = WORDS.get(item.wordId)!; const selected = counts[item.wordId] || 0; return <div className="ag-basket-item" key={item.wordId}><span className="ag-list-emoji" aria-hidden="true">{word.emoji}</span><div><strong>{word.meaning}</strong><span lang="en">{word.word}</span></div><span className={`ag-quantity ${selected === item.quantity ? 'is-full' : ''}`} aria-label={`Đã chọn ${selected} trên ${item.quantity} ${word.meaning}`}>{selected}/{item.quantity}{selected === item.quantity && <span aria-hidden="true"> ✓</span>}</span></div>; })}</div>}
      <div className="ag-listen-row"><button type="button" className="gg-listen" disabled={disabled} onClick={() => listen(listenText)}><Volume2 size={20} aria-hidden="true" />{basket ? 'Nghe danh sách' : odd ? 'Nghe tên nhóm' : 'Nghe câu tiếng Anh'}</button></div>
      {(basket || odd) && <div className={basket ? 'ag-shelf' : 'ag-picnic'} role="group" aria-label={basket ? 'Kệ hàng để bé chọn' : 'Chọn bạn khác nhóm'}>{run.options[mission.id].map(wordId => { const word = WORDS.get(wordId)!; const required = basket?.items.find(item => item.wordId === wordId)?.quantity; const full = required !== undefined && (counts[wordId] || 0) >= required; return <div className="ag-picture-card" key={wordId}><button type="button" className={basket ? 'ag-basket-option' : 'ag-odd-option'} data-word-id={wordId} disabled={disabled || solved || full} aria-label={`${basket ? 'Chọn' : 'Chọn bạn'} ${word.meaning}${full ? ', đã đủ' : ''}`} onClick={() => basket ? chooseBasket(wordId) : chooseOdd(wordId)}><span className="ag-option-emoji" aria-hidden="true">{word.emoji}</span><strong>{word.meaning}</strong><span lang="en">{word.word}</span>{full && <span className="ag-full-label">Đã đủ ✓</span>}</button><button type="button" className="gg-listen-small" disabled={disabled} aria-label={`Nghe ${word.word}`} onClick={() => listen(word.word)}><Volume2 size={17} aria-hidden="true" /> Nghe</button></div>; })}</div>}
      {train && <div className="ag-train"><div className="ag-carriages" role="group" aria-label="Câu bé đang xếp"><span className="ag-engine" aria-hidden="true">🚂</span>{train.tokens.map((_, index) => <span className={`ag-slot ${carriages[index] ? 'is-filled' : ''}`} key={index} aria-label={`Toa ${index + 1}: ${carriages[index]?.word || 'còn trống'}`} lang="en">{carriages[index]?.word || <span aria-hidden="true">·</span>}</span>)}</div><div className="ag-word-bank" role="group" aria-label="Chọn toa từ">{run.trains[train.id].map((choice, index) => <button type="button" className="ag-train-word" data-choice-id={choice.id} key={choice.id} lang="en" aria-label={`${choice.word}, toa từ ${index + 1}`} disabled={disabled || solved || checked.current || carriages.some(item => item.id === choice.id) || carriages.length >= train.tokens.length} onClick={() => chooseTrain(choice)}>{choice.word}</button>)}</div>{!solved && <div className="gg-bee-actions"><button type="button" className="gg-secondary" disabled={disabled || !carriages.length} onClick={resetTrain}><RotateCcw size={17} aria-hidden="true" /> Xếp lại</button><button type="button" className="gg-primary ag-check" disabled={disabled || carriages.length !== train.tokens.length} onClick={checkTrain}>Kiểm tra</button></div>}</div>}
      <div className="ag-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback}</div>
      {solved && <div className="ag-solved"><span aria-hidden="true">🌼</span>{train && <p lang="en">{train.english}</p>}<button type="button" className="gg-primary ag-next" disabled={disabled} onClick={next}>{round === run.missions.length - 1 ? 'Xem kết quả' : 'Thử thách tiếp theo'} <span aria-hidden="true">→</span></button></div>}
    </div>}
    {phase === 'result' && result && <div className="gg-result"><span className="gg-result-flower" aria-hidden="true">🌻</span><h3>Bé đã hoàn thành {result.words} thử thách!</h3><p>Mỗi lần thử là một lần mình khám phá thêm.</p><dl><div><dt>{game === 'basket' ? 'Lần chọn đúng' : 'Thử thách hoàn thành'}</dt><dd>{result.correct}</dd></div><div><dt>Lần thử đáp án</dt><dd>{result.attempts}</dd></div></dl><div className="gg-result-actions"><button type="button" className="gg-primary" disabled={disabled} onClick={start}><RotateCcw size={18} aria-hidden="true" /> Chơi lượt mới</button><button type="button" className="gg-secondary" disabled={disabled} onClick={() => { activePhase.current = 'setup'; stopSpeech(); setPhase('setup'); setFeedback(''); setSpeechError(''); }}>Đổi độ tuổi</button></div></div>}
    {phase === 'setup' && feedback && <p className="ag-feedback" role="status">{feedback}</p>}
    {speechError && <p className="gg-audio-error" role="status">{speechError}</p>}
    {disabled && <p className="gg-disabled-note" role="status">Đang chuẩn bị dữ liệu học tập. Bé đợi một chút nhé.</p>}
  </section>;
}
