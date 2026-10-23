import { Router } from 'express';
import type { AccountService } from './accountService.ts';
import { handleAccountHttp } from './accountHttp.ts';

export function createAccountRouter(service: AccountService) {
  const router=Router();
  router.use('/api/device/auth',async(req,res)=>{
    res.setHeader('Cache-Control','private, no-store');
    if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Không chấp nhận yêu cầu từ trang khác.'});}catch{return res.status(403).json({error:'Nguồn yêu cầu không hợp lệ.'});}}
    const result=await handleAccountHttp({route:'/auth'+req.path,method:req.method,body:req.body,cookieHeader:req.headers.cookie,secure:req.secure || process.env.NODE_ENV === 'production'},service);
    if(result.cookie)res.setHeader('Set-Cookie',result.cookie);
    return res.status(result.status).json(result.body);
  });
  return router;
}
