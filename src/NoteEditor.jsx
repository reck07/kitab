import { useRef, useEffect, useState } from 'react';
import { List, Heading1, Heading2, MessageSquare, Mic, Share2, Lock, Pin, Star, Archive, X, ArrowLeft, Image as ImageIcon, Smile, Bot, SpellCheck, FileText, ChevronRight, CheckSquare, Layout, Trash2, RotateCcw, FilePlus, Save, QrCode, Calendar, Plus, Circle, Undo2, Redo2, Search } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { PAPER_TYPES, CANVAS_SIZES, getPaperType } from './paperTypes';
import { suggestTags } from './autoTag';

const PaperBackground = ({ paperType }) => {
  return <div className={`paper-bg paper-${paperType}`} />;
};

const NoteEditor = ({ 
  activeNote, 
  onUpdate, 
  onRemoveTag, 
  charCount, 
  wordCount, 
  onCloseEditor,
  onTogglePin,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onRestore,
  onPermanentDelete,
  forwardLinks,
  backlinks,
  onNavigate,
  editorActionsRef,
  onToggleFocus,
  focusMode,
  onSaveTemplate,
  onLoadTemplate,
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [grammarMatches, setGrammarMatches] = useState([]);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(true);
  const [showPaperSettings, setShowPaperSettings] = useState(false);
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);
  const [wikilinks, setWikilinks] = useState([]);
  const [justSaved, setJustSaved] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTodo, setShowTodo] = useState(false);
  const [qrText, setQrText] = useState('');
  const [todoItems, setTodoItems] = useState([]);
  const [todoInput, setTodoInput] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshParticles, setRefreshParticles] = useState([]);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatchIdx, setSearchMatchIdx] = useState(0);
  const searchInputRef = useRef(null);

  // Update editor content only when the active note changes
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        const html = (activeNote.content || '').replace(
          /\[\[(.*?)\]\]/g,
          (_, title) => `<a href="#" data-wikilink="${title.replace(/"/g, '&quot;')}" style="color:var(--accent);text-decoration:underline;cursor:pointer;font-weight:500;" contenteditable="false">[[${title}]]</a>`
        );
        editorRef.current.innerHTML = html;
      }
      editorRef.current.focus();
    }
    const matches = [...(activeNote.content || '').matchAll(/\[\[(.*?)\]\]/g)];
    setWikilinks(matches.map(m => m[1]));
  }, [activeNote.id, activeNote.content]);

  const stripWikilinks = (html) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll('a[data-wikilink]').forEach(a => {
      const title = a.dataset.wikilink || a.textContent.replace(/\[\[|\]\]/g, '');
      a.replaceWith(`[[${title}]]`);
    });
    return temp.innerHTML;
  };

  const handleBlur = () => {
    if (!editorRef.current) return;
    const restored = stripWikilinks(editorRef.current.innerHTML);
    if (restored !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = restored;
    }
  };

  const handleSave = () => {
    if (!editorRef.current) return;
    const content = stripWikilinks(editorRef.current.innerHTML);
    onUpdate(activeNote.id, { content });
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
    }, 2000);
  };

  const handleUndo = () => {
    document.execCommand('undo');
    editorRef.current?.focus();
  };

  const handleRedo = () => {
    document.execCommand('redo');
    editorRef.current?.focus();
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query || !editorRef.current) {
      clearEditorHighlight();
      return;
    }
    const html = editorRef.current.innerHTML;
    const matches = html.match(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
    const matchCount = matches ? matches.length : 0;
    setSearchMatchIdx(0);
    if (matchCount === 0) return;
    highlightInEditor(query, 0);
  };

  const clearEditorHighlight = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;
    editorRef.current.innerHTML = text;
  };

  const highlightInEditor = (query, idx) => {
    if (!editorRef.current || !query) return;
    const text = editorRef.current.innerText;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    let match;
    let count = 0;
    const parts = [];
    let lastIdx = 0;
    while ((match = regex.exec(text)) !== null) {
      if (count === idx) {
        parts.push(text.slice(lastIdx, match.index));
        parts.push(`<mark style="background:#ffeb3b;color:#000;border-radius:2px;padding:0 2px">${match[0]}</mark>`);
        lastIdx = match.index + match[0].length;
        parts.push(text.slice(lastIdx));
        editorRef.current.innerHTML = parts.join('');
        return;
      }
      count++;
      lastIdx = match.index + match[0].length;
    }
  };

  const handleSearchNext = () => {
    if (!searchQuery || !editorRef.current) return;
    const html = editorRef.current.innerText;
    const matches = html.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
    const matchCount = matches ? matches.length : 0;
    if (matchCount === 0) return;
    const nextIdx = (searchMatchIdx + 1) % matchCount;
    setSearchMatchIdx(nextIdx);
    highlightInEditor(searchQuery, nextIdx);
  };

  const handleSearchPrev = () => {
    if (!searchQuery || !editorRef.current) return;
    const html = editorRef.current.innerText;
    const matches = html.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
    const matchCount = matches ? matches.length : 0;
    if (matchCount === 0) return;
    const prevIdx = (searchMatchIdx - 1 + matchCount) % matchCount;
    setSearchMatchIdx(prevIdx);
    highlightInEditor(searchQuery, prevIdx);
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter') {
      const newTag = e.target.value.trim();
      if (newTag && !activeNote.tags?.includes(newTag)) {
        const updatedTags = [...(activeNote.tags || []), newTag];
        onUpdate(activeNote.id, { tags: updatedTags });
        e.target.value = '';
      }
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const insertTranscript = (transcript) => {
      if (!editorRef.current || !transcript) return;
      const currentHTML = editorRef.current.innerHTML;
      const needsSpace = currentHTML.length > 0 && !currentHTML.endsWith(' ') && currentHTML !== '<br>';
      const updatedHTML = (currentHTML === '<br>' ? '' : currentHTML) + (needsSpace ? ' ' : '') + transcript;
      onUpdate(activeNote.id, { content: updatedHTML });
    };

    const appendToEditor = (text, isFinal) => {
      if (!editorRef.current) return;
      if (isFinal) {
        const finalContent = editorRef.current.innerHTML.replace(/<span class="interim-transcript">.*<\/span>$/, '') + text;
        editorRef.current.innerHTML = finalContent;
        onUpdate(activeNote.id, { content: finalContent });
      } else {
        const existingInterim = editorRef.current.querySelector('span.interim-transcript');
        if (existingInterim) {
          existingInterim.textContent = text;
        } else {
          editorRef.current.innerHTML += `<span class="interim-transcript" style="color:var(--text-muted);">${text}</span>`;
        }
      }
    };

    // Try native Capacitor plugin first (mobile)
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const available = (await SpeechRecognition.isAvailable()).available;
      if (available) {
        const permResult = await SpeechRecognition.hasPermission();
        if (!permResult.permission) {
          const reqResult = await SpeechRecognition.requestPermission();
          if (reqResult.permission !== 'granted') {
            alert('Microphone permission denied. Allow it in Android Settings.');
            return;
          }
        }

        setIsRecording(true);
        const resultListener = await SpeechRecognition.addListener('onResult', (data) => {
          if (data.matches && data.matches.length > 0) {
            insertTranscript(data.matches[0]);
          }
        });
        const endListener = await SpeechRecognition.addListener('onEnd', () => {
          setIsRecording(false);
          resultListener.remove();
          endListener.remove();
        });
        const errorListener = await SpeechRecognition.addListener('onError', (data) => {
          setIsRecording(false);
          if (data.error === 'no-match') return;
          alert('Voice input error: ' + (data.errorMessage || data.error));
          resultListener.remove();
          endListener.remove();
          errorListener.remove();
        });

        await SpeechRecognition.start({ language: 'en-US', prompt: false });
        return;
      }
    } catch (e) {
      // Capacitor plugin not available, fall through to Web API
    }

    // Fallback: Web Speech API (browser)
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Voice input is not supported in this browser or device.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Allow microphone permission in your browser settings.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Try speaking louder or check your microphone.');
        } else {
          alert('Voice input error: ' + event.error);
        }
      };

      recognition.onresult = (event) => {
        let interim_transcript = '';
        let final_transcript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }

        appendToEditor(final_transcript, true);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
      alert('Voice input failed to start: ' + e.message);
    }
  };

  const handleShare = async () => {
    const plainText = editorRef.current.innerText;
    const shareData = {
      title: activeNote.title || 'Note from Kitāb',
      text: plainText,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`);
      alert("Copied to clipboard!");
    }
  };

  const handleInsertQRCode = () => {
    if (!qrText || !editorRef.current) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`;
    editorRef.current.focus();
    document.execCommand('insertImage', false, url);
    onUpdate(activeNote.id, { content: editorRef.current.innerHTML });
    setShowQRCode(false);
    setQrText('');
  };

  const handleAddTodo = () => {
    if (!todoInput.trim()) return;
    setTodoItems([...todoItems, { id: Date.now(), text: todoInput, done: false }]);
    setTodoInput('');
  };

  const handleToggleTodo = (id) => {
    setTodoItems(todoItems.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleRemoveTodo = (id) => {
    setTodoItems(todoItems.filter(item => item.id !== id));
  };

  const handleInsertTodo = () => {
    if (!editorRef.current) return;
    const list = todoItems.map(item =>
      `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="radio" style="accent-color:var(--accent);" ${item.done ? 'checked' : ''} />${item.text}</label>`
    ).join('');
    editorRef.current.focus();
    document.execCommand('insertHTML', false, `<div style="margin:4px 0;">${list}</div>`);
    onUpdate(activeNote.id, { content: editorRef.current.innerHTML });
    setShowTodo(false);
  };

  const handleInsertDate = (dateStr) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertText', false, dateStr);
    onUpdate(activeNote.id, { content: editorRef.current.innerHTML });
    setShowCalendar(false);
  };

  const handleAudioAttach = async () => {
    if (isRecordingAudio) {
      mediaRecorderRef.current?.stop();
      setIsRecordingAudio(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand('insertHTML', false, `<audio controls src="${url}" style="width:100%;max-width:300px;height:40px;"></audio>`);
          onUpdate(activeNote.id, { content: editorRef.current.innerHTML });
        }
      };
      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (e) {
      alert('Microphone access denied: ' + e.message);
    }
  };

  const handleMindRefresh = () => {
    if (isRefreshing) return;
    const messages = [
      '🌸 A fresh mind creates better ideas.',
      '🌸 Breathe. Reset. Create.',
      '🌸 Let your thoughts bloom like petals.',
      '🌸 Clarity begins with a calm mind.',
      '🌸 Every refresh is a new beginning.',
      '🌸 Soft minds make strong ideas.',
      '🌸 You are exactly where you need to be.',
    ];
    setRefreshMessage(messages[Math.floor(Math.random() * messages.length)]);
    const petals = [];
    for (let i = 0; i < 25; i++) {
      petals.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 4,
        size: 8 + Math.random() * 10,
        sway: Math.random() * 80 - 40,
        rotation: Math.random() * 360,
        hue: 320 + Math.random() * 40,
      });
    }
    setRefreshParticles(petals);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshParticles([]);
      setRefreshMessage('');
    }, 5000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageUrl = event.target.result;
      editorRef.current.focus();
      document.execCommand('insertImage', false, imageUrl);
      onUpdate(activeNote.id, { content: editorRef.current.innerHTML });

      setIsScanningImage(true);
      try {
        const result = await Tesseract.recognize(imageUrl, 'eng');
        const extractedText = result.data.text.trim();
        if (extractedText) {
          const updatedHTML = editorRef.current.innerHTML + `<br><br><blockquote style="background: var(--bg-active); padding: 12px; border-left: 3px solid var(--accent); border-radius: 4px; font-size: 13px; margin: 8px 0;"><i>📸 OCR Extracted Text:</i><br><b>${extractedText.replace(/\n/g, '<br>')}</b></blockquote><br>`;
          onUpdate(activeNote.id, { content: updatedHTML });
        }
      } catch (error) {
        console.error('OCR Error:', error);
      } finally {
        setIsScanningImage(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEditorClick = (e) => {
    const anchor = e.target.closest('a');
    if (anchor) {
      e.preventDefault();
      if (anchor.dataset.wikilink) {
        onNavigate?.(anchor.dataset.wikilink);
      } else {
        window.open(anchor.href, anchor.getAttribute('target') || '_self');
      }
    }
  };

  const handleRemoveTagClick = (tagToRemove) => {
    onRemoveTag(activeNote.id, tagToRemove);
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdate(activeNote.id, { coverImage: event.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeCover = () => onUpdate(activeNote.id, { coverImage: null });

  const handleGrammarCheck = async () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;
    if (!text.trim()) return;
    
    setGrammarLoading(true);
    try {
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          language: 'auto',
        }),
      });
      const data = await response.json();
      setGrammarMatches(data.matches || []);
      if (data.matches && data.matches.length === 0) {
        alert("No grammar or spelling errors found!");
      }
    } catch (error) {
      console.error('Error checking grammar:', error);
      alert('Failed to check grammar. Please check your network connection.');
    } finally {
      setGrammarLoading(false);
    }
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    if (editorActionsRef) {
      editorActionsRef.current = {
        handleVoiceInput,
        handleImageUpload: () => fileInputRef.current?.click(),
        handleEmojiPicker: () => setShowEmojiPicker(p => !p),
        handleGrammarCheck,
      };
    }
  });

  const paperType = activeNote.paperStyle || 'ruled';
  const canvasSize = activeNote.canvasSize || 'A5';
  const paper = getPaperType(paperType);

  const togglePaperType = (typeId) => {
    onUpdate(activeNote.id, { paperStyle: typeId });
    setShowPaperSettings(false);
  };

  const toggleCanvasSize = (sizeId) => {
    onUpdate(activeNote.id, { canvasSize: sizeId });
    setShowLayoutSettings(false);
  };

  return (
    <div className="editor-wrapper">
      {onCloseEditor && (
        <button className="btn-icon mobile-back-button" onClick={onCloseEditor}><ArrowLeft size={20} /></button>
      )}
      
      {showSearch && (
        <div className="editor-search-bar">
          <input ref={searchInputRef} type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSearchNext(); }} placeholder="Search in note..." className="editor-search-input" />
          <button className="btn-icon sm" onClick={handleSearchPrev} title="Previous"><span style={{ fontSize: 12 }}>▲</span></button>
          <button className="btn-icon sm" onClick={handleSearchNext} title="Next"><span style={{ fontSize: 12 }}>▼</span></button>
          <button className="btn-icon sm" onClick={() => { clearEditorHighlight(); setShowSearch(false); setSearchQuery(''); }} title="Close"><X size={14} /></button>
        </div>
      )}
      <div className={`text-tools-wrapper ${isToolsOpen ? '' : 'collapsed'}`}>
        <button 
          className="text-tools-toggle" 
          onClick={() => setIsToolsOpen(!isToolsOpen)}
          title={isToolsOpen ? "Hide Tools" : "Show Tools"}
        >
          <ChevronRight size={14} style={{ transform: isToolsOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
        </button>
        <div className="text-tools">
          <span className="toolbar-meta">{charCount}c · {wordCount}w · {readingTime}m</span>
          <select 
            className="font-size-select"
            value={activeNote.fontSize || '17px'}
            onChange={(e) => onUpdate(activeNote.id, { fontSize: e.target.value })}
            title="Font Size"
          >
            <option value="13px">13</option>
            <option value="15px">15</option>
            <option value="17px">17</option>
            <option value="19px">19</option>
            <option value="21px">21</option>
          </select>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('bold'); }} title="Bold"><strong>B</strong></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('italic'); }} title="Italic"><em>i</em></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('insertUnorderedList'); }} title="Bullet List"><List size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('insertOrderedList'); }} title="Numbered List"><CheckSquare size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('formatBlock', false, 'h1'); editorRef.current?.focus(); }} title="Heading 1"><Heading1 size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('formatBlock', false, 'h2'); editorRef.current?.focus(); }} title="Heading 2"><Heading2 size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('formatBlock', false, 'blockquote'); }} title="Quote"><MessageSquare size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('insertHorizontalRule'); }} title="Divider">—</button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={handleUndo} title="Undo"><Undo2 size={15} /></button>
          <button className="btn-icon sm" onClick={handleRedo} title="Redo"><Redo2 size={15} /></button>
          <button className="btn-icon sm" onClick={() => { setShowSearch(!showSearch); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100); }} title="Search" style={{ color: showSearch ? 'var(--accent)' : 'var(--text-muted)' }}><Search size={15} /></button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={handleVoiceInput} title="Voice Input" style={{ color: isRecording ? 'var(--danger)' : 'var(--text-muted)' }}><Mic size={15} /></button>
          <button className="btn-icon sm" onClick={handleShare} title="Share"><Share2 size={15} /></button>
          <button className="btn-icon sm" onClick={() => fileInputRef.current?.click()} title="Insert Image"><ImageIcon size={15} /></button>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <button className={`btn-icon sm ${isRefreshing ? 'refreshing' : ''}`} onClick={handleMindRefresh} title="🌸 Mind Refresh" style={{ color: 'var(--text-muted)' }}><RotateCcw size={15} /></button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={() => { setShowQRCode(!showQRCode); setShowCalendar(false); setShowTodo(false); }} title="QR Code"><QrCode size={15} /></button>
          <button className="btn-icon sm" onClick={() => { setShowCalendar(!showCalendar); setShowQRCode(false); setShowTodo(false); }} title="Calendar"><Calendar size={15} /></button>
          <button className="btn-icon sm" onClick={() => { setShowTodo(!showTodo); setShowQRCode(false); setShowCalendar(false); }} title="Todo List"><CheckSquare size={15} /></button>
          <button className="btn-icon sm" onClick={handleAudioAttach} title={isRecordingAudio ? 'Stop Recording' : 'Attach Voice'} style={{ color: isRecordingAudio ? 'var(--danger)' : 'var(--text-muted)' }}><Mic size={15} /></button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={handleGrammarCheck} title="Grammar Check"><SpellCheck size={15} /></button>
          <button className="btn-icon sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Emoji"><Smile size={15} /></button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={() => setShowPaperSettings(!showPaperSettings)} title="Paper"><FileText size={15} /></button>
          <button className="btn-icon sm" onClick={() => setShowLayoutSettings(!showLayoutSettings)} title="Size"><Layout size={15} /></button>
          <button className="btn-icon sm" onClick={() => window.open('https://gemini.google.com', '_blank')} title="AI"><Bot size={15} /></button>
          <button className="btn-icon sm" onClick={onToggleFocus} title="Focus Mode" style={{ opacity: focusMode ? 1 : 0.5 }}><Layout size={15} /></button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={onSaveTemplate} title="Save as Template"><FileText size={15} /></button>
          <button className="btn-icon sm" onClick={onLoadTemplate} title="New from Template"><FilePlus size={15} /></button>
          <div className="toolbar-divider"></div>
          {!activeNote.isRecycled && (<>
            <button className="btn-icon sm" onClick={() => onTogglePin?.(activeNote.id)} title={activeNote.isPinned ? 'Unpin' : 'Pin'} style={{ color: activeNote.isPinned ? 'var(--accent)' : undefined }}>
              <Pin size={13} fill={activeNote.isPinned ? 'currentColor' : 'none'} />
            </button>
            <button className="btn-icon sm" onClick={() => onToggleFavorite?.(activeNote.id)} title={activeNote.isFavorite ? 'Unfavorite' : 'Favorite'} style={{ color: activeNote.isFavorite ? 'var(--accent)' : undefined }}>
              <Star size={13} fill={activeNote.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button className="btn-icon sm" onClick={() => onToggleArchive?.(activeNote.id)} title={activeNote.isArchived ? 'Unarchive' : 'Archive'}>
              <Archive size={13} />
            </button>
            <button className="btn-icon sm" onClick={() => onDelete?.(activeNote.id)} title="Move to trash">
              <Trash2 size={13} />
            </button>
            {activeNote.isLocked && <Lock size={12} />}
            <div className="toolbar-divider"></div>
          </>)}
          {isRecording && <span className="rec-badge">🔴</span>}
          {isScanningImage && <span className="scan-badge">📸</span>}
        </div>
      </div>

      {isRefreshing && (
        <div className="mind-refresh-overlay">
          <div className="refresh-flash" />
          {refreshParticles.map(p => (
            <div key={p.id} className="cherry-petal" style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.7,
              background: `hsl(${p.hue}, 70%, 75%)`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--sway': `${p.sway}px`,
              '--rotation': `${p.rotation}deg`,
            }} />
          ))}
          <div className="sparkle-area">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="refresh-sparkle" style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 40}%`,
                animationDelay: `${0.5 + Math.random() * 1.5}s`,
              }} />
            ))}
          </div>
          {refreshMessage && (
            <div className="refresh-message">{refreshMessage}</div>
          )}
        </div>
      )}

        {showEmojiPicker && (
          <div className="emoji-picker">
            {['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😜','😝','😤','😢','😭','😱','🤔','🤗','👋','👍','👎','👏','🙌','💪','🔥','⭐','❤️','💔','💯','✅','❌','📝','💡','🎨','🚀','📌','🎯','🔒','🔓','📁','📂','📎','🔗','💾','📷','🎤','🔊','📢','💬','🗨️','✏️','📖','🔍','⚡','🔄','📋','📊','🎵','🎶','🌟','💫','✨','🕐','📅','📍','🏷️','📦','🎁','🏆','🥇','🧠','👁️','💎','🧩','🎮','📱','💻','🖥️','🖨️','🔧','⚙️','🔩','🧪','📡','🌐','🔑','🛡️','📈','📉','📰','🗞️','📄','📃','📑','📊','🗂️','📁','📂','📌','📎','🔗','🔒','🔓','🔐','🔑','🛡️','💻','🖥️','📱','📷','🎥','🎬','🎤','🎧','🎵','🎶','🎼','🎹','🎸','🎺','🎻','🥁','🎨','🎭','🎪','🎤','📝','✏️','🖊️','🖋️','✒️','📄','📃','📑','📊','📈','📉','📋','📅','📆','📁','📂','🗂️','📇','📌','📎','🔗','🔒','🔓','🔐','🔑','🛡️','💡','🔦','🔋','🔌','💻','🖥️','🖨️','⌨️','🖱️','🖲️','🕹️','💾','💿','📀','🎥','📷','📸','📹','🎥','📽️','🎞️','🔍','🔎','🔬','🔭','📡','🌐','🌍','🌏','🌎','🗺️','🗾','🌋','🏔️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏮','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🌌','🏞️','🏟️','🏛️','🏗️','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏮','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋'] .map(emoji => (
              <button key={emoji} className="emoji-btn" onClick={() => {
                editorRef.current?.focus();
                document.execCommand('insertText', false, emoji);
                onUpdate(activeNote.id, { content: editorRef.current?.innerHTML || activeNote.content });
                setShowEmojiPicker(false);
              }}>{emoji}</button>
            ))}
          </div>
        )}

        {showQRCode && (
          <div className="settings-popover" style={{ position: 'fixed', bottom: '80px', right: '80px', zIndex: 100 }}>
            <div className="settings-panel" style={{ padding: 12, minWidth: 200 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>QR Code</h4>
              <input type="text" value={qrText} onChange={e => setQrText(e.target.value)} placeholder="Enter text or URL" style={{ width: '100%', padding: '4px 6px', fontSize: 12, marginBottom: 8, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-main)', color: 'inherit' }} />
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon sm" onClick={handleInsertQRCode} title="Insert" disabled={!qrText}><Plus size={14} /></button>
              </div>
              {qrText && <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrText)}`} alt="QR" style={{ marginTop: 8, width: 120, height: 120, borderRadius: 4 }} />}
            </div>
          </div>
        )}

        {showCalendar && (
          <div className="settings-popover" style={{ position: 'fixed', bottom: '80px', right: '80px', zIndex: 100 }}>
            <div className="settings-panel" style={{ padding: 12, minWidth: 200 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Insert Date</h4>
              <input type="date" onChange={e => { if (e.target.value) handleInsertDate(new Date(e.target.value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })); }} style={{ width: '100%', padding: '4px 6px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-main)', color: 'inherit' }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                {['Today','Tomorrow','Next Week'].map(label => {
                  const d = new Date();
                  if (label === 'Tomorrow') d.setDate(d.getDate() + 1);
                  if (label === 'Next Week') d.setDate(d.getDate() + 7);
                  const str = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  return <button key={label} className="btn-icon sm" onClick={() => handleInsertDate(str)} title={label} style={{ fontSize: 11 }}>{label}</button>;
                })}
              </div>
            </div>
          </div>
        )}

        {showTodo && (
          <div className="settings-popover" style={{ position: 'fixed', bottom: '80px', right: '80px', zIndex: 100 }}>
            <div className="settings-panel" style={{ padding: 12, minWidth: 220 }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 13 }}>Todo List</h4>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <input type="text" value={todoInput} onChange={e => setTodoInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddTodo(); }} placeholder="Add item..." style={{ flex: 1, padding: '4px 6px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-main)', color: 'inherit' }} />
                <button className="btn-icon sm" onClick={handleAddTodo}><Plus size={14} /></button>
              </div>
              <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8 }}>
                {todoItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0', fontSize: 12 }}>
                    <Circle size={12} style={{ cursor: 'pointer', color: item.done ? 'var(--accent)' : 'var(--text-muted)', fill: item.done ? 'var(--accent)' : 'none' }} onClick={() => handleToggleTodo(item.id)} />
                    <span style={{ flex: 1, textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }}>{item.text}</span>
                    <button className="btn-icon sm" onClick={() => handleRemoveTodo(item.id)} style={{ width: 18, height: 18 }}><X size={10} /></button>
                  </div>
                ))}
                {todoItems.length === 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No items yet</span>}
              </div>
              {todoItems.length > 0 && (
                <button className="btn-icon sm" onClick={handleInsertTodo} title="Insert into note" style={{ fontSize: 11, width: '100%' }}>Insert into Note</button>
              )}
            </div>
          </div>
        )}

          <div className="editor-container" style={{ 
        maxWidth: '100%', 
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div className="editor-header-meta">
          <div className="title-editor">
            <input 
              type="text" 
              className="note-title-input"
              value={activeNote.title || ''} 
              onChange={(e) => {
                const newTitle = e.target.value;
                onUpdate(activeNote.id, { title: newTitle });
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              placeholder="Untitled Note"
            />
          </div>
          {justSaved && (
            <div className="save-indicator" style={{ color: 'var(--accent)', fontSize: '12px', marginRight: '12px', transition: 'opacity 0.5s', animation: 'fadeInOut 2s' }}>
              Saved!
            </div>
          )}
          {!activeNote.isRecycled && (
            <div className="tags-inline">
              {activeNote.tags?.map(tag => (
                <span key={tag} className="tag-badge">
                  {tag}
                  <button className="remove-tag-btn" onClick={() => handleRemoveTagClick(tag)}>×</button>
                </span>
              ))}
              <input type="text" className="tag-input" placeholder="tag" onKeyDown={handleTagInput} />
              <button className="btn-icon sm" onClick={() => {
                const suggestions = suggestTags(activeNote);
                suggestions.forEach(tag => {
                  if (!activeNote.tags?.includes(tag)) {
                    const updatedTags = [...(activeNote.tags || []), tag];
                    onUpdate(activeNote.id, { tags: updatedTags });
                  }
                });
                if (suggestions.length === 0) alert('No new tag suggestions found');
              }} title="Auto-suggest tags"><span style={{ fontSize: 13 }}>✨</span></button>
            </div>
          )}
        </div>
        {activeNote.isRecycled && (
          <div className="trash-notice">
            This note is in trash. <button className="btn-link" onClick={() => onRestore?.(activeNote.id)}>Restore</button> or <button className="btn-link danger" onClick={() => onPermanentDelete?.(activeNote.id)}>delete permanently</button>
          </div>
        )}

        {activeNote.coverImage && (
              <div className="note-cover-wrapper" style={{ marginBottom: '0.75rem', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={activeNote.coverImage} 
                  alt="Note cover" 
                  className="note-cover-image"
                  style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                />
                <div className="cover-actions">
                  <button className="btn-icon" onClick={handleCoverUpload} title="Change Cover"><ImageIcon size={16} /></button>
                  <button className="btn-icon" onClick={removeCover} title="Remove Cover"><X size={16} /></button>
                </div>
                <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
              </div>
            )}

            <div 
              className={`note digital-paper paper-${paperType} size-${canvasSize.toLowerCase()}`}
              style={{
                fontSize: activeNote.fontSize || '17px',
                lineHeight: 1.6,
                fontFamily: activeNote.fontFamily || 'system',
                minHeight: '500px',
                position: 'relative',
              }}
            >
              <PaperBackground paperType={paperType} canvasSize={canvasSize} />
              
              <div 
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleBlur}
                onInput={() => onUpdate(activeNote.id, { content: editorRef.current.innerHTML })}
                onClick={handleEditorClick}
                className="editor-content"
                spellCheck="true"
                data-grammar-matches={JSON.stringify(grammarMatches)}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  padding: `${paper.marginTop}px ${paper.marginRight}px ${paper.marginBottom}px ${paper.marginLeft}px`,
                  minHeight: '400px',
                  outline: 'none',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}
              />
              
              {grammarMatches.length > 0 && (
                <div className="grammar-popover">
                  {grammarMatches.slice(0, 5).map((match, i) => (
                    <div key={i} className="grammar-issue">
                      <span>{match.message}</span>
                      <button onClick={() => {
                        const text = editorRef.current.innerText;
                        const replacement = match.replacements?.[0]?.value || '';
                        const newText = text.replace(match.context.text, replacement);
                        editorRef.current.innerText = newText;
                        onUpdate(activeNote.id, { content: editorRef.current.innerHTML });
                        setGrammarMatches(grammarMatches.filter((_, idx) => idx !== i));
                      }}>
                        Fix
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="editor-footer">
              {forwardLinks?.length > 0 && (
                <div className="links-bar" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>→</span>
                  {forwardLinks.map(link => (
                    <button key={link.id} className="btn-icon sm" onClick={() => onNavigate?.(link.id)} title={link.title} style={{ fontSize: '12px', gap: '2px' }}>
                      {link.title}
                    </button>
                  ))}
                </div>
              )}
              {backlinks?.length > 0 && (
                <div className="links-bar" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>←</span>
                  {backlinks.map(link => (
                    <button key={link.id} className="btn-icon sm" onClick={() => onNavigate?.(link.id)} title={link.title} style={{ fontSize: '12px', gap: '2px' }}>
                      {link.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

        {showPaperSettings && (
          <div className="settings-popover paper-settings" style={{ position: 'fixed', bottom: '80px', right: '24px', zIndex: 100 }}>
            <div className="settings-panel">
              <h4>Paper Style</h4>
              <div className="paper-types-grid">
                {Object.entries(PAPER_TYPES).map(([id, type]) => (
                  <button
                    key={id}
                    className={`paper-type-btn ${paperType === id ? 'active' : ''}`}
                    onClick={() => togglePaperType(id)}
                    title={type.description}
                  >
                    <div className="paper-preview" style={{ 
                      background: `repeating-linear-gradient(transparent, transparent ${type.spacing || 5}px, var(--text-muted) ${type.spacing || 5}px, var(--text-muted) calc(${type.spacing || 5}px + 1px))` 
                    }} />
                    <span>{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showLayoutSettings && (
          <div className="settings-popover layout-settings" style={{ position: 'fixed', bottom: '80px', right: '24px', zIndex: 100 }}>
            <div className="settings-panel">
              <h4>Canvas Size</h4>
              <div className="canvas-sizes-grid">
                {Object.entries(CANVAS_SIZES).map(([id, size]) => (
                  <button
                    key={id}
                    className={`canvas-size-btn ${canvasSize === id ? 'active' : ''}`}
                    onClick={() => toggleCanvasSize(id)}
                    title={`${size.width}${size.unit} × ${size.height}${size.unit}`}
                  >
                    <span>{size.name}</span>
                    <small>{size.width}×{size.height}{size.unit}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <style>{`
          .editor-container { flex: 1; overflow-y: auto; }
          .note.digital-paper {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            position: relative;
          }
          .note.digital-paper.paper-ruled,
          .note.digital-paper.paper-wideRuled,
          .note.digital-paper.paper-narrowRuled,
          .note.digital-paper.paper-cornell,
          .note.digital-paper.paper-seyes,
          .note.digital-paper.paper-checklist,
          .note.digital-paper.paper-dualLayout {
            background: transparent;
          }
          .note.digital-paper.paper-dotGrid,
          .note.digital-paper.paper-graph,
          .note.digital-paper.paper-isometric {
            background: transparent;
          }
          .note.digital-paper.paper-storyboard,
          .note.digital-paper.paper-logbook,
          .note.digital-paper.paper-music {
            background: transparent;
          }
          
          /* Size classes */
          .size-a4 { max-width: 794px; aspect-ratio: 1.414; }
          .size-a5 { max-width: 560px; aspect-ratio: 1.414; }
          .size-a6 { max-width: 397px; aspect-ratio: 1.414; }
          .size-b5 { max-width: 665px; aspect-ratio: 1.42; }
          .size-b6 { max-width: 472px; aspect-ratio: 1.408; }
          .size-letter { max-width: 816px; aspect-ratio: 1.294; }
          .size-legal { max-width: 816px; aspect-ratio: 1.647; }
          .size-executive { max-width: 672px; aspect-ratio: 1.428; }
          .size-square { aspect-ratio: 1; }
          .size-landscape { max-width: 840px; aspect-ratio: 1.414; }
          .size-portrait { max-width: 595px; aspect-ratio: 1.414; }
          .size-pocket { max-width: 340px; aspect-ratio: 2; }
          .size-passport { max-width: 333px; aspect-ratio: 1.42; }
          .size-tabloid { max-width: 1056px; aspect-ratio: 1.545; }
          
          @media (max-width: 768px) {
            .size-a4, .size-a5, .size-b5, .size-letter, .size-legal, .size-executive, .size-landscape, .size-tabloid {
              max-width: 100%;
              aspect-ratio: auto;
              height: auto;
            }
          }
          
          .editor-content {
            position: relative;
            z-index: 10;
          }
          
          .grammar-popover {
            position: absolute;
            bottom: 100%;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 8px;
            box-shadow: var(--shadow);
            z-index: 100;
            max-width: 300px;
          }
          .grammar-issue {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 8px;
            font-size: 12px;
          }
          .grammar-issue button {
            padding: 2px 8px;
            font-size: 11px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .settings-popover {
            animation: slideUp 0.2s ease-out;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .settings-panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 16px;
            min-width: 280px;
            max-width: 360px;
            box-shadow: var(--shadow);
          }
          .settings-panel h4 {
            margin: 0 0 12px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-main);
          }
          .paper-types-grid,
          .canvas-sizes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 8px;
          }
          .paper-type-btn,
          .canvas-size-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 10px 8px;
            border: 2px solid var(--border);
            border-radius: 8px;
            background: var(--bg-main);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 11px;
          }
          .paper-type-btn:hover,
          .canvas-size-btn:hover {
            border-color: var(--accent);
            background: var(--bg-active);
          }
          .paper-type-btn.active,
          .canvas-size-btn.active {
            border-color: var(--accent);
            background: rgba(var(--accent-rgb), 0.1);
          }
          .paper-preview {
            width: 100%;
            height: 40px;
            border-radius: 4px;
            background-size: 100% 20px;
          }
          .canvas-size-btn small {
            color: var(--text-muted);
            font-size: 10px;
          }
          
          .note-cover-image {
            border-radius: var(--radius) var(--radius) 0 0;
          }
          .cover-actions {
            display: flex;
            gap: 4px;
          }
          
          @keyframes petalFall {
            0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) translateX(var(--sway, 20px)) rotate(var(--rotation, 360deg)); opacity: 0.2; }
          }
          @keyframes sparklePop {
            0% { transform: scale(0) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
            100% { transform: scale(0) rotate(360deg); opacity: 0; }
          }
          @keyframes refreshFlash {
            0% { opacity: 0.6; }
            100% { opacity: 0; }
          }
          @keyframes refreshSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes messageSlide {
            0% { opacity: 0; transform: translateY(20px) scale(0.9); }
            20% { opacity: 1; transform: translateY(0) scale(1); }
            80% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-10px) scale(0.95); }
          }
          .mind-refresh-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            pointer-events: none;
            overflow: hidden;
          }
          .refresh-flash {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center, rgba(255,200,230,0.25) 0%, transparent 70%);
            animation: refreshFlash 1.5s ease-out forwards;
          }
          .cherry-petal {
            position: absolute;
            top: -20px;
            border-radius: 50% 0 50% 0;
            opacity: 0.8;
            animation: petalFall linear forwards;
          }
          .sparkle-area {
            position: absolute;
            inset: 0;
          }
          .refresh-sparkle {
            position: absolute;
            width: 6px;
            height: 6px;
            background: #ffd700;
            border-radius: 50%;
            box-shadow: 0 0 6px #ffd700, 0 0 12px rgba(255,215,0,0.4);
            animation: sparklePop 1.2s ease-out forwards;
          }
          .refresh-message {
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 16px;
            font-weight: 500;
            color: #d4729a;
            text-shadow: 0 2px 12px rgba(212,114,154,0.2);
            white-space: nowrap;
            animation: messageSlide 4s ease forwards;
            letter-spacing: 0.02em;
          }
          .refreshing svg {
            animation: refreshSpin 0.6s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default NoteEditor;