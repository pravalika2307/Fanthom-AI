import React, { useRef, useEffect } from 'react';
import { Search, Bot, Video, LayoutGrid, FileText } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'workspace';
  onViewChange: (view: 'dashboard' | 'workspace') => void;
  activeMeetingTitle?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSimulateNewMeeting: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeMeetingTitle,
  searchQuery,
  onSearchChange,
  onSimulateNewMeeting,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand-badge" onClick={() => onViewChange('dashboard')}>
          <div className="brand-logo-mark">F</div>
          <div className="brand-title-wrap">
            <span className="brand-title">Fanthom</span>
            <span className="brand-pill">Intelligence</span>
          </div>
        </div>

        <div className="nav-divider" />

        <div className="nav-switcher">
          <button
            className={`nav-switch-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            <LayoutGrid size={14} />
            <span>Library</span>
          </button>
          <button
            className={`nav-switch-btn ${currentView === 'workspace' ? 'active' : ''}`}
            onClick={() => onViewChange('workspace')}
          >
            <FileText size={14} />
            <span>Workspace</span>
          </button>
        </div>
      </div>

      <div className="nav-center">
        <div className="global-search-bar">
          <Search size={14} color="#64748b" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={
              currentView === 'workspace' && activeMeetingTitle
                ? `Search in "${activeMeetingTitle}" or all meetings...`
                : 'Search transcripts, decisions, action items...'
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <kbd className="search-kbd">/</kbd>
        </div>
      </div>

      <div className="nav-right">
        <div className="bot-status-indicator" title="Fanthom Notetaker Bot is ready to join calendar meetings">
          <div className="status-pulse-dot" />
          <Bot size={13} />
          <span>Bot Ready</span>
        </div>

        <button className="btn-primary" onClick={onSimulateNewMeeting} title="Simulate joining an upcoming meeting">
          <Video size={14} />
          <span>Record Sync</span>
        </button>

        <div className="avatar-badge" title="Pravalika Reddy (Host)">
          PR
        </div>
      </div>
    </header>
  );
};
