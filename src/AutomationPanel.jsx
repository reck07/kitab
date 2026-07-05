import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getRules, saveRules, removeRule, addRule } from './automationRules';

const TRIGGERS = [
  { value: 'onCreate', label: 'When Note Created' },
  { value: 'onUpdate', label: 'When Note Updated' },
  { value: 'onTag', label: 'When Tag Added' },
];

const AutomationPanel = ({ onClose }) => {
  const [rules, setRules] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ trigger: 'onCreate', conditionTag: '', conditionFolder: '', conditionContent: '', actionAddTag: '', actionRemoveTag: '', actionArchive: false, actionPin: false });

  useEffect(() => { setRules(getRules()); }, []);

  const handleAdd = () => {
    if (!form.actionAddTag && !form.actionRemoveTag && !form.actionArchive && !form.actionPin) return;
    const updated = addRule(form);
    setRules(updated);
    setShowAdd(false);
    setForm({ trigger: 'onCreate', conditionTag: '', conditionFolder: '', conditionContent: '', actionAddTag: '', actionRemoveTag: '', actionArchive: false, actionPin: false });
  };

  const handleToggle = (id) => {
    const updated = getRules().map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    saveRules(updated);
    setRules(updated);
  };

  const handleRemove = (id) => {
    const updated = removeRule(id);
    setRules(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="security-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚡ Automation Rules</h3>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="settings-content">
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Create rules that automatically tag, pin, or archive notes based on content or metadata.
          </p>

          {rules.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No rules yet.</p>}

          {rules.map(rule => (
            <div key={rule.id} className="setting-row" style={{ opacity: rule.enabled ? 1 : 0.5 }}>
              <div style={{ flex: 1, fontSize: 13 }}>
                <strong>{TRIGGERS.find(t => t.value === rule.trigger)?.label || rule.trigger}</strong>
                {rule.conditionTag && <span> when tag is <strong>{rule.conditionTag}</strong></span>}
                {rule.conditionFolder && <span> in folder <strong>{rule.conditionFolder}</strong></span>}
                {rule.conditionContent && <span> contains "<strong>{rule.conditionContent}</strong>"</span>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  → {[
                    rule.actionAddTag && `add tag "${rule.actionAddTag}"`,
                    rule.actionRemoveTag && `remove tag "${rule.actionRemoveTag}"`,
                    rule.actionArchive && 'archive',
                    rule.actionPin && 'pin',
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
              <button className="btn-icon" onClick={() => handleToggle(rule.id)} title={rule.enabled ? 'Disable' : 'Enable'}>
                {rule.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              </button>
              <button className="btn-icon" onClick={() => handleRemove(rule.id)} title="Delete"><Trash2 size={14} /></button>
            </div>
          ))}

          {showAdd ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, padding: 12, background: 'var(--bg-active)', borderRadius: 'var(--radius)' }}>
              <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}>
                {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input placeholder="Condition: tag name" value={form.conditionTag} onChange={e => setForm(f => ({ ...f, conditionTag: e.target.value }))} />
              <input placeholder="Condition: folder name" value={form.conditionFolder} onChange={e => setForm(f => ({ ...f, conditionFolder: e.target.value }))} />
              <input placeholder="Condition: content contains..." value={form.conditionContent} onChange={e => setForm(f => ({ ...f, conditionContent: e.target.value }))} />
              <input placeholder="Action: add tag" value={form.actionAddTag} onChange={e => setForm(f => ({ ...f, actionAddTag: e.target.value }))} />
              <input placeholder="Action: remove tag" value={form.actionRemoveTag} onChange={e => setForm(f => ({ ...f, actionRemoveTag: e.target.value }))} />
              <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={form.actionArchive} onChange={e => setForm(f => ({ ...f, actionArchive: e.target.checked }))} /> Archive
              </label>
              <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={form.actionPin} onChange={e => setForm(f => ({ ...f, actionPin: e.target.checked }))} /> Pin
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={handleAdd}>Add Rule</button>
                <button onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ marginTop: 12 }}><Plus size={14} /> Add Rule</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationPanel;
