import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, Heading1, Heading2, MessageSquare, Layers, HelpCircle, Mic, Share2, Lock, Unlock, Pin, Star, Archive, Trash2, X, ArrowLeft, Image as ImageIcon, Smile, CheckSquare, Folder, Bot, SpellCheck, FileText, File, Grid, ScanText, ChevronRight } from 'lucide-react';
import Tesseract from 'tesseract.js';

const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStringLocale = date.toLocaleDateString();

  return `${dateStringLocale} ${timeString}`;
};

const NoteEditor = ({ activeNote, onUpdate, onDelete, onRemoveTag, onSummarize, charCount, wordCount, onCloseEditor, onTogglePin, onToggleFavorite, onToggleLock, onToggleArchive, forwardLinks, backlinks, onNavigate }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [grammarMatches, setGrammarMatches] = useState([]);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(true);

  // Update editor content only when the active note changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== activeNote.content) {
      editorRef.current.innerHTML = activeNote.content;
    }
  }, [activeNote.id, activeNote.content]);

  const handleBlur = () => {
    if (!editorRef.current) return;
    const element = editorRef.current;
    
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    const wwwRegex = /(^|\s)(www\.[^\s<]+)/g;
    
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

    let nodesToReplace = [];
    let node;
    while(node = walker.nextNode()) {
      if (node.parentNode && node.parentNode.closest && node.parentNode.closest('a')) {
        continue;
      }
      if (node.nodeValue.match(emailRegex) || node.nodeValue.match(urlRegex) || node.nodeValue.match(wwwRegex)) {
        nodesToReplace.push(node);
      }
    }

    let changed = false;
    nodesToReplace.forEach(textNode => {
      let text = textNode.nodeValue;
      let replaced = text
        .replace(urlRegex, '<a href="$1" target="_blank" style="color: var(--accent); text-decoration: underline; cursor: pointer;">$1</a>')
        .replace(wwwRegex, '$1<a href="https://$2" target="_blank" style="color: var(--accent); text-decoration: underline; cursor: pointer;">$2</a>')
        .replace(emailRegex, '<a href="mailto:$1" target="_blank" style="color: var(--accent); text-decoration: underline; cursor: pointer;">$1</a>');
        
      if (replaced !== text) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = replaced;
        while (tempDiv.firstChild) {
          textNode.parentNode.insertBefore(tempDiv.firstChild, textNode);
        }
        textNode.parentNode.removeChild(textNode);
        changed = true;
      }
    });

    if (changed) {
      onUpdate(activeNote.id, { content: element.innerHTML });
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter') {
      const newTag = e.target.value.trim();
      if (newTag && !activeNote.tags?.includes(newTag)) {
        const updatedTags = [...(activeNote.tags || []), newTag]; // Tags are part of the note object
        onUpdate(activeNote.id, { tags: updatedTags });
        e.target.value = '';
      }
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const currentHTML = editorRef.current.innerHTML;
      const needsSpace = currentHTML.length > 0 && !currentHTML.endsWith(' ');
      const updatedHTML = currentHTML + (needsSpace ? ' ' : '') + transcript;
      onUpdate(activeNote.id, { content: updatedHTML });
    };

    recognition.start();
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
      window.open(anchor.href, anchor.getAttribute('target') || '_self');
    }
  };

  const insertEmoji = (emoji) => {
    editorRef.current.focus();
    document.execCommand('insertText', false, emoji);
    onUpdate(activeNote.id, { content: editorRef.current.innerHTML });
    setShowEmojiPicker(false);
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
    
    setIsCheckingGrammar(true);
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
      setIsCheckingGrammar(false);
    }
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="editor-wrapper">
      {onCloseEditor && (
        <button className="btn-icon mobile-back-button" onClick={onCloseEditor}><ArrowLeft size={20} /></button>
      )}
      <div className={`text-tools-wrapper ${isToolsOpen ? '' : 'collapsed'}`}>
          <button 
            className="text-tools-toggle" 
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            title={isToolsOpen ? "Hide Tools" : "Show Tools"}
          >
            <ChevronRight size={16} style={{ transform: isToolsOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
          </button>
          <div className="text-tools">
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
          <div className="toolbar-divider"></div>
          <button className="btn-icon" onClick={() => document.execCommand('bold')} title="Bold"><Bold size={18} /></button>
          <button className="btn-icon" onClick={() => document.execCommand('italic')} title="Italic"><Italic size={18} /></button>
          <button className="btn-icon" onClick={() => document.execCommand('insertUnorderedList')} title="Bullet List"><List size={18} /></button>
          <button className="btn-icon" onClick={() => {
             editorRef.current.focus();
             document.execCommand('insertHTML', false, '<div><input type="checkbox" />&nbsp;</div>');
             onUpdate(activeNote.id, { content: editorRef.current.innerHTML });
          }} title="Insert Checklist"><CheckSquare size={18} /></button>
          <button className="btn-icon" onClick={() => document.execCommand('formatBlock', false, 'H1')} title="Heading 1"><Heading1 size={18} /></button>
          <button className="btn-icon" onClick={() => document.execCommand('formatBlock', false, 'H2')} title="Heading 2"><Heading2 size={18} /></button>
          <button className="btn-icon" onClick={handleGrammarCheck} disabled={isCheckingGrammar} title="Check Grammar (LanguageTool)" style={{ opacity: isCheckingGrammar ? 0.5 : 1 }}>
            <SpellCheck size={18} />
          </button>
          <button className="btn-icon" onMouseDown={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} title="Insert Image"><ImageIcon size={18} /></button>
          <div style={{ position: 'relative', display: 'flex' }}>
            <button className="btn-icon" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Insert Emoji/Sticker"><Smile size={18} /></button>
            {showEmojiPicker && (
              <div style={{ position: 'absolute', top: 0, right: '100%', zIndex: 50, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '8px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow)', marginRight: '12px' }}>
                {['😀', '😂', '😍', '🙏', '👍', '🚀', '⭐', '🔥', '🎉', '❤️', '💯', '✨'].map(emoji => (
                  <button key={emoji} className="btn-icon" onMouseDown={(e) => e.preventDefault()} onClick={() => insertEmoji(emoji)} style={{ fontSize: '1.2rem', padding: '4px', width: '32px', height: '32px' }}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageUpload} 
          />
          <div className="toolbar-divider"></div>
          <button 
            className="btn-icon" 
            onClick={() => {
              const nextStyle = activeNote.paperStyle === 'ruled' ? 'grid' : activeNote.paperStyle === 'grid' ? 'plain' : 'ruled';
              onUpdate(activeNote.id, { paperStyle: nextStyle });
            }} 
            title="Cycle Paper Style (Ruled, Grid, Plain)"
          >
            {activeNote.paperStyle === 'grid' ? <Grid size={18} /> : activeNote.paperStyle === 'plain' ? <File size={18} /> : <FileText size={18} />}
          </button>
          <button className="btn-icon" onClick={() => setShowAiChat(!showAiChat)} title="Chat with Note (AI)" style={{ color: showAiChat ? 'var(--accent)' : 'inherit' }}>
            <Bot size={18} />
          </button>
          <button className="btn-icon" onClick={() => onSummarize(activeNote.id, 'summary')} title="Generate AI Summary"><MessageSquare size={18} /></button>
          <button className="btn-icon" onClick={() => onSummarize(activeNote.id, 'flashcards')} title="Generate Flashcards"><Layers size={18} /></button>
          <button className="btn-icon" onClick={() => onSummarize(activeNote.id, 'quiz')} title="Generate Practice Quiz"><HelpCircle size={18} /></button>
          <button className={`btn-icon ${isRecording ? 'recording' : ''}`} onClick={handleVoiceInput} title="Dictate Note"><Mic size={18} /></button>
          <button className="btn-icon" onClick={handleShare} title="Share/Copy Note"><Share2 size={18} /></button>
        </div>
      </div>
      <div className="toolbar glass-panel" style={{ padding: '4px 8px', gap: '8px', minHeight: 'auto', justifyContent: 'flex-end' }}>
        <div className="tag-tools" style={{ gap: '2px' }}>
          <input type="text" placeholder="Add tag + Enter" onKeyDown={handleTagInput} className="tag-input" />
          <button className="btn-icon" onClick={() => onToggleLock(activeNote.id)} title={activeNote.isLocked ? "Unlock Note" : "Lock Note"}>
            {activeNote.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
          </button>
          <button className="btn-icon" onClick={() => onTogglePin(activeNote.id)} title="Pin Note">
            <Pin size={18} fill={activeNote.isPinned ? "currentColor" : "none"} />
          </button>
          <button className="btn-icon" onClick={() => onToggleFavorite(activeNote.id)} title="Favorite Note">
            <Star size={18} fill={activeNote.isFavorite ? "currentColor" : "none"} color={activeNote.isFavorite ? "var(--accent)" : "currentColor"} />
          </button>
          <button className="btn-icon" onClick={() => onToggleArchive(activeNote.id)} title={activeNote.isArchived ? "Unarchive Note" : "Archive Note"}>
            <Archive size={18} fill={activeNote.isArchived ? "currentColor" : "none"} />
          </button>
          <button className="btn-icon delete-btn" onClick={() => onDelete(activeNote.id)} title="Delete Note"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="note-editor-container paper-shadow">
        <input type="file" accept="image/*" ref={coverInputRef} style={{ display: 'none' }} onChange={handleCoverUpload} />
        {activeNote.coverImage ? (
          <div className="note-cover" style={{ backgroundImage: `url(${activeNote.coverImage})` }}>
            <div className="note-cover-controls">
              <button onClick={() => coverInputRef.current?.click()}>Change Cover</button>
              <button onClick={removeCover}>Remove</button>
            </div>
          </div>
        ) : (
          <button className="add-cover-btn" onClick={() => coverInputRef.current?.click()}>
            <ImageIcon size={14} /> Add Cover
          </button>
        )}
        <input 
          className="note-title-input"
          value={activeNote.title}
          onChange={(e) => onUpdate(activeNote.id, { title: e.target.value })}
          placeholder="Note Title..."
        />
        {showAiChat && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--highlight)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--accent)' }}>
            <Bot size={20} color="var(--accent)" style={{ alignSelf: 'center', minWidth: '20px' }} />
            <input 
              type="text" 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiPrompt.trim()) {
                  onSummarize(activeNote.id, 'ask', aiPrompt);
                  setAiPrompt('');
                  setShowAiChat(false);
                }
              }}
              placeholder="Ask AI to extract info, format text, or answer questions based on this note..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', outline: 'none', background: 'var(--bg-app)', color: 'var(--text-main)' }}
            />
            <button 
              className="btn-primary" 
              disabled={!aiPrompt.trim()}
              onClick={() => {
                onSummarize(activeNote.id, 'ask', aiPrompt);
                setAiPrompt('');
                setShowAiChat(false);
              }}
              style={{ opacity: !aiPrompt.trim() ? 0.5 : 1 }}
            >
              Ask
            </button>
          </div>
        )}
        {grammarMatches.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', background: 'var(--highlight)', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--accent)', fontSize: '13px' }}>Grammar & Spelling Suggestions</strong>
              <button className="btn-icon" onClick={() => setGrammarMatches([])} style={{ padding: '4px', minWidth: 'auto' }}><X size={14} /></button>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-main)' }}>
              {grammarMatches.map((match, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <span>"{match.context.text.substring(match.context.offset, match.context.offset + match.context.length)}"</span> - {match.message}
                  {match.replacements?.length > 0 && (
                    <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}>
                      <em>Suggestions: </em> 
                      {match.replacements.slice(0, 3).map(r => r.value).join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="note-metadata">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={14} color="var(--text-muted)" />
            <input
              type="text"
              value={activeNote.folder || ''}
              onChange={(e) => onUpdate(activeNote.id, { folder: e.target.value })}
              placeholder="No folder assigned"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', outline: 'none' }}
            />
          </div>
          <span>Last edited: {getRelativeTime(activeNote.updated_at)}</span>
          {activeNote.isLocked && <span> | 🔒 Locked note (unlocked in this session)</span>}
        </div>
        <div
          ref={editorRef}
          className={`note digital-paper ${activeNote.paperStyle === 'grid' ? 'grid-paper' : activeNote.paperStyle === 'plain' ? 'plain-paper' : 'ruled-paper'}`}
          contentEditable="true"
          suppressContentEditableWarning={true}
          onInput={(e) => onUpdate(activeNote.id, { content: e.currentTarget.innerHTML })}
          onBlur={handleBlur}
          onClick={handleEditorClick}
          style={{ fontSize: activeNote.fontSize || '17px' }}
        />
        <div className="editor-footer">
          <div className="tags-display">
            {(activeNote.tags || []).map(t => (
              <span key={t} className="tag-badge">#{t}
              <button className="remove-tag-btn" onClick={() => handleRemoveTagClick(t)}><X size={12} /></button>
              </span>
            ))}</div>
        <div className="char-counter">
          {isRecording && <span style={{ color: '#ff4444', fontWeight: 'bold', marginRight: '8px', animation: 'pulse 1.5s infinite' }}>🔴 Listening...</span>}
          {isScanningImage && <span style={{ color: 'var(--accent)', fontWeight: 'bold', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ScanText size={12}/> Scanning Image...</span>}
          {charCount} chars | {wordCount} words | ~{readingTime} min read
        </div>
        </div>
        
        {/* Bi-Directional Links Section */}
        {(forwardLinks?.length > 0 || backlinks?.length > 0) && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            {forwardLinks?.length > 0 && (
              <div style={{ marginBottom: backlinks?.length > 0 ? '16px' : '0' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔗 Linked Mentions</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {forwardLinks.map(link => (
                    <button key={link.id} onClick={() => onNavigate(link.id)} className="tag-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={10} /> {link.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {backlinks?.length > 0 && (
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔙 Backlinks</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {backlinks.map(link => (
                    <button key={link.id} onClick={() => onNavigate(link.id)} className="tag-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={10} /> {link.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;