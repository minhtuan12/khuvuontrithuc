import {GARDEN_WORDS,GARDEN_TOPICS,shuffle,type GardenAge} from './englishGardenGames';
export type AdventureGame='basket'|'odd'|'train';
export interface BasketMission{id:string;age:GardenAge;request:string;requestVi:string;emoji:string;items:{wordId:string;quantity:number}[];optionIds:string[]}
export interface OddMission{id:string;age:GardenAge;category:string;categoryVi:string;groupTopic:string;optionIds:string[];outlierId:string;explanation:string}
export interface TrainMission{id:string;age:GardenAge;english:string;vietnamese:string;emoji:string;tokens:string[]}
const ages:GardenAge[]=['3-4','4-5','5-6'];
const wordByName=(word:string)=>{const found=GARDEN_WORDS.find(item=>item.word===word);if(!found)throw Error(`Unknown garden word: ${word}`);return found;};
type BasketRow=[string,string,string,string[],[string,number][]];
// Request, translation, pictogram, shelf, required quantities; eight rows per age.
const basketRows:BasketRow[]=[
 ['Find one apple.','Tìm một quả táo.','🍎',['apple','banana','orange'],[['apple',1]]],
 ['Find one banana.','Tìm một quả chuối.','🍌',['banana','apple','grape'],[['banana',1]]],
 ['Find one orange.','Tìm một quả cam.','🍊',['orange','banana','apple'],[['orange',1]]],
 ['Find one book.','Tìm một quyển sách.','📖',['book','pen','bag'],[['book',1]]],
 ['Find one pen.','Tìm một bút mực.','🖊️',['pen','book','bag'],[['pen',1]]],
 ['Find one ball.','Tìm một quả bóng.','⚽',['ball','doll','teddy'],[['ball',1]]],
 ['Find one teddy.','Tìm một gấu bông.','🧸',['teddy','ball','kite'],[['teddy',1]]],
 ['Find one hat.','Tìm một chiếc mũ.','🧢',['hat','shirt','shoe'],[['hat',1]]],
 ['Find two apples.','Tìm hai quả táo.','🍎',['apple','banana','pear','orange'],[['apple',2]]],
 ['Find two bananas.','Tìm hai quả chuối.','🍌',['banana','apple','lemon','grape'],[['banana',2]]],
 ['Find one apple and one orange.','Tìm một quả táo và một quả cam.','🧺',['apple','orange','banana','pear'],[['apple',1],['orange',1]]],
 ['Find two pencils.','Tìm hai bút chì.','✏️',['pencil','pen','book','ruler'],[['pencil',2]]],
 ['Find one book and one pen.','Tìm một quyển sách và một bút mực.','🎒',['book','pen','pencil','bag'],[['book',1],['pen',1]]],
 ['Find two balls.','Tìm hai quả bóng.','⚽',['ball','doll','teddy','drum'],[['ball',2]]],
 ['Find one doll and one teddy.','Tìm một búp bê và một gấu bông.','🧸',['doll','teddy','kite','puzzle'],[['doll',1],['teddy',1]]],
 ['Find one sock and one shoe.','Tìm một chiếc tất và một chiếc giày.','🧦',['sock','shoe','hat','coat'],[['sock',1],['shoe',1]]],
 ['Find two cherries.','Tìm hai quả anh đào.','🍒',['cherry','grape','watermelon','lemon'],[['cherry',2]]],
 ['Find two pears and one apple.','Tìm hai quả lê và một quả táo.','🍐',['pear','apple','cherry','banana'],[['pear',2],['apple',1]]],
 ['Find one lemon and two oranges.','Tìm một quả chanh vàng và hai quả cam.','🍋',['lemon','orange','watermelon','pear'],[['lemon',1],['orange',2]]],
 ['Find two crayons and one ruler.','Tìm hai bút sáp màu và một thước kẻ.','🖍️',['crayon','ruler','pencil','pen'],[['crayon',2],['ruler',1]]],
 ['Find one bag and two books.','Tìm một cặp sách và hai quyển sách.','🎒',['bag','book','pen','crayon'],[['bag',1],['book',2]]],
 ['Find one robot and two balls.','Tìm một rô bốt và hai quả bóng.','🤖',['robot','ball','dice','puzzle'],[['robot',1],['ball',2]]],
 ['Find two gloves and one scarf.','Tìm hai găng tay và một khăn quàng.','🧤',['glove','scarf','coat','sock'],[['glove',2],['scarf',1]]],
 ['Find one coat and two hats.','Tìm một áo khoác và hai chiếc mũ.','🧥',['coat','hat','dress','glove'],[['coat',1],['hat',2]]],
];
export const BASKET_MISSIONS:BasketMission[]=basketRows.map(([request,requestVi,emoji,options,items],index)=>({id:`basket-${index+1}`,age:ages[Math.floor(index/8)],request,requestVi,emoji,items:items.map(([word,quantity])=>({wordId:wordByName(word).id,quantity})),optionIds:options.map(word=>wordByName(word).id)}));

const categoryNames:Record<string,string>={animals:'Animals',fruit:'Fruit',school:'School things',family:'Family members',vehicles:'Vehicles',body:'Body parts',toys:'Toys',clothes:'Clothes'};
// Each age visits all eight categories. Outliers are from physically distinct categories.
const outliersByAge=[
 ['apple','cat','banana','ball','nose','bus','orange','dog'],
 ['hat','chair','cow','pencil','hand','train','pear','duck'],
 ['lemon','rabbit','fish','kite','ear','boat','grape','elephant'],
];
const categoryIndices=[[0,1,2],[1,3,4],[2,5,6]];
export const ODD_MISSIONS:OddMission[]=ages.flatMap((age,ageIndex)=>GARDEN_TOPICS.map((topic,topicIndex)=>{
 const group=GARDEN_WORDS.filter(word=>word.topic===topic.id);
 const members=categoryIndices[ageIndex].map(index=>group[index]);
 const outlier=wordByName(outliersByAge[ageIndex][topicIndex]);
 return {id:`odd-${ageIndex*8+topicIndex+1}`,age,category:categoryNames[topic.id],categoryVi:topic.name,groupTopic:topic.id,optionIds:[...members.map(word=>word.id),outlier.id],outlierId:outlier.id,explanation:`${outlier.meaning} thuộc nhóm ${GARDEN_TOPICS.find(item=>item.id===outlier.topic)!.name.toLowerCase()}; ba hình còn lại thuộc nhóm ${topic.name.toLowerCase()}.`};
}));

type TrainRow=[string,string,string];
const trainRows:TrainRow[]=[
 ['I see a cat.','Tớ nhìn thấy một con mèo.','🐱'],
 ['The dog runs.','Con chó chạy.','🐶'],
 ['I like apples.','Tớ thích táo.','🍎'],
 ['My bag is blue.','Cặp của tớ màu xanh dương.','🎒'],
 ['I see Grandma.','Tớ nhìn thấy bà.','👵'],
 ['The bus stops.','Xe buýt dừng lại.','🚌'],
 ['I clap my hands.','Tớ vỗ tay.','👏'],
 ['The ball rolls.','Quả bóng lăn.','⚽'],
 ['The rabbit can hop.','Con thỏ có thể nhảy.','🐰'],
 ['I have a yellow banana.','Tớ có một quả chuối màu vàng.','🍌'],
 ['My mother reads a book.','Mẹ tớ đọc một quyển sách.','📖'],
 ['The bike has two wheels.','Xe đạp có hai bánh.','🚲'],
 ['I draw with a pencil.','Tớ vẽ bằng bút chì.','✏️'],
 ['I wear a warm coat.','Tớ mặc một chiếc áo khoác ấm.','🧥'],
 ['My teddy is very soft.','Gấu bông của tớ rất mềm.','🧸'],
 ['I wave my hand.','Tớ vẫy tay.','👋'],
 ['We can run and can jump.','Chúng tớ có thể chạy và nhảy.','🏃'],
 ['My father drives a red car.','Bố tớ lái một chiếc ô tô đỏ.','🚗'],
 ['The elephant has a long trunk.','Con voi có chiếc vòi dài.','🐘'],
 ['My sister eats a sweet pear.','Chị hoặc em gái tớ ăn một quả lê ngọt.','🍐'],
 ['I brush my teeth every day.','Tớ đánh răng mỗi ngày.','🦷'],
 ['We put books in the bag.','Chúng tớ cho sách vào cặp.','🎒'],
 ['I wear gloves in cold weather.','Tớ đeo găng tay khi trời lạnh.','🧤'],
 ['My brother plays with a kite.','Anh hoặc em trai tớ chơi diều.','🪁'],
];
export const TRAIN_MISSIONS:TrainMission[]=trainRows.map(([english,vietnamese,emoji],index)=>({id:`train-${index+1}`,age:ages[Math.floor(index/8)],english,vietnamese,emoji,tokens:english.split(' ')}));

export function getAdventureMissions(game:'basket',age:GardenAge):BasketMission[];
export function getAdventureMissions(game:'odd',age:GardenAge):OddMission[];
export function getAdventureMissions(game:'train',age:GardenAge):TrainMission[];
export function getAdventureMissions(game:AdventureGame,age:GardenAge):(BasketMission|OddMission|TrainMission)[];
export function getAdventureMissions(game:AdventureGame,age:GardenAge):(BasketMission|OddMission|TrainMission)[]{
 const missions=game==='basket'?BASKET_MISSIONS:game==='odd'?ODD_MISSIONS:TRAIN_MISSIONS;return missions.filter(mission=>mission.age===age);
}
export function makeAdventureRun<T extends {id:string}>(missions:T[],count=6,rng:()=>number=Math.random):T[]{
 const unique=Array.from(new Map(missions.map(mission=>[mission.id,mission])).values());
 const limit=Number.isFinite(count)?Math.max(0,Math.min(6,Math.floor(count))):6;return shuffle(unique,rng).slice(0,limit);
}
export function makeTrainChoices(mission:TrainMission,rng:()=>number=Math.random):{id:string;word:string}[]{return shuffle(mission.tokens.map((word,index)=>({id:`token-${index}`,word})),rng);}
