import {useEffect,useState} from 'react';
import {useTeacherAccess} from '../lib/accountContext';
import {readAssistantMessage} from '../lib/assistantSpeech';
import TeacherWorkshop from '../components/TeacherWorkshop';
import TeacherSelfStudy from '../components/TeacherSelfStudy';
import TeacherConfirm from '../components/TeacherConfirm';
import TeacherLessonLibrary from './TeacherLessonLibrary';
import TeacherStatistics from './TeacherStatistics';
import TeacherQuestions from './TeacherQuestions';
import './teacher-workspace.css';

export default function TeacherWorkspace({onBack,onEnglish}:{onBack:()=>void;onEnglish:()=>void}) {
 const allowed=useTeacherAccess();
 const [tab,setTab]=useState('Tiến độ học tập');
 const [dirty,setDirty]=useState(false);
 const [next,setNext]=useState<string|null>(null);
 useEffect(()=>{const revoke=()=>onBack();window.addEventListener('kvtt-teacher-access-revoked',revoke);return()=>window.removeEventListener('kvtt-teacher-access-revoked',revoke);},[onBack]);
 if(!allowed)return null;
 function navigate(value:string){if(dirty)setNext(value);else if(value==='back')onBack();else if(value==='english')onEnglish();else setTab(value);}
 return <main className="teacher-workspace tw-page"><header className="tw-card"><button onClick={()=>navigate('back')}>← Về khu vườn</button><h1>Góc của cô</h1><p>Cùng theo dõi việc học và chuẩn bị những hoạt động phù hợp cho bé.</p><nav className="tw-actions" aria-label="Khu vực giáo viên">{['Tiến độ học tập','Câu hỏi gửi cô','Kho giáo án','Chuẩn bị bài','Cô tự học'].map(value=><button key={value} aria-pressed={tab===value} onClick={()=>navigate(value)}>{value}</button>)}<button onClick={()=>navigate("english")}>Tiếng Anh cùng cô giáo</button></nav></header>
 {tab==='Tiến độ học tập'?<TeacherStatistics/>:tab==='Câu hỏi gửi cô'?<TeacherQuestions/>:tab==='Kho giáo án'?<TeacherLessonLibrary onDirtyChange={setDirty}/>:tab==='Chuẩn bị bài'?<TeacherWorkshop onListen={text=>{void readAssistantMessage(text,true).catch(()=>{});}}/>:<TeacherSelfStudy onListen={text=>{void readAssistantMessage(text,true).catch(()=>{});}}/>}
 {next&&<TeacherConfirm title="Rời bản đang sửa?" confirmLabel="Bỏ thay đổi và tiếp tục" onCancel={()=>setNext(null)} onConfirm={()=>{const value=next;setNext(null);setDirty(false);if(value==='back')onBack();else if(value==='english')onEnglish();else setTab(value);}}><p>Thay đổi chưa lưu sẽ bị bỏ.</p></TeacherConfirm>}
 </main>;
}
