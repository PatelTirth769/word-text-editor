'use client'

import { useEffect, useRef, useState } from 'react'
import { FaRegImage } from 'react-icons/fa'
import { MdWrapText } from 'react-icons/md'

const menuStyle = {
  position: 'fixed',
  zIndex: 10000,
  background: '#fff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: '6px',
  padding: '6px',
  minWidth: '220px'
}

const itemCls = 'w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm'

export default function ImageContextMenu({ editor }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [targetSrc, setTargetSrc] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (!editor?.view?.dom) return

    const onCtx = (e) => {
      const img = e.target && e.target.closest && e.target.closest('img')
      if (!img) return
      // Only handle images inside the editor
      if (!editor.view.dom.contains(img)) return
      e.preventDefault()
      setTargetSrc(img.getAttribute('src'))
      setPos({ x: e.clientX, y: e.clientY })
      setOpen(true)
    }

    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('contextmenu', onCtx)
    document.addEventListener('mousedown', onDocClick)
    return () => {
      document.removeEventListener('contextmenu', onCtx)
      document.removeEventListener('mousedown', onDocClick)
    }
  }, [editor])

  const updateImageAttrsBySrc = (attrs) => {
    if (!editor || !targetSrc) return
    const { state, view } = editor
    const { tr } = state
    let dispatched = false
    state.doc.descendants((node, nodePos) => {
      if (node.type.name === 'image' && node.attrs.src === targetSrc) {
        tr.setNodeMarkup(nodePos, null, { ...node.attrs, ...attrs })
        dispatched = true
        return false
      }
      return true
    })
    if (dispatched) view.dispatch(tr)
  }

  const setInline = () => {
    updateImageAttrsBySrc({ floating: false, wrap: 'inline', layer: 'normal' })
    setOpen(false)
  }
  const setWrapLeft = () => {
    updateImageAttrsBySrc({ floating: false, wrap: 'wrap-left', layer: 'normal' })
    setOpen(false)
  }
  const setWrapRight = () => {
    updateImageAttrsBySrc({ floating: false, wrap: 'wrap-right', layer: 'normal' })
    setOpen(false)
  }
  const setBreakText = () => {
    updateImageAttrsBySrc({ floating: false, wrap: 'break', layer: 'normal' })
    setOpen(false)
  }
  const setBehind = () => {
    // Make floating so z-index layering applies
    updateImageAttrsBySrc({ floating: true, layer: 'behind' })
    setOpen(false)
  }
  const setFront = () => {
    updateImageAttrsBySrc({ floating: true, layer: 'front' })
    setOpen(false)
  }

  if (!open) return null

  return (
    <div ref={ref} style={{ ...menuStyle, left: pos.x, top: pos.y }}>
      <div className="px-3 py-2 text-xs text-gray-500">Image options</div>
      <button className={itemCls} onClick={setInline}>
        Inline with text
      </button>
      <div className="px-3 py-1 text-xs text-gray-400">Wrap text</div>
      <div className="flex gap-1 px-2 pb-1">
        <button className="flex-1 px-3 py-2 rounded hover:bg-gray-100 text-sm" onClick={setWrapLeft}>Wrap left</button>
        <button className="flex-1 px-3 py-2 rounded hover:bg-gray-100 text-sm" onClick={setWrapRight}>Wrap right</button>
      </div>
      <button className={itemCls} onClick={setBreakText}>Break text</button>
      <div className="px-3 py-1 text-xs text-gray-400">Layer</div>
      <div className="flex gap-1 px-2 pb-1">
        <button className="flex-1 px-3 py-2 rounded hover:bg-gray-100 text-sm" onClick={setBehind}>Behind text</button>
        <button className="flex-1 px-3 py-2 rounded hover:bg-gray-100 text-sm" onClick={setFront}>In front of text</button>
      </div>
    </div>
  )
}













