import React, { useState, useEffect, useRef } from 'react';
import { TranscriptSegment, Participant } from '../types';
import { formatSeconds } from '../utils/formatters';
import {
  Search,
  Play,
  Bookmark,
  CheckSquare,
  Copy,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';

interface TranscriptViewProps {
  transcript: TranscriptSegment[];
  participants: Participant[];
  currentTime: number;
  externalSearchTerm?: string;
  onSeek: (seconds: number) => void;
  onPlayFromHere: (seconds: number) => void;
  onCopyQuote: (text: string, speaker: string, time: number) => void;
  onAddActionFromSegment: (text: string, speaker: string, time: number) => void;
  onToggleHighlightSegment: (segmentId: string) => void;
  onShareMoment: (time: number) => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  transcript,
  participants,
  currentTime,
  externalSearchTerm = '',
  onSeek,
  onPlayFromHere,
  onCopyQuote,
  onAddActionFromSegment,
  onToggleHighlightSegment,
  onShareMoment,
}) => {
  const [localSearch, setLocalSearch] = useState(externalSearchTerm);
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external search term when passed from cross-meeting search
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setLocalSearch(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  // Map participant id to Participant
  const participantMap = new Map<string, Participant>();
  participants.forEach((p) => participantMap.set(p.id, p));

  // Determine active segment based on currentTime
  const activeSegment = transcript.find(
    (seg) => currentTime >= seg.startTime && currentTime <= seg.endTime
  );

  // Filter segments if search query is present
  const filteredSegments = transcript.filter((seg) => {
    if (!localSearch.trim()) return true;
    return (
      seg.text.toLowerCase().includes(localSearch.toLowerCase()) ||
      seg.speakerName.toLowerCase().includes(localSearch.toLowerCase())
    );
  });

  // Auto-scroll to active segment when playing
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeEl = activeSegmentRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSegment?.id]);

  // Helper to highlight matching text in dialogue
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="search-match-highlight">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="transcript-container" ref={containerRef}>
      {/* Transcript Filter & Count Strip */}
      <div className="transcript-search-strip">
        <div className="transcript-search-input-wrap">
          <Search size={13} color="#64748b" />
          <input
            type="text"
            className="search-input"
            placeholder="Search dialogue or speakers..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="btn-ghost"
              style={{ padding: '2px 4px' }}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="transcript-count-label">
          {filteredSegments.length} of {transcript.length} turns
        </div>
      </div>

      {/* Continuous Editorial Transcript Flow */}
      <div className="transcript-flow">
        {filteredSegments.length === 0 ? (
          <div className="empty-state-box" style={{ padding: '36px 16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              No dialogue turns found matching "{localSearch}".
            </p>
            <button
              className="btn-secondary"
              onClick={() => setLocalSearch('')}
              style={{ marginTop: '10px', fontSize: '12px' }}
            >
              Reset Search
            </button>
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isActive = activeSegment?.id === segment.id;
            const participant = participantMap.get(segment.speakerId);
            const avatarColor = participant?.avatarColor || '#38bdf8';

            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                className={`transcript-turn-row ${isActive ? 'is-active' : ''}`}
              >
                {/* Speaker Left Gutter / Header */}
                <div className="turn-gutter">
                  <div
                    className="speaker-avatar-tiny"
                    style={{ backgroundColor: avatarColor }}
                    title={`${segment.speakerName} (${participant?.role || 'Participant'})`}
                  >
                    {segment.speakerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>

                  <div className="turn-header-info">
                    <span className="speaker-name">{segment.speakerName}</span>

                    <button
                      className="timestamp-pill"
                      onClick={() => onSeek(segment.startTime)}
                      title={`Jump playback to ${formatSeconds(segment.startTime)}`}
                    >
                      {formatSeconds(segment.startTime)}
                    </button>

                    {segment.sentiment === 'concern' && (
                      <span className="sentiment-badge concern" title="Expressed concern or risk">
                        Concern
                      </span>
                    )}
                    {segment.sentiment === 'positive' && (
                      <span className="sentiment-badge positive" title="Strong agreement">
                        Aligned
                      </span>
                    )}
                  </div>

                  {/* Contextual Action Bar (Placed Inline In Header, Appearing on Hover) */}
                  <div className="turn-hover-actions">
                    <button
                      className="segment-action-btn"
                      onClick={() => onPlayFromHere(segment.startTime)}
                      title="Play from this moment"
                    >
                      <Play size={11} />
                      <span>Play</span>
                    </button>

                    <button
                      className="segment-action-btn"
                      onClick={() =>
                        onAddActionFromSegment(segment.text, segment.speakerName, segment.startTime)
                      }
                      title="Create Action Item from this quote"
                    >
                      <CheckSquare size={11} />
                      <span>Action</span>
                    </button>

                    <button
                      className="segment-action-btn"
                      onClick={() => onToggleHighlightSegment(segment.id)}
                      title="Toggle highlight"
                    >
                      <Bookmark size={11} />
                      <span>Highlight</span>
                    </button>

                    <button
                      className="segment-action-btn"
                      onClick={() =>
                        onCopyQuote(segment.text, segment.speakerName, segment.startTime)
                      }
                      title="Copy quote with attribution"
                    >
                      <Copy size={11} />
                      <span>Copy</span>
                    </button>

                    <button
                      className="segment-action-btn"
                      onClick={() => onShareMoment(segment.startTime)}
                      title="Copy deep-link timestamp URL"
                    >
                      <Share2 size={11} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Speech Dialogue Body */}
                <div className="turn-body">
                  <p className="turn-text">
                    {renderHighlightedText(segment.text, localSearch)}
                  </p>

                  {/* Highlight Tag Pill */}
                  {segment.highlighted && segment.highlightTag && (
                    <div className="highlight-tag-badge">
                      <Sparkles size={11} />
                      <span>{segment.highlightTag}</span>
                    </div>
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
