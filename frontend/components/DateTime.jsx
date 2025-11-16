'use client';

import { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaClock } from 'react-icons/fa';

const DateTime = ({ editor, isOpen, onClose }) => {
  const [dateTimeType, setDateTimeType] = useState('date');
  const [format, setFormat] = useState('short');

  if (!isOpen || !editor) return null;

  const getCurrentDateTime = () => {
    const now = new Date();
    
    switch (format) {
      case 'short':
        return dateTimeType === 'date' 
          ? now.toLocaleDateString()
          : now.toLocaleTimeString();
      case 'long':
        return dateTimeType === 'date'
          ? now.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : now.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              hour12: true 
            });
      case 'iso':
        return dateTimeType === 'date'
          ? now.toISOString().split('T')[0]
          : now.toISOString().split('T')[1].split('.')[0];
      case 'custom':
        return dateTimeType === 'date'
          ? now.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            })
          : now.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
      default:
        return now.toString();
    }
  };

  const insertDateTime = () => {
    const dateTimeValue = getCurrentDateTime();
    
    if (!editor || !dateTimeValue) {
      console.error('Editor or dateTimeValue is missing');
      return;
    }
    
    // Clear any existing color formatting first to prevent inheritance
    editor.chain().focus().unsetColor().run();
    
    // Insert the date/time as plain text only (no span tag, no HTML)
    editor.chain().focus().insertContent(dateTimeValue).run();
    
    // Clear color formatting after insertion to ensure it doesn't affect future text
    setTimeout(() => {
      editor.chain().focus().unsetColor().run();
    }, 10);
    
    onClose();
  };

  const dateFormats = [
    { value: 'short', label: 'Short (12/31/2023)' },
    { value: 'long', label: 'Long (December 31, 2023)' },
    { value: 'iso', label: 'ISO (2023-12-31)' },
    { value: 'custom', label: 'Custom (12/31/2023)' }
  ];

  const timeFormats = [
    { value: 'short', label: 'Short (3:45 PM)' },
    { value: 'long', label: 'Long (3:45:30 PM)' },
    { value: 'iso', label: 'ISO (15:45:30)' },
    { value: 'custom', label: 'Custom (15:45)' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {dateTimeType === 'date' ? <FaCalendarAlt /> : <FaClock />}
            Insert {dateTimeType === 'date' ? 'Date' : 'Time'}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type:
          </label>
          <div className="flex gap-2">
            <button
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                dateTimeType === 'date' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setDateTimeType('date')}
            >
              <FaCalendarAlt />
              Date
            </button>
            <button
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                dateTimeType === 'time' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setDateTimeType('time')}
            >
              <FaClock />
              Time
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format:
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {(dateTimeType === 'date' ? dateFormats : timeFormats).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 p-3 bg-gray-100 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preview:
          </label>
          <code className="text-sm text-gray-600">
            {getCurrentDateTime()}
          </code>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={insertDateTime}
          >
            Insert {dateTimeType === 'date' ? 'Date' : 'Time'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTime;





























