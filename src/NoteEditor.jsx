import { useRef, useEffect, useState } from 'react';
import { List, Heading1, Heading2, MessageSquare, Mic, Share2, Lock, Pin, Star, Archive, X, ArrowLeft, Image as ImageIcon, Smile, Bot, SpellCheck, FileText, ChevronRight, CheckSquare, Layout, Trash2, RotateCcw, FilePlus } from 'lucide-react';
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
  onSummarize, 
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

  // Update editor content only when the active note changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== activeNote.content) {
      const html = (activeNote.content || '').replace(
        /\[\[(.*?)\]\]/g,
        (_, title) => `<a href="#" data-wikilink="${title.replace(/"/g, '&quot;')}" style="color:var(--accent);text-decoration:underline;cursor:pointer;font-weight:500;" contenteditable="false">[[${title}]]</a>`
      );
      editorRef.current.innerHTML = html;
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
    // Restore [[wikilinks]] from clickable anchors before saving
    const restored = stripWikilinks(editorRef.current.innerHTML);
    if (restored !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = restored;
    }
    const element = editorRef.current;
    
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    const wwwRegex = /(^|\s)(www\.[^\s<]+)/g;
    
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

    let nodesToReplace = [];
    let node;
    while((node = walker.nextNode())) {
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
        const updatedTags = [...(activeNote.tags || []), newTag];
        onUpdate(activeNote.id, { tags: updatedTags });
        e.target.value = '';
      }
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;

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
        const transcript = event.results[0][0].transcript;
        const currentHTML = editorRef.current.innerHTML;
        const needsSpace = currentHTML.length > 0 && !currentHTML.endsWith(' ');
        const updatedHTML = currentHTML + (needsSpace ? ' ' : '') + transcript;
        onUpdate(activeNote.id, { content: updatedHTML });
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
      
      <div className={`text-tools-wrapper ${isToolsOpen ? '' : 'collapsed'}`}>
        <button 
          className="text-tools-toggle" 
          onClick={() => setIsToolsOpen(!isToolsOpen)}
          title={isToolsOpen ? "Hide Tools" : "Show Tools"}
        >
          <ChevronRight size={14} style={{ transform: isToolsOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
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
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('bold'); }} title="Bold"><strong>B</strong></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('italic'); }} title="Italic"><em>i</em></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('insertUnorderedList'); }} title="Bullet List"><List size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('insertOrderedList'); }} title="Numbered List"><CheckSquare size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('formatBlock', false, 'h1'); editorRef.current?.focus(); }} title="Heading 1"><Heading1 size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('formatBlock', false, 'h2'); editorRef.current?.focus(); }} title="Heading 2"><Heading2 size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('formatBlock', false, 'blockquote'); }} title="Quote"><MessageSquare size={15} /></button>
          <button className="btn-icon sm" onClick={() => { editorRef.current?.focus(); document.execCommand('insertHorizontalRule'); }} title="Divider">—</button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={handleVoiceInput} title="Voice Input" style={{ color: isRecording ? 'var(--danger)' : 'var(--text-muted)' }}><Mic size={15} /></button>
          <button className="btn-icon sm" onClick={handleShare} title="Share"><Share2 size={15} /></button>
          <button className="btn-icon sm" onClick={() => fileInputRef.current?.click()} title="Insert Image"><ImageIcon size={15} /></button>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={handleGrammarCheck} title="Grammar Check"><SpellCheck size={15} /></button>
          <button className="btn-icon sm" onClick={() => setShowEmojiPicker(!showEmojiPicker)} title="Emoji"><Smile size={15} /></button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={() => setShowPaperSettings(!showPaperSettings)} title="Paper"><FileText size={15} /></button>
          <button className="btn-icon sm" onClick={() => setShowLayoutSettings(!showLayoutSettings)} title="Size"><Layout size={15} /></button>
          <button className="btn-icon sm" onClick={onSummarize} title="AI"><Bot size={15} /></button>
          <button className="btn-icon sm" onClick={onToggleFocus} title="Focus Mode" style={{ opacity: focusMode ? 1 : 0.5 }}><Layout size={15} /></button>
          <div className="toolbar-divider"></div>
          <button className="btn-icon sm" onClick={onSaveTemplate} title="Save as Template"><FileText size={15} /></button>
          <button className="btn-icon sm" onClick={onLoadTemplate} title="New from Template"><FilePlus size={15} /></button>
          {isRecording && <span className="rec-badge">🔴</span>}
          {isScanningImage && <span className="scan-badge">📸</span>}
        </div>
      </div>

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

          <div className="editor-container" style={{ 
        maxWidth: '100%', 
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div className="editor-header-meta">
          <div className="char-counter">{charCount}c · {wordCount}w · {readingTime}m</div>
          <div className="note-meta">
            {activeNote.isRecycled ? (
              <>
                <button className="btn-link" onClick={() => onRestore?.(activeNote.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <RotateCcw size={14} /> Restore
                </button>
                <button className="btn-link danger" onClick={() => onPermanentDelete?.(activeNote.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Trash2 size={14} /> Delete
                </button>
              </>
            ) : (
              <>
                <button className="btn-icon sm" onClick={() => onTogglePin?.(activeNote.id)} title={activeNote.isPinned ? 'Unpin' : 'Pin'} style={{ color: activeNote.isPinned ? 'var(--accent)' : undefined }}>
                  <Pin size={12} fill={activeNote.isPinned ? 'currentColor' : 'none'} />
                </button>
                <button className="btn-icon sm" onClick={() => onToggleFavorite?.(activeNote.id)} title={activeNote.isFavorite ? 'Unfavorite' : 'Favorite'} style={{ color: activeNote.isFavorite ? 'var(--accent)' : undefined }}>
                  <Star size={12} fill={activeNote.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button className="btn-icon sm" onClick={() => onToggleArchive?.(activeNote.id)} title={activeNote.isArchived ? 'Unarchive' : 'Archive'}>
                  <Archive size={12} />
                </button>
                <button className="btn-icon sm" onClick={() => onDelete?.(activeNote.id)} title="Move to trash" style={{ color: 'var(--text-muted)' }}>
                  <Trash2 size={12} />
                </button>
              </>
            )}
            {activeNote.isLocked && <Lock size={12} />}
          </div>
        </div>
        {activeNote.isRecycled && (
          <div className="trash-notice">
            This note is in trash. <button className="btn-link" onClick={() => onRestore?.(activeNote.id)}>Restore</button> or <button className="btn-link danger" onClick={() => onPermanentDelete?.(activeNote.id)}>delete permanently</button>
          </div>
        )}
        {!activeNote.isRecycled && (
          <div className="tags-bar">
            <div className="tags-display">
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
              }} title="Auto-suggest tags">✨</button>
            </div>
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
            <style jsx>{`
              .note-cover-wrapper { position: relative; }
              .cover-actions { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
              .note-cover-wrapper:hover .cover-actions { opacity: 1; }
            `}</style>
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
        
        <style jsx>{`
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
        `}</style>
      </div>
    </div>
  );
};

export default NoteEditor;