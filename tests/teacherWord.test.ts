// @ts-nocheck Bun runner.
import {expect,test} from 'bun:test';
import {validateTeacherWord} from '../server/teacherWordFiles';
import {SqliteTeacherStore,SqliteTeacherFiles} from '../server/sqliteTeacherStore';
import {TeacherService} from '../server/teacherService';
function crc(bytes){let n=0xffffffff;for(const b of bytes){n^=b;for(let j=0;j<8;j++)n=(n>>>1)^((n&1)?0xedb88320:0);}return(n^0xffffffff)>>>0;}
export function docx(extra=[]){
 const entries=[['[Content_Types].xml','<Types><Override ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],['_rels/.rels','<Relationships/>'],['word/document.xml','<w:document xmlns:w="test"><w:body><w:p><w:r><w:t>Bài học màu sắc</w:t></w:r></w:p></w:body></w:document>'],...extra];
 const locals=[],centrals=[];let offset=0;
 for(const [name,text] of entries){const n=Buffer.from(name),b=Buffer.from(text),checksum=crc(b),l=Buffer.alloc(30),c=Buffer.alloc(46);l.writeUInt32LE(0x04034b50);l.writeUInt16LE(20,4);l.writeUInt32LE(checksum,14);l.writeUInt32LE(b.length,18);l.writeUInt32LE(b.length,22);l.writeUInt16LE(n.length,26);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(checksum,16);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);locals.push(l,n,b);centrals.push(c,n);offset+=l.length+n.length+b.length;}
 const central=Buffer.concat(centrals),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,central,end]);
}
test('Word validation checks actual DOCX structure, rejects renamed files, macro and traversal',()=>{
 expect(validateTeacherWord(docx(),'bài.docx').text).toContain('Bài học màu sắc');
 for(const [bytes,name] of [[Buffer.from('%PDF-1.7'),'fake.docx'],[docx(),'fake.pdf'],[docx(),'fake.doc'],[docx([['word/vbaProject.bin','bad']]),'macro.docx'],[docx([['../payload','bad']]),'traversal.docx'],[docx([['word/_rels/document.xml.rels','<Relationship TargetMode="External" Target="https://example.com"/>']]),'external.docx']])expect(()=>validateTeacherWord(bytes,name)).toThrow();
 const corrupted=docx();corrupted[35]^=1;expect(()=>validateTeacherWord(corrupted,'bad.docx')).toThrow();
});
test('legacy DOC must contain an OLE WordDocument stream and table, not just an OLE signature',()=>{
 const bytes=Buffer.alloc(6144);Buffer.from([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]).copy(bytes);
 bytes.writeUInt16LE(3,26);bytes.writeUInt16LE(0xfffe,28);bytes.writeUInt16LE(9,30);bytes.writeUInt16LE(6,32);bytes.writeUInt32LE(1,44);bytes.writeUInt32LE(1,48);bytes.writeUInt32LE(4096,56);bytes.writeUInt32LE(0xfffffffe,60);bytes.writeUInt32LE(0xfffffffe,68);bytes.writeUInt32LE(0,76);for(let i=80;i<512;i+=4)bytes.writeUInt32LE(0xffffffff,i);
 for(let i=0;i<128;i++)bytes.writeUInt32LE(0xffffffff,512+i*4);bytes.writeUInt32LE(0xfffffffd,512);bytes.writeUInt32LE(0xfffffffe,516);for(let i=2;i<9;i++)bytes.writeUInt32LE(i+1,512+i*4);bytes.writeUInt32LE(0xfffffffe,548);bytes.writeUInt32LE(0xfffffffe,552);
 function entry(index,name,type,start,size){const o=1024+index*128;const n=Buffer.from(name+'\0','utf16le');n.copy(bytes,o);bytes.writeUInt16LE(n.length,o+64);bytes[o+66]=type;bytes.writeUInt32LE(start,o+116);bytes.writeUInt32LE(size,o+120);}
 entry(0,'Root Entry',5,0xfffffffe,0);entry(1,'WordDocument',2,2,4096);entry(2,'0Table',2,10,512);bytes.writeUInt16LE(0xa5ec,1536);
 expect(validateTeacherWord(bytes,'lesson.doc')).toEqual({type:'application/msword',text:null});
 const fake=Buffer.from(bytes);fake.writeUInt16LE(0,1536);expect(()=>validateTeacherWord(fake,'fake.doc')).toThrow();
});
test('Word upload finalize preserves private original, extracts content, and deletion revokes download',async()=>{
 const store=new SqliteTeacherStore(':memory:'),files=new SqliteTeacherFiles(':memory:'),service=new TeacherService(store,files);try{const bytes=docx();const ticket=await service.initUpload('teacher-a',{name:'lesson.docx',byteSize:bytes.length,idempotencyKey:'word-e2e-001'});const token=new URL(ticket.uploadUrl,'https://test').searchParams.get('ticket');await expect(service.uploadContent('teacher-b',ticket.uploadId,token,bytes)).rejects.toMatchObject({status:404});await service.uploadContent('teacher-a',ticket.uploadId,token,bytes);const plan=await service.finalizeUpload('teacher-a',ticket.uploadId);expect(plan.content).toContain('Bài học');const detail=await service.lesson('teacher-a',plan.id);expect(detail.files).toHaveLength(1);expect((await service.download('teacher-a',plan.id,detail.files[0].id)).bytes).toEqual(new Uint8Array(bytes));await service.deleteLesson('teacher-a',plan.id,plan.version);await expect(service.download('teacher-a',plan.id,detail.files[0].id)).rejects.toMatchObject({status:404});}finally{store.close();files.close();}
});
test('renamed PDF is rejected before any bytes are stored',async()=>{
 const store=new SqliteTeacherStore(':memory:');let writes=0;const service=new TeacherService(store,{get:async()=>null,put:async()=>{writes++;},delete:async()=>{}});
 try{const bytes=Buffer.from('%PDF-1.7');const ticket=await service.initUpload('teacher-a',{name:'pretend.docx',byteSize:bytes.length,idempotencyKey:'fake-word-upload'});await expect(service.uploadContent('teacher-a',ticket.uploadId,new URL(ticket.uploadUrl,'https://test').searchParams.get('ticket'),bytes)).rejects.toMatchObject({status:415});expect(writes).toBe(0);}finally{store.close();}
});
