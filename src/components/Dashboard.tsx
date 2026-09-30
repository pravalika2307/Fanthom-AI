import React, { useState } from 'react';
import { Meeting, MeetingCategory } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  Calendar,
  Clock,
  Users,
  CheckSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  ExternalLink,
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

  // Filter meetings based on category and search query
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesCategory = selectedCategory === 'all' || meeting.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      meeting.transcript.some((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate aggregates
  const totalMeetings = meetings.length;
  const totalMinutes = meetings.reduce((acc, m) => acc + m.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalActionItems = meetings.reduce((acc, m) => acc + m.actionItems.length, 0);
  const completedActionItems = meetings.reduce(
    (acc, m) => acc + m.actionItems.filter((a) => a.completed).length,
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
      {/* Header and Context */}
      <div className="dashboard-hero">
        <div>
          <h1 className="dashboard-title">Meeting Intelligence</h1>
          <p className="dashboard-subtitle">
            Synchronized transcripts, automated summaries, decisions, and action items across your team
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => onSimulateJoin('Sprint Retro & Infrastructure Planning')}
          >
            <Video size={13} />
            <span>Simulate Notetaker Bot</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="metrics-strip">
        <div className="metric-card">
          <div className="metric-header">
            <span>Meetings Recorded</span>
            <Users size={14} color="#94a3b8" />
          </div>
          <div className="metric-value">{totalMeetings}</div>
          <div className="metric-footnote">{totalHours} total hours captured</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Action Items</span>
            <CheckSquare size={14} color="#f59e0b" />
          </div>
          <div className="metric-value">
            {completedActionItems} / {totalActionItems}
          </div>
          <div className="metric-footnote">Tasks tracked across conversations</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Decisions Logged</span>
            <Award size={14} color="#10b981" />
          </div>
          <div className="metric-value">{totalDecisions}</div>
          <div className="metric-footnote">Agreed architectural & product milestones</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Average Alignment</span>
            <TrendingUp size={14} color="#38bdf8" />
          </div>
          <div className="metric-value">91%</div>
          <div className="metric-footnote">Positive participant sentiment ratio</div>
        </div>
      </div>

      {/* Filters Bar */}
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

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Showing {filteredMeetings.length} of {totalMeetings} conversations
        </div>
      </div>

      {/* Meetings List */}
      <div className="meetings-list">
        {filteredMeetings.length === 0 ? (
          <div
            style={{
              padding: '48px',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            No meetings found matching your filter or search query.
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="meeting-row-card"
              onClick={() => onSelectMeeting(meeting.id)}
            >
              {/* Main Column */}
              <div className="meeting-main-info">
                <div className="meeting-title-row">
                  <span className={`meeting-category-tag ${getCategoryClass(meeting.category)}`}>
                    {meeting.category}
                  </span>
                  <h3 className="meeting-card-title">{meeting.title}</h3>
                </div>

                <p className="meeting-preview-text">{meeting.preview}</p>

                <div className="meeting-meta-row">
                  <span className="meta-item">
                    <Calendar size={13} />
                    {formatDateTime(meeting.date)}
                  </span>
                  <span className="meta-item">
                    <Clock size={13} />
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
                  <span className="badge-tag">
                    <CheckSquare size={12} color="#f59e0b" />
                    {meeting.actionItems.length} Actions
                  </span>
                  <span className="badge-tag">
                    <Award size={12} color="#10b981" />
                    {meeting.decisions.length} Decisions
                  </span>
                  <span className="badge-tag">
                    <Sparkles size={12} color="#38bdf8" />
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
          ))
        )}
      </div>
    </div>
  );
};
