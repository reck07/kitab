<<<<<<< HEAD
import { Lock, Pin, Star, Archive, Clock } from 'lucide-react';

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

const NoteCard = ({ note, isActive, onClick, searchQuery }) => {
  const isLocked = typeof note.content === 'string' && note.content.startsWith('locked:v1:');
  const previewText = isLocked
    ? 'This note is locked'
    : `${note.content?.replace(/<[^>]*>/g, '').substring(0, 60) || ''}...`;

  return (
    <div 
      className={`note-card binder-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {note.coverImage && (
        <div style={{
          height: '64px',
          margin: '-18px -18px 12px -18px',
          backgroundImage: `url(${note.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid var(--border)',
          filter: isLocked ? 'blur(4px)' : 'none'
        }} />
      )}
      <div className="note-card-icons">
        {isLocked && <Lock size={14} className="note-icon text-muted" />}
        {note.isPinned && <Pin size={14} className="note-icon" fill="currentColor" />}
        {note.isFavorite && <Star size={14} className="note-icon" fill="currentColor" color="var(--accent)" />}
        {note.isArchived && <Archive size={14} className="note-icon text-muted" title="Archived" />}
      </div>
      <h3>{highlightText(note.title || 'Untitled Note', searchQuery)}</h3>
      <p className="note-preview" style={isLocked ? { filter: 'blur(4px)', userSelect: 'none' } : {}}>
        {highlightText(previewText, searchQuery)}
      </p>
      <p className="note-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} /> Last edited: {getRelativeTime(note.updated_at)}
      </p>
      {note.tags && note.tags.length > 0 && (
        <div className="card-tags">
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag-badge-small" style={{ color: getTagColor(tag), border: `1px solid ${getTagColor(tag)}` }}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

=======
import { Lock, Pin, Star, Archive, Clock } from 'lucide-react';

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

const NoteCard = ({ note, isActive, onClick, searchQuery }) => {
  const isLocked = typeof note.content === 'string' && note.content.startsWith('locked:v1:');
  const previewText = isLocked
    ? 'This note is locked'
    : `${note.content?.replace(/<[^>]*>/g, '').substring(0, 60) || ''}...`;

  return (
    <div 
      className={`note-card binder-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {note.coverImage && (
        <div style={{
          height: '64px',
          margin: '-18px -18px 12px -18px',
          backgroundImage: `url(${note.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid var(--border)',
          filter: isLocked ? 'blur(4px)' : 'none'
        }} />
      )}
      <div className="note-card-icons">
        {isLocked && <Lock size={14} className="note-icon text-muted" />}
        {note.isPinned && <Pin size={14} className="note-icon" fill="currentColor" />}
        {note.isFavorite && <Star size={14} className="note-icon" fill="currentColor" color="var(--accent)" />}
        {note.isArchived && <Archive size={14} className="note-icon text-muted" title="Archived" />}
      </div>
      <h3>{highlightText(note.title || 'Untitled Note', searchQuery)}</h3>
      <p className="note-preview" style={isLocked ? { filter: 'blur(4px)', userSelect: 'none' } : {}}>
        {highlightText(previewText, searchQuery)}
      </p>
      <p className="note-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} /> Last edited: {getRelativeTime(note.updated_at)}
      </p>
      {note.tags && note.tags.length > 0 && (
        <div className="card-tags">
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag-badge-small" style={{ color: getTagColor(tag), border: `1px solid ${getTagColor(tag)}` }}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

>>>>>>> b95ce7254a8b813cef834ed02a8364210c343079
export default NoteCard;