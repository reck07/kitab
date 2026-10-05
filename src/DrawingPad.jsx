import { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal, Pencil, Eraser, Palette } from 'lucide-react';

const DrawingPad = ({ onClose, onSaveToNote }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: window.innerHeight / 2 - 175 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const canvasAreaRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffeb3b');
  const [thickness, setThickness] = useState(3);
  const [mode, setMode] = useState('pencil'); // 'pencil' or 'eraser'

  // Resize the backing buffer whenever the widget is resized, preserving ink
  const lastSizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const area = canvasAreaRef.current;
    const canvas = canvasRef.current;
    if (!area || !canvas) return;
    if (typeof ResizeObserver === 'undefined') return;

    const syncSize = () => {
      const w = Math.max(1, Math.round(area.clientWidth));
      const h = Math.max(1, Math.round(area.clientHeight));
      if (w === canvas.width && h === canvas.height) return;
      const prevW = canvas.width;
      const prevH = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext('2d');
      // Redraw existing strokes scaled into the new buffer
      const snapshot = prevW && prevH ? ctx.getImageData(0, 0, prevW, prevH) : null;
      if (snapshot) {
        const tmp = document.createElement('canvas');
        tmp.width = prevW;
        tmp.height = prevH;
        tmp.getContext('2d').putImageData(snapshot, 0, 0);
        ctx.drawImage(tmp, 0, 0, prevW, prevH, 0, 0, canvas.width, canvas.height);
      }
      lastSizeRef.current = { w: canvas.width, h: canvas.height };
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // Keep the canvas backing buffer matched to its displayed size. The widget is
  // resizable (and switches to a narrower width on mobile), so a fixed buffer
  // would overflow and clip the right-hand side beyond the pointer's reach.
  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Canvas Drawing logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasPoint(e);

    ctx.lineTo(x, y);

    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = thickness * 2; // Make eraser slightly bigger for ease of use
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <div className="calculator-widget" style={{ top: position.y, left: position.x, minWidth: '240px', minHeight: '350px' }}>
      <div className="calculator-header" onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
        <GripHorizontal size={16} style={{ opacity: 0.3 }} />
        <span style={{ fontSize: '12px', fontWeight: 600 }}>Mini Sketch</span>
        <button className="btn-icon" onClick={onClose} style={{ padding: 2, minWidth: 'auto' }}><X size={14} /></button>
      </div>
      <div ref={canvasAreaRef} style={{ flex: 1, minHeight: 0, backgroundColor: 'transparent', position: 'relative', cursor: mode === 'eraser' ? 'cell' : 'crosshair', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={260} height={275} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-nav)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setMode('pencil')} style={{ background: 'none', border: 'none', color: mode === 'pencil' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }} title="Pencil Tool"><Pencil size={18} /></button>
          <button onClick={() => setMode('eraser')} style={{ background: 'none', border: 'none', color: mode === 'eraser' ? 'var(--danger)' : 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }} title="Eraser Tool"><Eraser size={18} /></button>
          <button onClick={() => { const dataUrl = canvasRef.current?.toDataURL(); if (dataUrl && onSaveToNote) { onSaveToNote(dataUrl); onClose(); } }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', transition: '0.2s', marginLeft: 'auto' }} title="Save to Note">💾</button>
        </div>
        <input type="range" min="1" max="20" value={thickness} onChange={(e) => setThickness(e.target.value)} title="Thickness Adjuster" style={{ width: '60px', accentColor: 'var(--accent)' }} />
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }} title="Color Palette">
          <Palette size={18} />
          <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setMode('pencil'); }} style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }} />
        </label>
      </div>
    </div>
  );
};

export default DrawingPad;