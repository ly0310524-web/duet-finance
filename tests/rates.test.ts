import {test} from 'node:test';
import assert from 'node:assert/strict';
import {displayRateFromCny} from '../lib/rates';

test('converts stored foreign-to-CNY rate into dashboard CNY-to-TWD display rate',()=>{
 assert.equal(displayRateFromCny('CNY',1),1);
 assert.equal(displayRateFromCny('TWD',0.23),1/0.23);
});
