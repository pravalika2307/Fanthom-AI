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
  X,
} from 'lucide-react';

interface TranscriptViewProps {
  transcript: TranscriptSegment[];
  participants: Participant[];
  currentTime: number;
  externalSearchTerm?: string;
  sharedQuote?: string;
  onSeek: (seconds: number) => void;
  onPlayFromHere: (seconds: number) => void;
  onCopyQuote: (text: string, speaker: string, time: number) => void;
  onRequestActionModal: (text: string, speaker: string, time: number) => void;
  onRequestShareModal: (text: string, speaker: string, time: number, speakerColor?: string) => void;
  onSaveHighlight: (text: string, speaker: string, time: number, segmentId?: string) => void;
}

interface SelectionPopoverState {
  visible: boolean;
  x: number;
  y: number;
  text: string;
  speakerName: string;
  speakerColor?: string;
  timestamp: number;
  segmentId?: string;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  transcript,
  participants,
  currentTime,
  externalSearchTerm = '',
  sharedQuote = '',
  onSeek,
  onPlayFromHere,
  onCopyQuote,
  onRequestActionModal,
  onRequestShareModal,
  onSaveHighlight,
}) => {
  const [localSearch, setLocalSearch] = useState(externalSearchTerm);
  const [selectionPopover, setSelectionPopover] = useState<SelectionPopoverState>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
    speakerName: '',
    timestamp: 0,
  });

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

  // Handle text selection in transcript
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      // If clicking away, close popover unless clicking inside popover
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) {
      setSelectionPopover((prev) => ({ ...prev, visible: false }));
      return;
    }

    // Identify which segment was selected
    const anchorNode = selection.anchorNode;
    let turnElement: HTMLElement | null =
      anchorNode instanceof HTMLElement ? anchorNode : anchorNode?.parentElement || null;

    while (turnElement && !turnElement.classList.contains('transcript-turn-row')) {
      turnElement = turnElement.parentElement;
    }

    if (!turnElement) return;

    const segmentId = turnElement.getAttribute('data-segment-id');
    const matchedSegment = transcript.find((s) => s.id === segmentId) || transcript[0];
    const participant = participantMap.get(matchedSegment.speakerId);

    // Calculate popover coordinates relative to container
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const posX = Math.max(10, rect.left - containerRect.left + rect.width / 2);
    const posY = Math.max(10, rect.top - containerRect.top - 40);

    setSelectionPopover({
      visible: true,
      x: posX,
      y: posY,
      text: selectedText,
      speakerName: matchedSegment.speakerName,
      speakerColor: participant?.avatarColor || '#38bdf8',
      timestamp: matchedSegment.startTime,
      segmentId: matchedSegment.id,
    });
  };

  // Close popover when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.selection-popover-bar') &&
        !window.getSelection()?.toString().trim()
      ) {
        setSelectionPopover((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  // Helper to highlight matching text in dialogue
  const renderHighlightedText = (text: string, query: string, shared: string) => {
    const target = query || shared;
    if (!target.trim()) return text;

    const parts = text.split(
      new RegExp(`(${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    );

    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === target.toLowerCase() ? (
            <mark
              key={i}
              className={
                shared && part.toLowerCase() === shared.toLowerCase()
                  ? 'shared-moment-highlight'
                  : 'search-match-highlight'
              }
            >
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
    <div
      className="transcript-container"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative' }}
    >
      {/* Floating Contextual Selection Popover */}
      {selectionPopover.visible && (
        <div
          className="selection-popover-bar"
          style={{
            left: `${selectionPopover.x}px`,
            top: `${selectionPopover.y}px`,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="popover-action-btn"
            onClick={() => {
              onSaveHighlight(
                selectionPopover.text,
                selectionPopover.speakerName,
                selectionPopover.timestamp,
                selectionPopover.segmentId
              );
              setSelectionPopover((prev) => ({ ...prev, visible: false }));
              window.getSelection()?.removeAllRanges();
            }}
            title="Save as meeting highlight"
          >
            <Bookmark size={11} color="var(--accent-amber)" />
            <span>Highlight</span>
          </button>

          <div className="popover-divider" />

          <button
            className="popover-action-btn"
            onClick={() => {
              onRequestActionModal(
                selectionPopover.text,
                selectionPopover.speakerName,
                selectionPopover.timestamp
              );
              setSelectionPopover((prev) => ({ ...prev, visible: false }));
            }}
            title="Create Action Item from this quote"
          >
            <CheckSquare size={11} color="var(--accent-amber)" />
            <span>Action Item</span>
          </button>

          <div className="popover-divider" />

          <button
            className="popover-action-btn"
            onClick={() => {
              onCopyQuote(
                selectionPopover.text,
                selectionPopover.speakerName,
                selectionPopover.timestamp
              );
              setSelectionPopover((prev) => ({ ...prev, visible: false }));
            }}
            title="Copy formatted quote"
          >
            <Copy size={11} />
            <span>Copy</span>
          </button>

          <div className="popover-divider" />

          <button
            className="popover-action-btn"
            onClick={() => {
              onRequestShareModal(
                selectionPopover.text,
                selectionPopover.speakerName,
                selectionPopover.timestamp,
                selectionPopover.speakerColor
              );
              setSelectionPopover((prev) => ({ ...prev, visible: false }));
            }}
            title="Share this moment with a deep link"
          >
            <Share2 size={11} color="var(--accent-cyan)" />
            <span>Share</span>
          </button>
        </div>
      )}

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
              className="btn-outline-quiet"
              onClick={() => setLocalSearch('')}
              style={{ marginTop: '10px', fontSize: '12px' }}
            >
              Reset Search
            </button>
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isActive = activeSegment?.id === segment.id;

            return (
              <article
                key={segment.id}
                data-segment-id={segment.id}
                ref={isActive ? activeSegmentRef : null}
                className={`editorial-turn ${isActive ? 'is-active' : ''}`}
              >
                {/* Speaker Left Meta Row */}
                <header className="editorial-turn-meta">
                  <button
                    className="editorial-turn-timestamp"
                    onClick={() => onSeek(segment.startTime)}
                    title={`Jump playback to ${formatSeconds(segment.startTime)}`}
                  >
                    {formatSeconds(segment.startTime)}
                  </button>

                  <span className="editorial-turn-speaker">{segment.speakerName}</span>

                  {/* Contextual Action Bar — Quiet Inline Links on Hover */}
                  <div className="editorial-turn-actions">
                    <button
                      className="turn-action-link"
                      onClick={() => onPlayFromHere(segment.startTime)}
                      title="Play from this moment"
                    >
                      <Play size={10} />
                      <span>Play</span>
                    </button>
                    <span className="action-sep">·</span>
                    <button
                      className="turn-action-link"
                      onClick={() =>
                        onRequestActionModal(
                          segment.text,
                          segment.speakerName,
                          segment.startTime
                        )
                      }
                      title="Create Action Item from this turn"
                    >
                      <CheckSquare size={10} />
                      <span>Action</span>
                    </button>
                    <span className="action-sep">·</span>
                    <button
                      className="turn-action-link"
                      onClick={() =>
                        onSaveHighlight(
                          segment.text,
                          segment.speakerName,
                          segment.startTime,
                          segment.id
                        )
                      }
                      title="Save as highlight"
                    >
                      <Bookmark size={10} />
                      <span>Highlight</span>
                    </button>
                    <span className="action-sep">·</span>
                    <button
                      className="turn-action-link"
                      onClick={() =>
                        onCopyQuote(segment.text, segment.speakerName, segment.startTime)
                      }
                      title="Copy quote with attribution"
                    >
                      <Copy size={10} />
                      <span>Copy</span>
                    </button>
                    <span className="action-sep">·</span>
                    <button
                      className="turn-action-link"
                      onClick={() =>
                        onRequestShareModal(
                          segment.text,
                          segment.speakerName,
                          segment.startTime
                        )
                      }
                      title="Share this moment with a deep link"
                    >
                      <Share2 size={10} />
                      <span>Share</span>
                    </button>
                  </div>
                </header>

                {/* Speech Dialogue Body */}
                <div className="editorial-turn-body">
                  <p className="editorial-turn-text">
                    {renderHighlightedText(segment.text, localSearch, sharedQuote)}
                  </p>

                  {/* Highlight Tag */}
                  {segment.highlighted && segment.highlightTag && (
                    <div className="editorial-highlight-tag">
                      <Bookmark size={10} />
                      <span>{segment.highlightTag}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
