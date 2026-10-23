// @ts-ignore Bun provides its own test runner.
import {expect,test} from 'bun:test';
import {BASKET_MISSIONS,ODD_MISSIONS,TRAIN_MISSIONS,getAdventureMissions,makeAdventureRun,makeTrainChoices} from '../src/lib/englishAdventureGames';
import {GARDEN_WORDS} from '../src/lib/englishGardenGames';
const ages=['3-4','4-5','5-6'] as const;
test('all three games provide 24 unique missions, eight per exact age',()=>{
 for(const game of ['basket','odd','train'] as const){const all=ages.flatMap(age=>getAdventureMissions(game,age));expect(all.length).toBe(24);expect(new Set(all.map(m=>m.id)).size).toBe(24);for(const age of ages){expect(getAdventureMissions(game,age).length).toBe(8);expect(getAdventureMissions(game,age).every(m=>m.age===age)).toBe(true);}}
});
test('basket lists use shared eligible words, bounded quantities and unique shelves containing every target',()=>{
 for(const mission of BASKET_MISSIONS){expect(mission.items.length).toBeGreaterThan(0);expect(mission.items.length).toBeLessThanOrEqual(2);expect(new Set(mission.optionIds).size).toBe(mission.optionIds.length);expect(new Set(mission.items.map(i=>i.wordId)).size).toBe(mission.items.length);for(const id of mission.optionIds){const word=GARDEN_WORDS.find(w=>w.id===id);expect(word).toBeTruthy();expect(['fruit','school','toys','clothes'].includes(word!.topic)).toBe(true);}for(const item of mission.items){expect(mission.optionIds.includes(item.wordId)).toBe(true);expect(item.quantity).toBeGreaterThan(0);expect(item.quantity).toBeLessThanOrEqual(mission.age==='3-4'?1:2);}expect(mission.request.length).toBeGreaterThan(0);expect(mission.requestVi.length).toBeGreaterThan(0);}
 expect(BASKET_MISSIONS.some(m=>m.request.includes('two cherries'))).toBe(true);
});
test('odd missions have exactly three named-topic words and one unambiguous outlier',()=>{
 for(const mission of ODD_MISSIONS){expect(mission.optionIds.length).toBe(4);expect(new Set(mission.optionIds).size).toBe(4);const words=mission.optionIds.map(id=>GARDEN_WORDS.find(w=>w.id===id)!);expect(words.every(Boolean)).toBe(true);expect(words.filter(w=>w.topic===mission.groupTopic).length).toBe(3);expect(words.filter(w=>w.topic!==mission.groupTopic).map(w=>w.id)).toEqual([mission.outlierId]);expect(mission.category.length).toBeGreaterThan(0);expect(mission.categoryVi.length).toBeGreaterThan(0);expect(mission.explanation.length).toBeGreaterThan(0);}
});
test('train phrases have age-sized canonical tokens and repeated-word-safe shuffled choice IDs',()=>{
 let repeated=false;for(const mission of TRAIN_MISSIONS){expect(mission.english).toBe(mission.tokens.join(' '));expect(mission.english).toMatch(/^[A-Z].*[.!?]$/);expect(mission.tokens.length).toBeGreaterThanOrEqual(mission.age==='3-4'?3:4);expect(mission.tokens.length).toBeLessThanOrEqual(mission.age==='3-4'?4:mission.age==='4-5'?5:6);const choices=makeTrainChoices(mission,()=>0);expect(choices.length).toBe(mission.tokens.length);expect(new Set(choices.map(c=>c.id)).size).toBe(choices.length);expect(choices.map(c=>c.word).sort()).toEqual([...mission.tokens].sort());if(new Set(mission.tokens).size<mission.tokens.length)repeated=true;}expect(repeated).toBe(true);
});
test('runs cap at six unique missions and deterministic helpers preserve source arrays',()=>{
 const source=[...BASKET_MISSIONS];const original=[...source];const run=makeAdventureRun([...source,source[0]],100,()=>0);expect(run.length).toBe(6);expect(new Set(run.map(m=>m.id)).size).toBe(6);expect(makeAdventureRun(source,3,()=>0)).toEqual(makeAdventureRun(source,3,()=>0));expect(source).toEqual(original);expect(makeAdventureRun([],6)).toEqual([]);expect(makeAdventureRun(source,0)).toEqual([]);
});
