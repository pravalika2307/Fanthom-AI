import React, { useState } from 'react';
import { Meeting } from '../types';
import { formatSeconds } from '../utils/formatters';

interface MeetingPulseProps {
  meeting: Meeting;
  currentTime: number;
  totalDurationSeconds: number;
  onSeek: (seconds: number) => void;
  activeSpeakerFilter: string | null;
  onSpeakerFilterChange: (speakerName: string | null) => void;
  onSelectIndexTab?: (tab: 'brief' | 'decisions' | 'actions' | 'highlights') => void;
}

interface PulseMarker {
  id: string;
  type: 'decision' | 'action' | 'highlight' | 'concern';
  title: string;
  time: number;
  symbol: string;
  colorVar: string;
  label: string;
}

export const MeetingPulse: React.FC<MeetingPulseProps> = ({
  meeting,
  currentTime,
  totalDurationSeconds,
  onSeek,
  activeSpeakerFilter,
  onSpeakerFilterChange,
  onSelectIndexTab,
}) => {
  const [hoveredMarker, setHoveredMarker] = useState<PulseMarker | null>(null);
  const [pulseTooltipPos, setPulseTooltipPos] = useState<number>(0);
  const [showRhythm, setShowRhythm] = useState(false);

  const duration = totalDurationSeconds > 0 ? totalDurationSeconds : meeting.durationMinutes * 60;

  // 1. Compute timeline activity histogram (48 time bins across meeting duration)
  const numBins = 48;
  const binDuration = duration / numBins;
  const activityBins = Array.from({ length: numBins }, (_, binIndex) => {
    const binStart = binIndex * binDuration;
    const binEnd = binStart + binDuration;

    // Sum words in segments overlapping this bin
    let wordsInBin = 0;
    meeting.transcript.forEach((segment) => {
      if (segment.startTime < binEnd && segment.endTime > binStart) {
        const words = segment.text.split(/\s+/).length;
        wordsInBin += words;
      }
    });

    return wordsInBin;
  });

  const maxActivity = Math.max(...activityBins, 1);

  // 2. Compile real event markers from seeded data
  const markers: PulseMarker[] = [
    ...meeting.decisions.map((d) => ({
      id: `dec-${d.id}`,
      type: 'decision' as const,
      title: d.title,
      time: d.timestampSeconds,
      symbol: '◆',
      colorVar: 'var(--accent-emerald)',
      label: 'Decision',
    })),
    ...meeting.actionItems
      .filter((a) => a.timestampSeconds && a.timestampSeconds > 0)
      .map((a) => ({
        id: `act-${a.id}`,
        type: 'action' as const,
        title: a.description,
        time: a.timestampSeconds!,
        symbol: '□',
        colorVar: 'var(--accent-amber)',
        label: 'Action',
      })),
    ...meeting.highlights.map((h) => ({
      id: `hl-${h.id}`,
      type: 'highlight' as const,
      title: h.title,
      time: h.timestampSeconds,
      symbol: '●',
      colorVar: 'var(--accent-cyan)',
      label: 'Highlight',
    })),
    ...meeting.transcript
      .filter((t) => t.sentiment === 'concern')
      .map((t) => ({
        id: `con-${t.id}`,
        type: 'concern' as const,
        title: t.text.slice(0, 65) + '...',
        time: t.startTime,
        symbol: '▲',
        colorVar: '#f87171',
        label: 'Concern',
      })),
  ].sort((a, b) => a.time - b.time);

  // 3. Compute speaker participation breakdown
  const speakerStats: { name: string; seconds: number; turns: number; percentage: number }[] = [];
  const speakerMap = new Map<string, { seconds: number; turns: number }>();

  meeting.transcript.forEach((seg) => {
    const existing = speakerMap.get(seg.speakerName) || { seconds: 0, turns: 0 };
    const segDur = Math.max(1, seg.endTime - seg.startTime);
    speakerMap.set(seg.speakerName, {
      seconds: existing.seconds + segDur,
      turns: existing.turns + 1,
    });
  });

  let totalSpokenSeconds = 0;
  speakerMap.forEach((v) => {
    totalSpokenSeconds += v.seconds;
  });

  speakerMap.forEach((val, name) => {
    speakerStats.push({
      name,
      seconds: val.seconds,
      turns: val.turns,
      percentage: totalSpokenSeconds > 0 ? Math.round((val.seconds / totalSpokenSeconds) * 100) : 0,
    });
  });

  speakerStats.sort((a, b) => b.seconds - a.seconds);

  const handleMarkerClick = (marker: PulseMarker) => {
    onSeek(marker.time);
    if (onSelectIndexTab) {
      if (marker.type === 'decision') onSelectIndexTab('decisions');
      else if (marker.type === 'action') onSelectIndexTab('actions');
      else if (marker.type === 'highlight') onSelectIndexTab('highlights');
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSeconds = Math.round(clickRatio * duration);
    onSeek(targetSeconds);
  };

  const progressPct = Math.min(100, (currentTime / (duration || 1)) * 100);

  return (
    <div className="meeting-pulse-container">
      {/* Header bar */}
      <div className="pulse-header-row">
        <div className="pulse-title-wrap">
          <span className="pulse-eyebrow">Meeting Pulse</span>
          <span className="pulse-legend-strip">
            <span className="legend-item"><span className="legend-sym" style={{ color: 'var(--accent-emerald)' }}>◆</span> Decision</span>
            <span className="legend-item"><span className="legend-sym" style={{ color: 'var(--accent-amber)' }}>□</span> Action</span>
            <span className="legend-item"><span className="legend-sym" style={{ color: 'var(--accent-cyan)' }}>●</span> Highlight</span>
            <span className="legend-item"><span className="legend-sym" style={{ color: '#f87171' }}>▲</span> Concern</span>
          </span>
        </div>

        <div className="pulse-right-controls">
          <button
            className={`pulse-toggle-btn ${showRhythm ? 'active' : ''}`}
            onClick={() => setShowRhythm(!showRhythm)}
            title="Toggle speaker conversation rhythm"
          >
            {showRhythm ? 'Hide Speakers' : 'Who Spoke'}
          </button>
          <span className="pulse-time-bounds">
            {formatSeconds(0)} — {formatSeconds(duration)}
          </span>
        </div>
      </div>

      {/* Interactive Pulse Histogram & Scrubber */}
      <div className="pulse-interactive-track" onClick={handleTrackClick}>
        {/* Activity Bars (Histogram) */}
        <div className="pulse-bars-grid">
          {activityBins.map((words, idx) => {
            const heightPct = Math.max(14, Math.round((words / maxActivity) * 100));
            const binTime = (idx / numBins) * duration;
            const isPassed = binTime <= currentTime;

            return (
              <div
                key={idx}
                className={`pulse-bar ${isPassed ? 'passed' : ''}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>

        {/* Needle for Playback Head */}
        <div
          className="pulse-playback-needle"
          style={{ left: `${progressPct}%` }}
        />

        {/* Semantic Event Marker Pins */}
        <div className="pulse-markers-layer">
          {markers.map((marker) => {
            const markerPct = Math.min(99, Math.max(1, (marker.time / duration) * 100));

            return (
              <button
                key={marker.id}
                className="pulse-marker-pin"
                style={{
                  left: `${markerPct}%`,
                  color: marker.colorVar,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(marker);
                }}
                onMouseEnter={() => {
                  setHoveredMarker(marker);
                  setPulseTooltipPos(markerPct);
                }}
                onMouseLeave={() => setHoveredMarker(null)}
                title={`${marker.label}: ${marker.title} (${formatSeconds(marker.time)})`}
              >
                <span className="pin-symbol">{marker.symbol}</span>
              </button>
            );
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredMarker && (
          <div
            className="pulse-hover-tooltip"
            style={{
              left: `${Math.min(85, Math.max(15, pulseTooltipPos))}%`,
            }}
          >
            <div className="tooltip-head">
              <span className="tooltip-label" style={{ color: hoveredMarker.colorVar }}>
                {hoveredMarker.symbol} {hoveredMarker.label}
              </span>
              <span className="tooltip-time">{formatSeconds(hoveredMarker.time)}</span>
            </div>
            <p className="tooltip-title">{hoveredMarker.title}</p>
          </div>
        )}
      </div>

      {/* Conversation Rhythm / Who Spoke Drawer */}
      {showRhythm && (
        <div className="pulse-rhythm-strip">
          <div className="rhythm-header">
            <span className="rhythm-title">Conversation Rhythm</span>
            {activeSpeakerFilter && (
              <button
                className="rhythm-clear-btn"
                onClick={() => onSpeakerFilterChange(null)}
              >
                Reset filter (showing {activeSpeakerFilter})
              </button>
            )}
          </div>

          <div className="rhythm-speakers-list">
            {speakerStats.slice(0, 6).map((speaker) => {
              const isSelected = activeSpeakerFilter === speaker.name;

              return (
                <div
                  key={speaker.name}
                  className={`rhythm-speaker-row ${isSelected ? 'selected' : ''}`}
                  onClick={() =>
                    onSpeakerFilterChange(isSelected ? null : speaker.name)
                  }
                  title={`Filter transcript to turns by ${speaker.name} (${speaker.turns} turns, ${speaker.percentage}%)`}
                >
                  <span className="rhythm-speaker-name">{speaker.name}</span>
                  <div className="rhythm-bar-track">
                    <div
                      className="rhythm-bar-fill"
                      style={{ width: `${speaker.percentage}%` }}
                    />
                  </div>
                  <span className="rhythm-pct">{speaker.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
