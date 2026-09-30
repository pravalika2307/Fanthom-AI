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
} from 'lucide-react';

interface TranscriptViewProps {
  transcript: TranscriptSegment[];
  participants: Participant[];
  currentTime: number;
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
  onSeek,
  onPlayFromHere,
  onCopyQuote,
  onAddActionFromSegment,
  onToggleHighlightSegment,
  onShareMoment,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to active segment when playing if desired
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      // Gentle scroll if out of view
      const container = containerRef.current;
      const activeEl = activeSegmentRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSegment?.id]);

  return (
    <div className="transcript-container" ref={containerRef}>
      {/* Transcript Filter & Count Strip */}
      <div className="transcript-search-strip">
        <div className="transcript-search-input-wrap">
          <Search size={13} color="#64748b" />
          <input
            type="text"
            className="search-input"
            placeholder="Search within this transcript..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              style={{ fontSize: '11px', color: 'var(--text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filteredSegments.length} of {transcript.length} turns
        </div>
      </div>

      {/* Transcript Turn Segments */}
      {filteredSegments.length === 0 ? (
        <div
          style={{
            padding: '36px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
          }}
        >
          No dialogue turns found matching "{localSearch}".
        </div>
      ) : (
        filteredSegments.map((segment) => {
          const isActive = activeSegment?.id === segment.id;
          const participant = participantMap.get(segment.speakerId);
          const avatarColor = participant?.avatarColor || '#3b82f6';

          return (
            <div
              key={segment.id}
              ref={isActive ? activeSegmentRef : null}
              className={`transcript-segment-card ${isActive ? 'is-active' : ''}`}
            >
              {/* Contextual Actions Bar (Appears on Hover) */}
              <div className="segment-context-actions">
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
                  title="Bookmark moment"
                >
                  <Bookmark size={11} />
                  <span>Highlight</span>
                </button>

                <button
                  className="segment-action-btn"
                  onClick={() =>
                    onCopyQuote(segment.text, segment.speakerName, segment.startTime)
                  }
                  title="Copy quote with timestamp"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>

                <button
                  className="segment-action-btn"
                  onClick={() => onShareMoment(segment.startTime)}
                  title="Copy direct timestamp link"
                >
                  <Share2 size={11} />
                  <span>Share</span>
                </button>
              </div>

              {/* Segment Header */}
              <div className="segment-header">
                <div className="segment-speaker-info">
                  <div
                    className="speaker-avatar-tiny"
                    style={{ backgroundColor: avatarColor }}
                    title={segment.speakerName}
                  >
                    {segment.speakerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <span className="speaker-name">{segment.speakerName}</span>

                  <button
                    className="timestamp-pill"
                    onClick={() => onSeek(segment.startTime)}
                    title="Click to seek playback to this moment"
                  >
                    {formatSeconds(segment.startTime)}
                  </button>

                  {segment.sentiment === 'concern' && (
                    <span className="sentiment-badge concern">Concern</span>
                  )}
                  {segment.sentiment === 'positive' && (
                    <span className="sentiment-badge positive">Aligned</span>
                  )}
                </div>
              </div>

              {/* Turn Dialogue Text */}
              <p className="segment-text">{segment.text}</p>

              {/* Highlight Tag Pill */}
              {segment.highlighted && segment.highlightTag && (
                <div className="highlight-tag-badge">
                  <Sparkles size={11} />
                  <span>{segment.highlightTag}</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
