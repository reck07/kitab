import { X, Share2, Copy, Download } from 'lucide-react';

const QrCodeModal = ({ note, onClose }) => {
  const noteData = JSON.stringify({
    id: note.id,
    title: note.title,
    content: note.content?.substring(0, 500),
    created_at: note.created_at,
    updated_at: note.updated_at,
    folder: note.folder,
    tags: note.tags,
  }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(noteData);
    alert('Note data copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([noteData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title?.replace(/\s+/g, '_') || 'note'}_share.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Share2 size={18} /> Share Note Data</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="qr-content">
          <p className="qr-hint">Copy or download this note as JSON data</p>
          <div className="share-data-preview">
            <pre>{noteData.substring(0, 300)}...</pre>
          </div>
          <p className="qr-note-title">{note.title || 'Untitled Note'}</p>
          <div className="qr-actions">
            <button className="btn-secondary" onClick={handleCopy}>
              <Copy size={14} /> Copy JSON
            </button>
            <button className="btn-primary" onClick={handleDownload}>
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodeModal;