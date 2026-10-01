import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { PreMeetingBriefView } from './components/PreMeetingBriefView';
import { MeetingPulse } from './components/MeetingPulse';
import { formatSeconds } from './utils/formatters';
import { Play } from 'lucide-react';

export const App: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>(seededMeetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('meeting-arch-q4');
  const [selectedBriefMeetingId, setSelectedBriefMeetingId] = useState<string>('meeting-arch-rollout');
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace' | 'brief'>('workspace');
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [speakerFilter, setSpeakerFilter] = useState<string | null>(null);
  const [indexTab, setIndexTab] = useState<
    'brief' | 'decisions' | 'actions' | 'highlights' | 'context'
  >('brief');
  const [activeTemplate, setActiveTemplate] = useState<SummaryTemplate>('general');
  const [mobilePane, setMobilePane] = useState<'transcript' | 'intel'>('transcript');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [highlightQuery, setHighlightQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Native HTMLAudioElement reference for genuine spoken audio playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio volume and mute control
  const [audioVolume, setAudioVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fanthom_player_volume');
      return saved !== null ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

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

  const activeMeeting = useMemo(() => {
    const found = meetings.find((m) => m.id === selectedMeetingId);
    if (found && found.status !== 'upcoming') {
      return found;
    }
    // If selected meeting is upcoming, redirect to linked previous meeting or first completed meeting
    if (found?.relatedMeetingId) {
      const rel = meetings.find((m) => m.id === found.relatedMeetingId);
      if (rel && rel.status !== 'upcoming') return rel;
    }
    const previousFromBrief = found?.preMeetingBrief?.relatedPreviousMeeting?.id;
    if (previousFromBrief) {
      const prev = meetings.find((m) => m.id === previousFromBrief);
      if (prev && prev.status !== 'upcoming') return prev;
    }
    return meetings.find((m) => m.status === 'completed') || meetings[0];
  }, [meetings, selectedMeetingId]);

  const totalDurationSeconds = activeMeeting
    ? (activeMeeting.audioDurationSeconds || activeMeeting.durationMinutes * 60)
    : 0;

  // URL Hash Parsing & Deep Linking: #meeting=<id>&t=<seconds>&quote=<encodedQuote>&share=1 or #brief=<id>
  useEffect(() => {
    const parseUrlHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const briefParam = params.get('brief');
      const meetingParam = params.get('meeting');
      const timeParam = params.get('t');
      const queryParam = params.get('q');
      const quoteParam = params.get('quote');
      const isShare = params.get('share') === '1';

      if (briefParam && meetings.some((m) => m.id === briefParam)) {
        setSelectedBriefMeetingId(briefParam);
        setCurrentView('brief');
        return;
      }

      if (meetingParam && meetings.some((m) => m.id === meetingParam)) {
        const targetMeeting = meetings.find((m) => m.id === meetingParam);
        if (targetMeeting?.status === 'upcoming') {
          setSelectedBriefMeetingId(meetingParam);
          setCurrentView('brief');
          window.location.hash = `#brief=${meetingParam}`;
          return;
        }

        setSelectedMeetingId(meetingParam);
        setCurrentView('workspace');

        let targetTime = 0;
        if (timeParam !== null) {
          const parsedTime = parseInt(timeParam, 10);
          if (!isNaN(parsedTime)) {
            let mappedTime = parsedTime;
            if (targetMeeting?.audioUrl && parsedTime > (targetMeeting.audioDurationSeconds || 185)) {
              const seg = targetMeeting.transcript.find(
                (s) => s.startTime === parsedTime || (parsedTime >= s.startTime && parsedTime <= s.endTime)
              );
              if (seg?.demoStartTime !== undefined) mappedTime = seg.demoStartTime;
            }
            targetTime = mappedTime;
            setPlaybackTime(mappedTime);
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

  // Native HTMLAudioElement Playback & Synchronization
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeMeeting.audioUrl) {
      if (!audio.src.endsWith(activeMeeting.audioUrl)) {
        audio.src = activeMeeting.audioUrl;
        audio.load();
      }
    } else {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }, [activeMeeting.id, activeMeeting.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeMeeting.audioUrl) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play prevented or interrupted:', err);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, activeMeeting.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = audioVolume;
      audio.muted = isAudioMuted;
    }
  }, [audioVolume, isAudioMuted]);

  // Fallback timer ONLY when meeting has no real audio file (never run when audioUrl is present)
  useEffect(() => {
    if (!isPlaying || activeMeeting.audioUrl) return;

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
  }, [isPlaying, playbackSpeed, totalDurationSeconds, activeMeeting.audioUrl]);

  const handleVolumeChange = (vol: number) => {
    setAudioVolume(vol);
    if (vol > 0 && isAudioMuted) {
      setIsAudioMuted(false);
    }
    try {
      localStorage.setItem('fanthom_player_volume', vol.toString());
    } catch {}
  };

  const handleToggleMute = () => {
    setIsAudioMuted((prev) => !prev);
  };

  const handleSeek = (newTime: number) => {
    let targetTime = newTime;
    if (activeMeeting.audioUrl && newTime > totalDurationSeconds) {
      const matchedSeg = activeMeeting.transcript.find(
        (s) => s.startTime === newTime || (newTime >= s.startTime && newTime <= s.endTime)
      );
      if (matchedSeg?.demoStartTime !== undefined) {
        targetTime = matchedSeg.demoStartTime;
      } else {
        const dMatch = activeMeeting.decisions.find((d) => d.timestampSeconds === newTime);
        if (dMatch?.demoTimestampSeconds !== undefined) targetTime = dMatch.demoTimestampSeconds;
        const aMatch = activeMeeting.actionItems.find((a) => a.timestampSeconds === newTime);
        if (aMatch?.demoTimestampSeconds !== undefined) targetTime = aMatch.demoTimestampSeconds;
        const hMatch = activeMeeting.highlights.find((h) => h.timestampSeconds === newTime);
        if (hMatch?.demoTimestampSeconds !== undefined) targetTime = hMatch.demoTimestampSeconds;
      }
    }

    const clamped = Math.max(0, Math.min(totalDurationSeconds, targetTime));
    setPlaybackTime(clamped);
    const audio = audioRef.current;
    if (audio && activeMeeting.audioUrl) {
      audio.currentTime = clamped;
    }
    window.location.hash = `#meeting=${activeMeeting.id}&t=${Math.round(clamped)}`;
  };

  const handlePlayFromHere = (sec: number) => {
    let targetTime = sec;
    if (activeMeeting.audioUrl && sec > totalDurationSeconds) {
      const matchedSeg = activeMeeting.transcript.find(
        (s) => s.startTime === sec || (sec >= s.startTime && sec <= s.endTime)
      );
      if (matchedSeg?.demoStartTime !== undefined) {
        targetTime = matchedSeg.demoStartTime;
      }
    }
    handleSeek(targetTime);
    setIsPlaying(true);
    const audio = audioRef.current;
    if (audio && activeMeeting.audioUrl) {
      audio.currentTime = targetTime;
      audio.play().catch((err) => console.warn('Audio play error:', err));
    }
  };

  const handleTogglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      setIsPlaying(false);
      audio?.pause();
    } else {
      setIsPlaying(true);
      if (audio && activeMeeting.audioUrl) {
        audio.play().catch((err) => console.warn('Audio play error:', err));
      }
    }
  };

  // Global Keyboard Shortcuts (Cmd/Ctrl + K for search, Space to play/pause, J/L to seek, M to mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        handleTogglePlayPause();
      } else if (e.key === 'j' || e.key === 'J') {
        handleSeek(playbackTime - 10);
      } else if (e.key === 'l' || e.key === 'L') {
        handleSeek(playbackTime + 10);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalDurationSeconds, playbackTime, isPlaying, activeMeeting.audioUrl]);

  // Determine current active speaker
  const currentSegment = useMemo(() => {
    if (!activeMeeting) return undefined;
    if (activeMeeting.audioUrl) {
      // 1. Direct window match within turn's spoken boundaries
      const exact = activeMeeting.transcript.find(
        (seg) =>
          seg.demoStartTime !== undefined &&
          seg.demoEndTime !== undefined &&
          playbackTime >= seg.demoStartTime &&
          playbackTime <= seg.demoEndTime
      );
      if (exact) return exact;

      // 2. If playback is in a brief pause between turns, find the most recent spoken turn
      const activeTurns = activeMeeting.transcript
        .filter((seg) => seg.demoStartTime !== undefined && seg.demoStartTime <= playbackTime)
        .sort((a, b) => (b.demoStartTime ?? 0) - (a.demoStartTime ?? 0));
      if (activeTurns.length > 0) {
        return activeTurns[0];
      }
    }
    return activeMeeting.transcript.find(
      (seg) => playbackTime >= seg.startTime && playbackTime <= seg.endTime
    );
  }, [activeMeeting, playbackTime]);

  const currentSpeakerParticipant = activeMeeting?.participants.find(
    (p) => p.name === currentSegment?.speakerName || p.id === currentSegment?.speakerId
  );

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleSelectMeeting = (id: string) => {
    const targetMeeting = meetings.find((m) => m.id === id);
    if (targetMeeting?.status === 'upcoming') {
      handleOpenBrief(id);
      return;
    }
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
    const targetMeeting = meetings.find((m) => m.id === meetingId);
    let mappedTime = timestamp;
    if (targetMeeting?.audioUrl && timestamp > (targetMeeting.audioDurationSeconds || 185)) {
      const seg = targetMeeting.transcript.find(
        (s) => s.startTime === timestamp || (timestamp >= s.startTime && timestamp <= s.endTime)
      );
      if (seg?.demoStartTime !== undefined) mappedTime = seg.demoStartTime;
    }
    setPlaybackTime(mappedTime);
    handleSeek(mappedTime);
    setHighlightQuery(matchTerm);

    window.location.hash = `#meeting=${meetingId}&t=${Math.round(mappedTime)}&q=${encodeURIComponent(matchTerm)}`;

    showToast(
      `Jumped to "${targetMeeting?.title || 'Meeting'}" at ${formatSeconds(mappedTime)}`
    );
  };

  // Pre-Meeting Intelligence Brief Handlers
  const handleOpenBrief = (meetingId?: string) => {
    let targetMeeting = meetings.find((m) => m.id === meetingId);
    if (!targetMeeting) {
      targetMeeting = meetings.find((m) => m.preMeetingBrief) || meetings[0];
    }

    // If selected meeting is past meeting but has an upcoming counterpart, link to that
    if (!targetMeeting.preMeetingBrief) {
      const relatedUpcoming = meetings.find(
        (m) => m.preMeetingBrief?.relatedPreviousMeeting?.id === targetMeeting?.id
      );
      if (relatedUpcoming) {
        targetMeeting = relatedUpcoming;
      } else {
        // Fallback to primary upcoming meeting
        targetMeeting = meetings.find((m) => m.preMeetingBrief) || targetMeeting;
      }
    }

    setSelectedBriefMeetingId(targetMeeting.id);
    setCurrentView('brief');
    window.location.hash = `#brief=${targetMeeting.id}`;
    showToast(`Opened Pre-Meeting Intelligence Brief for "${targetMeeting.title}"`);
  };

  const handleOpenSourceMeeting = (meetingId: string, timestamp: number) => {
    setSelectedMeetingId(meetingId);
    setCurrentView('workspace');
    const targetMeeting = meetings.find((m) => m.id === meetingId);
    let mappedTime = timestamp;
    if (targetMeeting?.audioUrl && timestamp > (targetMeeting.audioDurationSeconds || 185)) {
      const seg = targetMeeting.transcript.find(
        (s) => s.startTime === timestamp || (timestamp >= s.startTime && timestamp <= s.endTime)
      );
      if (seg?.demoStartTime !== undefined) mappedTime = seg.demoStartTime;
    }
    setPlaybackTime(mappedTime);
    handleSeek(mappedTime);
    setHighlightQuery('');
    setSharedMomentInfo(null);
    window.location.hash = `#meeting=${meetingId}&t=${Math.round(mappedTime)}`;

    showToast(
      `Jumped to source: "${targetMeeting?.title || 'Meeting'}" at ${formatSeconds(mappedTime)}`
    );
  };

  const handleEnterMeetingFromBrief = (meetingId: string) => {
    const targetMeeting = meetings.find((m) => m.id === meetingId);
    if (targetMeeting?.status === 'upcoming') {
      const sourceId =
        targetMeeting.preMeetingBrief?.relatedPreviousMeeting?.id ||
        targetMeeting.relatedMeetingId;
      if (sourceId && meetings.some((m) => m.id === sourceId)) {
        handleOpenSourceMeeting(sourceId, 0);
        return;
      }
    }
    setSelectedMeetingId(meetingId);
    setCurrentView('workspace');
    setPlaybackTime(0);
    window.location.hash = `#meeting=${meetingId}&t=0`;
    showToast(`Entered meeting workspace`);
  };

  const handleToggleCommitment = (commitmentId: string) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (!m.preMeetingBrief) return m;
        const updatedCommitments = m.preMeetingBrief.openCommitments.map((c) =>
          c.id === commitmentId ? { ...c, completed: !c.completed } : c
        );
        return {
          ...m,
          preMeetingBrief: {
            ...m.preMeetingBrief,
            openCommitments: updatedCommitments,
          },
        };
      })
    );
  };

  const handleToggleTalkingPoint = (pointId: string) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (!m.preMeetingBrief) return m;
        const updatedPoints = m.preMeetingBrief.talkingPoints.map((tp) =>
          tp.id === pointId ? { ...tp, checked: !tp.checked } : tp
        );
        return {
          ...m,
          preMeetingBrief: {
            ...m.preMeetingBrief,
            talkingPoints: updatedPoints,
          },
        };
      })
    );
  };

  const handleAddTalkingPoint = (meetingId: string, text: string) => {
    const newPoint = {
      id: `tp-${Date.now()}`,
      text,
      checked: false,
      isCustom: true,
    };

    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (m.id !== meetingId || !m.preMeetingBrief) return m;
        return {
          ...m,
          preMeetingBrief: {
            ...m.preMeetingBrief,
            talkingPoints: [...m.preMeetingBrief.talkingPoints, newPoint],
          },
        };
      })
    );
    showToast('Added custom preparation prompt');
  };

  const handleRemoveTalkingPoint = (meetingId: string, pointId: string) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((m) => {
        if (m.id !== meetingId || !m.preMeetingBrief) return m;
        return {
          ...m,
          preMeetingBrief: {
            ...m.preMeetingBrief,
            talkingPoints: m.preMeetingBrief.talkingPoints.filter((tp) => tp.id !== pointId),
          },
        };
      })
    );
    showToast('Removed talking point');
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
        onViewChange={(view) => {
          if (view === 'workspace') {
            const current = meetings.find((m) => m.id === selectedMeetingId);
            if (current?.status === 'upcoming') {
              const fallback =
                current.relatedMeetingId ||
                current.preMeetingBrief?.relatedPreviousMeeting?.id ||
                'meeting-arch-q4';
              setSelectedMeetingId(fallback);
            }
          }
          setCurrentView(view);
        }}
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
              onClick={() => handlePlayFromHere(sharedMomentInfo.timestamp)}
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
            onOpenBrief={handleOpenBrief}
            searchQuery={highlightQuery}
            onSimulateJoin={() => handleSimulateNewMeeting()}
          />
        ) : currentView === 'brief' ? (
          <PreMeetingBriefView
            meeting={
              meetings.find((m) => m.id === selectedBriefMeetingId && m.preMeetingBrief) ||
              meetings.find((m) => m.preMeetingBrief) ||
              meetings[0]
            }
            allMeetings={meetings}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onOpenSourceMeeting={handleOpenSourceMeeting}
            onEnterMeeting={handleEnterMeetingFromBrief}
            onToggleCommitment={handleToggleCommitment}
            onToggleTalkingPoint={handleToggleTalkingPoint}
            onAddTalkingPoint={handleAddTalkingPoint}
            onRemoveTalkingPoint={handleRemoveTalkingPoint}
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
                onOpenBrief={handleOpenBrief}
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
                onSelectTab={(tab) => setIndexTab(tab)}
                onSeek={handleSeek}
              />

              {/* Meeting Pulse: Timeline Activity, Markers & Rhythm */}
              <MeetingPulse
                meeting={activeMeeting}
                currentTime={playbackTime}
                totalDurationSeconds={totalDurationSeconds}
                onSeek={handleSeek}
                activeSpeakerFilter={speakerFilter}
                onSpeakerFilterChange={setSpeakerFilter}
                onSelectIndexTab={(tab) => setIndexTab(tab)}
              />

              <PlayerBar
                currentTime={playbackTime}
                totalDurationSeconds={totalDurationSeconds}
                isPlaying={isPlaying}
                onPlayPauseToggle={handleTogglePlayPause}
                onSeek={handleSeek}
                playbackSpeed={playbackSpeed}
                onSpeedChange={setPlaybackSpeed}
                volume={audioVolume}
                isMuted={isAudioMuted}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                currentSpeakerName={currentSegment?.speakerName}
                currentSpeakerColor={currentSpeakerParticipant?.avatarColor}
                decisions={activeMeeting.decisions}
                highlights={activeMeeting.highlights}
                actionItems={activeMeeting.actionItems}
                hasAudio={Boolean(activeMeeting.audioUrl)}
              />

              <TranscriptView
                transcript={activeMeeting.transcript}
                participants={activeMeeting.participants}
                currentTime={playbackTime}
                externalSearchTerm={highlightQuery}
                sharedQuote={sharedMomentInfo?.quote}
                activeSpeakerFilter={speakerFilter}
                onClearSpeakerFilter={() => setSpeakerFilter(null)}
                onSeek={handleSeek}
                onPlayFromHere={handlePlayFromHere}
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
                activeTab={indexTab}
                onTabChange={setIndexTab}
                onSeek={handleSeek}
                onPlayFromHere={handlePlayFromHere}
                onCopyText={(text, label) => {
                  navigator.clipboard?.writeText(text);
                  showToast(label);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {/* Native Browser Spoken Audio Element for True Recorded Playback */}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={(e) => {
          setPlaybackTime(e.currentTarget.currentTime);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setPlaybackTime(totalDurationSeconds);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
      />

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
