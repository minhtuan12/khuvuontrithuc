export type AccountRole = 'learner' | 'teacher';
export type PublicAccount = { id: string; username: string; fullName: string; gender: null | 'male' | 'female' | 'other'; role: AccountRole };
export type StoredAccount = PublicAccount & { ownerId: string; passwordHash: string; passwordSalt: string; seedKey?: string | null };
export type StoredSession = { tokenHash: string; accountId: string; expiresAt: number };
export interface AccountRepository {
  createAccount(account: StoredAccount): Promise<boolean>;
  findByUsername(username: string): Promise<StoredAccount | null>;
  findById(id: string): Promise<StoredAccount | null>;
  createSession(session: StoredSession): Promise<void>;
  findSession(hash: string): Promise<StoredSession | null>;
  deleteSession(hash: string): Promise<void>;
  consumeLoginAttempt(username: string, now: number): Promise<boolean>;
  isAccountOwner(ownerId: string): Promise<boolean>;
}
export class AccountError extends Error { constructor(public status: number, message: string) { super(message); this.name='AccountError'; } }
const encoder=new TextEncoder();
function randomHex(length:number) { return Array.from(crypto.getRandomValues(new Uint8Array(length)),n=>n.toString(16).padStart(2,'0')).join(''); }
function hex(bytes:ArrayBuffer) { return Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join(''); }
export async function hashToken(token:string) { return hex(await crypto.subtle.digest('SHA-256',encoder.encode(token))); }
async function passwordHash(password:string,salt:string) {
  const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:encoder.encode(salt),iterations:600000},key,256));
}
function equal(a:string,b:string) { let diff=a.length^b.length; for(let i=0;i<Math.max(a.length,b.length);i++) diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0); return diff===0; }
function publicUser(account:StoredAccount):PublicAccount { const {id,username,fullName,gender}=account; return {id,username,fullName,gender,role:account.role==='teacher'?'teacher':'learner'}; }
function credentials(input:unknown) {
  if(!input||typeof input!=='object') throw new AccountError(400,'Vui lòng kiểm tra thông tin đăng nhập.');
  const body=input as Record<string,unknown>;
  const username=typeof body.username==='string'?body.username.trim().toLowerCase():'';
  const password=typeof body.password==='string'?body.password:'';
  if(!/^[a-z0-9_.-]{3,32}$/.test(username)||password.length<8||password.length>128) throw new AccountError(400,'Tên đăng nhập cần 3–32 ký tự; mật khẩu cần 8–128 ký tự.');
  return {username,password,body};
}
export class AccountService {
  constructor(public readonly repo:AccountRepository) {}
  async register(input:unknown) {
    const {username,password,body}=credentials(input);
    if(username==='ngant') throw new AccountError(409,'Tên đăng nhập đã được dành riêng.');
    const fullName=typeof body.fullName==='string'?body.fullName.trim():'';
    const gender=body.gender==null||body.gender===''?null:body.gender;
    const role=body.role===undefined?'learner':body.role;
    if(fullName.length<2||fullName.length>100||/[\u0000-\u001f\u007f]/.test(fullName)||![null,'male','female','other'].includes(gender as any)||!['learner','teacher'].includes(role as string)) throw new AccountError(400,'Vui lòng kiểm tra họ tên, giới tính và loại tài khoản.');
    if(!await this.repo.consumeLoginAttempt('register:'+username,Date.now())) throw new AccountError(429,'Bạn thử quá nhiều lần. Vui lòng đợi 15 phút.');
    const salt=randomHex(16);
    const account:StoredAccount={id:crypto.randomUUID(),username,fullName,gender:gender as PublicAccount['gender'],role:role as AccountRole,ownerId:randomHex(32),passwordSalt:salt,passwordHash:await passwordHash(password,salt)};
    if(!await this.repo.createAccount(account)) throw new AccountError(409,'Tên đăng nhập đã được sử dụng.');
    return this.issue(account);
  }
  async login(input:unknown) {
    const {username,password}=credentials(input);
    if(!await this.repo.consumeLoginAttempt(username,Date.now())) throw new AccountError(429,'Bạn thử quá nhiều lần. Vui lòng đợi 15 phút.');
    const account=await this.repo.findByUsername(username);
    const computed=await passwordHash(password,account?.passwordSalt??'0'.repeat(32));
    if(!account||!equal(computed,account.passwordHash)) throw new AccountError(401,'Tên đăng nhập hoặc mật khẩu chưa đúng.');
    return this.issue(account);
  }
  private async issue(account:StoredAccount) {
    const token=randomHex(32);
    await this.repo.createSession({tokenHash:await hashToken(token),accountId:account.id,expiresAt:Date.now()+30*86400000});
    return {user:publicUser(account),token};
  }
  private async resolve(token:string|undefined) {
    if(!token||!/^[a-f0-9]{64}$/.test(token)) throw new AccountError(401,'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    const session=await this.repo.findSession(await hashToken(token));
    const account=session&&session.expiresAt>Date.now()?await this.repo.findById(session.accountId):null;
    if(!account) throw new AccountError(401,'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    return account;
  }
  async session(token:string|undefined):Promise<PublicAccount|null> { return token===undefined?null:publicUser(await this.resolve(token)); }
  async requireOwner(token:string|undefined):Promise<string> { return (await this.resolve(token)).ownerId; }
  async requireTeacher(token:string|undefined):Promise<PublicAccount> {
    const account=await this.resolve(token);
    if(account.role!=='teacher') throw new AccountError(403,'Tài khoản chưa có quyền giáo viên.');
    return publicUser(account);
  }
  /** Private server-side provisioning only. Never expose this method through HTTP. */
  async seedTeacher(password:string):Promise<{user:PublicAccount;created:boolean}> {
    credentials({username:'ngant',password});
    const existing=await this.repo.findByUsername('ngant');
    if(existing) {
      if(existing.seedKey!=='default-teacher-v1'||existing.role!=='teacher'||existing.fullName!=='Cô Nga'||!equal(await passwordHash(password,existing.passwordSalt),existing.passwordHash)) {
        throw new AccountError(409,'Tài khoản dành riêng đã tồn tại nhưng chưa được xác minh. Không thay đổi tài khoản.');
      }
      return {user:publicUser(existing),created:false};
    }
    const salt=randomHex(16);
    const account:StoredAccount={id:crypto.randomUUID(),username:'ngant',fullName:'Cô Nga',gender:null,role:'teacher',ownerId:randomHex(32),passwordSalt:salt,passwordHash:await passwordHash(password,salt),seedKey:'default-teacher-v1'};
    if(!await this.repo.createAccount(account)) throw new AccountError(409,'Tên đăng nhập dành riêng vừa được sử dụng. Không thay đổi tài khoản.');
    return {user:publicUser(account),created:true};
  }
  async logout(token:string|undefined) { if(token!==undefined) await this.repo.deleteSession(await hashToken(token)); }
}
