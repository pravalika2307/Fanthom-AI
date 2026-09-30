import React, { useState } from 'react';
import { Meeting, MeetingCategory } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  Calendar,
  Clock,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Award,
  Video,
  ExternalLink,
  Filter,
  CheckCircle2,
  Compass,
  AlertCircle,
} from 'lucide-react';

interface DashboardProps {
  meetings: Meeting[];
  onSelectMeeting: (meetingId: string) => void;
  onOpenBrief: (meetingId: string) => void;
  searchQuery: string;
  onSimulateJoin: (title: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  meetings,
  onSelectMeeting,
  onOpenBrief,
  searchQuery,
  onSimulateJoin,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | MeetingCategory>('all');
  const [onlyMyActions, setOnlyMyActions] = useState<boolean>(false);

  const currentUser = 'Pravalika Reddy';

  // Separate upcoming and completed
  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming');
  const completedMeetings = meetings.filter((m) => m.status === 'completed');

  // Filter meetings based on active tab, search query, and "My Actions" filter
  const filteredMeetings = meetings.filter((meeting) => {
    let matchesTab = true;
    if (activeTab === 'upcoming') {
      matchesTab = meeting.status === 'upcoming';
    } else if (activeTab !== 'all') {
      matchesTab = meeting.category === activeTab;
    }

    const matchesSearch =
      searchQuery.trim() === '' ||
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      meeting.transcript.some((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMyActions =
      !onlyMyActions ||
      meeting.actionItems.some(
        (a) => a.assigneeName.toLowerCase().includes(currentUser.toLowerCase()) && !a.completed
      );

    return matchesTab && matchesSearch && matchesMyActions;
  });

  // Calculate high-signal aggregates
  const totalCompleted = completedMeetings.length;
  const pendingActions = meetings.reduce(
    (acc, m) => acc + m.actionItems.filter((a) => !a.completed).length,
    0
  );
  const myPendingActions = meetings.reduce(
    (acc, m) =>
      acc +
      m.actionItems.filter(
        (a) => a.assigneeName.toLowerCase().includes(currentUser.toLowerCase()) && !a.completed
      ).length,
    0
  );
  const totalDecisions = meetings.reduce((acc, m) => acc + m.decisions.length, 0);

  const getCategoryClass = (category: MeetingCategory) => {
    switch (category) {
      case 'architecture':
        return 'cat-architecture';
      case 'sales':
        return 'cat-sales';
      case 'engineering':
        return 'cat-engineering';
      case 'one-on-one':
        return 'cat-one-on-one';
      default:
        return 'cat-general';
    }
  };

  return (
    <div className="dashboard-view">
      {/* Editorial Header & Activity Ledger Status */}
      <div className="dashboard-header-strip">
        <div>
          <h1 className="dashboard-title">Meetings & Conversation Ledger</h1>
          <p className="dashboard-subtitle">
            Prepare before calls with intelligence briefs; review transcripts, decisions, and tasks after
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="btn-secondary"
            onClick={() => onSimulateJoin('Sprint Retro & Infrastructure Planning')}
            title="Simulate notetaker bot joining calendar sync"
          >
            <Video size={13} />
            <span>Simulate Notetaker Bot</span>
          </button>
        </div>
      </div>

      {/* High-Signal Summary Bar */}
      <div className="ledger-summary-strip">
        <div className="ledger-stat-item">
          <span className="ledger-stat-label">Upcoming (To Prepare)</span>
          <span className="ledger-stat-value" style={{ color: 'var(--accent-cyan)' }}>
            {upcomingMeetings.length}
          </span>
        </div>
        <div className="ledger-stat-divider" />
        <div className="ledger-stat-item">
          <span className="ledger-stat-label">Past Conversations</span>
          <span className="ledger-stat-value">{totalCompleted}</span>
        </div>
        <div className="ledger-stat-divider" />
        <div className="ledger-stat-item">
          <span className="ledger-stat-label">Open Commitments</span>
          <span className="ledger-stat-value" style={{ color: 'var(--accent-amber)' }}>
            {pendingActions}
          </span>
          {myPendingActions > 0 && (
            <span className="ledger-sub-tag">({myPendingActions} assigned to you)</span>
          )}
        </div>
        <div className="ledger-stat-divider" />
        <div className="ledger-stat-item">
          <span className="ledger-stat-label">Decisions Logged</span>
          <span className="ledger-stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {totalDecisions}
          </span>
        </div>
      </div>

      {/* UPCOMING MEETINGS PREPARATION HIGHLIGHT STRIP (Visible when in All or Upcoming view) */}
      {(activeTab === 'all' || activeTab === 'upcoming') && upcomingMeetings.length > 0 && (
        <div className="upcoming-prep-section">
          <div className="upcoming-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={14} color="var(--accent-cyan)" />
              <span className="upcoming-section-title">
                Upcoming Sessions — Prepare with Pre-Meeting Briefs
              </span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Context carried forward from previous meetings
            </span>
          </div>

          <div className="upcoming-cards-grid">
            {upcomingMeetings.map((upcoming) => (
              <div
                key={upcoming.id}
                className="upcoming-brief-card"
                onClick={() => onOpenBrief(upcoming.id)}
              >
                <div className="upcoming-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="upcoming-kicker-tag">PRE-MEETING BRIEF</span>
                    <span className={`meeting-category-tag ${getCategoryClass(upcoming.category)}`}>
                      {upcoming.category}
                    </span>
                  </div>
                  <span className="upcoming-time-tag">
                    <Calendar size={11} style={{ marginRight: 3 }} />
                    {formatDateTime(upcoming.date)}
                  </span>
                </div>

                <h3 className="upcoming-card-title">{upcoming.title}</h3>
                <p className="upcoming-card-desc">{upcoming.preview}</p>

                {/* Connected Previous Meeting Context */}
                {upcoming.preMeetingBrief?.relatedPreviousMeeting && (
                  <div className="upcoming-connected-strip">
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Connected to: </span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {upcoming.preMeetingBrief.relatedPreviousMeeting.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      ({upcoming.preMeetingBrief.openCommitments.length} commitments ·{' '}
                      {upcoming.preMeetingBrief.carriedDecisions.length} decisions)
                    </span>
                  </div>
                )}

                <div className="upcoming-card-footer">
                  <div className="participant-avatar-group">
                    {upcoming.participants.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="participant-avatar"
                        style={{ backgroundColor: p.avatarColor }}
                        title={`${p.name} (${p.role})`}
                      >
                        {p.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    ))}
                    {upcoming.participants.length > 5 && (
                      <div className="avatar-overflow">
                        +{upcoming.participants.length - 5}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn-primary"
                    style={{ fontSize: '11.5px', padding: '4px 10px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBrief(upcoming.id);
                    }}
                  >
                    <Compass size={12} />
                    <span>Prepare Brief →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and View Controls Bar */}
      <div className="dashboard-filters-bar">
        <div className="filter-pills">
          <button
            className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Conversations ({meetings.length})
          </button>
          <button
            className={`filter-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <Compass size={11} style={{ marginRight: 3 }} />
            Upcoming ({upcomingMeetings.length})
          </button>
          <button
            className={`filter-pill ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            Architecture
          </button>
          <button
            className={`filter-pill ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            Sales
          </button>
          <button
            className={`filter-pill ${activeTab === 'engineering' ? 'active' : ''}`}
            onClick={() => setActiveTab('engineering')}
          >
            Engineering
          </button>
          <button
            className={`filter-pill ${activeTab === 'one-on-one' ? 'active' : ''}`}
            onClick={() => setActiveTab('one-on-one')}
          >
            1:1 Reviews
          </button>
        </div>

        <div className="filter-tools-right">
          <button
            className={`filter-pill ${onlyMyActions ? 'active' : ''}`}
            onClick={() => setOnlyMyActions(!onlyMyActions)}
            title="Filter to meetings with open tasks assigned to you"
          >
            <CheckCircle2 size={12} />
            <span>My Open Tasks Only</span>
          </button>

          <span className="filter-count-badge">
            {filteredMeetings.length} of {meetings.length} conversations
          </span>
        </div>
      </div>

      {/* Meetings List */}
      <div className="meetings-list">
        {filteredMeetings.length === 0 ? (
          <div className="empty-state-box">
            <Filter size={24} color="#64748b" style={{ marginBottom: 12 }} />
            <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: 4 }}>
              No matching meetings found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 16px' }}>
              {onlyMyActions
                ? "You don't have any incomplete action items in the selected category."
                : searchQuery
                ? `No meetings or transcript dialogue matched "${searchQuery}".`
                : "No meetings found in this category."}
            </p>
            {(onlyMyActions || searchQuery || activeTab !== 'all') && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setActiveTab('all');
                  setOnlyMyActions(false);
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const isUpcoming = meeting.status === 'upcoming';
            const hasMyPending = meeting.actionItems.some(
              (a) => a.assigneeName.toLowerCase().includes(currentUser.toLowerCase()) && !a.completed
            );

            return (
              <div
                key={meeting.id}
                className="meeting-row-card"
                onClick={() =>
                  isUpcoming ? onOpenBrief(meeting.id) : onSelectMeeting(meeting.id)
                }
              >
                {/* Main Meeting Info */}
                <div className="meeting-main-info">
                  <div className="meeting-title-row">
                    <span className={`meeting-category-tag ${getCategoryClass(meeting.category)}`}>
                      {meeting.category}
                    </span>
                    <h3 className="meeting-card-title">{meeting.title}</h3>
                    {isUpcoming ? (
                      <span className="upcoming-badge-pill">Upcoming · Prepare</span>
                    ) : (
                      hasMyPending && (
                        <span className="my-task-indicator" title="You have open action items in this meeting">
                          Action Needed
                        </span>
                      )
                    )}
                  </div>

                  <p className="meeting-preview-text">
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {isUpcoming ? 'Prep Focus: ' : 'Key Outcome: '}
                    </strong>
                    {meeting.preview}
                  </p>

                  <div className="meeting-meta-row">
                    <span className="meta-item">
                      <Calendar size={12} />
                      {formatDateTime(meeting.date)}
                    </span>
                    <span className="meta-item">
                      <Clock size={12} />
                      {meeting.durationMinutes} mins
                    </span>
                    {meeting.location && (
                      <span className="meta-item">
                        <ExternalLink size={12} />
                        {meeting.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats & Participants Column */}
                <div className="meeting-stats-col">
                  <div className="participant-avatar-group">
                    {meeting.participants.slice(0, 5).map((participant) => (
                      <div
                        key={participant.id}
                        className="participant-avatar"
                        style={{ backgroundColor: participant.avatarColor }}
                        title={`${participant.name} (${participant.role})`}
                      >
                        {participant.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    ))}
                    {meeting.participants.length > 5 && (
                      <div className="avatar-overflow" title="More participants">
                        +{meeting.participants.length - 5}
                      </div>
                    )}
                  </div>

                  <div className="meeting-highlights-summary">
                    {isUpcoming ? (
                      <>
                        <span className="badge-tag" style={{ color: 'var(--accent-amber)' }}>
                          <CheckSquare size={11} color="#f59e0b" />
                          {meeting.preMeetingBrief?.openCommitments.length || 0} Commitments
                        </span>
                        <span className="badge-tag" style={{ color: 'var(--accent-emerald)' }}>
                          <Award size={11} color="#10b981" />
                          {meeting.preMeetingBrief?.carriedDecisions.length || 0} Decisions
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="badge-tag"
                          style={
                            hasMyPending
                              ? { borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }
                              : {}
                          }
                        >
                          <CheckSquare size={11} color={hasMyPending ? '#f59e0b' : '#94a3b8'} />
                          {meeting.actionItems.filter((a) => !a.completed).length} Open Tasks
                        </span>
                        <span className="badge-tag">
                          <Award size={11} color="#10b981" />
                          {meeting.decisions.length} Decisions
                        </span>
                        <span className="badge-tag">
                          <Sparkles size={11} color="#38bdf8" />
                          {meeting.highlights.length} Highlights
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Column */}
                <div className="meeting-actions-col">
                  {isUpcoming ? (
                    <button
                      className="btn-primary"
                      style={{ fontSize: '12px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBrief(meeting.id);
                      }}
                    >
                      <Compass size={12} />
                      <span>Prepare Brief</span>
                    </button>
                  ) : (
                    <button
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeeting(meeting.id);
                      }}
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {isUpcoming ? 'Scheduled' : 'Synced'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
