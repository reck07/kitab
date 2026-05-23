<<<<<<< HEAD
import { Sun, Moon, Coffee, Menu, X, LogIn, LogOut, Server } from 'lucide-react';

const Navbar = ({ theme, onThemeChange, onMenuToggle, isMobile, isSidebarOpen, onExportJSON, onExportPDF, user, onLoginClick, onLogout, dbStatus }) => {
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
        {dbStatus && (
          <div 
            title={
              dbStatus === 'connected' ? 'Supabase: connected' :
              dbStatus === 'missing_table' ? 'Supabase: run supabase/schema.sql in SQL Editor' :
              dbStatus === 'unconfigured' ? 'Supabase: add .env keys and restart dev server' :
              dbStatus === 'checking' ? 'Supabase: checking…' :
              'Supabase: connection error — check console'
            }
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginRight: '8px',
              color:
                dbStatus === 'connected' ? '#4caf50' :
                dbStatus === 'offline' ? '#9e9e9e' :
                dbStatus === 'missing_table' || dbStatus === 'error' ? '#ff4444' :
                dbStatus === 'unconfigured' ? '#ff9800' :
                'var(--text-muted)',
              cursor: 'help'
            }}
          >
            <Server size={18} />
          </div>
        )}
        {user?.email && (
          <span className="nav-user-email" title={user.email}>
            {user.email.split('@')[0]}
          </span>
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
        {user ? (
          <button className="btn-icon" onClick={onLogout} title="Sign Out" style={{ marginLeft: '4px' }}>
            <LogOut size={20} />
          </button>
        ) : (
          <button className="btn-icon" onClick={onLoginClick} title="Sign In" style={{ marginLeft: '4px' }}>
            <LogIn size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

=======
import { Sun, Moon, Coffee, Menu, X } from 'lucide-react';

const Navbar = ({ theme, onThemeChange, onMenuToggle, isMobile, isSidebarOpen, onExportJSON, onExportPDF }) => {
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

>>>>>>> b95ce7254a8b813cef834ed02a8364210c343079
export default Navbar;