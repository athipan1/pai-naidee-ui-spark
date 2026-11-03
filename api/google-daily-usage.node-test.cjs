'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {dailyLimit,reserveGoogleDailyQuota}=require('./google-daily-usage.cjs');

function fakeDatabase() {
  // All simulated Railway instances connect to this one shared counter.
  const state=new Map();
  const getSql=()=>async(strings,...params)=>{
    const statement=strings.join('?');
    assert.match(statement,/ON CONFLICT \(usage_day, api_name\)/);
    assert.match(statement,/WHERE google_api_daily_usage\.request_count < \?/);
    assert.match(statement,/Asia\/Bangkok/);
    assert.match(statement,/RETURNING request_count/);
    const [kind,limit]=params;
    const existing=state.get(kind)||0;
    if(existing>=limit)return [];
    state.set(kind,existing+1);
    return [{request_count:existing+1}];
  };
  return {state,getSql};
}

test('fail closed on invalid kinds, invalid configuration, or database failure',async()=>{
  const previous=process.env.GOOGLE_PLACES_DAILY_LIMIT;
  try {
    assert.equal(dailyLimit('not-a-google-api'),0);
    process.env.GOOGLE_PLACES_DAILY_LIMIT='nonsense';
    assert.equal(dailyLimit('places_search'),0);
    assert.equal(await reserveGoogleDailyQuota('places_search',()=>{throw new Error('must not connect');}),false);
    process.env.GOOGLE_PLACES_DAILY_LIMIT='2';
    assert.equal(await reserveGoogleDailyQuota('places_search',()=>{throw Object.assign(new Error('db offline'),{code:'ECONNREFUSED'});}),false);
    process.env.GOOGLE_PLACES_DAILY_LIMIT='0';
    assert.equal(await reserveGoogleDailyQuota('places_search',()=>{throw new Error('must not connect');}),false);
    process.env.GOOGLE_PLACES_DAILY_LIMIT='999';
    assert.equal(dailyLimit('places_search'),5,'configuration cannot raise production ceiling');
  } finally {
    if(previous===undefined)delete process.env.GOOGLE_PLACES_DAILY_LIMIT;
    else process.env.GOOGLE_PLACES_DAILY_LIMIT=previous;
  }
});

test('Places quota stops at 5 across concurrent callers and multiple instances',async()=>{
  const previous=process.env.GOOGLE_PLACES_DAILY_LIMIT;
  try {
    delete process.env.GOOGLE_PLACES_DAILY_LIMIT;
    const db=fakeDatabase();
    // Repeated independent callers share the same mock database ledger.
    const outcomes=await Promise.all(Array.from({length:40},()=>reserveGoogleDailyQuota('places_search',db.getSql)));
    assert.equal(outcomes.filter(Boolean).length,5);
    assert.equal(db.state.get('places_search'),5);
    assert.equal(await reserveGoogleDailyQuota('places_search',db.getSql),false);
  } finally {
    if(previous===undefined)delete process.env.GOOGLE_PLACES_DAILY_LIMIT;
    else process.env.GOOGLE_PLACES_DAILY_LIMIT=previous;
  }
});

test('Routes quota stops at 25 and is independent from Places',async()=>{
  const previous=process.env.GOOGLE_ROUTES_DAILY_LIMIT;
  try {
    delete process.env.GOOGLE_ROUTES_DAILY_LIMIT;
    const db=fakeDatabase();
    const outcomes=await Promise.all(Array.from({length:35},()=>reserveGoogleDailyQuota('routes_compute',db.getSql)));
    assert.equal(outcomes.filter(Boolean).length,25);
    assert.equal(db.state.get('routes_compute'),25);
    assert.equal(await reserveGoogleDailyQuota('places_search',db.getSql),true);
    process.env.GOOGLE_ROUTES_DAILY_LIMIT='1';
    assert.equal(dailyLimit('routes_compute'),1);
    assert.equal(await reserveGoogleDailyQuota('routes_compute',db.getSql),false);
  } finally {
    if(previous===undefined)delete process.env.GOOGLE_ROUTES_DAILY_LIMIT;
    else process.env.GOOGLE_ROUTES_DAILY_LIMIT=previous;
  }
});
