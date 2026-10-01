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
  Check,
  Plus,
  Copy,
  Clock,
  ExternalLink,
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
  activeTab?: 'brief' | 'decisions' | 'actions' | 'highlights' | 'context';
  onTabChange?: (tab: 'brief' | 'decisions' | 'actions' | 'highlights' | 'context') => void;
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
  activeTab: activeTabProp,
  onTabChange,
}) => {
  const [internalTab, setInternalTab] = useState<
    'brief' | 'decisions' | 'actions' | 'highlights' | 'context'
  >('brief');
  const activeTab = activeTabProp || internalTab;
  const setActiveTab = (tab: 'brief' | 'decisions' | 'actions' | 'highlights' | 'context') => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const [actionsFilter, setActionsFilter] = useState<'all' | 'my' | 'open' | 'done'>('all');
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState(
    meeting.participants[0]?.name || 'Pravalika Palle'
  );
  const [newActionDueDate, setNewActionDueDate] = useState('2026-10-05');

  const currentUser = 'Pravalika Palle';
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
    <aside className="workspace-intel-rail">
      {/* Editorial Meeting Index Header */}
      <div className="index-masthead">
        <span className="index-eyebrow">Meeting Index</span>
      </div>

      {/* Index Navigation Tabs (01 Brief, 02 Decisions, etc.) */}
      <nav className="index-nav-strip">
        <button
          className={`index-nav-link ${activeTab === 'brief' ? 'active' : ''}`}
          onClick={() => setActiveTab('brief')}
        >
          <span className="index-prefix">01</span>
          <span className="index-title">Brief</span>
        </button>

        <button
          className={`index-nav-link ${activeTab === 'decisions' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisions')}
        >
          <span className="index-prefix">02</span>
          <span className="index-title">Decisions</span>
          <span className="index-num-tag">{meeting.decisions.length}</span>
        </button>

        <button
          className={`index-nav-link ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <span className="index-prefix">03</span>
          <span className="index-title">Actions</span>
          <span className="index-num-tag">
            {meeting.actionItems.filter((a) => !a.completed).length}
          </span>
        </button>

        <button
          className={`index-nav-link ${activeTab === 'highlights' ? 'active' : ''}`}
          onClick={() => setActiveTab('highlights')}
        >
          <span className="index-prefix">04</span>
          <span className="index-title">Highlights</span>
          <span className="index-num-tag">{meeting.highlights.length}</span>
        </button>

        <button
          className={`index-nav-link ${activeTab === 'context' ? 'active' : ''}`}
          onClick={() => setActiveTab('context')}
        >
          <span className="index-prefix">05</span>
          <span className="index-title">Dynamics</span>
        </button>
      </nav>

      {/* Tab Content Panels — Rendered with Editorial Typographic Hierarchy */}
      <div className="index-content-scroll">
        {/* ==============================================================
            TAB 1: BRIEF
            ============================================================== */}
        {activeTab === 'brief' && (
          <div className="editorial-panel">
            {/* Perspective Selector */}
            <div className="editorial-perspective-row">
              <span className="perspective-label">Perspective</span>
              <select
                className="perspective-select"
                value={activeTemplate}
                onChange={(e) => onTemplateChange(e.target.value as SummaryTemplate)}
              >
                <option value="general">Executive Overview</option>
                <option value="sales">Sales & Commercial</option>
                <option value="project">Engineering & Architecture</option>
                <option value="one-on-one">1:1 Coaching</option>
              </select>
            </div>

            {/* Overview / Synthesis */}
            <section className="editorial-section">
              <div className="section-head-quiet">
                <h3 className="section-title-quiet">Synthesis</h3>
                <button
                  className="link-btn-quiet"
                  onClick={copyFullSummary}
                  title="Copy formatted summary"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
              <p className="editorial-body-text">{summaryData.overview}</p>
            </section>

            {/* Key Decisions Summary */}
            <section className="editorial-section">
              <div className="section-head-quiet">
                <h3 className="section-title-quiet">Decisions Agreed</h3>
                <span className="section-count-quiet">{meeting.decisions.length}</span>
              </div>
              <div className="editorial-rows-list">
                {meeting.decisions.map((dec) => (
                  <div key={dec.id} className="editorial-row">
                    <div className="editorial-row-top">
                      <span className="row-primary-text">{dec.title}</span>
                      <button
                        className="time-affordance-btn"
                        onClick={() => onSeek(dec.timestampSeconds)}
                        title={`Jump to ${formatSeconds(dec.timestampSeconds)}`}
                      >
                        {formatSeconds(dec.timestampSeconds)}
                      </button>
                    </div>
                    <span className="row-meta-sub">
                      Agreed by {dec.decidedBy} · {dec.category}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Immediate Action Items */}
            <section className="editorial-section">
              <div className="section-head-quiet">
                <h3 className="section-title-quiet">Immediate Actions</h3>
                <span className="section-count-quiet">
                  {meeting.actionItems.filter((a) => !a.completed).length} open
                </span>
              </div>
              <div className="editorial-rows-list">
                {meeting.actionItems.slice(0, 4).map((action) => (
                  <div
                    key={action.id}
                    className={`editorial-action-row ${action.completed ? 'completed' : ''}`}
                  >
                    <button
                      className={`action-check-btn ${action.completed ? 'checked' : ''}`}
                      onClick={() => onToggleActionItem(action.id)}
                      title={action.completed ? 'Mark open' : 'Mark completed'}
                    >
                      {action.completed && <Check size={11} />}
                    </button>
                    <div className="action-row-main">
                      <span className={`action-desc ${action.completed ? 'completed' : ''}`}>
                        {action.description}
                      </span>
                      <span className="action-meta-sub">
                        {action.assigneeName} · due {action.dueDate}
                      </span>
                    </div>
                    {action.timestampSeconds !== undefined && action.timestampSeconds > 0 && (
                      <button
                        className="time-affordance-btn"
                        onClick={() => onSeek(action.timestampSeconds!)}
                        title={`Jump to ${formatSeconds(action.timestampSeconds)}`}
                      >
                        {formatSeconds(action.timestampSeconds)}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Topics Discussed */}
            <section className="editorial-section">
              <div className="section-head-quiet">
                <h3 className="section-title-quiet">Topics Covered</h3>
              </div>
              <div className="editorial-topics-list">
                {summaryData.keyTopics.map((topic, i) => (
                  <div key={i} className="editorial-topic-block">
                    <h4 className="topic-name">{topic.title}</h4>
                    <ul className="topic-notes">
                      {topic.notes.map((note, idx) => (
                        <li key={idx} className="topic-note-item">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==============================================================
            TAB 2: DECISIONS
            ============================================================== */}
        {activeTab === 'decisions' && (
          <div className="editorial-panel">
            <div className="section-head-quiet">
              <h3 className="section-title-quiet">Decisions</h3>
              <span className="section-count-quiet">{meeting.decisions.length}</span>
            </div>

            <div className="editorial-decisions-list">
              {meeting.decisions.map((decision, idx) => (
                <div key={decision.id} className="editorial-decision-row">
                  <span className="decision-prefix-num">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="decision-row-body">
                    <span className="decision-title-text">{decision.title}</span>
                    <div className="decision-meta-line">
                      <span>{decision.decidedBy}</span>
                      <span className="meta-sep">·</span>
                      <button
                        className="decision-time-link"
                        onClick={() => {
                          const decTime = (meeting.audioUrl && decision.demoTimestampSeconds !== undefined) ? decision.demoTimestampSeconds : decision.timestampSeconds;
                          onSeek(decTime);
                        }}
                        title={`Jump to ${formatSeconds((meeting.audioUrl && decision.demoTimestampSeconds !== undefined) ? decision.demoTimestampSeconds : decision.timestampSeconds)}`}
                      >
                        {formatSeconds((meeting.audioUrl && decision.demoTimestampSeconds !== undefined) ? decision.demoTimestampSeconds : decision.timestampSeconds)}
                      </button>
                    </div>
                    {decision.description && (
                      <p className="decision-desc-text">{decision.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 3: ACTIONS
            ============================================================== */}
        {activeTab === 'actions' && (
          <div className="editorial-panel">
            <div className="section-head-quiet">
              <h3 className="section-title-quiet">Action Items</h3>
              <button
                className="link-btn-quiet"
                onClick={() => setIsAddingAction(!isAddingAction)}
              >
                <Plus size={11} />
                <span>{isAddingAction ? 'Cancel' : 'New Task'}</span>
              </button>
            </div>

            {/* Filter pills */}
            <div className="index-filter-strip">
              {(['all', 'my', 'open', 'done'] as const).map((filter) => (
                <button
                  key={filter}
                  className={`index-filter-btn ${actionsFilter === filter ? 'active' : ''}`}
                  onClick={() => setActionsFilter(filter)}
                >
                  {filter === 'all'
                    ? 'All'
                    : filter === 'my'
                    ? 'Assigned to Me'
                    : filter === 'open'
                    ? 'Open'
                    : 'Done'}
                </button>
              ))}
            </div>

            {/* Inline Add Action Form */}
            {isAddingAction && (
              <form className="editorial-add-form" onSubmit={handleCreateAction}>
                <input
                  type="text"
                  className="editorial-inline-input"
                  placeholder="Task deliverable description..."
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  autoFocus
                />
                <div className="form-sub-row">
                  <select
                    className="editorial-inline-input"
                    value={newActionAssignee}
                    onChange={(e) => setNewActionAssignee(e.target.value)}
                  >
                    {meeting.participants.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="editorial-inline-input"
                    value={newActionDueDate}
                    onChange={(e) => setNewActionDueDate(e.target.value)}
                    style={{ width: '130px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="link-btn-quiet"
                    onClick={() => setIsAddingAction(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-outline-quiet">
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Actions List */}
            <div className="editorial-rows-list">
              {filteredActions.length === 0 ? (
                <p className="empty-sub-text">No action items matching this filter.</p>
              ) : (
                filteredActions.map((action) => (
                  <div
                    key={action.id}
                    className={`editorial-action-row ${action.completed ? 'completed' : ''}`}
                  >
                    <button
                      className={`action-check-btn ${action.completed ? 'checked' : ''}`}
                      onClick={() => onToggleActionItem(action.id)}
                      title={action.completed ? 'Mark open' : 'Mark completed'}
                    >
                      {action.completed && <Check size={11} />}
                    </button>
                    <div className="action-row-main">
                      <span className={`action-desc ${action.completed ? 'completed' : ''}`}>
                        {action.description}
                      </span>
                      <span className="action-meta-sub">
                        {action.assigneeName} · due {action.dueDate}
                      </span>
                    </div>
                    {((action.demoTimestampSeconds !== undefined && action.demoTimestampSeconds > 0) || (action.timestampSeconds !== undefined && action.timestampSeconds > 0)) && (() => {
                      const actTime = (meeting.audioUrl && action.demoTimestampSeconds !== undefined) ? action.demoTimestampSeconds : action.timestampSeconds!;
                      return (
                        <button
                          className="time-affordance-btn"
                          onClick={() => onSeek(actTime)}
                          title={`Jump to ${formatSeconds(actTime)}`}
                        >
                          {formatSeconds(actTime)}
                        </button>
                      );
                    })()}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 4: HIGHLIGHTS
            ============================================================== */}
        {activeTab === 'highlights' && (
          <div className="editorial-panel">
            <div className="section-head-quiet">
              <h3 className="section-title-quiet">Highlights</h3>
              <span className="section-count-quiet">{meeting.highlights.length} soundbites</span>
            </div>

            <div className="editorial-rows-list">
              {meeting.highlights.map((highlight) => {
                const hlTime = (meeting.audioUrl && highlight.demoTimestampSeconds !== undefined) ? highlight.demoTimestampSeconds : highlight.timestampSeconds;
                return (
                  <div
                    key={highlight.id}
                    className="editorial-highlight-row"
                    onClick={() => onPlayFromHere(hlTime)}
                    title="Click to seek and play excerpt"
                  >
                    <blockquote className="highlight-quote-text">
                      "{highlight.excerpt}"
                    </blockquote>
                    <div className="highlight-meta-row">
                      <span className="highlight-speaker">{highlight.speakerName}</span>
                      <button
                        className="time-affordance-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeek(hlTime);
                        }}
                      >
                        {formatSeconds(hlTime)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 5: DYNAMICS
            ============================================================== */}
        {activeTab === 'context' && (
          <div className="editorial-panel">
            <div className="section-head-quiet">
              <h3 className="section-title-quiet">Speaking Distribution</h3>
            </div>

            {/* Quiet Speaking Distribution Table */}
            <div className="speaking-distribution-list">
              {meeting.participants.map((p) => {
                const ratio = meeting.stats.speakingRatio[p.id] || 0;
                if (ratio === 0) return null;
                return (
                  <div key={p.id} className="speaking-dist-row">
                    <div className="speaking-dist-left">
                      <span className="dist-name">{p.name}</span>
                      <span className="dist-role">{p.role.split(',')[0]}</span>
                    </div>
                    <div className="speaking-dist-right">
                      <div className="dist-bar-track">
                        <div
                          className="dist-bar-fill"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                      <span className="dist-pct">{ratio}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prior Context Section */}
            {meeting.brief?.historicalContext && (
              <section className="editorial-section" style={{ marginTop: 24 }}>
                <div className="section-head-quiet">
                  <h3 className="section-title-quiet">Prior Sync Record</h3>
                  {meeting.brief.previousMeetingDate && (
                    <span className="section-count-quiet">
                      {formatDate(meeting.brief.previousMeetingDate)}
                    </span>
                  )}
                </div>
                <p className="editorial-body-text">{meeting.brief.historicalContext}</p>

                {meeting.brief.previousDecisions && meeting.brief.previousDecisions.length > 0 && (
                  <ul className="topic-notes" style={{ marginTop: 8 }}>
                    {meeting.brief.previousDecisions.map((dec, i) => (
                      <li key={i} className="topic-note-item">
                        {dec}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
