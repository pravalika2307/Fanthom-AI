import { formatSeconds, formatDate, formatDateTime } from '../src/utils/formatters';
import { generateMeetingMarkdown, generateMeetingJson, generateActionItemsCsv } from '../src/utils/exportMeeting';
import { seededMeetings } from '../src/data/seededMeetings';
import { ActionItem } from '../src/types';

console.log('=== RUNNING FANTHOM AI CORE UNIT TESTS ===\n');

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// ----------------------------------------------------
// 1. Time & Date Formatter Unit Tests
// ----------------------------------------------------
console.log('--- 1. Formatter Tests ---');
assert(formatSeconds(0) === '00:00', 'formatSeconds(0) returns 00:00');
assert(formatSeconds(9) === '00:09', 'formatSeconds(9) returns 00:09');
assert(formatSeconds(60) === '01:00', 'formatSeconds(60) returns 01:00');
assert(formatSeconds(125) === '02:05', 'formatSeconds(125) returns 02:05');
assert(formatSeconds(3600) === '1:00:00', 'formatSeconds(3600) returns 1:00:00');
assert(formatSeconds(3665) === '1:01:05', 'formatSeconds(3665) returns 1:01:05');
assert(formatSeconds(-10) === '00:00', 'Negative seconds clamped to 00:00');
assert(formatSeconds(NaN) === '00:00', 'NaN seconds returns 00:00');

const formattedDate = formatDate('2026-10-01');
assert(formattedDate.length > 0, `formatDate produces readable date string: "${formattedDate}"`);

// ----------------------------------------------------
// 2. Meeting Markdown Export Unit Tests
// ----------------------------------------------------
console.log('\n--- 2. Markdown Export Tests ---');
const archMeeting = seededMeetings.find((m) => m.id === 'meeting-arch-q4')!;
assert(Boolean(archMeeting), 'Found meeting-arch-q4 fixture');

const markdown = generateMeetingMarkdown(archMeeting, 'general');
assert(markdown.includes(`# ${archMeeting.title}`), 'Markdown includes meeting title');
assert(markdown.includes('## 1. Executive Summary'), 'Markdown includes executive summary section');
assert(markdown.includes('## 3. Decisions Log'), 'Markdown includes decisions log');
assert(markdown.includes('## 4. Action Items & Commitments'), 'Markdown includes action items');
assert(markdown.includes('## 6. Complete Dialogue Transcript'), 'Markdown includes complete dialogue transcript');
assert(markdown.includes('Pravalika Palle'), 'Markdown preserves Pravalika Palle host name');

// ----------------------------------------------------
// 3. Meeting JSON Artifact Export Unit Tests
// ----------------------------------------------------
console.log('\n--- 3. JSON Export Tests ---');
const jsonExport = generateMeetingJson(archMeeting);
const parsedMeeting = JSON.parse(jsonExport);
assert(parsedMeeting.id === archMeeting.id, 'JSON artifact parses with matching id');
assert(parsedMeeting.title === archMeeting.title, 'JSON artifact parses with matching title');
assert(parsedMeeting.transcript.length === archMeeting.transcript.length, 'JSON artifact preserves all transcript turns');

// ----------------------------------------------------
// 4. Action Items CSV Generation & RFC 4180 Escaping Tests
// ----------------------------------------------------
console.log('\n--- 4. Action Items CSV Export Tests ---');
const testActionItems: ActionItem[] = [
  {
    id: 't1',
    meetingId: 'test-1',
    description: 'Deploy Redis cluster with sentinel failover',
    assigneeId: 'u1',
    assigneeName: 'Marcus Vance',
    dueDate: '2026-10-08',
    completed: false,
  },
  {
    id: 't2',
    meetingId: 'test-1',
    description: 'Review SLA, benchmark "p99 latency", and publish report',
    assigneeId: 'u2',
    assigneeName: 'Pravalika Palle',
    dueDate: '2026-10-05',
    completed: true,
  },
];

const csv = generateActionItemsCsv(testActionItems, 'Q4 Core Architecture');
assert(csv.startsWith('Task Description,Assignee,Due Date,Status,Meeting Context'), 'CSV has standard header row');
assert(csv.includes('Deploy Redis cluster with sentinel failover,Marcus Vance,2026-10-08,Open,Q4 Core Architecture'), 'Normal row encoded without unnecessary escaping');
assert(csv.includes('"Review SLA, benchmark ""p99 latency"", and publish report"'), 'Commas and inner quotes properly RFC 4180 escaped in CSV');

console.log('\n🎉 ALL CORE UNIT TESTS PASSED SUCCESSFULLY!\n');
