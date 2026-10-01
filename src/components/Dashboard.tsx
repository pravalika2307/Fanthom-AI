import React, { useState } from 'react';
import { Meeting, MeetingCategory } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  ArrowRight,
  Video,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { ConversationFlowMap } from './ConversationFlowMap';

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

  const currentUser = 'Pravalika Palle';

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
      {/* Editorial Meeting Library Masthead */}
      <div className="library-masthead">
        <div>
          <span className="library-eyebrow">WORKSPACE</span>
          <h1 className="library-title">Meetings</h1>
        </div>

        <div className="dashboard-header-actions">
          <button
            className="btn-outline-quiet"
            onClick={() => onSimulateJoin('Sprint Retro & Infrastructure Planning')}
            title="Simulate notetaker bot joining calendar sync"
          >
            <Video size={13} />
            <span>Simulate Notetaker Bot</span>
          </button>
        </div>
      </div>

      {/* Signature Centerpiece: Conversation Flow & Meeting Continuity Map */}
      {activeTab === 'all' && (
        <ConversationFlowMap
          meetings={meetings}
          onSelectMeeting={onSelectMeeting}
          onOpenBrief={onOpenBrief}
        />
      )}

      {/* UPCOMING SESSIONS (Quiet Editorial Rows) */}
      {(activeTab === 'all' || activeTab === 'upcoming') && upcomingMeetings.length > 0 && (
        <section className="library-upcoming-section">
          <div className="library-section-header">
            <span className="library-section-title">Upcoming</span>
            <span className="library-section-count">{upcomingMeetings.length}</span>
          </div>

          <div className="upcoming-editorial-list">
            {upcomingMeetings.map((upcoming) => {
              const brief = upcoming.preMeetingBrief;
              const commitmentsCount = brief?.openCommitments.length || 0;
              const decisionsCount = brief?.carriedDecisions.length || 0;

              return (
                <div
                  key={upcoming.id}
                  className="upcoming-editorial-row"
                  onClick={() => onOpenBrief(upcoming.id)}
                >
                  <div className="upcoming-row-main">
                    <div className="upcoming-row-meta-top">
                      <span className="upcoming-category-label">
                        {upcoming.category.toUpperCase()}
                      </span>
                      <span className="meta-sep">·</span>
                      <span className="upcoming-date-text">
                        {formatDateTime(upcoming.date)}
                      </span>
                      <span className="meta-sep">·</span>
                      <span className="upcoming-participants-count">
                        {upcoming.participants.length} participants
                      </span>
                    </div>

                    <h2 className="upcoming-row-title">{upcoming.title}</h2>

                    <div className="upcoming-row-details">
                      <span className="upcoming-commitments-summary">
                        {commitmentsCount} open commitment{commitmentsCount !== 1 ? 's' : ''} · {decisionsCount} decision{decisionsCount !== 1 ? 's' : ''}
                      </span>
                      {brief?.relatedPreviousMeeting && (
                        <>
                          <span className="meta-sep">·</span>
                          <span className="upcoming-connected-label">
                            Connected to <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{brief.relatedPreviousMeeting.title}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="upcoming-row-action">
                    <button
                      className="link-action-quiet"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBrief(upcoming.id);
                      }}
                    >
                      <span>Prepare brief</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter and View Controls Bar */}
      <div className="dashboard-filters-bar">
        <div className="filter-pills">
          <button
            className={`filter-pill ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({meetings.length})
          </button>
          <button
            className={`filter-pill ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
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
            {filteredMeetings.length} of {meetings.length}
          </span>
        </div>
      </div>

      {/* Clear Editorial Section Header */}
      <div className="library-section-header" style={{ marginTop: '24px' }}>
        <span className="library-section-title">
          {activeTab === 'upcoming'
            ? 'Upcoming Meetings'
            : activeTab === 'all'
            ? 'Recent Conversations'
            : `${activeTab.toUpperCase()} Conversations`}
        </span>
        <span className="library-section-count">{filteredMeetings.length}</span>
      </div>

      {/* Meetings List — Editorial List Rows */}
      <div className="meetings-editorial-list">
        {filteredMeetings.length === 0 ? (
          <div className="empty-state-box">
            <Filter size={20} color="#64748b" style={{ marginBottom: 10 }} />
            <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: 4 }}>
              No matching meetings found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 14px' }}>
              {onlyMyActions
                ? "You don't have any incomplete action items in the selected category."
                : searchQuery
                ? `No meetings or transcript dialogue matched "${searchQuery}".`
                : "No meetings found in this category."}
            </p>
            {(onlyMyActions || searchQuery || activeTab !== 'all') && (
              <button
                className="btn-outline-quiet"
                onClick={() => {
                  setActiveTab('all');
                  setOnlyMyActions(false);
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const isUpcoming = meeting.status === 'upcoming';
            const hasMyPending = meeting.actionItems.some(
              (a) => a.assigneeName.toLowerCase().includes(currentUser.toLowerCase()) && !a.completed
            );
            const openTasksCount = meeting.actionItems.filter((a) => !a.completed).length;

            return (
              <div
                key={meeting.id}
                className="meeting-editorial-row"
                onClick={() =>
                  isUpcoming ? onOpenBrief(meeting.id) : onSelectMeeting(meeting.id)
                }
              >
                {/* Main Information Column */}
                <div className="meeting-row-main">
                  <div className="meeting-row-meta-top">
                    <span className="upcoming-category-label">
                      {meeting.category.toUpperCase()}
                    </span>
                    <span className="meta-sep">·</span>
                    <span className="meta-text">{formatDateTime(meeting.date)}</span>
                    <span className="meta-sep">·</span>
                    <span className="meta-text">{meeting.durationMinutes} min</span>
                    <span className="meta-sep">·</span>
                    <span className="meta-text">{meeting.participants.length} participants</span>
                    {hasMyPending && (
                      <>
                        <span className="meta-sep">·</span>
                        <span className="my-task-indicator-quiet">Action Needed</span>
                      </>
                    )}
                  </div>

                  <h3 className="meeting-row-title">{meeting.title}</h3>

                  <p className="meeting-row-outcome">
                    {meeting.preview}
                  </p>

                  <div className="meeting-row-signals">
                    {isUpcoming ? (
                      <span className="signal-text">
                        {meeting.preMeetingBrief?.openCommitments.length || 0} commitments ·{' '}
                        {meeting.preMeetingBrief?.carriedDecisions.length || 0} decisions
                      </span>
                    ) : (
                      <span className="signal-text">
                        {meeting.decisions.length} decision{meeting.decisions.length !== 1 ? 's' : ''} ·{' '}
                        {openTasksCount} open task{openTasksCount !== 1 ? 's' : ''} ·{' '}
                        {meeting.highlights.length} highlight{meeting.highlights.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action Link */}
                <div className="meeting-row-action">
                  {isUpcoming ? (
                    <button
                      className="link-action-quiet"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBrief(meeting.id);
                      }}
                    >
                      <span>Prepare brief</span>
                      <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      className="link-action-quiet"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMeeting(meeting.id);
                      }}
                    >
                      <span>Open record</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
