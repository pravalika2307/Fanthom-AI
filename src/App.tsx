import React, { useState, useEffect } from 'react';
import { seededMeetings } from './data/seededMeetings';
import { Meeting, SummaryTemplate, ActionItem, Highlight } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { PlayerBar } from './components/PlayerBar';
import { TranscriptView } from './components/TranscriptView';
import { ContextRail } from './components/ContextRail';
import { SearchModal } from './components/SearchModal';
import { ActionItemModal } from './components/ActionItemModal';
import { ShareMomentModal } from './components/ShareMomentModal';
import { Toast } from './components/Toast';
import { formatSeconds } from './utils/formatters';
import { Play } from 'lucide-react';

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

  // Action Item Modal state
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    quote: string;
    speakerName: string;
    timestamp: number;
  }>({
    isOpen: false,
    quote: '',
    speakerName: '',
    timestamp: 0,
  });

  // Share Moment Modal state
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    quote: string;
    speakerName: string;
    speakerRole?: string;
    speakerColor?: string;
    timestamp: number;
  }>({
    isOpen: false,
    quote: '',
    speakerName: '',
    timestamp: 0,
  });

  // Deep-link shared moment banner state
  const [sharedMomentInfo, setSharedMomentInfo] = useState<{
    quote: string;
    timestamp: number;
  } | null>(null);

  const activeMeeting =
    meetings.find((m) => m.id === selectedMeetingId) || meetings[0];

  const totalDurationSeconds = activeMeeting ? activeMeeting.durationMinutes * 60 : 0;

  // URL Hash Parsing & Deep Linking: #meeting=<id>&t=<seconds>&quote=<encodedQuote>&share=1
  useEffect(() => {
    const parseUrlHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const meetingParam = params.get('meeting');
      const timeParam = params.get('t');
      const queryParam = params.get('q');
      const quoteParam = params.get('quote');
      const isShare = params.get('share') === '1';

      if (meetingParam && meetings.some((m) => m.id === meetingParam)) {
        setSelectedMeetingId(meetingParam);
        setCurrentView('workspace');

        let targetTime = 0;
        if (timeParam !== null) {
          const parsedTime = parseInt(timeParam, 10);
          if (!isNaN(parsedTime)) {
            targetTime = parsedTime;
            setPlaybackTime(parsedTime);
          }
        }

        if (queryParam) {
          setHighlightQuery(decodeURIComponent(queryParam));
        }

        if (quoteParam) {
          const decodedQuote = decodeURIComponent(quoteParam);
          setHighlightQuery(decodedQuote);
          if (isShare) {
            setSharedMomentInfo({
              quote: decodedQuote,
              timestamp: targetTime,
            });
          }
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
    setSharedMomentInfo(null);
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

  // Toggle Action item completed
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

  // Add Action Item to Meeting
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

    showToast(`Created action item assigned to ${actionData.assigneeName}`);
  };

  // Save Highlight from Transcript Selection or Turn
  const handleSaveHighlight = (
    text: string,
    speaker: string,
    time: number,
    segmentId?: string
  ) => {
    const title = text.length > 52 ? `${text.slice(0, 50)}...` : text;
    const newHighlight: Highlight = {
      id: `hl-${Date.now()}`,
      title: title,
      excerpt: text,
      speakerName: speaker,
      timestampSeconds: time,
      durationSeconds: 15,
      category: 'quote',
    };

    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (m.id !== activeMeeting.id) return m;
        return {
          ...m,
          highlights: [newHighlight, ...m.highlights],
          transcript: segmentId
            ? m.transcript.map((seg) =>
                seg.id === segmentId
                  ? { ...seg, highlighted: true, highlightTag: 'Quote Highlight' }
                  : seg
              )
            : m.transcript,
        };
      })
    );

    showToast(`Saved highlight to meeting: "${title}"`);
  };

  // Professional Copy Quote formatting
  const handleCopyQuote = (text: string, speaker: string, time: number) => {
    const quoteStr = `"${text}"\n\n— ${speaker} · ${activeMeeting.title} · ${formatSeconds(time)}`;
    navigator.clipboard?.writeText(quoteStr);
    showToast(`Copied quote from ${speaker} to clipboard`);
  };

  // Open contextual action item modal
  const handleRequestActionModal = (text: string, speaker: string, time: number) => {
    setActionModal({
      isOpen: true,
      quote: text,
      speakerName: speaker,
      timestamp: time,
    });
  };

  // Open share moment modal
  const handleRequestShareModal = (
    text: string,
    speaker: string,
    time: number,
    speakerColor?: string
  ) => {
    const participant = activeMeeting.participants.find((p) => p.name === speaker);
    setShareModal({
      isOpen: true,
      quote: text,
      speakerName: speaker,
      speakerRole: participant?.role || 'Participant',
      speakerColor: speakerColor || participant?.avatarColor || '#38bdf8',
      timestamp: time,
    });
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

      {/* Shared Moment Banner (Appears when opened via shared URL) */}
      {sharedMomentInfo && currentView === 'workspace' && (
        <div className="shared-moment-banner">
          <div className="shared-banner-left">
            <span className="shared-banner-pill">Shared Moment</span>
            <span className="shared-banner-quote">"{sharedMomentInfo.quote}"</span>
            <span style={{ color: 'var(--text-muted)' }}>
              — {formatSeconds(sharedMomentInfo.timestamp)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-primary"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => {
                setPlaybackTime(sharedMomentInfo.timestamp);
                setIsPlaying(true);
              }}
            >
              <Play size={11} />
              <span>Play Moment</span>
            </button>
            <button
              className="btn-ghost"
              style={{ padding: '3px 6px', fontSize: '11px' }}
              onClick={() => setSharedMomentInfo(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
                onShareMeeting={() =>
                  handleRequestShareModal(
                    activeMeeting.preview,
                    activeMeeting.participants[0]?.name || 'Host',
                    playbackTime,
                    activeMeeting.participants[0]?.avatarColor
                  )
                }
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
                sharedQuote={sharedMomentInfo?.quote}
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
                onRequestActionModal={handleRequestActionModal}
                onRequestShareModal={handleRequestShareModal}
                onSaveHighlight={handleSaveHighlight}
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

      {/* Contextual Action Item Creator Modal */}
      <ActionItemModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal((prev) => ({ ...prev, isOpen: false }))}
        quote={actionModal.quote}
        speakerName={actionModal.speakerName}
        timestampSeconds={actionModal.timestamp}
        participants={activeMeeting.participants}
        onSaveAction={handleAddActionItem}
        meetingId={activeMeeting.id}
      />

      {/* Editorial Share Moment Modal */}
      <ShareMomentModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal((prev) => ({ ...prev, isOpen: false }))}
        quote={shareModal.quote}
        speakerName={shareModal.speakerName}
        speakerRole={shareModal.speakerRole}
        speakerColor={shareModal.speakerColor}
        timestampSeconds={shareModal.timestamp}
        totalDurationSeconds={totalDurationSeconds}
        meetingId={activeMeeting.id}
        meetingTitle={activeMeeting.title}
        meetingCategory={activeMeeting.category}
        meetingDate={activeMeeting.date}
        onCopyFeedback={showToast}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default App;
