import { X, Layout } from 'lucide-react';
import { PAPER_TYPES, PAPER_CATEGORIES, CANVAS_SIZES } from './paperTypes';

const LayoutPanel = ({ onClose, notes, activeNoteId, onUpdateNote }) => {
  const activeNote = notes.find(n => n.id === activeNoteId);
  if (!activeNote) return null;

  const currentPaper = activeNote.paperStyle || 'ruled';
  const currentSize = activeNote.canvasSize || 'A5';

  const handlePaperChange = (typeId) => {
    onUpdateNote(activeNoteId, { paperStyle: typeId });
  };

  const handleSizeChange = (sizeId) => {
    onUpdateNote(activeNoteId, { canvasSize: sizeId });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="layout-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Layout size={18} /> Layout & Canvas</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="settings-content">
          <section className="settings-section">
            <h4>Paper Type</h4>
            <div className="layout-grid">
              {Object.entries(PAPER_CATEGORIES).map(([catId, cat]) => (
                <div key={catId} className="category-group">
                  <h5 className="category-label">{cat.icon} {cat.name}</h5>
                  <div className="paper-choices">
                    {cat.types.map(typeId => {
                      const type = PAPER_TYPES[typeId];
                      return (
                        <button
                          key={typeId}
                          className={`layout-btn ${currentPaper === typeId ? 'active' : ''}`}
                          onClick={() => handlePaperChange(typeId)}
                        >
                          <div className="layout-preview" style={{
                            background: type.category === 'grid'
                              ? `linear-gradient(transparent, transparent ${5}px, var(--text-muted) ${5}px, var(--text-muted) ${6}px), linear-gradient(90deg, transparent, transparent ${5}px, var(--text-muted) ${5}px, var(--text-muted) ${6}px)`
                              : type.category === 'lined'
                              ? `repeating-linear-gradient(transparent, transparent ${type.spacing || 7}px, var(--text-muted) ${type.spacing || 7}px, var(--text-muted) calc(${type.spacing || 7}px + 1px))`
                              : type.category === 'specialty'
                              ? `repeating-linear-gradient(transparent, transparent ${type.spacing || 7}px, #d4c4b7 ${type.spacing || 7}px, #d4c4b7 calc(${type.spacing || 7}px + 0.5px))`
                              : 'transparent',
                            backgroundSize: type.category === 'grid' ? '10px 10px' : '100% 100%',
                          }} />
                          <div className="layout-info">
                            <span className="layout-name">{type.name}</span>
                            <span className="layout-desc">{type.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h4>Canvas Size</h4>
            <div className="size-grid">
              {Object.entries(CANVAS_SIZES).map(([sizeId, size]) => (
                <button
                  key={sizeId}
                  className={`size-btn ${currentSize === sizeId ? 'active' : ''}`}
                  onClick={() => handleSizeChange(sizeId)}
                >
                  <div className="size-icon" style={{
                    width: '100%',
                    aspectRatio: size.aspectRatio,
                    background: currentSize === sizeId ? 'var(--accent)' : 'var(--bg-active)',
                    borderRadius: '4px',
                    border: '2px solid var(--border)',
                    maxHeight: '40px',
                  }} />
                  <span className="size-name">{size.name}</span>
                  <span className="size-dims">{size.width}×{size.height} {size.unit}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LayoutPanel;