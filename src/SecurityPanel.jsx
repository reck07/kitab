import { useState, useEffect } from 'react';
import { X, Lock, Unlock, Shield, Key, Fingerprint, Eye, EyeOff, Timer, Info } from 'lucide-react';
import { isNoteLocked } from './crypto';
import { isWebAuthnAvailable, registerBiometric, authenticateBiometric } from './webauthn';

const SecurityPanel = ({ onClose, notes, activeNoteId, onLockNote, onUnlockNote, biometricEnabled, onBiometricToggle, autoLockTimeout, onAutoLockTimeoutChange }) => {
  const activeNote = notes.find(n => n.id === activeNoteId);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [webAuthnAvail, setWebAuthnAvail] = useState(null);

  useEffect(() => {
    isWebAuthnAvailable().then(setWebAuthnAvail);
  }, []);

  if (!activeNote) return null;

  const isLocked = isNoteLocked(activeNote);

  const handleLockNote = async () => {
    if (!passwordInput) {
      setPasswordError('Please enter a password');
      return;
    }
    if (passwordInput.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }
    await onLockNote(activeNote.id, passwordInput);
    setPasswordInput('');
    setPasswordError('');
  };

  const handleUnlockNote = async () => {
    if (!passwordInput) {
      setPasswordError('Please enter a password');
      return;
    }
    const ok = await onUnlockNote(activeNote.id, passwordInput);
    if (ok) {
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="security-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Shield size={18} /> Security & Privacy</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="settings-content">
          <section className="settings-section">
            <h4><Lock size={16} /> Note Encryption</h4>
            <div className="password-controls">
              <div className="password-field">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder={isLocked ? 'Enter password to unlock' : 'Set password for this note'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="password-input"
                />
                <button className="btn-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <div className="password-error">{passwordError}</div>}
              <div className="password-actions">
                {isLocked ? (
                  <button className="btn-primary" onClick={handleUnlockNote}>
                    <Unlock size={14} /> Unlock Note
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleLockNote}>
                    <Lock size={14} /> Lock Note
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="settings-section">
            <h4><Fingerprint size={16} /> Biometric Lock</h4>
            <div className="setting-row">
              {webAuthnAvail === false ? (
                <div className="biometric-unavailable">
                  <Info size={16} />
                  <span>Biometric (WebAuthn) is not available on this device. Requires HTTPS and a device with fingerprint or face unlock.</span>
                </div>
              ) : (
                <label className="toggle-label">
                  <input type="checkbox" checked={biometricEnabled} onChange={async (e) => {
                    if (e.target.checked) {
                      try {
                        await registerBiometric();
                        onBiometricToggle(true);
                      } catch (err) {
                        alert('Biometric registration failed: ' + err.message);
                      }
                    } else {
                      localStorage.removeItem('webauthn_credential');
                      onBiometricToggle(false);
                    }
                  }} />
                  <span className="toggle-switch" />
                  <span>Use biometric authentication</span>
                </label>
              )}
              <p className="setting-hint">Requires device with fingerprint or face unlock support</p>
            </div>
          </section>

          <section className="settings-section">
            <h4><Timer size={16} /> Auto-Lock Timer</h4>
            <div className="setting-row">
              <select value={autoLockTimeout} onChange={(e) => onAutoLockTimeoutChange(Number(e.target.value))}>
                <option value={1}>1 minute</option>
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={0}>Never (not recommended)</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <h4><Key size={16} /> Encrypted Notes</h4>
            <div className="encrypted-notes-list">
              {notes.filter(n => isNoteLocked(n)).map(n => (
                <div key={n.id} className="locked-note-item">
                  <Lock size={14} />
                  <span>{n.title || 'Untitled'}</span>
                  <span className="locked-badge">🔒 Locked</span>
                </div>
              ))}
              {notes.filter(n => isNoteLocked(n)).length === 0 && (
                <p className="setting-hint">No notes are currently locked</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;
