import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import Navbar from './Navbar'
import Login from './Login'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'
import { Star, Archive, X, Palette, Layout, Shield, QrCode, Zap, Trash2, Share2, Save, FilePlus } from 'lucide-react'
import { isNoteLocked } from './crypto'
import Calculator from './Calculator'
import DrawingPad from './DrawingPad'
import FloatingMenu from './FloatingMenu'
import SettingsPanel from './SettingsPanel'
import LayoutPanel from './LayoutPanel'
import SecurityPanel from './SecurityPanel'
import QrCodeModal from './QrCodeModal'
import AutomationPanel from './AutomationPanel'
import { evaluateRules, applyActions } from './automationRules'
import { DEFAULT_NOTE_CONFIG, THEME_PRESETS } from './paperTypes'
import { useAuth } from './hooks/useAuth'
import { useNotes } from './hooks/useNotes'

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 🌅';
  if (hour < 18) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
};

const GraphView = ({ notes, unlockedContentById, activeNoteId, onNavigate, onClose }) => {
  const edges = new Map();
  const nodes = notes.map(n => ({ id: n.id, title: n.title || 'Untitled', tags: n.tags || [] }));
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 500 });
  const dragRef = useRef(null);

  const addEdge = (source, target, type) => {
    const key = [source, target].sort().join('-');
    if (!edges.has(key)) edges.set(key, { source, target, type });
  };

  notes.forEach(note => {
    const content = (isNoteLocked(note) ? unlockedContentById[note.id] : note.content) || '';
    const matches = [...content.matchAll(/\[\[(.*?)\]\]/g)];
    matches.forEach(m => {
      const targetTitle = m[1].toLowerCase();
      const targetNote = notes.find(n => n.id !== note.id && n.title?.toLowerCase() === targetTitle);
      if (targetNote) addEdge(note.id, targetNote.id, 'explicit');
    });
  });

  notes.forEach((noteA, i) => {
    notes.slice(i + 1).forEach(noteB => {
      const sharedTags = noteA.tags?.filter(tag => noteB.tags?.includes(tag));
      if (sharedTags && sharedTags.length > 0) addEdge(noteA.id, noteB.id, 'implicit');
    });
  });

  const width = 800; const height = 500;

  // Tag-based clustering: group nodes by their primary tag
  const tagGroups = {};
  nodes.forEach(n => {
    const primaryTag = n.tags[0] || '_ungrouped';
    if (!tagGroups[primaryTag]) tagGroups[primaryTag] = [];
    tagGroups[primaryTag].push(n);
  });
  const groupKeys = Object.keys(tagGroups);
  const nodePositions = {};
  const cx = width / 2; const cy = height / 2;
  const ringRadius = 200;

  groupKeys.forEach((groupKey, gIdx) => {
    const groupNodes = tagGroups[groupKey];
    const groupAngle = (Math.PI * 2 * gIdx) / Math.max(1, groupKeys.length);
    const groupCenterX = cx + 80 * Math.cos(groupAngle);
    const groupCenterY = cy + 80 * Math.sin(groupAngle);
    groupNodes.forEach((node, nIdx) => {
      const isActive = node.id === activeNoteId;
      const localRadius = isActive ? 0 : 40 + groupNodes.length * 8;
      const localAngle = groupNodes.length === 1 ? groupAngle : (Math.PI * 2 * nIdx) / groupNodes.length;
      nodePositions[node.id] = {
        x: isActive ? cx : groupCenterX + localRadius * Math.cos(localAngle),
        y: isActive ? cy : groupCenterY + localRadius * Math.sin(localAngle)
      };
    });
  });

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox(v => {
      const nw = Math.max(200, v.w * factor);
      const nh = nw * (height / width);
      return { x: v.x - (nw - v.w) / 2, y: v.y - (nh - v.h) / 2, w: nw, h: nh };
    });
  };

  const handleMouseDown = (e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setViewBox(v => ({ ...v, x: dragRef.current.vx - dx * (v.w / svgRef.current?.clientWidth), y: dragRef.current.vy - dy * (v.h / svgRef.current?.clientHeight) }));
  };

  const handleMouseUp = () => { dragRef.current = null; };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius)', padding: '24px', width: '90%', maxWidth: '850px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Knowledge Graph <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>scroll to zoom · drag to pan · click a node to navigate</span></h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', height: '500px', position: 'relative', cursor: 'grab' }}>
          <svg ref={svgRef} width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {Array.from(edges.values()).map((e, i) => {
              const src = nodePositions[e.source]; const tgt = nodePositions[e.target];
              if (!src || !tgt) return null;
              const isImplicit = e.type === 'implicit';
              return <line key={i} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y} stroke="var(--text-muted)" strokeWidth={isImplicit ? 1 : 1.5} opacity={isImplicit ? 0.2 : 0.4} strokeDasharray={isImplicit ? '4 4' : 'none'} />
            })}
            {nodes.map(n => {
              const pos = nodePositions[n.id];
              if (!pos) return null;
              const isActive = n.id === activeNoteId;
              return (
                <g key={n.id} transform={`translate(${pos.x}, ${pos.y})`} style={{ cursor: 'pointer' }} onClick={() => { onNavigate(n.id); onClose(); }}>
                  <circle r={isActive ? 14 : 8} fill={isActive ? 'var(--accent)' : 'var(--bg-main)'} stroke={isActive ? 'var(--bg-app)' : 'var(--accent)'} strokeWidth="3" />
                  <text y={isActive ? 28 : 22} textAnchor="middle" fontSize={isActive ? '12px' : '10px'} fill="var(--text-main)" fontWeight={isActive ? '700' : '500'}>{n.title}</text>
                </g>
              )
            })}
          </svg>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16, justifyContent: 'center' }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 2, background: 'var(--text-muted)', opacity: 0.4, marginRight: 4, verticalAlign: 'middle' }} /> Explicit link (wikilink)</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 2, background: 'var(--text-muted)', opacity: 0.2, marginRight: 4, verticalAlign: 'middle', borderTop: '2px dashed var(--text-muted)', background: 'none' }} /> Implicit link (shared tag)</span>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, authLoading, isGuest, isAuthenticated, handleSignOut, handleSkipLogin, clearGuestMode } = useAuth();
  const {
    notes, activeNoteId, setActiveNoteId, activeNote, activeNoteForEditor,
    unlockedContentById, showArchived, setShowArchived, showTrash, setShowTrash,
    searchQuery, setSearchQuery, selectedTag, setSelectedTag, selectedFolder, setSelectedFolder,
    showFavorites, setShowFavorites, sortOrder, setSortOrder,
    showSavedIndicator, lastSavedTime,
    filteredNotes, allTags, allFolders, forwardLinks, backlinks,
    addPage, removePage, restoreNote, permanentlyDelete,
    handleTogglePin, handleToggleFavorite, handleToggleArchive,
    handleLockToggle, handleSecurityLock, handleSecurityUnlock,
    handleEditorUpdate, handleRemoveTag, unlockNote,
    reorderNotes, saveAsTemplate, loadTemplates, createFromTemplate,
    setNotes,
  } = useNotes(user);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(window.innerWidth >= 768);
  const debounceRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'coffee');
  const [showGraph, setShowGraph] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDrawingPad, setShowDrawingPad] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(5);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const editorActionsRef = useRef(null);
  const [isSortDropdownVisible, setIsSortDropdownVisible] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showViewSwitcher, setShowViewSwitcher] = useState(false);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  // Update theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    const preset = THEME_PRESETS[theme];
    if (preset) {
      root.style.setProperty('--bg-app', preset.bg);
      root.style.setProperty('--bg-main', preset.bg);
      root.style.setProperty('--bg-glass', `${preset.bg}d9`);
      root.style.setProperty('--bg-sidebar', preset.bgCard);
      root.style.setProperty('--bg-card', preset.bgCard);
      root.style.setProperty('--bg-card-hover', preset.bgMain);
      root.style.setProperty('--bg-active', preset.bgMain);
      root.style.setProperty('--text-main', preset.text);
      root.style.setProperty('--text-muted', preset.textMuted);
      root.style.setProperty('--border', preset.border);
      root.style.setProperty('--accent', preset.accent);
      root.style.setProperty('--accent-hover', preset.accent);
    }
  }, [theme]);

  // Mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) { setIsSidebarOpen(true); setIsEditorOpen(true); }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleThemeChange = (newTheme) => { setTheme(newTheme); localStorage.setItem('theme', newTheme); };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
      if (isCmd && e.key === 'n') {
        e.preventDefault();
        addPage();
      }
      if (e.key === 'Escape') {
        if (showGraph) { setShowGraph(false); e.preventDefault(); }
        else if (showCalculator) { setShowCalculator(false); e.preventDefault(); }
        else if (showDrawingPad) { setShowDrawingPad(false); e.preventDefault(); }
        else if (showSettings) { setShowSettings(false); e.preventDefault(); }
        else if (showLayoutPanel) { setShowLayoutPanel(false); e.preventDefault(); }
        else if (showSecurityPanel) { setShowSecurityPanel(false); e.preventDefault(); }
        else if (showQrCode) { setShowQrCode(false); e.preventDefault(); }
        else if (showAutomation) { setShowAutomation(false); e.preventDefault(); }
        else if (isTemplatePickerOpen) { setIsTemplatePickerOpen(false); e.preventDefault(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGraph, showCalculator, showDrawingPad, showSettings, showLayoutPanel, showSecurityPanel, showQrCode, showAutomation, isTemplatePickerOpen, addPage]);

  const { charCount, wordCount } = useMemo(() => {
    const text = activeNoteForEditor?.content?.replace(/<[^>]*>/g, ' ').trim() || '';
    return { charCount: text.length, wordCount: text ? text.split(/\s+/).length : 0 };
  }, [activeNoteForEditor]);

  const exportPDF = () => { if (activeNoteForEditor) window.print(); };

  const exportJSON = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kitab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSummarize = async (id, format = 'summary', customPrompt = null) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (!supabase) { alert('Connect Supabase first to use AI summary.'); return; }
    const textToSummarize = isNoteLocked(note) ? unlockedContentById[id] : note.content;
    try {
      const { data, error } = await supabase.functions.invoke('summarize-note', {
        body: { content: textToSummarize, format: format, prompt: customPrompt }
      });
      if (data?.result || data?.summary) {
        const aiLabel = customPrompt ? `AI Response to "${customPrompt}"` : `AI Generated ${format.toUpperCase()}`;
        handleEditorUpdate(id, { content: textToSummarize + `<br><br><b>${aiLabel}:</b><br> ${data.result || data.summary}` });
      } else if (error) { alert('Unable to summarize note right now.'); }
    } catch { alert('AI summary requires Supabase edge functions to be configured.'); }
  };

  const handleGoogleDriveSave = async () => {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) { alert('Open a note first.'); return; }

    const loadGIS = () => new Promise((resolve) => {
      if (window.google?.accounts?.oauth2) { resolve(); return; }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.onload = resolve;
      document.head.appendChild(s);
    });

    const content = `# ${note.title}\n\n${note.content?.replace(/<[^>]*>/g, '') || ''}`;
    let clientId = localStorage.getItem('google_client_id');
    if (!clientId) {
      clientId = prompt('Enter your Google OAuth Client ID to enable Drive upload:');
      if (!clientId) return;
      localStorage.setItem('google_client_id', clientId);
    }

    try {
      await loadGIS();
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (resp) => {
          if (resp.error) { alert('Google auth failed.'); return; }
          const metadata = { name: `${note.title || 'untitled'}.md`, mimeType: 'text/markdown' };
          const form = new FormData();
          form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
          form.append('file', new Blob([content], { type: 'text/markdown' }));
          try {
            const result = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${resp.access_token}` },
              body: form,
            });
            if (result.ok) {
              const data = await result.json();
              alert(`Note saved to Google Drive! Open: https://drive.google.com/open?id=${data.id}`);
            } else {
              const err = await result.text();
              alert('Upload failed: ' + err);
            }
          } catch (e) {
            alert('Upload error: ' + e.message);
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (e) {
      alert('Google Drive error: ' + e.message);
    }
  };

  const handleNoteSelect = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (isNoteLocked(note) && !unlockedContentById[id]) {
      const ok = await unlockNote(note);
      if (!ok) return;
    }
    setActiveNoteId(id);
    if (isMobile) { setIsEditorOpen(true); setIsSidebarOpen(false); }
  };

  const handleFabAction = useCallback((action) => {
    switch (action) {
      case 'bold': document.execCommand('bold'); break;
      case 'italic': document.execCommand('italic'); break;
      case 'h1': document.execCommand('formatBlock', false, '<h1>'); break;
      case 'h2': document.execCommand('formatBlock', false, '<h2>'); break;
      case 'list': document.execCommand('insertUnorderedList'); break;
      case 'quote': document.execCommand('formatBlock', false, '<blockquote>'); break;
      case 'voice': editorActionsRef.current?.handleVoiceInput?.(); break;
      case 'image': editorActionsRef.current?.handleImageUpload?.(); break;
      case 'paper': setShowLayoutPanel(true); break;
      case 'size': setShowLayoutPanel(true); break;
      case 'ai': handleSummarize(activeNoteId); break;
      case 'emoji': editorActionsRef.current?.handleEmojiPicker?.(); break;
      case 'grammar': editorActionsRef.current?.handleGrammarCheck?.(); break;
      case 'exportJSON': exportJSON(); break;
      case 'exportPDF': exportPDF(); break;
      case 'graph': setShowGraph(true); break;
      case 'drawing': setShowDrawingPad(true); break;
      case 'calculator': setShowCalculator(true); break;
      case 'add': addPage(); break;
    }
  }, [activeNoteId, addPage, exportJSON, exportPDF, handleSummarize]);

  const showSidebar = isSidebarOpen;
  const showEditor = isMobile ? isEditorOpen : true;

  // Drag-to-reorder handlers
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    reorderNotes(dragIndex, index);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div className={`app-layout ${focusMode ? 'focus-mode' : ''}`}>
      {authLoading ? (
        <div className="loading-screen">Loading...</div>
      ) : isAuthenticated ? (
        <>
          <Navbar 
            user={user}
            onSignOut={handleSignOut}
            isGuest={isGuest}
            onLogin={clearGuestMode}
            onGoogleDriveSave={handleGoogleDriveSave}
            onToggleView={() => setShowViewSwitcher(!showViewSwitcher)}
            onNewNote={addPage}
          />

          {showViewSwitcher && (
            <>
              <div className="view-switcher-backdrop" onClick={() => setShowViewSwitcher(false)} />
              <div className="view-switcher-popover">
                <div className="view-switcher-track">
                  <div className={`view-slider ${viewMode === 'grid' ? 'grid' : viewMode === 'card' ? 'card' : ''}`} />
                  <button className={`view-segment ${viewMode === 'list' ? 'active' : ''}`} onClick={() => { setViewMode('list'); setShowViewSwitcher(false); }} title="List View">
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                      <rect x="0" y="0" width="16" height="2.2" rx="1.1" fill="currentColor"/>
                      <rect x="0" y="4" width="16" height="2.2" rx="1.1" fill="currentColor"/>
                      <rect x="0" y="8" width="16" height="2.2" rx="1.1" fill="currentColor"/>
                      <rect x="0" y="12" width="16" height="2.2" rx="1.1" fill="currentColor"/>
                    </svg>
                  </button>
                  <button className={`view-segment ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => { setViewMode('grid'); setShowViewSwitcher(false); }} title="Grid View">
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                      <rect x="0.5" y="0.5" width="7" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                      <rect x="10.5" y="0.5" width="7" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                      <rect x="0.5" y="9" width="7" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                      <rect x="10.5" y="9" width="7" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="0.8" fill="none"/>
                      <rect x="1" y="1" width="6" height="5.5" rx="0.8" fill="currentColor" opacity="0.15"/>
                      <rect x="11" y="1" width="6" height="5.5" rx="0.8" fill="currentColor" opacity="0.15"/>
                      <rect x="1" y="9.5" width="6" height="5.5" rx="0.8" fill="currentColor" opacity="0.15"/>
                      <rect x="11" y="9.5" width="6" height="5.5" rx="0.8" fill="currentColor" opacity="0.15"/>
                    </svg>
                  </button>
                  <button className={`view-segment ${viewMode === 'card' ? 'active' : ''}`} onClick={() => { setViewMode('card'); setShowViewSwitcher(false); }} title="Card View">
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                      <rect x="0.5" y="0.5" width="6" height="15" rx="1.2" stroke="currentColor" strokeWidth="0.7" fill="none"/>
                      <rect x="1" y="1" width="5" height="14" rx="0.8" fill="currentColor" opacity="0.12"/>
                      <rect x="8" y="2.5" width="9.5" height="2" rx="0.8" fill="currentColor" opacity="0.5"/>
                      <rect x="8" y="6" width="7" height="1.5" rx="0.6" fill="currentColor" opacity="0.2"/>
                      <rect x="8" y="8.5" width="8" height="1.5" rx="0.6" fill="currentColor" opacity="0.2"/>
                      <rect x="8" y="11" width="5" height="1.5" rx="0.6" fill="currentColor" opacity="0.2"/>
                      <rect x="8" y="13.5" width="9" height="1.5" rx="0.6" fill="currentColor" opacity="0.15"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className={`app-body ${isSidebarOpen ? 'sidebar-open' : ''} ${isEditorOpen ? 'editor-open' : ''}`} style={{ position: 'relative', display: 'flex', width: '100%', overflow: 'hidden' }}>
            <aside className={`sidebar ${showSidebar ? 'open' : ''}`} style={isMobile && showSidebar ? { position: 'absolute', zIndex: 1000, top: 0, bottom: 0, left: 0, width: '85%', maxWidth: '350px', backgroundColor: 'var(--bg-app)', boxShadow: '4px 0 24px rgba(0,0,0,0.5)' } : {}}>
              <div className="sidebar-controls">
                <div className="search-sort-wrapper" onFocus={() => setIsSortDropdownVisible(true)} tabIndex={-1} onBlur={() => setTimeout(() => setIsSortDropdownVisible(false), 150)}>
                  <div className="search-group">
                    <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
                    <input type="text" placeholder="Search notes... (Ctrl+K)" onChange={(e) => { if (debounceRef.current) clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => setSearchQuery(e.target.value), 200); }} className="search-input" />
                  </div>
                  <div className={`sort-dropdown ${isSortDropdownVisible ? 'visible' : ''}`}>
                    <div className="radio-inputs">
                      <label className="radio"><input type="radio" name="sort" value="latest" checked={sortOrder === 'latest'} onChange={(e) => setSortOrder(e.target.value)} /><span className="name">Latest</span></label>
                      <label className="radio"><input type="radio" name="sort" value="oldest" checked={sortOrder === 'oldest'} onChange={(e) => setSortOrder(e.target.value)} /><span className="name">Oldest</span></label>
                      <label className="radio"><input type="radio" name="sort" value="manual" checked={sortOrder === 'manual'} onChange={(e) => setSortOrder(e.target.value)} /><span className="name">Manual (drag)</span></label>
                    </div>
                  </div>
                </div>
                <div className="hex-controls">
                  <button className={`btn-hexagon ${showFavorites ? 'active' : ''}`} onClick={() => setShowFavorites(!showFavorites)} title="Show Favorites"><Star size={16} fill={showFavorites ? 'currentColor' : 'none'} /></button>
                  <button className="btn-hexagon" onClick={() => setShowSettings(true)} title="Theme Settings"><Palette size={16} /></button>
                  <button className="btn-hexagon" onClick={() => setShowQrCode(true)} title="Share via QR Code"><QrCode size={16} /></button>
                  <button className={`btn-hexagon ${showArchived ? 'active' : ''}`} onClick={() => setShowArchived(!showArchived)} title="Show Archived"><Archive size={16} fill={showArchived ? 'currentColor' : 'none'} /></button>
                  <button className={`btn-hexagon ${showTrash ? 'active' : ''}`} onClick={() => setShowTrash(!showTrash)} title="Recycle Bin"><Trash2 size={16} fill={showTrash ? 'currentColor' : 'none'} /></button>
                  <button className="btn-hexagon" onClick={() => setShowLayoutPanel(true)} title="Layout Settings"><Layout size={16} /></button>
                  <button className="btn-hexagon" onClick={() => setShowSecurityPanel(true)} title="Security Settings"><Shield size={16} /></button>
                  <button className="btn-hexagon" onClick={() => setShowAutomation(true)} title="Automation Rules"><Zap size={16} /></button>
                  <button className={`btn-hexagon ${showGraph ? 'active' : ''}`} onClick={() => setShowGraph(!showGraph)} title="Knowledge Graph"><Share2 size={16} /></button>
                </div>
                <div className="tag-filter-bar" style={{ marginTop: 0 }}>
                  {allFolders.filter(Boolean).map(folder => (
                    <span key={folder} className={`tag-pill ${selectedFolder === folder ? 'active' : ''}`} onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}>📁 {folder}</span>
                  ))}
                </div>
                <div className="tag-filter-bar" style={{ marginTop: 0 }}>
                  {allTags.map(tag => (
                    <span key={tag} className={`tag-pill ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>#{tag}</span>
                  ))}
                </div>
              </div>
              <div className={`note-list view-${viewMode}`}>
                {filteredNotes.length === 0 && (
                  <div className="empty-state"><p>{searchQuery ? 'No matching notes found.' : showTrash ? 'Trash is empty.' : 'No notes yet. Create one!'}</p></div>
                )}
                {filteredNotes.map((note, idx) => (
                  <div key={note.id} draggable={sortOrder === 'manual'} onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd} style={{ opacity: dragIndex === idx ? 0.5 : 1, cursor: sortOrder === 'manual' ? 'grab' : 'default' }}>
                    <NoteCard note={note} isActive={activeNoteId === note.id} onClick={() => handleNoteSelect(note.id)} searchQuery={searchQuery} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} onToggleArchive={handleToggleArchive} onDelete={removePage} onRestore={restoreNote} onPermanentDelete={permanentlyDelete} />
                  </div>
                ))}
              </div>
            </aside>

            <main className={`main-content ${showEditor ? 'open' : ''}`} onClick={() => { if (isMobile && isSidebarOpen) setIsSidebarOpen(false); }}>
              {activeNoteForEditor ? (
                <NoteEditor
                  activeNote={activeNoteForEditor}
                  onUpdate={handleEditorUpdate}
                  onDelete={removePage}
                  onRestore={restoreNote}
                  onPermanentDelete={permanentlyDelete}
                  onTogglePin={handleTogglePin}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleArchive={handleToggleArchive}
                  onRemoveTag={handleRemoveTag}
                  onSummarize={handleSummarize}
                  onToggleLock={handleLockToggle}
                  charCount={charCount}
                  wordCount={wordCount}
                  onCloseEditor={isMobile ? () => { setIsEditorOpen(false); setIsSidebarOpen(true); } : undefined}
                  forwardLinks={forwardLinks}
                  backlinks={backlinks}
                  onNavigate={handleNoteSelect}
                  editorActionsRef={editorActionsRef}
                  onToggleFocus={() => setFocusMode(p => !p)}
                  focusMode={focusMode}
                  onSaveTemplate={saveAsTemplate}
                  onLoadTemplate={() => setIsTemplatePickerOpen(true)}
                  onThemeChange={() => handleThemeChange(theme === 'light' ? 'dark' : 'light')}
                  theme={theme}
                />
              ) : (
                <div className="empty-state" style={{ background: 'var(--bg-card)', margin: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
                  <h2>{getGreeting()}</h2>
                  <p>Select a note from the sidebar or create a new one to start writing.</p>
                </div>
              )}
            </main>
          </div>

          {/* Template Picker Modal */}
          {isTemplatePickerOpen && (() => {
            const templates = loadTemplates();
            return (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setIsTemplatePickerOpen(false)}>
                <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius)', padding: '24px', width: '90%', maxWidth: '500px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Note Templates <Save size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} /></h3>
                    <button className="btn-icon" onClick={() => setIsTemplatePickerOpen(false)}><X size={18} /></button>
                  </div>
                  {templates.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No templates saved yet. Edit a note and use "Save as Template" to create one.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {templates.map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => { createFromTemplate(t); setIsTemplatePickerOpen(false); }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.tags?.length > 0 ? t.tags.map(ta => '#' + ta).join(' ') : 'No tags'}</div>
                          </div>
                          <FilePlus size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <div className={`saved-indicator ${showSavedIndicator ? 'show' : ''}`} style={{ zIndex: 100 }}>
            Saved at {lastSavedTime} ✓
          </div>

          <FloatingMenu onAction={handleFabAction} />

          <div className="keyboard-shortcuts-hint" style={{ position: 'fixed', bottom: 80, right: 24, fontSize: 11, color: 'var(--text-muted)', opacity: 0.5, pointerEvents: 'none', textAlign: 'right', lineHeight: 1.6 }}>
            <div><kbd>Ctrl+K</kbd> Search</div>
            <div><kbd>Ctrl+N</kbd> New note</div>
            <div><kbd>Esc</kbd> Close modals</div>
          </div>

          {showGraph && (
            <GraphView notes={notes} unlockedContentById={unlockedContentById} activeNoteId={activeNoteId} onNavigate={handleNoteSelect} onClose={() => setShowGraph(false)} />
          )}

          {showCalculator && <Calculator onClose={() => setShowCalculator(false)} />}

          {showDrawingPad && <DrawingPad onClose={() => setShowDrawingPad(false)} onSaveToNote={(dataUrl) => handleEditorUpdate(activeNoteId, { content: (activeNoteForEditor?.content || '') + `<br><img src="${dataUrl}" style="max-width:100%;border-radius:8px;margin:8px 0;" />` })} />}

          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} theme={theme} onThemeChange={handleThemeChange} biometricEnabled={biometricEnabled} onBiometricToggle={setBiometricEnabled} autoLockTimeout={autoLockTimeout} onAutoLockTimeoutChange={setAutoLockTimeout} />}

          {showLayoutPanel && <LayoutPanel onClose={() => setShowLayoutPanel(false)} notes={notes} activeNoteId={activeNoteId} onUpdateNote={handleEditorUpdate} />}

          {showSecurityPanel && <SecurityPanel onClose={() => setShowSecurityPanel(false)} notes={notes} activeNoteId={activeNoteId} onLockNote={handleSecurityLock} onUnlockNote={handleSecurityUnlock} biometricEnabled={biometricEnabled} onBiometricToggle={setBiometricEnabled} autoLockTimeout={autoLockTimeout} onAutoLockTimeoutChange={setAutoLockTimeout} />}

          {showAutomation && <AutomationPanel onClose={() => setShowAutomation(false)} />}

          {showQrCode && activeNoteForEditor && <QrCodeModal note={activeNoteForEditor} onClose={() => setShowQrCode(false)} />}
        </>
      ) : <Login onSkipLogin={handleSkipLogin} />}
    </div>
  )
}

export default App
