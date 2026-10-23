/** Server-side command only; no password argument, default secret, or secret output.
 * bun scripts/seed-teacher-account.ts --sqlite=./data/app.sqlite
 * bun scripts/seed-teacher-account.ts --supabase
 * Provide KVTT_TEACHER_SEED_PASSWORD privately in the environment or via stdin.
 * Supabase mode also requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { AccountService } from '../server/accountService.ts';
import { SqliteAccountRepository } from '../server/sqliteAccounts.ts';
import { SupabaseAccountRepository } from '../server/supabaseAccounts.ts';

export async function runTeacherSeed(args:string[], env:Record<string,string|undefined>, readPrivateInput:()=>Promise<string>) {
  const sqlite=args.find(arg=>arg.startsWith('--sqlite='))?.slice('--sqlite='.length);
  const supabase=args.includes('--supabase');
  if(args.length!==1||(!sqlite&&!supabase)||(sqlite&&supabase)) throw new Error('Chọn đúng một nơi lưu: --sqlite=<đường dẫn> hoặc --supabase.');
  if(supabase&&(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)) throw new Error('Thiếu cấu hình máy chủ Supabase.');
  let password=env.KVTT_TEACHER_SEED_PASSWORD;
  if(password===undefined) password=await readPrivateInput();
  if(!password||password.length<8||password.length>128) throw new Error('Mật khẩu riêng cần 8–128 ký tự.');
  const repo=sqlite?new SqliteAccountRepository(resolve(sqlite)):new SupabaseAccountRepository(env.SUPABASE_URL!,env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const result=await new AccountService(repo).seedTeacher(password);
    return {created:result.created};
  } finally {
    password=undefined;
    if(repo instanceof SqliteAccountRepository) repo.close();
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result=await runTeacherSeed(process.argv.slice(2),process.env,async()=>{
      if(process.stdin.isTTY) throw new Error('Cấp mật khẩu qua biến môi trường riêng hoặc stdin; không nhận đối số mật khẩu.');
      let value='';
      for await(const chunk of process.stdin) {
        value+=chunk.toString();
        if(value.length>130) throw new Error('Mật khẩu vượt giới hạn.');
      }
      return value.replace(/\r?\n$/,'');
    });
    console.log(result.created?'Đã tạo tài khoản giáo viên.':'Đã xác minh tài khoản giáo viên; không thay đổi mật khẩu.');
  } catch {
    // Avoid dumping database/network exceptions that could include credentials.
    console.error('Không thể tạo hoặc xác minh tài khoản giáo viên. Không ghi đè tài khoản hiện có.');
    process.exitCode=1;
  }
}
