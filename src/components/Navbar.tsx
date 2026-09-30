import React from 'react';
import { Search, Bot, Video, LayoutGrid, FileText } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'workspace';
  onViewChange: (view: 'dashboard' | 'workspace') => void;
  activeMeetingTitle?: string;
  searchQuery: string;
  onOpenSearchModal: () => void;
  onSimulateNewMeeting: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeMeetingTitle,
  searchQuery,
  onOpenSearchModal,
  onSimulateNewMeeting,
}) => {
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
            <LayoutGrid size={13} />
            <span>Library</span>
          </button>
          <button
            className={`nav-switch-btn ${currentView === 'workspace' ? 'active' : ''}`}
            onClick={() => onViewChange('workspace')}
          >
            <FileText size={13} />
            <span>Workspace</span>
          </button>
        </div>
      </div>

      <div className="nav-center">
        <div
          className="global-search-bar"
          onClick={onOpenSearchModal}
          style={{ cursor: 'pointer' }}
          title="Search conversation memory across all meetings (Cmd/Ctrl + K)"
        >
          <Search size={13} color="var(--accent-cyan)" />
          <span
            className="search-input"
            style={{
              color: searchQuery ? 'var(--text-primary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {searchQuery
              ? `Search: "${searchQuery}"`
              : currentView === 'workspace' && activeMeetingTitle
              ? `Search within "${activeMeetingTitle}" or all meetings...`
              : 'Search across all conversations, decisions & actions...'}
          </span>
          <kbd className="search-kbd">⌘K</kbd>
        </div>
      </div>

      <div className="nav-right">
        <div
          className="bot-status-indicator"
          title="Fanthom Notetaker Bot is ready to join calendar meetings"
        >
          <div className="status-pulse-dot" />
          <Bot size={13} />
          <span>Bot Ready</span>
        </div>

        <button
          className="btn-primary"
          onClick={onSimulateNewMeeting}
          title="Simulate joining an upcoming meeting"
        >
          <Video size={13} />
          <span>Record Sync</span>
        </button>

        <div className="avatar-badge" title="Pravalika Reddy (Host)">
          PR
        </div>
      </div>
    </header>
  );
};
