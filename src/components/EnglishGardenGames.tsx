import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, Flower2, RotateCcw, Volume2 } from 'lucide-react';
import { GARDEN_TOPICS, getGardenWords, makeGardenOptions, makeGardenRound, makeBeePuzzle, shuffle, type GardenWord } from '../lib/englishGardenGames';
import { readAssistantMessage, stopAssistantSpeech } from '../lib/assistantSpeech';
import { getLearnerScope } from '../lib/learnerStorage';
import './english-garden-games.css';

export type GardenGame = 'match' | 'reveal' | 'bee';
type Age = '3-4' | '4-5' | '5-6';
export type GardenGameResult = { game: GardenGame; topic: string; age: Age; correct: number; attempts: number; words: number };
const GAME_INFO = {
  match: { title: 'Nối hình với từ', english: 'Picture Match', emoji: '🌼', description: 'Chạm vào hình, rồi tìm từ tiếng Anh cùng cặp.' },
  reveal: { title: 'Bức tranh bí mật', english: 'Secret Picture', emoji: '🌿', description: 'Mở từng ô lá và đoán từ tiếng Anh trong tranh.' },
  bee: { title: 'Ong chăm chỉ đánh vần', english: 'Spelling Bee', emoji: '🐝', description: 'Chọn từng chữ cái để giúp ong hoàn thành từ.' },
};

export function GardenGameCards({ onSelect, disabled = false }: { onSelect: (game: GardenGame) => void; disabled?: boolean }) {
  return <section className="garden-games garden-games-entry" aria-labelledby="garden-games-entry-title">
    <div className="gg-entry-heading"><span aria-hidden="true">🌷</span><div><h2 id="garden-games-entry-title">Thêm niềm vui trong vườn</h2><p>Ba trò chơi nhỏ, cùng bé khám phá từ mới.</p></div></div>
    <div className="gg-entry-grid">{(Object.keys(GAME_INFO) as GardenGame[]).map(game => <button key={game} className={`gg-entry-card gg-entry-card--${game}`} disabled={disabled} onClick={() => onSelect(game)}>
      <span className="gg-entry-emoji" aria-hidden="true">{GAME_INFO[game].emoji}</span><strong>{GAME_INFO[game].title}</strong><span lang="en">{GAME_INFO[game].english}</span><p>{GAME_INFO[game].description}</p><span className="gg-entry-action">Cùng chơi <span aria-hidden="true">→</span></span>
    </button>)}</div>
  </section>;
}

type Run = {
  targets: GardenWord[];
  pool: GardenWord[];
  pictureOrder: GardenWord[];
  wordOrder: GardenWord[];
  options: GardenWord[][];
  puzzles: ReturnType<typeof makeBeePuzzle>[];
};

export default function EnglishGardenGames({ game, onBack, onComplete, disabled = false }: {
  game: GardenGame; onBack: () => void; onComplete: (result: GardenGameResult) => void; disabled?: boolean;
}) {
  const id = useId();
  const info = GAME_INFO[game];
  const [age, setAge] = useState<Age>('3-4');
  const [topic, setTopic] = useState('all');
  const [phase, setPhase] = useState<'setup' | 'play' | 'result'>('setup');
  const [run, setRun] = useState<Run | null>(null);
  const [round, setRound] = useState(0);
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [tiles, setTiles] = useState<number[]>([]);
  const [letters, setLetters] = useState<{ id: string; letter: string }[]>([]);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [result, setResult] = useState<GardenGameResult | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const surface = useRef<HTMLElement>(null);
  const [ownerScope] = useState(getLearnerScope);
  const live = useRef(true);
  const completed = useRef(false);
  const roundLocked = useRef(false);
  const matchedIds = useRef(new Set<string>());
  const picture = useRef<string | null>(null);
  const chosenLetters = useRef<{ id: string; letter: string }[]>([]);
  const counters = useRef({ correct: 0, attempts: 0 });
  const speechVersion = useRef(0);
  const beeChecked = useRef(false);

  function stopSpeech() {
    speechVersion.current += 1;
    stopAssistantSpeech();
  }
  useEffect(() => {
    live.current = true;
    return () => { live.current = false; stopSpeech(); };
  }, []);
  useEffect(() => { heading.current?.focus(); }, [phase, round]);
  useEffect(() => {
    if (phase !== 'play' || game !== 'match' || !matched.length) return;
    surface.current?.querySelector<HTMLButtonElement>('.gg-picture:not(:disabled)')?.focus();
  }, [matched, phase, game]);
  useEffect(() => {
    if (solved) surface.current?.querySelector<HTMLButtonElement>('.gg-word-learned button')?.focus();
  }, [solved]);
  useEffect(() => {
    if (phase !== 'play' || game !== 'reveal' || !tiles.length || solved) return;
    const nextTile = surface.current?.querySelector<HTMLButtonElement>('.gg-secret-tiles button:not(:disabled)');
    const firstAnswer = surface.current?.querySelector<HTMLButtonElement>('.gg-answers button:not(:disabled)');
    (nextTile || firstAnswer)?.focus();
  }, [tiles, solved, phase, game]);
  useEffect(() => {
    if (phase !== 'play' || game !== 'bee' || !letters.length || solved || !run) return;
    const count = run.puzzles[round].slots.filter(slot => slot === null).length;
    const selector = letters.length === count ? '.gg-bee-actions .gg-primary' : '.gg-letter-bank button:not(:disabled)';
    surface.current?.querySelector<HTMLButtonElement>(selector)?.focus();
  }, [letters, solved, phase, game, run, round]);

  function listen(word: string) {
    if (disabled) return;
    stopSpeech();
    setSpeechError('');
    const version = speechVersion.current;
    void readAssistantMessage(word, true, 'en-US').catch(() => {
      if (live.current && version === speechVersion.current && getLearnerScope() === ownerScope) setSpeechError('Chưa nghe được tiếng Anh trên thiết bị này. Bé có thể thử nghe lại hoặc tiếp tục nhìn hình để chơi.');
    });
  }

  function start() {
    if (disabled) return;
    stopSpeech();
    const pool = getGardenWords(topic, age);
    const targets = makeGardenRound(pool, game === 'match' ? age === '3-4' ? 3 : 4 : 6);
    if (!targets.length) { setFeedback('Chủ đề này chưa có từ phù hợp. Hãy chọn chủ đề khác nhé.'); return; }
    setRun({ targets, pool, pictureOrder: shuffle(targets), wordOrder: shuffle(targets), options: targets.map(target => makeGardenOptions(target, pool, 3)), puzzles: targets.map(target => makeBeePuzzle(target.word, age)) });
    counters.current = { correct: 0, attempts: 0 };
    matchedIds.current = new Set();
    picture.current = null;
    chosenLetters.current = [];
    completed.current = false;
    roundLocked.current = false;
    beeChecked.current = false;
    setRound(0); setMatched([]); setSelectedPicture(null); setLetters([]); setTiles([]); setSolved(false); setFeedback(''); setSpeechError(''); setResult(null); setPhase('play');
  }

  function finish() {
    if (!run || completed.current || disabled || !live.current || getLearnerScope() !== ownerScope) return;
    completed.current = true;
    stopSpeech();
    const summary = { game, topic, age, ...counters.current, words: run.targets.length };
    setResult(summary);
    setPhase('result');
    onComplete(summary);
  }

  function next() {
    if (!run || !roundLocked.current || disabled || completed.current) return;
    if (round === run.targets.length - 1) { finish(); return; }
    roundLocked.current = false;
    beeChecked.current = false;
    stopSpeech();
    chosenLetters.current = [];
    setRound(value => value + 1); setTiles([]); setLetters([]); setSolved(false); setFeedback(''); setSpeechError('');
  }

  function chooseMatch(word: GardenWord) {
    if (disabled || completed.current || matchedIds.current.has(word.id)) return;
    const selected = picture.current;
    if (!selected) { setFeedback('Bé chọn một bông hoa có hình trước nhé!'); return; }
    counters.current.attempts += 1;
    if (selected !== word.id) { setFeedback('Hai bạn chưa cùng cặp rồi. Bé chọn lại từ nhé!'); return; }
    matchedIds.current.add(word.id);
    counters.current.correct += 1;
    picture.current = null;
    setSelectedPicture(null); setMatched([...matchedIds.current]); setFeedback(`Đúng rồi! ${word.word} là ${word.meaning}.`);
    if (run && matchedIds.current.size === run.targets.length) finish();
  }

  function chooseAnswer(word: GardenWord) {
    if (!run || disabled || roundLocked.current || completed.current) return;
    counters.current.attempts += 1;
    const target = run.targets[round];
    if (target.id !== word.id) { setFeedback('Chưa đúng rồi. Bé mở thêm ô lá hoặc chọn lại nhé!'); return; }
    roundLocked.current = true;
    counters.current.correct += 1;
    setSolved(true); setFeedback(`Đúng rồi! ${target.word} là ${target.meaning}.`);
  }

  function checkBee() {
    if (!run || disabled || roundLocked.current || completed.current || beeChecked.current) return;
    const puzzle = run.puzzles[round];
    if (chosenLetters.current.length !== puzzle.slots.filter(slot => slot === null).length) return;
    beeChecked.current = true;
    counters.current.attempts += 1;
    let index = 0;
    const answer = puzzle.slots.map(slot => slot ?? chosenLetters.current[index++]?.letter ?? '').join('');
    if (answer.toUpperCase() !== puzzle.answer.toUpperCase()) { setFeedback('Chữ cái chưa đúng chỗ rồi. Bé bấm “Ghép lại” và thử nhé!'); return; }
    roundLocked.current = true;
    counters.current.correct += 1;
    setSolved(true); setFeedback(`Giỏi lắm! ${run.targets[round].word} là ${run.targets[round].meaning}.`);
  }

  const target = run?.targets[round];
  const puzzle = run?.puzzles[round];
  const topicName = topic === 'all' ? 'Cả khu vườn' : GARDEN_TOPICS.find(item => item.id === topic)?.name;
  const missing = puzzle?.slots.filter(slot => slot === null).length || 0;
  let letterIndex = 0;

  return <section ref={surface} className={`garden-games gg-game gg-game--${game}`} aria-labelledby={`${id}-title`}>
    <button type="button" className="gg-back" onClick={() => { completed.current = true; stopSpeech(); onBack(); }}><ArrowLeft size={20} aria-hidden="true" /> Về trò chơi tiếng Anh</button>
    <header className="gg-header"><div><span className="gg-eyebrow"><Flower2 size={17} aria-hidden="true" /> CHƠI TRONG VƯỜN TIẾNG ANH</span><h2 id={`${id}-title`} ref={heading} tabIndex={-1}>{phase === 'result' ? 'Vườn thêm một niềm vui!' : info.title}</h2><p>{phase === 'setup' ? info.description : `${topicName} · ${age} tuổi`}</p></div><span className="gg-game-icon" aria-hidden="true">{info.emoji}</span></header>
    {phase === 'setup' && <div className="gg-setup"><div className="gg-setup-art"><img src="/illustrations/garden-story.jpg" alt="Khu vườn học tập đầy hoa và cây xanh" /></div><div className="gg-setup-form"><h3>Mình chơi gì hôm nay?</h3><label htmlFor={`${id}-age`}>Độ tuổi của bé</label><select id={`${id}-age`} value={age} disabled={disabled} onChange={event => setAge(event.target.value as Age)}><option value="3-4">3–4 tuổi</option><option value="4-5">4–5 tuổi</option><option value="5-6">5–6 tuổi</option></select><label htmlFor={`${id}-topic`}>Chủ đề</label><select id={`${id}-topic`} value={topic} disabled={disabled} onChange={event => setTopic(event.target.value)}><option value="all">🌷 Cả khu vườn</option>{GARDEN_TOPICS.map(item => <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>)}</select><p className="gg-help">{game === 'match' ? `${age === '3-4' ? 3 : 4} cặp hoa nhỏ. Chọn hình trước, tìm từ sau.` : 'Tối đa 6 từ mỗi lượt. Bé cứ thong thả, không cần chạy đua!'} Có thể bấm nút nghe bất cứ khi nào bé muốn.</p><button type="button" className="gg-primary" disabled={disabled} onClick={start}>Bắt đầu chơi <span aria-hidden="true">🌱</span></button></div></div>}
    {phase === 'play' && run && target && <div className="gg-play">
      <div className="gg-progress"><span>{game === 'match' ? `Đã tìm ${matched.length}/${run.targets.length} cặp` : `Từ ${round + 1}/${run.targets.length}`}</span><progress max={run.targets.length} value={game === 'match' ? matched.length : round + Number(solved)} aria-label={game === 'match' ? 'Số cặp đã tìm' : 'Số từ đã hoàn thành'} /></div>
      {game === 'match' ? <><p className="gg-instruction">① Chọn một hình. ② Chạm vào từ cùng cặp.</p><div className="gg-match-board"><div className="gg-match-column" role="group" aria-label="Các bông hoa có hình">{run.pictureOrder.map(word => <div className={`gg-match-flower ${matched.includes(word.id) ? 'is-matched' : ''}`} key={word.id}><button type="button" className="gg-picture" disabled={disabled || matched.includes(word.id)} aria-label={`Chọn hình ${word.meaning}${matched.includes(word.id) ? ', đã ghép đúng' : ''}`} aria-pressed={selectedPicture === word.id} onClick={() => { picture.current = word.id; setSelectedPicture(word.id); setFeedback('Bây giờ bé chọn từ tiếng Anh cùng cặp nhé!'); }}><span aria-hidden="true">{word.emoji}</span>{word.topic === 'family' && <span className="gg-family-label">{word.meaning}</span>}{matched.includes(word.id) && <span className="gg-check" aria-hidden="true">✓</span>}</button><button type="button" className="gg-listen-small" aria-label={`Nghe từ cho hình ${word.meaning}`} disabled={disabled} onClick={() => listen(word.word)}><Volume2 size={18} aria-hidden="true" /> Nghe</button></div>)}</div><div className="gg-match-column" role="group" aria-label="Các từ tiếng Anh">{run.wordOrder.map(word => <div className={`gg-match-word ${matched.includes(word.id) ? 'is-matched' : ''}`} key={word.id}><button type="button" className="gg-word" lang="en" disabled={disabled || matched.includes(word.id)} onClick={() => chooseMatch(word)}>{word.word}{matched.includes(word.id) && <span aria-hidden="true"> ✓</span>}</button><button type="button" className="gg-listen-small" aria-label={`Nghe ${word.word}`} disabled={disabled} onClick={() => listen(word.word)}><Volume2 size={18} aria-hidden="true" /> Nghe</button></div>)}</div></div></>
      : <><div className="gg-question"><p className="gg-instruction">{game === 'reveal' ? 'Chạm vào ô lá để nhìn tranh. Bé đoán đó là từ nào?' : 'Chạm các chữ cái theo thứ tự để lấp đầy ô mật nhé!'}</p>{game === 'reveal' ? <div className="gg-secret" role="group" aria-label={solved ? `Đã tìm thấy: ${target.meaning}` : 'Bức tranh bí mật gồm chín ô lá'}><span className="gg-secret-picture" aria-hidden="true">{target.emoji}</span><div className="gg-secret-tiles">{Array.from({ length: 9 }, (_, tile) => <button key={tile} type="button" className={tiles.includes(tile) || solved ? 'is-open' : ''} disabled={disabled || tiles.includes(tile) || solved} aria-label={tiles.includes(tile) || solved ? `Ô ${tile + 1} đã mở` : `Mở mảnh ${tile + 1}`} onClick={() => setTiles(previous => previous.includes(tile) ? previous : [...previous, tile])}><span aria-hidden="true">🌿</span></button>)}</div></div> : <div className="gg-bee-picture"><span role="img" aria-label={target.meaning}>{target.emoji}</span><p>{target.meaning}</p></div>}
      <p className="gg-clue">{target.clueVi}</p><button type="button" className="gg-listen" disabled={disabled} onClick={() => listen(target.word)}><Volume2 size={21} aria-hidden="true" /> Nghe từ tiếng Anh</button>
      {game === 'reveal' ? <div className="gg-answers" role="group" aria-label="Chọn từ tiếng Anh">{run.options[round].map(option => <button type="button" key={option.id} lang="en" disabled={disabled || solved} onClick={() => chooseAnswer(option)}>{option.word}</button>)}</div> : puzzle && <><div className="gg-honey-slots" role="group" aria-label="Các chữ cái của từ">{puzzle.slots.map((slot, index) => { const letter = slot ?? letters[letterIndex++]?.letter; return <span className={`gg-honey-slot ${slot === null ? 'gg-honey-slot--blank' : ''}`} key={index} aria-label={`Chữ ${index + 1}: ${letter || 'còn thiếu'}`} lang="en">{letter || <span aria-hidden="true">·</span>}</span>; })}</div><div className="gg-letter-bank" role="group" aria-label="Chọn chữ cái">{puzzle.choices.map((choice, choiceIndex) => <button type="button" key={choice.id} aria-label={`Chữ ${choice.letter}, lựa chọn ${choiceIndex + 1}`} lang="en" disabled={disabled || solved || letters.some(item => item.id === choice.id) || letters.length >= missing} onClick={() => { if (roundLocked.current || chosenLetters.current.some(item => item.id === choice.id) || chosenLetters.current.length >= missing) return; chosenLetters.current = [...chosenLetters.current, choice]; setLetters(chosenLetters.current); setFeedback(''); }}>{choice.letter}</button>)}</div>{!solved && <div className="gg-bee-actions"><button type="button" className="gg-secondary" disabled={disabled || !letters.length} onClick={() => { beeChecked.current = false; chosenLetters.current = []; setLetters([]); setFeedback('Bé ghép lại từ nhé!'); }}><RotateCcw size={17} aria-hidden="true" /> Ghép lại</button><button type="button" className="gg-primary" disabled={disabled || letters.length !== missing} onClick={checkBee}>Kiểm tra</button></div>}</>}
      {solved && <div className="gg-word-learned"><strong lang="en">{target.word}</strong><p>{target.meaning}</p><p lang="en">{target.example}</p><button type="button" className="gg-primary" disabled={disabled} onClick={next}>{round === run.targets.length - 1 ? 'Xem kết quả' : 'Từ tiếp theo'} <span aria-hidden="true">→</span></button></div>}</div></>}
    </div>}
    {phase === 'result' && result && <div className="gg-result"><span className="gg-result-flower" aria-hidden="true">🌻</span><h3>Bé đã cùng chơi với {result.words} từ!</h3><p>Mỗi lần thử là một lần mình học thêm.</p><dl><div><dt>Từ đã hoàn thành</dt><dd>{result.correct}</dd></div><div><dt>Lần chọn đáp án</dt><dd>{result.attempts}</dd></div></dl><div className="gg-result-actions"><button type="button" className="gg-primary" disabled={disabled} onClick={start}><RotateCcw size={18} aria-hidden="true" /> Chơi lượt mới</button><button type="button" className="gg-secondary" disabled={disabled} onClick={() => { stopSpeech(); setPhase('setup'); setFeedback(''); setSpeechError(''); }}>Đổi chủ đề</button></div></div>}
    <div className="gg-status" role="status" aria-live="polite" aria-atomic="true">{feedback}</div>
    {speechError && <p className="gg-audio-error" role="status">{speechError}</p>}
    {disabled && <p className="gg-disabled-note" role="status">Đang chuẩn bị dữ liệu học tập. Bé đợi một chút nhé.</p>}
  </section>;
}
