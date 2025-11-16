'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const FindReplace = ({ editor, isOpen, onClose }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [matches, setMatches] = useState([]); // array of { from, to }

  // Map plain-text offset search to ProseMirror positions
  const computeMatchPositions = (query) => {
    if (!editor || !query) return [];
    const queryLc = query.toLowerCase();
    const positions = [];
    let textOffset = 0;
    const chunks = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        // For text nodes, pos is the absolute start position of the text
        const len = node.text.length;
        chunks.push({ text: node.text, from: pos, to: pos + len });
      }
    });
    // Build a full text with mapping of offsets to node positions
    const fullText = chunks.map(c => c.text).join('');
    const qLen = query.length;
    let idx = 0;
    while ((idx = fullText.toLowerCase().indexOf(queryLc, textOffset)) !== -1) {
      // Convert text offsets [idx, idx+qLen) into ProseMirror positions
      let remainingStart = idx;
      let remainingEnd = idx + qLen;
      let pmFrom = null;
      let pmTo = null;
      let acc = 0;
      for (const c of chunks) {
        const nextAcc = acc + c.text.length;
        if (pmFrom == null && remainingStart < nextAcc) {
          const offsetInNode = remainingStart - acc;
          pmFrom = c.from + offsetInNode;
        }
        if (pmTo == null && remainingEnd <= nextAcc) {
          const offsetInNode = remainingEnd - acc;
          pmTo = c.from + offsetInNode;
          break;
        }
        acc = nextAcc;
      }
      if (pmFrom != null && pmTo != null) positions.push({ from: pmFrom, to: pmTo });
      textOffset = idx + Math.max(1, qLen);
    }
    return positions;
  };

  useEffect(() => {
    if (findText && editor) {
      const pos = computeMatchPositions(findText);
      setMatches(pos);
      setTotalMatches(pos.length);
      setCurrentMatch(0);
      // Do NOT select/focus on change to avoid stealing focus from input
    } else {
      setMatches([]);
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  }, [findText, editor]);

  const selectMatch = (index) => {
    const m = matches[index];
    if (!m) return;
    // Do not focus editor to avoid keystrokes going to the document while typing in the input
    editor.commands.setTextSelection({ from: m.from, to: m.to });
    try { editor.view.scrollIntoView(); } catch {}
  };

  const findNext = () => {
    if (matches.length > 0) {
      const nextMatch = (currentMatch + 1) % matches.length;
      setCurrentMatch(nextMatch);
      selectMatch(nextMatch);
    }
  };

  const findPrevious = () => {
    if (matches.length > 0) {
      const prevMatch = currentMatch === 0 ? matches.length - 1 : currentMatch - 1;
      setCurrentMatch(prevMatch);
      selectMatch(prevMatch);
    }
  };

  // (Selection handled in selectMatch)

  const replaceCurrent = () => {
    const m = matches[currentMatch];
    if (!m || !editor) return;
    // Keep focus in dialog; only update editor selection and content
    editor.commands.setTextSelection({ from: m.from, to: m.to });
    editor.commands.insertContent(replaceText);
    // Recompute matches after replacement
    const pos = computeMatchPositions(findText);
    setMatches(pos);
    setTotalMatches(pos.length);
    setCurrentMatch((prev) => Math.min(prev, Math.max(0, pos.length - 1)));
  };

  const replaceAll = () => {
    if (!findText || !replaceText || !editor) return;
    // Replace from end to start to keep positions valid
    const pos = computeMatchPositions(findText);
    // Replace from end to start using selection to keep marks/structure consistent
    // Do not take focus away from the dialog; run commands directly
    for (let i = pos.length - 1; i >= 0; i -= 1) {
      editor.commands.setTextSelection({ from: pos[i].from, to: pos[i].to });
      editor.commands.insertContent(replaceText);
    }
    setMatches([]);
    setTotalMatches(0);
    setCurrentMatch(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-[72px] bg-white border border-gray-300 shadow-lg z-[60] rounded-md w-full max-w-2xl">
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">
            {isReplaceMode ? 'Find and Replace' : 'Find'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          <div className="">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Find
            </label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  findNext();
                }
              }}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to find..."
              autoFocus
            />
          </div>

          {isReplaceMode && (
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Replace with
              </label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter replacement text..."
              />
            </div>
          )}

          <div className="flex gap-2 md:justify-end">
            <button
              onClick={() => setIsReplaceMode(!isReplaceMode)}
              className={`px-3 py-1.5 text-sm rounded-md ${
                isReplaceMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Replace
            </button>
          </div>
        </div>

        {findText && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={findPrevious}
                disabled={totalMatches === 0}
                className="p-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous match"
              >
                <FaArrowUp />
              </button>
              <span className="text-sm text-gray-600">
                {totalMatches > 0 ? `${currentMatch + 1} of ${totalMatches}` : 'No matches found'}
              </span>
              <button
                onClick={findNext}
                disabled={totalMatches === 0}
                className="p-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next match"
              >
                <FaArrowDown />
              </button>
            </div>

            {isReplaceMode && (
              <div className="flex gap-2">
                <button
                  onClick={replaceCurrent}
                  disabled={totalMatches === 0}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Replace
                </button>
                <button
                  onClick={replaceAll}
                  disabled={totalMatches === 0}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Replace All
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindReplace;












