<<<<<<< HEAD
import { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal, Pencil, Eraser, Palette } from 'lucide-react';

const DrawingPad = ({ onClose }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: window.innerHeight / 2 - 175 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffeb3b');
  const [thickness, setThickness] = useState(3);
  const [mode, setMode] = useState('pencil'); // 'pencil' or 'eraser'

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

  // Canvas Drawing logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    
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
      <div style={{ flex: 1, backgroundColor: 'transparent', position: 'relative', cursor: mode === 'eraser' ? 'cell' : 'crosshair' }}>
        <canvas ref={canvasRef} width={260} height={275} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} style={{ display: 'block', touchAction: 'none' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-nav)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setMode('pencil')} style={{ background: 'none', border: 'none', color: mode === 'pencil' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }} title="Pencil Tool"><Pencil size={18} /></button>
          <button onClick={() => setMode('eraser')} style={{ background: 'none', border: 'none', color: mode === 'eraser' ? 'var(--danger)' : 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }} title="Eraser Tool"><Eraser size={18} /></button>
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

=======
import { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal, Pencil, Eraser, Palette } from 'lucide-react';

const DrawingPad = ({ onClose }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: window.innerHeight / 2 - 175 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffeb3b');
  const [thickness, setThickness] = useState(3);
  const [mode, setMode] = useState('pencil'); // 'pencil' or 'eraser'

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

  // Canvas Drawing logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    
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
      <div style={{ flex: 1, backgroundColor: 'transparent', position: 'relative', cursor: mode === 'eraser' ? 'cell' : 'crosshair' }}>
        <canvas ref={canvasRef} width={260} height={275} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} style={{ display: 'block', touchAction: 'none' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-nav)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setMode('pencil')} style={{ background: 'none', border: 'none', color: mode === 'pencil' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }} title="Pencil Tool"><Pencil size={18} /></button>
          <button onClick={() => setMode('eraser')} style={{ background: 'none', border: 'none', color: mode === 'eraser' ? 'var(--danger)' : 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }} title="Eraser Tool"><Eraser size={18} /></button>
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

>>>>>>> b95ce7254a8b813cef834ed02a8364210c343079
export default DrawingPad;