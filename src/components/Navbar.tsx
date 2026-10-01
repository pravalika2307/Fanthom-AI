import React from 'react';
import { Search } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'workspace' | 'brief';
  onViewChange: (view: 'dashboard' | 'workspace' | 'brief') => void;
  activeMeetingTitle?: string;
  searchQuery: string;
  onOpenSearchModal: () => void;
  onSimulateNewMeeting: () => void;
  onOpenShortcuts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeMeetingTitle,
  searchQuery,
  onOpenSearchModal,
  onSimulateNewMeeting,
  onOpenShortcuts,
}) => {
  return (
    <header className="navbar">
      <div className="nav-left">
        <button
          className="brand-wordmark"
          onClick={() => onViewChange('dashboard')}
          title="Fanthom — Conversation Intelligence"
        >
          FANTHOM
        </button>

        <nav className="nav-links">
          <button
            className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onViewChange('dashboard')}
          >
            Library
          </button>
          <button
            className={`nav-link ${currentView === 'workspace' ? 'active' : ''}`}
            onClick={() => onViewChange('workspace')}
          >
            Workspace
          </button>
          {currentView === 'brief' && (
            <button
              className="nav-link active"
              onClick={() => onViewChange('brief')}
            >
              Meeting Brief
            </button>
          )}
        </nav>
      </div>

      <div className="nav-center">
        <button
          className="global-search-bar"
          onClick={onOpenSearchModal}
          title="Search conversation memory across all meetings (Cmd/Ctrl + K)"
        >
          <Search size={13} color="var(--text-muted)" />
          <span className="search-placeholder">
            {searchQuery
              ? `"${searchQuery}"`
              : currentView === 'workspace' && activeMeetingTitle
              ? `Search in "${activeMeetingTitle}" or all meetings...`
              : 'Search conversations, decisions, commitments...'}
          </span>
          <kbd className="search-kbd">⌘K</kbd>
        </button>
      </div>

      <div className="nav-right">
        {onOpenShortcuts && (
          <button
            className="btn-icon-subtle"
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>?</span>
          </button>
        )}

        <button
          className="btn-outline-quiet"
          onClick={onSimulateNewMeeting}
          title="Simulate recording upcoming session"
        >
          <span>Record Sync</span>
        </button>

        <span className="user-initials-badge" title="Pravalika Palle (Host)">
          PP
        </span>
      </div>
    </header>
  );
};
