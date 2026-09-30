import React, { useState, useEffect, useRef } from 'react';
import { Meeting } from '../types';
import { executeSearch, SearchResult, SearchResultType } from '../utils/searchEngine';
import { formatSeconds, formatDate } from '../utils/formatters';
import {
  Search,
  X,
  Clock,
  Sparkles,
  Award,
  CheckSquare,
  MessageSquare,
  ArrowRight,
  CornerDownLeft,
  Calendar,
  Layers,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetings: Meeting[];
  onNavigateToResult: (meetingId: string, timestamp: number, matchTerm: string) => void;
}

const SUGGESTED_QUERIES = [
  'Where did we decide to use Redis?',
  'What did customers say about pricing?',
  'What are my open action items?',
  'Who raised the migration concern?',
  'split-brain scenario',
  'CMEK KMS compliance',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  meetings,
  onNavigateToResult,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | SearchResultType>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Execute search
  const allResults = executeSearch(query, meetings);

  const filteredResults = allResults.filter((res) => {
    if (activeFilter === 'all') return true;
    return res.type === activeFilter;
  });

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Keyboard navigation within modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          const selected = filteredResults[selectedIndex];
          onNavigateToResult(
            selected.meetingId,
            selected.timestampSeconds,
            selected.matchTerms[0] || query
          );
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, query, onClose, onNavigateToResult]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const highlightMatches = (text: string, matchTerms: string[]) => {
    if (!matchTerms || matchTerms.length === 0) return text;

    const escapedTerms = matchTerms
      .filter((t) => t.trim().length > 0)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    if (!escapedTerms) return text;

    const regex = new RegExp(`(${escapedTerms})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="search-match-highlight">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const getResultIcon = (type: SearchResultType) => {
    switch (type) {
      case 'decision':
        return <Award size={12} color="#10b981" />;
      case 'action_item':
        return <CheckSquare size={12} color="#f59e0b" />;
      case 'highlight':
        return <Sparkles size={12} color="#38bdf8" />;
      default:
        return <MessageSquare size={12} color="#94a3b8" />;
    }
  };

  const getResultTypeLabel = (type: SearchResultType) => {
    switch (type) {
      case 'decision':
        return 'Decision';
      case 'action_item':
        return 'Action Item';
      case 'highlight':
        return 'Highlight';
      default:
        return 'Transcript';
    }
  };

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div
        className="search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="search-modal-input-row">
          <Search size={16} color="var(--accent-cyan)" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search conversation memory... (e.g. 'Where did we decide to use Redis?')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button
              className="btn-ghost"
              onClick={() => setQuery('')}
              style={{ padding: '2px 4px' }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="search-kbd">ESC to exit</kbd>
          )}
        </div>

        {/* Filter Tabs Strip */}
        <div className="search-modal-filters-bar">
          <div className="filter-pills">
            {(['all', 'transcript', 'decision', 'action_item', 'highlight'] as const).map(
              (filterKey) => (
                <button
                  key={filterKey}
                  className={`filter-pill ${activeFilter === filterKey ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filterKey)}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  {filterKey === 'all'
                    ? `All Evidence (${allResults.length})`
                    : filterKey === 'transcript'
                    ? `Transcript Turns (${allResults.filter((r) => r.type === 'transcript').length})`
                    : filterKey === 'decision'
                    ? `Decisions (${allResults.filter((r) => r.type === 'decision').length})`
                    : filterKey === 'action_item'
                    ? `Tasks (${allResults.filter((r) => r.type === 'action_item').length})`
                    : `Highlights (${allResults.filter((r) => r.type === 'highlight').length})`}
                </button>
              )
            )}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Use ↑ ↓ to navigate · Enter to jump
          </div>
        </div>

        {/* Search Results / Suggestions Feed */}
        <div className="search-modal-results" ref={resultsContainerRef}>
          {query.trim() === '' ? (
            <div className="search-suggestions-container">
              <span className="search-suggestions-header">
                Ask a natural-language question or explore topics:
              </span>
              <div className="search-suggestions-grid">
                {SUGGESTED_QUERIES.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="search-suggestion-btn"
                    onClick={() => setQuery(suggestion)}
                  >
                    <Search size={12} color="var(--accent-cyan)" />
                    <span>{suggestion}</span>
                    <ArrowRight size={11} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="empty-state-box" style={{ padding: '32px 16px', margin: '16px' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, marginBottom: 4 }}>
                No conversations found mentioning "{query}"
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', maxWidth: 460, margin: '0 auto 12px' }}>
                Try searching for technical terms like <strong>Redis</strong>, <strong>Memcached</strong>, <strong>split-brain</strong>, commercial terms like <strong>pricing</strong>, <strong>SLA</strong>, or speakers like <strong>Dave</strong> or <strong>Elena</strong>.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setQuery('Redis')}>
                  Search "Redis"
                </button>
                <button className="btn-secondary" onClick={() => setQuery('pricing')}>
                  Search "pricing"
                </button>
              </div>
            </div>
          ) : (
            filteredResults.map((result, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={result.id}
                  className={`search-result-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onNavigateToResult(
                      result.meetingId,
                      result.timestampSeconds,
                      result.matchTerms[0] || query
                    );
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {/* Result Header: Meeting & Result Type */}
                  <div className="result-row-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="result-type-tag">
                        {getResultIcon(result.type)}
                        <span>{getResultTypeLabel(result.type)}</span>
                      </span>
                      <span className="result-meeting-title">{result.meetingTitle}</span>
                      <span className="result-category-pill">{result.meetingCategory}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="meta-item">
                        <Calendar size={11} />
                        {formatDate(result.meetingDate)}
                      </span>
                      <span className="timestamp-pill">
                        <Clock size={10} style={{ marginRight: 3 }} />
                        {formatSeconds(result.timestampSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Result Body / Excerpt */}
                  <p className="result-snippet">
                    {highlightMatches(result.snippet, result.matchTerms)}
                  </p>

                  {/* Result Footnote / Speaker info */}
                  <div className="result-row-footer">
                    {result.speakerName && (
                      <div className="result-speaker-tag">
                        <div
                          className="speaker-avatar-tiny"
                          style={{
                            backgroundColor: result.speakerColor || '#38bdf8',
                            width: 16,
                            height: 16,
                            fontSize: 8.5,
                          }}
                        >
                          {result.speakerName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <span>{result.speakerName}</span>
                      </div>
                    )}

                    {result.extraMeta && (
                      <span className="result-extra-tag">{result.extraMeta}</span>
                    )}

                    <span className="result-jump-hint">
                      Jump to moment <CornerDownLeft size={10} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
