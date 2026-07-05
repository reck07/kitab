import { useState, useCallback, useRef, useEffect } from 'react'
import { Plus, Network, Calculator as CalculatorIcon, Pencil, Bold, Italic, List, Heading1, Heading2, MessageSquare, Image as ImageIcon, Mic, FileText, Layout, Bot, Smile, Sparkles, Printer, Download } from 'lucide-react'

const TOOLS = [
  { icon: Bold, label: 'Bold', action: 'bold' },
  { icon: Italic, label: 'Italic', action: 'italic' },
  { icon: Heading1, label: 'H1', action: 'h1' },
  { icon: Heading2, label: 'H2', action: 'h2' },
  { icon: List, label: 'List', action: 'list' },
  { icon: MessageSquare, label: 'Quote', action: 'quote' },
  { icon: Mic, label: 'Voice', action: 'voice' },
  { icon: ImageIcon, label: 'Image', action: 'image' },
  { icon: FileText, label: 'Paper', action: 'paper' },
  { icon: Layout, label: 'Size', action: 'size' },
  { icon: Bot, label: 'AI', action: 'ai' },
  { icon: Smile, label: 'Emoji', action: 'emoji' },
  { icon: Sparkles, label: 'Grammar', action: 'grammar' },
  { icon: Download, label: 'Export', action: 'exportJSON' },
  { icon: Printer, label: 'Print', action: 'exportPDF' },
  { icon: Network, label: 'Graph', action: 'graph' },
  { icon: Pencil, label: 'Sketch', action: 'drawing' },
  { icon: CalculatorIcon, label: 'Calc', action: 'calculator' },
  { icon: Plus, label: 'New Note', action: 'add' },
]

const TOTAL = TOOLS.length
const ANGLE_PER_ITEM = 360 / TOTAL
const RADIUS = 110

const FloatingMenu = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef(null)
  const rotationRef = useRef(0)
  const isDraggingRef = useRef(false)

  const close = useCallback(() => {
    setIsOpen(false)
    setRotation(0)
    rotationRef.current = 0
  }, [])

  const handleAction = useCallback((action) => {
    if (isDraggingRef.current) return
    onAction?.(action)
    close()
  }, [onAction, close])

  const snapRotation = useCallback((angle) => {
    return Math.round(angle / ANGLE_PER_ITEM) * ANGLE_PER_ITEM
  }, [])

  useEffect(() => {
    if (!isOpen) {
      rotationRef.current = 0
      return
    }
    const ring = containerRef.current
    if (!ring) return

    let drag = null

    const onPointerDown = (e) => {
      e.preventDefault()
      const rect = ring.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      isDraggingRef.current = false
      drag = {
        startAngle: Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI),
        startRotation: rotationRef.current,
        cx,
        cy,
        startX: e.clientX,
        startY: e.clientY,
      }
    }

    const onPointerMove = (e) => {
      if (!drag) return
      if (!isDraggingRef.current && (Math.abs(e.clientX - drag.startX) > 5 || Math.abs(e.clientY - drag.startY) > 5)) {
        isDraggingRef.current = true
      }
      if (!isDraggingRef.current) return
      const currentAngle = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * (180 / Math.PI)
      let delta = currentAngle - drag.startAngle
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      const newRot = drag.startRotation + delta
      rotationRef.current = newRot
      setRotation(newRot)
    }

    const onPointerUp = () => {
      if (!drag) return
      if (isDraggingRef.current) {
        const snapped = snapRotation(rotationRef.current)
        rotationRef.current = snapped
        setRotation(snapped)
      }
      drag = null
    }

    ring.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    return () => {
      ring.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isOpen, snapRotation])

  return (
    <div className={`fab-container ${isOpen ? 'open' : ''}`} ref={containerRef} style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="fab-items-wrapper">
        <div className="fab-ring">
          {TOOLS.map((tool, i) => {
            const angle = (i / TOTAL) * 360 - 90
            const angleRad = angle * Math.PI / 180
            const dx = Math.cos(angleRad) * RADIUS
            const dy = Math.sin(angleRad) * RADIUS
            const Icon = tool.icon
            return (
              <div
                key={tool.action}
                className="fab-orbit"
                style={{ '--dx': `${dx}px`, '--dy': `${dy}px` }}
              >
                <button
                  className="fab-dot"
                  onClick={() => handleAction(tool.action)}
                  title={tool.label}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <Icon size={14} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
      <button className="fab-toggle" onClick={() => setIsOpen(!isOpen)} title="Toggle Tools">
        <div className="fab-hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
  )
}

export default FloatingMenu
