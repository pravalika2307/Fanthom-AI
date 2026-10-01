import React, { useRef, useMemo } from 'react';
import { formatSeconds } from '../utils/formatters';
import { Play, Pause, RotateCcw, RotateCw, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Decision, Highlight, ActionItem, TranscriptSegment } from '../types';

interface PlayerBarProps {
  currentTime: number;
  totalDurationSeconds: number;
  isPlaying: boolean;
  onPlayPauseToggle: () => void;
  onSeek: (seconds: number) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (vol: number) => void;
  onToggleMute?: () => void;
  currentSpeakerName?: string;
  currentSpeakerColor?: string;
  decisions: Decision[];
  highlights: Highlight[];
  actionItems?: ActionItem[];
  transcript?: TranscriptSegment[];
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
  volume = 1,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
  currentSpeakerName,
  decisions,
  highlights,
  actionItems = [],
  transcript = [],
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

  // Compute 72 audio waveform density bars across the meeting timeline
  const waveformBars = useMemo(() => {
    const BAR_COUNT = 72;
    const bars: { heightPct: number; isDecisionNear: boolean; isHighlightNear: boolean }[] = [];
    if (totalDurationSeconds <= 0) return bars;

    const sliceDuration = totalDurationSeconds / BAR_COUNT;

    for (let i = 0; i < BAR_COUNT; i++) {
      const sliceStart = i * sliceDuration;
      const sliceEnd = (i + 1) * sliceDuration;
      const sliceMid = sliceStart + sliceDuration / 2;

      const overlappingTurns = transcript.filter((turn) => {
        const turnStart = (hasAudio && turn.demoStartTime !== undefined) ? turn.demoStartTime : turn.startTime;
        const turnEnd = (hasAudio && turn.demoEndTime !== undefined) ? turn.demoEndTime : turn.endTime;
        return turnStart < sliceEnd && turnEnd > sliceStart;
      });

      const isDecisionNear = decisions.some((d) => {
        const dTime = (hasAudio && d.demoTimestampSeconds !== undefined) ? d.demoTimestampSeconds : d.timestampSeconds;
        return Math.abs(dTime - sliceMid) < sliceDuration * 1.2;
      });

      const isHighlightNear = highlights.some((h) => {
        const hTime = (hasAudio && h.demoTimestampSeconds !== undefined) ? h.demoTimestampSeconds : h.timestampSeconds;
        return Math.abs(hTime - sliceMid) < sliceDuration * 1.2;
      });

      let heightPct = 20;
      if (overlappingTurns.length > 0) {
        const wordCount = overlappingTurns.reduce((acc, t) => acc + t.text.split(/\s+/).length, 0);
        heightPct = Math.min(95, Math.max(30, 24 + wordCount * 2.2));
      }

      if (isDecisionNear) heightPct = Math.max(heightPct, 95);
      if (isHighlightNear) heightPct = Math.max(heightPct, 82);

      bars.push({ heightPct, isDecisionNear, isHighlightNear });
    }
    return bars;
  }, [totalDurationSeconds, transcript, decisions, highlights, hasAudio]);

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
          {/* Audio Waveform Density Rhythm */}
          <div className="waveform-bars-container" aria-hidden="true">
            {waveformBars.map((bar, idx) => {
              const barPosPct = (idx / (waveformBars.length - 1)) * 100;
              const isPlayed = barPosPct <= progressPercent;
              return (
                <div
                  key={idx}
                  className={`waveform-bar ${isPlayed ? 'played' : ''} ${bar.isDecisionNear ? 'decision' : ''}`}
                  style={{
                    height: `${bar.heightPct}%`,
                  }}
                />
              );
            })}
          </div>

          <div className="quiet-scrubber-fill" style={{ width: `${progressPercent}%` }}>
            <div className="quiet-scrubber-thumb" />
          </div>

          {/* Semantic Event Markers: Decisions (◆), Highlights (●), Actions (□) */}
          {decisions.map((dec) => {
            const decTime = (hasAudio && dec.demoTimestampSeconds !== undefined) ? dec.demoTimestampSeconds : dec.timestampSeconds;
            const markerPos = (decTime / totalDurationSeconds) * 100;
            return (
              <button
                key={dec.id}
                className="timeline-symbol-pin marker-dec"
                style={{ left: `${markerPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(decTime);
                }}
                onMouseEnter={() =>
                  setHoveredEvent({
                    type: 'Decision',
                    symbol: '◆',
                    title: dec.title,
                    time: decTime,
                    color: 'var(--accent-emerald)',
                    posPct: markerPos,
                  })
                }
                onMouseLeave={() => setHoveredEvent(null)}
                title={`Decision: ${dec.title} (${formatSeconds(decTime)})`}
              >
                ◆
              </button>
            );
          })}

          {highlights.map((hl) => {
            const hlTime = (hasAudio && hl.demoTimestampSeconds !== undefined) ? hl.demoTimestampSeconds : hl.timestampSeconds;
            const markerPos = (hlTime / totalDurationSeconds) * 100;
            return (
              <button
                key={hl.id}
                className="timeline-symbol-pin marker-hl"
                style={{ left: `${markerPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(hlTime);
                }}
                onMouseEnter={() =>
                  setHoveredEvent({
                    type: 'Highlight',
                    symbol: '●',
                    title: hl.title,
                    time: hlTime,
                    color: 'var(--accent-cyan)',
                    posPct: markerPos,
                  })
                }
                onMouseLeave={() => setHoveredEvent(null)}
                title={`Highlight: "${hl.title}" (${formatSeconds(hlTime)})`}
              >
                ●
              </button>
            );
          })}

          {actionItems
            .filter((a) => (a.demoTimestampSeconds !== undefined && a.demoTimestampSeconds > 0) || (a.timestampSeconds && a.timestampSeconds > 0))
            .map((act) => {
              const actTime = (hasAudio && act.demoTimestampSeconds !== undefined) ? act.demoTimestampSeconds : act.timestampSeconds!;
              const markerPos = (actTime / totalDurationSeconds) * 100;
              return (
                <button
                  key={act.id}
                  className="timeline-symbol-pin marker-act"
                  style={{ left: `${markerPos}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(actTime);
                  }}
                  onMouseEnter={() =>
                    setHoveredEvent({
                      type: 'Action Item',
                      symbol: '□',
                      title: act.description,
                      time: actTime,
                      color: 'var(--accent-amber)',
                      posPct: markerPos,
                    })
                  }
                  onMouseLeave={() => setHoveredEvent(null)}
                  title={`Action: ${act.description} (${formatSeconds(actTime)})`}
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
                UPCOMING · NOT YET RECORDED
              </span>
            ) : isPlaying ? (
              <span className="audio-state-tag playing">
                <span className="audio-rec-dot" />
                RECORDED · 03:04 DEMO
              </span>
            ) : (
              <span className="audio-state-tag paused">
                RECORDED · CONDENSED DEMO
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

          {onVolumeChange && onToggleMute && (
            <div className="player-volume-cluster">
              <button
                className="player-btn-text volume-btn"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute (M key)' : 'Mute (M key)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={13} />
                ) : volume < 0.5 ? (
                  <Volume1 size={13} />
                ) : (
                  <Volume2 size={13} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="volume-slider"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
