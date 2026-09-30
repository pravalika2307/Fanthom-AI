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
  Users,
} from 'lucide-react';

interface WorkspaceHeaderProps {
  meeting: Meeting;
  onBackToDashboard: () => void;
  onShareMeeting: () => void;
  onExportMeeting: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  meeting,
  onBackToDashboard,
  onShareMeeting,
  onExportMeeting,
}) => {
  return (
    <div className="workspace-header">
      {/* Breadcrumb Row */}
      <div className="workspace-breadcrumbs">
        <button className="breadcrumb-link" onClick={onBackToDashboard}>
          <ArrowLeft size={13} />
          <span>Meetings Library</span>
        </button>
        <span>/</span>
        <span style={{ textTransform: 'capitalize' }}>{meeting.category}</span>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {meeting.title}
        </span>
      </div>

      {/* Main Title Row */}
      <div className="workspace-title-row">
        <div>
          <h2 className="workspace-title">{meeting.title}</h2>
          <div className="workspace-meta-strip" style={{ marginTop: '8px' }}>
            <span className="meta-item">
              <Calendar size={13} />
              {formatDateTime(meeting.date)}
            </span>
            <span className="meta-item">
              <Clock size={13} />
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

        {/* Header Actions & Participants */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="participant-avatar-group">
            {meeting.participants.map((p) => (
              <div
                key={p.id}
                className="participant-avatar"
                style={{ backgroundColor: p.avatarColor }}
                title={`${p.name} — ${p.role}`}
              >
                {p.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            ))}
          </div>

          <button className="btn-secondary" onClick={onExportMeeting} title="Export markdown summary">
            <Download size={13} />
            <span>Export</span>
          </button>

          <button className="btn-secondary" onClick={onShareMeeting} title="Copy shareable link">
            <Share2 size={13} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
