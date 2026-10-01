import React, { useState, useEffect } from 'react';
import { Participant, ActionItem } from '../types';
import { formatSeconds } from '../utils/formatters';
import { CheckSquare, X, Clock, User, Calendar, Quote } from 'lucide-react';

interface ActionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: string;
  speakerName: string;
  timestampSeconds: number;
  participants: Participant[];
  onSaveAction: (action: Omit<ActionItem, 'id'>) => void;
  meetingId: string;
}

export const ActionItemModal: React.FC<ActionItemModalProps> = ({
  isOpen,
  onClose,
  quote,
  speakerName,
  timestampSeconds,
  participants,
  onSaveAction,
  meetingId,
}) => {
  const [description, setDescription] = useState('');
  const [assigneeName, setAssigneeName] = useState(
    participants[0]?.name || 'Pravalika Palle'
  );
  const [dueDate, setDueDate] = useState('2026-10-06');

  useEffect(() => {
    if (isOpen) {
      const cleanQuote = quote.trim();
      const initialDesc = cleanQuote.length > 70
        ? `Follow up with ${speakerName}: "${cleanQuote.slice(0, 68)}..."`
        : `Follow up with ${speakerName}: "${cleanQuote}"`;
      setDescription(initialDesc);
      setAssigneeName(participants[0]?.name || 'Pravalika Palle');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, quote, speakerName, participants, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const matchedParticipant = participants.find((p) => p.name === assigneeName);

    onSaveAction({
      description: description.trim(),
      assigneeId: matchedParticipant?.id || 'u1',
      assigneeName: assigneeName,
      dueDate: dueDate,
      completed: false,
      meetingId: meetingId,
      timestampSeconds: timestampSeconds,
    });

    onClose();
  };

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div
        className="action-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="action-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="action-modal-icon-badge">
              <CheckSquare size={14} color="#f59e0b" />
            </div>
            <div>
              <h3 className="action-modal-title">Create Action Item from Transcript</h3>
              <p className="action-modal-subtitle">
                Link this task directly to the moment it was discussed
              </p>
            </div>
          </div>

          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <X size={15} />
          </button>
        </div>

        {/* Original Transcript Context Quote Box */}
        <div className="action-quote-context-box">
          <div className="action-quote-context-header">
            <span className="action-quote-speaker">
              <Quote size={11} style={{ marginRight: 4 }} />
              Original quote by <strong>{speakerName}</strong>:
            </span>
            <span className="timestamp-pill">
              <Clock size={10} style={{ marginRight: 3 }} />
              {formatSeconds(timestampSeconds)}
            </span>
          </div>
          <p className="action-quote-text">"{quote}"</p>
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="action-modal-form">
          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">
                <User size={12} style={{ marginRight: 4 }} />
                Assignee
              </label>
              <select
                className="form-select"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.role.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ width: '150px' }}>
              <label className="form-label">
                <Calendar size={12} style={{ marginRight: 4 }} />
                Due Date
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="action-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckSquare size={13} />
              <span>Save Action Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
