import React, { useState, useEffect } from 'react';
import { seededMeetings } from './data/seededMeetings';
import { Meeting, SummaryTemplate, ActionItem } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { PlayerBar } from './components/PlayerBar';
import { TranscriptView } from './components/TranscriptView';
import { ContextRail } from './components/ContextRail';
import { SearchModal } from './components/SearchModal';
import { Toast } from './components/Toast';
import { formatSeconds } from './utils/formatters';

export const App: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>(seededMeetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meeting-arch-q4');
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace'>('workspace');
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTemplate, setActiveTemplate] = useState<SummaryTemplate>('general');
  const [mobilePane, setMobilePane] = useState<'transcript' | 'intel'>('transcript');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [highlightQuery, setHighlightQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeMeeting =
    meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const totalDurationSeconds = activeMeeting ? activeMeeting.durationMinutes * 60 : 0;

  // URL Hash Parsing & Deep Linking: #meeting=<id>&t=<seconds>&q=<highlightTerm>
  useEffect(() => {
    const parseUrlHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const meetingParam = params.get('meeting');
      const timeParam = params.get('t');
      const queryParam = params.get('q');

      if (meetingParam && meetings.some((m) => m.id === meetingParam)) {
        setSelectedMeetingId(meetingParam);
        setCurrentView('workspace');

        if (timeParam !== null) {
          const parsedTime = parseInt(timeParam, 10);
          if (!isNaN(parsedTime)) {
            setPlaybackTime(parsedTime);
          }
        }

        if (queryParam) {
          setHighlightQuery(decodeURIComponent(queryParam));
        }
      }
    };

    parseUrlHash();
    window.addEventListener('hashchange', parseUrlHash);
    return () => window.removeEventListener('hashchange', parseUrlHash);
  }, [meetings]);

  // Set default template according to meeting category when switching meetings
  useEffect(() => {
    if (!activeMeeting) return;
    if (activeMeeting.category === 'sales') {
      setActiveTemplate('sales');
    } else if (activeMeeting.category === 'one-on-one') {
      setActiveTemplate('one-on-one');
    } else if (activeMeeting.category === 'engineering' || activeMeeting.category === 'architecture') {
      setActiveTemplate('project');
    } else {
      setActiveTemplate('general');
    }
  }, [selectedMeetingId]);

  // Simulated Playback Timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(1000 / playbackSpeed);
    const interval = setInterval(() => {
      setPlaybackTime((prev) => {
        if (prev >= totalDurationSeconds) {
          setIsPlaying(false);
          return totalDurationSeconds;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDurationSeconds]);

  // Global Keyboard Shortcuts (Cmd/Ctrl + K for search, Space to play/pause, J/L to seek)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K opens search modal anywhere
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
        return;
      }

      const tagName = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'j' || e.key === 'J') {
        setPlaybackTime((prev) => Math.max(0, prev - 10));
      } else if (e.key === 'l' || e.key === 'L') {
        setPlaybackTime((prev) => Math.min(totalDurationSeconds, prev + 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalDurationSeconds]);

  // Determine current active speaker
  const currentSegment = activeMeeting?.transcript.find(
    (seg) => playbackTime >= seg.startTime && playbackTime <= seg.endTime
  );

  const currentSpeakerParticipant = activeMeeting?.participants.find(
    (p) => p.name === currentSegment?.speakerName || p.id === currentSegment?.speakerId
  );

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setCurrentView('workspace');
    setPlaybackTime(0);
    setHighlightQuery('');
    window.location.hash = `#meeting=${id}&t=0`;
  };

  const handleNavigateToSearchResult = (
    meetingId: string,
    timestamp: number,
    matchTerm: string
  ) => {
    setSelectedMeetingId(meetingId);
    setCurrentView('workspace');
    setPlaybackTime(timestamp);
    setHighlightQuery(matchTerm);

    const targetMeeting = meetings.find((m) => m.id === meetingId);
    window.location.hash = `#meeting=${meetingId}&t=${timestamp}&q=${encodeURIComponent(matchTerm)}`;

    showToast(
      `Jumped to "${targetMeeting?.title || 'Meeting'}" at ${formatSeconds(timestamp)}`
    );
  };

  const handleToggleActionItem = (actionId: string) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (m.id !== activeMeeting.id) return m;
        return {
          ...m,
          actionItems: m.actionItems.map((item) =>
            item.id === actionId ? { ...item, completed: !item.completed } : item
          ),
        };
      })
    );
  };

  const handleAddActionItem = (actionData: Omit<ActionItem, 'id'>) => {
    const newId = `action-${Date.now()}`;
    const newItem: ActionItem = {
      ...actionData,
      id: newId,
    };

    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (m.id !== activeMeeting.id) return m;
        return {
          ...m,
          actionItems: [newItem, ...m.actionItems],
        };
      })
    );

    showToast(`Added action item assigned to ${actionData.assigneeName}`);
  };

  const handleToggleHighlightSegment = (segmentId: string) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (m.id !== activeMeeting.id) return m;
        return {
          ...m,
          transcript: m.transcript.map((seg) =>
            seg.id === segmentId
              ? {
                  ...seg,
                  highlighted: !seg.highlighted,
                  highlightTag: seg.highlighted ? undefined : 'Key Takeaway',
                }
              : seg
          ),
        };
      })
    );
    showToast('Updated segment highlight');
  };

  const handleCopyQuote = (text: string, speaker: string, time: number) => {
    const quoteStr = `"${text}" — ${speaker} [${formatSeconds(time)}]`;
    navigator.clipboard?.writeText(quoteStr);
    showToast(`Copied quote from ${speaker}`);
  };

  const handleAddActionFromSegment = (text: string, speaker: string, time: number) => {
    const desc = `Follow up on quote by ${speaker}: "${text.slice(0, 75)}..."`;
    handleAddActionItem({
      description: desc,
      assigneeId: activeMeeting.participants[0]?.id || 'u1',
      assigneeName: activeMeeting.participants[0]?.name || 'Pravalika Reddy',
      dueDate: '2026-10-06',
      completed: false,
      meetingId: activeMeeting.id,
      timestampSeconds: time,
    });
  };

  const handleShareMoment = (time: number) => {
    const url = `${window.location.origin}/#meeting=${activeMeeting.id}&t=${time}`;
    navigator.clipboard?.writeText(url);
    window.location.hash = `#meeting=${activeMeeting.id}&t=${time}`;
    showToast(`Copied deep link to timestamp (${formatSeconds(time)})`);
  };

  const handleExportMeeting = () => {
    const summary = activeMeeting.summaries[activeTemplate];
    const exportContent = `# ${activeMeeting.title}
Date: ${activeMeeting.date}
Duration: ${activeMeeting.durationMinutes} minutes
Location: ${activeMeeting.location || 'Virtual'}

## Overview
${summary.overview}

## Key Topics
${summary.keyTopics
  .map(
    (topic) =>
      `### ${topic.title}\n${topic.notes.map((n) => `- ${n}`).join('\n')}`
  )
  .join('\n\n')}

## Decisions Recorded
${activeMeeting.decisions
  .map((d) => `- [${d.category.toUpperCase()}] ${d.title}: ${d.description} (Agreed by ${d.decidedBy})`)
  .join('\n')}

## Action Items
${activeMeeting.actionItems
  .map((a) => `- [${a.completed ? 'x' : ' '}] ${a.description} (@${a.assigneeName}, Due: ${a.dueDate})`)
  .join('\n')}
`;
    navigator.clipboard?.writeText(exportContent);
    showToast('Exported complete Markdown report to clipboard');
  };

  const handleSimulateNewMeeting = () => {
    showToast('Fanthom Notetaker Bot simulated joining upcoming calendar sync');
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        activeMeetingTitle={activeMeeting?.title}
        searchQuery={highlightQuery}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        onSimulateNewMeeting={handleSimulateNewMeeting}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {currentView === 'dashboard' ? (
          <Dashboard
            meetings={meetings}
            onSelectMeeting={handleSelectMeeting}
            searchQuery={highlightQuery}
            onSimulateJoin={() => handleSimulateNewMeeting()}
          />
        ) : (
          <div className="workspace-layout">
            {/* Left Column: Primary Conversation & Player */}
            <div
              className={`workspace-conversation-column ${
                mobilePane === 'intel' ? 'mobile-hidden' : ''
              }`}
            >
              <WorkspaceHeader
                meeting={activeMeeting}
                onBackToDashboard={() => setCurrentView('dashboard')}
                onShareMeeting={() => handleShareMoment(playbackTime)}
                onExportMeeting={handleExportMeeting}
                mobileActivePane={mobilePane}
                onMobilePaneToggle={setMobilePane}
              />

              <PlayerBar
                currentTime={playbackTime}
                totalDurationSeconds={totalDurationSeconds}
                isPlaying={isPlaying}
                onPlayPauseToggle={() => setIsPlaying(!isPlaying)}
                onSeek={(sec) => {
                  setPlaybackTime(sec);
                  window.location.hash = `#meeting=${activeMeeting.id}&t=${sec}`;
                }}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
                currentSpeakerName={currentSegment?.speakerName}
                currentSpeakerColor={currentSpeakerParticipant?.avatarColor}
                decisions={activeMeeting.decisions}
                highlights={activeMeeting.highlights}
              />

              <TranscriptView
                transcript={activeMeeting.transcript}
                participants={activeMeeting.participants}
                currentTime={playbackTime}
                externalSearchTerm={highlightQuery}
                onSeek={(sec) => {
                  setPlaybackTime(sec);
                  window.location.hash = `#meeting=${activeMeeting.id}&t=${sec}`;
                }}
                onPlayFromHere={(sec) => {
                  setPlaybackTime(sec);
                  setIsPlaying(true);
                  window.location.hash = `#meeting=${activeMeeting.id}&t=${sec}`;
                }}
                onCopyQuote={handleCopyQuote}
                onAddActionFromSegment={handleAddActionFromSegment}
                onToggleHighlightSegment={handleToggleHighlightSegment}
                onShareMoment={handleShareMoment}
              />
            </div>

            {/* Right Column: Context & Intelligence Rail */}
            <div
              className={`workspace-intel-rail-wrap ${
                mobilePane === 'transcript' ? 'mobile-hidden' : ''
              }`}
            >
              <ContextRail
                meeting={activeMeeting}
                activeTemplate={activeTemplate}
                onTemplateChange={setActiveTemplate}
                onToggleActionItem={handleToggleActionItem}
                onAddActionItem={handleAddActionItem}
                onSeek={(sec) => {
                  setPlaybackTime(sec);
                  window.location.hash = `#meeting=${activeMeeting.id}&t=${sec}`;
                }}
                onPlayFromHere={(sec) => {
                  setPlaybackTime(sec);
                  setIsPlaying(true);
                  window.location.hash = `#meeting=${activeMeeting.id}&t=${sec}`;
                }}
                onCopyText={(text, label) => {
                  navigator.clipboard?.writeText(text);
                  showToast(label);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Global Cross-Meeting Search Modal (Cmd/Ctrl + K) */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        meetings={meetings}
        onNavigateToResult={handleNavigateToSearchResult}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default App;
