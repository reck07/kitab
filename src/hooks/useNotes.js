import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { isNoteLocked, encryptNoteContent, decryptNoteContent } from '../crypto';
import { evaluateRules, applyActions } from '../automationRules';

const generateDefaultNote = (userId = null) => ({
  id: Date.now(),
  title: 'Core Principles of Simple UI',
  content: '<h2>Core Principles of Simple UI</h2><ul><li><b>Consistency:</b> Use common elements and patterns so users can predict how the interface will behave.</li><li><b>Visual Hierarchy:</b> Use spacing, color, and contrast to guide the user\'s eye to the most important actions first.</li><li><b>The 6:3:1 Rule:</b> Balance your color palette by using a dominant color for 60% of the space, a secondary for 30%, and an accent color for the remaining 10%.</li><li><b>Effortless Navigation:</b> Keep menus and buttons predictable; good interfaces should feel "invisible" to the user.</li></ul><h2>Where to Find Inspiration & Assets</h2><p>To jumpstart your design process, you can explore professional galleries and ready-made kits:</p><ul><li><b>Inspiration:</b> Browse thousands of minimalist layouts on Dribbble or find curated boards on Pinterest.</li><li><b>Expert Examples:</b> Sites like Awwwards showcase high-end UI designs that balance simplicity with modern aesthetics.</li><li><b>Ready-to-Use Kits:</b> Download one of the 4,770+ free UI kits from the Figma Community to avoid building every button from scratch.</li><li><b>Design Prompts:</b> If you\'re looking for practice, check out the gallery of UI design prompts on Reddit.</li></ul><h2>Basic Workflow for Beginners</h2><ul><li><b>User Research:</b> Identify what the user actually needs to do.</li><li><b>Wireframing:</b> Create a low-fidelity "skeleton" of the app or site using tools like Figma or Uizard.</li><li><b>Visual Styling:</b> Apply colors, typography, and spacing to the wireframe.</li></ul>',
  isPinned: false,
  isFavorite: false,
  isArchived: false,
  isRecycled: false,
  tags: ['ui', 'design', 'welcome'],
  folder: 'Design Notes',
  paperStyle: 'ruled',
  canvasSize: 'A5',
  fontSize: '17px',
  coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  coverMaterial: 'linen',
  bindingType: 'perfect',
  paperWeight: 120,
  paperFinish: 'smooth',
  pageCount: 200,
  user_id: userId,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export function useNotes(user) {
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('notes') || '[]'));
  const [activeNoteId, setActiveNoteId] = useState(() => {
    const localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    return localNotes.length > 0 ? localNotes[0].id : null;
  });
  const [unlockedContentById, setUnlockedContentById] = useState({});
  const [notePasswordsById, setNotePasswordsById] = useState({});
  const [showArchived, setShowArchived] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState('latest');
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('');

  const saveTimeoutsRef = useRef({});
  const savedIndicatorTimeoutRef = useRef();
  const notesRef = useRef(notes);
  const userRef = useRef(user);

  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { userRef.current = user; }, [user]);

  const triggerSavedIndicator = useCallback(() => {
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setShowSavedIndicator(true);
    if (savedIndicatorTimeoutRef.current) clearTimeout(savedIndicatorTimeoutRef.current);
    savedIndicatorTimeoutRef.current = setTimeout(() => setShowSavedIndicator(false), 2500);
  }, []);

  const debouncedUpdate = useCallback((id, updatedFields) => {
    const updatedTimestamp = new Date().toISOString();
    setNotes(prevNotes =>
      prevNotes.map(n => n.id === id ? { ...n, ...updatedFields, updated_at: updatedTimestamp } : n)
    );
    if (saveTimeoutsRef.current[id]) clearTimeout(saveTimeoutsRef.current[id]);
    saveTimeoutsRef.current[id] = setTimeout(async () => {
      let currentNotes = notesRef.current;
      let latestNote = currentNotes.find(n => n.id === id);
      if (!latestNote) return;

      const onUpdateActions = evaluateRules(latestNote, 'onUpdate', currentNotes);
      if (onUpdateActions.length > 0) {
        const processed = applyActions(latestNote, onUpdateActions);
        currentNotes = currentNotes.map(n => n.id === id ? processed : n);
        latestNote = processed;
        setNotes(currentNotes);
      }

      localStorage.setItem('notes', JSON.stringify(currentNotes));
      if (userRef.current && supabase) {
        supabase.from('notes').upsert({ ...latestNote, user_id: userRef.current.id }).then(() => triggerSavedIndicator()).catch(() => triggerSavedIndicator());
      } else {
        triggerSavedIndicator();
      }
    }, 800);
  }, [triggerSavedIndicator]);

  const fetchNotes = useCallback(async (userId) => {
    if (!supabase) return;
    let data;
    try {
      const result = await supabase.from('notes').select('*').eq('user_id', userId).order('isPinned', { ascending: false }).order('updated_at', { ascending: false });
      data = result.data;
    } catch { data = null; }
    if (data && data.length > 0) {
      setNotes(data);
      localStorage.setItem('notes', JSON.stringify(data));
      setActiveNoteId(prev => data.some(n => n.id === prev) ? prev : data[0].id);
    } else {
      const localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      if (localNotes.length > 0) {
        localNotes.forEach(n => supabase.from('notes').upsert({ ...n, user_id: userId }).then().catch(() => {}));
      } else {
        const defaultNote = generateDefaultNote(userId);
        setNotes([defaultNote]);
        setActiveNoteId(defaultNote.id);
        localStorage.setItem('notes', JSON.stringify([defaultNote]));
        supabase.from('notes').upsert(defaultNote).then().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (user) fetchNotes(user.id);
  }, [user, fetchNotes]);

  const addPage = useCallback(async () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      isRecycled: false,
      tags: [],
      folder: selectedFolder || '',
      paperStyle: 'ruled',
      fontSize: '17px',
      coverImage: null,
      user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const actions = evaluateRules(newNote, 'onCreate', notes);
    const processedNote = actions.length > 0 ? applyActions(newNote, actions) : newNote;
    if (actions.length > 0) Object.assign(newNote, processedNote);
    if (user && supabase) supabase.from('notes').insert(newNote).then().catch(() => {});
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('notes', JSON.stringify(updated));
    setActiveNoteId(newNote.id);
  }, [notes, user, selectedFolder]);

  const removePage = useCallback(async (id) => {
    if (!window.confirm("Move this note to trash?")) return;
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isRecycled: true, updated_at: new Date().toISOString() } : n);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    if (user && supabase) supabase.from('notes').upsert({ ...updatedNotes.find(n => n.id === id), user_id: user.id }).then().catch(() => {});
    setActiveNoteId(prev => prev === id ? (updatedNotes.find(n => !n.isRecycled)?.id || null) : prev);
  }, [notes, user]);

  const restoreNote = useCallback(async (id) => {
    const updatedNotes = notes.map(n => n.id === id ? { ...n, isRecycled: false, updated_at: new Date().toISOString() } : n);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    if (user && supabase) supabase.from('notes').upsert({ ...updatedNotes.find(n => n.id === id), user_id: user.id }).then().catch(() => {});
    setActiveNoteId(id);
  }, [notes, user]);

  const permanentlyDelete = useCallback(async (id) => {
    if (!window.confirm("Permanently delete this note? This cannot be undone.")) return;
    if (saveTimeoutsRef.current[id]) clearTimeout(saveTimeoutsRef.current[id]);
    if (user && supabase) { try { await supabase.from('notes').delete().eq('id', id); } catch {} }
    const remainingNotes = notes.filter(n => n.id !== id);
    setNotes(remainingNotes);
    localStorage.setItem('notes', JSON.stringify(remainingNotes));
    if (activeNoteId === id) setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
  }, [notes, user, activeNoteId]);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;
  const isActiveNoteLocked = activeNote ? isNoteLocked(activeNote) : false;
  const activeNoteVisibleContent = isActiveNoteLocked ? (unlockedContentById[activeNote.id] || '') : (activeNote?.content || '');
  const activeNoteForEditor = useMemo(() => activeNote ? { ...activeNote, content: activeNoteVisibleContent, isLocked: isActiveNoteLocked } : null, [activeNote, activeNoteVisibleContent, isActiveNoteLocked]);

  const allTags = useMemo(() => { const t = new Set(); notes.forEach(n => n.tags?.forEach(tag => t.add(tag))); return Array.from(t); }, [notes]);
  const allFolders = useMemo(() => { const f = new Set(); notes.forEach(n => { if (n.folder) f.add(n.folder); }); return Array.from(f); }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const searchableContent = isNoteLocked(n) ? '' : (n.content || '');
      const matchesSearch = !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || searchableContent.toLowerCase().includes(searchQuery.toLowerCase()) || n.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) || (n.folder || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || n.tags?.includes(selectedTag);
      const matchesFavorites = !showFavorites || n.isFavorite;
      const matchesArchive = showTrash ? true : (showArchived ? n.isArchived : !n.isArchived);
      const matchesTrash = showArchived ? true : (showTrash ? n.isRecycled : !n.isRecycled);
      const matchesFolder = !selectedFolder || n.folder === selectedFolder;
      return matchesSearch && matchesTag && matchesFavorites && matchesArchive && matchesTrash && matchesFolder;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortOrder === 'manual') return (a.position || 0) - (b.position || 0);
      const timeA = new Date(a.updated_at).getTime();
      const timeB = new Date(b.updated_at).getTime();
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [notes, searchQuery, selectedTag, sortOrder, showFavorites, showArchived, showTrash, selectedFolder]);

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
      setUnlockedContentById(prev => ({ ...prev, [note.id]: decryptedContent }));
      setNotePasswordsById(prev => ({ ...prev, [note.id]: password }));
      return true;
    } catch { alert('Incorrect password/PIN'); return false; }
  };

  const handleLockToggle = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (isNoteLocked(note)) {
      const ok = await unlockNote(note);
      if (!ok) return;
      if (!window.confirm('Unlock and permanently remove password protection?')) return;
      const unlockedText = unlockedContentById[id];
      if (typeof unlockedText !== 'string') return;
      debouncedUpdate(id, { content: unlockedText });
      setUnlockedContentById(prev => { const next = { ...prev }; delete next[id]; return next; });
      setNotePasswordsById(prev => { const next = { ...prev }; delete next[id]; return next; });
      return;
    }
    const password = window.prompt('Set a password/PIN for this note');
    if (!password) return;
    const confirmPassword = window.prompt('Confirm password/PIN');
    if (password !== confirmPassword) { alert('Password/PIN does not match'); return; }
    const encryptedContent = await encryptNoteContent(note.content || '', password);
    debouncedUpdate(id, { content: encryptedContent });
    setUnlockedContentById(prev => { const next = { ...prev }; delete next[id]; return next; });
    setNotePasswordsById(prev => { const next = { ...prev }; delete next[id]; return next; });
    alert('Note locked successfully');
  };

  const handleSecurityLock = useCallback(async (id, password) => {
    const note = notesRef.current.find(n => n.id === id);
    if (!note) return;
    const encryptedContent = await encryptNoteContent(note.content || '', password);
    debouncedUpdate(id, { content: encryptedContent });
    setUnlockedContentById(prev => { const next = { ...prev }; delete next[id]; return next; });
    setNotePasswordsById(prev => ({ ...prev, [id]: password }));
  }, [debouncedUpdate]);

  const handleSecurityUnlock = useCallback(async (id, password) => {
    const note = notesRef.current.find(n => n.id === id);
    if (!note) return false;
    try {
      const decryptedContent = await decryptNoteContent(note.content, password);
      debouncedUpdate(id, { content: decryptedContent });
      setUnlockedContentById(prev => { const next = { ...prev }; delete next[id]; return next; });
      setNotePasswordsById(prev => { const next = { ...prev }; delete next[id]; return next; });
      return true;
    } catch { return false; }
  }, [debouncedUpdate]);

  const handleEditorUpdate = async (id, updatedFields) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    if (!isNoteLocked(note) || typeof updatedFields.content !== 'string') { debouncedUpdate(id, updatedFields); return; }
    const password = notePasswordsById[id];
    if (!password) { alert('Unlock the note before editing'); return; }
    setUnlockedContentById(prev => ({ ...prev, [id]: updatedFields.content }));
    if (saveTimeoutsRef.current[id]) clearTimeout(saveTimeoutsRef.current[id]);
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, updated_at: new Date().toISOString() } : n));
    saveTimeoutsRef.current[id] = setTimeout(async () => {
      const encryptedContent = await encryptNoteContent(updatedFields.content, password);
      const currentNotes = notesRef.current;
      const latestNote = currentNotes.find(n => n.id === id);
      if (!latestNote) return;
      const noteToSave = { ...latestNote, ...updatedFields, content: encryptedContent };
      const updatedNotes = currentNotes.map(n => n.id === id ? noteToSave : n);
      setNotes(updatedNotes);
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      if (userRef.current && supabase) supabase.from('notes').upsert({ ...noteToSave, user_id: userRef.current.id }).then(() => triggerSavedIndicator()).catch(() => triggerSavedIndicator());
    }, 800);
  };

  const handleRemoveTag = (noteId, tagToRemove) => {
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, tags: n.tags?.filter(t => t !== tagToRemove) || [], updated_at: new Date().toISOString() } : n);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    if (user && supabase) supabase.from('notes').upsert({ ...updatedNotes.find(n => n.id === noteId), user_id: user.id }).then(() => triggerSavedIndicator()).catch(() => triggerSavedIndicator());
    else triggerSavedIndicator();
  };

  const reorderNotes = (fromIndex, toIndex) => {
    const filtered = filteredNotes;
    if (fromIndex === toIndex) return;
    const updated = [...notes];
    const filteredIds = filtered.map(n => n.id);
    const noteId = filteredIds[fromIndex];
    filteredIds.splice(fromIndex, 1);
    filteredIds.splice(toIndex, 0, noteId);
    filteredIds.forEach((id, idx) => {
      const note = updated.find(n => n.id === id);
      if (note) note.position = idx;
    });
    setNotes([...updated]);
    localStorage.setItem('notes', JSON.stringify(updated));
    if (user && supabase) supabase.from('notes').upsert(updated.map(n => ({ ...n, user_id: user.id }))).then().catch(() => {});
  };

  const saveAsTemplate = useCallback(() => {
    if (!activeNote) return;
    const templates = JSON.parse(localStorage.getItem('noteTemplates') || '[]');
    const template = { id: Date.now(), name: activeNote.title || 'Untitled', content: activeNote.content, tags: activeNote.tags || [], folder: activeNote.folder || '', paperStyle: activeNote.paperStyle, coverImage: activeNote.coverImage };
    templates.unshift(template);
    localStorage.setItem('noteTemplates', JSON.stringify(templates));
    alert('Saved as template: ' + template.name);
  }, [activeNote]);

  const loadTemplates = useCallback(() => {
    return JSON.parse(localStorage.getItem('noteTemplates') || '[]');
  }, []);

  const createFromTemplate = useCallback((template) => {
    const newNote = {
      id: Date.now(),
      title: template.name,
      content: template.content,
      isPinned: false, isFavorite: false, isArchived: false, isRecycled: false,
      tags: [...(template.tags || [])],
      folder: template.folder || '',
      paperStyle: template.paperStyle || 'ruled',
      canvasSize: 'A5',
      fontSize: '17px',
      coverImage: template.coverImage || null,
      user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('notes', JSON.stringify(updated));
    setActiveNoteId(newNote.id);
    if (user && supabase) supabase.from('notes').insert(newNote).then().catch(() => {});
  }, [notes, user]);

  return {
    notes, activeNoteId, setActiveNoteId, activeNote, activeNoteForEditor, isActiveNoteLocked,
    unlockedContentById, notePasswordsById, showArchived, setShowArchived, showTrash, setShowTrash,
    searchQuery, setSearchQuery, selectedTag, setSelectedTag, selectedFolder, setSelectedFolder,
    showFavorites, setShowFavorites, sortOrder, setSortOrder,
    showSavedIndicator, lastSavedTime,
    filteredNotes, allTags, allFolders, forwardLinks, backlinks,
    addPage, removePage, restoreNote, permanentlyDelete,
    handleTogglePin, handleToggleFavorite, handleToggleArchive,
    handleLockToggle, handleSecurityLock, handleSecurityUnlock,
    handleEditorUpdate, handleRemoveTag, debouncedUpdate,
    unlockNote, reorderNotes, saveAsTemplate, loadTemplates, createFromTemplate,
    setNotes,
  };
}
