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
  Check,
  Zap,
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
    'brief' | 'actions' | 'decisions' | 'highlights' | 'context'
  >('brief');

  const [actionsFilter, setActionsFilter] = useState<'all' | 'my' | 'open' | 'done'>('all');
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(
    meeting.participants[0]?.name || 'Pravalika Reddy'
  );
  const [newActionDueDate, setNewActionDueDate] = useState('2026-10-05');

  const currentUser = 'Pravalika Reddy';
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
    onCopyText(text, 'Executive summary copied to clipboard');
  };

  // Filtered action items for the dedicated tab
  const filteredActions = meeting.actionItems.filter((action) => {
    if (actionsFilter === 'my') {
      return action.assigneeName.toLowerCase().includes(currentUser.toLowerCase());
    }
    if (actionsFilter === 'open') {
      return !action.completed;
    }
    if (actionsFilter === 'done') {
      return action.completed;
    }
    return true;
  });

  return (
    <div className="workspace-intel-rail">
      {/* Rail Tab Navigation */}
      <div className="intel-rail-tabs">
        <button
          className={`intel-tab-btn ${activeTab === 'brief' ? 'active' : ''}`}
          onClick={() => setActiveTab('brief')}
          title="Executive summary, key decisions, and immediate actions"
        >
          <Zap size={13} />
          <span>Brief</span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
          title="Action items task manager"
        >
          <CheckSquare size={13} />
          <span>Actions</span>
          <span className="tab-badge">
            {meeting.actionItems.filter((a) => !a.completed).length}
          </span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'decisions' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisions')}
          title="Recorded decisions ledger"
        >
          <Award size={13} />
          <span>Decisions</span>
          <span className="tab-badge">{meeting.decisions.length}</span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
          title="Key moments and soundbites"
        >
          <Sparkles size={13} />
          <span>Highlights</span>
          <span className="tab-badge">{meeting.highlights.length}</span>
        </button>

        <button
          className={`intel-tab-btn ${activeTab === 'context' ? 'active' : ''}`}
          onClick={() => setActiveTab('context')}
          title="Speaker dynamics and prior sync brief"
        >
          <Compass size={13} />
          <span>Dynamics</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="intel-rail-content">
        {/* TAB 1: EXECUTIVE BRIEF (UNIFIED KEY UNDERSTANDING + ACTIONS + DECISIONS) */}
        {activeTab === 'brief' && (
          <>
            {/* Perspective Selector */}
            <div className="template-selector-bar">
              <span className="template-label">Perspective:</span>
              <select
                className="template-select"
                value={activeTemplate}
                onChange={(e) => onTemplateChange(e.target.value as SummaryTemplate)}
              >
                <option value="general">Executive Overview</option>
                <option value="sales">Sales & Commercial Deal</option>
                <option value="project">Engineering & Architecture</option>
                <option value="one-on-one">1:1 Coaching & Alignment</option>
              </select>
            </div>

            {/* Overview Box */}
            <div className="summary-overview-box">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span className="summary-section-title">Synthesis</span>
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

            {/* Crucial Decisions Box (Immediate Scannability) */}
            <div className="summary-section">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="summary-section-title">
                  <Award size={13} color="#10b981" />
                  Key Decisions ({meeting.decisions.length})
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => setActiveTab('decisions')}
                  style={{ fontSize: '11px' }}
                >
                  View All →
                </button>
              </div>

              <div className="decisions-list">
                {meeting.decisions.slice(0, 3).map((decision) => (
                  <div key={decision.id} className="decision-card">
                    <div className="decision-header">
                      <h4 className="decision-title">{decision.title}</h4>
                      <button
                        className="timestamp-pill"
                        onClick={() => onSeek(decision.timestampSeconds)}
                        title="Jump to discussion in transcript"
                      >
                        {formatSeconds(decision.timestampSeconds)}
                      </button>
                    </div>
                    <p className="decision-desc">{decision.description}</p>
                    <div className="decision-meta">
                      <span className="badge-tag">{decision.category}</span>
                      <span>Decided by: <strong>{decision.decidedBy}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immediate Next Actions Box */}
            <div className="summary-section">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="summary-section-title">
                  <CheckSquare size={13} color="#f59e0b" />
                  Next Actions ({meeting.actionItems.filter((a) => !a.completed).length} open)
                </span>
                <button
                  className="btn-ghost"
                  onClick={() => setActiveTab('actions')}
                  style={{ fontSize: '11px' }}
                >
                  Manage →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {meeting.actionItems.slice(0, 4).map((action) => (
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Topics List */}
            <div className="summary-section">
              <span className="summary-section-title">Topics Discussed</span>
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
          </>
        )}

        {/* TAB 2: DEDICATED ACTION ITEMS */}
        {activeTab === 'actions' && (
          <>
            <div className="actions-header-row">
              <span className="summary-section-title">
                Task Management ({meeting.actionItems.filter((a) => a.completed).length}/
                {meeting.actionItems.length} done)
              </span>
              <button
                className="btn-secondary"
                onClick={() => setIsAddingAction(!isAddingAction)}
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                <Plus size={12} />
                <span>{isAddingAction ? 'Cancel' : 'New Task'}</span>
              </button>
            </div>

            {/* Actions Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              {(['all', 'my', 'open', 'done'] as const).map((filter) => (
                <button
                  key={filter}
                  className={`filter-pill ${actionsFilter === filter ? 'active' : ''}`}
                  onClick={() => setActionsFilter(filter)}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  {filter === 'all'
                    ? 'All'
                    : filter === 'my'
                    ? 'Assigned to Me'
                    : filter === 'open'
                    ? 'Open'
                    : 'Completed'}
                </button>
              ))}
            </div>

            {/* Inline Add Action Form */}
            {isAddingAction && (
              <form className="add-action-inline-box" onSubmit={handleCreateAction}>
                <input
                  type="text"
                  className="inline-input"
                  placeholder="What is the next action?"
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
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Action Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredActions.length === 0 ? (
                <div className="empty-state-box" style={{ padding: '24px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    No tasks found matching this filter.
                  </p>
                </div>
              ) : (
                filteredActions.map((action) => (
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
                            title="Jump to where this task was agreed"
                          >
                            <Clock size={10} style={{ marginRight: 3 }} />
                            {formatSeconds(action.timestampSeconds)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* TAB 3: DEDICATED DECISIONS */}
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
              Key Moments & Excerpts ({meeting.highlights.length})
            </span>

            {meeting.highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="highlight-item-card"
                onClick={() => onPlayFromHere(highlight.timestampSeconds)}
                title="Click to play excerpt"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span className="badge-tag" style={{ color: 'var(--accent-amber)' }}>
                    {highlight.category.toUpperCase()}
                  </span>
                  <span className="timestamp-pill">
                    {formatSeconds(highlight.timestampSeconds)} ({highlight.durationSeconds}s)
                  </span>
                </div>

                <h4 className="highlight-title">{highlight.title}</h4>
                <p className="highlight-quote">"{highlight.excerpt}"</p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Speaker: {highlight.speakerName}</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>Play Snippet →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: DYNAMICS & CONTEXT */}
        {activeTab === 'context' && (
          <div className="brief-section">
            {/* Speaking Time Ratio */}
            <div className="brief-card">
              <span className="brief-card-title">Participant Speaking Time</span>
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

            {/* Conversation Stats */}
            <div className="brief-card">
              <span className="brief-card-title">Session Metrics</span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Words Spoken:</span>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginTop: 2,
                    }}
                  >
                    {meeting.stats.wordsSpoken.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Consensus Index:</span>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--accent-emerald)',
                      marginTop: 2,
                    }}
                  >
                    {meeting.stats.sentimentScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Context */}
            <div className="brief-card">
              <span className="brief-card-title">Prior Sync Context</span>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {meeting.brief?.historicalContext ||
                  'No previous sync notes recorded for this thread.'}
              </p>
              {meeting.brief?.previousMeetingDate && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
                  Prior Sync: {formatDate(meeting.brief.previousMeetingDate)}
                </span>
              )}
            </div>

            {meeting.brief?.previousDecisions && meeting.brief.previousDecisions.length > 0 && (
              <div className="brief-card">
                <span className="brief-card-title">Carried Over Decisions</span>
                <ul className="topic-bullets">
                  {meeting.brief.previousDecisions.map((dec, i) => (
                    <li key={i} className="topic-bullet-item">
                      {dec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
