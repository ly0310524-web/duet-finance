import Decimal from 'decimal.js';
import {db,HOUSEHOLD} from './db';
import {currentMonth,monthRange} from './time';
export type Summary={month:string;income:number;expense:number;balance:number;dailyIncome:number;dailyExpense:number;dailyBalance:number;companyIncome:number;companyExpense:number;companyBalance:number;savings:number;savedThisMonth:number;withdrawnThisMonth:number;byCategory:{category:string;amount:number}[];transactions:any[]};
export async function getSummary(month=currentMonth()):Promise<Summary>{
 const {gte,lt}=monthRange(month); const tx=await db.transaction.findMany({where:{householdId:HOUSEHOLD,deletedAt:null,date:{gte,lt}},orderBy:{date:'desc'},include:{user:{select:{name:true}}}});
 const n=(v:any)=>Number(v); const inc=(r:any)=>r.direction==='income'; const sum=(a:any[],f:(r:any)=>boolean)=>Number(a.filter(f).reduce((s,r)=>s.plus(r.cny.toString()),new Decimal(0)).toFixed(2));
 const daily=tx.filter(r=>r.ledger==='daily'), company=tx.filter(r=>r.ledger==='company'); const save=tx.filter(r=>r.kind==='save'&&r.direction==='expense'), take=tx.filter(r=>r.kind==='save'&&r.direction==='income');
 const allSavings=await db.transaction.findMany({where:{householdId:HOUSEHOLD,deletedAt:null,kind:'save'}}); const savings=sum(allSavings,r=>r.direction==='expense')-sum(allSavings,r=>r.direction==='income');
 const cats=[...new Set(daily.filter(r=>r.kind!=='save'&&r.direction==='expense').map(r=>r.category))].map(category=>({category,amount:sum(daily,r=>r.category===category&&r.direction==='expense'&&r.kind!=='save')})).sort((a,b)=>b.amount-a.amount);
 return {month,income:sum(tx,inc),expense:sum(tx,r=>!inc(r)),balance:sum(tx,inc)-sum(tx,r=>!inc(r)),dailyIncome:sum(daily,inc),dailyExpense:sum(daily,r=>!inc(r)),dailyBalance:sum(daily,inc)-sum(daily,r=>!inc(r)),companyIncome:sum(company,inc),companyExpense:sum(company,r=>!inc(r)),companyBalance:sum(company,inc)-sum(company,r=>!inc(r)),savings,savedThisMonth:sum(save,()=>true),withdrawnThisMonth:sum(take,()=>true),byCategory:cats,transactions:tx.map(r=>({...r,cny:n(r.cny),amount:n(r.amount),rate:n(r.rate)}))};
}
export function formatCNY(v:number){return new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:0}).format(v)}
