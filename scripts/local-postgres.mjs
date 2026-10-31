import EmbeddedPostgres from 'embedded-postgres';
import {existsSync} from 'node:fs';
process.env.LANG='C'; process.env.LC_ALL='C';
const pg = new EmbeddedPostgres({databaseDir:'.local-postgres',user:'duet',password:'duet_local_only',port:55432,persistent:true,onLog:()=>{},onError:console.error});
if(!existsSync('.local-postgres/PG_VERSION'))await pg.initialise();
await pg.start();
try { await pg.createDatabase('duet'); } catch(e) { if(!String(e).includes('already exists')) console.error(String(e)); }
console.log('PostgreSQL running on localhost:55432 (database: duet). Keep this terminal open.');
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,async()=>{await pg.stop();process.exit(0)});
setInterval(()=>{},60000);
