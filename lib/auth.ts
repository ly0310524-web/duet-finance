import {cookies} from 'next/headers';
import {createHash,randomBytes} from 'node:crypto';
import {db,bootstrap,devMode} from './db';
export function digest(s:string){return createHash('sha256').update(s).digest('hex')}
export async function createSession(userId:string){const token=randomBytes(32).toString('base64url');await db.authSession.create({data:{id:digest(token),userId,expiresAt:new Date(Date.now()+30*86400000)}});(await cookies()).set('duet-session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:30*86400});}
export async function requireUser(){await bootstrap();const token=(await cookies()).get('duet-session')?.value;if(!token)throw new Error('UNAUTHORIZED');const s=await db.authSession.findUnique({where:{id:digest(token)},include:{user:true}});if(!s||s.expiresAt.getTime()<Date.now())throw new Error('UNAUTHORIZED');return s.user;}
export function checkOrigin(req:Request){const origin=req.headers.get('origin');if(origin!==new URL(process.env.APP_URL||'http://localhost:3000').origin)throw new Error('FORBIDDEN');}
export function apiError(e:unknown){const m=e instanceof Error?e.message:'操作失敗';const status=m==='UNAUTHORIZED'?401:m==='FORBIDDEN'?403:/版本|餘額|金額|日期|市場|幣別|匯率|不存在|無法|月份/.test(m)?400:500;return Response.json({error:status===500?'服務暫時無法使用，請稍後重試。':m},{status});}
