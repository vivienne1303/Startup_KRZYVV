const assert = require('node:assert/strict');
const { browse, locationLabel, isGlobal } = require('../js/opportunity-filters');
const normalize = require('../backend/utils/opportunityGeography');
const service = require('../backend/services/opportunityBrowseService');
const fixtures = [
  { id: 'world', title: 'Robotics challenge', category: 'Competitions', host_country: 'SG', mode: 'in_person', eligibility_scope: 'worldwide', eligible_countries: [] },
  { id: 'sg', title: 'Robotics workshop', category: 'Workshops', mode: 'online', eligibility_scope: 'countries', eligible_countries: ['SG'] },
  { id: 'multi', title: 'Regional art', category: 'Competitions', mode: 'hybrid', eligibility_scope: 'countries', eligible_countries: ['MY','SG'] },
  { id: 'us', title: 'Robotics local', category: 'Competitions', mode: 'online', eligibility_scope: 'countries', eligible_countries: ['US'] },
  { id: 'unknown', title: 'Online global-looking title', category: 'Competitions', mode: 'online', location: 'Singapore' },
];
const ids = filters => browse(fixtures, filters).opportunities.map(x => x.id);
assert.deepEqual(ids({country:'global'}), ['world','multi']);
assert.deepEqual(ids({country:'SG'}), ['world','sg','multi']);
assert.deepEqual(ids({country:'SG', search:'robotics'}), ['world','sg']);
assert.deepEqual(ids({country:'SG', category:'Competitions'}), ['world','multi']);
assert.deepEqual(ids({country:'SG', category:'Competitions', detail:'online'}), ['multi']);
assert.deepEqual(ids({country:'SG', mode:'online'}), ['sg']);
assert.deepEqual(ids({country:'US'}), ['world','us']);
assert.equal(isGlobal(fixtures[4]), false, 'Online and location do not establish eligibility');
assert.equal(locationLabel(fixtures[0]), 'Singapore · Open worldwide');
assert.equal(locationLabel(fixtures[1]), 'Online · Singapore applicants');
assert.equal(locationLabel(fixtures[4]), 'Online · Eligibility not specified');
assert.equal(locationLabel(fixtures[0], 'zh'), '新加坡 · 全球均可申请');
assert.deepEqual(ids({search:'新加坡', country:'SG'}), ['world','sg','multi']);
assert.deepEqual(browse(fixtures).facets.countries, ['MY','SG','US']);
assert.equal(browse(fixtures, {country:'SG', search:'no-such-opportunity'}).total, 0);
const thousand = Array.from({length:1001}, (_,i) => ({...fixtures[0], id:String(i)}));
assert.equal(browse(thousand).opportunities.length, 25);
assert.equal(browse(thousand,{page:41}).opportunities[0].id,'1000');
assert.equal(browse(thousand,{page:999}).page,41);
assert.equal(browse(thousand,{page:2}).opportunities[0].id,'25');
assert.equal(new Set(Array.from({length:41},(_,i)=>browse(thousand,{page:i+1}).opportunities).flat().map(x=>x.id)).size,1001);
assert.deepEqual(normalize({host_country:'sg', eligibility_scope:'countries', eligible_countries:['sg','MY','SG'], travel_required:false}), {host_country:'SG',eligibility_scope:'countries',eligible_countries:['SG','MY'],travel_required:false});
assert.deepEqual(normalize({title:'Unrelated update'}), {}, 'Partial updates preserve geography');
assert.throws(()=>normalize({eligibility_scope:'worldwide',eligible_countries:['SG']}));
assert.throws(()=>normalize({eligibility_scope:'countries',eligible_countries:[]}));
assert.throws(()=>normalize({host_country:'Singapore'}));
assert.throws(()=>normalize({travel_required:'false'}));
(async () => {
  const ranges = [];
  const query = {select(){return this;},eq(){return this;},or(){return this;},order(){return this;},async range(a,b){ranges.push([a,b]);return {data:thousand.slice(a,b+1)};}};
  service.invalidate();
  const result = await service.browseOpportunities({from:()=>query},{page:41});
  assert.equal(result.total,1001);
  assert.equal(result.opportunities.length,1);
  assert.deepEqual(ranges,[[0,499],[500,999],[1000,1499]]);
  await service.browseOpportunities({from:()=>query},{country:'global'});
  assert.equal(ranges.length,3,'Subsequent filter requests reuse the short-lived public cache');
  console.log('Passed: global, country, keyword, category, format/detail, unknown eligibility, EN/ZH, validation, 1001-record pagination and batched database reads. No live writes.');
})().catch(error=>{console.error(error);process.exitCode=1;});
