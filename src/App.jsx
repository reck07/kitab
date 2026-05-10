import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import Navbar from './Navbar'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'
import { Plus, Star, Archive, Network, X, Calculator as CalculatorIcon, Pencil } from 'lucide-react'
import { isNoteLocked, encryptNoteContent, decryptNoteContent } from './crypto'
import Calculator from './Calculator'
import DrawingPad from './DrawingPad'

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 🌅';
  if (hour < 18) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
};

const generateDefaultNote = (userId = null) => ({
  id: Date.now(),
  title: 'Core Principles of Simple UI',
  content: `<h2>Core Principles of Simple UI</h2>
<ul>
<li><b>Consistency:</b> Use common elements and patterns so users can predict how the interface will behave.</li>
<li><b>Visual Hierarchy:</b> Use spacing, color, and contrast to guide the user's eye to the most important actions first.</li>
<li><b>The 6:3:1 Rule:</b> Balance your color palette by using a dominant color for 60% of the space, a secondary for 30%, and an accent color for the remaining 10%.</li>
<li><b>Effortless Navigation:</b> Keep menus and buttons predictable; good interfaces should feel "invisible" to the user.</li>
</ul>
<h2>Where to Find Inspiration & Assets</h2>
<p>To jumpstart your design process, you can explore professional galleries and ready-made kits:</p>
<ul>
<li><b>Inspiration:</b> Browse thousands of minimalist layouts on Dribbble or find curated boards on Pinterest.</li>
<li><b>Expert Examples:</b> Sites like Awwwards showcase high-end UI designs that balance simplicity with modern aesthetics.</li>
<li><b>Ready-to-Use Kits:</b> Download one of the 4,770+ free UI kits from the Figma Community to avoid building every button from scratch.</li>
<li><b>Design Prompts:</b> If you're looking for practice, check out the gallery of UI design prompts on Reddit.</li>
</ul>
<h2>Basic Workflow for Beginners</h2>
<ul>
<li><b>User Research:</b> Identify what the user actually needs to do.</li>
<li><b>Wireframing:</b> Create a low-fidelity "skeleton" of the app or site using tools like Figma or Uizard.</li>
<li><b>Visual Styling:</b> Apply colors, typography, and spacing to the wireframe.</li>
</ul>`,
  isPinned: false,
  isFavorite: false,
  isArchived: false,
  tags: ['ui', 'design', 'welcome'],
  folder: 'Design Notes',
  paperStyle: 'ruled',
  fontSize: '17px',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  user_id: userId,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const GraphView = ({ notes, unlockedContentById, activeNoteId, onNavigate, onClose }) => {
  const edges = [];
  const nodes = notes.map(n => ({ id: n.id, title: n.title || 'Untitled' }));

  notes.forEach(note => {
    const content = (isNoteLocked(note) ? unlockedContentById[note.id] : note.content) || '';
    const matches = [...content.matchAll(/\[\[(.*?)\]\]/g)];
    matches.forEach(m => {
      const targetTitle = m[1].toLowerCase();
      const targetNote = notes.find(n => n.id !== note.id && n.title?.toLowerCase() === targetTitle);
      if (targetNote) edges.push({ source: note.id, target: targetNote.id });
    });
  });

  const width = 800; const height = 500;
  const cx = width / 2; const cy = height / 2; const radius = 180;
  const nodePositions = {};
  const otherNodes = nodes.filter(n => n.id !== activeNoteId);
  
  nodes.forEach((node) => {
    if (node.id === activeNoteId) {
      nodePositions[node.id] = { x: cx, y: cy };
    } else {
      const index = otherNodes.findIndex(n => n.id === node.id);
      const angle = (Math.PI * 2 * index) / Math.max(1, otherNodes.length) - Math.PI / 2;
      nodePositions[node.id] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    }
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius)', padding: '24px', width: '90%', maxWidth: '850px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Knowledge Graph</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', height: '500px', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
             {edges.map((e, i) => {
               const src = nodePositions[e.source]; const tgt = nodePositions[e.target];
               if (!src || !tgt) return null;
               return <line key={i} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y} stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.3" />
             })}
             {nodes.map(n => {
               const pos = nodePositions[n.id];
               if (!pos) return null;
               const isActive = n.id === activeNoteId;
               return (
                 <g key={n.id} transform={`translate(${pos.x}, ${pos.y})`} style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => { onNavigate(n.id); onClose(); }}>
                   <circle r={isActive ? 14 : 8} fill={isActive ? 'var(--accent)' : 'var(--bg-main)'} stroke={isActive ? 'var(--bg-app)' : 'var(--accent)'} strokeWidth="3" />
                   <text y={isActive ? 28 : 22} textAnchor="middle" fontSize={isActive ? '12px' : '10px'} fill="var(--text-main)" fontWeight={isActive ? '700' : '500'}>{n.title}</text>
                 </g>
               )
             })}
          </svg>
        </div>
      </div>
    </div>
  );
};

const FloatingMenu = ({ onAdd, onGraph, onExportJSON, onExportPDF, onCalculator, onDrawingPad }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fab-container ${isOpen ? 'open' : ''}`}>
      <div className="fab-items-wrapper">
        <button className="fab-item" onClick={() => { onExportPDF(); setIsOpen(false); }} title="Print / Export PDF">
          <span style={{ fontSize: '18px' }}>📄</span>
        </button>
        <button className="fab-item" onClick={() => { onExportJSON(); setIsOpen(false); }} title="Export Backup (JSON)">
          <span style={{ fontSize: '18px' }}>📦</span>
        </button>
        <button className="fab-item" onClick={() => { onGraph(); setIsOpen(false); }} title="Knowledge Graph">
          <Network size={20} />
        </button>
        <button className="fab-item" onClick={() => { onDrawingPad(); setIsOpen(false); }} title="Mini Sketch Pad">
          <Pencil size={20} />
        </button>
        <button className="fab-item" onClick={() => { onCalculator(); setIsOpen(false); }} title="Floating Calculator">
          <CalculatorIcon size={20} />
        </button>
        <button className="fab-item" onClick={() => { onAdd(); setIsOpen(false); }} title="New Note">
          <Plus size={20} />
        </button>
      </div>
      <button className="fab-toggle" onClick={() => setIsOpen(!isOpen)} title="Menu">
        <div className="fab-hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
  );
};

function App() {
  const hasSupabase = Boolean(supabase);
  const [notes, setNotes] = useState(() => {
    const local = JSON.parse(localStorage.getItem('notes') || '[]');
    if (local.length > 0) return local;
    const defaultNote = generateDefaultNote();
    localStorage.setItem('notes', JSON.stringify([defaultNote]));
    return [defaultNote];
  });
  const [user, setUser] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(() => {
    const localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    return localNotes.length > 0 ? localNotes[0].id : null;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false); // New state for favorites filter
  const [sortOrder, setSortOrder] = useState('latest');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return 'coffee';
  });
  const [unlockedContentById, setUnlockedContentById] = useState({});
  const [notePasswordsById, setNotePasswordsById] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDrawingPad, setShowDrawingPad] = useState(false);

  async function fetchNotes(userId) {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('isPinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (data && data.length > 0) {
      setNotes(data);
      localStorage.setItem('notes', JSON.stringify(data));
      setActiveNoteId(prev => data.some(n => n.id === prev) ? prev : data[0].id);
    } else {
      const localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      if (localNotes.length > 0) {
        localNotes.forEach(n => supabase.from('notes').upsert({ ...n, user_id: userId }).then());
      } else {
        const defaultNote = generateDefaultNote(userId);
        setNotes([defaultNote]);
        setActiveNoteId(defaultNote.id);
        localStorage.setItem('notes', JSON.stringify([defaultNote]));
        supabase.from('notes').upsert(defaultNote).then();
      }
    }
  }

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    // Handle Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchNotes(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchNotes(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true); // Always open sidebar on desktop
        setIsEditorOpen(true); // Always open editor on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme Toggle
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Saved indicator state
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('');
  const savedIndicatorTimeoutRef = useRef();

  const triggerSavedIndicator = () => {
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setShowSavedIndicator(true);
    if (savedIndicatorTimeoutRef.current) clearTimeout(savedIndicatorTimeoutRef.current);
    savedIndicatorTimeoutRef.current = setTimeout(() => setShowSavedIndicator(false), 2500);
  };

  // Auto-save logic with debounce
  const saveTimeoutsRef = useRef({});
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);
  const notesRef = useRef(notes);
  useEffect(() => { notesRef.current = notes; }, [notes]);

  const debouncedUpdate = (id, updatedFields) => { // Accepts an object for partial updates
    const updatedTimestamp = new Date().toISOString();
    
    // 1. Immediately update local UI state
    setNotes(prevNotes => 
      prevNotes.map(n => n.id === id ? { ...n, ...updatedFields, updated_at: updatedTimestamp } : n)
    );

    // 2. Debounce the remote sync
    if (saveTimeoutsRef.current[id]) clearTimeout(saveTimeoutsRef.current[id]);
    saveTimeoutsRef.current[id] = setTimeout(async () => {
      const currentNotes = notesRef.current;
      const latestNote = currentNotes.find(n => n.id === id);
      if (!latestNote) return;

      localStorage.setItem('notes', JSON.stringify(currentNotes));
      if (userRef.current && supabase) {
        supabase.from('notes').upsert({ ...latestNote, user_id: userRef.current.id }).then(() => triggerSavedIndicator());
      } else {
        triggerSavedIndicator();
      }
    }, 800);
  };

  const addPage = async () => {
    const newNote = { 
      id: Date.now(), 
      title: 'Untitled Note',
      content: '', 
      isPinned: false, // New field
      isFavorite: false, // New field
      isArchived: false,
      tags: [],
      folder: selectedFolder || '',
      paperStyle: 'ruled',
      fontSize: '17px',
      coverImage: null,
      position: notes.length, // Assign a default position at the end of the list
      user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    };
    if (user && supabase) await supabase.from('notes').insert(newNote);
    
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('notes', JSON.stringify(updated));
    setActiveNoteId(newNote.id); // Set new note as active
    if (isMobile) {
      setIsEditorOpen(true); // Open editor on mobile when new note is created
      setIsSidebarOpen(false); // Close sidebar so they can edit
    }
  };

  const removePage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    if (user && supabase) await supabase.from('notes').delete().eq('id', id);
    if (saveTimeoutsRef.current[id]) clearTimeout(saveTimeoutsRef.current[id]);
    const remainingNotes = notes.filter(n => n.id !== id);
    setNotes(remainingNotes);
    localStorage.setItem('notes', JSON.stringify(remainingNotes));
    if (activeNoteId === id) {
      if (isMobile && remainingNotes.length === 0) {
        setIsEditorOpen(false); // Close editor if no notes left on mobile
        setIsSidebarOpen(true); // Show sidebar
      }
      setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }
  };

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
    if (!supabase) {
      alert('Connect Supabase first to use AI summary.');
      return;
    }
    
    const textToSummarize = isNoteLocked(note) ? unlockedContentById[id] : note.content;

    triggerSavedIndicator(); // Show loading state
    const { data, error } = await supabase.functions.invoke('summarize-note', {
      body: { content: textToSummarize, format: format, prompt: customPrompt }
    });

    // Assuming your edge function returns the generated content in a "result" or "summary" field
    if (data?.result || data?.summary) {
      const aiLabel = customPrompt ? `AI Response to "${customPrompt}"` : `AI Generated ${format.toUpperCase()}`;
      handleEditorUpdate(id, { content: textToSummarize + `<br><br><b>${aiLabel}:</b><br> ${data.result || data.summary}` });
    } else if (error) {
      alert('Unable to summarize note right now.');
    }
  };

  const exportPDF = () => {
    if (!activeNote) return;
    window.print();
  };

  const handleRemoveTag = (noteId, tagToRemove) => {
    const updatedNotes = notes.map(n =>
      n.id === noteId ? { ...n, tags: n.tags?.filter(t => t !== tagToRemove) || [], updated_at: new Date().toISOString() } : n
    );
    
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
    if (user && supabase) {
      const noteToSync = updatedNotes.find(n => n.id === noteId);
      supabase.from('notes').upsert({ ...noteToSync, user_id: user.id }).then(() => triggerSavedIndicator());
    } else {
      triggerSavedIndicator();
    }
  };

  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(n => n.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [notes]);

  const allFolders = useMemo(() => {
    const folders = new Set();
    notes.forEach(n => { if (n.folder) folders.add(n.folder); });
    return Array.from(folders);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const filtered = notes.filter(n => {
      const searchableContent = isNoteLocked(n) ? '' : (n.content || '');
      const matchesSearch = 
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        searchableContent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || n.tags?.includes(selectedTag);
      const matchesFavorites = !showFavorites || n.isFavorite; // Filter by favorites
      const matchesArchive = showArchived ? n.isArchived : !n.isArchived;
      const matchesFolder = !selectedFolder || n.folder === selectedFolder;
      return matchesSearch && matchesTag && matchesFavorites && matchesArchive && matchesFolder;
    });
  
    return filtered.sort((a, b) => {
      // Pinned notes always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortOrder === 'manual') {
        return (a.position || 0) - (b.position || 0);
      }

      // Then sort by updated_at
      const timeA = new Date(a.updated_at).getTime();
      const timeB = new Date(b.updated_at).getTime();
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [notes, searchQuery, selectedTag, sortOrder, showFavorites, showArchived, selectedFolder]);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;
  const isActiveNoteLocked = activeNote ? isNoteLocked(activeNote) : false;
  const activeNoteVisibleContent = isActiveNoteLocked
    ? (unlockedContentById[activeNote.id] || '')
    : (activeNote?.content || '');
  const activeNoteForEditor = activeNote
    ? { ...activeNote, content: activeNoteVisibleContent, isLocked: isActiveNoteLocked }
    : null;

  // Bi-directional Linking calculations
  const forwardLinks = useMemo(() => {
    if (!activeNoteForEditor?.content) return [];
    const matches = [...activeNoteForEditor.content.matchAll(/\[\[(.*?)\]\]/g)];
    const linkedTitles = matches.map(m => m[1].toLowerCase());
    return notes.filter(n => n.id !== activeNoteId && n.title && linkedTitles.includes(n.title.toLowerCase()));
  }, [notes, activeNoteForEditor, activeNoteId]);

  const backlinks = useMemo(() => {
    if (!activeNote?.title) return [];
    const escapedTitle = activeNote.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\[\\[${escapedTitle}\\]\\]`, 'i');
    return notes.filter(n => {
      if (n.id === activeNoteId) return false;
      const content = isNoteLocked(n) ? (unlockedContentById[n.id] || '') : (n.content || '');
      return regex.test(content);
    });
  }, [notes, activeNote, unlockedContentById, activeNoteId]);

  const handleTogglePin = (id) => debouncedUpdate(id, { isPinned: !notes.find(n => n.id === id)?.isPinned });
  const handleToggleFavorite = (id) => debouncedUpdate(id, { isFavorite: !notes.find(n => n.id === id)?.isFavorite });
  const handleToggleArchive = (id) => debouncedUpdate(id, { isArchived: !notes.find(n => n.id === id)?.isArchived });

  const unlockNote = async (note) => {
    const password = window.prompt('Enter password/PIN to unlock this note');
    if (!password) return false;
    try {
      const decryptedContent = await decryptNoteContent(note.content, password);
      setUnlockedContentById((prev) => ({ ...prev, [note.id]: decryptedContent }));
      setNotePasswordsById((prev) => ({ ...prev, [note.id]: password }));
      return true;
    } catch {
      alert('Incorrect password/PIN');
      return false;
    }
  };

  const handleLockToggle = async (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    if (isNoteLocked(note)) {
      const ok = await unlockNote(note);
      if (!ok) return;
      if (!window.confirm('Unlock and permanently remove password protection?')) return;

      const unlockedText = unlockedContentById[id];
      if (typeof unlockedText !== 'string') return;
      debouncedUpdate(id, { content: unlockedText });
      setUnlockedContentById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNotePasswordsById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    const password = window.prompt('Set a password/PIN for this note');
    if (!password) return;
    const confirmPassword = window.prompt('Confirm password/PIN');
    if (password !== confirmPassword) {
      alert('Password/PIN does not match');
      return;
    }

    const encryptedContent = await encryptNoteContent(note.content || '', password);
    debouncedUpdate(id, { content: encryptedContent });
    setUnlockedContentById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setNotePasswordsById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    alert('Note locked successfully');
  };

  const handleEditorUpdate = async (id, updatedFields) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    if (!isNoteLocked(note) || typeof updatedFields.content !== 'string') {
      debouncedUpdate(id, updatedFields);
      return;
    }

    const password = notePasswordsById[id];
    if (!password) {
      alert('Unlock the note before editing');
      return;
    }

    // Immediately update local UI for smooth typing
    setUnlockedContentById((prev) => ({ ...prev, [id]: updatedFields.content }));
    
    // Apply standard debounce to delay heavy encryption until typing pauses
    if (saveTimeoutsRef.current[id]) clearTimeout(saveTimeoutsRef.current[id]);
    
    // Update timestamp locally first
    setNotes(prevNotes => 
      prevNotes.map(n => n.id === id ? { ...n, updated_at: new Date().toISOString() } : n)
    );

    saveTimeoutsRef.current[id] = setTimeout(async () => {
      const encryptedContent = await encryptNoteContent(updatedFields.content, password);
      const currentNotes = notesRef.current;
      const latestNote = currentNotes.find(n => n.id === id);
      if (!latestNote) return;
      
      const noteToSave = { ...latestNote, ...updatedFields, content: encryptedContent };
      const updatedNotes = currentNotes.map(n => n.id === id ? noteToSave : n);
      
      setNotes(updatedNotes);
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      if (userRef.current && supabase) {
        supabase.from('notes').upsert({ ...noteToSave, user_id: userRef.current.id }).then(() => triggerSavedIndicator());
      } else {
        triggerSavedIndicator();
      }
    }, 800);
  };

  // Performance: Memoize text metrics
  const { charCount, wordCount } = useMemo(() => {
    const text = activeNoteVisibleContent.replace(/<[^>]*>/g, ' ').trim() || '';
    return {
      charCount: text.length,
      wordCount: text ? text.split(/\s+/).length : 0
    };
  }, [activeNoteVisibleContent]);

  // Handle note selection
  const handleNoteSelect = (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    if (isNoteLocked(note) && !unlockedContentById[id]) {
      unlockNote(note).then((ok) => {
        if (!ok) return;
        setActiveNoteId(id);
        if (isMobile) {
          setIsEditorOpen(true);
          setIsSidebarOpen(false);
        }
      });
      return;
    }

    setActiveNoteId(id);
    if (isMobile) {
      setIsEditorOpen(true);
      setIsSidebarOpen(false);
    }
  };

  const showSidebar = isSidebarOpen;
  const showEditor = isMobile ? isEditorOpen : true;

  return (
    <div className="app-layout">
      <Navbar 
        theme={theme} 
        onThemeChange={handleThemeChange} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        isMobile={isMobile} 
        isSidebarOpen={showSidebar} 
      />
      
      <div 
        className={`app-body ${isSidebarOpen ? 'sidebar-open' : ''} ${isEditorOpen ? 'editor-open' : ''}`}
        style={{ position: 'relative', display: 'flex', width: '100%', overflow: 'hidden' }}
      >
      <aside 
        className={`sidebar ${showSidebar ? 'open' : ''}`}
        style={isMobile && showSidebar ? { 
          position: 'absolute', zIndex: 1000, 
          top: 0, bottom: 0, left: 0, 
          width: '85%', maxWidth: '350px', 
          backgroundColor: 'var(--bg-app)', 
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)' 
        } : {}}
      >
        <div className="sidebar-controls">
          <div className="search-group">
            <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24"><g><path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path></g></svg>
            <input 
              type="text" 
              placeholder="Search..." 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-controls">
            <div className="radio-inputs">
              <label className="radio">
                <input type="radio" name="sort" value="latest" checked={sortOrder === 'latest'} onChange={(e) => setSortOrder(e.target.value)} />
                <span className="name">Latest</span>
              </label>
              <label className="radio">
                <input type="radio" name="sort" value="oldest" checked={sortOrder === 'oldest'} onChange={(e) => setSortOrder(e.target.value)} />
                <span className="name">Oldest</span>
              </label>
              <label className="radio">
                <input type="radio" name="sort" value="manual" checked={sortOrder === 'manual'} onChange={(e) => setSortOrder(e.target.value)} />
                <span className="name">Manual</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button 
                className={`btn-secondary ${showFavorites ? 'active' : ''}`} 
                onClick={() => setShowFavorites(!showFavorites)}
                title="Show Favorites"
                style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 4px', fontSize: '12px'}}
              >
                <Star size={14} fill={showFavorites ? 'currentColor' : 'none'} /> Favorites {showFavorites ? ' (On)' : ' (Off)'}
              </button>
              <button 
                className={`btn-secondary ${showArchived ? 'active' : ''}`} 
                onClick={() => setShowArchived(!showArchived)}
                title="Show Archived Notes"
                style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px 4px', fontSize: '12px'}}
              >
                <Archive size={14} fill={showArchived ? 'currentColor' : 'none'} /> Archived {showArchived ? ' (On)' : ' (Off)'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <div className="tag-filter-bar" style={{ marginTop: 0, flex: 1 }}>
              {allFolders.filter(Boolean).map(folder => (
                <span key={folder} className={`tag-pill ${selectedFolder === folder ? 'active' : ''}`} onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}>
                  📁 {folder}
                </span>
              ))}
            </div>
            <div className="tag-filter-bar" style={{ marginTop: 0, flex: 1 }}>
              {allTags.map(tag => (
                <span key={tag} className={`tag-pill ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
          <div className="note-list">
            {filteredNotes.length === 0 && (
              <div className="empty-state">
                <p>{searchQuery ? 'No matching notes found.' : 'No notes yet. Create one!'}</p>
              </div>
            )}
            {filteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isActive={activeNoteId === note.id} 
                onClick={() => handleNoteSelect(note.id)}
              searchQuery={searchQuery}
              />
            ))}
          </div>
      </aside>

      <main 
        className={`main-content ${showEditor ? 'open' : ''}`}
        onClick={() => {
          if (isMobile && isSidebarOpen) setIsSidebarOpen(false);
        }}
      >
        {activeNoteForEditor ? (
          <NoteEditor 
            activeNote={activeNoteForEditor} 
            onUpdate={handleEditorUpdate} 
            onDelete={removePage} 
            onTogglePin={handleTogglePin} // Pass new handlers
            onToggleFavorite={handleToggleFavorite} // Pass new handlers
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
          />
        ) : (
          <div className="empty-state" style={{background: 'var(--bg-card)', margin: '24px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)'}}>
            <h2>{getGreeting()}</h2>
            <p>Select a note from the sidebar or create a new one to start writing.</p>
          </div>
        )}
      </main>
      </div>

      <div className={`saved-indicator ${showSavedIndicator ? 'show' : ''}`} style={{ zIndex: 100 }}>
        Saved at {lastSavedTime} ✓
      </div>

      <FloatingMenu 
        onAdd={addPage} 
        onGraph={() => setShowGraph(true)} 
        onExportJSON={exportJSON} 
        onExportPDF={exportPDF} 
        onCalculator={() => setShowCalculator(true)}
        onDrawingPad={() => setShowDrawingPad(true)}
      />

      {showGraph && (
        <GraphView 
          notes={notes} 
          unlockedContentById={unlockedContentById} 
          activeNoteId={activeNoteId} 
          onNavigate={handleNoteSelect} 
          onClose={() => setShowGraph(false)} 
        />
      )}

      {showCalculator && (
        <Calculator onClose={() => setShowCalculator(false)} />
      )}

      {showDrawingPad && (
        <DrawingPad onClose={() => setShowDrawingPad(false)} />
      )}
    </div>
  )
}

export default App
