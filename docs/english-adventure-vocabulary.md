# English adventure learning content

This reviewed local corpus contains 72 missions: 24 shopping lists, 24 category questions and 24 sentence trains. Each game has eight missions for each exact age band, 3-4, 4-5 and 5-6. Unlike cumulative garden vocabulary selection, adventure mission selection returns only the requested age.

Basket words reference the existing garden IDs; no duplicate vocabulary definitions are introduced. Shelves use only fruit, school things, toys and clothes. Youngest lists request a single item; older lists introduce two items and quantities of two. The English requests explicitly teach correct plurals, including cherries. Shelf IDs are unique; quantities belong to the requested objects and allow repeated taps on that object.

Odd-group questions name the category in English and Vietnamese. Every question contains three objects from that category and one from a different category. Family pictures have relationship labels; children need not infer relationships from an emoji. All eight garden categories appear once per age band. The explanation describes category membership positively rather than labelling a child or object as wrong.

Train sentences have 3-4 tokens for the youngest band, 4-5 for the middle band and 4-6 for the oldest. Capitalization and final punctuation are retained in the canonical tokens; joining with one space reproduces the English sentence exactly. Position-based token IDs preserve repeated words independently, including the two occurrences of can in train-17. Vietnamese translations favor natural meaning.

Emoji illustrate familiar objects and actions; they do not encode every detail in a sentence (such as color). Written labels, bilingual clues and optional listening provide the complete meaning. No external assets or requests are needed.

## Basket missions

| ID | Age | English request | Vietnamese | Required shared words | Shelf options |
| --- | --- | --- | --- | --- | --- |
| basket-1 | 3-4 | Find one apple. | Tìm một quả táo. | 1 x fruit-apple | fruit-apple, fruit-banana, fruit-orange |
| basket-2 | 3-4 | Find one banana. | Tìm một quả chuối. | 1 x fruit-banana | fruit-banana, fruit-apple, fruit-grape |
| basket-3 | 3-4 | Find one orange. | Tìm một quả cam. | 1 x fruit-orange | fruit-orange, fruit-banana, fruit-apple |
| basket-4 | 3-4 | Find one book. | Tìm một quyển sách. | 1 x school-book | school-book, school-pen, school-bag |
| basket-5 | 3-4 | Find one pen. | Tìm một bút mực. | 1 x school-pen | school-pen, school-book, school-bag |
| basket-6 | 3-4 | Find one ball. | Tìm một quả bóng. | 1 x toys-ball | toys-ball, toys-doll, toys-teddy |
| basket-7 | 3-4 | Find one teddy. | Tìm một gấu bông. | 1 x toys-teddy | toys-teddy, toys-ball, toys-kite |
| basket-8 | 3-4 | Find one hat. | Tìm một chiếc mũ. | 1 x clothes-hat | clothes-hat, clothes-shirt, clothes-shoe |
| basket-9 | 4-5 | Find two apples. | Tìm hai quả táo. | 2 x fruit-apple | fruit-apple, fruit-banana, fruit-pear, fruit-orange |
| basket-10 | 4-5 | Find two bananas. | Tìm hai quả chuối. | 2 x fruit-banana | fruit-banana, fruit-apple, fruit-lemon, fruit-grape |
| basket-11 | 4-5 | Find one apple and one orange. | Tìm một quả táo và một quả cam. | 1 x fruit-apple, 1 x fruit-orange | fruit-apple, fruit-orange, fruit-banana, fruit-pear |
| basket-12 | 4-5 | Find two pencils. | Tìm hai bút chì. | 2 x school-pencil | school-pencil, school-pen, school-book, school-ruler |
| basket-13 | 4-5 | Find one book and one pen. | Tìm một quyển sách và một bút mực. | 1 x school-book, 1 x school-pen | school-book, school-pen, school-pencil, school-bag |
| basket-14 | 4-5 | Find two balls. | Tìm hai quả bóng. | 2 x toys-ball | toys-ball, toys-doll, toys-teddy, toys-drum |
| basket-15 | 4-5 | Find one doll and one teddy. | Tìm một búp bê và một gấu bông. | 1 x toys-doll, 1 x toys-teddy | toys-doll, toys-teddy, toys-kite, toys-puzzle |
| basket-16 | 4-5 | Find one sock and one shoe. | Tìm một chiếc tất và một chiếc giày. | 1 x clothes-sock, 1 x clothes-shoe | clothes-sock, clothes-shoe, clothes-hat, clothes-coat |
| basket-17 | 5-6 | Find two cherries. | Tìm hai quả anh đào. | 2 x fruit-cherry | fruit-cherry, fruit-grape, fruit-watermelon, fruit-lemon |
| basket-18 | 5-6 | Find two pears and one apple. | Tìm hai quả lê và một quả táo. | 2 x fruit-pear, 1 x fruit-apple | fruit-pear, fruit-apple, fruit-cherry, fruit-banana |
| basket-19 | 5-6 | Find one lemon and two oranges. | Tìm một quả chanh vàng và hai quả cam. | 1 x fruit-lemon, 2 x fruit-orange | fruit-lemon, fruit-orange, fruit-watermelon, fruit-pear |
| basket-20 | 5-6 | Find two crayons and one ruler. | Tìm hai bút sáp màu và một thước kẻ. | 2 x school-crayon, 1 x school-ruler | school-crayon, school-ruler, school-pencil, school-pen |
| basket-21 | 5-6 | Find one bag and two books. | Tìm một cặp sách và hai quyển sách. | 1 x school-bag, 2 x school-book | school-bag, school-book, school-pen, school-crayon |
| basket-22 | 5-6 | Find one robot and two balls. | Tìm một rô bốt và hai quả bóng. | 1 x toys-robot, 2 x toys-ball | toys-robot, toys-ball, toys-dice, toys-puzzle |
| basket-23 | 5-6 | Find two gloves and one scarf. | Tìm hai găng tay và một khăn quàng. | 2 x clothes-glove, 1 x clothes-scarf | clothes-glove, clothes-scarf, clothes-coat, clothes-sock |
| basket-24 | 5-6 | Find one coat and two hats. | Tìm một áo khoác và hai chiếc mũ. | 1 x clothes-coat, 2 x clothes-hat | clothes-coat, clothes-hat, clothes-dress, clothes-glove |

## Category missions

| ID | Age | Category / Vietnamese | Three category members | Outlier | Vietnamese explanation |
| --- | --- | --- | --- | --- | --- |
| odd-1 | 3-4 | Animals / Động vật | cat, dog, cow | apple | quả táo thuộc nhóm trái cây; ba hình còn lại thuộc nhóm động vật. |
| odd-2 | 3-4 | Fruit / Trái cây | apple, banana, orange | cat | con mèo thuộc nhóm động vật; ba hình còn lại thuộc nhóm trái cây. |
| odd-3 | 3-4 | School things / Trường học | book, pen, bag | banana | quả chuối thuộc nhóm trái cây; ba hình còn lại thuộc nhóm trường học. |
| odd-4 | 3-4 | Family members / Gia đình | mother, father, baby | ball | quả bóng thuộc nhóm đồ chơi; ba hình còn lại thuộc nhóm gia đình. |
| odd-5 | 3-4 | Vehicles / Phương tiện | car, bus, boat | nose | mũi thuộc nhóm cơ thể; ba hình còn lại thuộc nhóm phương tiện. |
| odd-6 | 3-4 | Body parts / Cơ thể | eye, ear, nose | bus | xe buýt thuộc nhóm phương tiện; ba hình còn lại thuộc nhóm cơ thể. |
| odd-7 | 3-4 | Toys / Đồ chơi | ball, doll, teddy | orange | quả cam thuộc nhóm trái cây; ba hình còn lại thuộc nhóm đồ chơi. |
| odd-8 | 3-4 | Clothes / Quần áo | hat, shirt, dress | dog | con chó thuộc nhóm động vật; ba hình còn lại thuộc nhóm quần áo. |
| odd-9 | 4-5 | Animals / Động vật | dog, pig, duck | hat | mũ thuộc nhóm quần áo; ba hình còn lại thuộc nhóm động vật. |
| odd-10 | 4-5 | Fruit / Trái cây | banana, grape, lemon | chair | cái ghế thuộc nhóm trường học; ba hình còn lại thuộc nhóm trái cây. |
| odd-11 | 4-5 | School things / Trường học | pen, chair, pencil | cow | con bò thuộc nhóm động vật; ba hình còn lại thuộc nhóm trường học. |
| odd-12 | 4-5 | Family members / Gia đình | father, grandma, grandpa | pencil | bút chì thuộc nhóm trường học; ba hình còn lại thuộc nhóm gia đình. |
| odd-13 | 4-5 | Vehicles / Phương tiện | bus, train, bike | hand | bàn tay thuộc nhóm cơ thể; ba hình còn lại thuộc nhóm phương tiện. |
| odd-14 | 4-5 | Body parts / Cơ thể | ear, hand, foot | train | tàu hỏa thuộc nhóm phương tiện; ba hình còn lại thuộc nhóm cơ thể. |
| odd-15 | 4-5 | Toys / Đồ chơi | doll, kite, puzzle | pear | quả lê thuộc nhóm trái cây; ba hình còn lại thuộc nhóm đồ chơi. |
| odd-16 | 4-5 | Clothes / Quần áo | shirt, shoe, sock | duck | con vịt thuộc nhóm động vật; ba hình còn lại thuộc nhóm quần áo. |
| odd-17 | 5-6 | Animals / Động vật | cow, fish, rabbit | lemon | quả chanh vàng thuộc nhóm trái cây; ba hình còn lại thuộc nhóm động vật. |
| odd-18 | 5-6 | Fruit / Trái cây | orange, pear, cherry | rabbit | con thỏ thuộc nhóm động vật; ba hình còn lại thuộc nhóm trái cây. |
| odd-19 | 5-6 | School things / Trường học | bag, ruler, crayon | fish | con cá thuộc nhóm động vật; ba hình còn lại thuộc nhóm trường học. |
| odd-20 | 5-6 | Family members / Gia đình | baby, sister, brother | kite | cái diều thuộc nhóm đồ chơi; ba hình còn lại thuộc nhóm gia đình. |
| odd-21 | 5-6 | Vehicles / Phương tiện | boat, truck, plane | ear | tai thuộc nhóm cơ thể; ba hình còn lại thuộc nhóm phương tiện. |
| odd-22 | 5-6 | Body parts / Cơ thể | nose, mouth, tooth | boat | thuyền thuộc nhóm phương tiện; ba hình còn lại thuộc nhóm cơ thể. |
| odd-23 | 5-6 | Toys / Đồ chơi | teddy, drum, robot | grape | quả nho thuộc nhóm trái cây; ba hình còn lại thuộc nhóm đồ chơi. |
| odd-24 | 5-6 | Clothes / Quần áo | dress, coat, scarf | elephant | con voi thuộc nhóm động vật; ba hình còn lại thuộc nhóm quần áo. |

## Sentence trains

| ID | Age | English / canonical token order | Vietnamese | Picture |
| --- | --- | --- | --- | --- |
| train-1 | 3-4 | I see a cat. | Tớ nhìn thấy một con mèo. | 🐱 |
| train-2 | 3-4 | The dog runs. | Con chó chạy. | 🐶 |
| train-3 | 3-4 | I like apples. | Tớ thích táo. | 🍎 |
| train-4 | 3-4 | My bag is blue. | Cặp của tớ màu xanh dương. | 🎒 |
| train-5 | 3-4 | I see Grandma. | Tớ nhìn thấy bà. | 👵 |
| train-6 | 3-4 | The bus stops. | Xe buýt dừng lại. | 🚌 |
| train-7 | 3-4 | I clap my hands. | Tớ vỗ tay. | 👏 |
| train-8 | 3-4 | The ball rolls. | Quả bóng lăn. | ⚽ |
| train-9 | 4-5 | The rabbit can hop. | Con thỏ có thể nhảy. | 🐰 |
| train-10 | 4-5 | I have a yellow banana. | Tớ có một quả chuối màu vàng. | 🍌 |
| train-11 | 4-5 | My mother reads a book. | Mẹ tớ đọc một quyển sách. | 📖 |
| train-12 | 4-5 | The bike has two wheels. | Xe đạp có hai bánh. | 🚲 |
| train-13 | 4-5 | I draw with a pencil. | Tớ vẽ bằng bút chì. | ✏️ |
| train-14 | 4-5 | I wear a warm coat. | Tớ mặc một chiếc áo khoác ấm. | 🧥 |
| train-15 | 4-5 | My teddy is very soft. | Gấu bông của tớ rất mềm. | 🧸 |
| train-16 | 4-5 | I wave my hand. | Tớ vẫy tay. | 👋 |
| train-17 | 5-6 | We can run and can jump. | Chúng tớ có thể chạy và nhảy. | 🏃 |
| train-18 | 5-6 | My father drives a red car. | Bố tớ lái một chiếc ô tô đỏ. | 🚗 |
| train-19 | 5-6 | The elephant has a long trunk. | Con voi có chiếc vòi dài. | 🐘 |
| train-20 | 5-6 | My sister eats a sweet pear. | Chị hoặc em gái tớ ăn một quả lê ngọt. | 🍐 |
| train-21 | 5-6 | I brush my teeth every day. | Tớ đánh răng mỗi ngày. | 🦷 |
| train-22 | 5-6 | We put books in the bag. | Chúng tớ cho sách vào cặp. | 🎒 |
| train-23 | 5-6 | I wear gloves in cold weather. | Tớ đeo găng tay khi trời lạnh. | 🧤 |
| train-24 | 5-6 | My brother plays with a kite. | Anh hoặc em trai tớ chơi diều. | 🪁 |

## Pure helper contract and checks

getAdventureMissions(game, age) returns a fresh, exact-age array, with overloads for each mission type. makeAdventureRun removes duplicate IDs, shuffles without mutation and returns at most six missions (default six). makeTrainChoices preserves each canonical word and gives each position its own token-N ID before shuffling. Both random helpers accept an injected RNG. UI code shuffles category shelves/options separately and owns answers, retries, completion locks and persistence.

The regression suite checks the 24/8 corpus distribution; unique mission, shelf and target IDs; references and allowed basket topics; bounded quantities and cherry pluralization; exactly three in-category words plus one outlier; sentence lengths, capitalization, punctuation and exact token reconstruction; repeated-token choice IDs; deterministic sampling, deduplication and the six-mission cap.
