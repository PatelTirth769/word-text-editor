'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaPlus, 
  FaMinus, 
  FaEdit, 
  FaTrash, 
  FaArrowUp, 
  FaArrowDown, 
  FaArrowLeft, 
  FaArrowRight,
  FaCompress,
  FaExpand
} from 'react-icons/fa';

const TableContextMenu = ({ editor, isOpen, onClose, position }) => {
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

  const addRowAbove = () => {
    editor.chain().focus().addRowBefore().run();
    onClose();
  };

  const addRowBelow = () => {
    editor.chain().focus().addRowAfter().run();
    onClose();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
    onClose();
  };

  const addColumnLeft = () => {
    editor.chain().focus().addColumnBefore().run();
    onClose();
  };

  const addColumnRight = () => {
    editor.chain().focus().addColumnAfter().run();
    onClose();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
    onClose();
  };

  const mergeCells = () => {
    editor.chain().focus().mergeCells().run();
    onClose();
  };

  const splitCell = () => {
    editor.chain().focus().splitCell().run();
    onClose();
  };

  const unmergeCell = () => {
    editor.chain().focus().splitCell().run();
    onClose();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
    onClose();
  };

  const toggleHeaderRow = () => {
    editor.chain().focus().toggleHeaderRow().run();
    onClose();
  };

  const toggleHeaderColumn = () => {
    editor.chain().focus().toggleHeaderColumn().run();
    onClose();
  };

  const selectRow = () => {
    editor.chain().focus().selectRow().run();
    onClose();
  };

  const selectColumn = () => {
    editor.chain().focus().selectColumn().run();
    onClose();
  };

  const selectCell = () => {
    editor.chain().focus().selectCell().run();
    onClose();
  };

  const setCellBg = (color) => {
    editor.chain().focus().setCellAttribute('backgroundColor', color).run();
  };

  const setCellBorderColor = (color) => {
    editor.chain().focus().setCellAttribute('borderColor', color).run();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-2 min-w-48 max-h-96 overflow-y-auto"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* Row Operations */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Rows
      </div>
      <button
        onClick={addRowAbove}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaArrowUp />
        Add Row Above
      </button>
      <button
        onClick={addRowBelow}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaArrowDown />
        Add Row Below
      </button>
      <button
        onClick={deleteRow}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
      >
        <FaMinus />
        Delete Row
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Column Operations */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Columns
      </div>
      <button
        onClick={addColumnLeft}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaArrowLeft />
        Add Column Left
      </button>
      <button
        onClick={addColumnRight}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaArrowRight />
        Add Column Right
      </button>
      <button
        onClick={deleteColumn}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
      >
        <FaMinus />
        Delete Column
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Cell Operations */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Cells
      </div>
      <button
        onClick={mergeCells}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaCompress />
        Merge Cells
      </button>
      <button
        onClick={splitCell}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaExpand />
        Split Cell
      </button>
      <button
        onClick={unmergeCell}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaExpand />
        Unmerge Cell
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Colors */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Colors
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-sm">Cell Fill</span>
        <input type="color" onChange={(e) => setCellBg(e.target.value)} className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer" />
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-sm">Border</span>
        <input type="color" onChange={(e) => setCellBorderColor(e.target.value)} className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer" />
      </div>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Header Operations */}
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Headers
      </div>
      <button
        onClick={toggleHeaderRow}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaEdit />
        Toggle Header Row
      </button>
      <button
        onClick={toggleHeaderColumn}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <FaEdit />
        Toggle Header Column
      </button>

      <div className="border-t border-gray-200 my-1"></div>

      {/* Table Operations */}
      <button
        onClick={deleteTable}
        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
      >
        <FaTrash />
        Delete Table
      </button>
    </div>
  );
};

export default TableContextMenu;





















