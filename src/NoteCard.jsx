import { Lock, Pin, Star, Archive, Clock, Trash2, RotateCcw } from 'lucide-react';

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const highlightText = (text, query) => {
  if (!query || !text) return text;
  const escapedQuery = escapeRegExp(query);
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? <mark key={i} style={{ backgroundColor: '#ffeb3b', color: '#000', borderRadius: '2px', padding: '0 2px' }}>{part}</mark> : part
  );
};

const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStringLocale = date.toLocaleDateString();
  return `${dateStringLocale} ${timeString}`;
};

const getTagColor = (tag) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 45%)`;
};

const NoteCard = ({ note, isActive, onClick, searchQuery, onTogglePin, onToggleFavorite, onToggleArchive, onDelete, onRestore, onPermanentDelete }) => {
  const isLocked = typeof note.content === 'string' && note.content.startsWith('locked:v1:');
  const previewText = isLocked
    ? 'This note is locked'
    : `${note.content?.replace(/<[^>]*>/g, '').substring(0, 60) || ''}...`;

  const isTrash = note.isRecycled;

  return (
    <div
      className={`note-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onDoubleClick={onClick}
      style={{ opacity: isTrash ? 0.6 : 1 }}
    >
      {note.coverImage && (
        <div style={{
          height: '40px',
          margin: '-12px -12px 8px -12px',
          backgroundImage: `url(${note.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid var(--border)',
          filter: isLocked ? 'blur(4px)' : 'none',
          borderRadius: 'var(--radius) var(--radius) 0 0'
        }} />
      )}
      <div className="note-card-icons">
        {isLocked && <Lock size={14} className="note-icon text-muted" />}
        {isTrash ? (
          <>
            <button className="note-icon-btn" onClick={(e) => { e.stopPropagation(); onRestore?.(note.id); }} title="Restore">
              <RotateCcw size={14} className="note-icon" style={{ color: 'var(--accent)' }} />
            </button>
            <button className="note-icon-btn" onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(note.id); }} title="Delete forever">
              <Trash2 size={14} className="note-icon" style={{ color: 'var(--danger)' }} />
            </button>
          </>
        ) : (
          <>
            <button className="note-icon-btn" onClick={(e) => { e.stopPropagation(); onTogglePin?.(note.id); }} title={note.isPinned ? 'Unpin' : 'Pin'}>
              <Pin size={14} className="note-icon" fill={note.isPinned ? 'currentColor' : 'none'} style={{ color: note.isPinned ? 'var(--accent)' : undefined }} />
            </button>
            <button className="note-icon-btn" onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(note.id); }} title={note.isFavorite ? 'Unfavorite' : 'Favorite'}>
              <Star size={14} className="note-icon" fill={note.isFavorite ? 'currentColor' : 'none'} color={note.isFavorite ? 'var(--accent)' : undefined} />
            </button>
            <button className="note-icon-btn" onClick={(e) => { e.stopPropagation(); onToggleArchive?.(note.id); }} title={note.isArchived ? 'Unarchive' : 'Archive'}>
              <Archive size={14} className="note-icon text-muted" />
            </button>
            <button className="note-icon-btn" onClick={(e) => { e.stopPropagation(); onDelete?.(note.id); }} title="Move to trash">
              <Trash2 size={14} className="note-icon text-muted" />
            </button>
          </>
        )}
      </div>
      <h3>{highlightText(note.title || 'Untitled Note', searchQuery)}</h3>
      <p className="note-preview" style={isLocked ? { filter: 'blur(4px)', userSelect: 'none' } : {}}>
        {highlightText(previewText, searchQuery)}
      </p>
      <p className="note-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} /> Last edited: {getRelativeTime(note.updated_at)}
      </p>
      {note.tags && note.tags.length > 0 && !isTrash && (
        <div className="card-tags">
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag-badge-small" style={{ color: getTagColor(tag), border: `1px solid ${getTagColor(tag)}` }}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
