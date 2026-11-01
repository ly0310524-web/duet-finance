import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isPersistentDatabase} from '../lib/db';

test('production pairing requires a persistent PostgreSQL database',()=>{
 assert.equal(isPersistentDatabase('postgresql://db.example/duet','production'),true);
 assert.equal(isPersistentDatabase('file:/app/data.db','production'),false);
 assert.equal(isPersistentDatabase('','production'),false);
 assert.equal(isPersistentDatabase('file:test.db','test'),true);
});
