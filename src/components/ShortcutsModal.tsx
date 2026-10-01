import React, { useEffect } from 'react';
import { X, Command, Play, RotateCcw, RotateCw, Volume2, Search, HelpCircle, Layers } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
    icon?: React.ReactNode;
  }[];
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups: ShortcutGroup[] = [
    {
      category: 'Playback Controls',
      items: [
        {
          keys: ['Space'],
          description: 'Play or pause audio recording',
          icon: <Play size={13} />,
        },
        {
          keys: ['J', '←'],
          description: 'Seek backward 10 seconds',
          icon: <RotateCcw size={13} />,
        },
        {
          keys: ['L', '→'],
          description: 'Seek forward 10 seconds',
          icon: <RotateCw size={13} />,
        },
        {
          keys: ['M'],
          description: 'Toggle mute / unmute audio',
          icon: <Volume2 size={13} />,
        },
      ],
    },
    {
      category: 'Navigation & Intelligence',
      items: [
        {
          keys: [cmdKey, 'K'],
          description: 'Open cross-meeting semantic search',
          icon: <Search size={13} />,
        },
        {
          keys: ['/'],
          description: 'Quick filter / search transcript',
          icon: <Search size={13} />,
        },
        {
          keys: ['?'],
          description: 'Show keyboard shortcuts guide',
          icon: <HelpCircle size={13} />,
        },
        {
          keys: ['Esc'],
          description: 'Close active modal / clear selection',
        },
      ],
    },
    {
      category: 'Context Index Switching',
      items: [
        {
          keys: ['1'],
          description: 'Switch to Executive Brief tab',
          icon: <Layers size={13} />,
        },
        {
          keys: ['2'],
          description: 'Switch to Decisions tab',
          icon: <Layers size={13} />,
        },
        {
          keys: ['3'],
          description: 'Switch to Action Items tab',
          icon: <Layers size={13} />,
        },
        {
          keys: ['4'],
          description: 'Switch to Highlights tab',
          icon: <Layers size={13} />,
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="shortcuts-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        <div className="shortcuts-modal-header">
          <div className="shortcuts-modal-title-wrap">
            <Command size={18} className="shortcuts-icon-accent" />
            <div>
              <h2 id="shortcuts-modal-title" className="shortcuts-modal-heading">
                Keyboard Shortcuts
              </h2>
              <p className="shortcuts-modal-sub">
                Designed for speed and uninterrupted meeting analysis
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="shortcuts-modal-body">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="shortcuts-section">
              <h3 className="shortcuts-category-title">{group.category}</h3>
              <div className="shortcuts-list">
                {group.items.map((item, idx) => (
                  <div key={idx} className="shortcut-row">
                    <div className="shortcut-desc">
                      {item.icon && <span className="shortcut-desc-icon">{item.icon}</span>}
                      <span>{item.description}</span>
                    </div>
                    <div className="shortcut-keys">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          {kIdx > 0 && <span className="shortcut-plus">or</span>}
                          <kbd className="shortcut-kbd">{k}</kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-modal-footer">
          <span className="shortcuts-footer-hint">
            Press <kbd className="shortcut-kbd-tiny">?</kbd> anywhere to toggle this guide
          </span>
          <button className="btn-secondary-sm" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
