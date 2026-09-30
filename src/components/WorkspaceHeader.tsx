import React from 'react';
import { Meeting } from '../types';
import { formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Share2,
  Download,
  FileText,
  Zap,
} from 'lucide-react';

interface WorkspaceHeaderProps {
  meeting: Meeting;
  onBackToDashboard: () => void;
  onShareMeeting: () => void;
  onExportMeeting: () => void;
  mobileActivePane?: 'transcript' | 'intel';
  onMobilePaneToggle?: (pane: 'transcript' | 'intel') => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  meeting,
  onBackToDashboard,
  onShareMeeting,
  onExportMeeting,
  mobileActivePane = 'transcript',
  onMobilePaneToggle,
}) => {
  return (
    <div className="workspace-header">
      {/* Breadcrumb & Navigation */}
      <div className="workspace-breadcrumbs">
        <button className="breadcrumb-link" onClick={onBackToDashboard}>
          <ArrowLeft size={13} />
          <span>Meetings Library</span>
        </button>
        <span className="crumb-separator">/</span>
        <span className="crumb-category">{meeting.category}</span>
        <span className="crumb-separator">/</span>
        <span className="crumb-current">{meeting.title}</span>
      </div>

      {/* Main Title & Action Row */}
      <div className="workspace-title-row">
        <div className="workspace-title-block">
          <h2 className="workspace-title">{meeting.title}</h2>

          {/* High-Level Executive Outcome Banner */}
          <div className="workspace-thesis-bar">
            <span className="thesis-badge">Core Consensus:</span>
            <span className="thesis-text">{meeting.preview}</span>
          </div>

          <div className="workspace-meta-strip">
            <span className="meta-item">
              <Calendar size={12} />
              {formatDateTime(meeting.date)}
            </span>
            <span className="meta-item">
              <Clock size={12} />
              {meeting.durationMinutes} minutes recorded
            </span>
            {meeting.location && (
              <span className="meta-item">
                <ExternalLink size={12} />
                {meeting.location}
              </span>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="workspace-header-actions">
          {/* Participant Avatar Stack */}
          <div className="participant-avatar-group" title="Meeting Participants">
            {meeting.participants.map((p) => {
              const speakingRatio = meeting.stats.speakingRatio[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="participant-avatar"
                  style={{ backgroundColor: p.avatarColor }}
                  title={`${p.name} — ${p.role} (${speakingRatio}% of conversation)`}
                >
                  {p.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              );
            })}
          </div>

          <button
            className="btn-secondary"
            onClick={onExportMeeting}
            title="Export complete Markdown summary"
          >
            <Download size={13} />
            <span>Export</span>
          </button>

          <button
            className="btn-secondary"
            onClick={onShareMeeting}
            title="Copy shareable link"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Segmented Pane Switcher (Appears under 1024px) */}
      {onMobilePaneToggle && (
        <div className="mobile-pane-switcher">
          <button
            className={`pane-switch-btn ${mobileActivePane === 'transcript' ? 'active' : ''}`}
            onClick={() => onMobilePaneToggle('transcript')}
          >
            <FileText size={13} />
            <span>Transcript</span>
          </button>
          <button
            className={`pane-switch-btn ${mobileActivePane === 'intel' ? 'active' : ''}`}
            onClick={() => onMobilePaneToggle('intel')}
          >
            <Zap size={13} />
            <span>Brief & Actions</span>
          </button>
        </div>
      )}
    </div>
  );
};
