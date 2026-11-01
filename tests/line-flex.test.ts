import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildFinanceFlexMessage} from '../lib/line-flex';

test('builds a structured LINE finance card with spaced sections and empty-state note',()=>{
 const message=buildFinanceFlexMessage('month_income',{
  month:'2026-11',income:0,expense:0,balance:0,dailyIncome:0,dailyExpense:0,dailyBalance:0,
  companyIncome:0,companyExpense:0,companyBalance:0,savings:0,savedThisMonth:0,withdrawnThisMonth:0,
  byCategory:[],transactions:[]
 });
 assert.equal(message.type,'flex');
 assert.equal(message.altText,'本月收入');
 const bubble=message.contents;
 assert.equal(bubble.type,'bubble');
 assert.equal(bubble.header.backgroundColor,'#173D39');
 assert.ok(bubble.body.contents.some((item:any)=>item.type==='separator'));
 assert.equal(bubble.footer.contents[0].text,'本月尚無記帳紀錄');
});
