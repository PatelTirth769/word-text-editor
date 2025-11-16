'use client'

import { useState, useEffect, useRef } from 'react'

export default function ImageWrapToolbar({ editor, isOpen, onClose, position }) {
  const menuRef = useRef(null)
  const [attrs, setAttrs] = useState({ wrap: 'inline', layer: 'normal', wrapMargin: 12, positioning: 'move' })
  const [src, setSrc] = useState(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Load current image attributes when menu opens
      // Try multiple ways to find the selected image
      let img = document.querySelector('img.resizable-image.selected')
      if (!img) {
        // Fallback: find any resizable image in editor
        const editorRoot = editor?.view?.dom
        if (editorRoot) {
          img = editorRoot.querySelector('img.resizable-image')
        }
      }
      if (img) {
        setSrc(img.getAttribute('src'))
        setAttrs({
          wrap: img.getAttribute('data-image-wrap') || 'inline',
          layer: img.getAttribute('data-image-layer') || 'normal',
          wrapMargin: Number(img.getAttribute('data-wrap-margin')) || 12,
          positioning: img.getAttribute('data-image-positioning') || 'move',
        })
      } else {
        // If no image found, close menu
        onClose()
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const updateImage = (next) => {
    if (!editor || !src) return
    const { state, view } = editor
    const { tr } = state
    let dispatched = false
    state.doc.descendants((node, pos) => {
      if (node.type.name === 'image' && node.attrs.src === src) {
        const newAttrs = { ...node.attrs, ...next }
        if (newAttrs.wrap === 'inline' || newAttrs.wrap === 'break') {
          // inline/break: ensure not floating when moving with text
          if (newAttrs.positioning !== 'fix') {
            newAttrs.floating = false
            delete newAttrs.x; delete newAttrs.y
          }
        }
        tr.setNodeMarkup(pos, null, newAttrs)
        dispatched = true
        return false
      }
      return true
    })
    if (dispatched) {
      view.dispatch(tr)
      setAttrs(prev => ({ ...prev, ...next }))
    }
  }

  if (!isOpen || !position || !editor) return null

  // Position menu on left side near sidebar, vertically centered with image
  const menuX = position.x || 0
  const menuY = position.y || 0

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-2 min-w-48 max-h-96 overflow-y-auto"
      style={{
        left: menuX,
        top: menuY,
        transform: 'translateY(-50%)', // Center vertically
      }}
    >
      {/* Text Wrapping */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Text Wrapping
      </div>
      <button
        onClick={() => { updateImage({ wrap: 'inline', positioning: 'move', layer: 'normal' }); onClose() }}
        className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm ${attrs.wrap === 'inline' ? 'bg-blue-50' : ''}`}
      >
        Inline with text
      </button>
      <button
        onClick={() => { updateImage({ wrap: 'wrap-left', positioning: 'move', layer: 'normal' }); onClose() }}
        className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm ${attrs.wrap === 'wrap-left' ? 'bg-blue-50' : ''}`}
      >
        Wrap text (Left)
      </button>
      <button
        onClick={() => { updateImage({ wrap: 'wrap-right', positioning: 'move', layer: 'normal' }); onClose() }}
        className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm ${attrs.wrap === 'wrap-right' ? 'bg-blue-50' : ''}`}
      >
        Wrap text (Right)
      </button>
      <button
        onClick={() => { updateImage({ wrap: 'break', positioning: 'move', layer: 'normal' }); onClose() }}
        className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm ${attrs.wrap === 'break' ? 'bg-blue-50' : ''}`}
      >
        Break text
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Layer Options */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Layer
      </div>
      <button
        onClick={() => { updateImage({ layer: 'behind', positioning: 'fix', floating: true }); onClose() }}
        className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm ${attrs.layer === 'behind' ? 'bg-blue-50' : ''}`}
      >
        Behind text
      </button>
      <button
        onClick={() => { updateImage({ layer: 'front', positioning: 'fix', floating: true }); onClose() }}
        className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm ${attrs.layer === 'front' ? 'bg-blue-50' : ''}`}
      >
        In front of text
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Wrap Margin */}
      <div className="px-3 py-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Wrap Margin
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="48"
            step="1"
            value={attrs.wrapMargin}
            onChange={(e) => updateImage({ wrapMargin: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-8">{attrs.wrapMargin}px</span>
        </div>
      </div>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Positioning */}
      <div className="px-3 py-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Position
        </div>
        <select
          value={attrs.positioning}
          onChange={(e) => {
            const v = e.target.value
            updateImage({ positioning: v, floating: v === 'fix' })
          }}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="move">Move with text</option>
          <option value="fix">Fix position on page</option>
        </select>
      </div>
    </div>
  )
}
