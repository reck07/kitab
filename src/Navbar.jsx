import { Plus, Download } from 'lucide-react';

const Navbar = ({
  user, onSignOut, isGuest, onLogin, onExport,
  onToggleView, onNewNote, onBrandClick
}) => {
  const isSignedIn = !!user || isGuest;
  const firstLetter = user?.email?.charAt(0)?.toUpperCase();

  const fixedButtons = [
    { id: 'new', icon: Plus, label: 'new', title: 'New Note', onClick: onNewNote },
    { id: 'view', label: 'view', title: 'View Notes', onClick: onToggleView, isView: true },
    {
      id: 'signin', label: user ? 'sign out' : 'sign in',
      title: user ? 'Sign Out' : 'Sign In',
      onClick: () => user ? onSignOut() : onLogin(),
      isSignIn: true, isSignedIn, firstLetter
    },
    { id: 'export', icon: Download, label: 'txt', title: 'Export as TXT', onClick: onExport },
  ];

  return (
    <header className="app-header">
      <div className="header-casing">
        <div className="brand-area" onClick={onBrandClick}>
          <h1 className="brand-label">kitāb</h1>
          <div className="brand-divider" />
          <span className="brand-sub">the Reckoner</span>
        </div>
        <div className="controls-area-wrapper">
          <div className="controls-area">
            {fixedButtons.map((btn) => (
              <div className="button-unit" key={btn.id}>
                <button
                  type="button"
                  className={`tactile-btn${btn.isSignIn ? ' sign-in-btn' : ''}`}
                  title={btn.title}
                  data-tooltip={btn.title}
                  tabIndex={0}
                  onClick={btn.onClick}
                >
                  <div className="btn-outer">
                    <div className={`btn-inner${btn.isSignIn && btn.isSignedIn ? ' signed-in' : ''}`}>
                      {btn.isSignIn && btn.isSignedIn ? (
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{btn.firstLetter}</span>
                      ) : btn.isView ? (
                        <span style={{ fontSize: 14, fontWeight: 500 }}>i</span>
                      ) : btn.icon ? (
                        <btn.icon size={16} />
                      ) : null}
                    </div>
                  </div>
                </button>
                <span className="btn-label">{btn.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
