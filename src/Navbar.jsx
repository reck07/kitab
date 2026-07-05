import { Sun, Moon, Coffee, Menu, X, LogOut, User } from 'lucide-react';

const Navbar = ({ theme, onThemeChange, onMenuToggle, isSidebarOpen, user, onSignOut, isGuest, onLogin }) => {
  return (
    <header className="app-header">
      <div className="nav-brand">
        <div className="premium-logo">
          <button 
            className="btn-icon logo-icon-wrapper" 
            onClick={onMenuToggle} 
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
          <span className="logo-text">Kitāb</span>
        </div>
      </div>
      <div className="nav-meta">
        {user && (
          <div className="user-pill">
            <span className="avatar">{user.email?.[0]?.toUpperCase() || 'U'}</span>
            <span style={{ maxWidth: 140, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
            <button className="btn-logout" onClick={onSignOut} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        )}
        {isGuest && !user && (
          <div className="user-pill">
            <span className="avatar">G</span>
            <span>Guest</span>
            <button className="btn-logout" onClick={onLogin} title="Sign in">
              <User size={14} />
            </button>
          </div>
        )}
        <button 
          className="btn-icon" 
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : theme === 'dark' ? 'coffee' : 'light')}
          title={`Switch Theme (${theme})`}
          style={{ marginLeft: '8px' }}
        >
          {theme === 'light' && <Sun size={20} />}
          {theme === 'dark' && <Moon size={20} />}
          {theme === 'coffee' && <Coffee size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;