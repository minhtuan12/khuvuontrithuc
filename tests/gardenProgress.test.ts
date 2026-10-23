// @ts-ignore Bun test runner.
import {expect,test} from 'bun:test';
import {applyGardenResult,emptyGardenProgress,validGardenProgress} from '../src/lib/gardenProgress';
import {validators} from '../server/deviceValidation';

test('all six games retain backward-compatible progress and capacity for every game topic age',()=>{
 const value={runs:1,words:6,bestAccuracy:100,lastPlayed:'2026-10-23T08:00:00.000Z'};
 const all=Object.fromEntries(['match','reveal','bee','basket','odd','train'].flatMap(game=>['all','animals','fruit','school','family','vehicles','body','toys','clothes'].flatMap(topic=>['3-4','4-5','5-6'].map(age=>[`${game}:${topic}:${age}`,{...value}]))));
 expect(Object.keys(all)).toHaveLength(162);
 expect(validators['english-garden-progress'](all)).toBe(true);
 for(const game of ['basket','odd','train'] as const){
  const updated=applyGardenResult({}, {game,topic:'all',age:'3-4',correct:6,attempts:7,words:6});
  expect(updated[`${game}:all:3-4`].runs).toBe(1);
 }
});

test('garden completion accumulates owner document summaries without mutating prior state',()=>{
 const before=emptyGardenProgress();
 const result={game:'bee' as const,topic:'animals',age:'3-4' as const,correct:6,attempts:8,words:6};
 const first=applyGardenResult(before,result,'2026-10-23T08:00:00.000Z');
 expect(before).toEqual({});
 expect(first['bee:animals:3-4']).toEqual({runs:1,words:6,bestAccuracy:75,lastPlayed:'2026-10-23T08:00:00.000Z'});
 const next=applyGardenResult(first,{...result,attempts:6},'2026-10-23T09:00:00.000Z');
 expect(next['bee:animals:3-4'].runs).toBe(2);
 expect(next['bee:animals:3-4'].words).toBe(12);
 expect(next['bee:animals:3-4'].bestAccuracy).toBe(100);
 expect(validGardenProgress(next)).toBe(true);
 expect(validators['english-garden-progress'](next)).toBe(true);
});

test('garden schema rejects corrupt keys, impossible counters and client-forged completion',()=>{
 const good={runs:1,words:6,bestAccuracy:100,lastPlayed:'2026-10-23T08:00:00.000Z'};
 for(const value of [null,[],{'bee:unknown:3-4':good},{'bee:animals:3-4':{...good,runs:-1}},{'bee:animals:3-4':{...good,bestAccuracy:101}},{'bee:animals:3-4':{...good,lastPlayed:'bad'}},{'bee:animals:3-4':{...good,words:1.5}}])expect(validators['english-garden-progress'](value)).toBe(false);
 expect(()=>applyGardenResult({}, {game:'bee',topic:'all',age:'3-4',correct:9,attempts:1,words:6})).toThrow();
});
