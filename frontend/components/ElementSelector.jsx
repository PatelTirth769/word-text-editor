'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaAlignCenter, 
  FaAlignLeft, 
  FaAlignRight, 
  FaArrowsAlt, 
  FaCompress, 
  FaCopy, 
  FaCut, 
  FaExpand, 
  FaPaste, 
  FaTrash 
} from 'react-icons/fa';

const ElementSelector = ({ editor, isOpen, onClose, position }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const alignLeft = () => {
    editor.chain().focus().setTextAlign('left').run();
    onClose();
  };

  const alignCenter = () => {
    editor.chain().focus().setTextAlign('center').run();
    onClose();
  };

  const alignRight = () => {
    editor.chain().focus().setTextAlign('right').run();
    onClose();
  };

  const copyElement = () => {
    // Copy selected element
    onClose();
  };

  const cutElement = () => {
    // Cut selected element
    onClose();
  };

  const pasteElement = () => {
    // Paste element
    onClose();
  };

  const deleteElement = () => {
    editor.chain().focus().deleteSelection().run();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-2 min-w-48"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Alignment */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Alignment
      </div>
      <button
        onClick={alignLeft}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaAlignLeft />
        Align Left
      </button>
      <button
        onClick={alignCenter}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaAlignCenter />
        Center
      </button>
      <button
        onClick={alignRight}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaAlignRight />
        Align Right
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Actions */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Actions
      </div>
      <button
        onClick={copyElement}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaCopy />
        Copy
      </button>
      <button
        onClick={cutElement}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaCut />
        Cut
      </button>
      <button
        onClick={pasteElement}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaPaste />
        Paste
      </button>
      <button
        onClick={deleteElement}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
      >
        <FaTrash />
        Delete
      </button>
    </div>
  );
};

export default ElementSelector;





















































