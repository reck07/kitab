import { useState, useEffect, useRef } from 'react';
import { Grid, User, Cloud, Plus, X, Pin, GripVertical, Star } from 'lucide-react';

const STORAGE_KEY = 'kitab_quick_apps';

const COMMON_APPS = [
  { name: 'WhatsApp', pkg: 'com.whatsapp', icon: '💬' },
  { name: 'YouTube', pkg: 'com.google.android.youtube', icon: '▶️' },
  { name: 'Gmail', pkg: 'com.google.android.gm', icon: '📧' },
  { name: 'Chrome', pkg: 'com.android.chrome', icon: '🌐' },
  { name: 'Maps', pkg: 'com.google.android.apps.maps', icon: '🗺️' },
  { name: 'Calendar', pkg: 'com.google.android.calendar', icon: '📅' },
  { name: 'Photos', pkg: 'com.google.android.apps.photos', icon: '🖼️' },
  { name: 'Drive', pkg: 'com.google.android.apps.docs', icon: '☁️' },
  { name: 'Settings', pkg: 'com.android.settings', icon: '⚙️' },
  { name: 'Phone', pkg: 'com.android.dialer', icon: '📞' },
  { name: 'Spotify', pkg: 'com.spotify.music', icon: '🎵' },
  { name: 'Instagram', pkg: 'com.instagram.android', icon: '📸' },
];

const Navbar = ({ user, onSignOut, isGuest, onLogin, onGoogleDriveSave, onToggleView }) => {
  const [showLauncher, setShowLauncher] = useState(false);
  const [quickApps, setQuickApps] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPkg, setNewPkg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quickApps));
  }, [quickApps]);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && showLauncher) {
        setShowLauncher(false);
        setShowAddForm(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLauncher]);

  const launchApp = async (app) => {
    try {
      if (window.Capacitor?.isNativePlatform()) {
        const plugin = window.Capacitor.Plugins?.AppLauncher;
        if (plugin) {
          const { value } = await plugin.canOpenUrl({ url: app.pkg });
          if (value) { await plugin.openUrl({ url: app.pkg }); return; }
        }
      }
    } catch (_) {}
    window.open(`intent://${app.pkg}#Intent;end`, '_blank');
  };

  const addApp = (app) => {
    if (!quickApps.find(a => a.pkg === app.pkg)) {
      setQuickApps([...quickApps, { ...app, id: Date.now(), pinned: false }]);
    }
    setShowAddForm(false);
    setSearchTerm('');
  };

  const addCustomApp = () => {
    if (newName.trim() && newPkg.trim()) {
      addApp({ name: newName.trim(), pkg: newPkg.trim(), icon: '📱' });
      setNewName('');
      setNewPkg('');
    }
  };

  const removeApp = (id) => setQuickApps(quickApps.filter(a => a.id !== id));

  const togglePin = (id) => setQuickApps(quickApps.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...quickApps];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setQuickApps(reordered);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const filteredCommon = COMMON_APPS.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.pkg.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pinnedApps = quickApps.filter(a => a.pinned);
  const unpinnedApps = quickApps.filter(a => !a.pinned);
  const sortedApps = [...pinnedApps, ...unpinnedApps];

  const buttons = [
    { icon: Grid, label: 'app', title: 'Quick Apps', isSave: true },
    { label: 'view', title: 'View Notes', isView: true },
    { icon: User, label: 'sign in', title: user ? 'Sign Out' : 'Sign In', isSignIn: true },
    { icon: Cloud, label: 'drive', title: 'Upload to Google Drive', isDrive: true },
  ];

  const handleClick = (btn) => {
    if (btn.isSave) {
      setShowLauncher(!showLauncher);
      setShowAddForm(false);
    } else if (btn.isView) {
      onToggleView?.();
    } else if (btn.isDrive) {
      onGoogleDriveSave?.();
    } else if (btn.isSignIn) {
      user ? onSignOut() : onLogin();
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-casing">
          <div className="brand-area">
            <h1 className="brand-label">kitāb</h1>
          </div>

          <div className="controls-area">
            {buttons.map((btn, i) => {
              return (
                <div className="button-unit" key={btn.label}>
                  <button
                    type="button"
                    className={`tactile-btn${btn.isSignIn ? ' sign-in-btn' : ''}${btn.isDrive ? ' drive-btn' : ''}`}
                    title={btn.title}
                    onClick={() => handleClick(btn)}
                  >
                    <div className="btn-outer">
                      <div className="btn-inner">
                        {btn.icon ? <btn.icon size={16} /> : <span style={{ fontSize: 14, fontWeight: 500 }}>i</span>}
                      </div>
                    </div>
                  </button>
                  <span className="btn-label">{btn.label}</span>
                </div>
              );
            })}
          </div>

        </div>
      </header>

      {showLauncher && (
        <div className="quick-launcher-backdrop" onClick={() => { setShowLauncher(false); setShowAddForm(false); }}>
          <div className="quick-launcher-panel" ref={panelRef} onClick={e => e.stopPropagation()}>
            <div className="ql-header">
              <h3>📱 Quick Apps</h3>
              <button className="ql-close" onClick={() => setShowLauncher(false)}><X size={14} /></button>
            </div>

            {sortedApps.length > 0 ? (
              <div className="ql-app-list">
                {sortedApps.map((app, idx) => (
                  <div key={app.id} className={`ql-app-item ${dragIdx === idx ? 'dragging' : ''}`}
                    draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd}>
                    <span className="ql-drag-handle"><GripVertical size={12} /></span>
                    <span className="ql-app-icon">{app.icon || '📱'}</span>
                    <span className="ql-app-name">{app.name}</span>
                    <span className="ql-app-pkg">{app.pkg.split('.').pop()}</span>
                    <div className="ql-app-actions">
                      <button className="ql-action-btn" onClick={() => launchApp(app)} title="Launch">▶</button>
                      <button className={`ql-action-btn ${app.pinned ? 'pinned' : ''}`} onClick={() => togglePin(app.id)} title={app.pinned ? 'Unpin' : 'Pin'}><Pin size={11} /></button>
                      <button className="ql-action-btn danger" onClick={() => removeApp(app.id)} title="Remove"><X size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ql-empty">No app shortcuts yet. Add your favorite apps below.</div>
            )}

            <div className="ql-divider" />

            {showAddForm ? (
              <div className="ql-add-form">
                {searchTerm && (
                  <div className="ql-suggestions">
                    {filteredCommon.map(app => (
                      <button key={app.pkg} className="ql-suggestion-item" onClick={() => addApp(app)}>
                        <span>{app.icon}</span> {app.name} <small>{app.pkg.split('.').pop()}</small>
                      </button>
                    ))}
                    {filteredCommon.length === 0 && <div className="ql-no-suggestions">No suggestions</div>}
                  </div>
                )}
                <div className="ql-custom-add">
                  <input className="ql-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="App name..." />
                  <input className="ql-input" value={newPkg} onChange={e => setNewPkg(e.target.value)} placeholder="Package name (e.g. com.whatsapp)" />
                  <button className="ql-add-btn" onClick={addCustomApp}>Add App</button>
                </div>
                <button className="ql-cancel-btn" onClick={() => { setShowAddForm(false); setSearchTerm(''); }}>Cancel</button>
              </div>
            ) : (
              <div className="ql-search-bar">
                <input className="ql-input" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setShowAddForm(true); }} placeholder="Search or add app..." autoFocus />
                <button className="ql-add-btn" onClick={() => setShowAddForm(true)}><Plus size={14} /> Add</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
