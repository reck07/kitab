import { User, Cloud, Plus } from 'lucide-react';

const Navbar = ({ user, onSignOut, isGuest, onLogin, onGoogleDriveSave, onToggleView, onNewNote, driveSyncStatus }) => {
  const isSignedIn = !!user || isGuest;
  const firstLetter = user?.email?.charAt(0)?.toUpperCase();

  const driveTitle = driveSyncStatus === 'syncing' ? 'Syncing...' : driveSyncStatus === 'error' ? 'Sync failed' : driveSyncStatus === 'synced' ? 'Synced!' : 'Upload to Google Drive';

  const buttons = [
    { icon: Plus, label: 'new', title: 'New Note', isNew: true },
    { label: 'view', title: 'View Notes', isView: true },
    { label: user ? 'sign out' : 'sign in', title: user ? 'Sign Out' : 'Sign In', isSignIn: true },
    { icon: Cloud, label: 'drive', title: driveTitle, isDrive: true },
  ];

  const handleClick = (btn) => {
    if (btn.isNew) {
      onNewNote?.();
    } else if (btn.isView) {
      onToggleView?.();
    } else if (btn.isDrive) {
      onGoogleDriveSave?.();
    } else if (btn.isSignIn) {
      user ? onSignOut() : onLogin();
    }
  };

  return (
    <header className="app-header">
      <div className="header-casing">
        <div className="brand-area">
          <div className="brand-top">
            <svg className="brand-mark" viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M6 12l12-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M6 12l12 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="19" cy="5" r="1.8" fill="#6366f1"/>
            </svg>
            <h1 className="brand-label">kitāb</h1>
          </div>
          <div className="brand-divider" />
          <span className="brand-sub">the Reckoner</span>
        </div>
        <div className="controls-area">
          {buttons.map((btn) => (
            <div className="button-unit" key={btn.label}>
              <button
                type="button"
                className={`tactile-btn${btn.isSignIn ? ' sign-in-btn' : ''}${btn.isDrive ? ' drive-btn' : ''}${btn.isDrive && driveSyncStatus === 'syncing' ? ' syncing' : ''}${btn.isDrive && driveSyncStatus === 'synced' ? ' synced' : ''}${btn.isDrive && driveSyncStatus === 'error' ? ' sync-error' : ''}${btn.isSignIn && isSignedIn && driveSyncStatus !== 'idle' && driveSyncStatus ? ` drive-${driveSyncStatus}` : ''}`}
                title={btn.title}
                onClick={() => handleClick(btn)}
              >
                <div className="btn-outer">
                  <div className={`btn-inner${btn.isSignIn && isSignedIn ? ' signed-in' : ''}`}>
                    {btn.isSignIn && isSignedIn ? (
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{firstLetter}</span>
                    ) : btn.icon ? (
                      <btn.icon size={16} />
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 500 }}>i</span>
                    )}
                  </div>
                </div>
              </button>
              <span className="btn-label">{btn.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
