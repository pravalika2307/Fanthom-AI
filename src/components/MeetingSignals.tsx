import React from 'react';
import { Meeting } from '../types';

interface MeetingSignalsProps {
  meeting: Meeting;
  onSelectTab: (tab: 'brief' | 'decisions' | 'actions' | 'highlights') => void;
  onSeek: (seconds: number) => void;
}

export const MeetingSignals: React.FC<MeetingSignalsProps> = ({
  meeting,
  onSelectTab,
  onSeek,
}) => {
  const decisionsCount = meeting.decisions.length;
  const openActionsCount = meeting.actionItems.filter((a) => !a.completed).length;
  const highlightsCount = meeting.highlights.length;

  // Unresolved questions / concerns
  const concernTurn = meeting.transcript.find((t) => t.sentiment === 'concern');
  const concernsCount = meeting.transcript.filter((t) => t.sentiment === 'concern').length;

  return (
    <div className="meeting-signals-strip">
      <button
        className="signal-node-btn"
        onClick={() => onSelectTab('decisions')}
        title="View decisions in Meeting Index"
      >
        <span className="signal-node-icon" style={{ color: 'var(--accent-emerald)' }}>◆</span>
        <span className="signal-node-val">{decisionsCount}</span>
        <span className="signal-node-label">decisions</span>
      </button>

      <div className="signal-connector-dot">·</div>

      <button
        className="signal-node-btn"
        onClick={() => onSelectTab('actions')}
        title="View action items in Meeting Index"
      >
        <span className="signal-node-icon" style={{ color: 'var(--accent-amber)' }}>□</span>
        <span className="signal-node-val">{openActionsCount}</span>
        <span className="signal-node-label">open actions</span>
      </button>

      <div className="signal-connector-dot">·</div>

      <button
        className="signal-node-btn"
        onClick={() => onSelectTab('highlights')}
        title="View highlights in Meeting Index"
      >
        <span className="signal-node-icon" style={{ color: 'var(--accent-cyan)' }}>●</span>
        <span className="signal-node-val">{highlightsCount}</span>
        <span className="signal-node-label">highlights</span>
      </button>

      {concernsCount > 0 && (
        <>
          <div className="signal-connector-dot">·</div>
          <button
            className="signal-node-btn"
            onClick={() => {
              if (concernTurn) onSeek(concernTurn.startTime);
            }}
            title={concernTurn ? `Jump to concern: "${concernTurn.text.slice(0, 45)}..."` : 'Jump to concern'}
          >
            <span className="signal-node-icon" style={{ color: '#f87171' }}>▲</span>
            <span className="signal-node-val">{concernsCount}</span>
            <span className="signal-node-label">unresolved questions</span>
          </button>
        </>
      )}
    </div>
  );
};
