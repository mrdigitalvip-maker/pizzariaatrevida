import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inaugurationTitle} from '../public/inauguration.js';
const html=readFileSync('public/index.html','utf8');assert.equal((html.match(/<h1>/g)||[]).length,1);assert.match(html,/<link rel="canonical" href="https:\/\/pizzariaatrevida.pizza\/">/);assert.equal((html.match(/application\/ld\+json/g)||[]).length,1);const schema=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);assert.equal(schema.url,'https://pizzariaatrevida.pizza');assert.equal(schema.geo,undefined);assert.equal(schema.aggregateRating,undefined);assert.doesNotMatch(html,/href="\/equipe"/);
assert.equal(inaugurationTitle(Date.parse('2026-10-09T12:00:00-03:00')),'Inauguração hoje!');assert.equal(inaugurationTitle(Date.parse('2026-10-11T23:59:59-03:00')),'Ressaca da inauguração');assert.equal(inaugurationTitle(Date.parse('2026-10-12T00:00:00-03:00')),'');assert.equal(inaugurationTitle(Date.parse('2026-10-09T12:00:00-03:00'),{active:false,value:10}),'');
console.log('PASS: official canonical, single schema/H1, no invented coordinates/reviews, private link absent, inauguration expiry at Bahia midnight.');
