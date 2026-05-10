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

export default Navbar;