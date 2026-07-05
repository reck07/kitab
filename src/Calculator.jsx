import { useState, useRef, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';

const Calculator = ({ onClose }) => {
  // It's recommended to use a safe math expression parser instead of new Function()
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [input, setInput] = useState('');

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

  const handleClick = (val) => {
    if (val === 'C') setInput('');
    else if (val === '=') {
      try {
        // Using new Function() is a security risk, similar to eval().
        // Replace with a safe math expression parser library like math.js or expr-eval.
        // Example with a hypothetical safeEval function:
        const result = new Function('return ' + input.replace(/×/g, '*').replace(/÷/g, '/'))();
        // const result = safeEval(input.replace(/×/g, '*').replace(/÷/g, '/'));
        setInput(String(result));
      } catch {
        setInput('Error');
      }
    } else {
      if (input === 'Error') setInput(val);
      else setInput(input + val);
    }
  };

  const buttons = ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];

  return (
    <div className="calculator-widget" style={{ top: position.y, left: position.x }}>
      <div className="calculator-header" onMouseDown={handleMouseDown}>
        <GripHorizontal size={16} style={{ opacity: 0.3 }} />
        <span style={{ fontSize: '12px', fontWeight: 600 }}>Calculator</span>
        <button className="btn-icon" onClick={onClose} style={{ padding: 2, minWidth: 'auto' }}><X size={14} /></button>
      </div>
      <div className="calculator-display">{input || '0'}</div>
      <div className="calculator-grid">
        {buttons.map((btn, i) => (
          <button 
            key={i} 
            onClick={() => handleClick(btn)}
            className={`calc-btn ${['÷', '×', '-', '+'].includes(btn) ? 'op' : ''} ${btn === 'C' ? 'clear' : ''} ${btn === '=' ? 'equals' : ''} ${btn === '0' ? 'zero' : ''}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;