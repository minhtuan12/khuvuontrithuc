// @ts-nocheck Bun runner.
import {test,expect} from 'bun:test';
import {SupabaseTeacherFiles} from '../server/supabaseTeacherStore';
test('Supabase storage missing object returned as HTTP400 with statusCode404 is an absent file',async()=>{
 const previous=globalThis.fetch;
 try {globalThis.fetch=async()=>Response.json({statusCode:'404',error:'not_found',message:'Object not found'},{status:400});expect(await new SupabaseTeacherFiles('https://example.supabase.co','private-test-key').get('missing')).toBeNull();}
 finally {globalThis.fetch=previous;}
});
