'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Display in inches like Google Docs (96px per inch by default)
const PX_PER_IN = 96
const A4_CONTENT_PX_DEFAULT = ((210 - 40) / 25.4) * PX_PER_IN // 210mm page width - 20mm*2 padding

// Constrain a number between min and max
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default function Ruler({ editor }) {
  const containerRef = useRef(null)
  const [contentWidthPx, setContentWidthPx] = useState(A4_CONTENT_PX_DEFAULT)
  const [leftIndentPx, setLeftIndentPx] = useState(0)
  const [firstLineIndentPx, setFirstLineIndentPx] = useState(0)
  const [rightIndentPx, setRightIndentPx] = useState(0)
  const [dragState, setDragState] = useState(null) // { type: 'left'|'first'|'right', startX, startValue }

  // Read current paragraph indent styles from editor selection
  const readIndentsFromSelection = () => {
    try {
      if (!editor) return
      // Prefer reading from active block's style attribute
      let styleStr = ''
      if (editor.isActive('paragraph')) {
        const pAttrs = editor.getAttributes('paragraph') || {}
        styleStr = pAttrs.style || ''
      } else if (editor.isActive('heading')) {
        const hAttrs = editor.getAttributes('heading') || {}
        styleStr = hAttrs.style || ''
      }

      const extractPx = (prop) => {
        const m = styleStr.match(new RegExp(`${prop}\\s*:\\s*([\\-0-9.]+)px`))
        return m ? parseFloat(m[1]) : null
      }
      let ml = extractPx('padding-left')
      let mr = extractPx('padding-right')
      let ti = extractPx('text-indent')

      // Fallback to computed styles from DOM selection container
      if (ml == null || mr == null || ti == null) {
        const sel = window.getSelection && window.getSelection()
        const node = sel && sel.anchorNode ? (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement) : null
        const block = node && node.closest ? node.closest('p, h1, h2, h3, h4, h5, h6') : null
        if (block) {
          const cs = window.getComputedStyle(block)
          if (ml == null) ml = parseFloat(cs.paddingLeft || '0')
          if (mr == null) mr = parseFloat(cs.paddingRight || '0')
          if (ti == null) ti = parseFloat(cs.textIndent || '0')
        }
      }

      setLeftIndentPx(isFinite(ml) ? ml : 0)
      setFirstLineIndentPx(isFinite(ti) ? ti : 0)
      setRightIndentPx(isFinite(mr) ? mr : 0)
    } catch {}
  }

  // Measure current page content width
  const measureContentWidth = () => {
    try {
      const page = document.querySelector('.ProseMirror .document-page')
      if (!page) return
      // Content box is page inner width minus 20mm*2 padding (enforced by CSS absolute positioning)
      const contentBox = page.querySelector('.ProseMirror') || page
      const rect = contentBox.getBoundingClientRect()
      if (rect && rect.width) setContentWidthPx(rect.width)
    } catch {}
  }

  // Apply indent styles to current block (paragraph or heading) via inline style with !important
  const applyIndents = (leftPx, firstPx, rightPx) => {
    if (!editor) return
    const safeLeft = clamp(leftPx, 0, Math.max(0, contentWidthPx - 10))
    const safeRight = clamp(rightPx, 0, Math.max(0, contentWidthPx - 10))
    const available = Math.max(0, contentWidthPx - safeLeft - safeRight)
    const safeFirst = clamp(firstPx, -safeLeft, available)

    const getExistingStyle = () => {
      if (editor.isActive('paragraph')) return (editor.getAttributes('paragraph')?.style) || ''
      if (editor.isActive('heading')) return (editor.getAttributes('heading')?.style) || ''
      return ''
    }
    const stripProp = (style, prop) => style.replace(new RegExp(`${prop}\\s*:\\s*[^;]*;?`, 'gi'), '')
    let styleStr = getExistingStyle() || ''
    styleStr = stripProp(styleStr, 'padding-left')
    styleStr = stripProp(styleStr, 'padding-right')
    styleStr = stripProp(styleStr, 'text-indent')
    const add = `padding-left: ${Math.round(safeLeft)}px !important; padding-right: ${Math.round(safeRight)}px !important; text-indent: ${Math.round(safeFirst)}px !important;`
    styleStr = `${styleStr.trim()} ${add}`.trim()

    const chain = editor.chain().focus()
    if (editor.isActive('paragraph')) {
      chain.updateAttributes('paragraph', { style: styleStr }).run()
    } else if (editor.isActive('heading')) {
      chain.updateAttributes('heading', { style: styleStr }).run()
    } else {
      chain.setParagraph().updateAttributes('paragraph', { style: styleStr }).run()
    }

    setLeftIndentPx(safeLeft)
    setFirstLineIndentPx(safeFirst)
    setRightIndentPx(safeRight)
  }

  // Sync on mount and editor selection updates
  useEffect(() => {
    if (!editor) return
    readIndentsFromSelection()
    measureContentWidth()
    const onResize = () => measureContentWidth()
    window.addEventListener('resize', onResize)
    const observer = new ResizeObserver(() => measureContentWidth())
    const host = document.querySelector('.ProseMirror')
    if (host) observer.observe(host)

    const unsubscribe = editor.on('selectionUpdate', () => {
      readIndentsFromSelection()
      measureContentWidth()
    })

    return () => {
      window.removeEventListener('resize', onResize)
      try { observer.disconnect() } catch {}
      try { unsubscribe?.() } catch {}
    }
  }, [editor])

  // Ruler ticks (inches, like Google Docs):
  // - Major every 1 inch with numeric label
  // - Medium every 1/2 inch
  // - Minor every 1/8 inch
  const ticks = useMemo(() => {
    const totalInches = contentWidthPx / PX_PER_IN
    const list = []
    const step = 1 / 8
    for (let i = 0; i <= Math.ceil(totalInches / step); i++) {
      const inches = i * step
      const x = inches * PX_PER_IN
      const isMajor = Math.abs(inches - Math.round(inches)) < 1e-6
      const isMedium = !isMajor && Math.abs(inches * 2 - Math.round(inches * 2)) < 1e-6 // 1/2"
      const isQuarter = !isMajor && !isMedium && Math.abs(inches * 4 - Math.round(inches * 4)) < 1e-6 // 1/4"
      list.push({
        x,
        label: isMajor ? String(Math.round(inches)) : '',
        level: isMajor ? 'major' : isMedium ? 'medium' : isQuarter ? 'quarter' : 'minor',
      })
    }
    return list
  }, [contentWidthPx])

  // Drag handlers
  const onMouseDownHandle = (type, e) => {
    const startValue = type === 'left' ? leftIndentPx : type === 'first' ? firstLineIndentPx : rightIndentPx
    setDragState({ type, startX: e.clientX, startValue })
    e.preventDefault()
    e.stopPropagation()
  }

  useEffect(() => {
    if (!dragState) return
    const onMove = (e) => {
      const dx = e.clientX - dragState.startX
      if (dragState.type === 'left') {
        const newLeft = clamp(dragState.startValue + dx, 0, contentWidthPx - 10)
        // First-line indent cannot be left of the paragraph left; adjust if needed
        const adjustedFirst = clamp(firstLineIndentPx, -newLeft, contentWidthPx - newLeft - rightIndentPx)
        applyIndents(newLeft, adjustedFirst, rightIndentPx)
      } else if (dragState.type === 'first') {
        const newFirst = clamp(dragState.startValue + dx, -leftIndentPx, contentWidthPx - leftIndentPx - rightIndentPx)
        applyIndents(leftIndentPx, newFirst, rightIndentPx)
      } else if (dragState.type === 'right') {
        const newRight = clamp(dragState.startValue - dx, 0, contentWidthPx - 10)
        const maxLeft = contentWidthPx - 10 - newRight
        const adjustedLeft = clamp(leftIndentPx, 0, maxLeft)
        const adjustedFirst = clamp(firstLineIndentPx, -adjustedLeft, contentWidthPx - adjustedLeft - newRight)
        applyIndents(adjustedLeft, adjustedFirst, newRight)
      }
    }
    const onUp = () => setDragState(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp, { once: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragState, contentWidthPx, leftIndentPx, firstLineIndentPx, rightIndentPx])

  return (
    <div ref={containerRef} className="w-full select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div className="relative rounded-sm" style={{ height: 32, background: 'linear-gradient(#f8fafc, #eef2f7)' }}>
        {/* Top/Bottom borders like Google Docs */}
        <div className="absolute inset-x-0 top-0 h-px bg-gray-300/80" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gray-300/80" />

        {/* Tick marks */}
        <svg width="100%" height="32" style={{ display: 'block' }}>
          {ticks.map((t, idx) => {
            let y2 = 10
            if (t.level === 'medium') y2 = 14
            if (t.level === 'quarter') y2 = 12
            if (t.level === 'major') y2 = 18
            return (
              <g key={idx} transform={`translate(${t.x},0)`}>
                <line x1={0} y1={0} x2={0} y2={y2} stroke="#9ca3af" strokeWidth={1} />
                {t.level === 'major' && (
                  <text x={0} y={28} textAnchor="middle" fontSize="11" fill="#64748b">{t.label}</text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Left indent handle (rectangle) */}
        <div
          onMouseDown={(e) => onMouseDownHandle('left', e)}
          title="Left indent"
          className="absolute top-0 h-[32px] w-0 cursor-col-resize"
          style={{ left: `${leftIndentPx}px` }}
        >
          <div className="mx-[-7px] mt-[10px] w-[14px] h-[6px] bg-blue-500 rounded-sm shadow-sm" />
        </div>

        {/* First line indent handle (triangle) */}
        <div
          onMouseDown={(e) => onMouseDownHandle('first', e)}
          title="First-line indent"
          className="absolute top-0 h-[32px] w-0 cursor-col-resize"
          style={{ left: `${leftIndentPx + firstLineIndentPx}px` }}
        >
          <svg width="14" height="10" className="mx-[-7px] mt-[20px]" viewBox="0 0 14 10">
            <path d="M1 9 L7 1 L13 9 Z" fill="#3b82f6" />
          </svg>
        </div>

        {/* Right indent handle (triangle at the right) */}
        <div
          onMouseDown={(e) => onMouseDownHandle('right', e)}
          title="Right indent"
          className="absolute top-0 right-0 h-[32px] w-0 cursor-col-resize"
          style={{ right: `${rightIndentPx}px` }}
        >
          <svg width="14" height="10" className="mx-[-7px] mt-[10px] rotate-180" viewBox="0 0 14 10">
            <path d="M1 9 L7 1 L13 9 Z" fill="#6366f1" />
          </svg>
        </div>
      </div>
    </div>
  )
}


