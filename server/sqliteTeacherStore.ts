// @ts-ignore Bun's native SQLite module.
import {Database} from 'bun:sqlite';
import {TeacherError,TEACHER_QUOTA,type TeacherKind,type TeacherRecord,type TeacherStore,type TeacherListQuery,type TeacherFileStorage} from './teacherTypes.ts';
const tables={lessons:'teacher_lesson_plans',questions:'teacher_questions',profiles:'teacher_student_profiles',files:'teacher_lesson_files'};
export class SqliteTeacherStore implements TeacherStore{
 private db:any;
 constructor(filename:string){
  this.db=new Database(filename,{create:true});this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  for(const table of Object.values(tables))this.db.exec(`CREATE TABLE IF NOT EXISTS ${table}(id TEXT PRIMARY KEY,owner_id TEXT NOT NULL,version INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,deleted_at TEXT,data TEXT NOT NULL,idempotency_key TEXT NOT NULL,UNIQUE(owner_id,idempotency_key));CREATE INDEX IF NOT EXISTS ${table}_owner_date ON ${table}(owner_id,updated_at,id);`);
 }
 close(){this.db.close();}
 private row(row:any):TeacherRecord|null{return row?{id:row.id,ownerId:row.owner_id,version:row.version,createdAt:row.created_at,updatedAt:row.updated_at,deletedAt:row.deleted_at,data:JSON.parse(row.data)}:null;}
 async get(kind:TeacherKind,id:string,ownerId?:string){return this.row(this.db.query(`SELECT * FROM ${tables[kind]} WHERE id=?${ownerId===undefined?'':' AND owner_id=?'}`).get(...(ownerId===undefined?[id]:[id,ownerId])));}
 async list(kind:TeacherKind,ownerId:string|undefined,q:TeacherListQuery){
  const where=['deleted_at IS NULL'];const args:any[]=[];
  if(ownerId!==undefined){where.push('owner_id=?');args.push(ownerId);}
  if(q.cursor){where.push('id>?');args.push(q.cursor);}
  if(kind==='questions'&&ownerId===undefined)where.push("json_extract(data,'$.status')!='withdrawn'");
  for(const field of ['status','source','ageBand','studentAccountId','planId'] as const)if(q[field]){where.push(`json_extract(data,'$.${field}')=?`);args.push(q[field]);}
  if(q.query){where.push("lower(coalesce(json_extract(data,'$.title'),json_extract(data,'$.content'),'')) LIKE ? ESCAPE '\\'");args.push('%'+q.query.toLowerCase().replace(/[\\%_]/g,'\\$&')+'%');}
  args.push(q.limit??21);return this.db.query(`SELECT * FROM ${tables[kind]} WHERE ${where.join(' AND ')} ORDER BY id LIMIT ?`).all(...args).map((row:any)=>this.row(row)!);
 }
 async create(kind:TeacherKind,r:TeacherRecord,key:string){return this.db.transaction(()=>{
  const existing=this.row(this.db.query(`SELECT * FROM ${tables[kind]} WHERE owner_id=? AND idempotency_key=?`).get(r.ownerId,key));if(existing)return existing;
  if(kind==='files'){const usage=this.db.query("SELECT coalesce(sum(CAST(json_extract(data,'$.byteSize') AS INTEGER)),0) AS bytes FROM teacher_lesson_files WHERE owner_id=? AND json_extract(data,'$.state') IN ('pending','ready','deleting')").get(r.ownerId).bytes;if(usage+r.data.byteSize>TEACHER_QUOTA)throw new TeacherError(429,'FILE_QUOTA','Kho tài liệu đã đủ 100 MiB.');}
  if(kind==='questions'){const count=this.db.query('SELECT count(*) AS n FROM teacher_questions WHERE owner_id=? AND created_at>?').get(r.ownerId,new Date(Date.now()-3600000).toISOString()).n;if(count>=5)throw new TeacherError(429,'QUESTION_QUOTA','Bạn có thể gửi tối đa 5 câu hỏi mỗi giờ.');}
  this.db.query(`INSERT INTO ${tables[kind]} VALUES(?,?,?,?,?,?,?,?)`).run(r.id,r.ownerId,r.version,r.createdAt,r.updatedAt,r.deletedAt,JSON.stringify(r.data),key);return r;
 })();}
 async update(kind:TeacherKind,r:TeacherRecord,expectedVersion:number){const saved=this.db.query(`UPDATE ${tables[kind]} SET version=?,updated_at=?,deleted_at=?,data=? WHERE id=? AND owner_id=? AND version=?`).run(r.version,r.updatedAt,r.deletedAt,JSON.stringify(r.data),r.id,r.ownerId,expectedVersion);return saved.changes===1?r:null;}
 private docs(owner:string){const rows=this.db.query("SELECT key,value FROM documents WHERE owner=? AND key IN ('stars','game-stars','badges','learning-stats','english-progress','english-garden-progress','study-time','daily-activity')").all(owner);return Object.fromEntries(rows.map((r:any)=>{let value=null;try{value=JSON.parse(r.value);}catch{}return [r.key,value];}));}
 async student(id:string){const row=this.db.query("SELECT id,username,full_name,owner_id FROM kvtt_accounts WHERE id=? AND role='learner'").get(id);return row?{id:row.id,username:row.username,fullName:row.full_name,documents:this.docs(row.owner_id)}:null;}
 async students(q:{query:string;activity:string;cursor:string;limit:number}){
  const active="EXISTS(SELECT 1 FROM documents d WHERE d.owner=a.owner_id AND d.key IN ('stars','game-stars','badges','learning-stats','english-progress','english-garden-progress','study-time','daily-activity') AND json_valid(d.value) AND d.value!='null')";
  const counts=this.db.query(`SELECT count(*) AS total,coalesce(sum(${active}),0) AS activeCount FROM kvtt_accounts a WHERE role='learner'`).get();
  const query='%'+q.query.toLowerCase().replace(/[\\%_]/g,'\\$&')+'%';
  const rows=this.db.query(`SELECT a.id,a.username,a.full_name,a.owner_id FROM kvtt_accounts a WHERE role='learner' AND a.id>? AND (lower(a.username) LIKE ? ESCAPE '\\' OR lower(a.full_name) LIKE ? ESCAPE '\\') ${q.activity==='active'?`AND ${active}`:q.activity==='inactive'?`AND NOT ${active}`:''} ORDER BY a.id LIMIT ?`).all(q.cursor,query,query,q.limit);
  return {...counts,items:rows.map((row:any)=>({id:row.id,username:row.username,fullName:row.full_name,documents:this.docs(row.owner_id)}))};
 }
}
export class SqliteTeacherFiles implements TeacherFileStorage{
 private db:any;
 constructor(filename:string){this.db=new Database(filename,{create:true});this.db.exec('PRAGMA busy_timeout=5000;CREATE TABLE IF NOT EXISTS teacher_private_file_bytes(storage_key TEXT PRIMARY KEY,data BLOB NOT NULL);');}
 close(){this.db.close();}
 async put(key:string,bytes:Uint8Array){this.db.query('INSERT INTO teacher_private_file_bytes VALUES(?,?) ON CONFLICT(storage_key) DO NOTHING').run(key,bytes);}
 async get(key:string):Promise<Uint8Array|null>{const row=this.db.query('SELECT data FROM teacher_private_file_bytes WHERE storage_key=?').get(key);return row?new Uint8Array(row.data):null;}
 async delete(key:string){this.db.query('DELETE FROM teacher_private_file_bytes WHERE storage_key=?').run(key);}
}
