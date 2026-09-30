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
} from 'lucide-react';

interface DashboardProps {
  meetings: Meeting[];
  onSelectMeeting: (meetingId: string) => void;
  searchQuery: string;
  onSimulateJoin: (title: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  meetings,
  onSelectMeeting,
  searchQuery,
  onSimulateJoin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MeetingCategory | 'all'>('all');
  const [onlyMyActions, setOnlyMyActions] = useState<boolean>(false);

  const currentUser = 'Pravalika Reddy';

  // Filter meetings based on category, search query, and "My Actions" filter
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesCategory = selectedCategory === 'all' || meeting.category === selectedCategory;
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

    return matchesCategory && matchesSearch && matchesMyActions;
  });

  // Calculate high-signal aggregates
  const totalMeetings = meetings.length;
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
            Synchronized audio transcripts, agreed decisions, and next steps across teams
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

      {/* High-Signal Summary Bar (Replacing Generic SaaS Metric Cards) */}
      <div className="ledger-summary-strip">
        <div className="ledger-stat-item">
          <span className="ledger-stat-label">Recorded Conversations</span>
          <span className="ledger-stat-value">{totalMeetings}</span>
        </div>
        <div className="ledger-stat-divider" />
        <div className="ledger-stat-item">
          <span className="ledger-stat-label">Pending Action Items</span>
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

      {/* Filter and View Controls Bar */}
      <div className="dashboard-filters-bar">
        <div className="filter-pills">
          {(['all', 'architecture', 'sales', 'engineering', 'one-on-one'] as const).map(
            (category) => (
              <button
                key={category}
                className={`filter-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all'
                  ? 'All Meetings'
                  : category === 'one-on-one'
                  ? '1:1 Reviews'
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            )
          )}
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
            {filteredMeetings.length} of {totalMeetings} conversations
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
            {(onlyMyActions || searchQuery || selectedCategory !== 'all') && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedCategory('all');
                  setOnlyMyActions(false);
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const hasMyPending = meeting.actionItems.some(
              (a) => a.assigneeName.toLowerCase().includes(currentUser.toLowerCase()) && !a.completed
            );

            return (
              <div
                key={meeting.id}
                className="meeting-row-card"
                onClick={() => onSelectMeeting(meeting.id)}
              >
                {/* Main Meeting Info */}
                <div className="meeting-main-info">
                  <div className="meeting-title-row">
                    <span className={`meeting-category-tag ${getCategoryClass(meeting.category)}`}>
                      {meeting.category}
                    </span>
                    <h3 className="meeting-card-title">{meeting.title}</h3>
                    {hasMyPending && (
                      <span className="my-task-indicator" title="You have open action items in this meeting">
                        Action Needed
                      </span>
                    )}
                  </div>

                  <p className="meeting-preview-text">
                    <strong style={{ color: 'var(--text-primary)' }}>Key Outcome: </strong>
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
                  </div>
                </div>

                {/* Action Column */}
                <div className="meeting-actions-col">
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
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {meeting.status === 'completed' ? 'Synced' : 'Ready'}
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
