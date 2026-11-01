import type {Summary} from './finance';
import {formatCNY} from './finance';

type FlexText={type:'text';text:string;size?:string;color?:string;weight?:'regular'|'bold';wrap?:boolean;flex?:number;align?:'start'|'end'|'center';margin?:string};
const text=(value:string,options:Omit<FlexText,'type'|'text'>={}):FlexText=>({type:'text',text:value,...options});
const row=(label:string,value:string)=>({type:'box',layout:'baseline',spacing:'md',contents:[text(label,{color:'#62716B',flex:1}),text(value,{color:'#202824',weight:'bold',align:'end'})]});
const section=(title:string,rows:any[])=>({type:'box',layout:'vertical',spacing:'sm',contents:[text(title,{size:'sm',color:'#28584F',weight:'bold'}),...rows]});

export function buildFinanceFlexMessage(action:string,s:Summary){
 const c=formatCNY,empty=s.transactions.length===0?'本月尚無記帳紀錄':'';
 let title='財務查詢',contents:any[]=[];
 if(action==='month_income'){
  title='本月收入';contents=[section('收入明細',[row('日常收入',c(s.dailyIncome)),row('公司收入',c(s.companyIncome))]),{type:'separator',margin:'lg'},row('總收入',c(s.income))];
 }else if(action==='month_expense'){
  title='本月支出';contents=[section('支出明細',[row('日常支出',c(s.dailyExpense)),row('公司支出',c(s.companyExpense))]),{type:'separator',margin:'lg'},row('總支出',c(s.expense))];
 }else if(action==='month_balance'||action==='month_overview'){
  title=action==='month_balance'?'本月結餘':'本月財務總覽';contents=[row('本月收入',c(s.income)),row('本月支出',c(s.expense)),{type:'separator',margin:'lg'},row('本月總結餘',`${s.balance>=0?'+':'−'}${c(Math.abs(s.balance))}`)];
 }else if(action==='company'){
  title='本月公司收支';const markets=['US','UK','EU'] as const,names={US:'美國區',UK:'英國區',EU:'歐盟區'};
  contents=[...markets.map(m=>{const rows=s.transactions.filter(r=>r.market===m&&r.ledger==='company'),income=rows.filter(r=>r.direction==='income').reduce((a,r)=>a+r.cny,0),expense=rows.filter(r=>r.direction==='expense').reduce((a,r)=>a+r.cny,0);return section(names[m],[row('收入',c(income)),row('支出',c(expense)),row('結餘',`${income-expense>=0?'+':'−'}${c(Math.abs(income-expense))}`)]);}),{type:'separator',margin:'lg'},row('公司總結餘',`${s.companyBalance>=0?'+':'−'}${c(Math.abs(s.companyBalance))}`)];
 }else if(action==='savings'){
  title='共同存款';contents=[row('目前總額',c(s.savings)),{type:'separator',margin:'lg'},row('本月存入',c(s.savedThisMonth)),row('本月取出',c(s.withdrawnThisMonth))];
 }else if(action==='recent'){
  title='最近交易';contents=s.transactions.slice(0,5).map(r=>row(r.note,`${r.direction==='income'?'+':'−'}${c(r.cny)}`));
 }
 if(empty)contents.push({type:'separator',margin:'lg'});
 return {type:'flex' as const,altText:title,contents:{type:'bubble' as const,size:'kilo' as const,header:{type:'box',layout:'vertical' as const,backgroundColor:'#173D39',paddingAll:'16px',contents:[text('我們的記帳本',{size:'xs',color:'#C8AD7F'}),text(title,{size:'lg',color:'#FFFFFF',weight:'bold',margin:'sm'})]},body:{type:'box' as const,layout:'vertical' as const,spacing:'md' as const,paddingAll:'18px',contents},footer:{type:'box' as const,layout:'vertical' as const,paddingAll:'12px',contents:[...(empty?[text(empty,{size:'xs',color:'#8A9690',align:'center',wrap:true}),{type:'separator',margin:'sm'}]:[]),text('CNY · 台北時間 UTC+8',{size:'xs',color:'#8A9690',align:'center'})]}}};
}
