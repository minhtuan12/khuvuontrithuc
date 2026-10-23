export type GardenGame='match'|'reveal'|'bee';
export type GardenAge='3-4'|'4-5'|'5-6';
export interface GardenWord {id:string;topic:string;word:string;meaning:string;emoji:string;clue:string;clueVi:string;example:string;minAge:GardenAge}
export const GARDEN_TOPICS=[
 {id:'animals',name:'Động vật',emoji:'🐾'}, {id:'fruit',name:'Trái cây',emoji:'🍎'},
 {id:'school',name:'Trường học',emoji:'🎒'}, {id:'family',name:'Gia đình',emoji:'🏡'},
 {id:'vehicles',name:'Phương tiện',emoji:'🚗'}, {id:'body',name:'Cơ thể',emoji:'👋'},
 {id:'toys',name:'Đồ chơi',emoji:'🧸'}, {id:'clothes',name:'Quần áo',emoji:'👕'},
];
// Rows: word, Vietnamese meaning, pictogram, English clue, Vietnamese clue, example.
type WordRow=[string,string,string,string,string,string];
const corpus:Record<string,WordRow[]>={
 animals:[
  ['cat','con mèo','🐱','I say meow.','Tớ kêu meo meo.','The cat is sleeping.'],
  ['dog','con chó','🐶','I say woof.','Tớ kêu gâu gâu.','The dog can run.'],
  ['cow','con bò','🐮','I say moo.','Tớ kêu ụm bò.','The cow eats grass.'],
  ['pig','con lợn','🐷','I have a curly tail and say oink.','Tớ có đuôi xoăn và kêu ủn ỉn.','The pig has a pink nose.'],
  ['duck','con vịt','🦆','I say quack and swim in a pond.','Tớ kêu cạp cạp và bơi trong ao.','The duck is swimming.'],
  ['fish','con cá','🐟','I have fins and live in water.','Tớ có vây và sống dưới nước.','The fish swims in the water.'],
  ['rabbit','con thỏ','🐰','I hop and have long ears.','Tớ nhảy và có đôi tai dài.','The rabbit has long ears.'],
  ['elephant','con voi','🐘','I have a long trunk.','Tớ có chiếc vòi dài.','The elephant is big.'],
 ],
 fruit:[
  ['apple','quả táo','🍎','I am the red fruit in this picture.','Tớ là quả màu đỏ trong hình này.','I eat an apple.'],
  ['banana','quả chuối','🍌','I am a long yellow fruit with a peel.','Tớ là quả dài màu vàng có vỏ bóc được.','I peel a banana.'],
  ['orange','quả cam','🍊','My name is also a color.','Tên tiếng Anh của tớ cũng là tên một màu sắc.','This orange is juicy.'],
  ['grape','quả nho','🍇','Many of us grow together in a bunch.','Chúng tớ mọc thành chùm.','A grape can be purple.'],
  ['lemon','quả chanh vàng','🍋','I am yellow and taste sour.','Tớ màu vàng và có vị chua.','The lemon is sour.'],
  ['pear','quả lê','🍐','I am the green fruit with a narrow top.','Tớ là quả màu xanh có phần trên nhỏ trong hình.','The pear is sweet.'],
  ['cherry','quả anh đào','🍒','Two little red fruits share this picture.','Hai quả đỏ nhỏ cùng xuất hiện trong hình.','The cherry is red.'],
  ['watermelon','quả dưa hấu','🍉','I have green skin and a red inside.','Tớ có vỏ xanh và ruột đỏ.','We share a watermelon.'],
 ],
 school:[
  ['book','quyển sách','📖','You turn my pages to read.','Bạn lật các trang của tớ để đọc.','I read a book.'],
  ['pen','bút mực','🖊️','I write with ink.','Tớ viết bằng mực.','This is my pen.'],
  ['bag','cặp sách','🎒','You carry your school things inside me.','Bạn đựng đồ dùng đi học bên trong tớ.','My bag has a book.'],
  ['chair','cái ghế','🪑','You sit on me.','Bạn ngồi lên tớ.','I sit on a chair.'],
  ['pencil','bút chì','✏️','You can erase the marks I make.','Bạn có thể tẩy nét viết của tớ.','I draw with a pencil.'],
  ['ruler','thước kẻ','📏','I help you draw straight lines.','Tớ giúp bạn kẻ đường thẳng.','The ruler is on my desk.'],
  ['crayon','bút sáp màu','🖍️','I am a colorful wax stick for drawing.','Tớ là thỏi sáp màu dùng để vẽ.','I use a red crayon.'],
  ['scissors','cái kéo','✂️','My two blades cut paper with adult help.','Hai lưỡi của tớ cắt giấy khi có người lớn giúp.','An adult helps me use scissors.'],
 ],
 family:[
  ['mother','mẹ','👩','I am your mom.','Tớ là mẹ của bạn.','My mother reads with me.'],
  ['father','bố','👨','I am your dad.','Tớ là bố của bạn.','My father plays with me.'],
  ['baby','em bé','👶','I am a very young child.','Tớ là một em nhỏ mới chào đời.','The baby is smiling.'],
  ['grandma','bà','👵','I am your mom or dad’s mother.','Tớ là mẹ của bố hoặc mẹ bạn.','Grandma tells a story.'],
  ['grandpa','ông','👴','I am your mom or dad’s father.','Tớ là bố của bố hoặc mẹ bạn.','Grandpa waves hello.'],
  ['sister','chị hoặc em gái','👧','I am a girl with the same parent as you.','Tớ là chị hoặc em gái trong gia đình bạn.','My sister likes books.'],
  ['brother','anh hoặc em trai','👦','I am a boy with the same parent as you.','Tớ là anh hoặc em trai trong gia đình bạn.','My brother likes games.'],
  ['cousin','anh chị em họ','🧒','My parent is your aunt or uncle.','Bố hoặc mẹ tớ là cô, dì, chú, bác hoặc cậu của bạn.','My cousin visits us.'],
 ],
 vehicles:[
  ['car','ô tô','🚗','I am a small road vehicle for a family.','Tớ là xe nhỏ chạy trên đường cho gia đình.','The car has four wheels.'],
  ['bus','xe buýt','🚌','I carry many people along a route.','Tớ chở nhiều người theo một tuyến đường.','We ride on a bus.'],
  ['boat','thuyền','⛵','I float and travel on water.','Tớ nổi và di chuyển trên mặt nước.','The boat is on the lake.'],
  ['train','tàu hỏa','🚂','I travel on railway tracks.','Tớ chạy trên đường ray.','The train has many carriages.'],
  ['bike','xe đạp','🚲','You push my pedals to turn two wheels.','Bạn đạp bàn đạp để hai bánh của tớ quay.','I wear a helmet on my bike.'],
  ['truck','xe tải','🚚','I carry large loads on the road.','Tớ chở nhiều hàng trên đường.','The truck carries boxes.'],
  ['plane','máy bay','✈️','I have wings and carry people in the sky.','Tớ có cánh và chở người trên bầu trời.','The plane flies high.'],
  ['helicopter','máy bay trực thăng','🚁','My spinning blades lift me into the sky.','Cánh quạt quay giúp tớ bay lên trời.','The helicopter can hover.'],
 ],
 body:[
  ['eye','mắt','👁️','You use me to see.','Bạn dùng tớ để nhìn.','I can see with my eyes.'],
  ['ear','tai','👂','You use me to hear.','Bạn dùng tớ để nghe.','I hear music with my ears.'],
  ['nose','mũi','👃','You use me to smell.','Bạn dùng tớ để ngửi.','My nose can smell a flower.'],
  ['hand','bàn tay','✋','I have fingers and can wave.','Tớ có các ngón và có thể vẫy chào.','I wave my hand.'],
  ['foot','bàn chân','🦶','You put a shoe on me.','Bạn mang giày vào tớ.','My foot is in a shoe.'],
  ['mouth','miệng','👄','You open me to speak and eat.','Bạn mở tớ để nói và ăn.','I open my mouth to speak.'],
  ['tooth','chiếc răng','🦷','I help you bite and chew food.','Tớ giúp bạn cắn và nhai thức ăn.','I brush each tooth.'],
  ['leg','chân','🦵','I bend at the knee.','Tớ gập lại ở đầu gối.','I bend my leg.'],
 ],
 toys:[
  ['ball','quả bóng','⚽','You can roll or kick me.','Bạn có thể lăn hoặc đá tớ.','I roll the ball.'],
  ['doll','búp bê','🪆','I am a toy shaped like a person.','Tớ là đồ chơi có hình người.','My doll has a dress.'],
  ['teddy','gấu bông','🧸','I am a soft toy bear.','Tớ là chú gấu đồ chơi mềm mại.','I hug my teddy.'],
  ['kite','cái diều','🪁','You hold my string while I fly in the wind.','Bạn giữ dây khi tớ bay trong gió.','The kite flies in the wind.'],
  ['puzzle','bộ ghép hình','🧩','Fit my pieces together to make a picture.','Ghép các mảnh của tớ lại để tạo thành bức tranh.','We finish the puzzle together.'],
  ['drum','cái trống','🥁','Tap me to make a beat.','Gõ vào tớ để tạo nhịp điệu.','I tap the toy drum.'],
  ['robot','rô bốt','🤖','I am a machine-shaped toy in this picture.','Tớ là đồ chơi hình người máy trong hình.','The toy robot has buttons.'],
  ['dice','xúc xắc','🎲','Roll me and count the dots on top.','Lăn tớ rồi đếm các chấm ở mặt trên.','I roll the dice.'],
 ],
 clothes:[
  ['hat','mũ','🧢','You wear me on your head.','Bạn đội tớ trên đầu.','I wear a hat outside.'],
  ['shirt','áo','👕','You wear me on your upper body.','Bạn mặc tớ ở phần trên cơ thể.','My shirt is blue.'],
  ['dress','váy liền','👗','I am a one-piece outfit with a skirt.','Tớ là trang phục liền thân có phần váy.','This dress is green.'],
  ['shoe','chiếc giày','👟','You wear me on a foot to walk outside.','Bạn mang tớ ở bàn chân để đi ra ngoài.','I put on my shoe.'],
  ['sock','chiếc tất','🧦','You wear me inside a shoe.','Bạn mang tớ bên trong giày.','This sock is soft.'],
  ['coat','áo khoác','🧥','You wear me over clothes to stay warm.','Bạn mặc tớ ngoài quần áo để giữ ấm.','I wear a coat in cold weather.'],
  ['scarf','khăn quàng','🧣','You wrap me around your neck.','Bạn quàng tớ quanh cổ.','My scarf keeps my neck warm.'],
  ['glove','găng tay','🧤','You wear me on your hand in cold weather.','Bạn mang tớ ở bàn tay khi trời lạnh.','I put a glove on my hand.'],
 ],
};
export const GARDEN_WORDS:GardenWord[]=GARDEN_TOPICS.flatMap(({id:topic})=>corpus[topic].map(([word,meaning,emoji,clue,clueVi,example],index)=>({id:`${topic}-${word}`,topic,word,meaning,emoji,clue,clueVi,example,minAge:(index<4?'3-4':index<6?'4-5':'5-6') as GardenAge})));
const ageLevel:Record<GardenAge,number>={'3-4':0,'4-5':1,'5-6':2};
export function getGardenWords(topic:string,age:GardenAge):GardenWord[]{return GARDEN_WORDS.filter(word=>(topic==='all'||word.topic===topic)&&ageLevel[word.minAge]<=ageLevel[age]);}
/** Fisher–Yates shuffle; input arrays are never modified. */
export function shuffle<T>(items:T[],rng:()=>number=Math.random):T[]{
 const result=[...items];for(let i=result.length-1;i>0;i--){const draw=rng();const j=Math.min(i,Math.max(0,Math.floor((Number.isFinite(draw)?draw:0)*(i+1))));[result[i],result[j]]=[result[j],result[i]];}return result;
}
function uniqueWords(words:GardenWord[]):GardenWord[]{return Array.from(new Map(words.map(word=>[word.word.toLowerCase(),word])).values());}
function boundedCount(count:number,max:number):number{return Number.isFinite(count)?Math.min(max,Math.max(0,Math.floor(count))):max;}
export function makeGardenRound(words:GardenWord[],count:number,rng:()=>number=Math.random):GardenWord[]{const unique=uniqueWords(words);return shuffle(unique,rng).slice(0,boundedCount(count,unique.length));}
export function makeGardenOptions(target:GardenWord,pool:GardenWord[],count=3,rng:()=>number=Math.random):GardenWord[]{
 const others=uniqueWords(pool).filter(word=>word.word.toLowerCase()!==target.word.toLowerCase());
 const size=Math.max(1,boundedCount(count,others.length+1));return shuffle([target,...shuffle(others,rng).slice(0,size-1)],rng);
}
export function makeBeePuzzle(word:string,age:GardenAge,rng:()=>number=Math.random):{slots:(string|null)[];choices:{id:string;letter:string}[];answer:string}{
 if(!/^[a-z]{3,}$/i.test(word))throw new Error('Bee words must contain at least three letters, A–Z only.');
 const answer=word.toUpperCase();const count=Math.min(ageLevel[age]+1,answer.length-1);
 const hidden=new Set(shuffle(Array.from({length:answer.length},(_,index)=>index),rng).slice(0,count));
 const slots=Array.from(answer,(letter,index)=>hidden.has(index)?null:letter);
 const missing=Array.from(hidden,index=>({id:`letter-${index}`,letter:answer[index]}));
 const missingLetters=new Set(missing.map(choice=>choice.letter));
 const decoys=shuffle(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').filter(letter=>!missingLetters.has(letter)),rng).slice(0,2).map(letter=>({id:`decoy-${letter}`,letter}));
 const choices=shuffle([...missing,...decoys],rng);
 return {slots,choices,answer};
}
