import { useState } from 'react';
import { BookOpen, Volume2 } from 'lucide-react';
import { ENGLISH_AGES, getEnglishRoadmap, type EnglishAge } from '../lib/englishCatalog';

interface TeacherSelfStudyProps {
  onListen: (text: string, rate?: number) => void;
}

export default function TeacherSelfStudy({ onListen }: TeacherSelfStudyProps) {
  const [age, setAge] = useState<EnglishAge>('3-4');
  const groups = getEnglishRoadmap(age);
  const [groupId, setGroupId] = useState<string>('all');
  const visibleGroups = groupId === 'all' ? groups : groups.filter(group => group.id === groupId);

  return (
    <section aria-labelledby="teacher-self-study-title" className="space-y-5">
      <div className="rounded-3xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 via-white to-purple-50 p-5 sm:p-7">
        <p className="text-sm font-black text-pink-700">GÓC CÔ TỰ HỌC</p>
        <h3 id="teacher-self-study-title" className="mt-1 text-2xl sm:text-3xl font-black text-slate-800">Hiểu từ trước khi dạy bé</h3>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-700">Chọn độ tuổi và chủ đề bé đang học. Mỗi từ có nghĩa tiếng Việt, phiên âm, cách đọc gần đúng và câu ví dụ lấy trực tiếp từ bài học của bé. Cô có thể nghe lại nhiều lần trước khi lên lớp.</p>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Chọn độ tuổi cho cô tự học">
        {ENGLISH_AGES.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={age === item.id}
            onClick={() => { setAge(item.id); setGroupId('all'); }}
            className={`min-h-11 rounded-2xl border-2 px-4 py-2 font-black focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-pink-500 ${age === item.id ? 'border-pink-600 bg-pink-600 text-white' : 'border-pink-100 bg-white text-slate-700 hover:border-pink-300'}`}
          >
            {item.title} · {item.id} tuổi
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Lọc chủ đề cô tự học">
        <button type="button" aria-pressed={groupId === 'all'} onClick={() => setGroupId('all')} className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold ${groupId === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>Tất cả chủ đề</button>
        {groups.map(group => (
          <button key={group.id} type="button" aria-pressed={groupId === group.id} onClick={() => setGroupId(group.id)} className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold ${groupId === group.id ? 'bg-purple-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
            {group.icon} {group.name}
          </button>
        ))}
      </div>

      {visibleGroups.map(group => (
        <section key={group.id} className="space-y-4" aria-labelledby={`teacher-group-${group.id}`}>
          <h4 id={`teacher-group-${group.id}`} className="flex items-center gap-2 text-xl font-black text-slate-800"><span aria-hidden="true">{group.icon}</span>{group.name}</h4>
          {group.lessons.map(lesson => (
            <article key={lesson.id} className="rounded-3xl border-2 border-pink-100 bg-white p-4 sm:p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">{lesson.icon}</span>
                <div>
                  <h5 className="text-lg font-black text-slate-800">{lesson.name}</h5>
                  <p className="text-sm font-bold text-pink-700">{lesson.englishName}</p>
                  <p className="mt-1 text-sm text-slate-600">{lesson.description}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {lesson.vocabulary.map(word => (
                  <div key={word.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-black text-slate-800"><span aria-hidden="true">{word.emoji} </span>{word.word}</p>
                        <p className="font-bold text-pink-700">{word.meaning}</p>
                      </div>
                      <button type="button" onClick={() => onListen(word.word, 0.8)} aria-label={`Nghe từ ${word.word}`} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-pink-500"><Volume2 size={20} aria-hidden="true" /></button>
                    </div>
                    <p className="mt-2 text-sm text-slate-700"><strong>Phiên âm:</strong> {word.phonetic}</p>
                    {word.vietnamesePronunciation && <p className="text-sm text-slate-700"><strong>Đọc gần đúng:</strong> {word.vietnamesePronunciation} <span className="text-slate-500">(chỉ để tham khảo; nghe mẫu để phát âm)</span></p>}
                    {word.exampleSentence && <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700"><BookOpen size={16} className="mr-1 inline text-pink-600" aria-hidden="true" /><strong>{word.exampleSentence}</strong>{word.exampleMeaning && <p className="mt-1">{word.exampleMeaning}</p>}<button type="button" onClick={() => onListen(word.exampleSentence!)} className="mt-2 min-h-11 rounded-xl bg-pink-100 px-3 py-2 font-bold text-pink-800 hover:bg-pink-200">Nghe câu mẫu</button></div>}
                  </div>
                ))}
              </div>
              {!!lesson.samplePhrases?.length && <div className="mt-4 rounded-2xl bg-purple-50 p-4"><p className="font-black text-purple-800">Câu cô có thể dùng trong lớp</p>{lesson.samplePhrases.map((phrase, index) => <p key={`${lesson.id}-phrase-${index}`} className="mt-2 text-sm text-slate-700"><strong>{phrase.phrase}</strong> · {phrase.vietnamese} <button type="button" onClick={() => onListen(phrase.phrase)} className="ml-2 rounded-full bg-white px-3 py-2 font-bold text-purple-700">Nghe</button></p>)}</div>}
            </article>
          ))}
        </section>
      ))}
    </section>
  );
}
