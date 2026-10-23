import {inflateRawSync} from 'node:zlib';
import {TeacherError,TEACHER_FILE_LIMIT} from './teacherTypes.ts';
const bad=(message='Tệp Word không hợp lệ hoặc chứa thành phần không được hỗ trợ.'):never=>{throw new TeacherError(415,'UNSAFE_WORD_FILE',message);};
const decode=(bytes:Uint8Array)=>new TextDecoder('utf-8',{fatal:true}).decode(bytes);
function crc32(bytes:Uint8Array){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function safeXml(xml:string){if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(xml))bad();return xml;}
function unzipDocx(bytes:Uint8Array){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const u16=(n:number)=>view.getUint16(n,true);const u32=(n:number)=>view.getUint32(n,true);
 if(bytes.length<22||u32(0)!==0x04034b50)bad();let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(u32(i)===0x06054b50){end=i;break;}
 if(end<0||u16(end+4)!==0||u16(end+6)!==0||u16(end+8)!==u16(end+10)||end+22+u16(end+20)!==bytes.length)bad();
 const count=u16(end+10);const centralSize=u32(end+12);let offset=u32(end+16);if(count<3||count>512||offset+centralSize!==end)bad();
 let total=0;const entries=new Map<string,Uint8Array>();const usedRanges:{start:number;end:number}[]=[];
 for(let index=0;index<count;index++){
  if(offset+46>end||u32(offset)!==0x02014b50)bad();const flags=u16(offset+8),method=u16(offset+10),crc=u32(offset+16),compressed=u32(offset+20),size=u32(offset+24),nameLength=u16(offset+28),extraLength=u16(offset+30),commentLength=u16(offset+32),local=u32(offset+42);
  if(offset+46+nameLength+extraLength+commentLength>end||compressed===0xffffffff||size===0xffffffff||local===0xffffffff||flags&1||flags&0x40||![0,8].includes(method)||u16(offset+34)!==0)bad();
  const name=decode(bytes.subarray(offset+46,offset+46+nameLength));if(!name||name.includes('\\')||name.startsWith('/')||name.includes(':')||name.split('/').some(part=>part==='..'||part==='.')||/[\u0000-\u001f]/.test(name)||entries.has(name))bad();
  if(/(?:vbaProject|macro|activeX|embeddings|externalLinks)/i.test(name)||/\.(?:exe|dll|js|vbs|bin)$/i.test(name))bad();
  total+=size;if(size>8*1024*1024||total>32*1024*1024||size>Math.max(compressed*100,1024*1024))bad('Tệp nén vượt giới hạn giải nén an toàn.');
  if(local+30>u32(end+16)||u32(local)!==0x04034b50||u16(local+6)!==flags||u16(local+8)!==method)bad();const dataStart=local+30+u16(local+26)+u16(local+28);const dataEnd=dataStart+compressed;
  if(dataEnd>u32(end+16)||dataStart<local+30||decode(bytes.subarray(local+30,local+30+u16(local+26)))!==name||usedRanges.some(range=>local<range.end&&dataEnd>range.start))bad();usedRanges.push({start:local,end:dataEnd});
  let content:Uint8Array;try{content=method===0?bytes.slice(dataStart,dataEnd):new Uint8Array(inflateRawSync(bytes.subarray(dataStart,dataEnd),{maxOutputLength:Math.min(size+1,8*1024*1024)}));}catch{return bad();}
  if(content.length!==size||crc32(content)!==crc)bad();entries.set(name,content);offset+=46+nameLength+extraLength+commentLength;
 }
 if(offset!==end)bad();return entries;
}
function extractDocx(bytes:Uint8Array){
 const entries=unzipDocx(bytes);const types=entries.get('[Content_Types].xml'),relations=entries.get('_rels/.rels'),document=entries.get('word/document.xml');if(!types||!relations||!document)bad();
 const contentTypes=safeXml(decode(types));if(!contentTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml')||/macroEnabled|vbaProject|application\/x-msdownload/i.test(contentTypes))bad();
 for(const [name,value] of entries){if(name.endsWith('.rels')){const xml=safeXml(decode(value));if(/TargetMode\s*=\s*["']External["']/i.test(xml)||/Target\s*=\s*["'](?:https?:|file:|\/|\\|[^"']*\.\.)/i.test(xml))bad();}else if(name.endsWith('.xml'))safeXml(decode(value));}
 const xml=safeXml(decode(document));if(!/<(?:w:)?document(?:\s|>)/.test(xml))bad();
 const entity=(value:string)=>value.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi,token=>{const entities:Record<string,string>={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"};if(entities[token])return entities[token];const number=token.startsWith('&#x')?parseInt(token.slice(3,-1),16):parseInt(token.slice(2,-1),10);return number>0&&number<=0x10ffff?String.fromCodePoint(number):'';});
 const text=entity(xml.replace(/<w:tab\b[^>]*\/>/g,'\t').replace(/<w:br\b[^>]*\/>/g,'\n').replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,'')).trim();if(text.length>200000)bad('Nội dung Word quá dài để trích xuất.');return text;
}
function validateDoc(bytes:Uint8Array){
 const signature=[0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1];if(bytes.length<512||signature.some((byte,i)=>bytes[i]!==byte))bad();
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const u16=(n:number)=>view.getUint16(n,true),u32=(n:number)=>view.getUint32(n,true);const sectorSize=2**u16(30);
 if(u16(28)!==0xfffe||![512,4096].includes(sectorSize)||u16(32)!==6||u32(56)!==4096||u32(72)!==0||bytes.length%sectorSize!==0)bad();
 const sectorCount=bytes.length/sectorSize-1;const sector=(index:number)=>{if(index>=sectorCount)bad();return bytes.subarray((index+1)*sectorSize,(index+2)*sectorSize);};
 const fatCount=u32(44);if(!fatCount||fatCount>109)bad();const fat:number[]=[];for(let i=0;i<fatCount;i++){const part=sector(u32(76+i*4));const v=new DataView(part.buffer,part.byteOffset,part.byteLength);for(let j=0;j<sectorSize;j+=4)fat.push(v.getUint32(j,true));}
 function chain(start:number,table:number[],read:(n:number)=>Uint8Array,limit:number){const pieces:Uint8Array[]=[];const seen=new Set<number>();let size=0;while(start!==0xfffffffe){if(start>=table.length||seen.has(start)||size>limit)bad();seen.add(start);const part=read(start);pieces.push(part);size+=part.length;start=table[start];}if(size>limit)bad();const result=new Uint8Array(size);let offset=0;for(const part of pieces){result.set(part,offset);offset+=part.length;}return result;}
 const directory=chain(u32(48),fat,sector,TEACHER_FILE_LIMIT);const entries:{name:string;type:number;start:number;size:number}[]=[];
 for(let i=0;i+128<=directory.length;i+=128){const v=new DataView(directory.buffer,directory.byteOffset+i,128);const type=v.getUint8(66);if(type===0)continue;const length=v.getUint16(64,true);if(length<2||length>64||length%2)bad();const name=new TextDecoder('utf-16le').decode(directory.subarray(i,i+length-2));if(/vba|macros|objectpool/i.test(name)||v.getUint32(124,true)!==0)bad();entries.push({name,type,start:v.getUint32(116,true),size:v.getUint32(120,true)});}
 const word=entries.find(e=>e.name==='WordDocument'&&e.type===2),root=entries.find(e=>e.type===5);if(!word||!root||!entries.some(e=>/^[01]Table$/.test(e.name)&&e.type===2)||word.size<32||word.size>TEACHER_FILE_LIMIT)bad();
 let wordData:Uint8Array;if(word.size>=4096)wordData=chain(word.start,fat,sector,TEACHER_FILE_LIMIT);else{const miniFatBytes=chain(u32(60),fat,sector,TEACHER_FILE_LIMIT);const miniFatView=new DataView(miniFatBytes.buffer,miniFatBytes.byteOffset,miniFatBytes.byteLength);const miniFat=Array.from({length:miniFatBytes.length/4},(_,i)=>miniFatView.getUint32(i*4,true));const miniStream=chain(root.start,fat,sector,TEACHER_FILE_LIMIT).subarray(0,root.size);wordData=chain(word.start,miniFat,index=>{if((index+1)*64>miniStream.length)bad();return miniStream.subarray(index*64,(index+1)*64);},TEACHER_FILE_LIMIT);}
 if(wordData.length<word.size||wordData[0]!==0xec||wordData[1]!==0xa5)bad();
}
export function validateTeacherWord(bytes:Uint8Array,name:string):{type:string;text:string|null}{
 if(!bytes.length||bytes.length>TEACHER_FILE_LIMIT)throw new TeacherError(413,'FILE_TOO_LARGE','Tệp Word tối đa 10 MiB.');
 try{if(/\.docx$/i.test(name))return {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',text:extractDocx(bytes)};if(/\.doc$/i.test(name)){validateDoc(bytes);return {type:'application/msword',text:null};}return bad('Chỉ nhận tệp Word .doc hoặc .docx.');}catch(error){if(error instanceof TeacherError)throw error;return bad();}
}
