import React, { useRef } from 'react';
import { formatSeconds } from '../utils/formatters';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Decision, Highlight, ActionItem } from '../types';

interface PlayerBarProps {
  currentTime: number;
  totalDurationSeconds: number;
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  onSeek: (seconds: number) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  currentSpeakerName?: string;
  currentSpeakerColor?: string;
  decisions: Decision[];
  highlights: Highlight[];
  actionItems?: ActionItem[];
  hasAudio?: boolean;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTime,
  totalDurationSeconds,
  isPlaying,
  onPlayPauseToggle,
  onSeek,
  playbackSpeed,
  onSpeedChange,
  currentSpeakerName,
  decisions,
  highlights,
  actionItems = [],
  hasAudio = true,
}) => {
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = React.useState<{
    type: string;
    symbol: string;
    title: string;
    time: number;
    color: string;
    posPct: number;
  } | null>(null);

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.round(ratio * totalDurationSeconds);
    onSeek(newTime);
  };

  const handleSkip = (delta: number) => {
    const newTime = Math.max(0, Math.min(totalDurationSeconds, currentTime + delta));
    onSeek(newTime);
  };

  const progressPercent =
    totalDurationSeconds > 0 ? (currentTime / totalDurationSeconds) * 100 : 0;

  return (
    <div className="player-bar-quiet">
      {/* Scrubber and Semantic Event Timeline */}
      <div className="player-timeline-strip">
        <div
          ref={scrubberRef}
          className="quiet-scrubber-track"
          onClick={handleScrubberClick}
          title="Click to seek playback"
        >
          <div className="quiet-scrubber-fill" style={{ width: `${progressPercent}%` }}>
            <div className="quiet-scrubber-thumb" />
          </div>

          {/* Semantic Event Markers: Decisions (◆), Highlights (●), Actions (□) */}
          {decisions.map((dec) => {
            const markerPos = (dec.timestampSeconds / totalDurationSeconds) * 100;
            return (
              <button
                key={dec.id}
                className="timeline-symbol-pin marker-dec"
                style={{ left: `${markerPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(dec.timestampSeconds);
                }}
                onMouseEnter={() =>
                  setHoveredEvent({
                    type: 'Decision',
                    symbol: '◆',
                    title: dec.title,
                    time: dec.timestampSeconds,
                    color: 'var(--accent-emerald)',
                    posPct: markerPos,
                  })
                }
                onMouseLeave={() => setHoveredEvent(null)}
                title={`Decision: ${dec.title} (${formatSeconds(dec.timestampSeconds)})`}
              >
                ◆
              </button>
            );
          })}

          {highlights.map((hl) => {
            const markerPos = (hl.timestampSeconds / totalDurationSeconds) * 100;
            return (
              <button
                key={hl.id}
                className="timeline-symbol-pin marker-hl"
                style={{ left: `${markerPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(hl.timestampSeconds);
                }}
                onMouseEnter={() =>
                  setHoveredEvent({
                    type: 'Highlight',
                    symbol: '●',
                    title: hl.title,
                    time: hl.timestampSeconds,
                    color: 'var(--accent-cyan)',
                    posPct: markerPos,
                  })
                }
                onMouseLeave={() => setHoveredEvent(null)}
                title={`Highlight: "${hl.title}" (${formatSeconds(hl.timestampSeconds)})`}
              >
                ●
              </button>
            );
          })}

          {actionItems
            .filter((a) => a.timestampSeconds && a.timestampSeconds > 0)
            .map((act) => {
              const markerPos = (act.timestampSeconds! / totalDurationSeconds) * 100;
              return (
                <button
                  key={act.id}
                  className="timeline-symbol-pin marker-act"
                  style={{ left: `${markerPos}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(act.timestampSeconds!);
                  }}
                  onMouseEnter={() =>
                    setHoveredEvent({
                      type: 'Action Item',
                      symbol: '□',
                      title: act.description,
                      time: act.timestampSeconds!,
                      color: 'var(--accent-amber)',
                      posPct: markerPos,
                    })
                  }
                  onMouseLeave={() => setHoveredEvent(null)}
                  title={`Action: ${act.description} (${formatSeconds(act.timestampSeconds!)})`}
                >
                  □
                </button>
              );
            })}

          {/* Hover Tooltip */}
          {hoveredEvent && (
            <div
              className="timeline-hover-tooltip"
              style={{
                left: `${Math.min(85, Math.max(15, hoveredEvent.posPct))}%`,
              }}
            >
              <div className="tooltip-head">
                <span className="tooltip-label" style={{ color: hoveredEvent.color }}>
                  {hoveredEvent.symbol} {hoveredEvent.type}
                </span>
                <span className="tooltip-time">{formatSeconds(hoveredEvent.time)}</span>
              </div>
              <p className="tooltip-title">{hoveredEvent.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls Row */}
      <div className="player-actions-row">
        <div className="player-controls-group">
          <button
            className="player-btn-text"
            onClick={() => handleSkip(-10)}
            title="Rewind 10 seconds (J key)"
          >
            <RotateCcw size={13} />
            <span className="player-kbd-hint">10s</span>
          </button>

          <button
            className="player-btn-play"
            onClick={onPlayPauseToggle}
            title={isPlaying ? 'Pause (Spacebar)' : 'Play (Spacebar)'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 1 }} />}
          </button>

          <button
            className="player-btn-text"
            onClick={() => handleSkip(10)}
            title="Forward 10 seconds (L key)"
          >
            <RotateCw size={13} />
            <span className="player-kbd-hint">10s</span>
          </button>

          <div className="player-time-display">
            <span className="current-time">{formatSeconds(currentTime)}</span>
            <span className="time-divider">/</span>
            <span className="total-time">{formatSeconds(totalDurationSeconds)}</span>
          </div>
        </div>

        {/* Center / Right: Speaker Status and Speed */}
        <div className="player-right-group">
          <div className="player-status-cluster">
            {!hasAudio ? (
              <span className="audio-state-tag unavailable">
                Recording unavailable
              </span>
            ) : isPlaying ? (
              <span className="audio-state-tag playing">
                <span className="audio-rec-dot" />
                Recording playing
              </span>
            ) : (
              <span className="audio-state-tag paused">
                Recording paused
              </span>
            )}

            {currentSpeakerName && isPlaying && (
              <span className="active-speaker-label">
                <span className="speaking-dot" />
                {currentSpeakerName} speaking
              </span>
            )}
          </div>

          <div className="player-speed-options">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                onClick={() => onSpeedChange(speed)}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
