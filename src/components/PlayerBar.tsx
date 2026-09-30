import React, { useRef } from 'react';
import { formatSeconds } from '../utils/formatters';
import { Play, Pause, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
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
  currentSpeakerColor,
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
    <div className="player-bar-container">
      {/* Scrubber and Timeline Markers */}
      <div className="player-scrubber-row">
        <span className="time-counter">{formatSeconds(currentTime)}</span>

        <div
          ref={scrubberRef}
          className="scrubber-track-wrap"
          onClick={handleScrubberClick}
          title="Click or drag to scrub playback"
        >
          <div className="scrubber-track">
            <div className="scrubber-fill" style={{ width: `${progressPercent}%` }}>
              <div className="scrubber-handle" />
            </div>

            {/* Interactive Decision Markers */}
            {decisions.map((dec) => {
              const markerPos = (dec.timestampSeconds / totalDurationSeconds) * 100;
              return (
                <div
                  key={dec.id}
                  className="timeline-marker marker-decision"
                  style={{ left: `${markerPos}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(dec.timestampSeconds);
                  }}
                  title={`Decision: ${dec.title} (${formatSeconds(dec.timestampSeconds)})`}
                />
              );
            })}

            {/* Interactive Highlight Markers */}
            {highlights.map((hl) => {
              const markerPos = (hl.timestampSeconds / totalDurationSeconds) * 100;
              return (
                <div
                  key={hl.id}
                  className="timeline-marker marker-highlight"
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

        <span className="time-counter">{formatSeconds(totalDurationSeconds)}</span>
      </div>

      {/* Control Actions Row */}
      <div className="player-controls-row">
        <div className="controls-left">
          <button
            className="control-btn"
            onClick={() => handleSkip(-10)}
            title="Rewind 10 seconds (J key)"
          >
            <RotateCcw size={14} />
            <span className="kbd-shortcut-hint">J</span>
          </button>

          <button
            className="control-btn control-btn-play"
            onClick={onPlayPauseToggle}
            title={isPlaying ? 'Pause (Spacebar)' : 'Play (Spacebar)'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
          </button>

          <button
            className="control-btn"
            onClick={() => handleSkip(10)}
            title="Forward 10 seconds (L key)"
          >
            <RotateCw size={14} />
            <span className="kbd-shortcut-hint">L</span>
          </button>

          <div className="speed-selector-group">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                className={`speed-option-btn ${playbackSpeed === speed ? 'active' : ''}`}
                onClick={() => onSpeedChange(speed)}
                title={`Playback speed: ${speed}x`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <div className="controls-right">
          {currentSpeakerName ? (
            <div className="current-speaker-indicator">
              <div
                className="speaker-avatar-tiny"
                style={{
                  backgroundColor: currentSpeakerColor || '#38bdf8',
                  width: 18,
                  height: 18,
                  fontSize: 9,
                }}
              >
                {currentSpeakerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="waveform-anim">
                <div className="waveform-bar" />
                <div className="waveform-bar" />
                <div className="waveform-bar" />
              </div>
              <span className="current-speaker-text">
                Speaking: <strong>{currentSpeakerName}</strong>
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              (Audio paused — click play or any timestamp)
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
            <Volume2 size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
