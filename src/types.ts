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
  stats: {
    wordsSpoken: number;
    speakingRatio: Record<string, number>; // participantId -> percentage
    sentimentScore: number; // 0-100
  };
}
