'use client';

import { useState, useEffect } from 'react';
import { FaInfo } from 'react-icons/fa';

const WordCount = ({ editor, showPopup = false, onClose }) => {
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [characterCountNoSpaces, setCharacterCountNoSpaces] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!editor) return;

    // Count actual pages in the document
    const countActualPages = () => {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        const pageElements = document.querySelectorAll('.ProseMirror .document-page');
        // Count all page elements, including blank pages
        // If no pages found, default to 1 (at least one page exists)
        const pageCount = pageElements.length > 0 ? pageElements.length : 1;
        setPageCount(pageCount);
      });
    };

    const updateCounts = () => {
      const text = editor.getText();
      
      // Word count - split by whitespace and punctuation
      const words = text.trim().split(/[\s\u00A0\u2000-\u200B\u2028\u2029]+/).filter(word => {
        // Remove punctuation-only "words"
        return word.replace(/[^\w\u00C0-\u017F]/g, '').length > 0;
      });
      setWordCount(words.length);
      
      // Character count (including spaces)
      setCharacterCount(text.length);
      
      // Character count without spaces, tabs, and line breaks
      const textNoSpaces = text.replace(/[\s\t\n\r]/g, '');
      setCharacterCountNoSpaces(textNoSpaces.length);
      
      // Count actual pages in the document
      countActualPages();
    };

    // Update counts on content change
    editor.on('update', updateCounts);
    updateCounts(); // Initial count

    // Also count pages when DOM changes (for page creation)
    const observer = new MutationObserver(() => {
      countActualPages();
    });

    // Observe the editor container for page element changes
    const editorElement = editor.view.dom.closest('.ProseMirror') || document.body;
    observer.observe(editorElement, {
      childList: true,
      subtree: true
    });

    return () => {
      editor.off('update', updateCounts);
      observer.disconnect();
    };
  }, [editor]);

  useEffect(() => {
    if (showPopup !== undefined) {
      setShowDetails(showPopup);
      // Recount pages when popup opens
      if (showPopup) {
        requestAnimationFrame(() => {
          const pageElements = document.querySelectorAll('.ProseMirror .document-page');
          const pageCount = pageElements.length > 0 ? pageElements.length : 1;
          setPageCount(pageCount);
        });
      }
    }
  }, [showPopup]);

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const handleClose = () => {
    setShowDetails(false);
    if (onClose) onClose();
  };

  // If showPopup prop is provided, render as popup modal (Google Docs style)
  if (showPopup !== false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={handleClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Word count</h3>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700">Pages</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(pageCount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700">Words</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(wordCount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-700">Characters</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(characterCount)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-700">Characters (excluding spaces)</span>
              <span className="text-sm font-medium text-gray-900">{formatNumber(characterCountNoSpaces)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default inline button behavior
  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
        title="Word count details"
      >
        <FaInfo />
        <span>{formatNumber(wordCount)} words</span>
      </button>

      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-64 z-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pages:</span>
              <span className="text-sm font-medium">{formatNumber(pageCount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Words:</span>
              <span className="text-sm font-medium">{formatNumber(wordCount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Characters:</span>
              <span className="text-sm font-medium">{formatNumber(characterCount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Characters (no spaces):</span>
              <span className="text-sm font-medium">{formatNumber(characterCountNoSpaces)}</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowDetails(false)}
              className="w-full text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCount;













































