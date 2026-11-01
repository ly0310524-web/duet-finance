import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const baseUrl=process.env.DATABASE_URL||'';
if(!/^postgres(ql)?:\/\//.test(baseUrl)) throw new Error('Ledger tests require local PostgreSQL; set DATABASE_URL in .env.local');
const schema='public';
const url=new URL(baseUrl);url.searchParams.set('schema',schema);process.env.DATABASE_URL=url.toString();
process.env.LINE_PAIRING_ENABLED='true';
process.env.LINE_PAIRING_CODES='member-1:test-stanley,member-2:test-davina';
process.env.LINE_ALLOWED_USER_IDS='';
test('PostgreSQL writes retain authorship, summary and event deduplication',async()=>{
 execFileSync(process.execPath,['node_modules/prisma/build/index.js','db','push','--force-reset','--skip-generate'],{env:process.env,stdio:'pipe'});
 const {db,bootstrap,bindLineCode,lineUser}=await import('../lib/db');const {chat}=await import('../lib/chat');
 try{
  await bootstrap();
  const reply=await chat('member-2','支出200元吃飯','event-davina-1');
  assert.match(reply,/Davina/);
  await chat('member-2','支出200元吃飯','event-davina-1');
  const rows=await db.transaction.findMany();assert.equal(rows.length,1);assert.equal(rows[0].userId,'member-2');assert.equal(rows[0].category,'吃飯');assert.equal(Number(rows[0].cny),200);
  await chat('member-1','公司支出300');
  await chat('member-1','英國','event-stanley-2');
  const company=await db.transaction.findFirst({where:{ledger:'company'}});assert.equal(company?.market,'UK');
  const bindings=await Promise.all([bindLineCode('U-stanley','test-stanley'),bindLineCode('U-davina','test-davina')]);
  assert.ok(bindings.every(result=>result.ok));
  const bound=await db.user.findMany({where:{householdId:'duet'},orderBy:{id:'asc'}});
  assert.deepEqual(bound.map(user=>user.lineId),['U-stanley','U-davina']);
  await bootstrap();
  assert.ok(await lineUser('U-stanley'));
  assert.ok(await lineUser('U-davina'));
  process.env.LINE_ALLOWED_USER_IDS='U-new-stanley,U-new-davina';
  await bootstrap();
  assert.ok(await lineUser('U-stanley'));
  assert.ok(await lineUser('U-davina'));
  assert.equal(await lineUser('U-new-stanley'),null);
 }finally{await db.$disconnect();}
});
