import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ruleParse} from '../lib/parser';
for(const [direction,word,purpose] of [['expense','支出','買衣服'],['expense','支出','吃飯'],['income','收入','薪水'],['income','收入','B單']] as const){
 for(const text of [`${word} 100 元 ${purpose}`,`${purpose}${word}100`, `100元${purpose}${word}`,`${word}${purpose}100元`]){
  test(text,()=>{const r=ruleParse(text);assert(r&&'entries'in r);assert.equal(r.entries[0].ledger,'daily');assert.equal(r.entries[0].direction,direction);assert.equal(r.entries[0].amount,100);assert.equal(r.entries[0].category,purpose);});
 }
}
for(const [direction,text,category] of [
 ['income','收 100 元 薪水','薪水'],['income','收到100薪水','薪水'],['income','薪水入帳100','薪水'],['income','100元進帳 B單','B單'],
 ['expense','付200外賣','外賣'],['expense','支付 300 元 網路費','網路費'],['expense','付款300買衣服','買衣服'],['expense','刷卡500買鞋','買鞋'],['expense','扣款1200水電費','水電費'],['expense','花了80咖啡','咖啡']
] as const){
 test(`direction synonym ${text}`,()=>{const r=ruleParse(text);assert(r&&'entries'in r);assert.equal(r.entries[0].direction,direction);assert.equal(r.entries[0].category,category);});
}
for(const [market,word] of [['US','美國'],['UK','英国'],['EU','欧盟']] as const){for(const text of [`支出500${word}`,`${word}500元支出`,`收入${word}500元`])test(text,()=>{const r=ruleParse(text);assert(r&&'entries'in r);assert.equal(r.entries[0].ledger,'company');assert.equal(r.entries[0].market,market);});}
for(const text of ['公司支出300','美國500','美國英國支出500','收入支出100','支出-100','支出吃飯','支出100和200'])test(`clarify ${text}`,()=>assert(ruleParse(text)&&'question'in ruleParse(text)!));
test('full width amount',()=>{const r=ruleParse('支出２００元吃飯');assert(r&&'entries'in r);assert.equal(r.entries[0].amount,200);});
