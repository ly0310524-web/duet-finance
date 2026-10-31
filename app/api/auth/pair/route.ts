import {z} from 'zod';
import {bootstrap,pairingEnabled} from '@/lib/db';
import {checkOrigin,createSession,apiError} from '@/lib/auth';
export async function POST(req:Request){try{checkOrigin(req);if(!pairingEnabled())return Response.json({error:'配對登入未啟用'},{status:403});const {code,userId}=z.object({code:z.string().min(1),userId:z.enum(['member-1','member-2'])}).parse(await req.json());if(code!==(process.env.LINE_PAIRING_CODE||''))return Response.json({error:'配對碼錯誤'},{status:401});await bootstrap();await createSession(userId);return Response.json({ok:true});}catch(e){return apiError(e);}}
