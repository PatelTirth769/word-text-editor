'use client';

import { useState } from 'react';
import { FaTable, FaPlus, FaMinus, FaEdit, FaTrash } from 'react-icons/fa';

const TableManager = ({ editor, isOpen, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const createTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ 
        rows, 
        cols, 
        withHeaderRow: true 
      }).run();
      onClose();
    }
  };

  const addRowAbove = () => {
    if (editor) {
      editor.chain().focus().addRowBefore().run();
    }
  };

  const addRowBelow = () => {
    if (editor) {
      editor.chain().focus().addRowAfter().run();
    }
  };

  const deleteRow = () => {
    if (editor) {
      editor.chain().focus().deleteRow().run();
    }
  };

  const addColumnLeft = () => {
    if (editor) {
      editor.chain().focus().addColumnBefore().run();
    }
  };

  const addColumnRight = () => {
    if (editor) {
      editor.chain().focus().addColumnAfter().run();
    }
  };

  const deleteColumn = () => {
    if (editor) {
      editor.chain().focus().deleteColumn().run();
    }
  };

  const deleteTable = () => {
    if (editor) {
      editor.chain().focus().deleteTable().run();
    }
  };

  const mergeCells = () => {
    if (editor) {
      editor.chain().focus().mergeCells().run();
    }
  };

  const splitCell = () => {
    if (editor) {
      editor.chain().focus().splitCell().run();
    }
  };

  const toggleHeaderRow = () => {
    if (editor) {
      editor.chain().focus().toggleHeaderRow().run();
    }
  };

  const toggleHeaderColumn = () => {
    if (editor) {
      editor.chain().focus().toggleHeaderColumn().run();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold">Table Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">

        {/* Create New Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Table</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rows
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={createTable}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <FaTable />
            Create Table ({rows}×{cols})
          </button>
        </div>

        {/* Quick Table Templates */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Quick Templates</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setRows(2);
                setCols(2);
                createTable();
              }}
              className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              2×2 Table
            </button>
            <button
              onClick={() => {
                setRows(3);
                setCols(3);
                createTable();
              }}
              className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              3×3 Table
            </button>
            <button
              onClick={() => {
                setRows(4);
                setCols(4);
                createTable();
              }}
              className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              4×4 Table
            </button>
            <button
              onClick={() => {
                setRows(5);
                setCols(5);
                createTable();
              }}
              className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              5×5 Table
            </button>
          </div>
        </div>

        {/* Advanced Table Operations */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <FaEdit />
            Advanced Table Operations
            <span className="ml-2">{showAdvanced ? '▼' : '▶'}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            {/* Row Operations */}
            <div>
              <h4 className="text-md font-semibold mb-3">Row Operations</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={addRowAbove}
                  className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaPlus />
                  Add Row Above
                </button>
                <button
                  onClick={addRowBelow}
                  className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaPlus />
                  Add Row Below
                </button>
                <button
                  onClick={deleteRow}
                  className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaMinus />
                  Delete Row
                </button>
                <button
                  onClick={toggleHeaderRow}
                  className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaEdit />
                  Toggle Header Row
                </button>
              </div>
            </div>

            {/* Column Operations */}
            <div>
              <h4 className="text-md font-semibold mb-3">Column Operations</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={addColumnLeft}
                  className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaPlus />
                  Add Column Left
                </button>
                <button
                  onClick={addColumnRight}
                  className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaPlus />
                  Add Column Right
                </button>
                <button
                  onClick={deleteColumn}
                  className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaMinus />
                  Delete Column
                </button>
                <button
                  onClick={toggleHeaderColumn}
                  className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaEdit />
                  Toggle Header Column
                </button>
              </div>
            </div>

            {/* Cell Operations */}
            <div>
              <h4 className="text-md font-semibold mb-3">Cell Operations</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={mergeCells}
                  className="p-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaEdit />
                  Merge Cells
                </button>
                <button
                  onClick={splitCell}
                  className="p-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center justify-center gap-2 text-sm"
                >
                  <FaEdit />
                  Split Cell
                </button>
              </div>
            </div>

            {/* Table Operations */}
            <div>
              <h4 className="text-md font-semibold mb-3">Table Operations</h4>
              <button
                onClick={deleteTable}
                className="w-full p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center justify-center gap-2 text-sm"
              >
                <FaTrash />
                Delete Entire Table
              </button>
            </div>
          </div>
        )}

        </div>
        
        {/* Fixed Footer */}
        <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableManager;






















