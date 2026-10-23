import dotenv from 'dotenv';
import path from 'node:path';
import {SqliteTeacherStore,SqliteTeacherFiles} from '../server/sqliteTeacherStore';
import {SupabaseTeacherStore,SupabaseTeacherFiles} from '../server/supabaseTeacherStore';
import {TeacherService} from '../server/teacherService';
dotenv.config({path:'.env.local',quiet:true});
const teacherId=process.argv.find(value=>value.startsWith('--teacher='))?.slice(10);
if(!teacherId||!/^[a-f\d-]{36}$/i.test(teacherId))throw Error('Supply --teacher=<teacher-account-uuid>; no account identifiers are inferred.');
const remote=process.argv.includes('--supabase');
const database=path.join(process.env.KVTT_DATA_DIR||'data','app.sqlite');
const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(remote&&(!url||!key))throw Error('Private Supabase server configuration is required.');
const store=remote?new SupabaseTeacherStore(url!,key!):new SqliteTeacherStore(database);
const files=remote?new SupabaseTeacherFiles(url!,key!):new SqliteTeacherFiles(database);
try {console.log(JSON.stringify({cleanupPending:await new TeacherService(store,files).cleanupFiles(teacherId)}));}
finally {if(store instanceof SqliteTeacherStore)store.close();if(files instanceof SqliteTeacherFiles)files.close();}
