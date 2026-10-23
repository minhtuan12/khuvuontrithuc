// @ts-ignore Bun provides its own test runner.
import {expect,test} from 'bun:test';
import {GARDEN_TOPICS,GARDEN_WORDS,getGardenWords,makeGardenRound,makeGardenOptions,makeBeePuzzle,shuffle} from '../src/lib/englishGardenGames';

test('corpus provides eight age-accessible topics and complete unique learning records',()=>{
 expect(GARDEN_TOPICS.length).toBe(8);expect(GARDEN_WORDS.length).toBeGreaterThanOrEqual(64);expect(new Set(GARDEN_WORDS.map(w=>w.id)).size).toBe(GARDEN_WORDS.length);expect(new Set(GARDEN_WORDS.map(w=>w.word)).size).toBe(GARDEN_WORDS.length);
 for(const topic of GARDEN_TOPICS){expect(getGardenWords(topic.id,'3-4').length).toBeGreaterThanOrEqual(4);expect(getGardenWords(topic.id,'5-6').length).toBeGreaterThanOrEqual(8);}
 for(const word of GARDEN_WORDS){expect(word.word).toMatch(/^[a-z]{3,}$/);for(const field of ['meaning','emoji','clue','clueVi','example'])expect((word as any)[field].length).toBeGreaterThan(0);}
 expect(getGardenWords('all','5-6').length).toBe(GARDEN_WORDS.length);expect(getGardenWords('unknown','3-4')).toEqual([]);expect(getGardenWords('all','3-4').length).toBeLessThan(getGardenWords('all','4-5').length);
});

test('rounds and answer options are unique, reproducible and never mutate source',()=>{
 const pool=GARDEN_WORDS.slice(0,8);const before=[...pool];const round=makeGardenRound([...pool,pool[0]],99,()=>0);expect(round.length).toBe(8);expect(new Set(round.map(w=>w.word)).size).toBe(8);expect(pool).toEqual(before);expect(makeGardenRound(pool,4,()=>0)).toEqual(makeGardenRound(pool,4,()=>0));expect(makeGardenRound(pool,0)).toEqual([]);
 const options=makeGardenOptions(pool[0],[...pool,pool[0]],3,()=>0);expect(options.length).toBe(3);expect(options.filter(w=>w.word===pool[0].word).length).toBe(1);expect(new Set(options.map(w=>w.word)).size).toBe(3);expect(makeGardenOptions(pool[0],[],3)).toEqual([pool[0]]);expect(shuffle([],()=>0)).toEqual([]);
});

test('Bee supplies every missing letter plus two distinct decoys with unique IDs even for repeated letters',()=>{
 for(const age of ['3-4','4-5','5-6'] as const){const puzzle=makeBeePuzzle('banana',age,()=>0);const blanks=puzzle.slots.filter(x=>x===null).length;expect(blanks).toBe(age==='3-4'?1:age==='4-5'?2:3);expect(puzzle.answer).toBe('BANANA');expect(puzzle.choices.length).toBe(blanks+2);expect(new Set(puzzle.choices.map(c=>c.id)).size).toBe(blanks+2);const missing=puzzle.slots.flatMap((slot,i)=>slot===null?[puzzle.answer[i]]:[]);expect(puzzle.choices.filter(c=>c.id.startsWith('letter-')).map(c=>c.letter).sort()).toEqual(missing.sort());const decoys=puzzle.choices.filter(c=>c.id.startsWith('decoy-'));expect(new Set(decoys.map(c=>c.letter)).size).toBe(2);for(const decoy of decoys)expect(missing.includes(decoy.letter)).toBe(false);expect(puzzle.slots.filter(x=>x!==null).length).toBeGreaterThan(0);}
 const repeated=makeBeePuzzle('aaa','5-6',()=>0);expect(repeated.choices.filter(c=>c.id.startsWith('letter-')).map(c=>c.letter)).toEqual(['A','A']);expect(new Set(repeated.choices.map(c=>c.id)).size).toBe(4);expect(()=>makeBeePuzzle('ice cream','3-4')).toThrow();
});
