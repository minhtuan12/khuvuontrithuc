import { AccountService, AccountError } from './accountService.ts';
export function parseAccountCookie(header:string|undefined):string|undefined {
  const cookies=header?.split(';').map(item=>item.trim()).filter(item=>item.startsWith('kvtt_account='));
  if(!cookies?.length) return undefined;
  // A malformed or ambiguous supplied cookie remains an invalid account session.
  return cookies.length===1?cookies[0].slice('kvtt_account='.length):'';
}
export function accountCookie(token:string|undefined,secure:boolean) {
  return `kvtt_account=${token??''}; Path=/; Max-Age=${token?30*86400:0}; HttpOnly; SameSite=Strict${secure?'; Secure':''}`;
}
export async function handleAccountHttp(request:{route:string;method:string;body?:unknown;cookieHeader?:string;secure:boolean},service:AccountService):Promise<{status:number;body:Record<string,unknown>;cookie?:string}> {
  const token=parseAccountCookie(request.cookieHeader);
  try {
    if(request.route==='/auth/session'&&request.method==='GET') return {status:200,body:{user:await service.session(token)}};
    if(request.route==='/auth/logout'&&request.method==='POST') {await service.logout(token);return {status:200,body:{user:null},cookie:accountCookie(undefined,request.secure)};}
    if((request.route==='/auth/register'||request.route==='/auth/login')&&request.method==='POST') {
      const result=request.route==='/auth/register'?await service.register(request.body):await service.login(request.body);
      return {status:request.route==='/auth/register'?201:200,body:{user:result.user},cookie:accountCookie(result.token,request.secure)};
    }
    return {status:404,body:{error:'Không tìm thấy yêu cầu.'}};
  } catch(error) {
    if(request.route==='/auth/session'&&error instanceof AccountError&&error.status===401) return {status:200,body:{user:null,expired:true},cookie:accountCookie(undefined,request.secure)};
    return error instanceof AccountError?{status:error.status,body:{error:error.message}}:{status:500,body:{error:'Không thể xử lý tài khoản lúc này. Vui lòng thử lại.'}};
  }
}
