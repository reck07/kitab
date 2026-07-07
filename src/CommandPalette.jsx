import { useState, useEffect, useRef } from 'react';

const defaultActions = [
  { id: 'new', label: 'New Note', shortcut: 'Ctrl+N', icon: '📝', action: 'newNote' },
  { id: 'search', label: 'Search Notes', shortcut: 'Ctrl+K', icon: '🔍', action: 'searchNotes' },
  { id: 'focus', label: 'Toggle Focus Mode', shortcut: '', icon: '🎯', action: 'toggleFocus' },
  { id: 'theme', label: 'Toggle Theme', shortcut: '', icon: '🌙', action: 'toggleTheme' },
  { id: 'drive', label: 'Backup to Drive', shortcut: '', icon: '☁️', action: 'backupDrive' },
  { id: 'view-list', label: 'List View', shortcut: '', icon: '📋', action: 'setViewList' },
  { id: 'view-grid', label: 'Grid View', shortcut: '', icon: '📐', action: 'setViewGrid' },
  { id: 'view-honeycomb', label: 'Honeycomb View', shortcut: '', icon: '🔶', action: 'setViewHoneycomb' },
  { id: 'graph', label: 'Knowledge Graph', shortcut: '', icon: '🔗', action: 'toggleGraph' },
  { id: 'sort-latest', label: 'Sort by Latest', shortcut: '', icon: '🕐', action: 'sortLatest' },
  { id: 'sort-oldest', label: 'Sort by Oldest', shortcut: '', icon: '🕑', action: 'sortOldest' },
  { id: 'sort-manual', label: 'Sort Manually', shortcut: '', icon: '✋', action: 'sortManual' },
  { id: 'export', label: 'Export as JSON', shortcut: '', icon: '💾', action: 'exportJSON' },
  { id: 'calculator', label: 'Calculator', shortcut: '', icon: '🧮', action: 'openCalculator' },
  { id: 'drawing', label: 'Drawing Pad', shortcut: '', icon: '✏️', action: 'openDrawing' },
];

const CommandPalette = ({ onClose, actions }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const merged = actions || defaultActions;
  const filtered = merged.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      onClose(filtered[selectedIdx].action);
    } else if (e.key === 'Escape') {
      onClose(null);
    }
  };

  useEffect(() => {
    const el = listRef.current?.children[selectedIdx];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '12vh',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    }} onClick={() => onClose(null)}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-app)', borderRadius: 12,
        width: 'min(500px, 90vw)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        animation: 'fadeInScale 0.15s ease-out',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          style={{
            width: '100%', padding: '14px 16px', fontSize: 15,
            border: 'none', borderBottom: '1px solid var(--border)',
            background: 'transparent', color: 'inherit',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div ref={listRef} style={{
          maxHeight: 320, overflowY: 'auto', padding: '6px 0',
        }}>
          {filtered.length === 0 && (
            <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              No commands found
            </div>
          )}
          {filtered.map((item, idx) => (
            <div key={item.id}
              onClick={() => onClose(item.action)}
              onMouseEnter={() => setSelectedIdx(idx)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', cursor: 'pointer',
                background: idx === selectedIdx ? 'var(--bg-active)' : 'transparent',
                fontSize: 14,
              }}>
              <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.shortcut && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.shortcut}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
