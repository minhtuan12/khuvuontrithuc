export const gardenGameIds = ['match', 'reveal', 'bee', 'basket', 'odd', 'train'] as const;
export const gardenTopicIds = ['all', 'animals', 'fruit', 'school', 'family', 'vehicles', 'body', 'toys', 'clothes'] as const;
export type GardenCompletion = {game:typeof gardenGameIds[number];topic:string;age:'3-4'|'4-5'|'5-6';correct:number;attempts:number;words:number};
export type GardenProgress = Record<string,{runs:number;words:number;bestAccuracy:number;lastPlayed:string}>;
export const emptyGardenProgress = ():GardenProgress => ({});
const integer = (v:unknown,max:number) => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= max;
function validKey(key:string) {
 const [game,topic,age,...extra]=key.split(':');
 return extra.length===0 && gardenGameIds.some(id=>id===game) && gardenTopicIds.some(id=>id===topic) && ['3-4','4-5','5-6'].includes(age);
}
export function validGardenProgress(value:unknown):value is GardenProgress {
 if(!value || typeof value!=='object' || Array.isArray(value))return false;
 const entries=Object.entries(value);
 return entries.length<=gardenGameIds.length*gardenTopicIds.length*3 && entries.every(([key,item])=>validKey(key) && item && typeof item==='object' && !Array.isArray(item) && integer(item.runs,1000000) && integer(item.words,6000000) && integer(item.bestAccuracy,100) && typeof item.lastPlayed==='string' && Number.isFinite(Date.parse(item.lastPlayed)));
}
export function applyGardenResult(previous:GardenProgress,result:GardenCompletion,now=new Date().toISOString()):GardenProgress {
 const key=`${result.game}:${result.topic}:${result.age}`;
 if(!validKey(key) || !integer(result.words,6) || result.words<1 || !integer(result.correct,10000) || !integer(result.attempts,10000) || result.attempts<1 || result.correct>result.attempts || !Number.isFinite(Date.parse(now)))throw new Error('Invalid garden completion');
 const old=previous[key];
 return {...previous,[key]:{runs:Math.min(1000000,(old?.runs||0)+1),words:Math.min(6000000,(old?.words||0)+result.words),bestAccuracy:Math.max(old?.bestAccuracy||0,Math.round(result.correct/result.attempts*100)),lastPlayed:now}};
}
