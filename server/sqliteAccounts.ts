// @ts-ignore Bun provides the native SQLite module.
import { Database } from 'bun:sqlite';
import type { AccountRepository, StoredAccount, StoredSession } from './accountService.ts';
export class SqliteAccountRepository implements AccountRepository {
  private db:any;
  constructor(filename:string) {
    this.db=new Database(filename,{create:true});
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS devices(id TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS kvtt_accounts(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,full_name TEXT NOT NULL,gender TEXT,owner_id TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS kvtt_account_sessions(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL,expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS kvtt_login_throttle(username TEXT PRIMARY KEY,started_at INTEGER NOT NULL,attempts INTEGER NOT NULL);`);
  }
  close(){this.db.close();}
  async createAccount(a:StoredAccount) {
    return this.db.transaction(()=>{
      if(this.db.query('SELECT id FROM kvtt_accounts WHERE username=?').get(a.username)) return false;
      this.db.query('INSERT INTO devices(id) VALUES(?)').run(a.ownerId);
      this.db.query('INSERT INTO kvtt_accounts VALUES(?,?,?,?,?,?,?)').run(a.id,a.username,a.fullName,a.gender,a.ownerId,a.passwordHash,a.passwordSalt);return true;
    })();
  }
  private account(row:any):StoredAccount|null {return row?{id:row.id,username:row.username,fullName:row.full_name,gender:row.gender,ownerId:row.owner_id,passwordHash:row.password_hash,passwordSalt:row.password_salt}:null;}
  async findByUsername(username:string){return this.account(this.db.query('SELECT * FROM kvtt_accounts WHERE username=?').get(username));}
  async findById(id:string){return this.account(this.db.query('SELECT * FROM kvtt_accounts WHERE id=?').get(id));}
  async isAccountOwner(ownerId:string){return !!this.db.query('SELECT id FROM kvtt_accounts WHERE owner_id=?').get(ownerId);}
  async createSession(s:StoredSession){this.db.query('INSERT INTO kvtt_account_sessions VALUES(?,?,?)').run(s.tokenHash,s.accountId,s.expiresAt);}
  async findSession(hash:string):Promise<StoredSession|null>{const s=this.db.query('SELECT * FROM kvtt_account_sessions WHERE token_hash=?').get(hash);return s?{tokenHash:s.token_hash,accountId:s.account_id,expiresAt:s.expires_at}:null;}
  async deleteSession(hash:string){this.db.query('DELETE FROM kvtt_account_sessions WHERE token_hash=?').run(hash);}
  async consumeLoginAttempt(username:string,now:number):Promise<boolean>{
    return this.db.transaction(()=>{
      this.db.query(`INSERT INTO kvtt_login_throttle VALUES(?,?,1) ON CONFLICT(username) DO UPDATE SET attempts=CASE WHEN started_at<=? THEN 1 ELSE attempts+1 END,started_at=CASE WHEN started_at<=? THEN excluded.started_at ELSE started_at END`).run(username,now,now-900000,now-900000);
      return this.db.query('SELECT attempts FROM kvtt_login_throttle WHERE username=?').get(username).attempts<=5;
    })();
  }
}
