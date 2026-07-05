import { X, Palette, Zap } from 'lucide-react';
import { THEME_PRESETS } from './paperTypes';

const SettingsPanel = ({ onClose, theme, onThemeChange, biometricEnabled, onBiometricToggle, autoLockTimeout, onAutoLockTimeoutChange }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Notebook Settings</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="settings-content">
          <section className="settings-section">
            <h4><Palette size={16} /> Themes & Appearance</h4>
            <div className="theme-grid">
              {Object.entries(THEME_PRESETS).map(([id, t]) => (
                <button
                  key={id}
                  className={`theme-btn ${theme === id ? 'active' : ''}`}
                  onClick={() => onThemeChange(id)}
                  style={{
                    background: t.bg,
                    color: t.text,
                    borderColor: theme === id ? t.accent : t.border,
                  }}
                >
                  <div className="theme-preview" style={{ background: `linear-gradient(135deg, ${t.bgMain} 0%, ${t.bgCard} 100%)` }}>
                    <div className="theme-dot" style={{ background: t.accent }} />
                  </div>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h4><Zap size={16} /> Auto-Lock Security</h4>
            <div className="setting-row">
              <label className="toggle-label">
                <input type="checkbox" checked={biometricEnabled} onChange={(e) => onBiometricToggle(e.target.checked)} />
                <span className="toggle-switch" />
                <span>Biometric Lock (if available)</span>
              </label>
            </div>
            <div className="setting-row">
              <label>Auto-lock after</label>
              <select value={autoLockTimeout} onChange={(e) => onAutoLockTimeoutChange(Number(e.target.value))}>
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={0}>Never</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h4><Terminal size={16} /> Quick Reference</h4>
            <div className="shortcuts-grid">
              <div className="shortcut"><kbd>Ctrl+B</kbd> Bold</div>
              <div className="shortcut"><kbd>Ctrl+I</kbd> Italic</div>
              <div className="shortcut"><kbd>Ctrl+K</kbd> Link</div>
              <div className="shortcut"><kbd>Ctrl+Shift+7</kbd> Numbered List</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

const Terminal = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);