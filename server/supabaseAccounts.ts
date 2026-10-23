import type { AccountRepository, StoredAccount, StoredSession } from './accountService.ts';
export class SupabaseAccountRepository implements AccountRepository {
  private root:string;
  constructor(root:string,private key:string){this.root=root.replace(/\/$/,'')+'/rest/v1/';}
  private async request(path:string,method='GET',body?:unknown):Promise<any>{
    const result=await fetch(this.root+path,{method,headers:{apikey:this.key,Authorization:`Bearer ${this.key}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:body===undefined?undefined:JSON.stringify(body)});
    if(!result.ok) throw new Error('Account storage unavailable');
    const text=await result.text();return text?JSON.parse(text):null;
  }
  private account(row:any):StoredAccount|null{return row?{id:row.id,username:row.username,fullName:row.full_name,gender:row.gender,role:row.role==='teacher'?'teacher':'learner',seedKey:row.seed_key??null,ownerId:row.owner_id,passwordHash:row.password_hash,passwordSalt:row.password_salt}:null;}
  async createAccount(a:StoredAccount):Promise<boolean>{return this.request('rpc/kvtt_create_account_with_role','POST',{p_id:a.id,p_username:a.username,p_full_name:a.fullName,p_gender:a.gender,p_owner_id:a.ownerId,p_password_hash:a.passwordHash,p_password_salt:a.passwordSalt,p_role:a.role??'learner',p_seed_key:a.seedKey??null});}
  async findByUsername(username:string){return this.account((await this.request(`kvtt_accounts?username=eq.${encodeURIComponent(username)}&select=*&limit=1`))[0]);}
  async findById(id:string){return this.account((await this.request(`kvtt_accounts?id=eq.${encodeURIComponent(id)}&select=*&limit=1`))[0]);}
  async isAccountOwner(ownerId:string){return (await this.request(`kvtt_accounts?owner_id=eq.${encodeURIComponent(ownerId)}&select=id&limit=1`)).length>0;}
  async createSession(s:StoredSession){await this.request('kvtt_account_sessions','POST',{token_hash:s.tokenHash,account_id:s.accountId,expires_at:new Date(s.expiresAt).toISOString()});}
  async findSession(hash:string):Promise<StoredSession|null>{const s=(await this.request(`kvtt_account_sessions?token_hash=eq.${encodeURIComponent(hash)}&select=*&limit=1`))[0];return s?{tokenHash:s.token_hash,accountId:s.account_id,expiresAt:Date.parse(s.expires_at)}:null;}
  async deleteSession(hash:string){await this.request(`kvtt_account_sessions?token_hash=eq.${encodeURIComponent(hash)}`,'DELETE');}
  async consumeLoginAttempt(username:string,now:number):Promise<boolean>{return this.request('rpc/kvtt_consume_login_attempt','POST',{p_username:username,p_now:new Date(now).toISOString()});}
}
