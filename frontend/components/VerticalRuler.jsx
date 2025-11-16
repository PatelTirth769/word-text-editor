'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Display in inches like Google Docs (96px per inch by default)
const PX_PER_IN = 96
const A4_HEIGHT_MM = 297
const A4_HEIGHT_PX = (A4_HEIGHT_MM / 25.4) * PX_PER_IN // A4 page height in pixels

export default function VerticalRuler({ editor }) {
  const containerRef = useRef(null)
  const [pageCount, setPageCount] = useState(1)
  const [singlePageHeightPx, setSinglePageHeightPx] = useState(A4_HEIGHT_PX)

  // Measure pages and get count
  const measurePages = () => {
    try {
      const pages = document.querySelectorAll('.ProseMirror .document-page')
      if (pages.length > 0) {
        setPageCount(pages.length)
        // Measure first page to get actual height
        const firstPage = pages[0]
        const rect = firstPage.getBoundingClientRect()
        if (rect && rect.height) {
          setSinglePageHeightPx(rect.height)
        } else {
          setSinglePageHeightPx(A4_HEIGHT_PX)
        }
      } else {
        setPageCount(1)
        setSinglePageHeightPx(A4_HEIGHT_PX)
      }
    } catch {}
  }

  // Sync on mount and editor selection updates
  useEffect(() => {
    if (!editor) return
    measurePages()
    const onResize = () => measurePages()
    window.addEventListener('resize', onResize)
    const observer = new ResizeObserver(() => measurePages())
    const host = document.querySelector('.ProseMirror')
    if (host) observer.observe(host)

    // Also observe all pages
    const pages = document.querySelectorAll('.ProseMirror .document-page')
    pages.forEach((page) => observer.observe(page))

    const unsubscribe = editor.on('selectionUpdate', () => {
      measurePages()
    })

    // Also listen for document updates to detect new pages
    const updateUnsubscribe = editor.on('update', () => {
      setTimeout(measurePages, 0)
    })

    return () => {
      window.removeEventListener('resize', onResize)
      try { observer.disconnect() } catch {}
      try { unsubscribe?.() } catch {}
      try { updateUnsubscribe?.() } catch {}
    }
  }, [editor])

  // Ruler ticks for a single page (inches, like Google Docs):
  // - Major every 1 inch with numeric label
  // - Medium every 1/2 inch
  // - Minor every 1/8 inch
  const ticks = useMemo(() => {
    const totalInches = singlePageHeightPx / PX_PER_IN
    const list = []
    const step = 1 / 8
    for (let i = 0; i <= Math.ceil(totalInches / step); i++) {
      const inches = i * step
      const y = inches * PX_PER_IN
      const isMajor = Math.abs(inches - Math.round(inches)) < 1e-6
      const isMedium = !isMajor && Math.abs(inches * 2 - Math.round(inches * 2)) < 1e-6 // 1/2"
      const isQuarter = !isMajor && !isMedium && Math.abs(inches * 4 - Math.round(inches * 4)) < 1e-6 // 1/4"
      list.push({
        y,
        label: isMajor ? String(Math.round(inches)) : '',
        level: isMajor ? 'major' : isMedium ? 'medium' : isQuarter ? 'quarter' : 'minor',
      })
    }
    return list
  }, [singlePageHeightPx])

  // Total height for all pages
  const totalHeightPx = singlePageHeightPx * pageCount

  return (
    <div 
      ref={containerRef} 
      className="select-none flex-shrink-0" 
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        width: 32,
        position: 'relative'
      }}
    >
      <div 
        className="relative rounded-sm" 
        style={{ 
          width: 32, 
          height: totalHeightPx,
          background: 'linear-gradient(to right, #f8fafc, #eef2f7)',
          position: 'relative'
        }}
      >
        {/* Left/Right borders like Google Docs */}
        <div className="absolute inset-y-0 left-0 w-px bg-gray-300/80" />
        <div className="absolute inset-y-0 right-0 w-px bg-gray-300/80" />

        {/* Render a ruler segment for each page */}
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const pageTop = pageIndex * singlePageHeightPx
          return (
            <div
              key={pageIndex}
              style={{
                position: 'absolute',
                top: `${pageTop}px`,
                left: 0,
                width: '32px',
                height: `${singlePageHeightPx}px`
              }}
            >
              {/* Page separator line (subtle) */}
              {pageIndex > 0 && (
                <div 
                  className="absolute top-0 left-0 right-0 h-px bg-gray-400/50"
                  style={{ top: '-1px' }}
                />
              )}
              
              {/* Tick marks for this page */}
              <svg 
                width="32" 
                height={singlePageHeightPx} 
                style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
              >
                {ticks.map((t, idx) => {
                  let x2 = 10
                  if (t.level === 'medium') x2 = 14
                  if (t.level === 'quarter') x2 = 12
                  if (t.level === 'major') x2 = 18
                  return (
                    <g key={idx} transform={`translate(0,${t.y})`}>
                      <line x1={0} y1={0} x2={x2} y2={0} stroke="#9ca3af" strokeWidth={1} />
                      {t.level === 'major' && (
                        <text 
                          x={16} 
                          y={0} 
                          textAnchor="middle" 
                          fontSize="11" 
                          fill="#64748b"
                          dominantBaseline="middle"
                          transform={`translate(0, 4)`}
                        >
                          {t.label}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}

