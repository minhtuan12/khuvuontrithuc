export class TeacherError extends Error{constructor(public status:number,public code:string,message:string){super(message);this.name='TeacherError';}}
export type TeacherKind='lessons'|'questions'|'profiles'|'files';
export type TeacherRecord={id:string;ownerId:string;version:number;createdAt:string;updatedAt:string;deletedAt:string|null;data:Record<string,any>};
export type TeacherListQuery={query?:string;cursor?:string;limit?:number;status?:string;source?:string;ageBand?:string;planId?:string;studentAccountId?:string};
export type TeacherStudent={id:string;username:string;fullName:string;documents:Record<string,unknown>};
export interface TeacherStore{
 get(kind:TeacherKind,id:string,ownerId?:string):Promise<TeacherRecord|null>;
 list(kind:TeacherKind,ownerId:string|undefined,query:TeacherListQuery):Promise<TeacherRecord[]>;
 create(kind:TeacherKind,record:TeacherRecord,key:string):Promise<TeacherRecord>;
 update(kind:TeacherKind,record:TeacherRecord,expectedVersion:number):Promise<TeacherRecord|null>;
 students(query:{query:string;activity:string;cursor:string;limit:number}):Promise<{items:TeacherStudent[];total:number;activeCount:number}>;
 student(id:string):Promise<TeacherStudent|null>;
}
export interface TeacherFileStorage{
 put(key:string,bytes:Uint8Array):Promise<void>;
 get(key:string):Promise<Uint8Array|null>;
 delete(key:string):Promise<void>;
}
export const TEACHER_FILE_LIMIT=10*1024*1024;
export const TEACHER_QUOTA=100*1024*1024;
