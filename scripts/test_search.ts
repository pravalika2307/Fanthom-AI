import { seededMeetings } from '../src/data/seededMeetings';
import { executeSearch, SearchResult } from '../src/utils/searchEngine';

console.log('=== RUNNING CROSS-MEETING INTELLIGENCE SEARCH TESTS ===\n');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Search for 'Redis'
const redisResults = executeSearch('Redis', seededMeetings);
assert(redisResults.length > 0, `Search for 'Redis' returned ${redisResults.length} results`);
assert(redisResults.some(r => r.type === 'decision' && r.snippet.toLowerCase().includes('redis')), "Found Redis decision");
assert(redisResults.some(r => r.type === 'transcript' && r.meetingId === 'meeting-arch-q4'), "Found Redis transcript segment in Architecture meeting");

// 2. Search for 'pricing'
const pricingResults = executeSearch('pricing', seededMeetings);
assert(pricingResults.length > 0, `Search for 'pricing' returned ${pricingResults.length} results`);
assert(pricingResults.some(r => r.snippet.includes('28') || r.snippet.toLowerCase().includes('contract') || r.snippet.toLowerCase().includes('pricing')), "Found pricing result with seat price or commercial terms");

// 3. Search for 'action items'
const actionResults = executeSearch('action items', seededMeetings);
assert(actionResults.length > 0, `Search for 'action items' returned ${actionResults.length} results`);
assert(actionResults.some(r => r.type === 'action_item'), "Found action item results");

// 4. Search for a speaker name: 'Dave Kowalski'
const speakerResults = executeSearch('Dave Kowalski', seededMeetings);
assert(speakerResults.length > 0, `Search for speaker 'Dave Kowalski' returned ${speakerResults.length} results`);
assert(speakerResults.some(r => r.speakerName === 'Dave Kowalski'), "Found speech turns by Dave Kowalski");

// 5. Search for a phrase appearing in the 58-minute architecture meeting: 'split-brain'
const splitBrainResults = executeSearch('split-brain', seededMeetings);
assert(splitBrainResults.length > 0, `Search for 'split-brain' returned ${splitBrainResults.length} results`);
assert(splitBrainResults[0].meetingId === 'meeting-arch-q4', "First result is from 58-min Architecture meeting");
assert(splitBrainResults[0].timestampSeconds === 63, `Expected timestamp 63s (01:03), got ${splitBrainResults[0].timestampSeconds}s`);

// 6. Natural Language Query: "Where did we decide to use Redis?"
const nlRedisResults = executeSearch('Where did we decide to use Redis?', seededMeetings);
assert(nlRedisResults.length > 0, `NL query returned ${nlRedisResults.length} results`);
assert(nlRedisResults[0].type === 'decision' || nlRedisResults[0].type === 'transcript', "Top result is decision or transcript turn");

// 7. Natural Language Query: "What did customers say about pricing?"
const nlPricingResults = executeSearch('What did customers say about pricing?', seededMeetings);
assert(nlPricingResults.length > 0, `NL query for pricing returned ${nlPricingResults.length} results`);
assert(nlPricingResults.some(r => r.meetingCategory === 'sales' || r.snippet.includes('$28')), "Found commercial sales match");

// 8. Natural Language Query: "What are my open action items?"
const nlActionResults = executeSearch('What are my open action items?', seededMeetings);
assert(nlActionResults.length > 0, `NL query for open action items returned ${nlActionResults.length} results`);
assert(nlActionResults.some(r => r.type === 'action_item' && r.speakerName?.includes('Pravalika')), "Found action item assigned to Pravalika");

// 9. Natural Language Query: "Who raised the migration concern?"
const nlConcernResults = executeSearch('Who raised the migration concern?', seededMeetings);
assert(nlConcernResults.length > 0, `NL query for migration concern returned ${nlConcernResults.length} results`);
assert(nlConcernResults.some(r => r.extraMeta === 'Expressed Concern' || r.type === 'transcript'), "Found concern match");

// 10. Empty Query & No Result handling
const emptyResults = executeSearch('', seededMeetings);
assert(emptyResults.length === 0, "Empty query returns 0 results cleanly");

const gibberishResults = executeSearch('xyzabc999nonexistent', seededMeetings);
assert(gibberishResults.length === 0, "Non-existent term returns 0 results cleanly");

console.log('\n🎉 ALL 10 CROSS-MEETING INTELLIGENCE SEARCH TESTS PASSED SUCCESSFULLY!');
