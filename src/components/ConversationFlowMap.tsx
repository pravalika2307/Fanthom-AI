import React from 'react';
import { Meeting } from '../types';
import { ArrowRight, Calendar, GitCommit } from 'lucide-react';

interface ConversationFlowMapProps {
  meetings: Meeting[];
  onSelectMeeting: (meetingId: string) => void;
  onOpenBrief: (meetingId: string) => void;
}

export const ConversationFlowMap: React.FC<ConversationFlowMapProps> = ({
  meetings,
  onSelectMeeting,
  onOpenBrief,
}) => {
  // Find Architecture thread
  const archPrev = meetings.find((m) => m.id === 'meeting-arch-q4');
  const archUpcoming = meetings.find(
    (m) => m.id === 'meeting-arch-rollout' || m.id === 'upcoming-rollout'
  );

  // Find Sales / Security thread
  const salesPrev = meetings.find((m) => m.id === 'meeting-sales-acme');
  const salesUpcoming = meetings.find(
    (m) => m.id === 'meeting-sales-kickoff' || m.id === 'upcoming-security'
  );

  return (
    <section className="conversation-flow-section">
      <div className="flow-section-header">
        <div className="flow-header-left">
          <span className="flow-eyebrow">CONTINUITY THREADS</span>
          <h2 className="flow-title">Conversation Flow & Decision Memory</h2>
        </div>
        <span className="flow-desc">
          How prior meeting commitments and decisions bridge forward into upcoming sessions
        </span>
      </div>

      <div className="flow-streams-grid">
        {/* Thread 1: Architecture Stream */}
        {archPrev && archUpcoming && (
          <div className="flow-stream-column">
            <div className="stream-lane-header">
              <span className="stream-category">ARCHITECTURE</span>
              <span className="stream-status">Active Thread</span>
            </div>

            <div className="flow-node-tree">
              {/* Node 1: Predecessor Meeting */}
              <div
                className="flow-node past-node"
                onClick={() => onSelectMeeting(archPrev.id)}
                title="Click to open Q4 Core Architecture workspace"
              >
                <div className="node-indicator past" />
                <div className="node-content">
                  <div className="node-meta-line">
                    <span className="node-badge-type">Completed Sync</span>
                    <span className="meta-sep">·</span>
                    <span className="node-time">58 min</span>
                  </div>
                  <h3 className="node-title">{archPrev.title}</h3>
                </div>
              </div>

              {/* Connector Spine with Signals Carried Forward */}
              <div className="flow-connector-spine">
                <div className="spine-line" />
                <div className="spine-payload-box">
                  <div className="spine-item">
                    <span className="spine-icon">◆</span>
                    <span className="spine-text">{archPrev.decisions.length} decisions agreed</span>
                  </div>
                  <div className="spine-item">
                    <span className="spine-icon">□</span>
                    <span className="spine-text">
                      {archUpcoming.preMeetingBrief?.openCommitments.length || 3} commitments carried
                    </span>
                  </div>
                </div>
                <div className="spine-arrow">↓</div>
              </div>

              {/* Node 2: Upcoming Target Meeting */}
              <div
                className="flow-node upcoming-node"
                onClick={() => onOpenBrief(archUpcoming.id)}
                title="Click to prepare brief for Q4 Architecture Rollout"
              >
                <div className="node-indicator upcoming" />
                <div className="node-content">
                  <div className="node-meta-line">
                    <span className="node-badge-type upcoming">Upcoming</span>
                    <span className="meta-sep">·</span>
                    <span className="node-time">
                      <Calendar size={10} style={{ marginRight: 3 }} />
                      Fri, Oct 2 · 2:30 PM
                    </span>
                  </div>
                  <h3 className="node-title">{archUpcoming.title}</h3>
                  <div className="node-action-prompt">
                    <span>Prepare intelligence brief</span>
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Thread 2: Sales & Security Stream */}
        {salesPrev && salesUpcoming && (
          <div className="flow-stream-column">
            <div className="stream-lane-header">
              <span className="stream-category">ENTERPRISE SALES</span>
              <span className="stream-status">Active Thread</span>
            </div>

            <div className="flow-node-tree">
              {/* Node 1: Predecessor Meeting */}
              <div
                className="flow-node past-node"
                onClick={() => onSelectMeeting(salesPrev.id)}
                title="Click to open Acme Corp Commercial workspace"
              >
                <div className="node-indicator past" />
                <div className="node-content">
                  <div className="node-meta-line">
                    <span className="node-badge-type">Completed Sync</span>
                    <span className="meta-sep">·</span>
                    <span className="node-time">35 min</span>
                  </div>
                  <h3 className="node-title">{salesPrev.title}</h3>
                </div>
              </div>

              {/* Connector Spine with Signals Carried Forward */}
              <div className="flow-connector-spine">
                <div className="spine-line" />
                <div className="spine-payload-box">
                  <div className="spine-item">
                    <span className="spine-icon">◆</span>
                    <span className="spine-text">{salesPrev.decisions.length} decisions agreed</span>
                  </div>
                  <div className="spine-item">
                    <span className="spine-icon">□</span>
                    <span className="spine-text">
                      {salesUpcoming.preMeetingBrief?.openCommitments.length || 2} commitments carried
                    </span>
                  </div>
                </div>
                <div className="spine-arrow">↓</div>
              </div>

              {/* Node 2: Upcoming Target Meeting */}
              <div
                className="flow-node upcoming-node"
                onClick={() => onOpenBrief(salesUpcoming.id)}
                title="Click to prepare brief for Acme Security Kickoff"
              >
                <div className="node-indicator upcoming" />
                <div className="node-content">
                  <div className="node-meta-line">
                    <span className="node-badge-type upcoming">Upcoming</span>
                    <span className="meta-sep">·</span>
                    <span className="node-time">
                      <Calendar size={10} style={{ marginRight: 3 }} />
                      Sat, Oct 3 · 8:30 PM
                    </span>
                  </div>
                  <h3 className="node-title">{salesUpcoming.title}</h3>
                  <div className="node-action-prompt">
                    <span>Prepare intelligence brief</span>
                    <ArrowRight size={11} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
