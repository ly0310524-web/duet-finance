import { PrismaClient } from '@prisma/client';
const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient(); if (process.env.NODE_ENV !== 'production') g.prisma = db;
export const HOUSEHOLD = 'duet';
export const devMode = () => process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_ENABLED === 'true';
export const pairingEnabled = () => process.env.LINE_PAIRING_ENABLED === 'true';
export async function bootstrap() { const ids=(process.env.LINE_ALLOWED_USER_IDS||'').split(',').map(s=>s.trim()).filter(Boolean); if(!devMode()&&!pairingEnabled()&&(ids.length!==2||new Set(ids).size!==2)) throw new Error('請設定兩位 LINE userId，或啟用 LINE_PAIRING_ENABLED'); await db.household.upsert({where:{id:HOUSEHOLD},create:{id:HOUSEHOLD},update:{}}); for(let i=0;i<2;i++){const id=`member-${i+1}`,name=i===0?'Stanley':'Davina';await db.user.upsert({where:{id},create:{id,name,householdId:HOUSEHOLD},update:{name}});if(ids[i])await db.user.updateMany({where:{id,lineId:null},data:{lineId:ids[i]}});} }
export async function lineUser(lineId:string){await bootstrap();return db.user.findUnique({where:{lineId}});}
export async function bindLineCode(lineId:string,code:string){await bootstrap();if(!pairingEnabled()||code!==(process.env.LINE_PAIRING_CODE||''))return{ok:false,message:'綁定碼錯誤。'};const existing=await db.user.findUnique({where:{lineId}});if(existing)return{ok:true,message:'這個 LINE 帳號已經綁定。'};const users=await db.user.findMany({where:{householdId:HOUSEHOLD},orderBy:{id:'asc'}});const slot=users.find(u=>!u.lineId);if(!slot)return{ok:false,message:'兩個授權名額都已綁定。'};await db.user.update({where:{id:slot.id},data:{lineId}});return{ok:true,message:`已完成綁定。這是第 ${slot.id==='member-1'?'一':'二'} 位共同成員。`};}
