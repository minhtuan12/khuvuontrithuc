export interface TeacherThematicTopic {
  id: string;
  categoryKey: string;
  title: string;
  englishTitle: string;
  icon: string;
  accentColor: string;
  badge: string;
  targetAges: string;
  overview: string;
  
  // 1. Lời dẫn dắt đầu giờ (Warm-up & Circle Time Hook)
  warmupScript: {
    english: string;
    phonetic: string;
    vietnamesePhonetic: string;
    vietnamese: string;
    gestureGuide: string;
  };

  // 2. Bộ câu hỏi & Khẩu lệnh sư phạm theo chủ đề (Thematic Teacher Prompts)
  teacherPrompts: {
    id: string;
    english: string;
    phonetic: string;
    vietnamesePhonetic: string;
    vietnamese: string;
    purpose: string;
    tip?: string;
  }[];

  // 3. Kịch bản hội thoại thực tế Cô - Trẻ (Sample Classroom Dialogue)
  dialogue: {
    speaker: 'Teacher' | 'Children';
    english: string;
    phonetic?: string;
    vietnamese: string;
  }[];

  // 4. Từ vựng sư phạm chuyên sâu & Lưu ý phát âm cho cô
  vocabulary: {
    word: string;
    phonetic: string;
    vietnamesePhonetic: string;
    meaning: string;
    pronunciationCaution: string;
    classroomExample: string;
  }[];

  // 5. Mẹo sư phạm & Trò chơi TPR theo chủ đề
  teachingStrategies: {
    tprGame: {
      name: string;
      howToPlay: string;
      teacherCommands: string[];
    };
    pedagogicalTip: string;
    homeConnection: {
      english: string;
      vietnamese: string;
      context: string;
    };
  };

  // 6. Tình huống sư phạm trắc nghiệm nhanh cho cô
  scenarioQuiz: {
    situation: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const TEACHER_THEMATIC_TOPICS: TeacherThematicTopic[] = [
  // -------------------------------------------------------------
  // 1. TRƯỜNG MẦM NON & LỚP HỌC THÂN YÊU (KINDERGARTEN)
  // -------------------------------------------------------------
  {
    id: 'teacher-kindergarten',
    categoryKey: 'kindergarten',
    title: 'Trường mầm non & Nề nếp lớp học',
    englishTitle: 'Kindergarten Routines & Classroom Management',
    icon: '🏫',
    accentColor: 'from-blue-500 to-indigo-600',
    badge: 'Chủ đề 1 • Nề nếp & Giờ sinh hoạt',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Trang bị ngôn ngữ sư phạm chuẩn xác để cô điều hành giờ đón trẻ, nề nếp vòng tròn (circle time), chuyển giao hoạt động (transitions), góc chơi và quy tắc an toàn trong lớp học.',
    warmupScript: {
      english: 'Good morning, sweethearts! Welcome back to our happy kindergarten! Come find your spot on the carpet, sit criss-cross applesauce, and give teacher your biggest smile!',
      phonetic: '/ɡʊd ˈmɔːnɪŋ ˈswiːthɑːts! ˈwɛlkəm bæk tuː ˈaʊə ˈhæpi ˈkɪndəˌɡɑːtn!/',
      vietnamesePhonetic: 'Gút mo-ninh, suýt-hát-s! Oen-căm béc tu ao-ơ hép-pi kin-đơ-ga-tần! Căm fain do s-pót on đơ ca-pịt, sít crít-crót áp-pồ-sót-s, en gi-v tí-chơ do bích-gịt s-mai-ồ!',
      vietnamese: 'Chào buổi sáng các bé yêu! Chào mừng các con quay lại trường mầm non hạnh phúc! Hãy tìm chỗ ngồi trên thảm, khoanh chân gọn gàng và cười thật tươi với cô nào!',
      gestureGuide: 'Cô đứng ở trung tâm thảm, hai tay dang rộng đón chào, sau đó đặt tay lên đùi làm mẫu tư thế khoanh chân "criss-cross" và chỉ vào nụ cười tươi.'
    },
    teacherPrompts: [
      {
        id: 'tk-1',
        english: 'Eyes on me, ears listening, hands in your lap, please.',
        phonetic: '/aɪz ɒn miː, ɪəz ˈlɪsnɪŋ, hændz ɪn jɔː læp pliːz/',
        vietnamesePhonetic: 'Aiz on mi, i-ơ-z lít-sừ-ninh, hen-d-z in do lép pli-z.',
        vietnamese: 'Mắt nhìn cô, tai lắng nghe, hai tay đặt ngoan lên đùi nào các con.',
        purpose: 'Thu hút sự chú ý tập trung toàn lớp',
        tip: 'Vừa nói vừa chỉ tay lên mắt, vành tai và úp hai tay lên đùi làm mẫu nhịp nhàng.'
      },
      {
        id: 'tk-2',
        english: 'Tidy up time! Put the blocks in the blue basket and books on the shelf.',
        phonetic: '/ˈtaɪdi ʌp taɪm! pʊt ðə blɒks ɪn ðə bluː ˈbɑːskɪt ænd bʊks ɒn ðə ʃɛlf/',
        vietnamesePhonetic: 'Tai-đi áp taim! Pút đơ b-lóc-s in đơ b-lu ba-s-kịt en búc-s on đơ seo-ph.',
        vietnamese: 'Đến giờ dọn dẹp rồi! Hãy cất khối gỗ vào rổ xanh và xếp sách lên giá nhé.',
        purpose: 'Chỉ dẫn kết thúc giờ chơi tự do',
        tip: 'Bật bài nhạc ngắn 2 phút hoặc vỗ tay theo nhịp để trẻ dọn đồ đúng giờ mà không quấy khóc.'
      },
      {
        id: 'tk-3',
        english: 'Line up quietly by the door, one behind another. No pushing, my friends.',
        phonetic: '/laɪn ʌp ˈkwaɪətli baɪ ðə dɔː, wʌn bɪˈhaɪnd əˈnʌðər. nəʊ ˈpʊʃɪŋ, maɪ frɛndz/',
        vietnamesePhonetic: 'Lain áp quai-ợt-li bai đơ đo, uăn bi-hain ơ-na-đơ. Nâu pút-shinh, mai fren-d-z.',
        vietnamese: 'Xếp hàng ngay ngắn cạnh cửa nào, bạn sau đứng sau bạn trước. Không xô đẩy nhau nhé các bạn nhỏ.',
        purpose: 'Chuyển hàng ra sân thể dục hoặc đi rửa tay',
        tip: 'Gợi ý trẻ làm "đoàn tàu nhỏ": "Chugga chugga choo choo, our train is ready!".'
      },
      {
        id: 'tk-4',
        english: 'Who is ready to wash their hands? Soap, water, rub-rub-rub!',
        phonetic: '/huː ɪz ˈrɛdi tuː wɒʃ ðeə hændz? səʊp, ˈwɔːtər, rʌb rʌb rʌb!/',
        vietnamesePhonetic: 'Hu iz re-đi tu uốt-sh đe-ơ hen-d-z? Sô-p, uó-tơ, rắp-rắp-rắp!',
        vietnamese: 'Bạn nào sẵn sàng rửa tay nào? Xà phòng, nước sạch, cùng chà chà chà!',
        purpose: 'Rèn luyện thói quen vệ sinh trước giờ ăn',
        tip: 'Tạo hiệu ứng vui tai bằng âm thanh "rub-rub-rub" kết hợp động tác xoa lòng bàn tay.'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Good morning, Minh! Did you hang your backpack in your cubby?', phonetic: '/ɡʊd ˈmɔːnɪŋ mɪn! dɪd juː hæŋ jɔː ˈbækpæk ɪn jɔː ˈkʌbi?/', vietnamese: 'Chào buổi sáng Minh! Con đã treo ba lô vào ngăn tủ của mình chưa?' },
      { speaker: 'Children', english: 'Yes, teacher! Here is my teddy bear too!', phonetic: '/jɛs ˈtiːtʃər! hɪər ɪz maɪ ˈtɛdi beər tuː!/', vietnamese: 'Dạ rồi thưa cô! Cả chú gấu bông của con nữa này cô!' },
      { speaker: 'Teacher', english: 'Wonderful! You are so responsible. Let\'s invite teddy to join our circle time!', phonetic: '/ˈwʌndəfl! juː ɑː səʊ rɪˈspɒnsəbl. lɛts ɪnˈvaɪt ˈtɛdi tuː dʒɔɪn ˈaʊə ˈsɜːkl taɪm!/', vietnamese: 'Tuyệt vời quá! Con rất có trách nhiệm. Cùng mời bạn gấu tham gia vòng tròn với chúng mình nào!' }
    ],
    vocabulary: [
      {
        word: 'Cubby',
        phonetic: '/ˈkʌbi/',
        vietnamesePhonetic: 'Cáp-bi',
        meaning: 'Ngăn tủ đựng ba lô, giày dép riêng của từng bé',
        pronunciationCaution: 'Trọng âm rơi vào âm tiết đầu "CUB-", âm "b" bật nhẹ, không đọc là "cu-bi".',
        classroomExample: 'Please put your shoes into your cubby, Lan.'
      },
      {
        word: 'Circle time',
        phonetic: '/ˈsɜːkl taɪm/',
        vietnamesePhonetic: 'Sơ-cồ taim',
        meaning: 'Giờ sinh hoạt chung cả lớp ngồi quây quần trên thảm',
        pronunciationCaution: 'Âm /s/ đầu rõ ràng, âm /l/ uốn lưỡi nhẹ ở cuối từ "circle".',
        classroomExample: 'It is circle time, let us sing our morning anthem!'
      },
      {
        word: 'Transition',
        phonetic: '/trænˈzɪʃn/',
        vietnamesePhonetic: 'Tren-zít-shừn',
        meaning: 'Thời điểm chuyển tiếp giữa hai hoạt động trong lớp',
        pronunciationCaution: 'Âm giữa là /z/ và kết thúc bằng âm /ʃn/ tròn môi.',
        classroomExample: 'Smooth transitions help children feel secure and cheerful.'
      },
      {
        word: 'Criss-cross applesauce',
        phonetic: '/ˌkrɪs krɒs ˈæpl sɔːs/',
        vietnamesePhonetic: 'Crít-crót áp-pồ-sót-s',
        meaning: 'Thành ngữ mầm non chỉ tư thế ngồi khoanh chân ngay ngắn trên sàn',
        pronunciationCaution: 'Nhấn nhịp 4 tiếng vui tai: Kriss-Kross-Ap-ple-Sauce có âm /s/ đuôi.',
        classroomExample: 'Criss-cross applesauce, spoons in the bowl!'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi phản xạ nề nếp "1-2-3 Freeze & Point"',
        howToPlay: 'Cô hô to khẩu lệnh kèm tiếng gõ xắc xô. Khi cô nói "1-2-3 Circle time!", trẻ chạy về ngồi khoanh chân. Khi cô nói "1-2-3 Line up!", trẻ xếp thành đoàn tàu đứng yên.',
        teacherCommands: [
          '1-2-3 Circle time, sit down please!',
          '1-2-3 Freeze like a statue!',
          '1-2-3 Line up behind teacher!'
        ]
      },
      pedagogicalTip: 'Tránh dùng mệnh lệnh tiêu cực "Don\'t run" hay "Don\'t touch". Hãy thay bằng câu khẳng định định hướng hành vi: "Walking feet inside the classroom" (Đi bộ nhẹ nhàng trong lớp nhé) hoặc "Gentle hands, please".',
      homeConnection: {
        english: 'Nam was super helpful today, assisting teacher in packing blocks into their cubbies!',
        vietnamese: 'Hôm nay bé Nam rất ngoan và tự giác giúp cô cất gọn đồ chơi vào ngăn tủ đấy ạ!',
        context: 'Cô trao đổi với bố mẹ vào giờ đón trẻ cuối ngày.'
      }
    },
    scenarioQuiz: {
      situation: 'Trẻ đang chơi đồ chơi rất hăng say, đã đến giờ chuyển sang ăn trưa nhưng một số bé vẫn tiếp tục xây tháp và chưa muốn dừng.',
      question: 'Cô nên dùng cách dẫn dắt bằng tiếng Anh nào vừa êm ái vừa hiệu quả nhất?',
      options: [
        'Stop immediately or I will throw your blocks away!',
        'Two more minutes to finish your masterpiece, then let\'s sing our Clean Up song together!',
        'You are very naughty today, go sit in the corner.'
      ],
      correctIndex: 1,
      explanation: 'Quy tắc "2-minute warning" (thông báo trước 2 phút) kèm bài hát Clean Up giúp trẻ chủ động chuẩn bị tâm lý và sẵn sàng hợp tác mà không bị sốc cảm xúc.'
    }
  },

  // -------------------------------------------------------------
  // 2. BẢN THÂN, CƠ THỂ & CẢM XÚC (SELF & EMOTIONS)
  // -------------------------------------------------------------
  {
    id: 'teacher-self',
    categoryKey: 'self',
    title: 'Bản thân, Cơ thể & Quản lý cảm xúc',
    englishTitle: 'Self-Awareness, Body Parts & Emotion Coaching',
    icon: '👦',
    accentColor: 'from-sky-400 to-blue-500',
    badge: 'Chủ đề 2 • Khám phá bản thân & 5 Giác quan',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Cung cấp hệ thống ngôn ngữ giúp cô trò chuyện về nhận thức bản thân, các bộ phận cơ thể, 5 giác quan, đồng thời hỗ trợ xoa dịu cảm xúc (co-regulation), thấu cảm khi trẻ buồn, tức giận hay nhút nhát.',
    warmupScript: {
      english: 'Look in the magic mirror, children! What do you see? You see two sparkling eyes, a cute little nose, and a bright smile! How is your heart feeling today? Happy, proud, or a little sleepy?',
      phonetic: '/lʊk ɪn ðə ˈmædʒɪk ˈmɪrər, ˈtʃɪldrən! wɒt duː juː siː?/',
      vietnamesePhonetic: 'Lúc in đơ mé-dích mi-rơ, trâu-đrần! Uót du du si? Du si tu s-pác-linh aiz, ơ khiu-t lít-tồ nâu-z, en ơ b-rait s-mai-ồ! Hao iz do hát phi-linh tu-đêi? Hép-pi, prao-đ, o ơ lít-tồ s-lí-pi?',
      vietnamese: 'Hãy nhìn vào chiếc gương diệu kỳ nào các con! Các con nhìn thấy gì? Hai mắt lấp lánh, chiếc mũi xinh xắn và nụ cười rạng rỡ! Hôm nay trái tim con đang cảm thấy thế nào? Vui vẻ, tự hào hay hơi buồn ngủ một chút?',
      gestureGuide: 'Cô cầm chiếc gương nhỏ hoặc làm động tác soi gương bằng hai bàn tay khum lại, chớp mắt và đặt tay lên ngực trái cảm nhận nhịp đập.'
    },
    teacherPrompts: [
      {
        id: 'ts-1',
        english: 'Touch your shoulders, tap your knees, and shake your hands in the breeze!',
        phonetic: '/tʌtʃ jɔː ˈʃəʊldəz, tæp jɔː niːz, ænd ʃeɪk jɔː hændz ɪn ðə briːz/',
        vietnamesePhonetic: 'Tất-ch do sâu-đơ-z, tép do ni-z, en s-sêik do hen-d-z in đơ b-ri-z!',
        vietnamese: 'Chạm tay vào vai, gõ nhẹ lên đầu gối và vẫy đôi tay trong gió nào!',
        purpose: 'Khởi động định vị bộ phận cơ thể qua vận động',
        tip: 'Đọc theo nhịp vần điệu (rhyme) sôi nổi giúp trẻ thuộc từ vựng bộ phận cơ thể rất nhanh.'
      },
      {
        id: 'ts-2',
        english: 'I see tears on your cheeks. It is okay to feel sad. Take a deep breath with teacher: Smell the flower, blow the candle.',
        phonetic: '/aɪ siː tɪəz ɒn jɔː tʃiːks. ɪt ɪz əʊˈkeɪ tuː fiːl sæd. teɪk ə diːp brɛθ wɪð ˈtiːtʃər/',
        vietnamesePhonetic: 'Ai si ti-ơ-z on do tríc-s. Ít iz ô-kêi tu phi-ồ sét-đ. Têik ơ đíp b-rét-th uýt tí-chơ: s-meo đơ ph-lao-ơ, b-lâu đơ khen-đồ.',
        vietnamese: 'Cô thấy giọt nước mắt trên má con. Buồn một chút cũng không sao đâu con yêu. Hít thở sâu cùng cô nào: Ngửi bông hoa thơm ngát, rồi thổi tắt cây nến.',
        purpose: 'Xoa dịu và hướng dẫn trẻ điều hòa cảm xúc (Emotion Coaching)',
        tip: 'Quy tắc "Smell the flower, blow the candle" là kỹ thuật thở sâu hiệu quả hàng đầu cho trẻ mầm non.'
      },
      {
        id: 'ts-3',
        english: 'Use your gentle hands with your friend, please. We hug, we high-five, we do not hit.',
        phonetic: '/juːz jɔː ˈdʒɛntl hændz wɪð jɔː frɛnd pliːz/',
        vietnamesePhonetic: 'Du-z do den-tồ hen-d-z uýt do fren-đ pli-z. Ui hắc, ui hai-phai-v, ui đu not hít.',
        vietnamese: 'Hãy dùng đôi bàn tay yêu thương với bạn con nhé. Chúng mình ôm bạn, đập tay với bạn, chúng mình không đánh bạn.',
        purpose: 'Điều chỉnh hành vi khi trẻ có xu hướng va chạm thô bạo',
        tip: 'Giọng trầm ấm, nhìn thẳng vào mắt trẻ ngang tầm mắt (cô ngồi xổm xuống ngang tầm bé).'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'An, why are you sitting alone? Do you miss your mommy?', phonetic: '/æn, waɪ ɑː juː ˈsɪtɪŋ əˈləʊn? duː juː mɪs jɔː ˈmɒmi?/', vietnamese: 'An ơi, sao con lại ngồi một mình thế? Con nhớ mẹ à?' },
      { speaker: 'Children', english: 'Yes, teacher... I miss my mommy.', phonetic: '/jɛs ˈtiːtʃər... aɪ mɪs maɪ ˈmɒmi/', vietnamese: 'Dạ thưa cô... con nhớ mẹ lắm ạ.' },
      { speaker: 'Teacher', english: 'Mommy loves you so much and will come back right after nap time! Let\'s draw a big colorful heart for Mommy together, shall we?', phonetic: '/ˈmɒmi lʌvz juː səʊ mʌtʃ ænd wɪl kʌm bæk raɪt ˈɑːftə næp taɪm!/', vietnamese: 'Mẹ yêu con nhiều lắm và sẽ đón con ngay sau giấc ngủ trưa! Chúng mình cùng vẽ một trái tim to thật nhiều màu tặng mẹ nhé?' }
    ],
    vocabulary: [
      {
        word: 'Emotion coaching',
        phonetic: '/ɪˈməʊʃn ˈkəʊtʃɪŋ/',
        vietnamesePhonetic: 'I-mâu-shừn câu-trinh',
        meaning: 'Phương pháp sư phạm đồng hành và hướng dẫn cảm xúc cho trẻ',
        pronunciationCaution: 'Từ "emotion" nhấn âm tiết 2 /məʊ/, âm đuôi /ʃn/ uốn môi mềm mại.',
        classroomExample: 'Emotion coaching helps toddlers name what they feel.'
      },
      {
        word: 'Five senses',
        phonetic: '/faɪv ˈsɛnsɪz/',
        vietnamesePhonetic: 'Phai-v sen-xịt-z',
        meaning: 'Năm giác quan (Thị giác, Thính giác, Khứu giác, Vị giác, Xúc giác)',
        pronunciationCaution: 'Lưu ý âm /v/ ở từ "five" và đuôi số nhiều /ɪz/ ở từ "senses".',
        classroomExample: 'We explore the garden using our five senses!'
      },
      {
        word: 'Gentle hands',
        phonetic: '/ˈdʒɛntl hændz/',
        vietnamesePhonetic: 'Den-tồ hen-d-z',
        meaning: 'Đôi bàn tay dịu dàng, thân thiện (thuật ngữ chuẩn mầm non quốc tế)',
        pronunciationCaution: 'Âm đầu là /dʒ/ bật hơi, không đọc thành "ghen-tờ".',
        classroomExample: 'Remember: gentle hands and kind words in our classroom.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Emotions Weather Report" (Dự báo thời tiết tâm trạng)',
        howToPlay: 'Cô gắn 4 biểu tượng: Mặt trời (Vui vẻ - Happy), Đám mây xám (Buồn bã - Sad), Sấm sét (Tức giận - Mad/Angry), Cầu vồng (Hào hứng - Excited). Mỗi sáng, trẻ được chọn biểu tượng đại diện cho cảm xúc của mình và nói: "I feel like a sunny day!".',
        teacherCommands: [
          'Show me your sunny happy face! Big smile!',
          'Show me a stormy angry cloud: Grrr! Now blow it away: Whoosh!',
          'Today our class is full of bright rainbows!'
        ]
      },
      pedagogicalTip: 'Khi trẻ khóc, đừng nói "Don\'t cry" (Đừng khóc). Việc cấm đoán khiến trẻ khó chịu hơn. Hãy nói "I am right here with you" (Cô ở ngay bên cạnh con đây) để trẻ cảm thấy an toàn tuyệt đối.',
      homeConnection: {
        english: 'Mai recognized and named all five senses in English today and practiced deep belly breathing!',
        vietnamese: 'Hôm nay bé Mai đã gọi tên thành thạo 5 giác quan bằng tiếng Anh và tập hít thở sâu rất giỏi đấy bố mẹ!',
        context: 'Ghi sổ nhật ký điện tử mầm non.'
      }
    },
    scenarioQuiz: {
      situation: 'Một bé 4 tuổi bị bạn vô tình giẫm vào chân, bé nổi giận hét to và giơ tay định đánh lại bạn.',
      question: 'Cô giáo nên tiếp cận và can thiệp bằng câu tiếng Anh nào chuẩn mực nhất?',
      options: [
        'Both of you are bad boys! I will not give you stars today!',
        'Stop right there, my friend. Hands down, please. I see you are angry because your foot hurts, let\'s talk about it.',
        'Fight back if you want, but outside the door.'
      ],
      correctIndex: 1,
      explanation: 'Giữ thái độ điềm tĩnh, chặn hành vi đánh ngay lập tức ("Hands down, please") và gọi tên cảm xúc ("I see you are angry because your foot hurts") giúp trẻ học cách giải quyết mâu thuẫn văn minh.'
    }
  },

  // -------------------------------------------------------------
  // 3. GIA ĐÌNH & MÁI ẤM YÊU THƯƠNG (FAMILY)
  // -------------------------------------------------------------
  {
    id: 'teacher-family',
    categoryKey: 'family',
    title: 'Gia đình & Mái ấm thân yêu',
    englishTitle: 'Family Bonds & Home-School Partnership',
    icon: '👨‍👩‍👧',
    accentColor: 'from-pink-500 to-rose-500',
    badge: 'Chủ đề 3 • Tình yêu thương gia đình',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Nâng cao năng lực tổ chức bài học chủ đề Gia đình, hướng dẫn trẻ diễn đạt lòng biết ơn cha mẹ, ông bà, giới thiệu các thành viên trong gia đình và thiết lập mối liên kết gắn bó giữa nhà trường với phụ huynh.',
    warmupScript: {
      english: 'Look at my hands, everyone! Ten little fingers. Let\'s make a warm cozy house with our fingers! Who lives in our cozy house? Daddy, Mommy, Brother, Sister, and sweet little Baby!',
      phonetic: '/lʊk æt maɪ hændz, ˈɛvrɪwʌn! tɛn ˈlɪtl ˈfɪŋɡəz!/',
      vietnamesePhonetic: 'Lúc át mai hen-d-z, ép-ri-uăn! Ten lít-tồ phinh-gơ-z. Lét-s mêik ơ uo-m câu-zi hao-s uýt ao-ơ phinh-gơ-z! Hu lív-z in ao-ơ câu-zi hao-s? Đé-đi, Móm-mi, B-rá-đơ, Sít-s-tơ, en suýt lít-tồ Bêi-bi!',
      vietnamese: 'Nhìn vào đôi bàn tay cô này các con! Mười ngón tay nhỏ xinh. Chúng mình cùng chụm ngón tay làm thành một ngôi nhà ấm áp nào! Ai sống trong ngôi nhà ấm cúng của chúng mình? Bố yêu, mẹ hiền, anh trai, chị gái và em bé đáng yêu!',
      gestureGuide: 'Cô chụm các đầu ngón tay hai bàn tay thành hình mái nhà tam giác, rồi lần lượt giơ từng ngón tay theo bài hát Finger Family.'
    },
    teacherPrompts: [
      {
        id: 'tf-1',
        english: 'Hold up your family picture! Who is this tall person standing next to you?',
        phonetic: '/həʊld ʌp jɔː ˈfæmɪli ˈpɪktʃər! huː ɪz ðɪs tɔːl ˈpɜːsn ˈstændɪŋ nɛkst tuː juː?/',
        vietnamesePhonetic: 'Hâu-l-đ áp do phe-mi-li píc-chơ! Hu iz đít-s to-l pơ-sừn s-ten-đinh néc-s-t tu du?',
        vietnamese: 'Hãy giơ bức ảnh gia đình của con lên nào! Người cao lớn đứng cạnh con đây là ai thế nhỉ?',
        purpose: 'Khơi gợi trẻ chia sẻ về gia đình trong giờ vòng tròn',
        tip: 'Khích lệ trẻ dùng mẫu câu hoàn chỉnh: "This is my daddy" hoặc "This is my grandma".'
      },
      {
        id: 'tf-2',
        english: 'What does Mommy cook for you that you love the most?',
        phonetic: '/wɒt dʌz ˈmɒmi kʊk fɔː juː ðæt juː lʌv ðə məʊst?/',
        vietnamesePhonetic: 'Uót đát-z Móm-mi cúc pho du đét du láv đơ mâu-s-t?',
        vietnamese: 'Mẹ nấu món gì cho con ăn mà con thích mê nhất nào?',
        purpose: 'Kết nối chủ đề gia đình với những trải nghiệm gần gũi ấm áp',
        tip: 'Mở rộng từ vựng đồ ăn: soup (canh/súp), porridge (cháo), cake (bánh).'
      },
      {
        id: 'tf-3',
        english: 'Let\'s make a paper flower card and write "I love you" to bring home!',
        phonetic: '/lɛts meɪk ə ˈpeɪpə ˈflaʊə kɑːd ænd raɪt aɪ lʌv juː tuː brɪŋ həʊm!/',
        vietnamesePhonetic: 'Lét-s mêik ơ pêi-pơ ph-lao-ơ các-đ en rait ai láv du tu b-rinh hâu-m!',
        vietnamese: 'Chúng mình cùng làm tấm thiệp hoa giấy và ghi chữ "I love you" mang về tặng bố mẹ nhé!',
        purpose: 'Chỉ dẫn hoạt động tạo hình tri ân gia đình',
        tip: 'Cho trẻ dán dấu vân tay hình trái tim lên thiệp.'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Bao, tell me about your family. Do you have a baby brother or sister?', phonetic: '/baʊ, tɛl miː əˈbaʊt jɔː ˈfæmɪli/', vietnamese: 'Bảo ơi, kể cho cô nghe về gia đình con nào. Con có em trai hay em gái không?' },
      { speaker: 'Children', english: 'I have a baby sister! Her name is Bông. She is small and cute!', phonetic: '/aɪ hæv ə ˈbeɪbi ˈsɪstər!/', vietnamese: 'Con có em gái ạ! Tên em là Bông. Em bé tí và dễ thương lắm cô!' },
      { speaker: 'Teacher', english: 'Oh how lovely! Do you help Mommy take care of baby Bông?', phonetic: '/əʊ haʊ ˈlʌvli! duː juː hɛlp ˈmɒmi teɪk keər/', vietnamese: 'Ôi đáng yêu quá! Con có giúp mẹ chăm sóc em Bông không?' },
      { speaker: 'Children', english: 'Yes! I hold her milk bottle!', phonetic: '/jɛs! aɪ həʊld hɜː mɪlk ˈbɒtl!/', vietnamese: 'Dạ có ạ! Con cầm bình sữa cho em bú đấy cô!' }
    ],
    vocabulary: [
      {
        word: 'Home-school bond',
        phonetic: '/həʊm skuːl bɒnd/',
        vietnamesePhonetic: 'Hâu-m s-cu-ồ bon-đ',
        meaning: 'Sự gắn kết phối hợp chặt chẽ giữa gia đình và nhà trường',
        pronunciationCaution: 'Từ "bond" có âm đuôi /nd/ rõ ràng, không nuốt âm.',
        classroomExample: 'A strong home-school bond nurtures a happy child.'
      },
      {
        word: 'Extended family',
        phonetic: '/ɪkˈstɛndɪd ˈfæmɪli/',
        vietnamesePhonetic: 'Ích-s-ten-địt phe-mi-li',
        meaning: 'Đại gia đình nhiều thế hệ (ông bà, cô chú, bác, anh chị em họ)',
        pronunciationCaution: 'Trọng âm từ "extended" rơi vào vần 2: ex-TEN-ded.',
        classroomExample: 'Many children in Vietnam live happily with extended families.'
      },
      {
        word: 'Gratitude',
        phonetic: '/ˈɡrætɪtjuːd/',
        vietnamesePhonetic: 'G-ra-ti-tiu-đ',
        meaning: 'Lòng biết ơn sâu sắc đối với sự chăm sóc của cha mẹ',
        pronunciationCaution: 'Âm đầu /ɡr/, kết thúc bằng âm /d/.',
        classroomExample: 'We teach children gratitude through daily kind words.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Family Role-Play Corner" (Góc đóng vai gia đình)',
        howToPlay: 'Cô phân vai: Bố đi làm về, Mẹ nấu bếp, Bé quét nhà. Cô dùng khẩu lệnh tiếng Anh để kích hoạt các tình huống giao tiếp ấm áp.',
        teacherCommands: [
          'Knock, knock! Daddy is home! Let\'s say: Welcome home, Daddy!',
          'Dinner is ready! Help Mommy set the cups and spoons!',
          'Time to sleep, kiss Mommy good night!'
        ]
      },
      pedagogicalTip: 'Tôn trọng sự đa dạng hoàn cảnh gia đình của trẻ (có trẻ sống với ông bà, có trẻ bố mẹ đi công tác xa). Luôn dùng ngôn từ bao trùm: "The people who love and care for you at home".',
      homeConnection: {
        english: 'Dear parents, please ask your child about the "Family Tree" drawing we made today; they practiced introducing each family member with so much love!',
        vietnamese: 'Kính gửi phụ huynh, tối nay bố mẹ hãy hỏi bé về bức tranh Cây gia đình hôm nay con vẽ nhé, bé đã tập giới thiệu từng thành viên với bao tình yêu thương!',
        context: 'Thông báo trên nhóm Zalo/App của lớp học.'
      }
    },
    scenarioQuiz: {
      situation: 'Vào giờ trả trẻ, một phụ huynh người nước ngoài (hoặc phụ huynh có nhu cầu giao tiếp tiếng Anh) đến đón con và hỏi cô giáo: "How was Lucy\'s day today?"',
      question: 'Cô nên trả lời bằng câu tiếng Anh nào vừa thân thiện, chi tiết vừa chuyên nghiệp?',
      options: [
        'She okay.',
        'Lucy had a fantastic day! She ate all her lunch, participated enthusiastically in our family song, and shared toys with friends.',
        'Lucy was crying all morning, she is too stubborn.'
      ],
      correctIndex: 1,
      explanation: 'Câu trả lời chi tiết, tích cực và nêu rõ các hoạt động cụ thể (ăn trưa, hát, chia sẻ đồ chơi) thể hiện sự tận tâm và năng lực sư phạm song ngữ chuẩn mực của cô.'
    }
  },

  // -------------------------------------------------------------
  // 4. NGHỀ NGHIỆP & CỘNG ĐỒNG (JOBS & COMMUNITY HELPERS)
  // -------------------------------------------------------------
  {
    id: 'teacher-jobs',
    categoryKey: 'jobs',
    title: 'Nghề nghiệp & Những người giúp đỡ cộng đồng',
    englishTitle: 'Community Helpers & Future Dreams',
    icon: '👩‍⚕️',
    accentColor: 'from-amber-500 to-orange-500',
    badge: 'Chủ đề 4 • Ước mơ tương lai & Cộng đồng',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Cung cấp vốn từ vựng và câu dẫn sư phạm giúp cô tổ chức các góc chơi nhập vai (bác sĩ khám bệnh, lính cứu hỏa dũng cảm, chú cảnh sát giao thông, đầu bếp nhí), khơi dậy ước mơ và lòng biết ơn các nghề nghiệp trong xã hội.',
    warmupScript: {
      english: 'Attention, heroic friends! When the alarm rings "Wee-woo, wee-woo!", who comes to save the day? The brave firefighter! Who wears a white coat and checks our heartbeat? The kind doctor! Who do you want to be when you grow up?',
      phonetic: '/əˈtɛnʃn, hɪˈrəʊɪk frɛndz! wɛn ði əˈlɑːm rɪŋz/',
      vietnamesePhonetic: 'Ơ-ten-shừn, hi-râu-ích fren-d-z! Uen đi ơ-lam rinh-z "Ui-uu, ui-uu!", hu căm-z tu sêi-v đơ đêi? Đơ b-rêi-v phai-ơ-phai-tơ! Hu ue-ơ-z ơ uait câu-t en tréc-s ao-ơ hát-bít? Đơ kain đác-tơ! Hu du du uon tu bi uen du g-râu áp?',
      vietnamese: 'Cả lớp chú ý nào những người hùng nhỏ! Khi còi báo động vang lên "Ò e, ò e!", ai sẽ đến giải cứu mọi người? Chú lính cứu hỏa dũng cảm! Ai mặc áo trắng và nghe nhịp tim cho chúng mình? Bác sĩ hiền lành! Khi lớn lên con muốn trở thành ai nào?',
      gestureGuide: 'Cô mô tả tiếng còi hú "Wee-woo", giả vờ cầm vòi nước cứu hỏa, đeo ống nghe bác sĩ và nhìn quanh lớp với ánh mắt khích lệ đầy hào hứng.'
    },
    teacherPrompts: [
      {
        id: 'tj-1',
        english: 'Put on your firefighter helmet! Climb the ladder and spray the water: Pshhh!',
        phonetic: '/pʊt ɒn jɔː ˈfaɪəfaɪtə ˈhɛlmɪt! klaɪm ðə ˈlædər ænd spreɪ ðə ˈwɔːtər/',
        vietnamesePhonetic: 'Pút on do phai-ơ-phai-tơ heo-mịt! C-laim đơ le-đơ en s-p-rêi đơ uó-tơ: P-s-s-s!',
        vietnamese: 'Đội mũ bảo hộ cứu hỏa vào nào! Trèo lên thang và xịt nước dập lửa: Xùuuuu!',
        purpose: 'Khẩu lệnh nhập vai góc chơi vận động lính cứu hỏa',
        tip: 'Cho trẻ cầm ống giấy cuộn làm vòi xịt nước mô phỏng.'
      },
      {
        id: 'tj-2',
        english: 'Doctor Mai, please take your stethoscope and listen to teddy bear\'s heart: Thump-thump, thump-thump!',
        phonetic: '/ˈdɒktə maɪ, pliːz teɪk jɔː ˈstɛθəskəʊp ænd ˈlɪsn tuː ˈtɛdi beəz hɑːt/',
        vietnamesePhonetic: 'Đác-tơ Mai, pli-z têik do s-te-thơ-s-câu-p en lít-sừn tu té-đi be-ơ-z hát: Thăm-p thăm-p, thăm-p thăm-p!',
        vietnamese: 'Bác sĩ Mai ơi, hãy lấy ống nghe và lắng nghe nhịp tim của bạn gấu bông nào: Thình thịch, thình thịch!',
        purpose: 'Dẫn dắt góc bác sĩ mầm non',
        tip: 'Khích lệ trẻ nói câu chẩn đoán: "Teddy, eat more vegetables and rest well!".'
      },
      {
        id: 'tj-3',
        english: 'Chef Long, what delicious soup are you cooking for our restaurant today?',
        phonetic: '/ʃɛf lɒŋ, wɒt dɪˈlɪʃəs suːp ɑː juː ˈkʊkɪŋ fɔːr ˈaʊə ˈrɛstrɒnt tuːˈdeɪ?/',
        vietnamesePhonetic: 'Sép-ph Long, uót đi-lít-shơ-s súp a du cúc-kinh pho ao-ơ rét-s-tơ-ron tu-đêi?',
        vietnamese: 'Đầu bếp Long ơi, hôm nay con nấu món súp thơm ngon gì cho nhà hàng của chúng mình thế?',
        purpose: 'Gợi mở tương tác ngôn ngữ ở góc đóng vai đầu bếp',
        tip: 'Từ "chef" phát âm là /ʃef/ (như âm sh), không đọc thành "chép".'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Officer Huy, what should we do when the traffic light turns red?', phonetic: '/ˈɒfɪsə hwiː, wɒt ʃʊd wiː duː wɛn ðə ˈtræfɪk laɪt tɜːnz rɛd?/', vietnamese: 'Chú cảnh sát giao thông Huy ơi, khi đèn giao thông chuyển sang màu đỏ thì chúng mình phải làm gì?' },
      { speaker: 'Children', english: 'Stop! Everybody stop! Wait for green light!', phonetic: '/stɒp! ˈɛvrɪbɒdi stɒp! weɪt fɔː ɡriːn laɪt!/', vietnamese: 'Dừng lại ạ! Tất cả mọi người dừng lại! Chờ đèn xanh mới được đi ạ!' },
      { speaker: 'Teacher', english: 'Excellent safety instruction, Officer Huy! Give me five!', phonetic: '/ˈɛksələnt ˈseɪfti ɪnˈstrʌkʃn! ɡɪv miː faɪv!/', vietnamese: 'Chỉ dẫn an toàn rất xuất sắc, chú cảnh sát Huy! Đập tay nào!' }
    ],
    vocabulary: [
      {
        word: 'Community helper',
        phonetic: '/kəˈmjuːnəti ˈhɛlpər/',
        vietnamesePhonetic: 'Cơ-miu-nơ-ti heo-pơ',
        meaning: 'Người lao động phục vụ và giúp đỡ cộng đồng (bác sĩ, công an, lao công...)',
        pronunciationCaution: 'Trọng âm từ "community" rơi vào vần 2: com-MU-ni-ty.',
        classroomExample: 'We appreciate all the community helpers who keep us safe.'
      },
      {
        word: 'Stethoscope',
        phonetic: '/ˈstɛθəskəʊp/',
        vietnamesePhonetic: 'S-tét-thơ-s-câu-p',
        meaning: 'Ống nghe của bác sĩ',
        pronunciationCaution: 'Có âm /θ/ kẹp lưỡi giữa hai hàm răng, đuôi kết thúc bằng /p/.',
        classroomExample: 'The doctor uses a stethoscope to check your chest.'
      },
      {
        word: 'Brave',
        phonetic: '/breɪv/',
        vietnamesePhonetic: 'B-rêi-v',
        meaning: 'Dũng cảm, can đảm',
        pronunciationCaution: 'Âm nguyên âm đôi /eɪ/ và âm đuôi /v/ rung môi dưới.',
        classroomExample: 'Firefighters are brave men and women.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Guess My Job!" (Đố cô đoán con làm nghề gì nào)',
        howToPlay: 'Một bé hoặc một nhóm bé làm động tác câm (Pantomime) không nói tiếng Việt: làm động tác lái máy bay, gõ búa, nướng bánh. Cả lớp quan sát và đoán: "Are you a pilot? Are you a chef?".',
        teacherCommands: [
          'Watch carefully! What is he doing? Flying high?',
          'Who can guess his dream job? Raise your hand!',
          'Yes! He is a soaring airplane pilot!'
        ]
      },
      pedagogicalTip: 'Không gán định kiến giới tính vào nghề nghiệp (ví dụ không bảo con trai làm kỹ sư, con gái làm y tá). Hãy khích lệ: "Girls and boys can be awesome astronauts, doctors, and artists!".',
      homeConnection: {
        english: 'Today the children wore costumes of community helpers and practiced speaking with confidence about their dream careers!',
        vietnamese: 'Hôm nay các con đã hóa trang thành các cô chú công nhân viên cộng đồng và tự tin thuyết trình về ước mơ tương lai của mình đấy ạ!',
        context: 'Đăng bản tin ảnh lớp học.'
      }
    },
    scenarioQuiz: {
      situation: 'Trong góc bác sĩ, một bé nhút nhát đứng nhìn các bạn chơi mà không dám tham gia.',
      question: 'Cô giáo nên dùng câu tiếng Anh nào để nhẹ nhàng kết nối bé vào góc chơi?',
      options: [
        'Why are you so shy? Go in there right now!',
        'Hello little patient! Doctor Linh has an open clinic, let\'s go visit her together for a quick check-up!',
        'Stay there if you do not want to play.'
      ],
      correctIndex: 1,
      explanation: 'Cô nhập vai làm người đồng hành ("let\'s go visit her together") và trao cho bé một vai trò an toàn (làm bệnh nhân đáng yêu) để xóa tan tâm lý e ngại ban đầu.'
    }
  },

  // -------------------------------------------------------------
  // 5. MÙA XUÂN, NGÀY TẾT & LỄ HỘI (SPRING & TET HOLIDAY)
  // -------------------------------------------------------------
  {
    id: 'teacher-spring',
    categoryKey: 'spring',
    title: 'Mùa xuân, Ngày Tết & Lễ hội truyền thống',
    englishTitle: 'Spring Celebrations & Tet Festival Traditions',
    icon: '🌸',
    accentColor: 'from-emerald-500 to-teal-600',
    badge: 'Chủ đề 5 • Sắc xuân & Văn hóa lễ hội',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Cung cấp hệ thống từ vựng và lời dẫn song ngữ để cô giáo tổ chức Lễ hội Mùa xuân, Ngày hội Tết cổ truyền, hội chợ quê mầm non, hướng dẫn trẻ chúc Tết ông bà cha mẹ bằng tiếng Anh chuẩn xác.',
    warmupScript: {
      english: 'Happy New Year, my darling pupils! Spring has arrived with sweet warm sunshine, pink peach blossoms, and golden yellow apricots! Look at the colorful red envelopes in my basket. Who wants to receive lucky money with cheerful wishes?',
      phonetic: '/ˈhæpi njuː jɪər, maɪ ˈdɑːlɪŋ ˈpjuːplz! sprɪŋ hæz əˈraɪvd/',
      vietnamesePhonetic: 'Hép-pi Niu Di-ơ, mai đa-linh piu-pồ-z! S-p-rinh hét-z ơ-rai-v-đ uýt suýt uo-m săn-sain, phinh-k pít-ch b-lót-sừm-z, en gô-l-đần dé-lâu áp-ri-cọt-s! Lúc át đơ cớ-lơ-phu đỏt en-vơ-lâu-p-s in mai ba-s-kịt. Hu uon-t-s tu ri-si-v lác-ki mán-ni uýt tri-ơ-phu uýt-shịt-z?',
      vietnamese: 'Chúc mừng năm mới các học trò thân yêu của cô! Mùa xuân đã về với ánh nắng ấm áp chan hòa, hoa đào hồng thắm và hoa mai vàng rực rỡ! Hãy nhìn những phong bao lì xì đỏ trong giỏ của cô này. Bạn nào muốn nhận phong bao may mắn cùng những lời chúc tốt lành nào?',
      gestureGuide: 'Cô cầm nhánh hoa đào nhỏ và giơ chiếc bao lì xì đỏ may mắn, chắp hai tay trước ngực làm điệu bộ chúc mừng năm mới.'
    },
    teacherPrompts: [
      {
        id: 'tsp-1',
        english: 'Bow your head, clasp your hands, and say: Wishing you good health and longevity, Grandpa and Grandma!',
        phonetic: '/baʊ jɔː hɛd, klɑːsp jɔː hændz, ænd seɪ/',
        vietnamesePhonetic: 'Bao do hét-đ, c-lát-s-p do hen-d-z, en sêi: Uýt-shinh du gút heo-th en lon-dép-vơ-ti, G-ren-pa en G-ren-ma!',
        vietnamese: 'Khoanh tay cúi đầu cung kính và nói: Kính chúc ông bà dồi dào sức khỏe và sống lâu trăm tuổi ạ!',
        purpose: 'Dạy lễ nghi chúc Tết truyền thống bằng tiếng Anh',
        tip: 'Cho trẻ thực hành từng cụm: "Good health" (sức khỏe tốt) và "Happy New Year" (năm mới vui vẻ).'
      },
      {
        id: 'tsp-2',
        english: 'Let\'s wrap our square sticky rice cake: Green dong leaves, sticky rice, green beans, and pork in the center!',
        phonetic: '/lɛts ræp ˈaʊə skweə ˈstɪki raɪs keɪk: ɡriːn dɒŋ liːvz/',
        vietnamesePhonetic: 'Lét-s rép ao-ơ s-que s-tíc-ki rait-s cêik: G-rin dong li-v-z, s-tíc-ki rait-s, g-rin bin-z, en póc in đơ sen-tơ!',
        vietnamese: 'Chúng mình cùng gói bánh chưng vuông nào: Lá dong xanh mướt, gạo nếp dẻo thơm, đỗ xanh bùi bùi và thịt lợn ở chính giữa nhé!',
        purpose: 'Hoạt động trải nghiệm gói bánh chưng ngày Tết',
        tip: 'Dùng từ "Square sticky rice cake" hoặc gọi tên riêng "Banh Chung" để giữ gìn bản sắc Việt Nam.'
      },
      {
        id: 'tsp-3',
        english: 'Red brings good luck, gold brings wealth! Let\'s hang lucky charms on our apricot tree!',
        phonetic: '/rɛd brɪŋz ɡʊd lʌk, ɡəʊld brɪŋz wɛlθ!/',
        vietnamesePhonetic: 'Rét-đ b-rinh-z gút lác, gô-l-đ b-rinh-z ueo-th! Lét-s heng lác-ki tram-z on ao-ơ áp-ri-cọt tri!',
        vietnamese: 'Màu đỏ mang lại may mắn, màu vàng mang lại thịnh vượng! Hãy cùng treo dây may mắn lên cành mai vàng nào!',
        purpose: 'Hoạt động trang trí cây hoa mùa xuân trong lớp học',
        tip: 'Khích lệ trẻ vừa treo vừa nói: "Good luck! Good luck!".'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Chi, when you receive lucky money from elders, what magic words do you say?', phonetic: '/tʃiː, wɛn juː rɪˈsiːv ˈlʌki ˈmʌni/', vietnamese: 'Chi ơi, khi nhận được phong bao lì xì từ người lớn, con sẽ nói câu thần chú lễ phép nào?' },
      { speaker: 'Children', english: 'I take it with both hands and say: Thank you! Happy New Year!', phonetic: '/aɪ teɪk ɪt wɪð bəʊθ hændz ænd seɪ/', vietnamese: 'Dạ con nhận bằng hai tay và nói: Con cảm ơn ạ! Chúc mừng năm mới!' },
      { speaker: 'Teacher', english: 'You are so polite and well-mannered! Happy Tet, sweet girl!', phonetic: '/juː ɑː səʊ pəˈlaɪt ænd wɛl ˈmænəd!/', vietnamese: 'Con thật là ngoan ngoãn và lễ phép! Chúc con đón Tết thật vui nhé cô bé đáng yêu!' }
    ],
    vocabulary: [
      {
        word: 'Peach blossom',
        phonetic: '/piːtʃ ˈblɒsəm/',
        vietnamesePhonetic: 'Pít-ch b-lót-sừm',
        meaning: 'Hoa đào ngày Tết miền Bắc',
        pronunciationCaution: 'Từ "peach" có âm /tʃ/ bật hơi ở đuôi, tránh phát âm nhầm sang từ khác.',
        classroomExample: 'Pink peach blossoms announce that Tet is here.'
      },
      {
        word: 'Apricot blossom',
        phonetic: '/ˈeɪprɪkɒt ˈblɒsəm/',
        vietnamesePhonetic: 'Êi-p-ri-cọt b-lót-sừm',
        meaning: 'Hoa mai vàng ngày Tết miền Nam',
        pronunciationCaution: 'Âm đầu là /eɪ/ như trong từ "day", không đọc là "a-p-ri-cọt".',
        classroomExample: 'Golden apricot blossoms shine brightly under the sun.'
      },
      {
        word: 'Red envelope',
        phonetic: '/rɛd ˈɛnvələʊp/',
        vietnamesePhonetic: 'Rét-đ en-vơ-lâu-p',
        meaning: 'Bao lì xì đỏ may mắn',
        pronunciationCaution: 'Âm đuôi từ envelope là /p/ mím môi.',
        classroomExample: 'Children receive red envelopes filled with heartfelt blessings.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Spring Lion Dance" (Múa Lân mừng xuân)',
        howToPlay: 'Hai bé chui dưới tấm vải lụa đỏ làm chú Lân. Cô đánh trống "Tùng tùng cheng!". Khi tiếng trống dồn dập, chú Lân nhảy cao đón nhận câu đối đỏ.',
        teacherCommands: [
          'Drum is beating: Tung-tung-cheng! Wake up, brave Lion!',
          'Jump high and catch the lucky cabbage!',
          'Bow three times to wish our school a prosperous year!'
        ]
      },
      pedagogicalTip: 'Tết là dịp tuyệt vời để giáo dục nét đẹp văn hóa truyền thống kết hợp tiếng Anh. Dạy trẻ nhận phong bao bằng cả hai tay (both hands) và không mở bao lì xì trước mặt khách.',
      homeConnection: {
        english: 'Our classroom is sparkling with Tet spirit! The children learned how to say Happy New Year and bow politely to elders in bilingual dialogue.',
        vietnamese: 'Lớp học của chúng con đang ngập tràn không khí Tết! Các con đã học cách nói lời chúc mừng năm mới và cúi đầu lễ phép nhận lì xì bằng tiếng Anh rất đáng yêu!',
        context: 'Gửi video chúc Tết của lớp lên bảng tin phụ huynh.'
      }
    },
    scenarioQuiz: {
      situation: 'Trong ngày hội Tết, một bé 3 tuổi khi nhận lì xì của cô liền vội vàng giật lấy bằng một tay và xé bao lì xì ra ngay tại chỗ.',
      question: 'Cô giáo nên xử lý tình huống sư phạm này như thế nào bằng lời nói dịu dàng?',
      options: [
        'Take the envelope back and shout: You are so greedy and impolite!',
        'Gently hold the child\'s hands, smile, and say: Sweetheart, remember our two gentle hands? Let\'s take it with both hands and put it safely into our pocket to give to Mommy later.',
        'Ignore it because the child is only 3 years old.'
      ],
      correctIndex: 1,
      explanation: 'Uốn nắn trẻ mầm non bằng cách cầm tay làm mẫu nhẹ nhàng ("two gentle hands") và hướng dẫn cất bao lì xì vào túi giúp trẻ hình thành thói quen văn minh mà không cảm thấy xấu hổ trước bạn bè.'
    }
  },

  // -------------------------------------------------------------
  // 6. THẾ GIỚI THỰC VẬT & CÂY HOA (PLANTS & NATURE)
  // -------------------------------------------------------------
  {
    id: 'teacher-plants',
    categoryKey: 'plants',
    title: 'Thế giới Thực vật, Cây xanh & Hoa lá',
    englishTitle: 'Plants, Botany Discovery & Eco-Care',
    icon: '🌿',
    accentColor: 'from-green-500 to-emerald-600',
    badge: 'Chủ đề 6 • Khám phá thực vật & Môi trường xanh',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Nâng cao kỹ năng dẫn dắt các giờ khám phá khoa học về cây cối: vòng đời của hạt mầm, các bộ phận của cây (rễ, thân, lá, hoa, quả), chăm sóc vườn trường mầm non và giáo dục tình yêu thiên nhiên.',
    warmupScript: {
      english: 'Good morning, little green gardeners! Put on your straw hats and pick up your watering cans! Look at this tiny magic seed in my palm. What will happen if we plant it in rich soil, give it warm sunshine, and water it with love?',
      phonetic: '/ɡʊd ˈmɔːnɪŋ, ˈlɪtl ɡriːn ˈɡɑːdnəz!/',
      vietnamesePhonetic: 'Gút mo-ninh, lít-tồ g-rin ga-đơ-nơ-z! Pút on do s-tro hét-s en píc áp do uó-tơ-rinh khen-z! Lúc át đít-s tai-ni mé-dích si-đ in mai pam. Uót uil hép-pừn ít-ph ui p-lan-t ít in rít-ch sôi-ồ, gi-v ít uo-m săn-sain, en uó-tơ ít uýt láv?',
      vietnamese: 'Chào buổi sáng các bác làm vườn tí hon! Hãy đội mũ cói và xách những chiếc bình tưới nhỏ xinh lên nào! Nhìn hạt mầm kỳ diệu bé xíu trong lòng bàn tay cô này. Điều gì sẽ xảy ra nếu chúng mình gieo hạt xuống đất xốp, cho hạt tắm nắng ấm và tưới hạt bằng tình yêu thương?',
      gestureGuide: 'Cô làm động tác xới đất, đặt hạt mầm vào đất và làm điệu bộ hạt mầm từ từ nhú mầm vươn cao đón ánh nắng.'
    },
    teacherPrompts: [
      {
        id: 'tpt-1',
        english: 'Roots drink water under the ground, stem stands tall, leaves catch the sunshine!',
        phonetic: '/ruːts drɪŋk ˈwɔːtər ˈʌndə ðə ɡraʊnd, stɛm stændz tɔːl/',
        vietnamesePhonetic: 'Rút-s đ-rinh-k uó-tơ ăn-đơ đơ g-raon-đ, s-tem s-ten-d-z to-l, li-v-z két-ch đơ săn-sain!',
        vietnamese: 'Rễ cây hút nước ngầm dưới lòng đất, thân cây vươn thẳng đứng, lá cây đón ánh nắng mặt trời!',
        purpose: 'Khắc sâu chức năng các bộ phận của cây qua vần điệu',
        tip: 'Cho trẻ giậm chân làm rễ, đứng thẳng người làm thân và xòe hai tay làm lá.'
      },
      {
        id: 'tpt-2',
        english: 'Pour water gently, drip-drop-drip. Do not drown the baby plant!',
        phonetic: '/pɔː ˈwɔːtə ˈdʒɛntli, drɪp drɒp drɪp/',
        vietnamesePhonetic: 'Po uó-tơ den-t-li, đ-ríp đ-róp đ-ríp. Đu not đ-raon đơ bêi-bi p-lan-t!',
        vietnamese: 'Tưới nước nhẹ nhàng thôi nào con, tí tách tí tách. Không tưới ngập úng cây mầm non nhé!',
        purpose: 'Hướng dẫn kỹ năng chăm sóc cây ngoài sân vườn',
        tip: 'Khẩu lệnh "drip-drop-drip" rèn luyện sự khéo léo của bàn tay trẻ.'
      },
      {
        id: 'tpt-3',
        english: 'We smell the flower, we admire its petals, but we do not pluck it, sweetheart.',
        phonetic: '/wiː smɛl ðə ˈflaʊə, wiː ədˈmaɪər ɪts ˈpɛtlz, bʌt wiː duː nɒt plʌk ɪt/',
        vietnamesePhonetic: 'Ui s-meo đơ ph-lao-ơ, ui ợt-mai-ơ ít-s pé-tồ-z, bát ui đu not p-lác ít, suýt-hát.',
        vietnamese: 'Chúng mình ngửi hương hoa thơm, ngắm những cánh hoa xinh, nhưng không ngắt hoa bẻ cành con nhé.',
        purpose: 'Giáo dục ý thức bảo vệ cây cối và môi trường sống',
        tip: 'Gợi ý trẻ làm động tác thơm nhẹ lên bông hoa trên cành.'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Khoa, what color are the sunflower petals?', phonetic: '/kwaː, wɒt ˈkʌlər ɑː ðə ˈsʌnflaʊə ˈpɛtlz?/', vietnamese: 'Khoa ơi, những cánh hoa hướng dương này màu gì thế con?' },
      { speaker: 'Children', english: 'They are yellow like the sun, teacher!', phonetic: '/ðeɪ ɑː ˈjɛləʊ laɪk ðə sʌn!/', vietnamese: 'Dạ cánh hoa màu vàng óng như mặt trời cô ạ!' },
      { speaker: 'Teacher', english: 'Brilliant observation! And the stem is green and strong, reaching for the sky!', phonetic: '/ˈbrɪljənt ˌɒbzəˈveɪʃn! ænd ðə stɛm ɪz ɡriːn/', vietnamese: 'Quan sát rất tuyệt vời! Và thân cây màu xanh khỏe khoắn đang vươn cao lên bầu trời!' }
    ],
    vocabulary: [
      {
        word: 'Sprout',
        phonetic: '/spraʊt/',
        vietnamesePhonetic: 'S-p-rao-t',
        meaning: 'Hạt nảy mầm, mầm non mới nhú',
        pronunciationCaution: 'Có cụm phụ âm /spr/ liền mạch, kết thúc bằng âm bật /t/.',
        classroomExample: 'Look, our bean seed has a tiny green sprout today!'
      },
      {
        word: 'Photosynthesis',
        phonetic: '/ˌfəʊtəʊˈsɪnθəsɪs/',
        vietnamesePhonetic: 'Phâu-tâu-xin-thơ-xịt-s',
        meaning: 'Quang hợp (thuật ngữ khoa học cô nắm để giải thích giản dị cho trẻ)',
        pronunciationCaution: 'Trọng âm chính ở /sɪn/, có âm /θ/ kẹp lưỡi.',
        classroomExample: 'Leaves use sunshine to make green food for the plant.'
      },
      {
        word: 'Seedling',
        phonetic: '/ˈsiːdlɪŋ/',
        vietnamesePhonetic: 'Si-đ-linh',
        meaning: 'Cây con, cây giống non',
        pronunciationCaution: 'Âm /iː/ kéo dài, âm đuôi /lɪŋ/ phát âm nhẹ nhàng.',
        classroomExample: 'Each child took care of their own tomato seedling.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi vận động mô phỏng "From Seed to Tree" (Từ hạt mầm thành cây lớn)',
        howToPlay: 'Cô hô khẩu lệnh và các bé cùng hóa thân: Trẻ ngồi thụp xuống cuộn tròn (Seed) -> Nước tưới, mầm nhú lên (Sprout) -> Từ từ đứng dậy vươn 2 tay (Tall Tree) -> Xòe ngón tay nở hoa (Blooming Flower).',
        teacherCommands: [
          'Curl up small, you are a tiny seed sleeping in the soil.',
          'Here comes gentle rain! Pitter-patter! Start to sprout!',
          'Stand tall! Spread your branches to the warm sunshine!',
          'Open your fingers: Blossom into gorgeous flowers!'
        ]
      },
      pedagogicalTip: 'Cho trẻ tự tay chăm sóc một cốc cây gieo mầm riêng có dán ảnh của trẻ. Mỗi ngày cô dành 3 phút hướng dẫn trẻ đo độ cao cây bằng tiếng Anh: "Look, my plant is one centimeter taller!".',
      homeConnection: {
        english: 'Today the children planted mung bean seeds! Please ask your child to show you how a seed sprouts using their hands and bilingual words.',
        vietnamese: 'Hôm nay các con đã tự tay gieo những hạt đỗ xanh nhỏ! Bố mẹ hãy nhờ bé làm điệu bộ mô tả hạt đỗ nảy mầm bằng tiếng Anh cho cả nhà xem nhé!',
        context: 'Gửi ảnh hoạt động gieo hạt của lớp.'
      }
    },
    scenarioQuiz: {
      situation: 'Trong giờ dạo chơi ngoài trời, một bé nghịch ngợm giật đứt một nhánh cây hoa hồng của trường mầm non.',
      question: 'Cô giáo nên giáo dục bé bằng phương pháp tích cực với câu tiếng Anh nào?',
      options: [
        'You are a destructive child! Sit on the bench for 30 minutes!',
        'Oh, look at the poor branch. Plants are living friends that feel hurt when broken. Let\'s place it in a cup of water and say sorry to the tree.',
        'Break another branch if you like flowers.'
      ],
      correctIndex: 1,
      explanation: 'Giáo dục lòng trắc ẩn với thiên nhiên ("Plants are living friends that feel hurt") và hướng dẫn hành động khắc phục (cắm nhánh gãy vào nước) giúp trẻ hiểu và không bao giờ tái phạm.'
    }
  },

  // -------------------------------------------------------------
  // 7. PHƯƠNG TIỆN GIAO THÔNG & AN TOÀN (VEHICLES & TRAFFIC)
  // -------------------------------------------------------------
  {
    id: 'teacher-vehicles',
    categoryKey: 'vehicles',
    title: 'Phương tiện giao thông & An toàn đường bộ',
    englishTitle: 'Transportation & Traffic Safety Education',
    icon: '🚗',
    accentColor: 'from-orange-500 to-red-500',
    badge: 'Chủ đề 7 • Giao thông & Kỹ năng an toàn',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Cung cấp phương pháp sư phạm tổ chức các hoạt động tìm hiểu phương tiện đường bộ, đường thủy, đường hàng không, mô phỏng luật giao thông và rèn luyện kỹ năng đội mũ bảo hiểm, qua đường an toàn.',
    warmupScript: {
      english: 'Honk honk! Beep beep! Choo choo! Fasten your seatbelts, passengers! The Kindergarten Bus is rolling out of the station. Where shall we travel today? To the blue ocean by boat, or into the cloudy sky by airplane?',
      phonetic: '/hɒŋk hɒŋk! biːp biːp! tʃuː tʃuː! ˈfɑːsn jɔː ˈsiːtbɛlts, ˈpæsɪndʒəz!/',
      vietnamesePhonetic: 'Hon-k hon-k! Bíp bíp! Tru tru! Pha-sừn do sít-beo-t-s, pa-xừn-dơ-z! Đơ Kin-đơ-ga-tần Bát-s iz râu-linh ao-t óv đơ s-têi-shừn. Ue-ơ seo ui tré-vồ tu-đêi? Tu đơ b-lu ô-shừn bai bâu-t, o in-tu đơ c-lao-đi s-cai bai e-ơ-p-lêin?',
      vietnamese: 'Bim bim! Kính coong! Xình xịch! Thắt chặt dây an toàn nào các hành khách nhí! Chuyến xe buýt mầm non đang lăn bánh rời bến rồi. Hôm nay chúng mình muốn đi du lịch đến đâu nào? Ra biển xanh bao la bằng tàu thủy, hay bay vút lên bầu trời đầy mây bằng máy bay?',
      gestureGuide: 'Cô làm động tác hai tay cầm vô lăng lái xe buýt, bấm còi "beep beep" và làm cánh máy bay liệng qua liệng lại.'
    },
    teacherPrompts: [
      {
        id: 'tv-1',
        english: 'Red light says: STOP! Yellow light says: WAIT! Green light says: GO!',
        phonetic: '/rɛd laɪt sɛz stɒp! ˈjɛləʊ laɪt sɛz weɪt! ɡriːn laɪt sɛz ɡəʊ!/',
        vietnamesePhonetic: 'Rét-đ lait sét-z: S-TÓP! Dé-lâu lait sét-z: UÊIT! G-rin lait sét-z: GÔU!',
        vietnamese: 'Đèn đỏ báo hiệu: DỪNG LẠI! Đèn vàng báo hiệu: CHỜ ĐỢI! Đèn xanh báo hiệu: ĐI TIẾP!',
        purpose: 'Khẩu lệnh chuẩn xác cho trò chơi đèn tín hiệu giao thông',
        tip: 'Giơ 3 hình tròn màu Đỏ - Vàng - Xanh cho trẻ phản xạ tức thì.'
      },
      {
        id: 'tv-2',
        english: 'Click your helmet strap securely before riding the motorbike with Daddy!',
        phonetic: '/klɪk jɔː ˈhɛlmɪt stræp sɪˈkjʊəli bɪˈfɔː ˈraɪdɪŋ ðə ˈməʊtəbaɪk/',
        vietnamesePhonetic: 'C-líc do heo-mịt s-t-rép si-kiu-ơ-li bi-pho rai-đinh đơ mâu-tơ-baik uýt Đé-đi!',
        vietnamese: 'Cài quai mũ bảo hiểm thật chắc chắn "Tách!" trước khi ngồi lên xe máy cùng bố nhé con!',
        purpose: 'Dạy kỹ năng đội mũ bảo hiểm bắt buộc',
        tip: 'Phát âm mô phỏng tiếng khóa cài "Click!" tạo ấn tượng sâu sắc cho trẻ.'
      },
      {
        id: 'tv-3',
        english: 'Hold hands with an adult and walk on the white pedestrian stripes!',
        phonetic: '/həʊld hændz wɪð ən ˈædʌlt ænd wɔːk ɒn ðə waɪt pəˈdɛstrɪən straɪps/',
        vietnamesePhonetic: 'Hâu-l-đ hen-d-z uýt ừn é-đát en uốc on đơ uait pơ-đét-s-t-ri-ừn s-t-raip-s!',
        vietnamese: 'Nắm chặt tay người lớn và đi đúng trên vạch trắng qua đường dành cho người đi bộ!',
        purpose: 'Kỹ năng qua đường an toàn cho trẻ mầm non',
        tip: 'Vừa đi vừa giơ một tay lên cao để báo hiệu cho các phương tiện trên đường.'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Minh, look at the big airplane! Does it travel on the road, on the water, or in the air?', phonetic: '/mɪn, lʊk æt ðə bɪɡ ˈeəpleɪn!/', vietnamese: 'Minh ơi, nhìn chiếc máy bay khổng lồ kìa! Máy bay di chuyển trên đường bộ, trên mặt nước hay trên bầu trời?' },
      { speaker: 'Children', english: 'In the air! High in the clouds, teacher!', phonetic: '/ɪn ði eər! haɪ ɪn ðə klaʊdz!/', vietnamese: 'Trên bầu trời ạ! Tít trên những đám mây cô ơi!' },
      { speaker: 'Teacher', english: 'Superstar! Airplanes fly high in the air carrying people across oceans!', phonetic: '/ˈsuːpəstɑːr! ˈeəpleɪnz flaɪ haɪ ɪn ði eər/', vietnamese: 'Con giỏi lắm! Máy bay bay vút trên bầu trời chở mọi người qua những đại dương bao la!' }
    ],
    vocabulary: [
      {
        word: 'Pedestrian crossing',
        phonetic: '/pəˈdɛstrɪən ˈkrɒsɪŋ/',
        vietnamesePhonetic: 'Pơ-đét-s-t-ri-ừn c-rót-sinh',
        meaning: 'Lối đi vạch vôi trắng qua đường dành cho người đi bộ',
        pronunciationCaution: 'Từ "pedestrian" nhấn âm 2 /dɛs/, không đọc là "pe-đét-tri-an".',
        classroomExample: 'Always cross the street at the pedestrian crossing.'
      },
      {
        word: 'Seatbelt',
        phonetic: '/ˈsiːtbɛlt/',
        vietnamesePhonetic: 'Sít-beo-t',
        meaning: 'Dây đai an toàn trên ô tô, máy bay',
        pronunciationCaution: 'Âm /t/ ở giữa nối liền với /b/, kết thúc bằng /lt/.',
        classroomExample: 'Fasten your seatbelt before the car starts moving.'
      },
      {
        word: 'Traffic light',
        phonetic: '/ˈtræfɪk laɪt/',
        vietnamesePhonetic: 'T-ré-phíc lait',
        meaning: 'Đèn tín hiệu giao thông',
        pronunciationCaution: 'Lưu ý âm /tr/ bật đầu lưỡi, không đọc thành "tơ-ra-phích".',
        classroomExample: 'Green traffic light means it is safe to proceed.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Traffic Light Simulator" (Mô phỏng ngã tư đường phố)',
        howToPlay: 'Cô làm cảnh sát chỉ huy giao thông cầm 3 biển đèn màu. Các bé đóng vai xe buýt, xe đạp, ô tô con. Cô giơ biển màu nào, trẻ phải hô to từ vựng tiếng Anh tương ứng và thực hiện động tác.',
        teacherCommands: [
          'Red light! Freeze your car: Screeech!',
          'Yellow light! Slow down, idle your engine: Vroom-vroom...',
          'Green light! Drive safely on your lane: Beep-beep!'
        ]
      },
      pedagogicalTip: 'Tích hợp sa bàn giao thông mini trong lớp với các mô hình xe đồ chơi để trẻ phân loại: Đường bộ (Land), Đường thủy (Water), Đường hàng không (Air).',
      homeConnection: {
        english: 'Today the children practiced traffic safety rhymes and learned why clicking their motorcycle helmet is so important!',
        vietnamese: 'Hôm nay các con đã học luật giao thông qua các bài vần điệu vui nhộn và hiểu vì sao luôn phải cài quai mũ bảo hiểm cẩn thận khi đi xe máy cùng bố mẹ!',
        context: 'Thông báo trên kênh liên lạc phụ huynh.'
      }
    },
    scenarioQuiz: {
      situation: 'Trẻ đang chơi trò lái xe buýt trong lớp và một số bé chạy quá nhanh suýt đâm vào các bạn đang đọc sách ở góc thư viện.',
      question: 'Cô nên dùng câu khẩu lệnh nào vừa dừng xe an toàn vừa mang tính sư phạm dí dỏm?',
      options: [
        'Get off the bus now! You have zero points!',
        'Red light! Red light! Step on the brakes: Screeech! This is a quiet reading zone, let us switch to gentle walking mode.',
        'Crash into the bookshelf if you dare!'
      ],
      correctIndex: 1,
      explanation: 'Sử dụng hiệu lệnh theo đúng kịch bản trò chơi ("Red light! Step on the brakes!") giúp trẻ tự giác phanh lại vui vẻ và hiểu ngay nội quy lớp học mà không bị ức chế.'
    }
  },

  // -------------------------------------------------------------
  // 8. MÀU SẮC & NGHỆ THUẬT TẠO HÌNH (COLORS & ARTS)
  // -------------------------------------------------------------
  {
    id: 'teacher-colors',
    categoryKey: 'colors',
    title: 'Màu sắc, Hình khối & Nghệ thuật tạo hình',
    englishTitle: 'Colors, Geometric Shapes & Creative Expression',
    icon: '🎨',
    accentColor: 'from-purple-500 to-pink-500',
    badge: 'Chủ đề 8 • Sáng tạo nghệ thuật & Màu sắc',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Cung cấp ngôn ngữ sư phạm tổ chức các tiết tạo hình mỹ thuật: pha màu kỳ diệu (color mixing), nhận biết hình học, hướng dẫn sử dụng cọ vẽ, màu nước, giấy xé dán và khen ngợi sự sáng tạo của trẻ.',
    warmupScript: {
      english: 'Welcome to our magical art studio, little Picassos! Look at my painting palette. We have red, yellow, and blue — the three powerful primary colors! If we mix red and yellow together, what magical surprise color will appear? Let\'s discover!',
      phonetic: '/ˈwɛlkəm tuː ˈaʊə ˈmædʒɪkl ɑːt ˈstjuːdɪəʊ, ˈlɪtl pɪˈkæsəʊz!/',
      vietnamesePhonetic: 'Oen-căm tu ao-ơ mé-dích-cồ át s-tiu-đi-âu, lít-tồ Pi-cát-sâu-z! Lúc át mai pêin-tinh pá-lịt. Ui hét-v rét-đ, dé-lâu, en b-lu — đơ th-ri pao-ơ-phu p-rai-mơ-ri cớ-lơ-z! Ít-ph ui míc-s rét-đ en dé-lâu tu-gé-đơ, uót mé-dích-cồ sơ-p-raiz cớ-lơ uil ơ-pi-ơ? Lét-s đít-s-cá-vơ!',
      vietnamese: 'Chào mừng các họa sĩ Picasso nhí đến với xưởng vẽ diệu kỳ! Nhìn vào bảng pha màu của cô này. Chúng mình có đỏ, vàng và xanh dương — ba màu cơ bản quyền năng! Nếu chúng mình trộn màu đỏ với màu vàng, điều kỳ diệu gì sẽ xuất hiện nhỉ? Cùng khám phá nào!',
      gestureGuide: 'Cô cầm khay pha màu, chấm hai giọt màu đỏ và vàng rồi quấy tròn cho trẻ thấy sự biến đổi thành màu cam rực rỡ.'
    },
    teacherPrompts: [
      {
        id: 'tc-1',
        english: 'Dip your brush into the water, dab it gently on the sponge, then pick up the color!',
        phonetic: '/dɪp jɔː brʌʃ ˈɪntuː ðə ˈwɔːtər, dæb ɪt ˈdʒɛntli ɒn ðə spʌndʒ/',
        vietnamesePhonetic: 'Đíp do b-rát-sh in-tu đơ uó-tơ, đép ít den-t-li on đơ s-păn-d, đen píc áp đơ cớ-lơ!',
        vietnamese: 'Nhúng nhẹ đầu cọ vào nước, chấm nhẹ lên miếng mút cho ráo, rồi mới lấy màu vẽ nhé con!',
        purpose: 'Hướng dẫn kỹ thuật dùng màu nước chuẩn xác cho trẻ',
        tip: 'Vừa nói vừa làm mẫu từng bước giúp trẻ giữ bàn vẽ luôn sạch sẽ.'
      },
      {
        id: 'tc-2',
        english: 'Look! Blue plus yellow creates magical GREEN! Like the leaves on our trees!',
        phonetic: '/lʊk! bluː plʌs ˈjɛləʊ kriˈeɪts ˈmædʒɪkl ɡriːn!/',
        vietnamesePhonetic: 'Lúc! B-lu p-lát-s dé-lâu c-ri-êit-s mé-dích-cồ G-RIN! Laik đơ li-v-z on ao-ơ tri-z!',
        vietnamese: 'Nhìn này! Màu xanh dương cộng với màu vàng tạo ra màu XANH LÁ CÂY kỳ diệu! Giống hệt những chiếc lá trên cây của chúng mình!',
        purpose: 'Khắc sâu kiến thức pha màu mỹ thuật',
        tip: 'Khích lệ trẻ đồng thanh hô vang: "Blue and yellow make green!".'
      },
      {
        id: 'tc-3',
        english: 'What a creative pattern! I love the way you used bright sunshine colors in your artwork!',
        phonetic: '/wɒt ə kriˈeɪtɪv ˈpætən! aɪ lʌv ðə weɪ juː juːzd braɪt ˈsʌnʃaɪn ˈkʌləz/',
        vietnamesePhonetic: 'Uót ơ c-ri-êi-tív pét-tơn! Ai láv đơ uêi du du-z-đ b-rait săn-sain cớ-lơ-z in do át-uớc!',
        vietnamese: 'Thật là một họa tiết sáng tạo! Cô rất thích cách con kết hợp những gam màu rực rỡ như ánh nắng trong tác phẩm của mình!',
        purpose: 'Khen ngợi tư duy thẩm mỹ và tính độc đáo của trẻ',
        tip: 'Khen cụ thể vào chi tiết tranh thay vì chỉ nói "Good" chung chung.'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Lan, can you find the circle and square shapes in your collage?', phonetic: '/læn, kæn juː faɪnd ðə ˈsɜːkl ænd skweə ʃeɪps?/', vietnamese: 'Lan ơi, con có tìm thấy hình tròn và hình vuông trong bức tranh xé dán của mình không?' },
      { speaker: 'Children', english: 'The red sun is a circle, and the blue house is a square!', phonetic: '/ðə rɛd sʌn ɪz ə ˈsɜːkl, ænd ðə bluː haʊs ɪz ə skweə!/', vietnamese: 'Ông mặt trời đỏ là hình tròn, còn ngôi nhà xanh là hình vuông ạ!' },
      { speaker: 'Teacher', english: 'Fantastic geometric recognition! And the roof is a red triangle! Perfect!', phonetic: '/fænˈtæstɪk ˌdʒiːəˈmɛtrɪk ˌrɛkəɡˈnɪʃn!/', vietnamese: 'Nhận biết hình học tuyệt vời quá! Và mái nhà là hình tam giác màu đỏ! Thật hoàn hảo!' }
    ],
    vocabulary: [
      {
        word: 'Primary colors',
        phonetic: '/ˈpraɪməri ˈkʌləz/',
        vietnamesePhonetic: 'P-rai-mơ-ri cớ-lơ-z',
        meaning: 'Màu gốc / Màu bậc một (Đỏ, Vàng, Xanh dương)',
        pronunciationCaution: 'Trọng âm từ "primary" ở âm 1 /praɪ/.',
        classroomExample: 'We can mix primary colors to make secondary colors.'
      },
      {
        word: 'Palette',
        phonetic: '/ˈpælət/',
        vietnamesePhonetic: 'Pé-lịt',
        meaning: 'Bảng pha màu vẽ',
        pronunciationCaution: 'Âm đầu /p/ bật hơi, không đọc nhầm thành "pa-lét".',
        classroomExample: 'Squeeze a drop of yellow paint onto your palette.'
      },
      {
        word: 'Collage',
        phonetic: '/ˈkɒlɑːʒ/',
        vietnamesePhonetic: 'Cô-la-zh',
        meaning: 'Nghệ thuật xé dán, ghép tranh',
        pronunciationCaution: 'Âm đuôi là /ʒ/ như âm j trong tiếng Pháp.',
        classroomExample: 'Today we make an ocean collage using torn colored paper.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Color Detective" (Thám tử săn tìm màu sắc)',
        howToPlay: 'Cô giơ một thẻ màu lên và hô: "Color detectives, find me something PURPLE in our room in 5 seconds! 5, 4, 3, 2, 1!". Trẻ chạy quanh lớp và chạm tay vào đồ vật có màu tím.',
        teacherCommands: [
          'Color detectives, freeze and listen!',
          'Find something shiny yellow like a banana!',
          'Touch it gently and shout the color name: YELLOW!'
        ]
      },
      pedagogicalTip: 'Không bao giờ chê tranh của trẻ vẽ "không giống mẫu". Trong giáo dục mầm non hiện đại, nét vẽ tự do và cách phối màu là biểu hiện của thế giới nội tâm phong phú của trẻ.',
      homeConnection: {
        english: 'Today our little artists explored color mixing: how blue and yellow blend into green! Check out their vibrant paintings on display!',
        vietnamese: 'Hôm nay các họa sĩ nhí đã khám phá nghệ thuật pha màu kỳ diệu: màu xanh dương và vàng hòa quyện thành xanh lá! Mời bố mẹ chiêm ngưỡng các tác phẩm được trưng bày tại sảnh lớp!',
        context: 'Gửi thiệp tranh của trẻ về nhà.'
      }
    },
    scenarioQuiz: {
      situation: 'Trong giờ vẽ, một bé vô tình làm đổ một vệt màu đen to tướng đè lên bức tranh cầu vồng vừa vẽ xong và bé bắt đầu mếu máo sắp khóc.',
      question: 'Cô giáo nên dùng tư duy sư phạm sáng tạo nào bằng tiếng Anh để biến lỗi sai thành niềm vui?',
      options: [
        'You ruined your painting! Throw it in the trash and start over.',
        'Don\'t cry, sweetie! Look at this black spot! It looks just like a cute little magic bird sitting on your rainbow! Let us add two wings and a beak!',
        'Leave it there and sit outside.'
      ],
      correctIndex: 1,
      explanation: 'Biến "vết lem" thành chi tiết sáng tạo mới ("a cute little magic bird") giúp trẻ rèn luyện khả năng thích ứng linh hoạt (growth mindset) và không sợ phạm sai lầm.'
    }
  },

  // -------------------------------------------------------------
  // 9. ĐỘNG VẬT MUÔN LOÀI & THIÊN NHIÊN (ANIMALS & WILDLIFE)
  // -------------------------------------------------------------
  {
    id: 'teacher-animals',
    categoryKey: 'animals',
    title: 'Động vật muôn loài & Thế giới tự nhiên',
    englishTitle: 'Animal Kingdom, Habitats & Wildlife Empathy',
    icon: '🦁',
    accentColor: 'from-amber-600 to-yellow-600',
    badge: 'Chủ đề 9 • Thế giới động vật & Tình yêu muôn thú',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Hệ thống bài giảng và phương pháp giúp cô tổ chức giờ học về thế giới động vật: thú cưng gia đình, động vật rừng xanh, thế giới đại dương, mô phỏng tiếng kêu và dáng đi của con vật, giáo dục sự đồng cảm và bảo vệ động vật.',
    warmupScript: {
      english: 'Shh! Walk on your tiptoes, little explorers! We are stepping into the deep green rainforest! Listen closely... What sound was that? Roaaar! Is that the mighty King Lion, or a friendly little monkey swinging in the trees? Let\'s find out together!',
      phonetic: '/ʃ! wɔːk ɒn jɔː ˈtɪptəʊz, ˈlɪtl ɪkˈsplɔːrəz!/',
      vietnamesePhonetic: 'S-s-s! Uốc on do típ-tâu-z, lít-tồ ích-s-p-lo-rơ-z! Ui a s-tép-pinh in-tu đơ đíp g-rin rêin-pho-rít-s-t! Lít-sừn c-lâu-s-li... Uót saon uót đét? Rô-a-r! Iz đét đơ mai-ti Kinh Lai-ừn, o ơ ph-ren-d-li lít-tồ mán-ki s-uinh-inh in đơ tri-z? Lét-s fain ao-t tu-gé-đơ!',
      vietnamese: 'Suỵt! Nhón nhẹ gót chân nào các nhà thám hiểm tí hon! Chúng mình đang bước vào khu rừng nhiệt đới xanh thẳm đây! Lắng nghe thật kỹ nào... Tiếng gì vừa vang lên thế? Gầm gừừừ! Đó là chúa sơn lâm Sư tử dũng mãnh, hay chú khỉ con tinh nghịch đang đu cành cây? Chúng mình cùng khám phá nhé!',
      gestureGuide: 'Cô đặt một ngón tay lên môi làm dấu yên lặng, nhón gót chân, khum tay lên tai làm động tác lắng nghe và giơ hai tay mô phỏng móng vuốt sư tử.'
    },
    teacherPrompts: [
      {
        id: 'ta-1',
        english: 'Can you waddle like a duck and say "Quack, quack, quack"?',
        phonetic: '/kæn juː ˈwɒdl laɪk ə dʌk ænd seɪ kwæk kwæk kwæk?/',
        vietnamesePhonetic: 'Khen du uát-đồ laik ơ đác en sêi: Quéc, quéc, quéc?',
        vietnamese: 'Các con có thể đi lạch bạch như chú vịt con và kêu "Quác, quác, quác" được không nào?',
        purpose: 'Vận động mô phỏng dáng đi con vật (TPR Animal Movement)',
        tip: 'Hai tay gập lại làm cánh vịt vẫy nhẹ sang hai bên.'
      },
      {
        id: 'ta-2',
        english: 'Look at the elephant! What a long trunk! It uses its trunk to drink water: Slurp!',
        phonetic: '/lʊk æt ði ˈɛlɪfənt! wɒt ə lɒŋ trʌŋk!/',
        vietnamesePhonetic: 'Lúc át đi é-li-phừn-t! Uót ơ lonh t-răng-k! Ít du-zịt-s ít-s t-răng-k tu đ-rinh-k uó-tơ: S-lớp!',
        vietnamese: 'Nhìn bạn voi kìa! Chiếc vòi dài thật là dài! Bạn voi dùng vòi hút nước mát: Xùyppp!',
        purpose: 'Giới thiệu đặc điểm cơ thể động vật',
        tip: 'Cho một cánh tay uốn cong từ mũi vươn dài ra phía trước làm vòi voi.'
      },
      {
        id: 'ta-3',
        english: 'Puppies and kittens love gentle strokes on their fur. We love and protect all animals!',
        phonetic: '/ˈpʌpiz ænd ˈkɪtnz lʌv ˈdʒɛntl strəʊks ɒn ðeə fɜː/',
        vietnamesePhonetic: 'Páp-pi-z en cít-tần-z láv den-t-ồ s-t-râu-k-s on đe-ơ phơ. Ui láv en p-rơ-téc-t o-l é-ni-mồ-z!',
        vietnamese: 'Cún con và mèo con rất thích được vuốt ve nhẹ nhàng trên bộ lông mềm. Chúng mình luôn yêu thương và bảo vệ muôn loài nhé!',
        purpose: 'Giáo dục lòng nhân ái và bảo vệ động vật',
        tip: 'Cho trẻ vuốt ve chú thú bông với ánh mắt trìu mến.'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Who can tell me: Where does the dolphin live? In the forest or in the ocean?', phonetic: '/huː kæn tɛl miː: weə dʌz ðə ˈdɒlfɪn lɪv?/', vietnamese: 'Ai cho cô biết nào: Bạn cá heo sống ở đâu? Trong rừng hay ở đại dương?' },
      { speaker: 'Children', english: 'In the deep ocean! It jumps over the waves, splash!', phonetic: '/ɪn ðə diːp ˈəʊʃn! ɪt dʒʌmps ˈəʊvə ðə weɪvz!/', vietnamese: 'Ở đại dương sâu ạ! Bạn cá heo nhảy trên những con sóng, ùm!' },
      { speaker: 'Teacher', english: 'Exactly right! Dolphins are wonderful marine animals and very friendly to humans!', phonetic: '/ɪɡˈzæktli raɪt! ˈdɒlfɪnz ɑː ˈwʌndəfl məˈriːn ˈænɪmlz/', vietnamese: 'Chính xác luôn! Cá heo là loài động vật biển tuyệt vời và rất thân thiện với con người!' }
    ],
    vocabulary: [
      {
        word: 'Habitat',
        phonetic: '/ˈhæbɪtæt/',
        vietnamesePhonetic: 'Hé-bi-tét',
        meaning: 'Môi trường sống tự nhiên của động vật',
        pronunciationCaution: 'Trọng âm ở âm 1 /hæb/, kết thúc bằng /t/.',
        classroomExample: 'The ocean is the natural habitat of whales and dolphins.'
      },
      {
        word: 'Carnivore & Herbivore',
        phonetic: '/ˈkɑːnɪvɔː / ˈhɜːbɪvɔː/',
        vietnamesePhonetic: 'Ca-ni-vo / Hơ-bi-vo',
        meaning: 'Động vật ăn thịt & Động vật ăn thực vật (cô nắm kiến thức chuẩn)',
        pronunciationCaution: 'Âm /vɔː/ tròn môi kéo dài.',
        classroomExample: 'Lions are carnivores, while giraffes and rabbits are herbivores.'
      },
      {
        word: 'Nocturnal',
        phonetic: '/nɒkˈtɜːnl/',
        vietnamesePhonetic: 'Nóc-tơn-nồ',
        meaning: 'Động vật hoạt động về đêm (như cú mèo owl, dơi bat)',
        pronunciationCaution: 'Trọng âm ở vần 2: noc-TUR-nal.',
        classroomExample: 'The owl is a nocturnal animal that hunts at night.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Old MacDonald\'s Animal Freeze" (Nông trại vui nhộn)',
        howToPlay: 'Cô bật bài hát "Old MacDonald Had a Farm". Khi cô giơ hình con bò: cả lớp bò 4 chân và kêu "Moo moo". Khi cô giơ hình chú ếch: cả lớp nhảy ếch "Ribbit ribbit". Khi nhạc dừng: tất cả đứng tượng.',
        teacherCommands: [
          'Gallop like a horse: Clip-clop, clip-clop!',
          'Slither like a green snake on the grass: Sssss!',
          'Freeze like a sleeping puppy!'
        ]
      },
      pedagogicalTip: 'Phát âm chuẩn tiếng kêu của con vật trong tiếng Anh khác tiếng Việt: Chó sủa tiếng Anh là "Woof woof" hoặc "Bark", Mèo kêu "Meow", Vịt kêu "Quack", Lợn kêu "Oink oink", Gà trống gáy "Cock-a-doodle-doo".',
      homeConnection: {
        english: 'Today the children mimicked farm animals and learned English animal sounds! Ask your little explorer how a dog, cat, and cow speak English!',
        vietnamese: 'Hôm nay các con đã đóng vai các bạn thú nông trại và học tiếng kêu tiếng Anh siêu chuẩn! Bố mẹ hãy hỏi xem chú cún, chú mèo và chú bò kêu tiếng Anh như thế nào nhé!',
        context: 'Gửi bảng từ vựng song ngữ tiếng kêu động vật.'
      }
    },
    scenarioQuiz: {
      situation: 'Khi học về chủ đề động vật hoang dã, một bé nói: "Cô ơi, con ghét con rắn lắm, con muốn giết hết rắn đi!".',
      question: 'Cô giáo mầm non nên định hướng nhận thức bảo vệ thiên nhiên bằng câu tiếng Anh nào?',
      options: [
        'Yes, snakes are very evil, let us kill them.',
        'I understand you feel scared because snakes can bite, but each animal has an important job in Mother Nature\'s home. We stay safe by not touching them, but we let them live peacefully in the wild.',
        'You are a bad boy for saying that.'
      ],
      correctIndex: 1,
      explanation: 'Thấu hiểu cảm xúc sợ hãi của trẻ ("I understand you feel scared") đồng thời giải thích vai trò của muôn loài trong hệ sinh thái ("each animal has an important job in Mother Nature") là bài học đạo đức sinh thái tuyệt vời.'
    }
  },

  // -------------------------------------------------------------
  // 10. DINH DƯỠNG MẦM NON & VUI CHƠI (NUTRITION & FREE PLAY)
  // -------------------------------------------------------------
  {
    id: 'teacher-nutrition',
    categoryKey: 'nutrition',
    title: 'Dinh dưỡng mầm non, Giờ ăn & Vui chơi góc',
    englishTitle: 'Healthy Nutrition, Table Manners & Cooperative Play',
    icon: '🍎',
    accentColor: 'from-rose-500 to-amber-500',
    badge: 'Chủ đề 10 • Sức khỏe dinh dưỡng & Chia sẻ vui chơi',
    targetAges: 'Dành cho giáo viên dạy trẻ 3 - 6 tuổi',
    overview: 'Cung cấp hệ thống khẩu lệnh và giao tiếp sư phạm trong giờ ăn trưa mầm non, rèn luyện văn hóa bàn ăn (table manners), khuyến khích trẻ ăn rau củ, uống đủ nước và kỹ năng chia sẻ đồ chơi trong giờ chơi tự do.',
    warmupScript: {
      english: 'Ding-dong! It is healthy tummy time, little heroes! Look at our colorful lunch tray: green crunchy veggies for sharp eyesight, bright red tomatoes for a strong heart, and steaming rice for boundless energy! Let us wash our hands clean and say our blessing together!',
      phonetic: '/dɪŋ dɒŋ! ɪt ɪz ˈhɛlθi ˈtʌmi taɪm, ˈlɪtl ˈhɪərəʊz!/',
      vietnamesePhonetic: 'Đinh-đong! Ít iz heo-thi tám-mi taim, lít-tồ hi-râu-z! Lúc át ao-ơ cớ-lơ-phu lăn-ch t-rêi: G-rin c-răn-tri vét-d-di-z pho sáp ai-sait, b-rait rét-đ tơ-ma-tâu-z pho ơ s-t-ronh hát, en s-ti-minh rait-s pho baon-lịt-s é-nơ-di! Lét át-s uót-sh ao-ơ hen-d-z c-lin en sêi ao-ơ b-lét-s-sinh tu-gé-đơ!',
      vietnamese: 'Kính coong! Đến giờ nạp năng lượng cho những chiếc bụng tốt bụng rồi các người hùng nhí! Nhìn khay cơm trưa nhiều màu sắc của chúng mình này: rau xanh giòn rụm cho đôi mắt sáng ngời, cà chua đỏ mọng cho trái tim khỏe mạnh, và cơm trắng thơm dẻo cho năng lượng dồi dào! Cùng rửa tay sạch và mời cơm nào!',
      gestureGuide: 'Cô làm động tác xoa bụng tròn vo, giơ khay cơm thơm phức và chắp hai tay mời cơm thật lễ phép.'
    },
    teacherPrompts: [
      {
        id: 'tn-1',
        english: 'Chew with your mouth closed, and hold your spoon with gentle fingers, please.',
        phonetic: '/tʃuː wɪð jɔː maʊθ kləʊzd, ænd həʊld jɔː spuːn/',
        vietnamesePhonetic: 'Tru uýt do maoth c-lâu-z-đ, en hâu-l-đ do s-pun uýt den-t-ồ phinh-gơ-z, pli-z.',
        vietnamese: 'Nhai ngậm miệng lịch sự, và cầm thìa gọn gàng bằng những ngón tay xinh nhé con.',
        purpose: 'Rèn luyện văn hóa bàn ăn chuẩn mực mầm non',
        tip: 'Khích lệ trẻ ăn từ tốn, không ngậm thức ăn, không vừa ăn vừa nói.'
      },
      {
        id: 'tn-2',
        english: 'Broccoli gives you dinosaur strength! One little bite for teacher, munch-munch-munch!',
        phonetic: '/ˈbrɒkəli ɡɪvz juː ˈdaɪnəsɔː strɛŋθ!/',
        vietnamesePhonetic: 'B-ró-cơ-li gi-v-z du đai-nơ-so s-t-reng-th! Uăn lít-tồ bait pho tí-chơ, măn-ch măn-ch măn-ch!',
        vietnamese: 'Súp lơ xanh mang lại sức mạnh phi thường như khủng long đấy! Cắn một miếng nhỏ cho cô xem nào, nhai giòn rụm rụm rụm!',
        purpose: 'Động viên trẻ lười ăn rau xanh hào hứng ăn hết suất',
        tip: 'Tạo hình mẫu siêu anh hùng hoặc khủng long giúp trẻ vượt qua tâm lý sợ mùi rau.'
      },
      {
        id: 'tn-3',
        english: 'Sharing is caring! Say: "May I play with this truck after you finish, Nam?"',
        phonetic: '/ˈʃeərɪŋ ɪz ˈkeərɪŋ! meɪ aɪ pleɪ wɪð ðɪs trʌk/',
        vietnamesePhonetic: 'Se-ơ-rinh iz ce-ơ-rinh! Mêi ai p-lêi uýt đít-s t-rác áp-tơ du phi-nít-sh, Nam?',
        vietnamese: 'Chia sẻ là yêu thương! Con hãy nói: "Nam ơi, sau khi bạn chơi xong chiếc xe tải này, cho mình chơi cùng với nhé?"',
        purpose: 'Dạy kỹ năng thương lượng và chia sẻ đồ chơi bằng tiếng Anh',
        tip: 'Dạy trẻ nói lời xin phép lịch sự thay vì giật đồ chơi trên tay bạn.'
      }
    ],
    dialogue: [
      { speaker: 'Teacher', english: 'Minh, are you full? You finished all your colorful vegetables! High five!', phonetic: '/mɪn, ɑː juː fʊl? juː ˈfɪnɪʃt ɔːl jɔː ˈkʌləfl ˈvɛdʒtəblz!/', vietnamese: 'Minh ơi, con đã no bụng chưa? Con đã ăn hết sạch rau củ nhiều màu sắc rồi kìa! Đập tay nào!' },
      { speaker: 'Children', english: 'Yes, teacher! My tummy is happy and strong!', phonetic: '/jɛs ˈtiːtʃər! maɪ ˈtʌmi ɪz ˈhæpi ænd strɒŋ!/', vietnamese: 'Dạ rồi thưa cô! Bụng của con đang rất vui và khỏe mạnh ạ!' },
      { speaker: 'Teacher', english: 'Now please drink a cup of fresh water, wipe your mouth, and get ready for a sweet nap!', phonetic: '/naʊ pliːz drɪŋk ə kʌp ɒv frɛʃ ˈwɔːtər/', vietnamese: 'Bây giờ con hãy uống một cốc nước mát, lau miệng sạch sẽ và chuẩn bị cho giấc ngủ trưa êm đềm nhé!' }
    ],
    vocabulary: [
      {
        word: 'Nutritious',
        phonetic: '/njuːˈtrɪʃəs/',
        vietnamesePhonetic: 'Niu-t-rít-shơ-s',
        meaning: 'Bổ dưỡng, giàu chất dinh dưỡng',
        pronunciationCaution: 'Trọng âm rơi vào âm 2 /trɪʃ/.',
        classroomExample: 'Vegetables and fruits are very nutritious for growing children.'
      },
      {
        word: 'Table manners',
        phonetic: '/ˈteɪbl ˈmænəz/',
        vietnamesePhonetic: 'Têi-bồ me-nơ-z',
        meaning: 'Phép lịch sự và văn hóa trên bàn ăn',
        pronunciationCaution: 'Từ "manners" có âm số nhiều /z/ ở đuôi.',
        classroomExample: 'We practice good table manners at every meal.'
      },
      {
        word: 'Cooperative play',
        phonetic: '/kəʊˈɒpərətɪv pleɪ/',
        vietnamesePhonetic: 'Câu-ó-pơ-rơ-tív p-lêi',
        meaning: 'Chơi hợp tác, cùng nhau xây dựng và chia sẻ đồ chơi',
        pronunciationCaution: 'Từ "cooperative" nhấn vần 2: co-OP-er-a-tive.',
        classroomExample: 'Cooperative play fosters social skills and lifelong friendships.'
      }
    ],
    teachingStrategies: {
      tprGame: {
        name: 'Trò chơi "Deli Chef & Fruit Market" (Chợ hoa quả dinh dưỡng)',
        howToPlay: 'Các bé đóng vai người bán hàng và khách đi chợ. Khách cầm giỏ và nói: "Two red apples and one green cucumber, please!". Người bán cân đồ và nói: "Here you are! Enjoy your healthy snack!".',
        teacherCommands: [
          'Pick up your shopping basket, smart shoppers!',
          'Ask politely: How much is the juicy orange?',
          'Count the coins and say: Thank you, have a healthy day!'
        ]
      },
      pedagogicalTip: 'Không bao giờ ép trẻ ăn bằng cách dọa nạt ("Ăn đi không cô nhốt vào bóng tối"). Thay vào đó, hãy kích thích sự tò mò vị giác: "Do you hear the carrot crunch in your mouth? Let\'s listen to the crunch sound!".',
      homeConnection: {
        english: 'Today during lunch, all children practiced chewing quietly with closed mouths and enjoyed green veggies like little champions!',
        vietnamese: 'Hôm nay trong giờ ăn trưa, các con đã thực hành nhai ngậm miệng lịch sự và ăn rau xanh thun thút như những nhà vô địch tí hon đấy ạ!',
        context: 'Gửi lời khen tới bố mẹ qua sổ bé ngoan.'
      }
    },
    scenarioQuiz: {
      situation: 'Trong giờ ăn, bé vô tình hắt hơi mạnh làm văng cơm ra bàn và lúng túng nhìn cô giáo.',
      question: 'Cô giáo nên xử lý tình huống sư phạm bằng cử chỉ và câu tiếng Anh nào?',
      options: [
        'Scold the child loudly: You are so disgusting, stand up!',
        'Hand the child a clean napkin with a warm smile and say: It\'s okay, darling! Remember to cover your nose and mouth with your elbow when sneezing, like this: Achoo! Let\'s wipe the table together.',
        'Ignore it and leave the dirty table.'
      ],
      correctIndex: 1,
      explanation: 'Dạy trẻ thói quen che miệng bằng khuỷu tay khi hắt hơi ("cover your mouth with your elbow") và cùng lau bàn sạch sẽ giúp trẻ học kỹ năng vệ sinh một cách tự tin, không sợ hãi.'
    }
  }
];
