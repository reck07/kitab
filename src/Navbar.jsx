import { User, Cloud, Plus } from 'lucide-react';

const Navbar = ({ user, onSignOut, isGuest, onLogin, onGoogleDriveSave, onToggleView, onNewNote }) => {
  const buttons = [
    { icon: Plus, label: 'new', title: 'New Note', isNew: true },
    { label: 'view', title: 'View Notes', isView: true },
    { icon: User, label: 'sign in', title: user ? 'Sign Out' : 'Sign In', isSignIn: true },
    { icon: Cloud, label: 'drive', title: 'Upload to Google Drive', isDrive: true },
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
          <h1 className="brand-label">kitāb</h1>
        </div>
        <div className="controls-area">
          {buttons.map((btn) => (
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
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
