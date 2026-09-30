import React, { useState } from 'react';
import { formatSeconds, formatDate } from '../utils/formatters';
import {
  Share2,
  X,
  Copy,
  Check,
  Clock,
  ExternalLink,
  Lock,
  Globe,
  Send,
  Play,
  Calendar,
} from 'lucide-react';

interface ShareMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  speakerName: string;
  speakerRole?: string;
  speakerColor?: string;
  timestampSeconds: number;
  totalDurationSeconds: number;
  meetingId: string;
  meetingTitle: string;
  meetingCategory: string;
  meetingDate: string;
  onCopyFeedback: (msg: string) => void;
}

export const ShareMomentModal: React.FC<ShareMomentModalProps> = ({
  isOpen,
  onClose,
  quote,
  speakerName,
  speakerRole = 'Participant',
  speakerColor = '#38bdf8',
  timestampSeconds,
  totalDurationSeconds,
  meetingId,
  meetingTitle,
  meetingCategory,
  meetingDate,
  onCopyFeedback,
}) => {
  const [accessLevel, setAccessLevel] = useState<'public' | 'workspace'>('public');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build the deterministic share URL
  const encodedQuote = encodeURIComponent(
    quote.length > 60 ? quote.slice(0, 58) : quote
  );
  const shareUrl = `${window.location.origin}/#meeting=${meetingId}&t=${timestampSeconds}&quote=${encodedQuote}&share=1`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    onCopyFeedback('Copied direct moment link to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateSend = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.clipboard?.writeText(shareUrl);
    onCopyFeedback(
      recipientEmail.trim()
        ? `Moment link copied to clipboard (ready to share with ${recipientEmail})`
        : 'Direct moment link copied to clipboard'
    );
    onClose();
  };

  const scrubberPercent = totalDurationSeconds > 0
    ? (timestampSeconds / totalDurationSeconds) * 100
    : 0;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div
        className="share-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="share-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="share-modal-icon-badge">
              <Share2 size={14} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 className="share-modal-title">Share Conversation Moment</h3>
              <p className="share-modal-subtitle">
                Share this exact quote and audio moment with teammates or external stakeholders
              </p>
            </div>
          </div>

          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <X size={15} />
          </button>
        </div>

        {/* The Communication Artifact Preview (Quote -> Context -> Moment) */}
        <div className="share-artifact-card">
          <div className="artifact-meta-header">
            <span className="artifact-category-badge">{meetingCategory}</span>
            <span className="artifact-meeting-name">{meetingTitle}</span>
            <span className="artifact-date">
              <Calendar size={11} style={{ marginRight: 3 }} />
              {formatDate(meetingDate)}
            </span>
          </div>

          <blockquote className="artifact-quote">
            "{quote}"
          </blockquote>

          <div className="artifact-speaker-row">
            <div
              className="speaker-avatar-tiny"
              style={{
                backgroundColor: speakerColor,
                width: 22,
                height: 22,
                fontSize: 10,
              }}
            >
              {speakerName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="artifact-speaker-name">{speakerName}</span>
              <span className="artifact-speaker-role">{speakerRole}</span>
            </div>

            <div className="artifact-timestamp-pill">
              <Clock size={11} style={{ marginRight: 4 }} />
              <span>{formatSeconds(timestampSeconds)}</span>
            </div>
          </div>

          {/* Compact Timeline Preview Bar */}
          <div className="artifact-timeline-bar-wrap">
            <div className="artifact-timeline-bar">
              <div
                className="artifact-timeline-fill"
                style={{ width: `${scrubberPercent}%` }}
              />
              <div
                className="artifact-timeline-marker"
                style={{ left: `${scrubberPercent}%` }}
                title={`Moment at ${formatSeconds(timestampSeconds)}`}
              />
            </div>
            <div className="artifact-timeline-labels">
              <span>{formatSeconds(timestampSeconds)}</span>
              <span>{formatSeconds(totalDurationSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Access and Share Controls Form */}
        <form onSubmit={handleSimulateSend} className="share-modal-form">
          {/* Access Control Option */}
          <div className="share-access-row">
            <div className="share-access-label">
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>
                Access Permissions:
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                Who can view this shared conversation link
              </span>
            </div>

            <div className="share-access-toggles">
              <button
                type="button"
                className={`access-toggle-btn ${accessLevel === 'public' ? 'active' : ''}`}
                onClick={() => setAccessLevel('public')}
              >
                <Globe size={12} />
                <span>Anyone with link</span>
              </button>
              <button
                type="button"
                className={`access-toggle-btn ${accessLevel === 'workspace' ? 'active' : ''}`}
                onClick={() => setAccessLevel('workspace')}
              >
                <Lock size={12} />
                <span>Workspace only</span>
              </button>
            </div>
          </div>

          {/* Optional Recipient Field for stakeholders not on call */}
          <div className="form-group">
            <label className="form-label">
              Share with someone not on the call (optional)
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. client.lead@partner.com or stakeholder@team.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          {/* Read-Only Link Box */}
          <div className="share-link-box">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="share-link-input"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              type="button"
              className={`btn-secondary ${copied ? 'btn-copied' : ''}`}
              onClick={handleCopyLink}
              style={{ whiteSpace: 'nowrap' }}
            >
              {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Modal Actions */}
          <div className="share-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn-primary">
              <Send size={13} />
              <span>{recipientEmail ? 'Share Moment' : 'Copy & Share'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
