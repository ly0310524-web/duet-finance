import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const folder=mkdtempSync(join(tmpdir(),'duet-ledger-'));
writeFileSync(join(folder,'test.db'),'');
process.env.DATABASE_URL=`file:${folder}/test.db`;
process.env.LINE_PAIRING_ENABLED='true';
test('SQLite writes retain authorship, summary and event deduplication',async()=>{
 execFileSync(process.execPath,['node_modules/prisma/build/index.js','db','push','--skip-generate'],{env:process.env,stdio:'pipe'});
 const {db,bootstrap}=await import('../lib/db');const {chat}=await import('../lib/chat');
 try{
  await bootstrap();
  const reply=await chat('member-2','支出200元吃飯','event-davina-1');
  assert.match(reply,/Davina/);
  await chat('member-2','支出200元吃飯','event-davina-1');
  const rows=await db.transaction.findMany();assert.equal(rows.length,1);assert.equal(rows[0].userId,'member-2');assert.equal(rows[0].category,'吃飯');assert.equal(Number(rows[0].cny),200);
  await chat('member-1','公司支出300');
  await chat('member-1','英國','event-stanley-2');
  const company=await db.transaction.findFirst({where:{ledger:'company'}});assert.equal(company?.market,'UK');
 }finally{await db.$disconnect();}
});
