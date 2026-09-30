export type MeetingCategory = 'architecture' | 'sales' | 'engineering' | 'one-on-one' | 'general';

export type SummaryTemplate = 'general' | 'sales' | 'project' | 'one-on-one';

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  isHost?: boolean;
}

export interface TranscriptSegment {
  id: string;
  speakerId: string;
  speakerName: string;
  startTime: number; // in seconds
  endTime: number;
  text: string;
  highlighted?: boolean;
  highlightTag?: string;
  sentiment?: 'positive' | 'neutral' | 'concern';
}

export interface ActionItem {
  id: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  completed: boolean;
  timestampSeconds?: number;
  meetingId: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  timestampSeconds: number;
  decidedBy: string;
  category: 'architecture' | 'pricing' | 'process' | 'timeline' | 'product';
}

export interface Highlight {
  id: string;
  title: string;
  excerpt: string;
  speakerName: string;
  timestampSeconds: number;
  durationSeconds: number;
  category: 'objection' | 'decision' | 'breakthrough' | 'feedback' | 'quote';
  shareUrl?: string;
}

export interface TemplateSummary {
  overview: string;
  keyTopics: { title: string; notes: string[] }[];
  decisionsSummary: string[];
  nextSteps: string[];
}

export interface MeetingBrief {
  previousMeetingDate?: string;
  previousDecisions: string[];
  openActionItems: string[];
  suggestedTalkingPoints: string[];
  historicalContext: string;
}

export interface BriefCommitment {
  id: string;
  actionItemId?: string;
  assigneeName: string;
  description: string;
  dueDate: string;
  completed: boolean;
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  sourceTimestampSeconds: number;
}

export interface BriefDecision {
  id: string;
  title: string;
  category: string;
  decidedBy: string;
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  sourceTimestampSeconds: number;
  contextSummary: string;
}

export interface TalkingPoint {
  id: string;
  text: string;
  checked: boolean;
  sourceLabel?: string;
  sourceMeetingId?: string;
  sourceTimestampSeconds?: number;
}

export interface UnresolvedItem {
  id: string;
  question: string;
  raisedBy: string;
  sourceMeetingId: string;
  sourceMeetingTitle: string;
  sourceTimestampSeconds: number;
}

export interface UpcomingMeetingBrief {
  id: string;
  upcomingMeetingId: string;
  heroHeadline: string;
  keyContextDeltas: string[];
  relatedPreviousMeeting: {
    id: string;
    title: string;
    date: string;
    durationMinutes: number;
    unresolvedCount: number;
    commitmentsCount: number;
  };
  openCommitments: BriefCommitment[];
  carriedDecisions: BriefDecision[];
  unresolvedQuestions: UnresolvedItem[];
  talkingPoints: TalkingPoint[];
}

export interface Meeting {
  id: string;
  title: string;
  category: MeetingCategory;
  date: string; // ISO string
  durationMinutes: number;
  status: 'completed' | 'upcoming' | 'live';
  participants: Participant[];
  preview: string;
  location?: string;
  transcript: TranscriptSegment[];
  summaries: Record<SummaryTemplate, TemplateSummary>;
  actionItems: ActionItem[];
  decisions: Decision[];
  highlights: Highlight[];
  brief?: MeetingBrief;
  preMeetingBrief?: UpcomingMeetingBrief;
  relatedMeetingId?: string;
  stats: {
    wordsSpoken: number;
    speakingRatio: Record<string, number>; // participantId -> percentage
    sentimentScore: number; // 0-100
  };
}
