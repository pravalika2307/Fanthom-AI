import React, { useState } from 'react';
import { Meeting, TalkingPoint, BriefCommitment } from '../types';
import { formatDateTime, formatSeconds } from '../utils/formatters';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  CheckSquare,
  Award,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Compass,
  AlertCircle,
  Video,
} from 'lucide-react';

interface PreMeetingBriefViewProps {
  meeting: Meeting;
  allMeetings: Meeting[];
  onBackToDashboard: () => void;
  onOpenSourceMeeting: (meetingId: string, timestamp: number) => void;
  onEnterMeeting: (meetingId: string) => void;
  onToggleCommitment: (commitmentId: string) => void;
  onToggleTalkingPoint: (pointId: string) => void;
  onAddTalkingPoint: (meetingId: string, text: string) => void;
  onRemoveTalkingPoint: (meetingId: string, pointId: string) => void;
}

export const PreMeetingBriefView: React.FC<PreMeetingBriefViewProps> = ({
  meeting,
  allMeetings,
  onBackToDashboard,
  onOpenSourceMeeting,
  onEnterMeeting,
  onToggleCommitment,
  onToggleTalkingPoint,
  onAddTalkingPoint,
  onRemoveTalkingPoint,
}) => {
  const [newPointText, setNewPointText] = useState('');

  const brief = meeting.preMeetingBrief;
  const isUpcoming = meeting.status === 'upcoming';

  // Identify linked previous recorded meeting
  const previousMeetingId =
    brief?.relatedPreviousMeeting?.id ||
    meeting.relatedMeetingId ||
    (allMeetings.find((m) => m.id === 'meeting-arch-q4')?.id);

  const previousMeeting = allMeetings.find((m) => m.id === previousMeetingId);

  const handleAddPointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointText.trim()) return;
    onAddTalkingPoint(meeting.id, newPointText.trim());
    setNewPointText('');
  };

  return (
    <div className="brief-view-container">
      {/* Top Breadcrumb & Actions */}
      <div className="brief-top-nav">
        <div className="workspace-breadcrumbs">
          <button className="breadcrumb-link" onClick={onBackToDashboard}>
            <ArrowLeft size={13} />
            <span>Meetings</span>
          </button>
          <span className="crumb-separator">/</span>
          <span className="crumb-category">Pre-Meeting Brief</span>
          <span className="crumb-separator">/</span>
          <span className="crumb-current">{meeting.title}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={onBackToDashboard}>
            <ArrowLeft size={13} style={{ marginRight: 4 }} />
            <span>Back to Meetings</span>
          </button>

          {isUpcoming && previousMeetingId ? (
            <button
              className="btn-primary"
              onClick={() => onOpenSourceMeeting(previousMeetingId, 0)}
              title={
                previousMeeting
                  ? `Open previous conversation: "${previousMeeting.title}"`
                  : 'Open previous conversation'
              }
            >
              <span>Open previous conversation →</span>
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => onEnterMeeting(meeting.id)}
              title="Open meeting workspace"
            >
              <Video size={13} />
              <span>Open meeting workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Editorial Document Layout */}
      <div className="brief-document-layout">
        {/* BRIEF HERO SECTION */}
        <section className="brief-hero-card">
          <div className="brief-hero-meta-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="brief-kicker-tag">
                <Compass size={11} style={{ marginRight: 4 }} />
                PRE-MEETING BRIEF
              </span>
              {isUpcoming && (
                <span className="brief-status-subtle">
                  UPCOMING · NOT YET RECORDED
                </span>
              )}
            </div>
            <span className="brief-status-pill">Scheduled Call</span>
          </div>

          <h1 className="brief-hero-title">{meeting.title}</h1>

          <div className="workspace-meta-strip" style={{ marginTop: '4px' }}>
            <span className="meta-item">
              <Calendar size={12} />
              {formatDateTime(meeting.date)}
            </span>
            <span className="meta-item">
              <Clock size={12} />
              {meeting.durationMinutes} minutes scheduled
            </span>
            {meeting.location && (
              <span className="meta-item">
                <ExternalLink size={12} />
                {meeting.location}
              </span>
            )}
          </div>

          {/* Participant Strip */}
          <div className="brief-roster-box">
            <span className="brief-roster-label">
              <Users size={12} style={{ marginRight: 4 }} />
              Confirmed Participants ({meeting.participants.length}):
            </span>
            <div className="brief-roster-grid">
              {meeting.participants.map((p) => (
                <div key={p.id} className="brief-participant-chip">
                  <div
                    className="speaker-avatar-tiny"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="participant-chip-details">
                    <span className="chip-name">{p.name}</span>
                    <span className="chip-role">{p.role.split(',')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Synthesis: What Changed Since Last Discussion */}
          {brief?.heroHeadline && (
            <div className="brief-synthesis-box">
              <h3 className="synthesis-headline">"{brief.heroHeadline}"</h3>
              <ul className="synthesis-delta-list">
                {brief.keyContextDeltas.map((delta, i) => (
                  <li key={i} className="synthesis-delta-item">
                    {delta}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* PREVIOUS -> UPCOMING CONTEXT THREAD */}
        {brief?.relatedPreviousMeeting && (
          <section className="brief-thread-banner">
            <div className="thread-node previous">
              <span className="thread-label">PREVIOUS CONVERSATION</span>
              <h4 className="thread-title">{brief.relatedPreviousMeeting.title}</h4>
              <span className="thread-meta">
                {formatDateTime(brief.relatedPreviousMeeting.date)} ·{' '}
                {brief.relatedPreviousMeeting.durationMinutes} mins
              </span>
              <button
                className="thread-jump-link"
                onClick={() => onOpenSourceMeeting(brief.relatedPreviousMeeting.id, 0)}
              >
                Open Source Transcript →
              </button>
            </div>

            <div className="thread-connector">
              <div className="thread-arrow-line" />
              <div className="thread-badges">
                <span className="thread-chip">
                  {brief.unresolvedQuestions.length} unresolved items
                </span>
                <span className="thread-chip">
                  {brief.openCommitments.filter((c) => !c.completed).length} pending commitments
                </span>
                <span className="thread-chip">
                  {brief.carriedDecisions.length} agreed decisions
                </span>
              </div>
              <div className="thread-arrow-line" />
            </div>

            <div className="thread-node upcoming">
              <span className="thread-label">UPCOMING SESSION</span>
              <h4 className="thread-title">{meeting.title}</h4>
              <span className="thread-meta">
                {formatDateTime(meeting.date)} · {meeting.durationMinutes} mins scheduled
              </span>
            </div>
          </section>
        )}

        {/* 2-COLUMN DETAIL SECTIONS */}
        <div className="brief-content-grid">
          {/* LEFT COLUMN: OPEN COMMITMENTS & DECISIONS CARRIED OVER */}
          <div className="brief-column">
            {/* 1. OPEN COMMITMENTS */}
            <div className="brief-card">
              <div className="brief-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={14} color="#f59e0b" />
                  <h3 className="brief-section-title">Open Commitments & Deliverables</h3>
                </div>
                <span className="brief-count-tag">
                  {brief?.openCommitments.filter((c) => !c.completed).length || 0} pending
                </span>
              </div>
              <p className="brief-section-desc">
                Commitments made during previous conversations that are expected for this session.
              </p>

              <div className="commitments-list">
                {brief?.openCommitments.map((commitment) => (
                  <div
                    key={commitment.id}
                    className={`brief-commitment-card ${commitment.completed ? 'completed' : ''}`}
                  >
                    <button
                      className={`action-checkbox-btn ${
                        commitment.completed ? 'completed' : ''
                      }`}
                      onClick={() => onToggleCommitment(commitment.id)}
                      title={commitment.completed ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {commitment.completed && <Check size={12} />}
                    </button>

                    <div className="commitment-body">
                      <span
                        className={`commitment-text ${commitment.completed ? 'completed' : ''}`}
                      >
                        {commitment.description}
                      </span>

                      <div className="commitment-meta-row">
                        <span className="action-assignee-badge">
                          <strong>{commitment.assigneeName}</strong>
                        </span>
                        <span className="action-due-date">Due: {commitment.dueDate}</span>

                        {/* Clickable Source Traceability Link */}
                        <button
                          className="source-traceability-btn"
                          onClick={() =>
                            onOpenSourceMeeting(
                              commitment.sourceMeetingId,
                              commitment.sourceTimestampSeconds
                            )
                          }
                          title={`Jump to source moment in "${commitment.sourceMeetingTitle}" at ${formatSeconds(
                            commitment.sourceTimestampSeconds
                          )}`}
                        >
                          <span>{commitment.sourceMeetingTitle.split('&')[0].trim()}</span>
                          <span className="source-time-pill">
                            {formatSeconds(commitment.sourceTimestampSeconds)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. DECISIONS TO CARRY FORWARD */}
            <div className="brief-card">
              <div className="brief-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} color="#10b981" />
                  <h3 className="brief-section-title">Decisions to Carry Forward</h3>
                </div>
                <span className="brief-count-tag">{brief?.carriedDecisions.length || 0}</span>
              </div>
              <p className="brief-section-desc">
                Agreed architecture & business milestones established in preceding calls.
              </p>

              <div className="carried-decisions-list">
                {brief?.carriedDecisions.map((decision) => (
                  <div key={decision.id} className="carried-decision-card">
                    <div className="carried-dec-header">
                      <h4 className="carried-dec-title">{decision.title}</h4>
                      <button
                        className="source-traceability-btn"
                        onClick={() =>
                          onOpenSourceMeeting(
                            decision.sourceMeetingId,
                            decision.sourceTimestampSeconds
                          )
                        }
                        title="Jump to where this decision was agreed"
                      >
                        <span>{formatSeconds(decision.sourceTimestampSeconds)}</span>
                        <ExternalLink size={10} style={{ marginLeft: 3 }} />
                      </button>
                    </div>

                    <p className="carried-dec-context">{decision.contextSummary}</p>

                    <div className="carried-dec-footer">
                      <span className="badge-tag">{decision.category}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Agreed by: <strong>{decision.decidedBy}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: UNRESOLVED QUESTIONS & INTERACTIVE TALKING POINTS */}
          <div className="brief-column">
            {/* 3. UNRESOLVED QUESTIONS */}
            <div className="brief-card">
              <div className="brief-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} color="#f43f5e" />
                  <h3 className="brief-section-title">Unresolved Questions to Address</h3>
                </div>
                <span className="brief-count-tag">
                  {brief?.unresolvedQuestions.length || 0}
                </span>
              </div>
              <p className="brief-section-desc">
                Concerns raised previously that were left open without a consensus owner.
              </p>

              <div className="unresolved-list">
                {brief?.unresolvedQuestions.map((item) => (
                  <div key={item.id} className="unresolved-card">
                    <p className="unresolved-question">"{item.question}"</p>
                    <div className="unresolved-footer">
                      <span className="unresolved-raised-by">
                        Raised by: <strong>{item.raisedBy}</strong>
                      </span>
                      <button
                        className="source-traceability-btn"
                        onClick={() =>
                          onOpenSourceMeeting(
                            item.sourceMeetingId,
                            item.sourceTimestampSeconds
                          )
                        }
                        title="Jump to dialogue in previous meeting"
                      >
                        <span>Source: {formatSeconds(item.sourceTimestampSeconds)}</span>
                        <ExternalLink size={10} style={{ marginLeft: 3 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. INTERACTIVE TALKING POINTS & PREP */}
            <div className="brief-card">
              <div className="brief-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={14} color="#38bdf8" />
                  <h3 className="brief-section-title">Preparation & Talking Points</h3>
                </div>
                <span className="brief-count-tag">
                  {brief?.talkingPoints.filter((p) => p.checked).length || 0}/
                  {brief?.talkingPoints.length || 0} prepared
                </span>
              </div>
              <p className="brief-section-desc">
                Check off talking points as you prep or cover them. Add custom prompts as needed.
              </p>

              {/* Talking Points Checklist */}
              <div className="talking-points-list">
                {brief?.talkingPoints.map((point) => (
                  <div
                    key={point.id}
                    className={`talking-point-row ${point.checked ? 'checked' : ''}`}
                  >
                    <button
                      className={`action-checkbox-btn ${point.checked ? 'completed' : ''}`}
                      onClick={() => onToggleTalkingPoint(point.id)}
                      title={point.checked ? 'Mark unreviewed' : 'Mark prepared'}
                    >
                      {point.checked && <Check size={12} />}
                    </button>

                    <div className="point-text-wrap">
                      <span className={`point-text ${point.checked ? 'checked' : ''}`}>
                        {point.text}
                      </span>
                      {point.sourceLabel && (
                        <button
                          className="source-traceability-btn"
                          style={{ marginTop: 2 }}
                          onClick={() => {
                            if (point.sourceMeetingId && point.sourceTimestampSeconds !== undefined) {
                              onOpenSourceMeeting(
                                point.sourceMeetingId,
                                point.sourceTimestampSeconds
                              );
                            }
                          }}
                        >
                          <span>{point.sourceLabel}</span>
                        </button>
                      )}
                    </div>

                    <button
                      className="point-delete-btn"
                      onClick={() => onRemoveTalkingPoint(meeting.id, point.id)}
                      title="Remove talking point"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Custom Talking Point Form */}
              <form onSubmit={handleAddPointSubmit} className="add-point-form">
                <input
                  type="text"
                  className="inline-input"
                  placeholder="Add a custom preparation prompt or talking point..."
                  value={newPointText}
                  onChange={(e) => setNewPointText(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                >
                  <Plus size={12} />
                  <span>Add Point</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
