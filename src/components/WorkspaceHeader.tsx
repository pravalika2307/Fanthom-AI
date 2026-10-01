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
  Compass,
} from 'lucide-react';

import { MeetingSignals } from './MeetingSignals';

interface WorkspaceHeaderProps {
  meeting: Meeting;
  onBackToDashboard: () => void;
  onShareMeeting: () => void;
  onExportMeeting: (format: 'markdown' | 'json' | 'copy') => void;
  onOpenBrief?: (meetingId: string) => void;
  mobileActivePane?: 'transcript' | 'intel';
  onMobilePaneToggle?: (pane: 'transcript' | 'intel') => void;
  onSelectTab?: (tab: 'brief' | 'decisions' | 'actions' | 'highlights') => void;
  onSeek?: (seconds: number) => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  meeting,
  onBackToDashboard,
  onShareMeeting,
  onExportMeeting,
  onOpenBrief,
  mobileActivePane = 'transcript',
  onMobilePaneToggle,
  onSelectTab,
  onSeek,
}) => {
  // Format participants as restrained editorial text
  const primaryParticipants = meeting.participants.slice(0, 3).map((p) => p.name).join(', ');
  const remainingCount = meeting.participants.length - 3;
  const participantsSummary = remainingCount > 0
    ? `${primaryParticipants} + ${remainingCount} others`
    : primaryParticipants;

  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showExportMenu]);

  return (
    <div className="workspace-header">
      {/* Editorial Breadcrumb Navigation */}
      <div className="workspace-breadcrumbs">
        <button className="breadcrumb-back-link" onClick={onBackToDashboard}>
          <ArrowLeft size={13} />
          <span>Meetings</span>
        </button>
        <span className="crumb-slash">/</span>
        <span className="crumb-category-tag">{meeting.category}</span>
      </div>

      {/* Main Title & Action Row */}
      <div className="workspace-title-row">
        <div className="workspace-title-block">
          <h1 className="workspace-title">{meeting.title}</h1>

          {/* Quiet Editorial Decision Hierarchy */}
          <div className="workspace-editorial-consensus">
            <span className="consensus-kicker">Decision</span>
            <p className="consensus-text">{meeting.preview}</p>
          </div>

          <div className="workspace-meta-strip">
            <span className="meta-text">{formatDateTime(meeting.date)}</span>
            <span className="meta-dot">·</span>
            <span className="meta-text">{meeting.durationMinutes} min</span>
            <span className="meta-dot">·</span>
            <span
              className="meta-participants-text"
              title={meeting.participants.map((p) => `${p.name} (${p.role})`).join('\n')}
            >
              {meeting.participants.length} participants: {participantsSummary}
            </span>
            <span className="meta-dot">·</span>
            {meeting.status === 'upcoming' ? (
              <span className="brief-status-subtle">
                UPCOMING · NOT YET RECORDED
              </span>
            ) : (
              <span className="recorded-playback-pill">
                RECORDED · PLAYBACK AVAILABLE
              </span>
            )}
          </div>

          {/* Connected Meeting Signals Strip */}
          {onSelectTab && onSeek && (
            <MeetingSignals
              meeting={meeting}
              onSelectTab={onSelectTab}
              onSeek={onSeek}
            />
          )}
        </div>

        {/* Header Right Actions */}
        <div className="workspace-header-actions">
          {onOpenBrief && (
            <button
              className="btn-outline-quiet"
              onClick={() => onOpenBrief(meeting.id)}
              title="Open Pre-Meeting Intelligence Brief"
            >
              <Compass size={13} />
              <span>Meeting Brief</span>
            </button>
          )}

          <button
            className="btn-outline-quiet"
            onClick={onShareMeeting}
            title="Copy shareable moment link"
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <div className="export-dropdown-wrapper" ref={exportMenuRef} style={{ position: 'relative' }}>
            <button
              className="btn-outline-quiet"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export meeting artifact"
            >
              <Download size={13} />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="export-menu-popover">
                <button
                  className="export-menu-item"
                  onClick={() => {
                    onExportMeeting('markdown');
                    setShowExportMenu(false);
                  }}
                >
                  <FileText size={13} />
                  <div className="export-item-details">
                    <span className="export-item-title">Download Markdown (.md)</span>
                    <span className="export-item-desc">Executive summary, decisions, actions & transcript</span>
                  </div>
                </button>
                <button
                  className="export-menu-item"
                  onClick={() => {
                    onExportMeeting('json');
                    setShowExportMenu(false);
                  }}
                >
                  <Download size={13} />
                  <div className="export-item-details">
                    <span className="export-item-title">Download JSON (.json)</span>
                    <span className="export-item-desc">Structured meeting data schema for integrations</span>
                  </div>
                </button>
                <button
                  className="export-menu-item"
                  onClick={() => {
                    onExportMeeting('copy');
                    setShowExportMenu(false);
                  }}
                >
                  <Share2 size={13} />
                  <div className="export-item-details">
                    <span className="export-item-title">Copy Markdown</span>
                    <span className="export-item-desc">Copy document directly to system clipboard</span>
                  </div>
                </button>
              </div>
            )}
          </div>
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
