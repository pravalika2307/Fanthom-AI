import { Meeting, MeetingCategory } from '../types';

export type SearchResultType = 'transcript' | 'decision' | 'action_item' | 'highlight' | 'meeting';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  meetingId: string;
  meetingTitle: string;
  meetingCategory: MeetingCategory;
  meetingDate: string;
  speakerName?: string;
  speakerColor?: string;
  timestampSeconds: number;
  snippet: string;
  matchTerms: string[];
  score: number;
  extraMeta?: string;
}

// Stop words to strip for intent and keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'what', 'where', 'who', 'when', 'why', 'how', 'did',
  'we', 'our', 'my', 'me', 'i', 'you', 'your', 'about', 'say', 'tell', 'us',
  'have', 'has', 'had', 'been', 'there', 'this', 'that', 'these', 'those'
]);

/**
 * Extracts a smart excerpt centered around the first occurrence of match terms
 */
function createSmartSnippet(fullText: string, terms: string[], maxLen = 140): string {
  if (fullText.length <= maxLen) return fullText;

  let bestIndex = -1;
  const lower = fullText.toLowerCase();

  for (const term of terms) {
    if (!term) continue;
    const idx = lower.indexOf(term.toLowerCase());
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }

  if (bestIndex === -1) {
    return fullText.slice(0, maxLen) + '...';
  }

  const start = Math.max(0, bestIndex - Math.floor(maxLen / 3));
  const end = Math.min(fullText.length, start + maxLen);

  let snippet = fullText.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < fullText.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Executes a deterministic cross-meeting intelligence search
 */
export function executeSearch(query: string, meetings: Meeting[]): SearchResult[] {
  const rawQuery = query.trim();
  if (!rawQuery) return [];

  const lowerQuery = rawQuery.toLowerCase();

  // Natural Language Intent Detection
  const isDecisionQuery =
    lowerQuery.includes('decide') ||
    lowerQuery.includes('decision') ||
    lowerQuery.includes('agreed') ||
    lowerQuery.includes('consensus');

  const isActionQuery =
    lowerQuery.includes('action') ||
    lowerQuery.includes('task') ||
    lowerQuery.includes('todo') ||
    lowerQuery.includes('do next') ||
    lowerQuery.includes('next step');

  const isMyQuery =
    lowerQuery.includes('my') ||
    lowerQuery.includes('assigned to me') ||
    lowerQuery.includes('pravalika');

  const isConcernQuery =
    lowerQuery.includes('concern') ||
    lowerQuery.includes('risk') ||
    lowerQuery.includes('objection') ||
    lowerQuery.includes('problem') ||
    lowerQuery.includes('issue');

  const isPricingQuery =
    lowerQuery.includes('pricing') ||
    lowerQuery.includes('price') ||
    lowerQuery.includes('cost') ||
    lowerQuery.includes('contract') ||
    lowerQuery.includes('deal') ||
    lowerQuery.includes('sla') ||
    lowerQuery.includes('$');

  // Extract content words
  const queryTokens = lowerQuery
    .replace(/[^\w\s$]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

  // If all tokens were stop words, fall back to the raw query words
  const searchTerms = queryTokens.length > 0 ? queryTokens : [lowerQuery];

  const results: SearchResult[] = [];

  // Helper participant lookup map per meeting
  for (const meeting of meetings) {
    const participantMap = new Map(meeting.participants.map((p) => [p.id, p]));

    // 1. SEARCH TRANSCRIPTS (Primary Evidence)
    for (const segment of meeting.transcript) {
      const segLower = segment.text.toLowerCase();
      const speakerLower = segment.speakerName.toLowerCase();

      let matchScore = 0;
      const matchedTerms: string[] = [];

      // Exact full query match
      if (segLower.includes(lowerQuery)) {
        matchScore += 80;
        matchedTerms.push(lowerQuery);
      }

      // Keyword token matches
      for (const term of searchTerms) {
        if (segLower.includes(term)) {
          matchScore += 25;
          matchedTerms.push(term);
        }
        if (speakerLower.includes(term)) {
          matchScore += 35;
          matchedTerms.push(segment.speakerName);
        }
      }

      // Intent boosts only apply if terms matched or if intent specifically applies
      if (matchedTerms.length > 0 || (isConcernQuery && segment.sentiment === 'concern')) {
        if (isConcernQuery && segment.sentiment === 'concern') {
          matchScore += 40;
          if (!matchedTerms.includes('concern')) matchedTerms.push('concern');
        }
        if (isPricingQuery && (segLower.includes('$') || segLower.includes('tier') || segLower.includes('sla'))) {
          matchScore += 30;
        }
        if (segment.highlighted) {
          matchScore += 10;
        }
      }

      if (matchedTerms.length > 0 && matchScore > 0) {
        const participant = participantMap.get(segment.speakerId);
        results.push({
          id: `transcript-${segment.id}`,
          type: 'transcript',
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          meetingCategory: meeting.category,
          meetingDate: meeting.date,
          speakerName: segment.speakerName,
          speakerColor: participant?.avatarColor || '#38bdf8',
          timestampSeconds: segment.startTime,
          snippet: createSmartSnippet(segment.text, matchedTerms),
          matchTerms: matchedTerms,
          score: matchScore,
          extraMeta: segment.sentiment === 'concern' ? 'Expressed Concern' : segment.highlightTag,
        });
      }
    }

    // 2. SEARCH DECISIONS
    for (const decision of meeting.decisions) {
      const decText = `${decision.title} ${decision.description} ${decision.decidedBy}`.toLowerCase();
      let matchScore = 0;
      const matchedTerms: string[] = [];

      if (decText.includes(lowerQuery)) {
        matchScore += 75;
        matchedTerms.push(lowerQuery);
      }

      for (const term of searchTerms) {
        if (decText.includes(term)) {
          matchScore += 30;
          matchedTerms.push(term);
        }
      }

      if (isDecisionQuery && matchedTerms.length > 0) {
        matchScore += 50;
      }

      if (matchedTerms.length > 0 && matchScore > 0) {
        results.push({
          id: `decision-${decision.id}`,
          type: 'decision',
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          meetingCategory: meeting.category,
          meetingDate: meeting.date,
          speakerName: decision.decidedBy,
          timestampSeconds: decision.timestampSeconds,
          snippet: createSmartSnippet(decision.title + ': ' + decision.description, matchedTerms),
          matchTerms: matchedTerms,
          score: matchScore + 20, // Decision boost
          extraMeta: `Agreed Decision (${decision.category})`,
        });
      }
    }

    // 3. SEARCH ACTION ITEMS
    for (const action of meeting.actionItems) {
      const actionText = `${action.description} ${action.assigneeName}`.toLowerCase();
      let matchScore = 0;
      const matchedTerms: string[] = [];

      if (actionText.includes(lowerQuery)) {
        matchScore += 70;
        matchedTerms.push(lowerQuery);
      }

      for (const term of searchTerms) {
        if (actionText.includes(term)) {
          matchScore += 25;
          matchedTerms.push(term);
        }
      }

      if (isActionQuery && (matchedTerms.length > 0 || !action.completed)) {
        matchScore += 40;
        if (!matchedTerms.includes('action')) matchedTerms.push('action');
      }

      if (isMyQuery && action.assigneeName.toLowerCase().includes('pravalika')) {
        matchScore += 35;
        if (!matchedTerms.includes('Pravalika')) matchedTerms.push('Pravalika');
      }

      if (matchedTerms.length > 0 && matchScore > 0) {
        results.push({
          id: `action-${action.id}`,
          type: 'action_item',
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          meetingCategory: meeting.category,
          meetingDate: meeting.date,
          speakerName: action.assigneeName,
          timestampSeconds: action.timestampSeconds || 0,
          snippet: createSmartSnippet(action.description, matchedTerms),
          matchTerms: matchedTerms,
          score: matchScore + 15,
          extraMeta: action.completed ? 'Completed Task' : `Open Task (Due ${action.dueDate})`,
        });
      }
    }

    // 4. SEARCH HIGHLIGHTS
    for (const highlight of meeting.highlights) {
      const hlText = `${highlight.title} ${highlight.excerpt} ${highlight.speakerName}`.toLowerCase();
      let matchScore = 0;
      const matchedTerms: string[] = [];

      if (hlText.includes(lowerQuery)) {
        matchScore += 60;
        matchedTerms.push(lowerQuery);
      }

      for (const term of searchTerms) {
        if (hlText.includes(term)) {
          matchScore += 20;
          matchedTerms.push(term);
        }
      }

      if (matchedTerms.length > 0 && matchScore > 0) {
        results.push({
          id: `highlight-${highlight.id}`,
          type: 'highlight',
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          meetingCategory: meeting.category,
          meetingDate: meeting.date,
          speakerName: highlight.speakerName,
          timestampSeconds: highlight.timestampSeconds,
          snippet: createSmartSnippet(`"${highlight.excerpt}"`, matchedTerms),
          matchTerms: matchedTerms,
          score: matchScore + 10,
          extraMeta: `Highlight (${highlight.category})`,
        });
      }
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
