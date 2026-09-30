import React, { useRef } from 'react';
import { formatSeconds } from '../utils/formatters';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Decision, Highlight } from '../types';

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
}) => {
  const scrubberRef = useRef<HTMLDivElement>(null);

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
      {/* Scrubber and Timeline Markers */}
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

          {/* Quiet Discrete Markers */}
          {decisions.map((dec) => {
            const markerPos = (dec.timestampSeconds / totalDurationSeconds) * 100;
            return (
              <div
                key={dec.id}
                className="quiet-marker marker-dec"
                style={{ left: `${markerPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(dec.timestampSeconds);
                }}
                title={`Decision: ${dec.title} (${formatSeconds(dec.timestampSeconds)})`}
              />
            );
          })}

          {highlights.map((hl) => {
            const markerPos = (hl.timestampSeconds / totalDurationSeconds) * 100;
            return (
              <div
                key={hl.id}
                className="quiet-marker marker-hl"
                style={{ left: `${markerPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(hl.timestampSeconds);
                }}
                title={`Highlight: "${hl.title}" (${formatSeconds(hl.timestampSeconds)})`}
              />
            );
          })}
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
          {currentSpeakerName ? (
            <span className="active-speaker-label">
              <span className="speaking-dot" />
              {currentSpeakerName} speaking
            </span>
          ) : (
            <span className="active-speaker-label idle">Audio paused</span>
          )}

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
