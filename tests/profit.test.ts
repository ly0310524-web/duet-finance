import {test} from 'node:test';
import assert from 'node:assert/strict';
import {profitMetrics} from '../lib/profit';

test('calculates company profit and margin from income and expense',()=>{
 assert.deepEqual(profitMetrics(1000,750),{profit:250,margin:25});
});

test('keeps zero-income margin finite while reporting a loss',()=>{
 assert.deepEqual(profitMetrics(0,120),{profit:-120,margin:0});
});
