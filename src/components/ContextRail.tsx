import React, { useState } from 'react';
import {
  Meeting,
  SummaryTemplate,
  ActionItem,
  Decision,
  Highlight,
  Participant,
} from '../types';
import { formatSeconds, formatDate } from '../utils/formatters';
import {
  FileText,
  CheckSquare,
  Award,
  Sparkles,
  Compass,
  Copy,
  Plus,
  Clock,
  User,
  ArrowRight,
  Check,
} from 'lucide-react';

interface ContextRailProps {
  meeting: Meeting;
  activeTemplate: SummaryTemplate;
  onTemplateChange: (template: SummaryTemplate) => void;
  onToggleActionItem: (actionId: string) => void;
  onAddActionItem: (action: Omit<ActionItem, 'id'>) => void;
  onSeek: (seconds: number) => void;
  onPlayFromHere: (seconds: number) => void;
  onCopyText: (text: string, label: string) => void;
}

export const ContextRail: React.FC<ContextRailProps> = ({
  meeting,
  activeTemplate,
  onTemplateChange,
  onToggleActionItem,
  onAddActionItem,
  onSeek,
  onPlayFromHere,
  onCopyText,
}) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'actions' | 'decisions' | 'highlights' | 'brief'
  >('summary');

  // New action item inline state
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(
    meeting.participants[0]?.name || 'Pravalika Reddy'
  );
  const [newActionDueDate, setNewActionDueDate] = useState('2026-10-05');

  const summaryData = meeting.summaries[activeTemplate] || meeting.summaries.general;

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    const matchedParticipant = meeting.participants.find(
      (p) => p.name === newActionAssignee
    );

    onAddActionItem({
      description: newActionText.trim(),
      assigneeId: matchedParticipant?.id || 'u1',
      assigneeName: newActionAssignee,
      dueDate: newActionDueDate,
      completed: false,
      meetingId: meeting.id,
      timestampSeconds: 0,
    });

    setNewActionText('');
    setIsAddingAction(false);
  };

  const copyFullSummary = () => {
    const text = `## ${meeting.title} — Executive Summary (${activeTemplate.toUpperCase()})
${summaryData.overview}

### Key Topics Discussed:
${summaryData.keyTopics
  .map(
    (topic) =>
      `* ${topic.title}\n${topic.notes.map((n) => `  - ${n}`).join('\n')}`
  )
  .join('\n\n')}

### Decisions:
${summaryData.decisionsSummary.map((d) => `* ${d}`).join('\n')}

### Next Steps:
${summaryData.nextSteps.map((s) => `* ${s}`).join('\n')}
`;
    onCopyText(text, 'Full summary copied to clipboard');
  };

  return (
    <div className="workspace-intel-rail">
      {/* Tab Navigation */}
      <div className="intel-rail-tabs">
        <button
          className={`intel-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <FileText size={13} />
          <span>Summary</span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <CheckSquare size={13} />
          <span>Actions</span>
          <span className="tab-badge">{meeting.actionItems.length}</span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'decisions' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisions')}
        >
          <Award size={13} />
          <span>Decisions</span>
          <span className="tab-badge">{meeting.decisions.length}</span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
        >
          <Sparkles size={13} />
          <span>Highlights</span>
          <span className="tab-badge">{meeting.highlights.length}</span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'brief' ? 'active' : ''}`}
          onClick={() => setActiveTab('brief')}
        >
          <Compass size={13} />
          <span>Context & Brief</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="intel-rail-content">
        {/* TAB 1: SUMMARY */}
        {activeTab === 'summary' && (
          <>
            <div className="template-selector-bar">
              <span className="template-label">Perspective:</span>
              <select
                className="template-select"
                value={activeTemplate}
                onChange={(e) => onTemplateChange(e.target.value as SummaryTemplate)}
              >
                <option value="general">Standard Executive</option>
                <option value="sales">Sales & Deal Intelligence</option>
                <option value="project">Engineering & Project Milestones</option>
                <option value="one-on-one">1:1 Coaching & Feedback</option>
              </select>
            </div>

            <div className="summary-overview-box">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span className="summary-section-title">Overview</span>
                <button
                  className="btn-ghost"
                  onClick={copyFullSummary}
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                {summaryData.overview}
              </p>
            </div>

            {/* Key Topics */}
            <div className="summary-section">
              <span className="summary-section-title">Key Discussions</span>
              {summaryData.keyTopics.map((topic, i) => (
                <div key={i} className="topic-card">
                  <h4 className="topic-title">{topic.title}</h4>
                  <ul className="topic-bullets">
                    {topic.notes.map((note, idx) => (
                      <li key={idx} className="topic-bullet-item">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="summary-section">
              <span className="summary-section-title">Synthesized Next Steps</span>
              <div className="topic-card">
                <ul className="topic-bullets">
                  {summaryData.nextSteps.map((step, i) => (
                    <li key={i} className="topic-bullet-item">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: ACTION ITEMS */}
        {activeTab === 'actions' && (
          <>
            <div className="actions-header-row">
              <span className="summary-section-title">
                Action Items ({meeting.actionItems.filter((a) => a.completed).length}/
                {meeting.actionItems.length})
              </span>
              <button
                className="btn-secondary"
                onClick={() => setIsAddingAction(!isAddingAction)}
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                <Plus size={12} />
                <span>{isAddingAction ? 'Cancel' : 'Add Item'}</span>
              </button>
            </div>

            {/* Inline Add Action Form */}
            {isAddingAction && (
              <form className="add-action-inline-box" onSubmit={handleCreateAction}>
                <input
                  type="text"
                  className="inline-input"
                  placeholder="What needs to be done?"
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="inline-input"
                    value={newActionAssignee}
                    onChange={(e) => setNewActionAssignee(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {meeting.participants.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="inline-input"
                    value={newActionDueDate}
                    onChange={(e) => setNewActionDueDate(e.target.value)}
                    style={{ width: '130px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setIsAddingAction(false)}
                    style={{ fontSize: '11px' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ fontSize: '11px', padding: '4px 10px' }}>
                    Save Action Item
                  </button>
                </div>
              </form>
            )}

            {/* Action Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {meeting.actionItems.map((action) => (
                <div key={action.id} className="action-item-card">
                  <button
                    className={`action-checkbox-btn ${action.completed ? 'completed' : ''}`}
                    onClick={() => onToggleActionItem(action.id)}
                    title={action.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {action.completed && <Check size={12} />}
                  </button>

                  <div className="action-body">
                    <span className={`action-text ${action.completed ? 'completed' : ''}`}>
                      {action.description}
                    </span>

                    <div className="action-meta-strip">
                      <span className="action-assignee-badge">
                        <User size={11} />
                        {action.assigneeName}
                      </span>
                      <span className="action-due-date">Due: {action.dueDate}</span>
                      {action.timestampSeconds !== undefined && action.timestampSeconds > 0 && (
                        <button
                          className="timestamp-pill"
                          onClick={() => onSeek(action.timestampSeconds!)}
                          title="Jump to where this action was discussed"
                        >
                          <Clock size={10} style={{ marginRight: 3 }} />
                          {formatSeconds(action.timestampSeconds)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB 3: DECISIONS */}
        {activeTab === 'decisions' && (
          <div className="decisions-list">
            <span className="summary-section-title">
              Recorded Decisions ({meeting.decisions.length})
            </span>

            {meeting.decisions.map((decision) => (
              <div key={decision.id} className="decision-card">
                <div className="decision-header">
                  <h4 className="decision-title">{decision.title}</h4>
                  <button
                    className="timestamp-pill"
                    onClick={() => onSeek(decision.timestampSeconds)}
                    title="Jump to discussion"
                  >
                    {formatSeconds(decision.timestampSeconds)}
                  </button>
                </div>

                <p className="decision-desc">{decision.description}</p>

                <div className="decision-meta">
                  <span className="badge-tag">Category: {decision.category}</span>
                  <span>Agreed by: <strong>{decision.decidedBy}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: HIGHLIGHTS */}
        {activeTab === 'highlights' && (
          <div className="highlights-list">
            <span className="summary-section-title">
              Key Moments & Quotes ({meeting.highlights.length})
            </span>

            {meeting.highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="highlight-item-card"
                onClick={() => onPlayFromHere(highlight.timestampSeconds)}
                title="Click to play snippet"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge-tag" style={{ color: 'var(--accent-amber)' }}>
                    {highlight.category.toUpperCase()}
                  </span>
                  <span className="timestamp-pill">
                    {formatSeconds(highlight.timestampSeconds)} ({highlight.durationSeconds}s)
                  </span>
                </div>

                <h4 className="highlight-title">{highlight.title}</h4>
                <p className="highlight-quote">"{highlight.excerpt}"</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Speaker: {highlight.speakerName}</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>Play Snippet →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: BRIEF & CONTEXT */}
        {activeTab === 'brief' && (
          <div className="brief-section">
            <div className="brief-card">
              <span className="brief-card-title">Previous Meeting Context</span>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {meeting.brief?.historicalContext ||
                  'No preceding meeting context logged for this discussion thread.'}
              </p>
              {meeting.brief?.previousMeetingDate && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Prior Sync: {formatDate(meeting.brief.previousMeetingDate)}
                </span>
              )}
            </div>

            {meeting.brief?.previousDecisions && meeting.brief.previousDecisions.length > 0 && (
              <div className="brief-card">
                <span className="brief-card-title">Prior Decisions Carried Over</span>
                <ul className="topic-bullets">
                  {meeting.brief.previousDecisions.map((dec, i) => (
                    <li key={i} className="topic-bullet-item">
                      {dec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.brief?.suggestedTalkingPoints && (
              <div className="brief-card">
                <span className="brief-card-title">Suggested Talking Points</span>
                <ul className="topic-bullets">
                  {meeting.brief.suggestedTalkingPoints.map((tp, i) => (
                    <li key={i} className="topic-bullet-item">
                      {tp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Speaking Time Ratio Distribution */}
            <div className="brief-card">
              <span className="brief-card-title">Speaking Time Distribution</span>
              <div className="speaking-ratio-bar-wrap">
                <div className="ratio-bar-segment">
                  {meeting.participants.map((p) => {
                    const ratio = meeting.stats.speakingRatio[p.id] || 0;
                    if (ratio === 0) return null;
                    return (
                      <div
                        key={p.id}
                        className="ratio-portion"
                        style={{
                          width: `${ratio}%`,
                          backgroundColor: p.avatarColor,
                        }}
                        title={`${p.name}: ${ratio}%`}
                      />
                    );
                  })}
                </div>

                <div className="ratio-legend">
                  {meeting.participants.map((p) => {
                    const ratio = meeting.stats.speakingRatio[p.id] || 0;
                    if (ratio === 0) return null;
                    return (
                      <div key={p.id} className="ratio-legend-item">
                        <div
                          className="legend-color-dot"
                          style={{ backgroundColor: p.avatarColor }}
                        />
                        <span>
                          {p.name.split(' ')[0]}: {ratio}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="brief-card">
              <span className="brief-card-title">Conversation Analytics</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Words Spoken:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                    {meeting.stats.wordsSpoken.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Alignment Index:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-emerald)', marginTop: 2 }}>
                    {meeting.stats.sentimentScore}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
