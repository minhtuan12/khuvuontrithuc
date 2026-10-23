import {useEffect,useState} from 'react';
import {BookOpen,ChevronLeft,GraduationCap,Inbox,LibraryBig,Sparkles,Users} from 'lucide-react';
import {useTeacherAccess} from '../lib/accountContext';
import {readAssistantMessage} from '../lib/assistantSpeech';
import TeacherWorkshop from '../components/TeacherWorkshop';
import TeacherSelfStudy from '../components/TeacherSelfStudy';
import TeacherConfirm from '../components/TeacherConfirm';
import TeacherLessonLibrary from './TeacherLessonLibrary';
import TeacherStatistics from './TeacherStatistics';
import TeacherQuestions from './TeacherQuestions';
import './teacher-workspace.css';

export type TeacherRoute='home'|'lessons'|'students'|'inbox'|'prepare'|'self-study';
const ROUTES:{id:TeacherRoute;path:string;title:string;description:string;icon:typeof BookOpen;accent:string}[]=[
 {id:'lessons',path:'/giao-vien/giao-an',title:'Kho giáo án',description:'Tìm kiếm, tải Word, soạn mới và quản lý giáo án đã lưu.',icon:LibraryBig,accent:'violet'},
 {id:'students',path:'/giao-vien/hoc-sinh',title:'Tài khoản học sinh',description:'Xem học sinh đã đăng ký và tiến độ học tập được ghi nhận.',icon:Users,accent:'emerald'},
 {id:'inbox',path:'/giao-vien/hop-thu',title:'Hộp thư phụ huynh',description:'Tiếp nhận câu hỏi, ý kiến và phản hồi lại gia đình.',icon:Inbox,accent:'sky'},
 {id:'prepare',path:'/giao-vien/chuan-bi-bai',title:'Chuẩn bị bài',description:'Tạo gợi ý hoạt động phù hợp với nhóm tuổi trước giờ học.',icon:Sparkles,accent:'amber'},
];

export default function TeacherWorkspace({route,onNavigate,onBack,onEnglish}:{route:TeacherRoute;onNavigate:(route:TeacherRoute,path:string)=>void;onBack:()=>void;onEnglish:()=>void}) {
 const allowed=useTeacherAccess();
 const [dirty,setDirty]=useState(false);
 const [next,setNext]=useState<{route:TeacherRoute;path:string}|null>(null);
 useEffect(()=>{document.title=`${route==='home'?'Khu vực cô giáo':ROUTES.find(item=>item.id===route)?.title||'Góc của cô'} | Khu Vườn Tri Thức`;return()=>{document.title='Khu Vườn Tri Thức';};},[route]);
 useEffect(()=>{const revoke=()=>onBack();window.addEventListener('kvtt-teacher-access-revoked',revoke);return()=>window.removeEventListener('kvtt-teacher-access-revoked',revoke);},[onBack]);
 if(!allowed)return null;
 function navigate(value:TeacherRoute,path:string){if(dirty)setNext({route:value,path});else onNavigate(value,path);}
 const active=ROUTES.find(item=>item.id===route);
 return <main className="teacher-workspace tw-page">
  <header className="tw-admin-hero"><div><span className="tw-kicker">KHU VƯỜN TRI THỨC</span><h1>{route==='home'?'Khu vực cô giáo':active?.title||'Góc của cô'}</h1><p>{route==='home'?'Quản lý lớp học, tiếp nhận thông tin và chuẩn bị nội dung trong một không gian riêng dành cho giáo viên.':active?.description}</p></div><div className="tw-hero-mark" aria-hidden="true"><GraduationCap size={42}/></div></header>
  {route==='home'?<>
   <section className="tw-dashboard-grid" aria-label="Các chức năng dành cho giáo viên">{ROUTES.map(({id,path,title,description,icon:Icon,accent})=><button className={`tw-dashboard-card is-${accent}`} key={id} onClick={()=>navigate(id,path)}><span className="tw-dashboard-icon"><Icon size={27}/></span><span><strong>{title}</strong><small>{description}</small></span></button>)}</section>
   <section className="tw-card tw-quick-links"><div><BookOpen size={24}/><span><strong>Công cụ hỗ trợ cô</strong><small>Tiếng Anh lớp học và nội dung tự học vẫn sẵn sàng.</small></span></div><div className="tw-actions"><button onClick={onEnglish}>Tiếng Anh cùng cô</button><button onClick={()=>navigate('self-study','/giao-vien/tu-hoc')}>Cô tự học</button></div></section>
  </>:<>
   <nav className="tw-route-nav" aria-label="Điều hướng khu vực giáo viên"><button onClick={()=>navigate('home','/giao-vien')}><ChevronLeft size={18}/>Tổng quan</button>{ROUTES.map(item=><button key={item.id} aria-current={route===item.id?'page':undefined} onClick={()=>navigate(item.id,item.path)}>{item.title}</button>)}</nav>
   {route==='students'?<TeacherStatistics/>:route==='inbox'?<TeacherQuestions/>:route==='lessons'?<TeacherLessonLibrary onDirtyChange={setDirty}/>:route==='prepare'?<TeacherWorkshop onListen={text=>{void readAssistantMessage(text,true).catch(()=>{});}}/>:<TeacherSelfStudy onListen={text=>{void readAssistantMessage(text,true).catch(()=>{});}}/>}
  </>}
  {next&&<TeacherConfirm title="Rời bản đang sửa?" confirmLabel="Bỏ thay đổi và tiếp tục" onCancel={()=>setNext(null)} onConfirm={()=>{const value=next;setNext(null);setDirty(false);onNavigate(value.route,value.path);}}><p>Thay đổi chưa lưu sẽ bị bỏ.</p></TeacherConfirm>}
 </main>;
}
